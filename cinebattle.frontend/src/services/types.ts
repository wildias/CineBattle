// DTOs
export interface CriarSalaDto {
  nomeJogador: string;
  niveis: string[];
  maxJogadores: number;
}

export interface RespostaDto {
  jogadorId: number;
  opcaoIndex: number;
}

// Responses
export interface SalaResponse {
  salaId: number;
  jogadorId: number;
  jogadorNome: string;
  minJogadores: number;
  maxJogadores: number;
  niveisPermitidos: string[];
}

export interface JogadorResponse {
  id: number;
  nome: string;
}

export interface ResultadoOperacao {
  sucesso: boolean;
  erro?: string;
}

export interface PerguntaResponse {
  id: number;
  texto: string;
  opcoes: string[];
  nivel: string;
}

export interface RespostaResultado extends ResultadoOperacao {
  pontos?: number;
  respostaCorreta?: number;
}

export interface SalaResponseDto {
  id: number;
  quantidadeJogadores: number;
  emAndamento: boolean;
  estaCheia: boolean;
}

export enum PowerUpTipo {
  Ataque = 1,
  Escudo = 2,
  Cura = 3
}

export interface JogadorSala {
  id: number;
  nome: string;
  vida: number;
  vivo: boolean;
  powerUpAtual?: PowerUpTipo;
  escudoAtivo?: number;
}

export interface AplicarPowerUpDto {
  jogadorId: number;
  powerUp: PowerUpTipo;
  alvoId: number;
}

export interface AcaoPowerUpDto {
  mensagem: string;
  jogadorOrigemId: number;
  jogadorOrigemNome: string;
  jogadorAlvoId?: number;
  jogadorAlvoNome?: string;
  powerUp: PowerUpTipo;
  valor: number;
}
