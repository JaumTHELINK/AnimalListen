import { useState } from 'react';
import { useAdminAuth, usePlanos, useAssinantes } from '../hooks/useAdmin';
import AdminLogin from '../components/admin/AdminLogin';
import AdminPlanos from '../components/admin/AdminPlanos';
import AdminAssinantes from '../components/admin/AdminAssinantes';
import { Shield, Package, Users, LogOut, LayoutDashboard } from 'lucide-react';

export default function Admin() {
  const { adminUser, loading, login, logout } = useAdminAuth();
  const [tab, setTab] = useState('assinantes');

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Verificando acesso...</p>
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Shield size={24} />
          <h2>Admin</h2>
        </div>
        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${tab === 'assinantes' ? 'active' : ''}`}
            onClick={() => setTab('assinantes')}
          >
            <Users size={18} />
            Assinantes
          </button>
          <button
            className={`admin-nav-item ${tab === 'planos' ? 'active' : ''}`}
            onClick={() => setTab('planos')}
          >
            <Package size={18} />
            Planos
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          <a href="/" className="admin-nav-item">
            <LayoutDashboard size={18} />
            Voltar ao Sistema
          </a>
          <button className="admin-nav-item logout" onClick={logout}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
      <main className="admin-main">
        {tab === 'planos' && <AdminPlanos />}
        {tab === 'assinantes' && <AdminAssinantes />}
      </main>
    </div>
  );
}
