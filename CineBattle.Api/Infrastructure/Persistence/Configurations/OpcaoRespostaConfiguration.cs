using CineBattle.Api.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineBattle.Api.Infrastructure.Persistence.Configurations;

public class OpcaoRespostaConfiguration : IEntityTypeConfiguration<OpcaoResposta>
{
    public void Configure(EntityTypeBuilder<OpcaoResposta> builder)
    {
        builder.ToTable("OpcoesResposta");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Texto)
            .IsRequired()
            .HasMaxLength(300);
    }
}
