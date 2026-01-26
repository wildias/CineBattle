using CineBattle.Api.Application.DTOs;
using CineBattle.Api.Application.Services;
using CineBattle.Api.Model.Enums;
using Microsoft.AspNetCore.Mvc;

namespace CineBattle.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalaController : ControllerBase
    {
        private readonly SalaService _salaService;

        public SalaController(SalaService salaService)
        {
            _salaService = salaService;
        }

        [HttpPost("criar")]
        public async Task<IActionResult> CriarSala([FromBody] CriarSalaDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NomeJogador))
                return BadRequest("Nome do jogador é obrigatório");

            if (dto.MaxJogadores < 2 || dto.MaxJogadores > 5)
                return BadRequest("Máximo de jogadores deve ser entre 2 e 5");

            var niveisEnum = dto.Niveis
                .Select(n => Enum.Parse<NivelPergunta>(n, true))
                .ToList();

            // 1️⃣ Cria o jogador
            var jogador = _salaService.CriarJogador(dto.NomeJogador);

            // 2️⃣ Cria a sala com o jogador como líder
            var sala = _salaService.CriarSala(niveisEnum, dto.MaxJogadores, jogador.Id);

            // 3️⃣ Já entra automaticamente na sala
            var resultadoEntrada = await _salaService.EntrarSalaAsync(sala.Id, jogador);

            if (!resultadoEntrada.Sucesso)
                return BadRequest(resultadoEntrada.Erro);

            // 4️⃣ Retorna tudo que o frontend precisa
            return Ok(new
            {
                salaId = sala.Id,
                jogadorId = jogador.Id,
                jogadorNome = jogador.Nome,
                sala.MinJogadores,
                sala.MaxJogadores,
                sala.NiveisPermitidos
            });
        }

        [HttpPost("entrar/{salaId}")]
        public async Task<IActionResult> EntrarSala(int salaId, [FromBody] string nomeJogador)
        {
            var jogador = _salaService.CriarJogador(nomeJogador);

            var resultado = await _salaService.EntrarSalaAsync(salaId, jogador);

            if (!resultado.Sucesso)
                return BadRequest(resultado.Erro);

            return Ok(jogador);
        }

        [HttpPost("iniciar/{salaId}")]
        public async Task<IActionResult> IniciarPartida(int salaId)
        {
            var resultado = await _salaService.IniciarPartidaAsync(salaId);

            if (!resultado.Sucesso)
                return BadRequest(resultado.Erro);

            return Ok(new { mensagem = "Partida iniciada", sucesso = true });
        }

        [HttpGet("{salaId}/pergunta")]
        public async Task<IActionResult> ObterPergunta(int salaId, [FromServices] PerguntaService perguntaService)
        {
            var pergunta = await _salaService
                .SortearPerguntaAsync(salaId, perguntaService);

            if (pergunta == null)
                return BadRequest("Não foi possível obter pergunta");

            return Ok(pergunta);
        }

        [HttpPost("{salaId}/responder")]
        public async Task<IActionResult> Responder(int salaId, [FromBody] RespostaDto resposta)
        {
            var resultado = await _salaService
                .ResponderPerguntaAsync(salaId, resposta);

            if (!resultado.Sucesso)
                return BadRequest(resultado.Erro);

            return Ok(resultado);
        }

        [HttpPost("{salaId}/sair")]
        public async Task<IActionResult> SairDaSala(int salaId, [FromBody] int jogadorId)
        {
            var resultado = await _salaService.SairDaSalaAsync(salaId, jogadorId);

            if (!resultado.Sucesso)
                return BadRequest(resultado.Erro);

            return Ok(resultado.Mensagem);
        }

        [HttpGet("buscar")]
        public IActionResult BuscarSalas()
        {
            var salas = _salaService.BuscarSalas();
            return Ok(salas);
        }

        [HttpGet("{salaId}/jogadores")]
        public IActionResult ObterJogadores(int salaId)
        {
            var jogadores = _salaService.ObterJogadoresDaSala(salaId);
            
            if (jogadores == null)
                return NotFound("Sala não encontrada");

            return Ok(jogadores);
        }

        [HttpGet("{salaId}/estado")]
        public IActionResult ObterEstadoSala(int salaId)
        {
            var sala = _salaService.ObterSala(salaId);
            
            if (sala == null)
                return NotFound("Sala não encontrada");

            return Ok(new
            {
                salaId = sala.Id,
                emAndamento = sala.EmAndamento,
                liderId = sala.LiderId,
                maxJogadores = sala.MaxJogadores,
                minJogadores = sala.MinJogadores,
                jogadorAtualId = sala.JogadorAtualId,
                perguntaAtualId = sala.PerguntaAtualId,
                jogadores = sala.Jogadores.Select(j => new
                {
                    j.Id,
                    j.Nome,
                    j.Vida,
                    vivo = j.Vivo
                }).ToList()
            });
        }

        [HttpPost("{salaId}/aplicar-powerup")]
        public async Task<IActionResult> AplicarPowerUp(int salaId, [FromBody] AplicarPowerUpDto dto)
        {
            dto.SalaId = salaId;
            
            var resultado = await _salaService.AplicarPowerUpAsync(dto);

            if (!resultado.Sucesso)
                return BadRequest(resultado.Erro);

            return Ok(new { mensagem = "Power-up aplicado com sucesso", sucesso = true });
        }
    }
}
