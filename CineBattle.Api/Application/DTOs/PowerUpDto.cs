using CineBattle.Api.Model.Enums;

namespace CineBattle.Api.Application.DTOs
{
    public class AplicarPowerUpDto
    {
        public int SalaId { get; set; }
        public int JogadorId { get; set; }
        public PowerUpTipo PowerUp { get; set; }
        public int AlvoId { get; set; } // ID do jogador alvo (para ataque ou cura)
    }

    public class AcaoPowerUpDto
    {
        public string Mensagem { get; set; } = string.Empty;
        public int JogadorOrigemId { get; set; }
        public string JogadorOrigemNome { get; set; } = string.Empty;
        public int? JogadorAlvoId { get; set; }
        public string? JogadorAlvoNome { get; set; }
        public PowerUpTipo PowerUp { get; set; }
        public int Valor { get; set; }
    }
}
