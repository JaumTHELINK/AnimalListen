import { useState } from 'react';
import { User, PawPrint, Plus, Trash2, Edit2, Save, ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';

const emptyTutor = {
  nome: '', cpf: '', telefone: '', email: '', endereco: '',
};

const emptyPaciente = {
  nome: '', especie: 'Canino', raca: '', idade: '', sexo: 'Macho', peso: '', microchip: '',
};

export default function CadastroTutor({ tutores, onSaveTutor, onDeleteTutor, onSavePaciente, onDeletePaciente }) {
  const [view, setView] = useState('list');
  const [tutorForm, setTutorForm] = useState(emptyTutor);
  const [editingTutorId, setEditingTutorId] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [pacienteForm, setPacienteForm] = useState(emptyPaciente);
  const [showPacienteForm, setShowPacienteForm] = useState(false);
  const [editingPacienteId, setEditingPacienteId] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedTutor, setExpandedTutor] = useState(null);

  const filteredTutores = tutores.filter(t =>
    t.nome?.toLowerCase().includes(search.toLowerCase()) ||
    t.cpf?.includes(search) ||
    t.telefone?.includes(search)
  );

  const handleSaveTutor = async () => {
    if (!tutorForm.nome.trim()) return;
    setSaving(true);
    try {
      const saved = await onSaveTutor({ ...tutorForm, id: editingTutorId || undefined });
      if (!editingTutorId) {
        setSelectedTutor({ ...saved, pacientes: [] });
        setView('detail');
      } else {
        setSelectedTutor(prev => ({ ...prev, ...saved }));
        setView('detail');
      }
      setTutorForm(emptyTutor);
      setEditingTutorId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleEditTutor = (tutor) => {
    setTutorForm({
      nome: tutor.nome || '',
      cpf: tutor.cpf || '',
      telefone: tutor.telefone || '',
      email: tutor.email || '',
      endereco: tutor.endereco || '',
    });
    setEditingTutorId(tutor.id);
    setView('form');
  };

  const handleDeleteTutor = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este tutor e todos os seus pacientes?')) {
      await onDeleteTutor(id);
      if (selectedTutor?.id === id) {
        setSelectedTutor(null);
        setView('list');
      }
    }
  };

  const handleSavePaciente = async () => {
    if (!pacienteForm.nome.trim() || !selectedTutor) return;
    setSaving(true);
    try {
      await onSavePaciente({
        ...pacienteForm,
        peso: pacienteForm.peso ? Number(pacienteForm.peso) : null,
        tutor_id: selectedTutor.id,
        id: editingPacienteId || undefined,
      });
      setPacienteForm(emptyPaciente);
      setShowPacienteForm(false);
      setEditingPacienteId(null);
      setTimeout(() => {
        const updated = tutores.find(t => t.id === selectedTutor.id);
        if (updated) setSelectedTutor(updated);
      }, 500);
    } finally {
      setSaving(false);
    }
  };

  const handleEditPaciente = (p) => {
    setPacienteForm({
      nome: p.nome || '',
      especie: p.especie || 'Canino',
      raca: p.raca || '',
      idade: p.idade || '',
      sexo: p.sexo || 'Macho',
      peso: p.peso || '',
      microchip: p.microchip || '',
    });
    setEditingPacienteId(p.id);
    setShowPacienteForm(true);
  };

  const handleDeletePaciente = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      await onDeletePaciente(id);
      setTimeout(() => {
        const updated = tutores.find(t => t.id === selectedTutor.id);
        if (updated) setSelectedTutor(updated);
      }, 500);
    }
  };

  const openDetail = (tutor) => {
    setSelectedTutor(tutor);
    setView('detail');
    setShowPacienteForm(false);
    setPacienteForm(emptyPaciente);
    setEditingPacienteId(null);
  };

  const currentTutor = selectedTutor ? tutores.find(t => t.id === selectedTutor.id) || selectedTutor : null;

  // ─── LIST VIEW ───
  if (view === 'list') {
    return (
      <div className="cadastro-tutor">
        <div className="page-header">
          <div>
            <h2><User size={24} /> Cadastro de Tutores</h2>
            <p className="subtitle">{tutores.length} tutor(es) cadastrado(s)</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setTutorForm(emptyTutor); setEditingTutorId(null); setView('form'); }}>
            <Plus size={18} /> Novo Tutor
          </button>
        </div>

        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nome, CPF ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', boxShadow: 'none' }}
          />
        </div>

        {filteredTutores.length === 0 ? (
          <div className="empty-state">
            <User size={48} />
            <p>Nenhum tutor encontrado</p>
          </div>
        ) : (
          <div className="tutor-list">
            {filteredTutores.map(tutor => (
              <div key={tutor.id} className="tutor-card">
                <div className="tutor-card-header" onClick={() => openDetail(tutor)}>
                  <div className="tutor-card-avatar">
                    {tutor.nome?.charAt(0)?.toUpperCase() || 'T'}
                  </div>
                  <div className="tutor-card-info">
                    <h3>{tutor.nome}</h3>
                    <p>{tutor.cpf && `CPF: ${tutor.cpf}`} {tutor.telefone && ` • ${tutor.telefone}`}</p>
                  </div>
                  <div className="tutor-card-badge">
                    <PawPrint size={14} />
                    {tutor.pacientes?.length || 0}
                  </div>
                </div>

                {tutor.pacientes?.length > 0 && (
                  <div className="tutor-card-pets">
                    <button
                      className="expand-btn"
                      onClick={e => { e.stopPropagation(); setExpandedTutor(expandedTutor === tutor.id ? null : tutor.id); }}
                    >
                      {expandedTutor === tutor.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {tutor.pacientes.length} paciente(s)
                    </button>
                    {expandedTutor === tutor.id && (
                      <div className="pet-list-mini">
                        {tutor.pacientes.map(p => (
                          <div key={p.id} className="pet-mini">
                            <PawPrint size={14} />
                            <span>{p.nome}</span>
                            <span className="pet-mini-info">{p.especie} • {p.raca || '—'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="tutor-card-actions">
                  <button className="btn-icon" title="Editar" onClick={e => { e.stopPropagation(); handleEditTutor(tutor); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-icon danger" title="Excluir" onClick={e => { e.stopPropagation(); handleDeleteTutor(tutor.id); }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── FORM VIEW (new/edit tutor) ───
  if (view === 'form') {
    return (
      <div className="cadastro-tutor">
        <div className="page-header">
          <button className="btn-back" onClick={() => setView(editingTutorId && selectedTutor ? 'detail' : 'list')}>
            <ArrowLeft size={18} /> Voltar
          </button>
          <h2>{editingTutorId ? 'Editar Tutor' : 'Novo Tutor'}</h2>
        </div>

        <div className="card">
          <h3 className="card-section-title"><User size={18} /> Dados do Tutor</h3>
          <div className="form-row">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nome Completo *</label>
              <input className="form-input" value={tutorForm.nome} onChange={e => setTutorForm({ ...tutorForm, nome: e.target.value })} placeholder="Nome do tutor" />
            </div>
            <div className="form-group">
              <label className="form-label">CPF</label>
              <input className="form-input" value={tutorForm.cpf} onChange={e => setTutorForm({ ...tutorForm, cpf: e.target.value })} placeholder="000.000.000-00" />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-input" value={tutorForm.telefone} onChange={e => setTutorForm({ ...tutorForm, telefone: e.target.value })} placeholder="(00) 00000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={tutorForm.email} onChange={e => setTutorForm({ ...tutorForm, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Endereço</label>
              <input className="form-input" value={tutorForm.endereco} onChange={e => setTutorForm({ ...tutorForm, endereco: e.target.value })} placeholder="Endereço completo" />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setView(editingTutorId && selectedTutor ? 'detail' : 'list')}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSaveTutor} disabled={saving || !tutorForm.nome.trim()}>
              <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Tutor'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── DETAIL VIEW (tutor + animals) ───
  return (
    <div className="cadastro-tutor">
      <div className="page-header">
        <button className="btn-back" onClick={() => { setView('list'); setSelectedTutor(null); }}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <h2>{currentTutor?.nome}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => handleEditTutor(currentTutor)}>
            <Edit2 size={16} /> Editar
          </button>
        </div>
      </div>

      {/* Tutor info summary */}
      <div className="tutor-summary">
        <div className="tutor-summary-avatar">{currentTutor?.nome?.charAt(0)?.toUpperCase()}</div>
        <div className="tutor-summary-details">
          <p><strong>CPF:</strong> {currentTutor?.cpf || '—'}</p>
          <p><strong>Telefone:</strong> {currentTutor?.telefone || '—'}</p>
          <p><strong>Email:</strong> {currentTutor?.email || '—'}</p>
          <p><strong>Endereço:</strong> {currentTutor?.endereco || '—'}</p>
        </div>
      </div>

      {/* Animals section */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="card-section-title"><PawPrint size={18} /> Pacientes (Animais)</h3>
          <button className="btn btn-primary btn-sm" onClick={() => { setPacienteForm(emptyPaciente); setEditingPacienteId(null); setShowPacienteForm(true); }}>
            <Plus size={16} /> Adicionar Animal
          </button>
        </div>

        {showPacienteForm && (
          <div className="paciente-form-inline">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome do Animal *</label>
                <input className="form-input" value={pacienteForm.nome} onChange={e => setPacienteForm({ ...pacienteForm, nome: e.target.value })} placeholder="Nome" />
              </div>
              <div className="form-group">
                <label className="form-label">Espécie</label>
                <select className="form-select" value={pacienteForm.especie} onChange={e => setPacienteForm({ ...pacienteForm, especie: e.target.value })}>
                  <option>Canino</option>
                  <option>Felino</option>
                  <option>Ave</option>
                  <option>Réptil</option>
                  <option>Roedor</option>
                  <option>Equino</option>
                  <option>Outro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Raça</label>
                <input className="form-input" value={pacienteForm.raca} onChange={e => setPacienteForm({ ...pacienteForm, raca: e.target.value })} placeholder="Raça" />
              </div>
              <div className="form-group">
                <label className="form-label">Idade</label>
                <input className="form-input" value={pacienteForm.idade} onChange={e => setPacienteForm({ ...pacienteForm, idade: e.target.value })} placeholder="Ex: 3 anos" />
              </div>
              <div className="form-group">
                <label className="form-label">Sexo</label>
                <select className="form-select" value={pacienteForm.sexo} onChange={e => setPacienteForm({ ...pacienteForm, sexo: e.target.value })}>
                  <option>Macho</option>
                  <option>Fêmea</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Peso (kg)</label>
                <input className="form-input" type="number" step="0.1" value={pacienteForm.peso} onChange={e => setPacienteForm({ ...pacienteForm, peso: e.target.value })} placeholder="0.0" />
              </div>
              <div className="form-group">
                <label className="form-label">Microchip</label>
                <input className="form-input" value={pacienteForm.microchip} onChange={e => setPacienteForm({ ...pacienteForm, microchip: e.target.value })} placeholder="Nº do microchip" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => { setShowPacienteForm(false); setEditingPacienteId(null); setPacienteForm(emptyPaciente); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSavePaciente} disabled={saving || !pacienteForm.nome.trim()}>
                <Save size={16} /> {saving ? 'Salvando...' : (editingPacienteId ? 'Atualizar' : 'Adicionar')}
              </button>
            </div>
          </div>
        )}

        {(!currentTutor?.pacientes || currentTutor.pacientes.length === 0) && !showPacienteForm ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <PawPrint size={40} />
            <p>Nenhum paciente cadastrado</p>
            <small>Clique em "Adicionar Animal" para cadastrar</small>
          </div>
        ) : (
          <div className="paciente-grid">
            {currentTutor?.pacientes?.map(p => (
              <div key={p.id} className="paciente-card">
                <div className="paciente-card-icon">
                  <PawPrint size={24} />
                </div>
                <div className="paciente-card-info">
                  <h4>{p.nome}</h4>
                  <p>{p.especie} {p.raca && `• ${p.raca}`}</p>
                  <p>{p.idade && `${p.idade}`} {p.sexo && `• ${p.sexo}`} {p.peso && `• ${p.peso}kg`}</p>
                  {p.microchip && <p className="microchip">Chip: {p.microchip}</p>}
                </div>
                <div className="paciente-card-actions">
                  <button className="btn-icon" title="Editar" onClick={() => handleEditPaciente(p)}>
                    <Edit2 size={14} />
                  </button>
                  <button className="btn-icon danger" title="Excluir" onClick={() => handleDeletePaciente(p.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
