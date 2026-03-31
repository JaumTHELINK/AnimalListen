import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sidebar from '@/components/Sidebar';
import LoginScreen from '@/pages/LoginScreen';
import DashboardGeral from '@/pages/DashboardGeral';
import TutoresPage from '@/pages/TutoresPage';
import AnimaisPage from '@/pages/AnimaisPage';
import AnimalDetailsPage from '@/pages/AnimalDetailsPage';
import TutorDetailsPage from '@/pages/TutorDetailsPage';
import TriagemPage from '@/pages/TriagemPage';
import NovoProntuarioPage from '@/pages/NovoProntuarioPage';
import InternacoesPage from '@/pages/InternacoesPage';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

const MainApp = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileSidebar, setMobileSidebar] = useState(false);

  if (loading) {
    return (
      <div className="login-screen" style={{ background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderPage = () => {
    if (currentPage.startsWith('novo-prontuario')) {
      const parts = currentPage.split('-');
      const triagemId = parts.length > 2 ? parts[2] : null;
      return <NovoProntuarioPage triagemId={triagemId} setCurrentPage={setCurrentPage} />;
    }

    if (currentPage.startsWith('animais-novo-')) {
      const parts = currentPage.split('-');
      const tutorId = parts.length > 2 ? parts[2] : null;
      return <AnimaisPage setCurrentPage={setCurrentPage} autoOpenNovoModalWithTutorId={tutorId} />;
    }

    if (currentPage.startsWith('animal-detalhes-')) {
      const animalId = currentPage.replace('animal-detalhes-', '');
      return <AnimalDetailsPage animalId={animalId} setCurrentPage={setCurrentPage} />;
    }

    if (currentPage.startsWith('tutor-detalhes-')) {
      const tutorId = currentPage.replace('tutor-detalhes-', '');
      return <TutorDetailsPage tutorId={tutorId} setCurrentPage={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardGeral setCurrentPage={setCurrentPage} />;
      case 'tutores':
        return <TutoresPage setCurrentPage={setCurrentPage} />;
      case 'animais':
        return <AnimaisPage setCurrentPage={setCurrentPage} />;
      case 'triagem':
        return <TriagemPage setCurrentPage={setCurrentPage} mode="nova" />;
      case 'triagens-pendentes':
        return <TriagemPage setCurrentPage={setCurrentPage} mode="fila" />;
      case 'prontuarios':
        return <NovoProntuarioPage triagemId={null} setCurrentPage={setCurrentPage} />;
      case 'internacoes':
        return <InternacoesPage />;
      default:
        return <div className="page-container"><h1>Página em desenvolvimento</h1></div>;
    }
  };

  return (
    <div className="app-container">
      {mobileSidebar && <div className="sidebar-overlay" onClick={() => setMobileSidebar(false)} />}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={(page) => { setCurrentPage(page); setMobileSidebar(false); }}
        mobileOpen={mobileSidebar}
      />
      <main className="main-content">
        <div className="mobile-top-bar">
          <button className="mobile-menu-btn" onClick={() => setMobileSidebar(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>
          <span className="mobile-top-logo">ApexVet</span>
        </div>
        {renderPage()}
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<MainApp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
