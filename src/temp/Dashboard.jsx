import { useState } from 'react';
import { FileText, Search, Plus, Calendar, User, PawPrint, ChevronRight } from 'lucide-react';

export default function Dashboard({ prontuarios, onNavigate, onSelectProntuario }) {
  const [search, setSearch] = useState('');

  const filtered = prontuarios.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.animal_nome.toLowerCase().includes(term) ||
      p.tutor_nome.toLowerCase().includes(term) ||
      p.queixa_principal.toLowerCase().includes(term) ||
      (p.tutor_cpf && p.tutor_cpf.includes(term))
    );
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="animate-fade">
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>Dashboard</h2>
          <p>Visão geral dos prontuários e atendimentos</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('prontuario')}>
          <Plus size={18} />
          <span className="btn-label">Novo Atendimento</span>
        </button>
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
          <div className="stat-icon green"><PawPrint size={22} /></div>
          <div>
            <div className="stat-value">{new Set(prontuarios.map(p => p.animal_nome)).size}</div>
            <div className="stat-label">Pacientes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Calendar size={22} /></div>
          <div>
            <div className="stat-value">{prontuarios.filter(p => {
              const d = new Date(p.data_atendimento);
              const today = new Date();
              return d.toDateString() === today.toDateString();
            }).length}</div>
            <div className="stat-label">Hoje</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><User size={22} /></div>
          <div>
            <div className="stat-value">{new Set(prontuarios.map(p => p.tutor_cpf)).size}</div>
            <div className="stat-label">Tutores</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-4" style={{ padding: '12px 20px' }}>
        <div className="flex items-center gap-3">
          <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por animal, tutor, CPF ou queixa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', padding: '8px 0', boxShadow: 'none' }}
          />
        </div>
      </div>

      {/* Prontuários List */}
      <div className="grid-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="card card-clickable animate-slide"
            onClick={() => onSelectProntuario(p)}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="card-avatar">
                  <PawPrint size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.animal_nome}</h4>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {p.animal_especie} • {p.animal_raca}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div style={{ margin: '12px 0', padding: '10px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <strong>Tutor:</strong> {p.tutor_nome}
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                <strong>Queixa:</strong> {p.queixa_principal}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {p.sintomas.slice(0, 2).map((s, i) => (
                  <span key={i} className="tag tag-red">{s}</span>
                ))}
                {p.sintomas.length > 2 && (
                  <span className="tag tag-gray">+{p.sintomas.length - 2}</span>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {formatDate(p.data_atendimento)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <FileText size={48} />
          <h3>Nenhum prontuário encontrado</h3>
          <p>Tente buscar com outros termos ou crie um novo atendimento.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('prontuario')}>
            <Plus size={18} />
            Novo Atendimento
          </button>
        </div>
      )}
    </div>
  );
}
