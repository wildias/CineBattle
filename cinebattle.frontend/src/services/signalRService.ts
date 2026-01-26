import * as signalR from '@microsoft/signalr';

const API_BASE_URL = 'http://localhost:5000';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  /**
   * Conecta ao hub SignalR
   */
  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/gameHub`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR Connected');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      throw err;
    }
  }

  /**
   * Desconecta do hub SignalR
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('SignalR Disconnected');
    }
  }

  /**
   * Entra em uma sala
   */
  async entrarSala(salaId: number): Promise<void> {
    if (!this.connection) {
      throw new Error('Connection not established');
    }

    await this.connection.invoke('EntrarNaSala', salaId);
  }

  /**
   * Sai de uma sala
   */
  async sairSala(salaId: number): Promise<void> {
    if (!this.connection) {
      throw new Error('Connection not established');
    }

    await this.connection.invoke('SairDaSala', salaId);
  }

  /**
   * Registra callback para quando a lista de jogadores for atualizada
   */
  onJogadoresAtualizados(callback: (jogadores: any[]) => void): void {
    if (!this.connection) return;
    this.connection.on('JogadoresAtualizados', callback);
  }

  /**
   * Registra callback para quando um jogador entrar na sala
   */
  onJogadorEntrou(callback: (jogador: any) => void): void {
    if (!this.connection) return;
    this.connection.on('JogadorEntrou', callback);
  }

  /**
   * Registra callback para quando um jogador sair da sala
   */
  onJogadorSaiu(callback: (jogadorId: number) => void): void {
    if (!this.connection) return;
    this.connection.on('JogadorSaiu', callback);
  }

  /**
   * Registra callback para quando a partida iniciar
   */
  onPartidaIniciada(callback: () => void): void {
    if (!this.connection) return;
    this.connection.on('PartidaIniciada', callback);
  }

  /**
   * Registra callback para quando uma nova pergunta for enviada
   */
  onNovaPergunta(callback: (pergunta: any) => void): void {
    if (!this.connection) return;
    this.connection.on('NovaPergunta', callback);
  }

  /**
   * Registra callback para quando um jogador responder
   */
  onResultadoResposta(callback: (resultado: any) => void): void {
    if (!this.connection) return;
    this.connection.on('ResultadoResposta', callback);
  }

  /**
   * Registra callback para quando um jogador responder
   */
  onJogadorRespondeu(callback: (resultado: any) => void): void {
    if (!this.connection) return;
    this.connection.on('JogadorRespondeu', callback);
  }

  /**
   * Registra callback para quando a vida de um jogador mudar
   */
  onVidaAtualizada(callback: (jogadorId: number, vidaAtual: number) => void): void {
    if (!this.connection) return;
    this.connection.on('VidaAtualizada', callback);
  }

  /**
   * Registra callback para quando o jogo terminar
   */
  onJogoFinalizado(callback: (vencedor: any) => void): void {
    if (!this.connection) return;
    this.connection.on('FimDeJogo', callback);
  }

  /**
   * Registra callback para quando um power-up for usado
   */
  onAcaoPowerUp(callback: (acao: any) => void): void {
    if (!this.connection) return;
    this.connection.on('AcaoPowerUp', callback);
  }

  /**
   * Remove todos os listeners de eventos
   */
  removeAllListeners(): void {
    if (!this.connection) return;
    
    this.connection.off('JogadoresAtualizados');
    this.connection.off('JogadorEntrou');
    this.connection.off('JogadorSaiu');
    this.connection.off('PartidaIniciada');
    this.connection.off('NovaPergunta');
    this.connection.off('ResultadoResposta');
    this.connection.off('JogadorRespondeu');
    this.connection.off('VidaAtualizada');
    this.connection.off('FimDeJogo');
    this.connection.off('AcaoPowerUp');
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
export default signalRService;
