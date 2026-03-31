import { useState } from 'react';
import { Plus, AlertCircle, Clock, CheckCircle, AlertTriangle, PawPrint, User, ClipboardList, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const PRIORITY_CONFIG = {
  leve: { label: 'Leve', emoji: '🟢', bg: '#dcfce7', color: '#166534', icon: CheckCircle },
  moderado: { label: 'Atenção', emoji: '🟡', bg: '#fef3c7', color: '#92400e', icon: AlertCircle },
  urgencia: { label: 'Urgente', emoji: '🟠', bg: '#ffedd5', color: '#c2410c', icon: Clock },
  emergencia_maxima: { label: 'Emergência', emoji: '🔴', bg: '#fee2e2', color: '#991b1b', icon: AlertTriangle },
};

export default function TriagemPage({ mode, tutores, triagens, onAddTriagem, onMarkAtendida, onNavigate }) {
  const [showModal, setShowModal] = useState(mode === 'nova');
  const [form, setForm] = useState({ paciente_id: '', queixa_principal: '', prioridade: 'leve', aviso_profissional: '' });
  const [selectedTutorId, setSelectedTutorId] = useState('');

  const allPacientes = (tutores || []).flatMap(t => (t.pacientes || []).map(p => ({ ...p, tutor: t })));
  const filteredPacientes = selectedTutorId ? allPacientes.filter(p => p.tutor_id === selectedTutorId) : allPacientes;

  const pendentes = (triagens || []).filter(t => !t.atendida).sort((a, b) => {
    const order = { emergencia_maxima: 0, urgencia: 1, moderado: 2, leve: 3 };
    return (order[a.prioridade] ?? 9) - (order[b.prioridade] ?? 9);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.paciente_id || !form.queixa_principal) { toast.error('Preencha paciente e queixa'); return; }
    try {
      await onAddTriagem(form);
      toast.success('Triagem encaminhada!');
      setShowModal(false);
      setForm({ paciente_id: '', queixa_principal: '', prioridade: 'leve', aviso_profissional: '' });
    } catch (err) { toast.error(err.message); }
  };

  if (mode === 'nova' || showModal) {
    return (
      <div className="page-container">
        <h1>Nova Triagem</h1>
        <div className="card" style={{ padding: '24px', maxWidth: '700px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tutor (filtro opcional)</label>
              <select className="pront-input" value={selectedTutorId} onChange={e => { setSelectedTutorId(e.target.value); setForm({ ...form, paciente_id: '' }); }}>
                <option value="">Todos os tutores</option>
                {(tutores || []).map(t => <option key={t.id} value={t.id}>{t.nome} {t.cpf ? `(${t.cpf})` : ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Paciente *</label>
              <select className="pront-input" value={form.paciente_id} onChange={e => setForm({ ...form, paciente_id: e.target.value })} required>
                <option value="">Selecione o paciente</option>
                {filteredPacientes.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.especie}) - Tutor: {p.tutor?.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Queixa Principal *</label>
              <textarea className="pront-input" rows={3} value={form.queixa_principal} onChange={e => setForm({ ...form, queixa_principal: e.target.value })} required placeholder="Motivo da visita..." />
            </div>
            <div className="form-group">
              <label>Aviso ao profissional</label>
              <textarea className="pront-input" rows={2} value={form.aviso_profissional} onChange={e => setForm({ ...form, aviso_profissional: e.target.value })} placeholder="Ex: animal agressivo..." />
            </div>
            <div className="form-group">
              <label>Prioridade *</label>
              <select className="pront-input" value={form.prioridade} onChange={e => setForm({ ...form, prioridade: e.target.value })}>
                <option value="leve">🟢 Leve</option>
                <option value="moderado">🟡 Atenção</option>
                <option value="urgencia">🟠 Urgente</option>
                <option value="emergencia_maxima">🔴 Emergência</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {mode !== 'nova' && <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>}
              <button type="submit" className="btn btn-primary">Encaminhar Paciente</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Fila de Triagens</h1>
        <button className="btn btn-primary btn-pill" onClick={() => setShowModal(true)}><Plus size={18} /> Nova Triagem</button>
      </div>

      {pendentes.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={48} color="#10b981" />
          <p>Nenhuma triagem pendente</p>
        </div>
      ) : (
        <div className="triagem-queue">
          {pendentes.map(t => {
            const cfg = PRIORITY_CONFIG[t.prioridade] || PRIORITY_CONFIG.leve;
            const paciente = t.pacientes;
            const tutor = paciente?.tutores;
            return (
              <div key={t.id} className="triagem-card">
                <div className={`triagem-card-priority ${t.prioridade}`} />
                <div className="triagem-card-content">
                  <div className="triagem-card-header">
                    <span className="triagem-card-title">
                      <PawPrint size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      {paciente?.nome || 'Paciente'} ({paciente?.especie || '-'})
                    </span>
                    <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.emoji} {cfg.label}</span>
                  </div>
                  <div className="triagem-card-info">
                    <User size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Tutor: {tutor?.nome || '-'}
                  </div>
                  <div className="triagem-card-queixa">{t.queixa_principal}</div>
                  {t.aviso_profissional && (
                    <div className="alert alert-warning" style={{ marginTop: '8px', padding: '8px 12px', fontSize: '13px' }}>
                      <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {t.aviso_profissional}
                    </div>
                  )}
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}
                      onClick={() => { onMarkAtendida(t.id); onNavigate('prontuario-novo'); }}>
                      <ClipboardList size={14} /> Atender
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
