namespace CineBattle.Api.Application.DTOs
{
    public class CriarSalaDto
    {
        public string NomeJogador { get; set; } = string.Empty;
        public List<string> Niveis { get; set; } = [];
        public int MaxJogadores { get; set; }
    }
}
