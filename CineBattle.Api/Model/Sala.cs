using CineBattle.Api.Model.Enums;

namespace CineBattle.Api.Model
{
    public class Sala
    {
        public int Id { get; set; }
        public int MinJogadores { get; set; }
        public int MaxJogadores { get; set; }
        public List<NivelPergunta> NiveisPermitidos { get; set; } = [];
        public List<Jogador> Jogadores { get; set; } = [];
        public int Rodada { get; set; } = 1;
        public bool EmAndamento { get; set; } = false;
        public bool EstaCheia => Jogadores.Count >= MaxJogadores;
        public bool PodeIniciar => Jogadores.Count >= MinJogadores;
        public int? PerguntaAtualId { get; set; }
        public NivelPergunta? NivelPerguntaAtual { get; set; }
    }
}
