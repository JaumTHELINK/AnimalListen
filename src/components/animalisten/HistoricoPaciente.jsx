import { useState } from 'react';
import { Search, FileText, User, Calendar, ChevronRight, PawPrint, CreditCard } from 'lucide-react';

export default function HistoricoPaciente({ prontuarios, onSelectProntuario }) {
  const [search, setSearch] = useState('');

  // Group prontuarios by CPF
  const grouped = {};
  prontuarios.forEach((p) => {
    const cpf = p.tutor_cpf || 'Sem CPF';
    if (!grouped[cpf]) {
      grouped[cpf] = {
        tutor_nome: p.tutor_nome,
        tutor_cpf: cpf,
        prontuarios: [],
      };
    }
    grouped[cpf].prontuarios.push(p);
  });

  // Filter by search
  const filteredGroups = Object.values(grouped).filter((g) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return (
      g.tutor_cpf.includes(term) ||
      g.tutor_nome.toLowerCase().includes(term) ||
      g.prontuarios.some((p) => p.animal_nome.toLowerCase().includes(term))
    );
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Histórico do Paciente</h2>
        <p>Consulte prontuários por CPF do tutor</p>
      </div>

      {/* Search */}
      <div className="card mb-4" style={{ padding: '12px 20px' }}>
        <div className="flex items-center gap-3">
          <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por CPF, nome do tutor ou nome do animal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', padding: '8px 0', boxShadow: 'none' }}
          />
        </div>
      </div>

      {/* Groups */}
      <div className="historico-groups">
        {filteredGroups.map((group) => (
          <div key={group.tutor_cpf} className="card mb-4">
            {/* Group Header */}
            <div className="historico-group-header">
              <div className="flex items-center gap-3">
                <div className="historico-avatar">
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>
                    {group.tutor_nome}
                  </h3>
                  <div className="flex items-center gap-2">
                    <CreditCard size={12} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                      {group.tutor_cpf}
                    </span>
                  </div>
                </div>
              </div>
              <span className="tag tag-blue">
                {group.prontuarios.length} {group.prontuarios.length === 1 ? 'prontuário' : 'prontuários'}
              </span>
            </div>

            {/* Prontuário list */}
            <div className="historico-list">
              {group.prontuarios
                .sort((a, b) => new Date(b.data_atendimento) - new Date(a.data_atendimento))
                .map((p) => (
                  <div
                    key={p.id}
                    className="historico-item"
                    onClick={() => onSelectProntuario(p)}
                  >
                    <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                      <div className="historico-item-icon">
                        <PawPrint size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center gap-2 mb-1" style={{ flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.animal_nome}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {p.animal_especie} • {p.animal_raca}
                          </span>
                        </div>
                        <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                          {p.queixa_principal}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                      <div className="historico-item-date">
                        <Calendar size={12} />
                        <span>{formatDate(p.data_atendimento)}</span>
                      </div>
                      <div className="historico-item-id">
                        <FileText size={12} />
                        <span>#{p.numero_prontuario}</span>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="empty-state">
          <Search size={48} />
          <h3>Nenhum resultado encontrado</h3>
          <p>Tente buscar com outro CPF ou nome.</p>
        </div>
      )}
    </div>
  );
}
