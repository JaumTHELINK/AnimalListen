import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import Login from '../components/animalisten/Login';
import AlterarSenha from '../components/animalisten/AlterarSenha';
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
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProntuario, setSelectedProntuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const assinanteId = user?.assinante_id;

  const {
    prontuarios,
    isLoading: loadingProntuarios,
    saveProntuario,
    deleteProntuario,
  } = useProntuarios(assinanteId);

  const {
    internacoes,
    isLoading: loadingInternacoes,
    addInternacao,
    updateStatus,
    updatePaciente,
    addRegistro,
    updateRegistro,
    deleteRegistro,
  } = useInternacoes(assinanteId);

  const {
    tutores,
    isLoading: loadingTutores,
    saveTutor,
    deleteTutor,
    savePaciente,
    deletePaciente,
  } = useTutores(assinanteId);

  // Check existing session on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setCheckingSession(false);
        return;
      }
      if (session?.user && !user) {
        // Restore session
        const { data: assinante } = await supabase
          .from('assinantes')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (assinante && assinante.status === 'ativo') {
          setUser({
            id: session.user.id,
            nome: assinante.nome,
            email: assinante.email,
            crmv: assinante.crmv,
            assinante_id: assinante.id,
            senha_alterada: assinante.senha_alterada,
          });
        }
      }
      setCheckingSession(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: assinante } = await supabase
          .from('assinantes')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (assinante && assinante.status === 'ativo') {
          setUser({
            id: session.user.id,
            nome: assinante.nome,
            email: assinante.email,
            crmv: assinante.crmv,
            assinante_id: assinante.id,
            senha_alterada: assinante.senha_alterada,
          });
        }
      }
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('dashboard');
    setSelectedProntuario(null);
  };

  const handlePasswordChanged = () => {
    setUser((prev) => ({ ...prev, senha_alterada: true }));
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

  if (checkingSession) {
    return (
      <div className="login-page">
        <div className="empty-state">
          <div className="spinner" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Force password change on first login
  if (!user.senha_alterada) {
    return <AlterarSenha onSuccess={handlePasswordChanged} />;
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
            onSelectProntuario={handleSelectProntuario}
            onDeleteProntuario={deleteProntuario}
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
