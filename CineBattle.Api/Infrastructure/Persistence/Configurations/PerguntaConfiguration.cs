using CineBattle.Api.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineBattle.Api.Infrastructure.Persistence.Configurations;

public class PerguntaConfiguration : IEntityTypeConfiguration<Pergunta>
{
    public void Configure(EntityTypeBuilder<Pergunta> builder)
    {
        builder.ToTable("Perguntas");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Enunciado)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(p => p.RespostaCorretaIndex)
            .IsRequired();

        builder.Property(p => p.Nivel)
            .IsRequired()
            .HasConversion<int>();

        builder.HasMany(p => p.Opcoes)
            .WithOne(o => o.Pergunta)
            .HasForeignKey(o => o.PerguntaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
