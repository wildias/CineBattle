using CineBattle.Api.Application.DTOs;
using CineBattle.Api.Hubs;
using CineBattle.Api.Infrastructure.Persistence;
using CineBattle.Api.Model;
using CineBattle.Api.Model.Enums;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CineBattle.Api.Application.Services
{
    public class SalaService
    {
        private static readonly Dictionary<int, Sala> _salas = new();
        private static int _contadorSala = 1000;
        private static int _contadorJogador = 1;

        private readonly IHubContext<GameHub> _hub;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public SalaService(IHubContext<GameHub> hub, IServiceScopeFactory serviceScopeFactory)
        {
            _hub = hub;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public Sala CriarSala(List<NivelPergunta> niveis, int maxJogadores, int liderId)
        {
            if (maxJogadores < 2 || maxJogadores > 5)
                throw new ArgumentException("O número de jogadores deve ser entre 2 e 5");

            var sala = new Sala
            {
                Id = _contadorSala++,
                MinJogadores = 2,
                MaxJogadores = maxJogadores,
                NiveisPermitidos = niveis,
                LiderId = liderId
            };

            _salas[sala.Id] = sala;
            return sala;
        }

        public Sala? ObterSala(int id)
        {
            _salas.TryGetValue(id, out var sala);
            return sala;
        }

        public Jogador CriarJogador(string nome)
        {
            return new Jogador
            {
                Id = _contadorJogador++,
                Nome = nome
            };
        }

        public async Task<ServiceResultDto> EntrarSalaAsync(int salaId, Jogador jogador)
        {
            var result = new ServiceResultDto();

            var sala = ObterSala(salaId);
            if (sala == null)
            {
                result.Erro = "Sala não encontrada";
                return result;
            }

            if (sala.EstaCheia)
            {
                result.Erro = "Sala cheia";
                return result;
            }

            sala.Jogadores.Add(jogador);

            // 🔔 EVENTO ÚNICO E PADRÃO
            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("JogadoresAtualizados", new
                {
                    jogadores = MapearJogadores(sala),
                    liderId = sala.LiderId,
                    maxJogadores = sala.MaxJogadores
                });

            result.Sucesso = true;
            return result;
        }

        public async Task<ServiceResultDto> SairDaSalaAsync(int salaId, int jogadorId)
        {
            var result = new ServiceResultDto();

            var sala = ObterSala(salaId);
            if (sala == null)
            {
                result.Erro = "Sala não encontrada";
                return result;
            }

            var jogador = sala.Jogadores.FirstOrDefault(j => j.Id == jogadorId);
            if (jogador == null)
            {
                result.Erro = "Jogador não encontrado na sala";
                return result;
            }

            // Remove o jogador
            sala.Jogadores.Remove(jogador);

            // Se o líder saiu, transfere liderança para o próximo jogador
            bool liderSaiu = sala.LiderId == jogadorId;
            if (liderSaiu && sala.Jogadores.Count > 0)
            {
                sala.LiderId = sala.Jogadores.First().Id;
            }

            // 🔔 EVENTO: Notifica que jogador saiu
            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("JogadorSaiu", jogadorId);

            // Verifica se a sala ficou vazia
            if (sala.Jogadores.Count == 0)
            {
                // Encerra a sala
                sala.EmAndamento = false;
                _salas.Remove(salaId);
                
                result.Sucesso = true;
                result.Mensagem = "Sala encerrada - todos os jogadores saíram";
                return result;
            }

            // Se a partida está em andamento e sobrou apenas 1 jogador
            if (sala.EmAndamento && sala.Jogadores.Count == 1)
            {
                var vencedor = sala.Jogadores.First();
                sala.EmAndamento = false;

                // 🔔 EVENTO: Fim de jogo por desistência
                await _hub.Clients
                    .Group(salaId.ToString())
                    .SendAsync("FimDeJogo", new
                    {
                        vencedor.Id,
                        vencedor.Nome,
                        motivo = "Outros jogadores saíram"
                    });
                
                result.Sucesso = true;
                result.Mensagem = $"{vencedor.Nome} venceu por desistência dos outros jogadores";
                return result;
            }

            // Atualiza a lista de jogadores para todos
            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("JogadoresAtualizados", new
                {
                    jogadores = MapearJogadores(sala),
                    liderId = sala.LiderId,
                    maxJogadores = sala.MaxJogadores
                });

            // Se o jogador que saiu era o jogador atual, avança para o próximo
            if (sala.EmAndamento && sala.JogadorAtualId == jogadorId)
            {
                var jogadoresVivos = sala.Jogadores.Where(j => j.Vivo).ToList();
                if (jogadoresVivos.Count > 0)
                {
                    sala.JogadorAtualId = jogadoresVivos.First().Id;
                    
                    // Envia nova pergunta para o próximo jogador
                    using var scope = _serviceScopeFactory.CreateScope();
                    var perguntaService = scope.ServiceProvider.GetRequiredService<PerguntaService>();
                    await SortearPerguntaAsync(salaId, perguntaService);
                }
            }

            result.Sucesso = true;
            return result;
        }


        public async Task<ServiceResultDto> IniciarPartidaAsync(int salaId)
        {
            var result = new ServiceResultDto();

            var sala = ObterSala(salaId);
            if (sala == null)
            {
                result.Erro = "Sala não encontrada";
                return result;
            }

            if (!sala.PodeIniciar)
            {
                result.Erro = "Número mínimo de jogadores não atingido";
                return result;
            }

            sala.EmAndamento = true;
            sala.Rodada = 1;
            sala.JogadorAtualId = sala.Jogadores.FirstOrDefault()?.Id;

            // 🔔 EVENTO: PARTIDA INICIADA
            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("PartidaIniciada", new
                {
                    salaId = sala.Id,
                    rodada = sala.Rodada,
                    jogadorAtualId = sala.JogadorAtualId
                });

            // 🔔 EVENTO: ESTADO ATUAL DOS JOGADORES
            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("JogadoresAtualizados", new
                {
                    jogadores = MapearJogadores(sala),
                    liderId = sala.LiderId,
                    maxJogadores = sala.MaxJogadores
                });

            // Envia a primeira pergunta
            using var scope = _serviceScopeFactory.CreateScope();
            var perguntaService = scope.ServiceProvider.GetRequiredService<PerguntaService>();
            await SortearPerguntaAsync(salaId, perguntaService);

            result.Sucesso = true;
            return result;
        }


        public async Task<PerguntaResponseDto?> SortearPerguntaAsync(
            int salaId,
            PerguntaService perguntaService)
        {
            var sala = ObterSala(salaId);
            if (sala == null || !sala.EmAndamento)
                return null;

            var pergunta = await perguntaService
                .ObterPerguntaAleatoriaAsync(sala.NiveisPermitidos, sala.PerguntasUsadas);

            if (pergunta == null)
                return null;

            sala.PerguntaAtualId = pergunta.Id;
            sala.PerguntasUsadas.Add(pergunta.Id); // Adiciona ao histórico
            sala.NivelPerguntaAtual =
                Enum.Parse<NivelPergunta>(pergunta.Nivel, true);

            // 🔔 EVENTO SIGNALR - Enviando pergunta para todos (sem resposta correta)
            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("NovaPergunta", new
                {
                    pergunta.Id,
                    pergunta.Texto,
                    pergunta.Opcoes,
                    pergunta.Nivel,
                    jogadorAtualId = sala.JogadorAtualId
                });

            return pergunta;
        }

        public async Task<RespostaResultadoDto> ResponderPerguntaAsync(int salaId, RespostaDto resposta)
        {
            var resultado = new RespostaResultadoDto();

            var sala = ObterSala(salaId);
            if (sala == null || !sala.EmAndamento)
            {
                resultado.Erro = "Sala inválida";
                return resultado;
            }

            var jogador = sala.Jogadores
                .FirstOrDefault(j => j.Id == resposta.JogadorId);

            if (jogador == null || !jogador.Vivo)
            {
                resultado.Erro = "Jogador inválido";
                return resultado;
            }

            // VALIDAÇÃO: Verifica se é a vez deste jogador
            if (sala.JogadorAtualId != resposta.JogadorId)
            {
                resultado.Erro = "Não é sua vez de responder";
                return resultado;
            }

            if (sala.PerguntaAtualId == null)
            {
                resultado.Erro = "Nenhuma pergunta ativa";
                return resultado;
            }

            // Busca a pergunta no banco para validar
            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            
            var pergunta = await context.Perguntas
                .Include(p => p.Opcoes)
                .FirstOrDefaultAsync(p => p.Id == sala.PerguntaAtualId);

            if (pergunta == null)
            {
                resultado.Erro = "Pergunta não encontrada";
                return resultado;
            }

            // Validação real da resposta
            // opcaoIndex = -1 significa timeout (não respondeu a tempo)
            resultado.Correta = resposta.OpcaoIndex >= 0 && resposta.OpcaoIndex == pergunta.RespostaCorretaIndex;

            if (!resultado.Correta)
            {
                jogador.Vida -= 10; // Perde 10 pontos de vida

                if (jogador.Vida <= 0)
                {
                    jogador.Vida = 0;
                    jogador.Vivo = false; // ✅ MARCA COMO MORTO
                    resultado.JogadorMorreu = true;
                }
            }

            resultado.VidaRestante = jogador.Vida;
            resultado.Sucesso = true;

            // Avança para o próximo jogador vivo
            var jogadoresVivos = sala.Jogadores.Where(j => j.Vivo).ToList();
            var indexAtual = jogadoresVivos.FindIndex(j => j.Id == sala.JogadorAtualId);
            var proximoIndex = (indexAtual + 1) % jogadoresVivos.Count;
            sala.JogadorAtualId = jogadoresVivos[proximoIndex].Id;

            // 🔔 EVENTO: RESULTADO DA RESPOSTA
            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("ResultadoResposta", new
                {
                    jogadorId = jogador.Id,
                    jogadorNome = jogador.Nome,
                    resultado.Correta,
                    respostaCorretaIndex = pergunta.RespostaCorretaIndex,
                    resultado.VidaRestante,
                    resultado.JogadorMorreu,
                    proximoJogadorId = sala.JogadorAtualId
                });

            // 🔔 EVENTO: JOGADORES ATUALIZADOS
            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("JogadoresAtualizados", new
                {
                    jogadores = MapearJogadores(sala),
                    liderId = sala.LiderId,
                    maxJogadores = sala.MaxJogadores
                });

            // Verifica se o jogo terminou
            var vivos = sala.Jogadores.Count(j => j.Vivo);
            if (vivos <= 1)
            {
                resultado.JogoFinalizado = true;
                sala.EmAndamento = false;

                var vencedor = sala.Jogadores.First(j => j.Vivo);

                // 🔔 EVENTO: FIM DE JOGO
                await _hub.Clients
                    .Group(salaId.ToString())
                    .SendAsync("FimDeJogo", new
                    {
                        vencedor.Id,
                        vencedor.Nome
                    });
            }
            else
            {
                // Envia a próxima pergunta automaticamente
                await Task.Delay(3000); // Aguarda 3 segundos
                
                using var scope2 = _serviceScopeFactory.CreateScope();
                var perguntaService = scope2.ServiceProvider.GetRequiredService<PerguntaService>();
                var novaPergunta = await SortearPerguntaAsync(salaId, perguntaService);
            }

            return resultado;
        }


        public List<SalaResponseDto> BuscarSalas()
        {
            return _salas.Values
                .Select(sala => new SalaResponseDto
                {
                    Id = sala.Id,
                    QuantidadeJogadores = sala.Jogadores.Count,
                    EmAndamento = sala.EmAndamento,
                    EstaCheia = sala.EstaCheia
                })
                .ToList();
        }

        public List<JogadorResponseDto> ObterJogadoresDaSala(int salaId)
        {
            var sala = ObterSala(salaId);
            if (sala == null) return [];

            return sala.Jogadores.Select(j => new JogadorResponseDto
            {
                Id = j.Id,
                Nome = j.Nome,
                Vida = j.Vida,
                Vivo = j.Vivo
            }).ToList();
        }

        private List<JogadorResponseDto> MapearJogadores(Sala sala)
        {
            return sala.Jogadores.Select(j => new JogadorResponseDto
            {
                Id = j.Id,
                Nome = j.Nome,
                Vida = j.Vida,
                Vivo = j.Vivo
            }).ToList();
        }
    }
}
