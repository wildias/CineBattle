using CineBattle.Api.Application.DTOs;
using CineBattle.Api.Application.Services;
using CineBattle.Api.Model.Enums;
using Microsoft.AspNetCore.Mvc;

namespace CineBattle.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class PerguntaController : ControllerBase
    {
        private readonly PerguntaService _perguntaService;

        public PerguntaController(PerguntaService perguntaService)
        {
            _perguntaService = perguntaService;
        }

        [HttpPost("salvar")]
        public async Task<IActionResult> SalvarPergunta([FromBody] List<PerguntaImportDto> perguntas)
        {
            if (perguntas == null || perguntas.Count == 0)
                return BadRequest("Nenhuma pergunta enviada");

            var sucesso = await _perguntaService.ImportAsync(perguntas);

            return sucesso
                ? Ok(new { message = "Perguntas salvas com sucesso", total = perguntas.Count })
                : BadRequest("Erro ao salvar perguntas");
        }

        [HttpGet("aleatoria")]
        public async Task<IActionResult> ObterPerguntaAleatoria([FromQuery] string niveis)
        {
            if (string.IsNullOrWhiteSpace(niveis))
                return BadRequest("Informe ao menos um nível");

            var niveisTexto = niveis.Split(',', StringSplitOptions.RemoveEmptyEntries);

            var niveisEnum = new List<NivelPergunta>();

            foreach (var nivel in niveisTexto)
            {
                if (!Enum.TryParse<NivelPergunta>(nivel, true, out var nivelEnum))
                    return BadRequest($"Nível inválido: {nivel}");

                niveisEnum.Add(nivelEnum);
            }

            var pergunta = await _perguntaService.ObterPerguntaAleatoriaAsync(niveisEnum, new List<int>());

            if (pergunta == null)
                return NotFound("Nenhuma pergunta encontrada");

            return Ok(pergunta);
        }
    }
}
