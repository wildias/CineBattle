using CineBattle.Api.Application.DTOs;
using CineBattle.Api.Hubs;
using CineBattle.Api.Model;
using CineBattle.Api.Model.Enums;
using Microsoft.AspNetCore.SignalR;

namespace CineBattle.Api.Application.Services
{
    public class SalaService
    {
        private static readonly Dictionary<int, Sala> _salas = new();
        private static int _contadorSala = 1000;
        private static int _contadorJogador = 1;

        private readonly IHubContext<GameHub> _hub;

        public SalaService(IHubContext<GameHub> hub)
        {
            _hub = hub;
        }

        public Sala CriarSala(List<NivelPergunta> niveis, int maxJogadores)
        {
            if (maxJogadores < 2 || maxJogadores > 5)
                throw new ArgumentException("O número de jogadores deve ser entre 2 e 5");

            var sala = new Sala
            {
                Id = _contadorSala++,
                MinJogadores = 2,
                MaxJogadores = maxJogadores,
                NiveisPermitidos = niveis
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

        public async Task<ServiceResultDto> EntrarSalaAsync(
    int salaId,
    Jogador jogador)
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

            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("JogadorEntrou", jogador);

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

            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("PartidaIniciada", new
                {
                    sala.Id,
                    sala.Rodada
                });

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
                .ObterPerguntaAleatoriaAsync(sala.NiveisPermitidos);

            if (pergunta == null)
                return null;

            sala.PerguntaAtualId = pergunta.Id;
            sala.NivelPerguntaAtual =
                Enum.Parse<NivelPergunta>(pergunta.Nivel, true);

            // 🔔 EVENTO SIGNALR
            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("NovaPergunta", pergunta);

            return pergunta;
        }

        public async Task<RespostaResultadoDto> ResponderPerguntaAsync(
    int salaId,
    RespostaDto resposta)
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

            if (sala.PerguntaAtualId == null || sala.NivelPerguntaAtual == null)
            {
                resultado.Erro = "Nenhuma pergunta ativa";
                return resultado;
            }

            // ⚠️ Placeholder — trocar depois pela validação real
            resultado.Correta = resposta.OpcaoIndex == 0;

            if (!resultado.Correta)
            {
                var dano = sala.NivelPerguntaAtual switch
                {
                    NivelPergunta.Facil => 10,
                    NivelPergunta.Medio => 20,
                    NivelPergunta.Dificil => 30,
                    _ => 10
                };

                jogador.Vida -= dano;

                if (jogador.Vida <= 0)
                    resultado.JogadorMorreu = true;
            }

            resultado.VidaRestante = jogador.Vida;

            var vivos = sala.Jogadores.Count(j => j.Vivo);
            if (vivos <= 1)
            {
                resultado.JogoFinalizado = true;
                sala.EmAndamento = false;
            }

            resultado.Sucesso = true;

            // 🔔 EVENTO SIGNALR
            await _hub.Clients
                .Group(salaId.ToString())
                .SendAsync("ResultadoResposta", new
                {
                    jogador.Id,
                    resultado.Correta,
                    resultado.VidaRestante,
                    resultado.JogadorMorreu
                });

            return resultado;
        }

    }
}
