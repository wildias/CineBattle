using CineBattle.Api.Model;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace CineBattle.Api.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public DbSet<Pergunta> Perguntas => Set<Pergunta>();
    public DbSet<OpcaoResposta> OpcoesResposta => Set<OpcaoResposta>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
