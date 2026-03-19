import { useState } from 'react';
import { User, PawPrint, Plus, Trash2, Edit2, Save, ArrowLeft, Search, ChevronDown, ChevronUp, Phone, Mail, MapPin, CreditCard, Weight, Dna, Calendar, Heart, Scissors, AlertTriangle, FileText, Ruler } from 'lucide-react';

const maskCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const maskPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

const emptyTutor = {
  nome: '', cpf: '', telefone: '', email: '', endereco: '', observacoes: '',
};

const emptyPaciente = {
  nome: '', especie: 'Canino', raca: '', idade: '', sexo: 'Macho', peso: '', microchip: '',
  porte: '', pelagem: '', alergias: '', doenca_cronica: '', castrado: false,
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
  const [tutorTab, setTutorTab] = useState('dados');

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
      observacoes: tutor.observacoes || '',
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
      porte: p.porte || '',
      pelagem: p.pelagem || '',
      alergias: p.alergias || '',
      doenca_cronica: p.doenca_cronica || '',
      castrado: p.castrado || false,
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
    setTutorTab('dados');
  };

  const currentTutor = selectedTutor ? tutores.find(t => t.id === selectedTutor.id) || selectedTutor : null;

  const getEspecieEmoji = (especie) => {
    const map = { 'Canino': '🐕', 'Felino': '🐈', 'Ave': '🐦', 'Réptil': '🦎', 'Roedor': '🐹', 'Equino': '🐴' };
    return map[especie] || '🐾';
  };

  // ─── LIST VIEW ───
  if (view === 'list') {
    return (
      <div className="cadastro-tutor">
        <div className="ct-header">
          <div className="ct-header-left">
            <div className="ct-header-icon">
              <User size={22} />
            </div>
            <div>
              <h2>Cadastro de Tutores</h2>
              <p className="ct-header-count">{tutores.length} tutor(es) cadastrado(s)</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => { setTutorForm(emptyTutor); setEditingTutorId(null); setView('form'); }}>
            <Plus size={18} /> Novo Tutor
          </button>
        </div>

        <div className="ct-search">
          <Search size={18} />
          <input type="text" placeholder="Buscar por nome, CPF ou telefone..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="ct-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>

        {filteredTutores.length === 0 ? (
          <div className="ct-empty">
            <div className="ct-empty-icon"><User size={48} /></div>
            <h3>Nenhum tutor encontrado</h3>
            <p>{search ? 'Tente outro termo de busca' : 'Comece cadastrando o primeiro tutor'}</p>
            {!search && (
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => { setTutorForm(emptyTutor); setEditingTutorId(null); setView('form'); }}>
                <Plus size={18} /> Cadastrar Tutor
              </button>
            )}
          </div>
        ) : (
          <div className="ct-grid">
            {filteredTutores.map(tutor => (
              <div key={tutor.id} className="ct-card" onClick={() => openDetail(tutor)}>
                <div className="ct-card-top">
                  <div className="ct-card-avatar">{tutor.nome?.charAt(0)?.toUpperCase() || 'T'}</div>
                  <div className="ct-card-main">
                    <h3>{tutor.nome}</h3>
                    <div className="ct-card-meta">
                      {tutor.telefone && <span><Phone size={12} /> {tutor.telefone}</span>}
                      {tutor.cpf && <span><CreditCard size={12} /> {tutor.cpf}</span>}
                    </div>
                  </div>
                  <div className="ct-card-pets-badge">
                    <PawPrint size={14} />
                    <span>{tutor.pacientes?.length || 0}</span>
                  </div>
                </div>

                {tutor.pacientes?.length > 0 && (
                  <div className="ct-card-pets-section">
                    <button className="ct-card-pets-toggle" onClick={e => { e.stopPropagation(); setExpandedTutor(expandedTutor === tutor.id ? null : tutor.id); }}>
                      {expandedTutor === tutor.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Ver {tutor.pacientes.length} paciente(s)
                    </button>
                    {expandedTutor === tutor.id && (
                      <div className="ct-card-pets-list">
                        {tutor.pacientes.map(p => (
                          <div key={p.id} className="ct-card-pet-item">
                            <span className="ct-pet-emoji">{getEspecieEmoji(p.especie)}</span>
                            <span className="ct-pet-name">{p.nome}</span>
                            <span className="ct-pet-detail">{p.especie}{p.raca ? ` • ${p.raca}` : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="ct-card-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn-icon" title="Editar" onClick={() => handleEditTutor(tutor)}><Edit2 size={15} /></button>
                  <button className="btn-icon danger" title="Excluir" onClick={() => handleDeleteTutor(tutor.id)}><Trash2 size={15} /></button>
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
        <div className="ct-form-header">
          <button className="btn-back" onClick={() => setView(editingTutorId && selectedTutor ? 'detail' : 'list')}>
            <ArrowLeft size={18} /> Voltar
          </button>
          <h2>{editingTutorId ? 'Editar Tutor' : 'Novo Tutor'}</h2>
        </div>

        <div className="ct-form-card">
          {/* Tabs */}
          <div className="ct-tabs">
            <button className={`ct-tab ${tutorTab === 'dados' ? 'active' : ''}`} onClick={() => setTutorTab('dados')}>
              <User size={16} /> Dados Pessoais
            </button>
            <button className={`ct-tab ${tutorTab === 'observacoes' ? 'active' : ''}`} onClick={() => setTutorTab('observacoes')}>
              <FileText size={16} /> Observações
            </button>
          </div>

          {tutorTab === 'dados' && (
            <>
              <div className="ct-form-section-header">
                <User size={20} />
                <div>
                  <h3>Informações Pessoais</h3>
                  <p>Preencha os dados do responsável pelo animal</p>
                </div>
              </div>

              <div className="ct-form-grid">
                <div className="ct-form-field ct-form-full">
                  <label><User size={14} /> Nome Completo <span className="ct-required">*</span></label>
                  <input className="form-input" value={tutorForm.nome} onChange={e => setTutorForm({ ...tutorForm, nome: e.target.value })} placeholder="Digite o nome completo do tutor" />
                </div>
                <div className="ct-form-field">
                  <label><CreditCard size={14} /> CPF</label>
                  <input className="form-input" value={tutorForm.cpf} onChange={e => setTutorForm({ ...tutorForm, cpf: e.target.value })} placeholder="000.000.000-00" />
                </div>
                <div className="ct-form-field">
                  <label><Phone size={14} /> Telefone</label>
                  <input className="form-input" value={tutorForm.telefone} onChange={e => setTutorForm({ ...tutorForm, telefone: e.target.value })} placeholder="(00) 00000-0000" />
                </div>
                <div className="ct-form-field">
                  <label><Mail size={14} /> Email</label>
                  <input className="form-input" type="email" value={tutorForm.email} onChange={e => setTutorForm({ ...tutorForm, email: e.target.value })} placeholder="email@exemplo.com" />
                </div>
                <div className="ct-form-field ct-form-full">
                  <label><MapPin size={14} /> Endereço</label>
                  <input className="form-input" value={tutorForm.endereco} onChange={e => setTutorForm({ ...tutorForm, endereco: e.target.value })} placeholder="Rua, número, bairro, cidade - UF" />
                </div>
              </div>
            </>
          )}

          {tutorTab === 'observacoes' && (
            <>
              <div className="ct-form-section-header">
                <FileText size={20} />
                <div>
                  <h3>Observações</h3>
                  <p>Anotações gerais sobre o tutor</p>
                </div>
              </div>
              <div className="ct-form-field">
                <textarea
                  className="form-input ct-textarea"
                  value={tutorForm.observacoes}
                  onChange={e => setTutorForm({ ...tutorForm, observacoes: e.target.value })}
                  placeholder="Digite observações sobre o tutor (ex: horários de preferência, restrições, informações adicionais...)"
                  rows={6}
                />
              </div>
            </>
          )}

          <div className="ct-form-actions">
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
      <div className="ct-detail-header">
        <button className="btn-back" onClick={() => { setView('list'); setSelectedTutor(null); }}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="ct-detail-header-actions">
          <button className="btn btn-outline" onClick={() => handleEditTutor(currentTutor)}>
            <Edit2 size={16} /> Editar
          </button>
          <button className="btn btn-outline danger" onClick={() => handleDeleteTutor(currentTutor?.id)}>
            <Trash2 size={16} /> Excluir
          </button>
        </div>
      </div>

      {/* Tutor profile card */}
      <div className="ct-profile">
        <div className="ct-profile-avatar">{currentTutor?.nome?.charAt(0)?.toUpperCase()}</div>
        <div className="ct-profile-info">
          <h2>{currentTutor?.nome}</h2>
          <div className="ct-profile-details">
            <div className="ct-profile-item"><CreditCard size={15} /><span>{currentTutor?.cpf || 'CPF não informado'}</span></div>
            <div className="ct-profile-item"><Phone size={15} /><span>{currentTutor?.telefone || 'Telefone não informado'}</span></div>
            <div className="ct-profile-item"><Mail size={15} /><span>{currentTutor?.email || 'Email não informado'}</span></div>
            <div className="ct-profile-item"><MapPin size={15} /><span>{currentTutor?.endereco || 'Endereço não informado'}</span></div>
          </div>
          {currentTutor?.observacoes && (
            <div className="ct-profile-obs">
              <FileText size={14} />
              <p>{currentTutor.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Animals section */}
      <div className="ct-animals-section">
        <div className="ct-animals-header">
          <div className="ct-animals-title">
            <PawPrint size={20} />
            <h3>Pacientes</h3>
            <span className="ct-animals-count">{currentTutor?.pacientes?.length || 0}</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setPacienteForm(emptyPaciente); setEditingPacienteId(null); setShowPacienteForm(true); }}>
            <Plus size={16} /> Adicionar Animal
          </button>
        </div>

        {showPacienteForm && (
          <div className="ct-animal-form">
            <div className="ct-form-section-header" style={{ marginBottom: 16 }}>
              <PawPrint size={18} />
              <div>
                <h3>{editingPacienteId ? 'Editar Animal' : 'Novo Animal'}</h3>
                <p>Preencha os dados do paciente</p>
              </div>
            </div>
            <div className="ct-form-grid">
              <div className="ct-form-field">
                <label><PawPrint size={14} /> Nome do Animal <span className="ct-required">*</span></label>
                <input className="form-input" value={pacienteForm.nome} onChange={e => setPacienteForm({ ...pacienteForm, nome: e.target.value })} placeholder="Nome do animal" />
              </div>
              <div className="ct-form-field">
                <label><Dna size={14} /> Espécie</label>
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
              <div className="ct-form-field">
                <label><Dna size={14} /> Raça</label>
                <input className="form-input" value={pacienteForm.raca} onChange={e => setPacienteForm({ ...pacienteForm, raca: e.target.value })} placeholder="Ex: Labrador" />
              </div>
              <div className="ct-form-field">
                <label><Ruler size={14} /> Porte</label>
                <select className="form-select" value={pacienteForm.porte} onChange={e => setPacienteForm({ ...pacienteForm, porte: e.target.value })}>
                  <option value="">Selecione</option>
                  <option value="Pequeno">Pequeno</option>
                  <option value="Médio">Médio</option>
                  <option value="Grande">Grande</option>
                </select>
              </div>
              <div className="ct-form-field">
                <label><Calendar size={14} /> Idade</label>
                <input className="form-input" value={pacienteForm.idade} onChange={e => setPacienteForm({ ...pacienteForm, idade: e.target.value })} placeholder="Ex: 3 anos" />
              </div>
              <div className="ct-form-field">
                <label><Heart size={14} /> Sexo</label>
                <select className="form-select" value={pacienteForm.sexo} onChange={e => setPacienteForm({ ...pacienteForm, sexo: e.target.value })}>
                  <option>Macho</option>
                  <option>Fêmea</option>
                </select>
              </div>
              <div className="ct-form-field">
                <label><Weight size={14} /> Peso (kg)</label>
                <input className="form-input" type="number" step="0.1" value={pacienteForm.peso} onChange={e => setPacienteForm({ ...pacienteForm, peso: e.target.value })} placeholder="0.0" />
              </div>
              <div className="ct-form-field">
                <label><PawPrint size={14} /> Pelagem</label>
                <input className="form-input" value={pacienteForm.pelagem} onChange={e => setPacienteForm({ ...pacienteForm, pelagem: e.target.value })} placeholder="Ex: Curta, Lisa, Longa" />
              </div>
              <div className="ct-form-field">
                <label><Scissors size={14} /> Castrado</label>
                <select className="form-select" value={pacienteForm.castrado ? 'sim' : 'nao'} onChange={e => setPacienteForm({ ...pacienteForm, castrado: e.target.value === 'sim' })}>
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </div>
              <div className="ct-form-field ct-form-full">
                <label><AlertTriangle size={14} /> Alergias</label>
                <input className="form-input" value={pacienteForm.alergias} onChange={e => setPacienteForm({ ...pacienteForm, alergias: e.target.value })} placeholder="Alergias conhecidas (ex: dipirona, pulga)" />
              </div>
              <div className="ct-form-field ct-form-full">
                <label><FileText size={14} /> Doença Crônica</label>
                <input className="form-input" value={pacienteForm.doenca_cronica} onChange={e => setPacienteForm({ ...pacienteForm, doenca_cronica: e.target.value })} placeholder="Doenças crônicas (ex: diabetes, cardiopatia)" />
              </div>
              <div className="ct-form-field ct-form-full">
                <label><CreditCard size={14} /> Microchip</label>
                <input className="form-input" value={pacienteForm.microchip} onChange={e => setPacienteForm({ ...pacienteForm, microchip: e.target.value })} placeholder="Número do microchip" />
              </div>
            </div>
            <div className="ct-form-actions">
              <button className="btn btn-outline" onClick={() => { setShowPacienteForm(false); setEditingPacienteId(null); setPacienteForm(emptyPaciente); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSavePaciente} disabled={saving || !pacienteForm.nome.trim()}>
                <Save size={16} /> {saving ? 'Salvando...' : (editingPacienteId ? 'Atualizar' : 'Adicionar')}
              </button>
            </div>
          </div>
        )}

        {(!currentTutor?.pacientes || currentTutor.pacientes.length === 0) && !showPacienteForm ? (
          <div className="ct-empty" style={{ padding: 40 }}>
            <div className="ct-empty-icon"><PawPrint size={40} /></div>
            <h3>Nenhum paciente cadastrado</h3>
            <p>Clique em "Adicionar Animal" para cadastrar o primeiro paciente</p>
          </div>
        ) : (
          <div className="ct-animals-grid">
            {currentTutor?.pacientes?.map(p => (
              <div key={p.id} className="ct-animal-card">
                <div className="ct-animal-card-emoji">{getEspecieEmoji(p.especie)}</div>
                <div className="ct-animal-card-body">
                  <h4>{p.nome}</h4>
                  <div className="ct-animal-card-tags">
                    <span className="ct-tag">{p.especie || 'N/A'}</span>
                    {p.raca && <span className="ct-tag">{p.raca}</span>}
                    {p.sexo && <span className="ct-tag">{p.sexo}</span>}
                    {p.porte && <span className="ct-tag">{p.porte}</span>}
                    {p.castrado && <span className="ct-tag ct-tag-castrado">Castrado</span>}
                  </div>
                  <div className="ct-animal-card-details">
                    {p.idade && <span><Calendar size={12} /> {p.idade}</span>}
                    {p.peso && <span><Weight size={12} /> {p.peso}kg</span>}
                    {p.pelagem && <span><PawPrint size={12} /> {p.pelagem}</span>}
                    {p.microchip && <span><CreditCard size={12} /> {p.microchip}</span>}
                  </div>
                  {(p.alergias || p.doenca_cronica) && (
                    <div className="ct-animal-card-alerts">
                      {p.alergias && <span className="ct-alert-tag"><AlertTriangle size={11} /> {p.alergias}</span>}
                      {p.doenca_cronica && <span className="ct-alert-tag chronic"><FileText size={11} /> {p.doenca_cronica}</span>}
                    </div>
                  )}
                </div>
                <div className="ct-animal-card-actions">
                  <button className="btn-icon" title="Editar" onClick={() => handleEditPaciente(p)}><Edit2 size={14} /></button>
                  <button className="btn-icon danger" title="Excluir" onClick={() => handleDeletePaciente(p.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
