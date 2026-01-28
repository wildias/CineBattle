# 🎬 CineBattle

Um jogo multiplayer de perguntas e respostas sobre cinema, onde jogadores competem em batalhas de conhecimento cinematográfico em tempo real.

## 📋 Sobre o Projeto

CineBattle é uma aplicação web full-stack que combina elementos de quiz com mecânicas de batalha. Os jogadores entram em salas, respondem perguntas sobre cinema de diferentes níveis de dificuldade e utilizam power-ups estratégicos para vencer seus oponentes.

### ✨ Características Principais

- 🎮 **Multiplayer em Tempo Real**: Suporte para múltiplos jogadores usando SignalR
- 🏆 **Sistema de Salas**: Crie ou entre em salas com configurações personalizáveis
- 💪 **Sistema de Vida**: Cada jogador possui 100 pontos de vida
- ⚡ **Power-Ups Estratégicos**:
  - **Ataque**: Cause dano aos oponentes
  - **Escudo**: Proteja-se de ataques
  - **Cura**: Recupere pontos de vida
- 📊 **Níveis de Dificuldade**: Perguntas classificadas por nível (Fácil, Médio, Difícil)
- ⏱️ **Sistema de Tempo**: 20 segundos para responder cada pergunta
- 👑 **Sistema de Liderança**: O criador da sala é o líder e inicia a partida

## 🏗️ Arquitetura

### Backend (.NET 9.0)
```
CineBattle.Api/
├── Application/          # Camada de aplicação
│   ├── DTOs/            # Data Transfer Objects
│   └── Services/        # Lógica de negócio
├── Controllers/         # Controladores API REST
├── Hubs/               # SignalR Hub para comunicação real-time
├── Infrastructure/     # Camada de infraestrutura
│   └── Persistence/    # Contexto do EF Core e configurações
├── Model/              # Entidades de domínio
│   └── Enums/         # Enumerações
└── Migrations/         # Migrations do Entity Framework
```

### Frontend (React + TypeScript)
```
cinebattle.frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── hooks/         # React Hooks customizados
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Serviços de API e SignalR
│   └── styles/        # Arquivos CSS
├── public/            # Arquivos estáticos
└── assets/           # Recursos (imagens, sons)
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **ASP.NET Core 9.0** - Framework web
- **Entity Framework Core 9.0** - ORM
- **MySQL 8.0** - Banco de dados
- **SignalR** - Comunicação em tempo real
- **Pomelo.EntityFrameworkCore.MySql** - Provider MySQL para EF Core

### Frontend
- **React 19.2** - Biblioteca UI
- **TypeScript 5.9** - Superset JavaScript
- **Vite 7.2** - Build tool e dev server
- **React Router 7.12** - Roteamento
- **@microsoft/signalr 10.0** - Cliente SignalR
- **CSS3** - Estilização

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 📦 Pré-requisitos

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/) e Docker Compose (opcional)
- [MySQL 8.0](https://www.mysql.com/) (ou use Docker)

## 🚀 Como Executar

### 1. Clone o Repositório
```bash
git clone <repository-url>
cd CineBattle
```

### 2. Configure o Banco de Dados

#### Opção A: Usando Docker (Recomendado)
```bash
docker-compose up -d
```

#### Opção B: MySQL Local
Certifique-se de ter o MySQL instalado e rodando na porta 3306.

### 3. Configure o Backend

```bash
cd CineBattle.Api

# Restaurar dependências
dotnet restore

# Aplicar migrations
dotnet ef database update

# Executar a aplicação
dotnet run
```

O backend estará disponível em `http://localhost:5000`

### 4. Configure o Frontend

```bash
cd cinebattle.frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## ⚙️ Configuração

### Backend - appsettings.json
```json
{
  "ConnectionStrings": {
    "MySql": "server=localhost;database=cinebattle;user=root;password=ab12c3"
  }
}
```

### Frontend - Endpoints
O frontend está configurado para se conectar ao backend em:
- API REST: `http://localhost:5000`
- SignalR Hub: `http://localhost:5000/gamehub`

