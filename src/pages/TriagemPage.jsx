import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { 
  Plus, AlertCircle, Clock, CheckCircle, MessageSquare, 
  PawPrint, User, AlertTriangle, ClipboardList, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiJson, apiRequest } from '../utils/api';

const PRIORITY_CONFIG = {
  leve: {
    colorLabel: 'Verde',
    label: 'Leve',
    description: 'Atendimento normal',
    emoji: '🟢',
    order: 1,
    icon: CheckCircle,
    bg: '#dcfce7',
    color: '#166534'
  },
  moderado: {
    colorLabel: 'Amarelo',
    label: 'Atenção',
    description: 'Requer observação mais próxima',
    emoji: '🟡',
    order: 2,
    icon: AlertCircle,
    bg: '#fef3c7',
    color: '#92400e'
  },
  urgencia: {
    colorLabel: 'Laranja',
    label: 'Urgente',
    description: 'Atendimento rápido',
    emoji: '🟠',
    order: 3,
    icon: Clock,
    bg: '#ffedd5',
    color: '#c2410c'
  },
  emergencia_maxima: {
    colorLabel: 'Vermelho',
    label: 'Emergência',
    description: 'Atendimento imediato',
    emoji: '🔴',
    order: 4,
    icon: AlertTriangle,
    bg: '#fee2e2',
    color: '#991b1b'
  }
};

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '52px',
    borderRadius: '10px',
    borderColor: state.isFocused ? '#7c9cff' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(124, 156, 255, 0.16)' : 'none',
    '&:hover': { borderColor: '#94a3b8' },
  }),
  menu: (base) => ({ ...base, zIndex: 30, overflow: 'hidden' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#eff6ff' : state.isSelected ? '#dbeafe' : 'white',
    color: '#1e293b',
    fontSize: '15px',
    cursor: 'pointer',
  }),
  placeholder: (base) => ({ ...base, color: '#94a3b8', fontSize: '16px' }),
  singleValue: (base) => ({ ...base, color: '#1e293b', fontWeight: 600, fontSize: '16px' }),
  input: (base) => ({ ...base, margin: 0, padding: 0, fontSize: '16px' }),
  valueContainer: (base) => ({ ...base, padding: '0 12px' }),
  indicatorSeparator: () => ({ display: 'none' }),
};

const triagemLabelStyle = {
  fontSize: '15px',
  fontWeight: 700,
};

const triagemTextStyle = {
  fontSize: '16px',
};

