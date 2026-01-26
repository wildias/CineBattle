import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import type { JogadorSala, PowerUpTipo, AcaoPowerUpDto } from '../services/types';
import { useSignalR } from '../hooks/useSignalR';
import salaService from '../services/salaService';
import logo from '../assets/images/logo.png';
import '../styles/SalaPage.css';

interface EstadoSala {
  salaId: number;
  emAndamento: boolean;
  liderId: number;
  maxJogadores: number;
  minJogadores: number;
  jogadorAtualId: number | null;
  perguntaAtualId: number | null;
  jogadores: JogadorSala[];
}

export const SalaPage = () => {
  const { salaId } = useParams<{ salaId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [jogadores, setJogadores] = useState<JogadorSala[]>([]);
  const [jogadorId, setJogadorId] = useState<number | undefined>();
  const [liderId, setLiderId] = useState<number | undefined>();
  const [maxJogadores, setMaxJogadores] = useState<number>(5);
  const [mostrarConfirmacaoSair, setMostrarConfirmacaoSair] = useState(false);
  const [partidaIniciada, setPartidaIniciada] = useState(false);
  const [perguntaAtual, setPerguntaAtual] = useState<any>(null);
  const [jogadorAtualIndex, setJogadorAtualIndex] = useState(0);
  const [aguardandoResposta, setAguardandoResposta] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(20);
  const [timerAtivo, setTimerAtivo] = useState(false);
  const [jogadorDerrotado, setJogadorDerrotado] = useState(false);
  const [vencedor, setVencedor] = useState<{ id: number; nome: string } | null>(null);
  const [updateKey, setUpdateKey] = useState(0); // Força re-render
  const [powerUpRecebido, setPowerUpRecebido] = useState<PowerUpTipo | null>(null);
  const [mostrarSelecaoPowerUp, setMostrarSelecaoPowerUp] = useState(false);
  const [notificacoes, setNotificacoes] = useState<AcaoPowerUpDto[]>([]);
  
  // Refs para evitar problemas de closure no timer
  const aguardandoRespostaRef = useRef(aguardandoResposta);
  const jogadorIdRef = useRef(jogadorId);
  
  useEffect(() => {
    aguardandoRespostaRef.current = aguardandoResposta;
  }, [aguardandoResposta]);
  
  useEffect(() => {
    jogadorIdRef.current = jogadorId;
  }, [jogadorId]);

  // Debug: Log quando jogadores mudarem
  useEffect(() => {
    console.log('🔄 Estado jogadores atualizado:', jogadores);
    jogadores.forEach(j => {
      console.log(`  - ${j.nome}: ${j.vida}/100 (vivo: ${j.vivo})`);
    });
  }, [jogadores]);

  // Handlers para eventos SignalR
  const handleJogadoresAtualizados = (data: any) => {
    console.log('📦 [JOGADORES ATUALIZADOS]', JSON.stringify(data, null, 2));
    
    // Força novo array com novos objetos
    const novosJogadores = data.jogadores.map((j: any) => ({
      id: j.id,
      nome: j.nome,
      vida: j.vida,
      vivo: j.vivo
    }));
    
    console.log('🔄 Novos jogadores:', novosJogadores);
    
    // Usa callback para garantir que o estado mais recente seja usado
    setJogadores(() => novosJogadores);
    setLiderId(data.liderId);
    setUpdateKey(prev => prev + 1); // Força re-render
    
    if (data.maxJogadores) {
      setMaxJogadores(data.maxJogadores);
    }
    
    // Verifica derrota
    const morto = novosJogadores.find((j: any) => j.vida <= 0 && j.id === jogadorId);
    if (morto) {
      console.log('☠️ MORRI!');
      setJogadorDerrotado(true);
      setTimerAtivo(false);
    }
  };

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

  const handlePartidaIniciada = async (data: any) => {
    console.log('Partida iniciada!', data);
    setPartidaIniciada(true);
    // Não precisa buscar pergunta, ela virá via SignalR
  };

  const handleNovaPergunta = (data: any) => {
    console.log('🆕 Nova pergunta recebida:', data);
    console.log('🎯 Jogador atual (turno):', data.jogadorAtualId, '| Meu ID:', jogadorId);
    
    setPerguntaAtual(data);
    setAguardandoResposta(false);
    
    // Atualiza o índice do jogador atual baseado no ID
    const index = jogadores.findIndex(j => j.id === data.jogadorAtualId);
    if (index >= 0) {
      setJogadorAtualIndex(index);
    }

    // Inicia timer apenas se for a vez do jogador atual
    if (data.jogadorAtualId === jogadorId) {
      console.log('✅ É MINHA VEZ! Iniciando timer...');
      setTempoRestante(20);
      setTimerAtivo(true);
    } else {
      console.log('⏸️ Não é minha vez, aguardando...');
      setTimerAtivo(false);
    }
  };

  const handleResultadoResposta = (resultado: any) => {
    console.log('\ud83d\udcca Resultado da resposta completo:', resultado);
    console.log('\u2620\ufe0f JogadorMorreu:', resultado.jogadorMorreu);
    console.log('\ud83c\udfaf JogadorId:', resultado.jogadorId, '| Meu ID:', jogadorId);
    console.log('\u2764\ufe0f Vida restante:', resultado.vidaRestante);
    
    // Verifica se o jogador atual morreu
    if (resultado.jogadorMorreu && resultado.jogadorId === jogadorId) {
      console.log('\ud83d\udd34 MEU JOGADOR FOI DERROTADO!');
      setJogadorDerrotado(true);
      setTimerAtivo(false);
      setPerguntaAtual(null);
    }
    
    // Aguarda o evento JogadoresAtualizados para sincronizar vidas
  };

  const handleJogadorRespondeu = (resultado: any) => {
    console.log('Jogador respondeu:', resultado);
    setAguardandoResposta(true);
    
    // Exibe feedback visual
    // A próxima pergunta virá automaticamente via SignalR
  };

  const handleJogoFinalizado = (data: any) => {
    console.log('🏆 FIM DE JOGO recebido!');
    console.log('👑 Vencedor:', data);
    console.log('🎯 Vencedor ID:', data.id, '| Meu ID:', jogadorId);
    
    setVencedor({ id: data.id, nome: data.nome });
    setTimerAtivo(false);
    setPerguntaAtual(null);
    setAguardandoResposta(false);
    setMostrarSelecaoPowerUp(false);
    
    if (data.id === jogadorId) {
      console.log('🏆 EU VENCI!');
    } else {
      console.log('💔 Outro jogador venceu');
    }
  };

  const handleAcaoPowerUp = (acao: AcaoPowerUpDto) => {
    console.log('⚡ Ação de power-up recebida:', acao);
    
    // Adiciona à lista de notificações
    setNotificacoes(prev => [...prev, acao]);
    
    // Remove após 5 segundos
    setTimeout(() => {
      setNotificacoes(prev => prev.filter(n => n !== acao));
    }, 5000);
  };

  // Conecta ao SignalR
  const { isConnected: _isConnected } = useSignalR({
    salaId: Number(salaId),
    jogadorId,
    onJogadoresAtualizados: handleJogadoresAtualizados,
    onJogadorEntrou: handleJogadorEntrou,
    onJogadorSaiu: handleJogadorSaiu,
    onPartidaIniciada: handlePartidaIniciada,
    onNovaPergunta: handleNovaPergunta,
    onResultadoResposta: handleResultadoResposta,
    onJogadorRespondeu: handleJogadorRespondeu,
    onJogoFinalizado: handleJogoFinalizado,
    onAcaoPowerUp: handleAcaoPowerUp,
  });

  useEffect(() => {
    // Verifica se há dados do jogador no state
    const state = location.state as { jogadorId?: number; jogadorNome?: string; maxJogadores?: number };
    
    let currentJogadorId: number | undefined;
    
    if (state?.jogadorId) {
      currentJogadorId = state.jogadorId;
      // Salva no localStorage para persistência
      localStorage.setItem(`cinebattle_jogador_${salaId}`, JSON.stringify({
        jogadorId: state.jogadorId,
        jogadorNome: state.jogadorNome
      }));
    } else {
      // Tenta recuperar do localStorage (caso tenha dado F5)
      const stored = localStorage.getItem(`cinebattle_jogador_${salaId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          currentJogadorId = parsed.jogadorId;
          console.log('🔄 Recuperado jogadorId do localStorage:', currentJogadorId);
        } catch (e) {
          console.error('Erro ao parsear localStorage:', e);
        }
      }
    }
    
    if (currentJogadorId) {
      setJogadorId(currentJogadorId);
    }

    if (state?.maxJogadores) {
      setMaxJogadores(state.maxJogadores);
    }

    // Carrega o estado atual da sala (incluindo se está em andamento)
    const carregarEstadoSala = async () => {
      try {
        const estado = await salaService.obterEstadoSala(Number(salaId)) as EstadoSala;
        console.log('📦 Estado da sala recuperado:', estado);
        
        setJogadores(estado.jogadores);
        setLiderId(estado.liderId);
        setMaxJogadores(estado.maxJogadores);
        
        // Se a partida já está em andamento, atualiza o estado
        if (estado.emAndamento) {
          console.log('⚡ Partida já em andamento! Sincronizando...');
          setPartidaIniciada(true);
          
          // Se é minha vez e há uma pergunta ativa, solicita via API
          if (estado.jogadorAtualId === currentJogadorId && estado.perguntaAtualId) {
            console.log('🔄 Solicitando pergunta atual via API...');
            try {
              const pergunta = await salaService.obterPergunta(Number(salaId));
              console.log('✅ Pergunta recuperada:', pergunta);
              setPerguntaAtual(pergunta);
              setTempoRestante(20);
              setTimerAtivo(true);
              setAguardandoResposta(false);
            } catch (error) {
              console.error('❌ Erro ao recuperar pergunta:', error);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar estado da sala:', error);
      }
    };

    carregarEstadoSala();
  }, [location.state, salaId]);

  // Timer para resposta
  useEffect(() => {
    if (!timerAtivo) return;

    const interval = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          setTimerAtivo(false);
          // Tempo esgotado - responde automaticamente com -1 (erro)
          const currentJogadorId = jogadorIdRef.current;
          const currentAguardando = aguardandoRespostaRef.current;
          
          console.log('⏰ TIMEOUT! Enviando resposta automática...', { currentJogadorId, currentAguardando });
          
          if (currentJogadorId && !currentAguardando) {
            // Usa setTimeout para evitar conflito de estado
            setTimeout(() => {
              handleResponder(-1);
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerAtivo]);

  const calcularPercentualVida = (vidaAtual: number) => {
    const vidaTotal = 100; // Vida máxima do jogador
    return (vidaAtual / vidaTotal) * 100;
  };

  const getCorBarraVida = (percentual: number) => {
    if (percentual > 60) return '#22c55e'; // Verde
    if (percentual > 30) return '#eab308'; // Amarelo
    return '#dc2626'; // Vermelho
  };

  const handleSairSala = () => {
    setMostrarConfirmacaoSair(true);
  };

  const confirmarSaida = async () => {
    if (!jogadorId) {
      // Limpa localStorage ao sair
      localStorage.removeItem(`cinebattle_jogador_${salaId}`);
      navigate('/');
      return;
    }

    try {
      // Chama API para remover jogador da sala
      await salaService.sairDaSala(Number(salaId), jogadorId);
      // Limpa localStorage ao sair
      localStorage.removeItem(`cinebattle_jogador_${salaId}`);
      navigate('/');
    } catch (error) {
      console.error('Erro ao sair da sala:', error);
      // Limpa localStorage e navega mesmo com erro
      localStorage.removeItem(`cinebattle_jogador_${salaId}`);
      navigate('/');
    }
  };

  const cancelarSaida = () => {
    setMostrarConfirmacaoSair(false);
  };

  const handleIniciarBatalha = async () => {
    try {
      console.log('Iniciando batalha na sala:', salaId);
      await salaService.iniciarPartida(Number(salaId));
      console.log('Partida iniciada com sucesso!');
    } catch (error) {
      console.error('Erro ao iniciar partida:', error);
    }
  };

  const handleResponder = async (opcaoIndex: number) => {
    if (!jogadorId || aguardandoResposta) {
      console.log('⛔ Não pode responder:', { jogadorId, aguardandoResposta });
      return;
    }
    
    console.log('📤 Enviando resposta:', { jogadorId, opcaoIndex, perguntaId: perguntaAtual?.id });
    
    setAguardandoResposta(true);
    setTimerAtivo(false); // Para o timer
    
    try {
      const resposta = {
        jogadorId: jogadorId,
        opcaoIndex: opcaoIndex
      };
      
      await salaService.responderPergunta(Number(salaId), resposta);
      console.log('✅ Resposta enviada com sucesso!');
      // O backend enviará ResultadoResposta e depois NovaPergunta via SignalR
    } catch (error) {
      console.error('❌ Erro ao responder:', error);
      setAguardandoResposta(false);
    }
  };

  const handleAplicarPowerUp = async (alvoId: number) => {
    if (!jogadorId || !powerUpRecebido) {
      console.log('⛔ Não pode aplicar power-up');
      return;
    }

    try {
      await salaService.aplicarPowerUp(Number(salaId), {
        jogadorId,
        powerUp: powerUpRecebido,
        alvoId
      });

      setPowerUpRecebido(null);
      setMostrarSelecaoPowerUp(false);
      setPerguntaAtual(null);
      console.log('✅ Power-up aplicado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao aplicar power-up:', error);
    }
  };

  const getPowerUpNome = (tipo: PowerUpTipo): string => {
    switch (tipo) {
      case 1: return 'Ataque';
      case 2: return 'Escudo';
      case 3: return 'Cura';
      default: return 'Power-Up';
    }
  };

  const getPowerUpIcon = (tipo: PowerUpTipo): string => {
    switch (tipo) {
      case 1: return '⚔️';
      case 2: return '🛡️';
      case 3: return '💚';
      default: return '⭐';
    }
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
          <button className="btn-sair-sala" onClick={handleSairSala} title="Sair da sala">
            ✕
          </button>
        </div>

        <div className="sala-main">
          {/* Área principal do jogo - perguntas, etc */}
          <div className="game-area">
            {!partidaIniciada ? (
              <div className="waiting-area">
                <span className="waiting-icon">🎥</span>
                <p>Aguardando jogadores...</p>
                <p className="waiting-subtitle">A partida iniciará em breve</p>
              </div>
            ) : (
              <div className="game-active-area">
                {jogadores.length > 0 && jogadores[jogadorAtualIndex]?.id === jogadorId && !aguardandoResposta ? (
                  <div className="pergunta-container pergunta-fade-in">
                    {/* Cabeçalho com timer */}
                    <div className="pergunta-header-timer">
                      {timerAtivo && (
                        <div className="timer-header">
                          <span className="timer-icon">⏱️</span>
                          <span className={`timer-numero ${tempoRestante <= 5 ? 'timer-urgente' : ''}`}>
                            {tempoRestante}s
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <h2 className="pergunta-texto">{perguntaAtual?.texto}</h2>
                    <div className="opcoes-container">
                      {perguntaAtual?.opcoes?.map((opcao: string, index: number) => (
                        <button
                          key={index}
                          className="opcao-btn"
                          onClick={() => handleResponder(index)}
                        >
                          <span className="opcao-letra">{String.fromCharCode(65 + index)}</span>
                          <span className="opcao-texto">{opcao}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="waiting-turn">
                    <span className="waiting-icon">⏳</span>
                    <p className="waiting-title">Aguarde sua vez</p>
                    <p className="waiting-subtitle">
                      {jogadores[jogadorAtualIndex]?.nome || 'Jogador'} está respondendo...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Painel lateral com jogadores */}
          <div className="jogadores-panel">
            <div className="panel-header-info">
              <h2 className="panel-title">
                <span className="title-icon">👥</span>
                Jogadores
                <span className="jogadores-contador">{jogadores.length}/{maxJogadores}</span>
              </h2>
            </div>

            <div className="jogadores-lista">
              {jogadores.map((jogador) => {
                const percentualVida = calcularPercentualVida(jogador.vida);
                const corBarra = getCorBarraVida(percentualVida);
                const ehLider = jogador.id === liderId;

                return (
                  <div key={`${jogador.id}-${jogador.vida}-${updateKey}`} className="jogador-card">
                    <div className="jogador-avatar">
                      <span className="avatar-icon">🎭</span>
                    </div>

                    <div className="jogador-info">
                      <h3 className="jogador-nome">
                        {ehLider && <span className="coroa-lider">👑</span>}
                        {jogador.nome}
                      </h3>

                      <div className="hp-container">
                        <div className="hp-label">
                          <span className="hp-icon">❤️</span>
                          <span className="hp-text">
                            {jogador.vida} / 100
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

            {jogadores.length >= 2 && jogadorId === liderId && !partidaIniciada && (
              <div className="btn-iniciar-container">
                <button className="btn-iniciar-batalha" onClick={handleIniciarBatalha}>
                  <span className="btn-icon">⚔️</span>
                  Iniciar Batalha
                </button>
              </div>
            )}

            {jogadores.length === 0 && (
              <div className="empty-jogadores">
                <span className="empty-icon">🎪</span>
                <p>Nenhum jogador na sala</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação para Sair */}
      {mostrarConfirmacaoSair && (
        <div className="modal-overlay" onClick={cancelarSaida}>
          <div className="modal-confirmacao" onClick={(e) => e.stopPropagation()}>
            <div className="modal-confirmacao-header">
              <span className="modal-icon">⚠️</span>
              <h2>Sair da Sala?</h2>
            </div>
            
            <p className="modal-confirmacao-texto">
              Tem certeza que deseja sair da sala?
            </p>
            
            <div className="modal-confirmacao-botoes">
              <button className="btn-cancelar" onClick={cancelarSaida}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={confirmarSaida}>
                Sair da Sala
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Derrota */}
      {jogadorDerrotado && (
        <div className="modal-overlay game-over-overlay">
          <div className="modal-game-over derrota">
            <div className="game-over-icon">💀</div>
            <h1 className="game-over-title">VOCÊ FOI DERROTADO!</h1>
            <p className="game-over-text">Sua vida chegou a zero. Melhor sorte na próxima!</p>
            <button className="btn-voltar-home" onClick={() => {
              localStorage.removeItem(`cinebattle_jogador_${salaId}`);
              navigate('/');
            }}>
              Voltar ao Menu
            </button>
          </div>
        </div>
      )}

      {/* Modal de Vitória */}
      {vencedor && (
        <div className="modal-overlay game-over-overlay">
          <div className="modal-game-over vitoria">
            <div className="game-over-icon">{vencedor.id === jogadorId ? '🏆' : '👑'}</div>
            <h1 className="game-over-title">
              {vencedor.id === jogadorId ? 'VOCÊ VENCEU!' : `${vencedor.nome.toUpperCase()} VENCEU!`}
            </h1>
            <p className="game-over-text">
              {vencedor.id === jogadorId 
                ? 'Parabéns! Você é o último sobrevivente!' 
                : `${vencedor.nome} foi o último jogador a sobreviver!`}
            </p>
            <button className="btn-voltar-home" onClick={() => {
              localStorage.removeItem(`cinebattle_jogador_${salaId}`);
              navigate('/');
            }}>
              Voltar ao Menu
            </button>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Power-Up */}
      {mostrarSelecaoPowerUp && powerUpRecebido && (
        <div className="modal-overlay">
          <div className="modal-powerup">
            <div className="powerup-header">
              <span className="powerup-icon">{getPowerUpIcon(powerUpRecebido)}</span>
              <h2>Você ganhou: {getPowerUpNome(powerUpRecebido)}!</h2>
            </div>
            
            <p className="powerup-instrucao">
              {powerUpRecebido === 1 && 'Escolha um jogador para atacar:'}
              {powerUpRecebido === 2 && 'Aplicar escudo em você mesmo:'}
              {powerUpRecebido === 3 && 'Escolha quem curar:'}
            </p>
            
            <div className="powerup-alvos">
              {powerUpRecebido === 2 ? (
                <button
                  className="powerup-alvo-btn"
                  onClick={() => handleAplicarPowerUp(jogadorId!)}
                >
                  <span className="alvo-icon">🛡️</span>
                  <span className="alvo-nome">Você</span>
                </button>
              ) : (
                jogadores
                  .filter(j => j.vivo && (powerUpRecebido === 1 ? j.id !== jogadorId : true))
                  .map(jogador => (
                    <button
                      key={jogador.id}
                      className="powerup-alvo-btn"
                      onClick={() => handleAplicarPowerUp(jogador.id)}
                    >
                      <span className="alvo-icon">🎭</span>
                      <span className="alvo-nome">{jogador.nome}</span>
                      <span className="alvo-vida">❤️ {jogador.vida}</span>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Área de Notificações */}
      <div className="notificacoes-container">
        {notificacoes.map((notif, index) => (
          <div key={index} className="notificacao-item">
            <span className="notif-icon">{getPowerUpIcon(notif.powerUp)}</span>
            <span className="notif-texto">{notif.mensagem}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalaPage;
