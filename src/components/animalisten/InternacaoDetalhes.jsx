import { useState, useRef } from 'react';
import {
  ArrowLeft, Plus, Heart, Thermometer, UtensilsCrossed, Pill,
  Droplets, FileText, PawPrint, Clock, X, Activity, Edit, Trash2, Check, Camera,
} from 'lucide-react';
import { statusLabels, statusClasses, tipoRegistroLabels } from '../data/mockData';

const iconComponents = {
  bpm: Heart,
  temperatura: Thermometer,
  alimentacao: UtensilsCrossed,
  medicacao: Pill,
  hidratacao: Droplets,
  evolucao: FileText,
};

const timelineColors = {
  bpm: 'red',
  temperatura: 'yellow',
  alimentacao: 'green',
  medicacao: '',
  hidratacao: '',
  evolucao: '',
};

export default function InternacaoDetalhes({
  internacao, onBack, onAddRegistro, onUpdateRegistro, onDeleteRegistro, onUpdateStatus, onUpdatePaciente
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPacienteModal, setShowEditPacienteModal] = useState(false);
  const [editingRegistroId, setEditingRegistroId] = useState(null);
  const [editRegistroData, setEditRegistroData] = useState({ tipo: '', valor: '', notas: '' });
  const [newRegistro, setNewRegistro] = useState({ tipo: 'bpm', valor: '', notas: '' });
  const [pacienteForm, setPacienteForm] = useState({});
  const photoInputRef = useRef(null);

  const handleAdd = () => {
    onAddRegistro({
      ...newRegistro,
      hora: new Date().toISOString(),
    });
    setNewRegistro({ tipo: 'bpm', valor: '', notas: '' });
    setShowAddModal(false);
  };

  const openEditPaciente = () => {
    setPacienteForm({
      animal_nome: internacao.animal_nome || '',
      animal_especie: internacao.animal_especie || '',
      animal_raca: internacao.animal_raca || '',
      animal_idade: internacao.animal_idade || '',
      animal_peso: internacao.animal_peso || '',
      animal_microchip: internacao.animal_microchip || '',
      tutor_nome: internacao.tutor_nome || '',
      tutor_cpf: internacao.tutor_cpf || '',
      tutor_telefone: internacao.tutor_telefone || '',
      foto: internacao.foto || null,
    });
    setShowEditPacienteModal(true);
  };

  const handleSavePaciente = () => {
    onUpdatePaciente({
      ...pacienteForm,
      animal_peso: parseFloat(pacienteForm.animal_peso) || 0,
    });
    setShowEditPacienteModal(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPacienteForm({ ...pacienteForm, foto: ev.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditRegistro = (reg) => {
    setEditingRegistroId(reg.id);
    setEditRegistroData({ tipo: reg.tipo, valor: reg.valor, notas: reg.notas || '' });
  };

  const confirmEditRegistro = () => {
    onUpdateRegistro(editingRegistroId, editRegistroData);
    setEditingRegistroId(null);
  };

  const cancelEditRegistro = () => {
    setEditingRegistroId(null);
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getLastReading = (tipo) => {
    const items = internacao.registros.filter((r) => r.tipo === tipo);
    return items.length > 0 ? items[items.length - 1] : null;
  };

  const sortedRegistros = [...internacao.registros].sort(
    (a, b) => new Date(b.hora) - new Date(a.hora)
  );

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header intern-detail-header">
        <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
          <button className="btn btn-ghost" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
            {internacao.foto ? (
              <img src={internacao.foto} alt={internacao.animal_nome} className="intern-detail-photo" />
            ) : (
              <div className="intern-detail-avatar">
                <PawPrint size={24} style={{ color: 'white' }} />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <h2 style={{ marginBottom: 0 }}>{internacao.animal_nome}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {internacao.animal_especie} • {internacao.animal_raca} • {internacao.animal_peso}kg •
                Internado em {new Date(internacao.data_internacao).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
        <div className="intern-detail-actions">
          <button className="btn btn-outline btn-sm" onClick={openEditPaciente}>
            <Edit size={14} />
            <span className="btn-label">Editar Paciente</span>
          </button>
          <select
            className="form-select"
            value={internacao.status}
            onChange={(e) => onUpdateStatus(e.target.value)}
            style={{ width: 'auto', padding: '8px 16px', fontWeight: 600 }}
          >
            <option value="estavel">🟢 Estável</option>
            <option value="critico">🔴 Crítico</option>
            <option value="observacao">🟡 Em Observação</option>
            <option value="alta">🔵 Alta</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span className="btn-label">Novo Registro</span>
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="card mb-4" style={{ padding: '16px 24px' }}>
        <div className="intern-info-grid">
          <div>
            <span className="form-label">Tutor</span>
            <p className="text-sm font-bold">{internacao.tutor_nome}</p>
          </div>
          <div>
            <span className="form-label">CPF</span>
            <p className="text-sm font-bold">{internacao.tutor_cpf || '—'}</p>
          </div>
          <div>
            <span className="form-label">Telefone</span>
            <p className="text-sm font-bold">{internacao.tutor_telefone}</p>
          </div>
          <div>
            <span className="form-label">Motivo</span>
            <p className="text-sm font-bold">{internacao.motivo}</p>
          </div>
          <div>
            <span className="form-label">Status</span>
            <span className={`badge ${statusClasses[internacao.status]}`}>
              {statusLabels[internacao.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="vitals-grid mb-4">
        {['bpm', 'temperatura', 'alimentacao', 'medicacao', 'hidratacao'].map((tipo) => {
          const last = getLastReading(tipo);
          const Icon = iconComponents[tipo];
          const colors = {
            bpm: { bg: '#fef2f2', icon: '#ef4444' },
            temperatura: { bg: '#fffbeb', icon: '#f59e0b' },
            alimentacao: { bg: '#f0fdf4', icon: '#22c55e' },
            medicacao: { bg: 'var(--primary-50)', icon: 'var(--primary)' },
            hidratacao: { bg: '#eff6ff', icon: '#3b82f6' },
          };

          return (
            <div key={tipo} className="card" style={{ padding: '16px' }}>
              <div className="flex items-center gap-2 mb-2">
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  background: colors[tipo].bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} style={{ color: colors[tipo].icon }} />
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {tipoRegistroLabels[tipo]}
                </span>
              </div>
              <div className="font-bold" style={{ fontSize: '1.3rem' }}>
                {last ? (tipo === 'temperatura' ? `${last.valor}°C` : last.valor) : '—'}
              </div>
              {last && (
                <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  {formatTime(last.hora)} • {last.notas || 'Sem notas'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Histórico de Registros</h3>
          </div>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {internacao.registros.length} registros
          </span>
        </div>

        {sortedRegistros.length > 0 ? (
          <div className="timeline">
            {sortedRegistros.map((reg) => {
              const Icon = iconComponents[reg.tipo];
              const isEditing = editingRegistroId === reg.id;

              return (
                <div key={reg.id} className={`timeline-item ${timelineColors[reg.tipo] || ''}`}>
                  <div className="timeline-time">{formatDateTime(reg.hora)}</div>
                  <div className="timeline-content">
                    {isEditing ? (
                      <div className="timeline-edit-form">
                        <div className="form-group" style={{ marginBottom: '8px' }}>
                          <input
                            className="form-input"
                            value={editRegistroData.valor}
                            onChange={(e) => setEditRegistroData({ ...editRegistroData, valor: e.target.value })}
                            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: '8px' }}>
                          <textarea
                            className="form-textarea"
                            rows={2}
                            value={editRegistroData.notas}
                            onChange={(e) => setEditRegistroData({ ...editRegistroData, notas: e.target.value })}
                            style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button className="btn btn-primary btn-sm" onClick={confirmEditRegistro}>
                            <Check size={12} /> Salvar
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={cancelEditRegistro}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon size={14} style={{ color: 'var(--primary)' }} />
                            <span className="font-bold text-sm">{tipoRegistroLabels[reg.tipo]}</span>
                            <span className="tag tag-blue">{reg.valor}</span>
                          </div>
                          <div className="timeline-actions">
                            <button
                              className="btn-icon-sm"
                              onClick={() => startEditRegistro(reg)}
                              title="Editar registro"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              className="btn-icon-sm btn-icon-danger"
                              onClick={() => onDeleteRegistro(reg.id)}
                              title="Excluir registro"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        {reg.notas && (
                          <p className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {reg.notas}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <Clock size={40} />
            <h3>Nenhum registro ainda</h3>
            <p>Adicione o primeiro registro de monitoramento.</p>
          </div>
        )}
      </div>

      {/* Modal Novo Registro */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Novo Registro</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Registro</label>
              <select
                className="form-select"
                value={newRegistro.tipo}
                onChange={(e) => setNewRegistro({ ...newRegistro, tipo: e.target.value })}
              >
                {Object.entries(tipoRegistroLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {newRegistro.tipo === 'bpm' ? 'BPM' :
                 newRegistro.tipo === 'temperatura' ? 'Temperatura (°C)' :
                 newRegistro.tipo === 'alimentacao' ? 'Comeu? (Sim/Não)' :
                 'Valor'}
              </label>
              {newRegistro.tipo === 'alimentacao' ? (
                <select
                  className="form-select"
                  value={newRegistro.valor}
                  onChange={(e) => setNewRegistro({ ...newRegistro, valor: e.target.value })}
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                  <option value="Parcial">Parcial</option>
                </select>
              ) : (
                <input
                  className="form-input"
                  type={['bpm', 'temperatura'].includes(newRegistro.tipo) ? 'number' : 'text'}
                  value={newRegistro.valor}
                  onChange={(e) => setNewRegistro({ ...newRegistro, valor: e.target.value })}
                  step={newRegistro.tipo === 'temperatura' ? '0.1' : undefined}
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notas / Observações</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={newRegistro.notas}
                onChange={(e) => setNewRegistro({ ...newRegistro, notas: e.target.value })}
              />
            </div>

            <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={handleAdd}
                disabled={!newRegistro.valor}
              >
                <Plus size={16} />
                Adicionar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Paciente */}
      {showEditPacienteModal && (
        <div className="modal-overlay" onClick={() => setShowEditPacienteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Dados do Paciente</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowEditPacienteModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Photo Edit */}
            <div className="form-group" style={{ textAlign: 'center' }}>
              <div
                className="photo-upload-area"
                onClick={() => photoInputRef.current?.click()}
              >
                {pacienteForm.foto ? (
                  <img src={pacienteForm.foto} alt="Foto" className="photo-preview" />
                ) : (
                  <>
                    <Camera size={28} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                      Adicionar foto
                    </span>
                  </>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              {pacienteForm.foto && (
                <button
                  className="btn btn-outline btn-sm mt-2"
                  onClick={() => setPacienteForm({ ...pacienteForm, foto: null })}
                >
                  Remover foto
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome do Animal</label>
                <input className="form-input" value={pacienteForm.animal_nome}
                  onChange={(e) => setPacienteForm({ ...pacienteForm, animal_nome: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Espécie</label>
                <input className="form-input" value={pacienteForm.animal_especie}
                  onChange={(e) => setPacienteForm({ ...pacienteForm, animal_especie: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Raça</label>
                <input className="form-input" value={pacienteForm.animal_raca}
                  onChange={(e) => setPacienteForm({ ...pacienteForm, animal_raca: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Idade</label>
                <input className="form-input" value={pacienteForm.animal_idade}
                  onChange={(e) => setPacienteForm({ ...pacienteForm, animal_idade: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Peso (kg)</label>
                <input type="number" className="form-input" value={pacienteForm.animal_peso}
                  onChange={(e) => setPacienteForm({ ...pacienteForm, animal_peso: e.target.value })}
                  step="0.1" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Microchip</label>
              <input className="form-input" value={pacienteForm.animal_microchip}
                onChange={(e) => setPacienteForm({ ...pacienteForm, animal_microchip: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome do Tutor</label>
                <input className="form-input" value={pacienteForm.tutor_nome}
                  onChange={(e) => setPacienteForm({ ...pacienteForm, tutor_nome: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">CPF do Tutor</label>
                <input className="form-input" value={pacienteForm.tutor_cpf}
                  onChange={(e) => setPacienteForm({ ...pacienteForm, tutor_cpf: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-input" value={pacienteForm.tutor_telefone}
                onChange={(e) => setPacienteForm({ ...pacienteForm, tutor_telefone: e.target.value })} />
            </div>

            <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-outline" onClick={() => setShowEditPacienteModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSavePaciente}>
                <Check size={16} />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