const TriagemModal = ({ tutores, animais, onClose, onSave }) => {
  const { token } = useAuth();
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState('');

  const [formData, setFormData] = useState({
    animal_id: '',
    queixa_principal: '',
    prioridade: 'leve',
    aviso_profissional: ''
  });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const tutorOptions = tutores.map((t) => ({
    value: String(t.id),
    label: t.nome_completo,
    search: `${t.nome_completo || ''} ${t.cpf || ''} ${t.telefone || ''}`.toLowerCase(),
    cpf: t.cpf || '--'
  }));

  const animalOptions = animais
    .filter((animal) => !selectedTutorId || animal.tutor_id === Number(selectedTutorId))
    .map((animal) => {
      const tutor = tutores.find((t) => t.id === animal.tutor_id);
      return {
        value: String(animal.id),
        label: animal.nome,
        search: `${animal.nome || ''} ${animal.especie || ''} ${animal.raca || ''} ${tutor?.nome_completo || ''} ${tutor?.cpf || ''}`.toLowerCase(),
        especie: animal.especie || '--',
        tutorNome: tutor?.nome_completo || 'Desconhecido',
        tutorCpf: tutor?.cpf || '--',
        tutorId: animal.tutor_id
      };
    });

  const tutorValue = tutorOptions.find((option) => option.value === selectedTutorId) || null;
  const animalValue = animalOptions.find((option) => option.value === selectedAnimalId) || null;

  const filterOption = (candidate, input) => {
    const normalizedInput = input.toLowerCase();
    return candidate.data.search.includes(normalizedInput);
  };

  const formatTutorOption = (option, meta) => {
    if (meta.context === 'value') return option.label;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <strong>{option.label}</strong>
        <span style={{ fontSize: '12px', color: '#64748b' }}>CPF {option.cpf}</span>
      </div>
    );
  };

  const formatAnimalOption = (option, meta) => {
    if (meta.context === 'value') return option.label;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <strong>{option.label}</strong>
        <span style={{ fontSize: '12px', color: '#64748b' }}>{option.especie} • Tutor: {option.tutorNome} • CPF {option.tutorCpf}</span>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiJson('/triagens', {
      method: 'POST',
      token,
      body: {
        ...formData,
        animal_id: parseInt(formData.animal_id)
      }
    });
    onSave();
  };

  const handleTutorChange = (option) => {
    const nextTutorId = option ? option.value : '';
    setSelectedTutorId(nextTutorId);

    const animalPertenceAoTutor = nextTutorId && selectedAnimalId
      ? animais.find((animal) => animal.id === Number(selectedAnimalId) && animal.tutor_id === Number(nextTutorId))
      : null;

    if (!animalPertenceAoTutor) {
      setSelectedAnimalId('');
      setFormData((prev) => ({ ...prev, animal_id: '' }));
    }
  };

  const handleAnimalChange = (option) => {
    const nextAnimalId = option ? option.value : '';
    setSelectedAnimalId(nextAnimalId);
    setFormData((prev) => ({ ...prev, animal_id: nextAnimalId }));

    if (option) {
      setSelectedTutorId(String(option.tutorId || ''));
    }
  };

    return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <div className="modal-header">
          <h2>Nova Triagem</h2>
          <button onClick={onClose} className="btn-icon">X</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label style={triagemLabelStyle}><User size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Pesquisar Tutor por nome ou CPF *</label>
            <Select
              value={tutorValue}
              onChange={handleTutorChange}
              options={tutorOptions}
              placeholder="Digite nome ou CPF do tutor..."
              isSearchable
              isClearable
              filterOption={filterOption}
              formatOptionLabel={formatTutorOption}
              components={{ IndicatorSeparator: () => null }}
              styles={selectStyles}
            />
          </div>

          <div className="form-group">
            <label style={triagemLabelStyle}><PawPrint size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Pesquisar Paciente por nome *</label>
            <Select
              value={animalValue}
              onChange={handleAnimalChange}
              options={animalOptions}
              placeholder="Digite nome, espécie ou CPF do tutor..."
              isSearchable
              isClearable
              filterOption={filterOption}
              formatOptionLabel={formatAnimalOption}
              components={{ IndicatorSeparator: () => null }}
              styles={selectStyles}
              noOptionsMessage={() => selectedTutorId ? 'Nenhum paciente para este tutor' : 'Nenhum paciente encontrado'}
            />
            {selectedTutorId && animalOptions.length === 0 && <span style={{ color: '#b91c1c', fontSize: '12px' }}>Tutor sem pacientes cadastrados.</span>}
          </div>

          <div className="form-group">
            <label style={triagemLabelStyle}><ClipboardList size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Queixa Principal *</label>
            <textarea required value={formData.queixa_principal} onChange={(e) => setFormData({ ...formData, queixa_principal: e.target.value })} rows={3} placeholder="Motivo da visita..." style={triagemTextStyle}></textarea>
          </div>

          <div className="form-group">
            <label style={triagemLabelStyle}><MessageSquare size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Aviso ao profissional (opcional)</label>
            <textarea
              value={formData.aviso_profissional}
              onChange={(e) => setFormData({ ...formData, aviso_profissional: e.target.value })}
              rows={3}
              placeholder="Ex: tutor muito ansioso, animal agressivo, paciente triste, precisa de abordagem cuidadosa..."
              style={triagemTextStyle}
            ></textarea>
          </div>

          <div className="form-group">
            <label style={triagemLabelStyle}><AlertTriangle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Prioridade da Triagem *</label>
            <select value={formData.prioridade} onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })} required style={triagemTextStyle}>
              <option value="leve">🟢 Leve</option>
              <option value="moderado">🟡 Atenção</option>
              <option value="urgencia">🟠 Urgente</option>
              <option value="emergencia_maxima">🔴 Emergência</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCancelConfirm(true)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!formData.animal_id || !formData.queixa_principal}>Encaminhar Paciente</button>
          </div>

          {showCancelConfirm && (
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
              <div style={{ background: 'white', padding: '18px', borderRadius: '10px', width: '92%', maxWidth: '420px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Tem certeza que deseja cancelar?</h3>
                <p style={{ color: '#64748b', marginTop: '6px' }}>As informações não salvas serão perdidas.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                  <button className="btn btn-secondary" onClick={() => setShowCancelConfirm(false)}>Não cancelar</button>
                  <button className="btn btn-primary" onClick={() => { setShowCancelConfirm(false); onClose(); }}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const TriagemPage = ({ setCurrentPage, mode = 'fila' }) => {
  const { token } = useAuth();
  const [triagens, setTriagens] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchData = async () => {
    const [triagensData, tutoresData, animaisData] = await Promise.all([
      apiJson('/triagens', { token }),
      apiJson('/tutores', { token }),
      apiJson('/animais', { token })
    ]);
    setTriagens(triagensData);
    setTutores(tutoresData);
    setAnimais(animaisData);
  };

  const handleCancelarTriagem = async (triagemId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta triagem?')) return;

    try {
      await apiRequest(`/triagens/${triagemId}/cancelar`, {
        method: 'PUT',
        token
      });
      setTriagens((prev) => prev.filter((item) => item.id !== triagemId));
    } catch (error) {
      if (error.status === 404 || error.status === 405) {
        try {
          await apiRequest(`/triagens/${triagemId}`, {
            method: 'DELETE',
            token
          });
          setTriagens((prev) => prev.filter((item) => item.id !== triagemId));
          return;
        } catch (fallbackError) {
          alert(fallbackError.message || 'Não foi possível cancelar a triagem.');
          return;
        }
      }

      alert(error.message || 'Não foi possível cancelar a triagem.');
    }
  };

  const ehFila = mode === 'fila';
  const triagensVisiveis = triagens.filter((t) => !t.cancelada);
  const triagensExibidas = [...(ehFila ? triagensVisiveis.filter(t => !t.atendida) : triagensVisiveis)].sort((a, b) => {
    const prioridadeA = PRIORITY_CONFIG[a.prioridade]?.order || 0;
    const prioridadeB = PRIORITY_CONFIG[b.prioridade]?.order || 0;

    if (prioridadeA !== prioridadeB) {
      return prioridadeB - prioridadeA;
    }

    return new Date(a.criado_em) - new Date(b.criado_em);
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{ehFila ? 'Fila de Triagem' : 'Gerenciamento de Triagens'}</h1>
        {!ehFila && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} /> Nova Triagem
          </button>
        )}
      </div>

      <div className="card-grid">
        {triagensExibidas.map(t => {
          const animal = animais.find(a => a.id === t.animal_id) || {};
          const tutor = tutores.find(tu => tu.id === animal.tutor_id) || {};
          const prioridade = PRIORITY_CONFIG[t.prioridade] || PRIORITY_CONFIG.leve;
          const PrioridadeIcon = prioridade.icon;

          return (
            <div key={t.id} className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                    <PawPrint size={20} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>{animal.nome || 'Desconhecido'}</h3>
                    <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><User size={13} /> {tutor.nome_completo || 'Sem tutor'}</span>
                      {tutor.cpf && <span>• CPF {tutor.cpf}</span>}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                  <div style={{ backgroundColor: prioridade.bg, color: prioridade.color, padding: '7px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '7px', border: `1px solid ${prioridade.color}22` }}>
                    <span aria-hidden="true" style={{ fontSize: '14px', lineHeight: 1 }}>{prioridade.emoji}</span>
                    <PrioridadeIcon size={14} />
                    <span>{prioridade.label}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{prioridade.description}</span>
                </div>
              </div>
              <div className="card-body">
                <p style={{ margin: '0 0 8px 0', color: '#334155', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><ClipboardList size={14} /> Queixa principal</p>
                <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '10px', fontSize: '14px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                  "{t.queixa_principal}"
                </div>

                {ehFila && (t.aviso_profissional || t.comentarios_veterinario) && (
                  <div style={{ background: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <MessageSquare size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '4px' }}>Aviso ao profissional</strong>
                      <span style={{ fontSize: '14px', lineHeight: 1.45 }}>{t.aviso_profissional || t.comentarios_veterinario}</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={12} /> {new Date(t.criado_em).toLocaleString()}
                  </span>

                  {ehFila ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary" onClick={() => setCurrentPage(`novo-prontuario-${t.id}`)}>
                        Atender
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleCancelarTriagem(t.id)}
                        title="Cancelar triagem"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Trash2 size={14} /> Cancelar
                      </button>
                    </div>
                  ) : !t.atendida ? (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleCancelarTriagem(t.id)}
                      title="Cancelar triagem"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Trash2 size={14} /> Cancelar triagem
                    </button>
                  ) : (
                    <span style={{ fontSize: '13px', color: t.atendida ? '#059669' : '#d97706', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                      {t.atendida ? <><CheckCircle size={14} /> Atendida</> : <><AlertCircle size={14} /> Aguardando</>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {triagensExibidas.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Nenhuma triagem na fila no momento.
          </div>
        )}
      </div>

      {showModal && (
        <TriagemModal
          tutores={tutores}
          animais={animais}
          onClose={() => setShowModal(false)}
          onSave={() => { fetchData(); setShowModal(false); }}
        />
      )}
    </div>
  );
};

export default TriagemPage;
