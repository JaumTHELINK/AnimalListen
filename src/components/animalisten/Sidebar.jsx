import { LayoutDashboard, FileText, Hospital, LogOut, History, Users, X } from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate, user, onLogout, isOpen, onClose }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tutores', label: 'Tutores', icon: Users },
    { id: 'prontuario-hub', label: 'Prontuários', icon: FileText },
    { id: 'internacao', label: 'Internações', icon: Hospital },
    { id: 'historico', label: 'Histórico', icon: History },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <img src="/logo.png" alt="AnimaListen" />
        <div>
          <h1>AnimaListen</h1>
          <span>v2.0</span>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Fechar menu">
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.nome?.charAt(0) || 'V'}
          </div>
          <div className="user-info-text">
            <h4>{user?.nome || 'Veterinário'}</h4>
            <p>{user?.crmv || 'CRMV'}</p>
          </div>
        </div>
        <button className="nav-item mt-2" onClick={onLogout} style={{ color: '#ef4444' }}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
