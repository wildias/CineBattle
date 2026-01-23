import { useState } from 'react';
import salaService from '../services/salaService';
import '../styles/ModalEntrarSala.css';

interface ModalEntrarSalaProps {
  isOpen: boolean;
  onClose: () => void;
  salaId: number;
  onEntrarSucesso: (jogadorId: number, jogadorNome: string) => void;
}

export const ModalEntrarSala = ({ isOpen, onClose, salaId, onEntrarSucesso }: ModalEntrarSalaProps) => {
  const [nomeJogador, setNomeJogador] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleEntrar = async () => {
    if (!nomeJogador.trim()) {
      setErro('Digite um nome válido');
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const jogador = await salaService.entrarSala(salaId, nomeJogador.trim());
      onEntrarSucesso(jogador.id, jogador.nome);
      onClose();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao entrar na sala');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && nomeJogador.trim()) {
      handleEntrar();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-entrar-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <span className="modal-icon">🏆</span>
          <h2>Entrar na Sala {salaId}</h2>
        </div>

        <div className="modal-body-entrar">
          <div className="avatar-container">
            <div className="avatar-circle">
              <span className="avatar-oscar">🏆</span>
            </div>
          </div>

          <div className="form-group-entrar">
            <label htmlFor="nomeJogador">
              <span className="label-icon">👤</span>
              Seu Nome
            </label>
            <input
              id="nomeJogador"
              type="text"
              className="input-nome"
              placeholder="Digite seu nome..."
              value={nomeJogador}
              onChange={(e) => setNomeJogador(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={50}
              autoFocus
            />
          </div>

          {erro && (
            <div className="erro-message">
              <span>⚠️</span> {erro}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {nomeJogador.trim() && (
            <button
              className="btn-entrar-sala"
              onClick={handleEntrar}
              disabled={loading}
            >
              {loading ? (
                <>🎬 Entrando...</>
              ) : (
                <>🎬 Entrar na Sala</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEntrarSala;
