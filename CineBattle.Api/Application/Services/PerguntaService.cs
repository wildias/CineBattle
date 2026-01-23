using CineBattle.Api.Application.DTOs;
using CineBattle.Api.Infrastructure.Persistence;
using CineBattle.Api.Model;
using CineBattle.Api.Model.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CineBattle.Api.Application.Services
{
    public class PerguntaService
    {
        private readonly AppDbContext _context;

        public PerguntaService(AppDbContext context)
        {
            _context = context;
        }

        internal async Task<bool> ImportAsync(List<PerguntaImportDto> perguntas)
        {
            try
            {
                if (perguntas == null || perguntas.Count == 0)
                    return false;

                foreach (var p in perguntas)
                {
                    if (p.Opcoes.Count != 4)
                        continue;

                    if (p.RespostaCorreta < 0 || p.RespostaCorreta > 3)
                        continue;

                    var nivel = Enum.Parse<NivelPergunta>(p.Nivel, true);

                    var pergunta = new Pergunta
                    {
                        Enunciado = p.Pergunta,
                        RespostaCorretaIndex = p.RespostaCorreta,
                        Nivel = nivel,
                        Opcoes = p.Opcoes.Select(o => new OpcaoResposta
                        {
                            Texto = o
                        }).ToList()
                    };

                    _context.Perguntas.Add(pergunta);
                }

                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {

                return false;
            }
        }

        internal async Task<PerguntaResponseDto?> ObterPerguntaAleatoriaAsync(List<NivelPergunta> niveis, List<int> perguntasUsadas)
        {
            if (niveis == null || niveis.Count == 0)
                return null;

            var pergunta = await _context.Perguntas
                .Where(p => niveis.Contains(p.Nivel) && !perguntasUsadas.Contains(p.Id))
                .OrderBy(x => Guid.NewGuid())
                .Include(p => p.Opcoes)
                .FirstOrDefaultAsync();

            if (pergunta == null)
                return null;

            return new PerguntaResponseDto
            {
                Id = pergunta.Id,
                Texto = pergunta.Enunciado,
                Nivel = pergunta.Nivel.ToString(),
                Opcoes = pergunta.Opcoes
                    .Select(o => o.Texto)
                    .ToList()
            };
        }
    }
}

