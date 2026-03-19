import { useState } from 'react';
import Login from '../components/animalisten/Login';
import Sidebar from '../components/animalisten/Sidebar';
import Dashboard from '../components/animalisten/Dashboard';
import Prontuario from '../components/animalisten/Prontuario';
import Internacao from '../components/animalisten/Internacao';
import HistoricoPaciente from '../components/animalisten/HistoricoPaciente';
import { mockProntuarios, mockInternacoes } from '../data/mockData';

function Index() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProntuario, setSelectedProntuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [prontuarios, setProntuarios] = useState(mockProntuarios);
  const [internacoes, setInternacoes] = useState(mockInternacoes);

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

  const handleSaveProntuario = (updatedProntuario) => {
    setProntuarios((prev) => {
      const exists = prev.find((p) => p.id === updatedProntuario.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedProntuario.id ? updatedProntuario : p));
      }
      return [updatedProntuario, ...prev];
    });
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            prontuarios={prontuarios}
            onNavigate={handleNavigate}
            onSelectProntuario={handleSelectProntuario}
          />
        );
      case 'prontuario':
        return (
          <Prontuario
            prontuario={selectedProntuario}
            onBack={() => {
              setSelectedProntuario(null);
              setCurrentPage('dashboard');
            }}
            onSave={handleSaveProntuario}
          />
        );
      case 'internacao':
        return (
          <Internacao
            internacoes={internacoes}
            setInternacoes={setInternacoes}
          />
        );
      case 'historico':
        return (
          <HistoricoPaciente
            prontuarios={prontuarios}
            onSelectProntuario={handleSelectProntuario}
          />
        );
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
