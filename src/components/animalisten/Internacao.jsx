import { useState, useRef } from 'react';
import {
  Hospital, Plus, Heart, Thermometer, UtensilsCrossed, Pill,
  Droplets, FileText, PawPrint, Clock, AlertTriangle, Eye, X, Camera
} from 'lucide-react';
import { statusLabels, statusClasses, tipoRegistroLabels } from '../../data/mockData';
import InternacaoDetalhes from './InternacaoDetalhes';

export default function Internacao({
  internacoes, onAddInternacao, onUpdateStatus, onUpdatePaciente,
  onAddRegistro, onUpdateRegistro, onDeleteRegistro
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newForm, setNewForm] = useState({
    animal_nome: '', animal_especie: '', animal_raca: '', animal_idade: '',
    animal_peso: '', animal_microchip: '', tutor_nome: '', tutor_cpf: '', tutor_telefone: '',
    motivo: '', foto: null,
  });
  const fileInputRef = useRef(null);

  const selected = internacoes.find((i) => i.id === selectedId);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewForm({ ...newForm, foto: ev.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInternacao = async () => {
    const nova = {
      ...newForm,
      animal_peso: parseFloat(newForm.animal_peso) || 0,
      data_internacao: new Date().toISOString(),
      status: 'observacao',
    };
    await onAddInternacao(nova);
    setNewForm({
      animal_nome: '', animal_especie: '', animal_raca: '', animal_idade: '',
      animal_peso: '', animal_microchip: '', tutor_nome: '', tutor_cpf: '', tutor_telefone: '',
      motivo: '', foto: null,
    });
    setShowModal(false);
  };

  const handleAddRegistro = async (internacaoId, registro) => {
    await onAddRegistro({ internacao_id: internacaoId, registro });
  };

  const handleUpdateRegistro = async (internacaoId, registroId, updated) => {
    await onUpdateRegistro({ id: registroId, updates: updated });
  };

  const handleDeleteRegistro = async (internacaoId, registroId) => {
    await onDeleteRegistro(registroId);
  };

  const handleUpdateStatus = async (internacaoId, newStatus) => {
    await onUpdateStatus({ id: internacaoId, status: newStatus });
  };

  const handleUpdatePaciente = async (internacaoId, data) => {
    await onUpdatePaciente({ id: internacaoId, data });
  };

  const getLastReading = (registros, tipo) => {
    const items = (registros || []).filter((r) => r.tipo === tipo);
    return items.length > 0 ? items[items.length - 1] : null;
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (selected) {
    return (
      <InternacaoDetalhes
        internacao={selected}
        onBack={() => setSelectedId(null)}
        onAddRegistro={(reg) => handleAddRegistro(selected.id, reg)}
        onUpdateRegistro={(regId, data) => handleUpdateRegistro(selected.id, regId, data)}
        onDeleteRegistro={(regId) => handleDeleteRegistro(selected.id, regId)}
        onUpdateStatus={(status) => handleUpdateStatus(selected.id, status)}
        onUpdatePaciente={(data) => handleUpdatePaciente(selected.id, data)}
      />
    );
  }

  return (
    <div className="animate-fade">
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>Internações</h2>
          <p>Monitoramento de animais internados na clínica</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span className="btn-label">Nova Internação</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon blue"><Hospital size={22} /></div>
          <div>
            <div className="stat-value">{internacoes.length}</div>
            <div className="stat-label">Total Internados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Heart size={22} /></div>
          <div>
            <div className="stat-value">{internacoes.filter(i => i.status === 'estavel').length}</div>
            <div className="stat-label">Estáveis</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><AlertTriangle size={22} /></div>
          <div>
            <div className="stat-value">{internacoes.filter(i => i.status === 'critico').length}</div>
            <div className="stat-label">Críticos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Eye size={22} /></div>
          <div>
            <div className="stat-value">{internacoes.filter(i => i.status === 'observacao').length}</div>
            <div className="stat-label">Em Observação</div>
          </div>
        </div>
      </div>

      {/* Cards de Internação */}
      <div className="grid-2">
        {internacoes.map((intern) => {
          const lastBpm = getLastReading(intern.registros, 'bpm');
          const lastTemp = getLastReading(intern.registros, 'temperatura');
          const lastFood = getLastReading(intern.registros, 'alimentacao');

          return (
            <div
              key={intern.id}
              className="card card-clickable"
              onClick={() => setSelectedId(intern.id)}
              style={{ borderLeft: `4px solid ${intern.status === 'critico' ? '#ef4444' : intern.status === 'estavel' ? '#22c55e' : '#f59e0b'}` }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  {intern.foto ? (
                    <img
                      src={intern.foto}
                      alt={intern.animal_nome}
                      className="intern-card-photo"
                    />
                  ) : (
                    <div className="card-avatar">
                      <PawPrint size={20} style={{ color: 'var(--color-primary)' }} />
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontWeight: 700 }}>{intern.animal_nome}</h4>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {intern.animal_especie} • {intern.animal_raca} • {intern.animal_peso}kg
                    </p>
                  </div>
                </div>
                <span className={`badge ${statusClasses[intern.status]}`}>
                  {statusLabels[intern.status]}
                </span>
              </div>

              <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                <strong>Motivo:</strong> {intern.motivo}
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                <strong>Tutor:</strong> {intern.tutor_nome} • {intern.tutor_telefone}
              </p>

              {/* Últimos Sinais */}
              <div className="intern-vitals-mini">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart size={12} style={{ color: '#ef4444' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>BPM</span>
                  </div>
                  <span className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>
                    {lastBpm?.valor || '—'}
                  </span>
                  {lastBpm && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatTime(lastBpm.hora)}</p>}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Thermometer size={12} style={{ color: '#f59e0b' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Temp</span>
                  </div>
                  <span className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>
                    {lastTemp ? `${lastTemp.valor}°` : '—'}
                  </span>
                  {lastTemp && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatTime(lastTemp.hora)}</p>}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <UtensilsCrossed size={12} style={{ color: '#22c55e' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Comeu</span>
                  </div>
                  <span className="font-bold" style={{ fontSize: '1.1rem', color: lastFood?.valor === 'Sim' ? '#22c55e' : '#ef4444' }}>
                    {lastFood?.valor || '—'}
                  </span>
                  {lastFood && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatTime(lastFood.hora)}</p>}
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Internado em {new Date(intern.data_internacao).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                  {(intern.registros || []).length} registros →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {internacoes.length === 0 && (
        <div className="empty-state">
          <Hospital size={48} />
          <h3>Nenhum animal internado</h3>
          <p>Registre uma nova internação para começar o monitoramento.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Nova Internação
          </button>
        </div>
      )}

      {/* Modal Nova Internação */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova Internação</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Photo Upload */}
            <div className="form-group" style={{ textAlign: 'center' }}>
              <div
                className="photo-upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                {newForm.foto ? (
                  <img src={newForm.foto} alt="Foto do paciente" className="photo-preview" />
                ) : (
                  <>
                    <Camera size={28} style={{ color: 'var(--color-text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Foto do paciente
                    </span>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome do Animal *</label>
                <input className="form-input" value={newForm.animal_nome}
                  onChange={(e) => setNewForm({ ...newForm, animal_nome: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Espécie</label>
                <input className="form-input" value={newForm.animal_especie}
                  onChange={(e) => setNewForm({ ...newForm, animal_especie: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Raça</label>
                <input className="form-input" value={newForm.animal_raca}
                  onChange={(e) => setNewForm({ ...newForm, animal_raca: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Idade</label>
                <input className="form-input" value={newForm.animal_idade}
                  onChange={(e) => setNewForm({ ...newForm, animal_idade: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Peso (kg)</label>
                <input type="number" className="form-input" value={newForm.animal_peso}
                  onChange={(e) => setNewForm({ ...newForm, animal_peso: e.target.value })}
                  step="0.1" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Microchip</label>
              <input className="form-input" value={newForm.animal_microchip}
                onChange={(e) => setNewForm({ ...newForm, animal_microchip: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tutor</label>
                <input className="form-input" value={newForm.tutor_nome}
                  onChange={(e) => setNewForm({ ...newForm, tutor_nome: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">CPF do Tutor</label>
                <input className="form-input" value={newForm.tutor_cpf}
                  onChange={(e) => setNewForm({ ...newForm, tutor_cpf: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-input" value={newForm.tutor_telefone}
                onChange={(e) => setNewForm({ ...newForm, tutor_telefone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Motivo da Internação *</label>
              <textarea className="form-textarea" rows={3} value={newForm.motivo}
                onChange={(e) => setNewForm({ ...newForm, motivo: e.target.value })} />
            </div>

            <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={handleAddInternacao}
                disabled={!newForm.animal_nome || !newForm.motivo}
              >
                <Plus size={16} />
                Internar Animal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
