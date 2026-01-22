namespace CineBattle.Api.Application.DTOs
{
    public class RespostaResultadoDto
    {
        public bool Sucesso { get; set; }
        public bool Correta { get; set; }
        public bool JogadorMorreu { get; set; }
        public bool JogoFinalizado { get; set; }
        public string? Erro { get; set; }
        public int VidaRestante { get; set; }
    }
}
