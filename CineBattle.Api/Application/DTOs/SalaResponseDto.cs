namespace CineBattle.Api.Application.DTOs
{
    public class SalaResponseDto
    {
        public int Id { get; set; }
        public int QuantidadeJogadores { get; set; }
        public bool EmAndamento { get; set; }
        public bool EstaCheia { get; set; }
    }
}
