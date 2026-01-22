using CineBattle.Api.Model.Enums;

namespace CineBattle.Api.Model
{
    public class Pergunta
    {
        public int Id { get; set; }
        public string Enunciado { get; set; } = string.Empty;
        public int RespostaCorretaIndex { get; set; }
        public NivelPergunta Nivel { get; set; }
        public ICollection<OpcaoResposta> Opcoes { get; set; } = new List<OpcaoResposta>();
    }
}