## 🎮 Como Jogar

1. **Criar uma Sala**
   - Acesse a página inicial
   - Clique em "Criar Sala"
   - Configure o número mínimo/máximo de jogadores
   - Selecione os níveis de dificuldade permitidos

2. **Entrar em uma Sala**
   - Pesquise salas disponíveis
   - Digite seu nome
   - Entre na sala desejada

3. **Iniciar a Partida**
   - Aguarde até atingir o número mínimo de jogadores
   - O líder da sala inicia a partida
   - Responda as perguntas dentro do tempo limite

4. **Usar Power-Ups**
   - Ganhe power-ups ao acertar perguntas
   - Use estrategicamente contra oponentes
   - Escudos protegem contra ataques
   - Cura restaura pontos de vida

5. **Vencer**
   - Seja o último jogador com vida > 0
   - Derrote todos os oponentes

## 📡 API Endpoints

### Salas
- `POST /api/sala` - Criar nova sala
- `GET /api/sala/{id}` - Obter detalhes da sala
- `POST /api/sala/{id}/entrar` - Entrar em uma sala
- `POST /api/sala/{id}/iniciar` - Iniciar partida
- `POST /api/sala/{id}/responder` - Responder pergunta
- `POST /api/sala/{id}/powerup` - Usar power-up
- `POST /api/sala/{id}/sair` - Sair da sala

### Perguntas
- `GET /api/pergunta` - Listar todas as perguntas
- `POST /api/pergunta/importar` - Importar perguntas

### SignalR Events
- `EntrarNaSala` - Entrar em grupo da sala
- `SairDaSala` - Sair do grupo da sala
- `AtualizarSala` - Receber atualizações da sala
- `NovaPergunta` - Receber nova pergunta
- `RespostaProcessada` - Receber resultado da resposta
- `JogadorDerrotado` - Notificação de jogador derrotado
- `PartidaFinalizada` - Notificação de fim de partida
- `PowerUpRecebido` - Notificação de power-up recebido
- `AcaoPowerUp` - Notificação de ação de power-up

## 🗄️ Modelo de Dados

### Entidades Principais

**Sala**
- Configurações da sala (min/max jogadores)
- Níveis de perguntas permitidos
- Controle de rodadas e estado da partida
- Lista de jogadores
- Pergunta atual e jogador da vez

**Jogador**
- Nome
- Vida (0-100)
- Power-up atual
- Escudo ativo
- Status (vivo/morto)

**Pergunta**
- Enunciado
- Nível de dificuldade
- Opções de resposta
- Índice da resposta correta

**OpcaoResposta**
- Texto da opção

## 🧪 Scripts Disponíveis

### Backend
```bash
dotnet build              # Compilar
dotnet run               # Executar
dotnet test              # Testes
dotnet ef migrations add # Criar migration
dotnet ef database update # Aplicar migrations
```

### Frontend
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview da build
npm run lint     # Linter
```

## 🐳 Docker

O projeto inclui configuração Docker para o banco de dados MySQL:

```yaml
services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ab12c3
      MYSQL_DATABASE: cinebattle
```

## 📝 Migrations

O projeto utiliza Entity Framework Core Migrations:

- `InitialCreate` - Criação inicial das tabelas
- `AddNivelPergunta` - Adição do campo nível nas perguntas

## 🎨 Recursos Visuais

- Logo customizado
- Ícones de power-ups
- Interface responsiva
- Animações e feedback visual
- Sistema de notificações

## 🔒 CORS

O backend está configurado para aceitar conexões do frontend em desenvolvimento:
```csharp
WithOrigins("http://localhost:5173")
  .AllowAnyHeader()
  .AllowAnyMethod()
  .AllowCredentials()
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- **Wilgner** - Desenvolvimento inicial

## 🙏 Agradecimentos

- Comunidade .NET
- Comunidade React
- Todos os contribuidores

---

⭐ Se você gostou deste projeto, considere dar uma estrela!
