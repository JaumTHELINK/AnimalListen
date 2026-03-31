import React, { useState } from 'react';
import { Activity, Users, PawPrint as Paw, AlertCircle, FileText, Bed, LogOut, ListOrdered, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentPage, setCurrentPage, mobileOpen }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'tutores', label: 'Tutores', icon: Users },
    { id: 'animais', label: 'Animais', icon: Paw },
    { id: 'triagem', label: 'Nova Triagem', icon: AlertCircle },
    { id: 'triagens-pendentes', label: 'Fila de Triagens', icon: ListOrdered },
    { id: 'prontuarios', label: 'Prontuários', icon: FileText },
    { id: 'internacoes', label: 'Internações', icon: Bed }
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <button onClick={() => setCollapsed(!collapsed)} className="sidebar-toggle-arrow" aria-label="Expandir ou recolher sidebar">
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Paw className={`logo-icon ${collapsed ? 'paw-closed' : 'paw-open'}`} />
          {!collapsed && <span>ApexVet</span>}
        </div>
      </div>

      <div className="sidebar-user">
        {!collapsed && user && (
          <>
            <div className="user-avatar">
              {user.nome_completo ? user.nome_completo[0] : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user.nome_completo}</div>
              <div className="user-role">{user.perfil}</div>
            </div>
          </>
        )}
      </div>

      <nav className="sidebar-menu">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="menu-item logout">
          <LogOut size={20} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
