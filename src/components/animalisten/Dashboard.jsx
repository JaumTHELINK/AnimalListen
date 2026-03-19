import { FileText, Plus, Calendar, User, PawPrint, ChevronRight, Clock, AlertCircle, Users } from 'lucide-react';

export default function Dashboard({ prontuarios, onNavigate, onSelectProntuario }) {
  const abertos = prontuarios.filter((p) => p.status === 'incompleto');
  const hoje = prontuarios.filter(p => {
    const d = new Date(p.data_atendimento);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Visão geral e atalhos rápidos</p>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon blue"><FileText size={22} /></div>
          <div>
            <div className="stat-value">{prontuarios.length}</div>
            <div className="stat-label">Prontuários</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Clock size={22} /></div>
          <div>
            <div className="stat-value">{abertos.length}</div>
            <div className="stat-label">Em Aberto</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Calendar size={22} /></div>
          <div>
            <div className="stat-value">{hoje.length}</div>
            <div className="stat-label">Hoje</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><PawPrint size={22} /></div>
          <div>
            <div className="stat-value">{new Set(prontuarios.map(p => p.animal_nome)).size}</div>
            <div className="stat-label">Pacientes</div>
          </div>
        </div>
      </div>

      {/* Atalhos */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Atalhos Rápidos</h3>
      <div className="grid-3 mb-4">
        <div className="card card-clickable" onClick={() => onNavigate('prontuario-novo')} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="stat-icon blue"><Plus size={22} /></div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Novo Prontuário</h4>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Iniciar um atendimento</p>
          </div>
        </div>
        <div className="card card-clickable" onClick={() => onNavigate('tutores')} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="stat-icon green"><Users size={22} /></div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Novo Tutor</h4>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cadastrar tutor e animais</p>
          </div>
        </div>
      </div>

      {/* Prontuários em aberto */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={16} /> Prontuários em Aberto
      </h3>

      {abertos.length > 0 ? (
        <div className="grid-3">
          {abertos.map((p) => (
            <div
              key={p.id}
              className="card card-clickable animate-slide"
              onClick={() => onSelectProntuario(p)}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="card-avatar">
                    <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.animal_nome || 'Sem nome'}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>#{p.numero_prontuario}</p>
                  </div>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ margin: '12px 0', padding: '10px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Tutor:</strong> {p.tutor_nome || '—'}
                </p>
                {p.queixa_principal && (
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                    <strong>Queixa:</strong> {p.queixa_principal}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="tag tag-yellow">Incompleto</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(p.data_atendimento)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FileText size={48} />
          <h3>Nenhum prontuário em aberto</h3>
          <p>Todos os prontuários estão finalizados.</p>
        </div>
      )}
    </div>
  );
}
