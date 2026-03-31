import { useState } from 'react';
import { Activity, Users, PawPrint as Paw, AlertCircle, FileText, Bed, LogOut, ListOrdered, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate, user, onLogout, isOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'tutores', label: 'Tutores', icon: Users },
    { id: 'animais', label: 'Animais', icon: Paw },
    { id: 'triagem', label: 'Nova Triagem', icon: AlertCircle },
    { id: 'triagens-pendentes', label: 'Fila de Triagens', icon: ListOrdered },
    { id: 'prontuario-hub', label: 'Prontuários', icon: FileText },
    { id: 'internacao', label: 'Internações', icon: Bed },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'mobile-open' : ''}`}>
      <button onClick={() => setCollapsed(!collapsed)} className="sidebar-toggle-arrow" aria-label="Expandir ou recolher sidebar">
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Paw className={`logo-icon ${collapsed ? 'paw-closed' : 'paw-open'}`} />
          {!collapsed && <span>AnimalListen</span>}
        </div>
      </div>

      <div className="sidebar-user">
        {!collapsed && user && (
          <>
            <div className="user-avatar">
              {user.nome ? user.nome[0] : 'V'}
            </div>
            <div className="user-info">
              <div className="user-name">{user.nome}</div>
              <div className="user-role">{user.crmv || 'Veterinário'}</div>
            </div>
          </>
        )}
      </div>

      <nav className="sidebar-menu">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => { onNavigate(item.id); if (onClose) onClose(); }}
            className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="menu-item logout">
          <LogOut size={20} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
}
