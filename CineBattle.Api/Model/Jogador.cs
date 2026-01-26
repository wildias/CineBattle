using CineBattle.Api.Model.Enums;

namespace CineBattle.Api.Model
{
    public class Jogador
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Vida { get; set; } = 100;
        private bool _vivo = true;
        public bool Vivo 
        { 
            get => _vivo && Vida > 0; 
            set => _vivo = value;
        }
        public PowerUpTipo? PowerUpAtual { get; set; }
        public int EscudoAtivo { get; set; } = 0; // Pontos de escudo ativo
    }
}
