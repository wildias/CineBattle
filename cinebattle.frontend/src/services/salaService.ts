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
};

export default salaService;
