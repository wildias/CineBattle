namespace CineBattle.Api.Application.DTOs
{
    public class ServiceResultDto
    {
        public bool Sucesso { get; set; }
        public string? Erro { get; set; }        public string Mensagem { get; set; } = string.Empty;    }
}
