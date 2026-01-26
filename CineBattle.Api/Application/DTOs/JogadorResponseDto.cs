using CineBattle.Api.Model.Enums;

namespace CineBattle.Api.Application.DTOs
{
    public class JogadorResponseDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Vida { get; set; }
        public bool Vivo { get; set; }
        public PowerUpTipo? PowerUpAtual { get; set; }
        public int EscudoAtivo { get; set; }
    }
}
