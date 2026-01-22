import { useEffect, useRef } from 'react';
import signalRService from '../services/signalRService';

interface UseSignalRProps {
  salaId: number;
  jogadorId?: number;
  onJogadorEntrou?: (jogador: any) => void;
  onJogadorSaiu?: (jogadorId: number) => void;
  onPartidaIniciada?: () => void;
  onNovaPergunta?: (pergunta: any) => void;
  onJogadorRespondeu?: (resultado: any) => void;
  onVidaAtualizada?: (jogadorId: number, vidaAtual: number) => void;
  onJogoFinalizado?: (vencedor: any) => void;
}

export const useSignalR = ({
  salaId,
  jogadorId,
  onJogadorEntrou,
  onJogadorSaiu,
  onPartidaIniciada,
  onNovaPergunta,
  onJogadorRespondeu,
  onVidaAtualizada,
  onJogoFinalizado,
}: UseSignalRProps) => {
  const isConnecting = useRef(false);

  useEffect(() => {
    const connectAndJoin = async () => {
      if (isConnecting.current) return;
      isConnecting.current = true;

      try {
        // Conecta ao SignalR
        if (!signalRService.isConnected()) {
          await signalRService.connect();
        }

        // Registra os callbacks
        if (onJogadorEntrou) {
          signalRService.onJogadorEntrou(onJogadorEntrou);
        }
        if (onJogadorSaiu) {
          signalRService.onJogadorSaiu(onJogadorSaiu);
        }
        if (onPartidaIniciada) {
          signalRService.onPartidaIniciada(onPartidaIniciada);
        }
        if (onNovaPergunta) {
          signalRService.onNovaPergunta(onNovaPergunta);
        }
        if (onJogadorRespondeu) {
          signalRService.onJogadorRespondeu(onJogadorRespondeu);
        }
        if (onVidaAtualizada) {
          signalRService.onVidaAtualizada(onVidaAtualizada);
        }
        if (onJogoFinalizado) {
          signalRService.onJogoFinalizado(onJogoFinalizado);
        }

        // Entra na sala
        if (jogadorId) {
          await signalRService.entrarSala(salaId, jogadorId);
        }
      } catch (error) {
        console.error('Erro ao conectar SignalR:', error);
      } finally {
        isConnecting.current = false;
      }
    };

    connectAndJoin();

    // Cleanup ao desmontar
    return () => {
      signalRService.sairSala(salaId).catch(console.error);
      signalRService.removeAllListeners();
    };
  }, [
    salaId,
    jogadorId,
    onJogadorEntrou,
    onJogadorSaiu,
    onPartidaIniciada,
    onNovaPergunta,
    onJogadorRespondeu,
    onVidaAtualizada,
    onJogoFinalizado,
  ]);

  return {
    isConnected: signalRService.isConnected(),
  };
};
