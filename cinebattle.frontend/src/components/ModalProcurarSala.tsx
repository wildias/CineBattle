import { useState, useEffect } from 'react';
import salaService from '../services/salaService';
import type { SalaResponseDto } from '../services/types';
import ModalEntrarSala from './ModalEntrarSala';
import '../styles/ModalProcurarSala.css';

interface ModalProcurarSalaProps {
  isOpen: boolean;
  onClose: () => void;
  onSalaEscolhida: (salaId: number) => void;
}

export const ModalProcurarSala = ({ isOpen, onClose, onSalaEscolhida }: ModalProcurarSalaProps) => {
  const [salas, setSalas] = useState<SalaResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalEntrarAberto, setModalEntrarAberto] = useState(false);
  const [salaIdSelecionada, setSalaIdSelecionada] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      buscarSalas();
    }
  }, [isOpen]);

  const buscarSalas = async () => {
    setLoading(true);
    setErro(null);

    try {
      const salasEncontradas = await salaService.buscarSalas();
      setSalas(salasEncontradas);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao buscar salas');
    } finally {
      setLoading(false);
    }
  };

  const handleEntrarSala = (salaId: number) => {
    setSalaIdSelecionada(salaId);
    setModalEntrarAberto(true);
  };

  const handleEntrarSucesso = (jogadorId: number) => {
    if (salaIdSelecionada) {
      setModalEntrarAberto(false);
      onSalaEscolhida(salaIdSelecionada);
      onClose();
    }
  };

  const handleFecharModalEntrar = () => {
    setModalEntrarAberto(false);
    setSalaIdSelecionada(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ display: modalEntrarAberto ? 'none' : 'flex' }}>
        <div className="modal-content-salas" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>

          <div className="modal-header">
            <span className="modal-icon">🎬</span>
            <h2>Salas Disponíveis</h2>
            <span className="modal-icon">🎬</span>
          </div>

          <div className="modal-body-salas">
            {loading ? (
              <div className="loading-salas">
                <span className="loading-icon">🎞️</span>
                <p>Buscando salas...</p>
              </div>
            ) : erro ? (
              <div className="erro-message">
                <span>⚠️</span> {erro}
              </div>
            ) : salas.length === 0 ? (
              <div className="empty-salas">
                <span className="empty-icon">🎭</span>
                <p>Nenhuma sala disponível no momento</p>
                <p className="empty-subtitle">Que tal criar uma nova sala?</p>
              </div>
            ) : (
              <div className="salas-lista">
                {salas.map((sala) => (
                  <div
                    key={sala.id}
                    className={`sala-card ${sala.estaCheia || sala.emAndamento ? 'disabled' : ''}`}
                    onClick={() => !sala.estaCheia && !sala.emAndamento && handleEntrarSala(sala.id)}
                  >
                    <div className="sala-info-wrapper">
                      <div className="sala-icon-status">
                        {sala.estaCheia || sala.emAndamento ? '🎞️' : '🎬'}
                      </div>
                      
                      <div className="sala-details">
                        <h3 className="sala-title">Sala {sala.id}</h3>
                        <div className="sala-meta">
                          <span className="meta-item">
                            <span className="meta-icon">👥</span>
                            {sala.quantidadeJogadores} jogadores
                          </span>
                        </div>
                      </div>

                      <div className="sala-status-badge">
                        {sala.estaCheia ? (
                          <span className="badge badge-cheia">CHEIA</span>
                        ) : sala.emAndamento ? (
                          <span className="badge badge-andamento">EM JOGO</span>
                        ) : (
                          <span className="badge badge-disponivel">ABERTA</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer-salas">
            <button className="btn-atualizar" onClick={buscarSalas} disabled={loading}>
              🔄 Atualizar Lista
            </button>
          </div>
        </div>
      </div>

      {salaIdSelecionada && (
        <ModalEntrarSala
          isOpen={modalEntrarAberto}
          onClose={handleFecharModalEntrar}
          salaId={salaIdSelecionada}
          onEntrarSucesso={handleEntrarSucesso}
        />
      )}
    </>
  );
};

export default ModalProcurarSala;
