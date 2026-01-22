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
        public IActionResult CriarSala([FromBody] CriarSalaDto dto)
        {
            if (dto.MaxJogadores < 2 || dto.MaxJogadores > 5)
                return BadRequest("Máximo de jogadores deve ser entre 2 e 5");

            var niveisEnum = dto.Niveis
                .Select(n => Enum.Parse<NivelPergunta>(n, true))
                .ToList();

            var sala = _salaService.CriarSala(niveisEnum, dto.MaxJogadores);

            return Ok(new
            {
                sala.Id,
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

            return Ok("Partida iniciada");
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

        [HttpGet("buscar")]
        public IActionResult BuscarSalas()
        {
            var salas = _salaService.BuscarSalas();
            return Ok(salas);
        }
    }
}
