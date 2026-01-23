import { useState } from 'react';
import salaService from '../services/salaService';
import type { CriarSalaDto, SalaResponse } from '../services/types';
import '../styles/ModalCriarSala.css';

interface ModalCriarSalaProps {
  isOpen: boolean;
  onClose: () => void;
  onSalaCriada: (response: SalaResponse) => void;
}

export const ModalCriarSala = ({ isOpen, onClose, onSalaCriada }: ModalCriarSalaProps) => {
  const [nomeJogador, setNomeJogador] = useState('');
  const [maxJogadores, setMaxJogadores] = useState(4);
  const [niveis, setNiveis] = useState<string[]>(['Facil']);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const toggleNivel = (nivel: string) => {
    setNiveis((prev) =>
      prev.includes(nivel)
        ? prev.filter((n) => n !== nivel)
        : [...prev, nivel]
    );
  };

  const handleCriarSala = async () => {
    setErro(null);

    if (!nomeJogador.trim()) {
      setErro('Digite seu nome');
      return;
    }

    if (niveis.length === 0) {
      setErro('Selecione pelo menos um nível de dificuldade');
      return;
    }

    setLoading(true);

    try {
      const dto: CriarSalaDto = {
        nomeJogador: nomeJogador.trim(),
        niveis,
        maxJogadores,
      };

      const sala = await salaService.criarSala(dto);
      onSalaCriada(sala);
      onClose();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao criar sala');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <span className="modal-icon">🎬</span>
          <h2>Criar Nova Sala</h2>
          <span className="modal-icon">🎬</span>
        </div>

        <div className="modal-body">
          {/* Nome do Jogador */}
          <div className="form-group">
            <label>
              <span className="label-icon">👤</span>
              Seu Nome
            </label>
            <input
              type="text"
              value={nomeJogador}
              onChange={(e) => setNomeJogador(e.target.value)}
              placeholder="Digite seu nome"
              className="input-nome"
              maxLength={50}
            />
          </div>

          {/* Seleção de Jogadores */}
          <div className="form-group">
            <label>
              <span className="label-icon">🍿</span>
              Número de Jogadores
            </label>
            <select
              value={maxJogadores}
              onChange={(e) => setMaxJogadores(Number(e.target.value))}
              className="select-jogadores"
            >
              <option value={2}>2 Jogadores</option>
              <option value={3}>3 Jogadores</option>
              <option value={4}>4 Jogadores</option>
              <option value={5}>5 Jogadores</option>
            </select>
          </div>

          {/* Seleção de Níveis */}
          <div className="form-group">
            <label>
              <span className="label-icon">🎥</span>
              Níveis de Dificuldade
            </label>
            <div className="niveis-container">
              <label className={`nivel-checkbox ${niveis.includes('Facil') ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={niveis.includes('Facil')}
                  onChange={() => toggleNivel('Facil')}
                />
                <span className="checkbox-icon">🌟</span>
                <span>Fácil</span>
              </label>

              <label className={`nivel-checkbox ${niveis.includes('Medio') ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={niveis.includes('Medio')}
                  onChange={() => toggleNivel('Medio')}
                />
                <span className="checkbox-icon">⭐</span>
                <span>Médio</span>
              </label>

              <label className={`nivel-checkbox ${niveis.includes('Dificil') ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={niveis.includes('Dificil')}
                  onChange={() => toggleNivel('Dificil')}
                />
                <span className="checkbox-icon">🎭</span>
                <span>Difícil</span>
              </label>
            </div>
          </div>

          {erro && (
            <div className="erro-message">
              <span>⚠️</span> {erro}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-criar-sala"
            onClick={handleCriarSala}
            disabled={loading}
          >
            {loading ? (
              <>🎞️ Criando...</>
            ) : (
              <>🎬 Criar Sala</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCriarSala;
