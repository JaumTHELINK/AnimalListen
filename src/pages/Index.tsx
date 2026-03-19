import { useState } from 'react';
import Login from '../components/animalisten/Login';
import Sidebar from '../components/animalisten/Sidebar';
import Dashboard from '../components/animalisten/Dashboard';
import Prontuario from '../components/animalisten/Prontuario';
import ProntuarioHub from '../components/animalisten/ProntuarioHub';
import Internacao from '../components/animalisten/Internacao';
import HistoricoPaciente from '../components/animalisten/HistoricoPaciente';
import CadastroTutor from '../components/animalisten/CadastroTutor';
import Configuracoes from '../components/animalisten/Configuracoes';
import { useProntuarios } from '../hooks/useProntuarios';
import { useInternacoes } from '../hooks/useInternacoes';
import { useTutores } from '../hooks/useTutores';

function Index() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProntuario, setSelectedProntuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    prontuarios,
    isLoading: loadingProntuarios,
    saveProntuario,
    deleteProntuario,
  } = useProntuarios();

  const {
    internacoes,
    isLoading: loadingInternacoes,
    addInternacao,
    updateStatus,
    updatePaciente,
    addRegistro,
    updateRegistro,
    deleteRegistro,
  } = useInternacoes();

  const {
    tutores,
    isLoading: loadingTutores,
    saveTutor,
    deleteTutor,
    savePaciente,
    deletePaciente,
  } = useTutores();

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
    setSelectedProntuario(null);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedProntuario(null);
    setSidebarOpen(false);
  };

  const handleSelectProntuario = (prontuario) => {
    setSelectedProntuario(prontuario);
    setCurrentPage('prontuario');
    setSidebarOpen(false);
  };

  const handleSaveProntuario = async (prontuarioData) => {
    await saveProntuario(prontuarioData);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const isLoading = loadingProntuarios || loadingInternacoes || loadingTutores;

  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="empty-state">
          <div className="spinner" />
          <p>Carregando dados...</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            prontuarios={prontuarios}
            onNavigate={handleNavigate}
            onSelectProntuario={handleSelectProntuario}
          />
        );
      case 'tutores':
        return (
          <CadastroTutor
            tutores={tutores}
            onSaveTutor={saveTutor}
            onDeleteTutor={deleteTutor}
            onSavePaciente={savePaciente}
            onDeletePaciente={deletePaciente}
          />
        );
      case 'prontuario-hub':
        return (
          <ProntuarioHub
            prontuarios={prontuarios}
            onNavigate={handleNavigate}
            onSelectProntuario={handleSelectProntuario}
          />
        );
      case 'prontuario-novo':
      case 'prontuario':
        return (
          <Prontuario
            prontuario={selectedProntuario}
            onBack={() => {
              setSelectedProntuario(null);
              setCurrentPage('prontuario-hub');
            }}
            onSave={handleSaveProntuario}
          />
        );
      case 'internacao':
        return (
          <Internacao
            internacoes={internacoes}
            onAddInternacao={addInternacao}
            onUpdateStatus={updateStatus}
            onUpdatePaciente={updatePaciente}
            onAddRegistro={addRegistro}
            onUpdateRegistro={updateRegistro}
            onDeleteRegistro={deleteRegistro}
          />
        );
      case 'historico':
        return (
          <HistoricoPaciente
            prontuarios={prontuarios}
            onSelectProntuario={handleSelectProntuario}
          />
        );
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return (
          <Dashboard
            prontuarios={prontuarios}
            onNavigate={handleNavigate}
            onSelectProntuario={handleSelectProntuario}
          />
        );
    }
  };

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {renderPage()}
      </main>
    </div>
  );
}

export default Index;
