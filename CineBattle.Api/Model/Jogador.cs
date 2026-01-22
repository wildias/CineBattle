namespace CineBattle.Api.Model
{
    public class Jogador
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int Vida { get; set; } = 100;
        public bool Vivo => Vida > 0;
    }
}
