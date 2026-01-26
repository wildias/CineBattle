import api from './api';
import type {
  CriarSalaDto,
  RespostaDto,
  SalaResponse,
  JogadorResponse,
  ResultadoOperacao,
  PerguntaResponse,
  RespostaResultado,
  SalaResponseDto,
  JogadorSala,
  AplicarPowerUpDto,
} from './types';

export const salaService = {
  /**
   * Busca todas as salas disponíveis
   * @returns Lista de salas
   */
  buscarSalas: async (): Promise<SalaResponseDto[]> => {
    return api.get<SalaResponseDto[]>('/Sala/buscar');
  },

  /**
   * Cria uma nova sala de jogo
   * @param dto - Dados para criar a sala (níveis e max jogadores)
   * @returns Dados da sala criada
   */
  criarSala: async (dto: CriarSalaDto): Promise<SalaResponse> => {
    return api.post<SalaResponse>('/Sala/criar', dto);
  },

  /**
   * Entra em uma sala existente
   * @param salaId - ID da sala
   * @param nomeJogador - Nome do jogador
   * @returns Dados do jogador criado
   */
  entrarSala: async (salaId: number, nomeJogador: string): Promise<JogadorResponse> => {
    return api.post<JogadorResponse>(`/Sala/entrar/${salaId}`, nomeJogador);
  },

  /**
   * Busca os jogadores de uma sala
   * @param salaId - ID da sala
   * @returns Lista de jogadores na sala
   */
  buscarJogadoresSala: async (salaId: number): Promise<JogadorSala[]> => {
    return api.get<JogadorSala[]>(`/Sala/${salaId}/jogadores`);
  },

  /**   * Obtém o estado completo de uma sala
   * @param salaId - ID da sala
   * @returns Estado da sala incluindo se está em andamento
   */
  obterEstadoSala: async (salaId: number) => {
    return api.get(`/Sala/${salaId}/estado`);
  },

  /**   * Sai de uma sala
   * @param salaId - ID da sala
   * @param jogadorId - ID do jogador
   * @returns Resultado da operação
   */
  sairDaSala: async (salaId: number, jogadorId: number): Promise<string> => {
    return api.post<string>(`/Sala/${salaId}/sair`, jogadorId);
  },

  /**
   * Inicia a partida em uma sala
   * @param salaId - ID da sala
   * @returns Resultado da operação
   */
  iniciarPartida: async (salaId: number): Promise<string> => {
    return api.post<string>(`/Sala/iniciar/${salaId}`);
  },

  /**
   * Obtém uma pergunta aleatória para a sala
   * @param salaId - ID da sala
   * @returns Dados da pergunta
   */
  obterPergunta: async (salaId: number): Promise<PerguntaResponse> => {
    return api.get<PerguntaResponse>(`/Sala/${salaId}/pergunta`);
  },

  /**
   * Responde a uma pergunta
   * @param salaId - ID da sala
   * @param resposta - Dados da resposta (jogadorId e opcaoIndex)
   * @returns Resultado da resposta com pontuação
   */
  responderPergunta: async (salaId: number, resposta: RespostaDto): Promise<RespostaResultado> => {
    return api.post<RespostaResultado>(`/Sala/${salaId}/responder`, resposta);
  },

  /**
   * Aplica um power-up em um alvo
   * @param salaId - ID da sala
   * @param dto - Dados do power-up a aplicar
   * @returns Resultado da operação
   */
  aplicarPowerUp: async (salaId: number, dto: AplicarPowerUpDto): Promise<ResultadoOperacao> => {
    return api.post<ResultadoOperacao>(`/Sala/${salaId}/aplicar-powerup`, dto);
  },
};

export default salaService;
