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
import AnimaisPage from '../components/animalisten/AnimaisPage';
import TriagemPage from '../components/animalisten/TriagemPage';
import { useProntuarios } from '../hooks/useProntuarios';
import { useInternacoes } from '../hooks/useInternacoes';
import { useTutores } from '../hooks/useTutores';
import { useTriagens } from '../hooks/useTriagens';
import { Menu } from 'lucide-react';

function Index() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProntuario, setSelectedProntuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const assinanteId = user?.assinante_id;

  const { prontuarios, isLoading: loadingProntuarios, saveProntuario, deleteProntuario } = useProntuarios(assinanteId);
  const { internacoes, isLoading: loadingInternacoes, addInternacao, updateStatus, updatePaciente, addRegistro, updateRegistro, deleteRegistro } = useInternacoes(assinanteId);
  const { tutores, isLoading: loadingTutores, saveTutor, deleteTutor, savePaciente, deletePaciente } = useTutores(assinanteId);
  const { triagens, isLoading: loadingTriagens, addTriagem, markAtendida } = useTriagens(assinanteId);

  useEffect(() => {
    let mounted = true;
    const restoreUser = async (authUser) => {
      try {
        const { data: assinante } = await supabase.from('assinantes').select('*').eq('user_id', authUser.id).maybeSingle();
        if (mounted && assinante && assinante.status === 'ativo') {
          setUser({ id: authUser.id, nome: assinante.nome, email: assinante.email, crmv: assinante.crmv, assinante_id: assinante.id, senha_alterada: assinante.senha_alterada });
        }
      } catch {}
      if (mounted) setCheckingSession(false);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { if (mounted) { setUser(null); setCheckingSession(false); } return; }
      if (session?.user && !user) restoreUser(session.user);
      else if (!session?.user && mounted) setCheckingSession(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) restoreUser(session.user);
      else if (mounted) setCheckingSession(false);
    }).catch(() => { if (mounted) setCheckingSession(false); });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setCurrentPage('dashboard'); setSelectedProntuario(null); };
  const handleNavigate = (page) => { setCurrentPage(page); setSelectedProntuario(null); setSidebarOpen(false); };
  const handleSelectProntuario = (p) => { setSelectedProntuario(p); setCurrentPage('prontuario'); setSidebarOpen(false); };

  if (checkingSession) return <div className="login-page"><div className="empty-state"><div className="spinner" /><p>Carregando...</p></div></div>;
  if (!user) return <Login onLogin={setUser} />;
  if (!user.senha_alterada) return <AlterarSenha onSuccess={() => setUser(prev => ({ ...prev, senha_alterada: true }))} />;

  const isLoading = loadingProntuarios || loadingInternacoes || loadingTutores || loadingTriagens;

  const renderPage = () => {
    if (isLoading) return <div className="empty-state"><div className="spinner" /><p>Carregando dados...</p></div>;

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard prontuarios={prontuarios} tutores={tutores} internacoes={internacoes} triagens={triagens} onNavigate={handleNavigate} onSelectProntuario={handleSelectProntuario} />;
      case 'tutores':
        return <CadastroTutor tutores={tutores} onSaveTutor={saveTutor} onDeleteTutor={deleteTutor} onSavePaciente={savePaciente} onDeletePaciente={deletePaciente} />;
      case 'animais':
        return <AnimaisPage tutores={tutores} onSavePaciente={savePaciente} onDeletePaciente={deletePaciente} onNavigate={handleNavigate} />;
      case 'triagem':
        return <TriagemPage mode="nova" tutores={tutores} triagens={triagens} onAddTriagem={addTriagem} onMarkAtendida={markAtendida} onNavigate={handleNavigate} />;
      case 'triagens-pendentes':
        return <TriagemPage mode="fila" tutores={tutores} triagens={triagens} onAddTriagem={addTriagem} onMarkAtendida={markAtendida} onNavigate={handleNavigate} />;
      case 'prontuario-hub':
        return <ProntuarioHub prontuarios={prontuarios} onNavigate={handleNavigate} onSelectProntuario={handleSelectProntuario} />;
      case 'prontuario-novo':
      case 'prontuario':
        return <Prontuario prontuario={selectedProntuario} onBack={() => { setSelectedProntuario(null); setCurrentPage('prontuario-hub'); }} onSave={saveProntuario} onSelectProntuario={handleSelectProntuario} onDeleteProntuario={deleteProntuario} />;
      case 'internacao':
        return <Internacao internacoes={internacoes} onAddInternacao={addInternacao} onUpdateStatus={updateStatus} onUpdatePaciente={updatePaciente} onAddRegistro={addRegistro} onUpdateRegistro={updateRegistro} onDeleteRegistro={deleteRegistro} />;
      case 'historico':
        return <HistoricoPaciente prontuarios={prontuarios} onSelectProntuario={handleSelectProntuario} />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard prontuarios={prontuarios} tutores={tutores} internacoes={internacoes} triagens={triagens} onNavigate={handleNavigate} onSelectProntuario={handleSelectProntuario} />;
    }
  };

  return (
    <div className="app-container">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} user={user} onLogout={handleLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <div className="mobile-top-bar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <Menu size={22} />
          </button>
          <span className="mobile-top-logo">AnimalListen</span>
        </div>
        {renderPage()}
      </main>
    </div>
  );
}

export default Index;
