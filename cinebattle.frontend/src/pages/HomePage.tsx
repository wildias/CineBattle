import '../styles/HomePage.css';
import logo from '../assets/images/logo.png';

function HomePage() {
  const handleQuickMatch = () => {
    console.log('Partida Rápida');
    // TODO: Implementar lógica de partida rápida
  };

  const handleCreateRoom = () => {
    console.log('Criar Sala');
    // TODO: Implementar lógica de criar sala
  };

  const handleJoinRoom = () => {
    console.log('Procurar Sala');
    // TODO: Implementar lógica de procurar sala
  };

  return (
    <div className="homepage">
      <div className="background-overlay"></div>
      
      <div className="content">
        <div className="logo-container">
          <img src={logo} alt="CineBattle" className="logo" />
        </div>

        <div className="menu-options">
          <button className="menu-button" onClick={handleQuickMatch}>
            <div className="button-icon">⚡</div>
            <span className="button-text">PARTIDA RÁPIDA</span>
          </button>

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
    </div>
  );
}

export default HomePage;
