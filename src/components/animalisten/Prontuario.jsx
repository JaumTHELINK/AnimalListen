import { useState, useEffect, useRef } from 'react';
import {
  User, PawPrint, ClipboardList, Stethoscope, Pill, MessageSquare,
  Save, ArrowLeft, Edit, Lock, X, Printer, Activity, FileText, Sparkles,
  Cpu, Upload, Palette, ChevronDown, Clock, CheckCircle, Trash2,
} from 'lucide-react';
import AudioUpload from './AudioUpload';
import { generateProntuarioNumber } from '../../data/mockData';
import { useTutores } from '../../hooks/useTutores';

export default function Prontuario({ prontuario, onBack, onSave }) {
  const { tutores, isLoading: tutoresLoading } = useTutores();
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  const [editMode, setEditMode] = useState(!prontuario);
  const [prontuarioType, setProntuarioType] = useState('personalizado'); // 'personalizado' | 'simples'
  const [customColor, setCustomColor] = useState('#0855a1');
  const [customLogo, setCustomLogo] = useState(null);
  const logoInputRef = useRef(null);

  const [numeroProntuario] = useState(() => {
    return prontuario?.numero_prontuario || generateProntuarioNumber();
  });

  const [form, setForm] = useState({
    tutor_nome: '', tutor_cpf: '', tutor_telefone: '', tutor_email: '', tutor_endereco: '',
    animal_nome: '', animal_especie: '', animal_raca: '', animal_idade: '', animal_sexo: '',
    animal_peso: '', animal_microchip: '',
    animal_porte: '', animal_pelagem: '', animal_alergias: '', animal_doenca_cronica: '', animal_castrado: false,
    queixa_principal: '', historico_doenca: '',
    temperatura: '', frequencia_cardiaca: '', frequencia_respiratoria: '', mucosas: '', palpacao_abdominal: '',
    suspeita_diagnostica: '', tratamento_prescrito: '',
    observacoes_gerais: '', recomendacoes: '',
  });
  const [sintomas, setSintomas] = useState([]);
  const [comportamento, setComportamento] = useState([]);
  const [exames, setExames] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [sintomaInput, setSintomaInput] = useState('');
  const [comportamentoInput, setComportamentoInput] = useState('');
  const [exameInput, setExameInput] = useState('');
  const [medicamentoInput, setMedicamentoInput] = useState('');
  const [transcricao, setTranscricao] = useState('');
  const [saved, setSaved] = useState(false);
  const [aiFields, setAiFields] = useState(new Set());

  useEffect(() => {
    if (prontuario) {
      setForm({
        tutor_nome: prontuario.tutor_nome || '',
        tutor_cpf: prontuario.tutor_cpf || '',
        tutor_telefone: prontuario.tutor_telefone || '',
        tutor_email: prontuario.tutor_email || '',
        tutor_endereco: prontuario.tutor_endereco || '',
        animal_nome: prontuario.animal_nome || '',
        animal_especie: prontuario.animal_especie || '',
        animal_raca: prontuario.animal_raca || '',
        animal_idade: prontuario.animal_idade || '',
        animal_sexo: prontuario.animal_sexo || '',
        animal_peso: prontuario.animal_peso || '',
        animal_microchip: prontuario.animal_microchip || '',
        animal_porte: prontuario.animal_porte || '',
        animal_pelagem: prontuario.animal_pelagem || '',
        animal_alergias: prontuario.animal_alergias || '',
        animal_doenca_cronica: prontuario.animal_doenca_cronica || '',
        animal_castrado: prontuario.animal_castrado || false,
        queixa_principal: prontuario.queixa_principal || '',
        historico_doenca: prontuario.historico_doenca || '',
        temperatura: prontuario.temperatura || '',
        frequencia_cardiaca: prontuario.frequencia_cardiaca || '',
        frequencia_respiratoria: prontuario.frequencia_respiratoria || '',
        mucosas: prontuario.mucosas || '',
        palpacao_abdominal: prontuario.palpacao_abdominal || '',
        suspeita_diagnostica: prontuario.suspeita_diagnostica || '',
        tratamento_prescrito: prontuario.tratamento_prescrito || '',
        observacoes_gerais: prontuario.observacoes_gerais || '',
        recomendacoes: prontuario.recomendacoes || '',
      });
      setSintomas(prontuario.sintomas || []);
      setComportamento(prontuario.comportamento || []);
      setExames(prontuario.exames_solicitados || []);
      setMedicamentos(prontuario.medicamentos || []);
    }
  }, [prontuario]);

  // Derived: selected tutor's patients
  const selectedTutor = tutores.find((t) => t.id === selectedTutorId);
  const pacientesDoTutor = selectedTutor?.pacientes || [];

  const handleSelectTutor = (tutorId) => {
    setSelectedTutorId(tutorId);
    setSelectedPacienteId('');
    const tutor = tutores.find((t) => t.id === tutorId);
    if (tutor) {
      setForm((prev) => ({
        ...prev,
        tutor_nome: tutor.nome || '',
        tutor_cpf: tutor.cpf || '',
        tutor_telefone: tutor.telefone || '',
        tutor_email: tutor.email || '',
        tutor_endereco: tutor.endereco || '',
        animal_nome: '', animal_especie: '', animal_raca: '', animal_idade: '',
        animal_sexo: '', animal_peso: '', animal_microchip: '',
        animal_porte: '', animal_pelagem: '', animal_alergias: '', animal_doenca_cronica: '', animal_castrado: false,
      }));
    }
  };

  const handleSelectPaciente = (pacienteId) => {
    setSelectedPacienteId(pacienteId);
    const paciente = pacientesDoTutor.find((p) => p.id === pacienteId);
    if (paciente) {
      setForm((prev) => ({
        ...prev,
        animal_nome: paciente.nome || '',
        animal_especie: paciente.especie || '',
        animal_raca: paciente.raca || '',
        animal_idade: paciente.idade || '',
        animal_sexo: paciente.sexo || '',
        animal_peso: paciente.peso || '',
        animal_microchip: paciente.microchip || '',
      }));
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = (list, setList, input, setInput) => {
    if (input.trim()) {
      setList([...list, input.trim()]);
      setInput('');
    }
  };

  const removeTag = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index));
  };

  const buildFullData = (status = 'completo') => ({
    ...(prontuario?.id ? { id: prontuario.id } : {}),
    numero_prontuario: numeroProntuario,
    ...form,
    animal_peso: form.animal_peso ? parseFloat(form.animal_peso) : null,
    temperatura: form.temperatura ? parseFloat(form.temperatura) : null,
    frequencia_cardiaca: form.frequencia_cardiaca ? parseInt(form.frequencia_cardiaca) : null,
    frequencia_respiratoria: form.frequencia_respiratoria ? parseInt(form.frequencia_respiratoria) : null,
    sintomas,
    comportamento,
    exames_solicitados: exames,
    medicamentos,
    data_atendimento: prontuario?.data_atendimento || new Date().toISOString(),
    status,
  });

  const handleSave = async (status = 'completo') => {
    const fullData = buildFullData(status);
    try {
      if (onSave) await onSave(fullData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Erro ao salvar prontuário:', err);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar este prontuário? Esta ação não pode ser desfeita.')) return;
    const fullData = buildFullData('cancelado');
    try {
      if (onSave) await onSave(fullData);
    } catch (err) {
      console.error('Erro ao cancelar prontuário:', err);
    }
  };

  const handleFinalize = async () => {
    if (!window.confirm('Deseja finalizar este prontuário e enviá-lo ao histórico?')) return;
    const fullData = buildFullData('completo');
    try {
      if (onSave) await onSave(fullData);
    } catch (err) {
      console.error('Erro ao finalizar prontuário:', err);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCustomLogo(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTranscriptionData = (data) => {
    if (data.texto) {
      setTranscricao(data.texto);
    }
    if (data.prontuario) {
      const p = data.prontuario;
      const filled = new Set();

      const trySet = (field, value) => {
        if (value !== null && value !== undefined && value !== '' && value !== 0) {
          filled.add(field);
          return value;
        }
        return null;
      };

      setForm((prev) => {
        const updated = { ...prev };
        const fields = [
          'tutor_nome', 'tutor_cpf', 'tutor_telefone', 'tutor_email', 'tutor_endereco',
          'animal_nome', 'animal_especie', 'animal_raca', 'animal_idade', 'animal_sexo',
          'animal_peso', 'animal_microchip',
          'queixa_principal', 'historico_doenca',
          'temperatura', 'frequencia_cardiaca', 'frequencia_respiratoria', 'mucosas', 'palpacao_abdominal',
          'suspeita_diagnostica', 'tratamento_prescrito',
          'observacoes_gerais', 'recomendacoes',
        ];
        fields.forEach((f) => {
          const val = trySet(f, p[f]);
          if (val !== null) updated[f] = val;
        });
        return updated;
      });

      if (p.sintomas && Array.isArray(p.sintomas) && p.sintomas.length > 0) {
        setSintomas(p.sintomas);
        filled.add('sintomas');
      }
      if (p.comportamento && Array.isArray(p.comportamento) && p.comportamento.length > 0) {
        setComportamento(p.comportamento);
        filled.add('comportamento');
      }
      if (p.exames_solicitados && Array.isArray(p.exames_solicitados) && p.exames_solicitados.length > 0) {
        setExames(p.exames_solicitados);
        filled.add('exames_solicitados');
      }
      if (p.medicamentos && Array.isArray(p.medicamentos) && p.medicamentos.length > 0) {
        setMedicamentos(p.medicamentos);
        filled.add('medicamentos');
      }

      setAiFields(filled);
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const isPersonalizado = prontuarioType === 'personalizado';

  const renderField = (label, field, type = 'text', options = {}) => {
    const isAi = aiFields.has(field);
    return (
      <div className={`pront-field ${isAi ? 'ai-filled' : ''}`} style={options.style}>
        <label className="pront-label">
          {label}
          {isAi && (
            <span className="ai-badge" title="Preenchido via IA">
              <Sparkles size={10} />
              IA
            </span>
          )}
        </label>
        {type === 'textarea' ? (
          <textarea
            className="pront-input pront-textarea"
            rows={options.rows || 2}
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            disabled={!editMode}
          />
        ) : type === 'select' ? (
          <select
            className="pront-input pront-select"
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            disabled={!editMode}
          >
            <option value="">Selecione</option>
            {options.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            className="pront-input"
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            disabled={!editMode}
            step={options.step}
          />
        )}
      </div>
    );
  };

  const renderTags = (label, items, setItems, input, setInput, tagClass, fieldKey) => {
    const isAi = aiFields.has(fieldKey);
    return (
      <div className={`pront-field ${isAi ? 'ai-filled' : ''}`}>
        <label className="pront-label">
          {label}
          {isAi && (
            <span className="ai-badge" title="Preenchido via IA">
              <Sparkles size={10} />
              IA
            </span>
          )}
        </label>
        <div className="pront-tags">
          {items.length > 0 ? items.map((item, i) => (
            <span key={i} className={`tag ${tagClass}`}>
              {item}
              {editMode && (
                <X size={12} className="tag-remove" onClick={() => removeTag(items, setItems, i)} />
              )}
            </span>
          )) : (
            <span className="pront-empty">Nenhum item registrado</span>
          )}
        </div>
        {editMode && (
          <input
            type="text"
            className="pront-input mt-2"
            placeholder="Digite e pressione Enter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(items, setItems, input, setInput);
              }
            }}
          />
        )}
      </div>
    );
  };

  const SectionHeader = ({ icon: IconComponent, title }) => {
    if (isPersonalizado) {
      return (
        <div className="pront-section-header">
          <IconComponent size={16} />
          <h3>{title}</h3>
        </div>
      );
    }
    return (
      <div className="pront-section-header pront-section-header--simple">
        <h3>{title}</h3>
      </div>
    );
  };

  return (
    <div className="animate-fade">
      {/* Toolbar */}
      <div className="pront-toolbar no-print">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Prontuário #{numeroProntuario}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Registro clínico veterinário
            </p>
          </div>
        </div>
        <div className="pront-toolbar-actions">
          {/* Type Toggle */}
          <div className="pront-type-toggle">
            <button
              className={`pront-type-btn ${prontuarioType === 'personalizado' ? 'active' : ''}`}
              onClick={() => setProntuarioType('personalizado')}
            >
              <Palette size={13} />
              Personalizado
            </button>
            <button
              className={`pront-type-btn ${prontuarioType === 'simples' ? 'active' : ''}`}
              onClick={() => setProntuarioType('simples')}
            >
              <FileText size={13} />
              Simples
            </button>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setEditMode(!editMode)}>
            {editMode ? <Lock size={14} /> : <Edit size={14} />}
            <span className="btn-label">{editMode ? 'Bloquear' : 'Editar'}</span>
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Printer size={14} />
            <span className="btn-label">Imprimir</span>
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => handleSave('incompleto')} style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
            <Clock size={14} />
            <span className="btn-label">Salvar Incompleto</span>
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleCancel} style={{ borderColor: '#dc2626', color: '#dc2626' }}>
            <Trash2 size={14} />
            <span className="btn-label">Cancelar</span>
          </button>
          <button className="btn btn-sm" onClick={handleFinalize} style={{ background: '#16a34a', color: 'white', border: 'none' }}>
            <CheckCircle size={14} />
            <span className="btn-label">Finalizar</span>
          </button>
        </div>
      </div>

      <div className="pront-layout">
        {/* Coluna Esquerda: Áudio */}
        <div className="pront-sidebar no-print">
          <AudioUpload onTranscription={handleTranscriptionData} />

          {transcricao && (
            <div className="pront-transcription">
              <div className="pront-transcription-header">
                <FileText size={14} />
                <span>Transcrição do Áudio</span>
              </div>
              <p className="pront-transcription-text">{transcricao}</p>
            </div>
          )}

          {/* Customization Controls (Personalizado only) */}
          {isPersonalizado && (
            <div className="card mt-4">
              <div className="section-header" style={{ marginBottom: '12px' }}>
                <div className="section-icon blue">
                  <Palette size={16} />
                </div>
                <h3 style={{ fontSize: '0.9rem' }}>Personalização</h3>
              </div>
              <div className="form-group">
                <label className="form-label">Cor do Cabeçalho</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="color-picker"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{customColor}</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Logo do Estabelecimento</label>
                <div
                  className="logo-upload-area"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {customLogo ? (
                    <img src={customLogo} alt="Logo" className="logo-preview" />
                  ) : (
                    <>
                      <Upload size={20} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Upload logo</span>
                    </>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
                {customLogo && (
                  <button className="btn btn-outline btn-sm mt-2 w-full" onClick={() => setCustomLogo(null)}>
                    Remover logo
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita: Documento Prontuário */}
        <div className={`pront-document ${isPersonalizado ? '' : 'pront-document--simple'}`}>
          {/* Cabeçalho Institucional */}
          <div
            className="pront-doc-header"
            style={isPersonalizado ? { background: `linear-gradient(135deg, ${customColor} 0%, ${customColor}dd 100%)` } : {}}
          >
            <div className="pront-doc-logo">
              {isPersonalizado && (
                <img
                  src={customLogo || '/logo.png'}
                  alt="Logo"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div>
                <h1>{isPersonalizado ? 'AnimaListen' : 'Prontuário Clínico Veterinário'}</h1>
                {isPersonalizado && (
                  <span className="pront-doc-subtitle">Clínica Veterinária — Prontuário Clínico</span>
                )}
              </div>
            </div>
            <div className="pront-doc-meta">
              <div className="pront-doc-meta-item">
                <span className="pront-doc-meta-label">Nº Prontuário</span>
                <span className="pront-doc-meta-value">#{numeroProntuario}</span>
              </div>
              <div className="pront-doc-meta-item">
                <span className="pront-doc-meta-label">Data</span>
                <span className="pront-doc-meta-value">{dateStr}</span>
              </div>
              <div className="pront-doc-meta-item">
                <span className="pront-doc-meta-label">Hora</span>
                <span className="pront-doc-meta-value">{timeStr}</span>
              </div>
            </div>
          </div>

          <div className="pront-doc-divider" />

          {/* Seção: Tutor */}
          <div className="pront-section">
            <SectionHeader icon={User} title="Identificação do Tutor / Responsável" />
            {editMode && !prontuario && (
              <div className="pront-field" style={{ marginBottom: '12px' }}>
                <label className="pront-label">Selecionar Tutor Cadastrado</label>
                <select
                  className="pront-input pront-select"
                  value={selectedTutorId}
                  onChange={(e) => handleSelectTutor(e.target.value)}
                >
                  <option value="">— Selecione um tutor —</option>
                  {tutores.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} {t.cpf ? `(CPF: ${t.cpf})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="pront-grid-2">
              {renderField('Nome Completo', 'tutor_nome')}
              {renderField('CPF', 'tutor_cpf')}
            </div>
            <div className="pront-grid-3">
              {renderField('Telefone', 'tutor_telefone', 'tel')}
              {renderField('E-mail', 'tutor_email', 'email')}
              {renderField('Endereço', 'tutor_endereco')}
            </div>
          </div>

          <div className="pront-doc-divider" />

          {/* Seção: Animal */}
          <div className="pront-section">
            <SectionHeader icon={PawPrint} title="Identificação do Paciente" />
            {editMode && !prontuario && selectedTutorId && (
              <div className="pront-field" style={{ marginBottom: '12px' }}>
                <label className="pront-label">Selecionar Paciente do Tutor</label>
                <select
                  className="pront-input pront-select"
                  value={selectedPacienteId}
                  onChange={(e) => handleSelectPaciente(e.target.value)}
                >
                  <option value="">— Selecione um paciente —</option>
                  {pacientesDoTutor.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} {p.especie ? `(${p.especie})` : ''}
                    </option>
                  ))}
                </select>
                {pacientesDoTutor.length === 0 && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                    Este tutor não tem pacientes cadastrados.
                  </p>
                )}
              </div>
            )}
            <div className="pront-grid-3">
              {renderField('Nome', 'animal_nome')}
              {renderField('Espécie', 'animal_especie')}
              {renderField('Raça', 'animal_raca')}
            </div>
            <div className="pront-grid-4">
              {renderField('Idade', 'animal_idade')}
              {renderField('Sexo', 'animal_sexo', 'select', { options: ['Macho', 'Fêmea', 'Macho Castrado', 'Fêmea Castrada'] })}
              {renderField('Peso (kg)', 'animal_peso', 'number', { step: '0.1' })}
            </div>
            <div className="pront-grid-2">
              {renderField('Microchip', 'animal_microchip')}
            </div>
          </div>

          <div className="pront-doc-divider" />

          {/* Seção: Anamnese */}
          <div className="pront-section">
            <SectionHeader icon={ClipboardList} title="Anamnese" />
            {renderField('Queixa Principal', 'queixa_principal', 'textarea', { rows: 2 })}
            {renderField('Histórico da Doença Atual', 'historico_doenca', 'textarea', { rows: 3 })}
            {renderTags('Sintomas Observados', sintomas, setSintomas, sintomaInput, setSintomaInput, 'tag-red', 'sintomas')}
            {renderTags('Alterações Comportamentais', comportamento, setComportamento, comportamentoInput, setComportamentoInput, 'tag-yellow', 'comportamento')}
          </div>

          <div className="pront-doc-divider" />

          {/* Seção: Exame Físico */}
          <div className="pront-section">
            <SectionHeader icon={Activity} title="Exame Físico" />
            <div className="pront-vitals">
              <div className="pront-vital-card">
                <span className="pront-vital-label">Temperatura</span>
                <div className="pront-vital-value">
                  <input
                    type="number"
                    className="pront-vital-input"
                    value={form.temperatura}
                    onChange={(e) => handleChange('temperatura', e.target.value)}
                    disabled={!editMode}
                    placeholder="—"
                    step="0.1"
                  />
                  <span className="pront-vital-unit">°C</span>
                </div>
              </div>
              <div className="pront-vital-card">
                <span className="pront-vital-label">Freq. Cardíaca</span>
                <div className="pront-vital-value">
                  <input
                    type="number"
                    className="pront-vital-input"
                    value={form.frequencia_cardiaca}
                    onChange={(e) => handleChange('frequencia_cardiaca', e.target.value)}
                    disabled={!editMode}
                    placeholder="—"
                  />
                  <span className="pront-vital-unit">bpm</span>
                </div>
              </div>
              <div className="pront-vital-card">
                <span className="pront-vital-label">Freq. Respiratória</span>
                <div className="pront-vital-value">
                  <input
                    type="number"
                    className="pront-vital-input"
                    value={form.frequencia_respiratoria}
                    onChange={(e) => handleChange('frequencia_respiratoria', e.target.value)}
                    disabled={!editMode}
                    placeholder="—"
                  />
                  <span className="pront-vital-unit">mrm</span>
                </div>
              </div>
              <div className="pront-vital-card">
                <span className="pront-vital-label">Mucosas</span>
                <div className="pront-vital-value">
                  <input
                    type="text"
                    className="pront-vital-input"
                    value={form.mucosas}
                    onChange={(e) => handleChange('mucosas', e.target.value)}
                    disabled={!editMode}
                    placeholder="—"
                    style={{ textAlign: 'left' }}
                  />
                </div>
              </div>
            </div>
            {renderField('Palpação Abdominal', 'palpacao_abdominal', 'textarea', { rows: 2 })}
          </div>

          <div className="pront-doc-divider" />

          {/* Seção: Diagnóstico e Tratamento */}
          <div className="pront-section">
            <SectionHeader icon={Stethoscope} title="Hipótese Diagnóstica e Conduta" />
            {renderField('Suspeita Diagnóstica', 'suspeita_diagnostica', 'textarea', { rows: 2 })}
            {renderTags('Exames Solicitados', exames, setExames, exameInput, setExameInput, 'tag-blue', 'exames_solicitados')}
            {renderField('Tratamento Prescrito', 'tratamento_prescrito', 'textarea', { rows: 3 })}
            {renderTags('Medicamentos Prescritos', medicamentos, setMedicamentos, medicamentoInput, setMedicamentoInput, 'tag-blue', 'medicamentos')}
          </div>

          <div className="pront-doc-divider" />

          {/* Seção: Observações */}
          <div className="pront-section">
            <SectionHeader icon={MessageSquare} title="Observações e Recomendações" />
            {renderField('Observações Clínicas Gerais', 'observacoes_gerais', 'textarea', { rows: 3 })}
            {renderField('Recomendações ao Tutor', 'recomendacoes', 'textarea', { rows: 3 })}
          </div>

          <div className="pront-doc-divider" />

          {/* Rodapé / Assinatura */}
          <div className="pront-footer">
            <div className="pront-signature">
              <div className="pront-signature-line" />
              <span>Assinatura e Carimbo do Médico Veterinário</span>
              <span className="pront-signature-crmv">CRMV nº ___________</span>
            </div>
            <div className="pront-footer-info">
              <span>Documento gerado pelo sistema AnimaListen</span>
              <span>{dateStr} às {timeStr}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
