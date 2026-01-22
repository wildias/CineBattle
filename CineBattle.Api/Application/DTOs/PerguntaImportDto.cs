namespace CineBattle.Api.Application.DTOs
{
    public class PerguntaImportDto
    {
        public string Pergunta { get; set; } = string.Empty;
        public List<string> Opcoes { get; set; } = [];
        public int RespostaCorreta { get; set; }
        public string Nivel { get; set; } = string.Empty;
    }
}
