using CineBattle.Api.Application.Services;
using CineBattle.Api.Hubs;
using CineBattle.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ?? Kestrel na porta 5000
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000);
});

// ?? Connection String
var connectionString = builder.Configuration.GetConnectionString("MySql");

// ?? DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    )
);

// ?? Controllers
builder.Services.AddControllers();

// ?? SignalR (OBRIGATÓRIO)
builder.Services.AddSignalR();

// ?? SERVICES
builder.Services.AddSingleton<SalaService>();       // ?? Singleton (estado em memória)
builder.Services.AddScoped<PerguntaService>();

// ?? CORS (IMPORTANTE PARA SIGNALR)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // ?? ESSENCIAL PARA SIGNALR
    });
});

var app = builder.Build();

// ?? ORDEM IMPORTA
app.UseRouting();

app.UseCors("AllowFrontend");

// ?? Mapear endpoints
app.MapControllers();
app.MapHub<GameHub>("/gamehub");

app.Run();
