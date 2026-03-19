import { useState } from 'react';
import { Plus, Clock, History, FileText, PawPrint, ChevronRight, Search, AlertCircle, XCircle } from 'lucide-react';

export default function ProntuarioHub({ prontuarios, onNavigate, onSelectProntuario }) {
  const [search, setSearch] = useState('');

  const abertos = prontuarios.filter((p) => p.status === 'incompleto');
  const completos = prontuarios.filter((p) => p.status === 'completo');
  const cancelados = prontuarios.filter((p) => p.status === 'cancelado');

  const [tab, setTab] = useState('abertos');

  const list = tab === 'abertos' ? abertos : tab === 'cancelados' ? cancelados : completos;

  const filtered = list.filter((p) => {
    const term = search.toLowerCase();
    return (
      (p.animal_nome || '').toLowerCase().includes(term) ||
      (p.tutor_nome || '').toLowerCase().includes(term) ||
      (p.queixa_principal || '').toLowerCase().includes(term) ||
      (p.numero_prontuario || '').toLowerCase().includes(term)
    );
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
        <h2>Prontuários</h2>
        <p>Gerencie prontuários clínicos</p>
      </div>

      {/* Action buttons */}
      <div className="stats-grid mb-4">
        <div
          className="stat-card card-clickable"
          onClick={() => onNavigate('prontuario-novo')}
        >
          <div className="stat-icon blue"><Plus size={22} /></div>
          <div>
            <div className="stat-value" style={{ fontSize: '1rem' }}>Novo Prontuário</div>
            <div className="stat-label">Criar atendimento</div>
          </div>
        </div>
        <div
          className="stat-card card-clickable"
          onClick={() => setTab('abertos')}
          style={tab === 'abertos' ? { borderColor: 'var(--warning)', borderWidth: '2px' } : {}}
        >
          <div className="stat-icon yellow"><Clock size={22} /></div>
          <div>
            <div className="stat-value">{abertos.length}</div>
            <div className="stat-label">Em Aberto</div>
          </div>
        </div>
        <div
          className="stat-card card-clickable"
          onClick={() => setTab('historico')}
          style={tab === 'historico' ? { borderColor: 'var(--primary)', borderWidth: '2px' } : {}}
        >
          <div className="stat-icon green"><History size={22} /></div>
          <div>
            <div className="stat-value">{completos.length}</div>
            <div className="stat-label">Histórico</div>
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
            placeholder="Buscar por animal, tutor, nº prontuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', padding: '8px 0', boxShadow: 'none' }}
          />
        </div>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {tab === 'abertos' ? (
          <><Clock size={16} /> Prontuários em Aberto</>
        ) : tab === 'cancelados' ? (
          <><XCircle size={16} style={{ color: '#dc2626' }} /> Prontuários Cancelados</>
        ) : (
          <><History size={16} /> Histórico de Prontuários</>
        )}
      </h3>

      {/* List */}
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
                  {p.status === 'incompleto' ? (
                    <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
                  ) : (
                    <PawPrint size={18} style={{ color: 'var(--primary)' }} />
                  )}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.animal_nome || 'Sem nome'}</h4>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    #{p.numero_prontuario}
                  </p>
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
              {p.status === 'incompleto' ? (
                <span className="tag tag-yellow">Incompleto</span>
              ) : (
                <span className="tag tag-green">Completo</span>
              )}
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
          <h3>{tab === 'abertos' ? 'Nenhum prontuário em aberto' : 'Nenhum prontuário no histórico'}</h3>
          <p>{tab === 'abertos' ? 'Prontuários salvos como incompletos aparecerão aqui.' : 'Prontuários finalizados aparecerão aqui.'}</p>
        </div>
      )}
    </div>
  );
}
