namespace CineBattle.Api.Application.DTOs
{
    public class PerguntaResponseDto
    {
        public int Id { get; set; }
        public string Texto { get; set; } = string.Empty;
        public string Nivel { get; set; } = string.Empty;
        public List<string> Opcoes { get; set; } = [];
    }
}
