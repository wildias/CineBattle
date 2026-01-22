import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { JogadorSala } from '../services/types';
import { useSignalR } from '../hooks/useSignalR';
import logo from '../assets/images/logo.png';
import '../styles/SalaPage.css';

export const SalaPage = () => {
  const { salaId } = useParams<{ salaId: string }>();
  const [jogadores, setJogadores] = useState<JogadorSala[]>([]);
  const [jogadorId, setJogadorId] = useState<number | undefined>();

  // Handlers para eventos SignalR
  const handleJogadorEntrou = (jogador: JogadorSala) => {
    console.log('Jogador entrou:', jogador);
    setJogadores((prev) => {
      // Evita duplicação
      if (prev.some((j) => j.id === jogador.id)) {
        return prev;
      }
      return [...prev, jogador];
    });
  };

  const handleJogadorSaiu = (jogadorIdSaiu: number) => {
    console.log('Jogador saiu:', jogadorIdSaiu);
    setJogadores((prev) => prev.filter((j) => j.id !== jogadorIdSaiu));
  };

  const handleVidaAtualizada = (jogadorIdAtualizado: number, vidaAtual: number) => {
    console.log('Vida atualizada:', jogadorIdAtualizado, vidaAtual);
    setJogadores((prev) =>
      prev.map((j) =>
        j.id === jogadorIdAtualizado ? { ...j, vidaAtual } : j
      )
    );
  };

  const handlePartidaIniciada = () => {
    console.log('Partida iniciada!');
    // TODO: Atualizar UI para mostrar que a partida começou
  };

  const handleNovaPergunta = (pergunta: any) => {
    console.log('Nova pergunta:', pergunta);
    // TODO: Mostrar pergunta na tela
  };

  const handleJogadorRespondeu = (resultado: any) => {
    console.log('Jogador respondeu:', resultado);
    // TODO: Mostrar feedback da resposta
  };

  const handleJogoFinalizado = (vencedor: any) => {
    console.log('Jogo finalizado! Vencedor:', vencedor);
    // TODO: Mostrar tela de vitória
  };

  // Conecta ao SignalR
  const { isConnected } = useSignalR({
    salaId: Number(salaId),
    jogadorId,
    onJogadorEntrou: handleJogadorEntrou,
    onJogadorSaiu: handleJogadorSaiu,
    onVidaAtualizada: handleVidaAtualizada,
    onPartidaIniciada: handlePartidaIniciada,
    onNovaPergunta: handleNovaPergunta,
    onJogadorRespondeu: handleJogadorRespondeu,
    onJogoFinalizado: handleJogoFinalizado,
  });

  useEffect(() => {
    // TODO: Buscar jogadorId do localStorage ou contexto
    // Por enquanto, mock para teste
    const mockJogadorId = Math.floor(Math.random() * 1000);
    setJogadorId(mockJogadorId);
  }, []);

  const calcularPercentualVida = (vidaAtual: number, vidaTotal: number) => {
    return (vidaAtual / vidaTotal) * 100;
  };

  const getCorBarraVida = (percentual: number) => {
    if (percentual > 60) return '#22c55e'; // Verde
    if (percentual > 30) return '#eab308'; // Amarelo
    return '#dc2626'; // Vermelho
  };

  return (
    <div className="sala-page">
      <div className="background-overlay"></div>

      <div className="sala-content">
        <div className="sala-header">
          <h1 className="sala-titulo">
            <span className="sala-icon">🎬</span>
            Sala {salaId}
          </h1>
          <img src={logo} alt="CineBattle" className="sala-logo" />
        </div>

        <div className="sala-main">
          {/* Área principal do jogo - perguntas, etc */}
          <div className="game-area">
            <div className="waiting-area">
              <span className="waiting-icon">🎥</span>
              <p>Aguardando jogadores...</p>
              <p className="waiting-subtitle">A partida iniciará em breve</p>
            </div>
          </div>

          {/* Painel lateral com jogadores */}
          <div className="jogadores-panel">
            <h2 className="panel-title">
              <span className="title-icon">👥</span>
              Jogadores
            </h2>

            <div className="jogadores-lista">
              {jogadores.map((jogador) => {
                const percentualVida = calcularPercentualVida(jogador.vidaAtual, jogador.vidaTotal);
                const corBarra = getCorBarraVida(percentualVida);

                return (
                  <div key={jogador.id} className="jogador-card">
                    <div className="jogador-avatar">
                      <span className="avatar-icon">🎭</span>
                    </div>

                    <div className="jogador-info">
                      <h3 className="jogador-nome">{jogador.nome}</h3>

                      <div className="hp-container">
                        <div className="hp-label">
                          <span className="hp-icon">❤️</span>
                          <span className="hp-text">
                            {jogador.vidaAtual} / {jogador.vidaTotal}
                          </span>
                        </div>

                        <div className="hp-barra-container">
                          <div
                            className="hp-barra"
                            style={{
                              width: `${percentualVida}%`,
                              backgroundColor: corBarra,
                            }}
                          >
                            <div className="hp-barra-brilho"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {jogadores.length === 0 && (
              <div className="empty-jogadores">
                <span className="empty-icon">🎪</span>
                <p>Nenhum jogador na sala</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaPage;
