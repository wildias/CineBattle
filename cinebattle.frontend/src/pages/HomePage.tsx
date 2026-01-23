import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SalaResponse } from '../services/types';
import '../styles/HomePage.css';
import logo from '../assets/images/logo.png';
import ModalCriarSala from '../components/ModalCriarSala';
import ModalProcurarSala from '../components/ModalProcurarSala';

function HomePage() {
  const navigate = useNavigate();
  const [modalCriarSalaAberto, setModalCriarSalaAberto] = useState(false);
  const [modalProcurarSalaAberto, setModalProcurarSalaAberto] = useState(false);

  const handleQuickMatch = () => {
    console.log('Partida Rápida');
    // TODO: Implementar lógica de partida rápida
  };

  const handleCreateRoom = () => {
    setModalCriarSalaAberto(true);
  };

  const handleJoinRoom = () => {
    setModalProcurarSalaAberto(true);
  };

  const handleSalaCriada = (response: SalaResponse) => {
    console.log('Sala criada:', response);
    navigate(`/sala/${response.salaId}`, {
      state: {
        jogadorId: response.jogadorId,
        jogadorNome: response.jogadorNome,
        maxJogadores: response.maxJogadores,
      },
    });
  };

  const handleSalaEscolhida = (salaId: number, jogadorId: number, jogadorNome: string) => {
    console.log('Entrar na sala:', { salaId, jogadorId, jogadorNome });
    navigate(`/sala/${salaId}`, {
      state: {
        jogadorId,
        jogadorNome,
      },
    });
  };

  return (
    <div className="homepage">
      <div className="background-overlay"></div>
      
      <div className="content">
        <div className="logo-container">
          <img src={logo} alt="CineBattle" className="logo" />
        </div>

        <div className="menu-options">
          {/* <button className="menu-button" onClick={handleQuickMatch}>
            <div className="button-icon">⚡</div>
            <span className="button-text">PARTIDA RÁPIDA</span>
          </button> */}

          <button className="menu-button" onClick={handleCreateRoom}>
            <div className="button-icon">🎬</div>
            <span className="button-text">CRIAR SALA</span>
          </button>

          <button className="menu-button" onClick={handleJoinRoom}>
            <div className="button-icon">🎯</div>
            <span className="button-text">PROCURAR SALA</span>
          </button>
        </div>
      </div>

      <ModalCriarSala
        isOpen={modalCriarSalaAberto}
        onClose={() => setModalCriarSalaAberto(false)}
        onSalaCriada={handleSalaCriada}
      />

      <ModalProcurarSala
        isOpen={modalProcurarSalaAberto}
        onClose={() => setModalProcurarSalaAberto(false)}
        onSalaEscolhida={handleSalaEscolhida}
      />
    </div>
  );
}

export default HomePage;
