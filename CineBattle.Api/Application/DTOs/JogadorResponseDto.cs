namespace CineBattle.Api.Application.DTOs
{
    public class JogadorResponseDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Vida { get; set; }
        public bool Vivo { get; set; }
    }
}
