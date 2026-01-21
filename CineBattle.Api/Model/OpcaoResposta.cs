namespace CineBattle.Api.Model
{
    public class OpcaoResposta
    {
        public int Id { get; set; }

        public string Texto { get; set; } = string.Empty;

        public int PerguntaId { get; set; }

        public Pergunta Pergunta { get; set; } = null!;
    }
}
