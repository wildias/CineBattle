import { useEffect, useRef } from 'react';
import signalRService from '../services/signalRService';
import type { AcaoPowerUpDto } from '../services/types';

interface UseSignalRProps {
  salaId: number;
  jogadorId?: number;
  onJogadoresAtualizados?: (jogadores: any[]) => void;
  onJogadorEntrou?: (jogador: any) => void;
  onJogadorSaiu?: (jogadorId: number) => void;
  onPartidaIniciada?: (data: any) => void;
  onNovaPergunta?: (data: any) => void;
  onResultadoResposta?: (resultado: any) => void;
  onJogadorRespondeu?: (resultado: any) => void;
  onVidaAtualizada?: (jogadorId: number, vidaAtual: number) => void;
  onJogoFinalizado?: (vencedor: any) => void;
  onAcaoPowerUp?: (acao: AcaoPowerUpDto) => void;
}

export const useSignalR = ({
  salaId,
  jogadorId,
  onJogadoresAtualizados,
  onJogadorEntrou,
  onJogadorSaiu,
  onPartidaIniciada,
  onNovaPergunta,
  onResultadoResposta,
  onJogadorRespondeu,
  onVidaAtualizada,
  onJogoFinalizado,
  onAcaoPowerUp,
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
          console.log('SignalR connection established');
        }

        // Aguarda um pouco para garantir que a conexão está estável
        await new Promise(resolve => setTimeout(resolve, 100));

        // Registra os callbacks
        if (onJogadoresAtualizados) {
          signalRService.onJogadoresAtualizados(onJogadoresAtualizados);
        }
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
        if (onResultadoResposta) {
          signalRService.onResultadoResposta(onResultadoResposta);
        }
        if (onJogadorRespondeu) {
          signalRService.onJogadorRespondeu(onJogadorRespondeu);
        }
        if (onVidaAtualizada) {
          signalRService.onVidaAtualizada(onVidaAtualizada);
        }
        if (onJogoFinalizado) {
         
        if (onAcaoPowerUp) {
          signalRService.onAcaoPowerUp(onAcaoPowerUp);
        } signalRService.onJogoFinalizado(onJogoFinalizado);
        }

        // Entra na sala se a conexão estiver estabelecida
        if (signalRService.isConnected()) {
          console.log(`Entrando na sala ${salaId}`);
          await signalRService.entrarSala(salaId);
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
      if (signalRService.isConnected()) {
        signalRService.sairSala(salaId).catch(console.error);
      }
      signalRService.removeAllListeners();
    };
  }, [
    salaId,
    jogadorId,
    onJogadoresAtualizados,
    onJogadorEntrou,
    onJogadorSaiu,
    onPartidaIniciada,
    onNovaPergunta,
    onResultadoResposta,
    onAcaoPowerUp,
    onJogadorRespondeu,
    onVidaAtualizada,
    onJogoFinalizado,
  ]);

  return {
    isConnected: signalRService.isConnected(),
  };
};
