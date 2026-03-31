import React, { useEffect, useMemo, useState } from 'react';
import {
  Save,
  ArrowLeft,
  Edit,
  Lock,
  Mic,
  Printer,
  FileText,
  X,
  User,
  PawPrint,
  ClipboardList,
  Activity,
  Stethoscope,
  Check,
} from 'lucide-react';
import AudioUpload from '@/components/AudioUpload';
import { useAuth } from '@/contexts/AuthContext';
import { apiJson } from '@/utils/api';


export default function NovoProntuarioPage({ triagemId, setCurrentPage, prontuarioOriginal = null }) {
  const { token } = useAuth();
  const [editMode, setEditMode] = useState(!prontuarioOriginal);
  const [showAudioPanel, setShowAudioPanel] = useState(false);

  const [numeroProntuario] = useState(() => {
    return prontuarioOriginal?.numero_prontuario || `PRT-${Math.floor(Math.random() * 100000)}`;
  });

  const [form, setForm] = useState({
    tutor_nome: '', tutor_cpf: '', tutor_telefone: '', tutor_endereco: '',
    animal_nome: '', animal_especie: '', animal_raca: '', animal_idade: '', animal_sexo: '',
    animal_peso: '', animal_microchip: '', animal_porte: '', animal_pelagem: '',
    animal_alergias: '', animal_doenca_cronica: '', animal_castrado: false,
    queixa_principal: '', historico_doenca: '', evolucao_clinica: '',
    temperatura: '', frequencia_cardiaca: '', frequencia_respiratoria: '', tempo_preenchimento_capilar: '',
    glicose: '',
    hidratacao: '', linfonodos: '', mucosas: '', palpacao_abdominal: '', outros_achados: '',
    suspeita_diagnostica: '', diagnostico_definitivo: '', tratamento_prescrito: '',
    procedimentos_realizados: '', atualizacao_vacinal: '',
    observacoes_gerais: '', recomendacoes: '', animal_id: '',
    veterinario_crmv: '', termo_consentimento_assinado: false,
  });

  const [sintomas, setSintomas] = useState([]);
  const [comportamento, setComportamento] = useState([]);
  const [exames, setExames] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);

  const [transcricao, setTranscricao] = useState('');
  const [aiFields, setAiFields] = useState(new Set());

  useEffect(() => {
    if (!token || !triagemId) return;

    apiJson(`/triagens/${triagemId}`, { token })
      .then((data) => {
        if (!data?.animal) return;

        setForm((prev) => ({
          ...prev,
          animal_id: data.animal_id,
          queixa_principal: data.queixa_principal || '',
          animal_nome: data.animal.nome || '',
          animal_especie: data.animal.especie || '',
          animal_raca: data.animal.raca || '',
          animal_idade: data.animal.idade_calculada || '',
          animal_sexo: data.animal.sexo || '',
          animal_peso: data.animal.peso ? String(data.animal.peso) : '',
          animal_microchip: data.animal.microchip || '',
          animal_pelagem: data.animal.pelagem || '',
          animal_castrado: data.animal.castrado || false,
          tutor_nome: data.tutor ? data.tutor.nome_completo : '',
          tutor_cpf: data.tutor ? data.tutor.cpf : '',
          tutor_telefone: data.tutor ? data.tutor.telefone : '',
          tutor_endereco: data.tutor
            ? `${data.tutor.endereco_rua || ''}, ${data.tutor.endereco_numero || ''} - ${data.tutor.endereco_bairro || ''}, ${data.tutor.endereco_cidade || ''}`
            : '',
        }));
      })
      .catch((err) => console.error(err));
  }, [token, triagemId]);

  const handleCancelAtendimento = () => {
    if (!window.confirm('Tem certeza que deseja cancelar este atendimento?')) return;
    setCurrentPage('triagens-pendentes');
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const parseTextList = (value) => {
    return value
      .split(/\r?\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleTranscriptionData = (data) => {
    if (data?.texto) setTranscricao(data.texto);
    if (!data?.prontuario) return;

    const p = data.prontuario;
    const filled = new Set(aiFields);

    const sanitizeTPCValue = (value) => {
      if (value === null || value === undefined || value === '') return null;
      if (typeof value === 'number' && Number.isFinite(value)) return String(value);
      const match = String(value).replace(',', '.').match(/\d+(\.\d+)?/);
      return match ? match[0] : null;
    };

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
        'queixa_principal', 'historico_doenca', 'evolucao_clinica',
        'temperatura', 'frequencia_cardiaca', 'frequencia_respiratoria', 'tempo_preenchimento_capilar',
        'glicose',
        'hidratacao', 'linfonodos', 'mucosas', 'palpacao_abdominal', 'outros_achados',
        'suspeita_diagnostica', 'diagnostico_definitivo', 'tratamento_prescrito',
        'procedimentos_realizados', 'atualizacao_vacinal',
        'observacoes_gerais', 'recomendacoes',
      ];

      fields.forEach((f) => {
        const sourceValue = f === 'tempo_preenchimento_capilar' ? sanitizeTPCValue(p[f]) : p[f];
        const val = trySet(f, sourceValue);
        if (val !== null) updated[f] = val;
      });

      const historicoBruto = (p.historico_doenca || '').toString().trim();
      const sintomasIA = Array.isArray(p.sintomas) ? p.sintomas.filter(Boolean) : [];
      const comportamentoIA = Array.isArray(p.comportamento) ? p.comportamento.filter(Boolean) : [];

      if (historicoBruto) {
        updated.historico_doenca = historicoBruto;
        filled.add('historico_doenca');
      } else if (sintomasIA.length > 0 || comportamentoIA.length > 0) {
        const linhas = [];
        if (sintomasIA.length > 0) linhas.push(`Sintomas relatados: ${sintomasIA.join(', ')}.`);
        if (comportamentoIA.length > 0) linhas.push(`Comportamento: ${comportamentoIA.join(', ')}.`);
        updated.historico_doenca = linhas.join('\n');
        filled.add('historico_doenca');
      }

      const obsIA = (p.observacoes_gerais || '').toString().trim();
      const recIA = (p.recomendacoes || '').toString().trim();

      if (obsIA) {
        updated.observacoes_gerais = obsIA;
        filled.add('observacoes_gerais');
      }

      if (recIA) {
        updated.recomendacoes = recIA;
        filled.add('recomendacoes');
      }

      const outrosAchados = trySet('outros_achados', p.outros_achados ?? p.outros_exames_fisicos);
      if (outrosAchados !== null) updated.outros_achados = outrosAchados;

      return updated;
    });

    if (p.sintomas?.length > 0) {
      setSintomas(p.sintomas);
      filled.add('sintomas');
    }
    if (p.comportamento?.length > 0) {
      setComportamento(p.comportamento);
      filled.add('comportamento');
    }
    if (p.exames_solicitados?.length > 0) {
      setExames(p.exames_solicitados);
      filled.add('exames_solicitados');
    }
    if (p.medicamentos?.length > 0) {
      setMedicamentos(p.medicamentos);
      filled.add('medicamentos');
    }

    setAiFields(filled);
  };

  const handleSaveBackend = async () => {
    if (!form.animal_id) {
      alert('O ID do paciente e obrigatorio.');
      return;
    }

    const payload = {
      animal_id: parseInt(form.animal_id, 10),
      triagem_id: triagemId || null,
      queixa_principal: form.queixa_principal,
      historico_doenca: form.historico_doenca,
      evolucao_clinica: form.evolucao_clinica,
      sintomas: sintomas.length > 0 ? sintomas : null,
      comportamento: comportamento.length > 0 ? comportamento : null,
      temperatura: form.temperatura ? parseFloat(form.temperatura) : null,
      frequencia_cardiaca: form.frequencia_cardiaca ? parseInt(form.frequencia_cardiaca, 10) : null,
      frequencia_respiratoria: form.frequencia_respiratoria ? parseInt(form.frequencia_respiratoria, 10) : null,
      tempo_preenchimento_capilar: form.tempo_preenchimento_capilar,
      glicose: form.glicose ? parseFloat(form.glicose) : null,
      hidratacao: form.hidratacao,
      linfonodos: form.linfonodos,
      mucosas: form.mucosas,
      palpacao_abdominal: form.palpacao_abdominal,
      outros_achados: form.outros_achados,
      suspeita_diagnostica: form.suspeita_diagnostica,
      diagnostico_definitivo: form.diagnostico_definitivo,
      tratamento_prescrito: form.tratamento_prescrito,
      medicamentos: medicamentos.length > 0 ? medicamentos : null,
      exames_solicitados: exames.length > 0 ? exames : null,
      procedimentos_realizados: form.procedimentos_realizados,
      atualizacao_vacinal: form.atualizacao_vacinal,
      observacoes_gerais: form.observacoes_gerais,
      recomendacoes: form.recomendacoes,
      veterinario_crmv: form.veterinario_crmv,
      termo_consentimento_assinado: form.termo_consentimento_assinado,
    };

    try {
      await apiJson('/prontuarios', {
        method: 'POST',
        token,
        body: payload,
      });
      alert('Prontuario salvo com sucesso!');
      setCurrentPage('dashboard');
    } catch (err) {
      alert(err.message || 'Erro ao salvar prontuario.');
    }
  };

  const now = useMemo(() => new Date(), []);
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const getPrintValue = (value, fallback = 'Nao informado') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    return value;
  };

  const renderField = (label, field, type = 'text', options = {}) => {
    const isAi = aiFields.has(field);
    const value = form[field] ?? '';

    return (
      <div className={`pront-field ${isAi ? 'ai-filled' : ''}`} style={options.style}>
        <div className="pront-label-row">
          <label className="pront-label">{label}</label>
          {isAi && <span className="ai-badge" title="Preenchimento automatico">IA</span>}
        </div>

        <div className="pront-screen-field">
          {type === 'textarea' ? (
            <textarea
              className="pront-input pront-textarea"
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
              disabled={!editMode}
              rows={options.rows || 4}
              placeholder={options.placeholder}
            />
          ) : (
            <input
              type={type}
              className="pront-input"
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
              disabled={!editMode}
              step={options.step}
              placeholder={options.placeholder}
            />
          )}
        </div>

        <div className="pront-print-value">{getPrintValue(value, options.printFallback || 'Nao informado')}</div>
      </div>
    );
  };

  const renderListField = (label, items, setItems, fieldKey, options = {}) => {
    const isAi = aiFields.has(fieldKey);

    return (
      <div className={`pront-field ${isAi ? 'ai-filled' : ''}`}>
        <div className="pront-label-row">
          <label className="pront-label">{label}</label>
          {isAi && <span className="ai-badge" title="Preenchimento automatico">IA</span>}
        </div>

        <div className="pront-screen-field">
          <textarea
            className="pront-input pront-textarea"
            rows={options.rows || 3}
            value={items.join('\n')}
            onChange={(e) => setItems(parseTextList(e.target.value))}
            disabled={!editMode}
          />
        </div>

        <div className="pront-print-value">{items.length > 0 ? items.join('\n') : 'Nao informado'}</div>
      </div>
    );
  };

  const renderBooleanField = (label, value, onChange, options = {}) => (
    <div className="pront-field">
      <div className="pront-screen-field">
        <label className={`pront-checkbox-wrapper ${!editMode ? 'checkbox-disabled' : ''}`} style={options.wrapperStyle}>
          <input
            type="checkbox"
            className="pront-checkbox-input"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={!editMode}
            style={options.inputStyle}
          />
          <span className="pront-checkbox-label" style={options.labelStyle}>{label}</span>
        </label>
      </div>

      <div className="pront-print-check">
        <strong>{label}:</strong> {value ? 'Sim' : 'Nao'}
      </div>
    </div>
  );

  const SectionHeader = ({ title, icon }) => (
    <div className="pront-section-header">
      {icon}
      <h3>{title}</h3>
    </div>
  );

  return (
    <div className="pront-wrapper animate-fade">
      <div className="pront-toolbar no-print">
        <div className="pront-toolbar-title">
          <button
            className="pront-btn pront-btn-icon"
            onClick={() => setCurrentPage(triagemId ? 'triagens-pendentes' : 'dashboard')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2>Prontuario Medico</h2>
            <p>Registro clinico veterinario completo</p>
          </div>
        </div>

        <div className="pront-toolbar-actions">
          {triagemId && (
            <button className="pront-btn pront-btn-danger" onClick={handleCancelAtendimento}>
              <X size={16} /> Cancelar
            </button>
          )}
          <button className="pront-btn pront-btn-outline" onClick={() => setEditMode(!editMode)}>
            {editMode ? <Lock size={16} /> : <Edit size={16} />}
            {editMode ? 'Bloquear' : 'Editar'}
          </button>
          <button
            className="pront-btn pront-btn-outline"
            onClick={() => setShowAudioPanel((prev) => !prev)}
            style={showAudioPanel ? { borderColor: '#8ed5db', background: '#edf9fa', color: '#0e7c86' } : undefined}
          >
            <Mic size={16} /> {showAudioPanel ? 'Ocultar Microfone' : 'Microfone'}
          </button>
          <button className="pront-btn pront-btn-outline" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir
          </button>
          <button className="pront-btn pront-btn-success" onClick={handleSaveBackend}>
            <Save size={16} /> Salvar Prontuario
          </button>
        </div>
      </div>

      <div className={`pront-layout ${showAudioPanel || transcricao ? '' : 'pront-layout-no-sidebar'}`}>
        {(showAudioPanel || transcricao) && (
          <aside className="pront-sidebar no-print">
            {showAudioPanel && <AudioUpload onTranscription={handleTranscriptionData} />}

            {transcricao && (
              <div className="pront-transcription">
                <div className="pront-transcription-header">
                  <FileText size={18} />
                  <span>Transcricao de Audio</span>
                </div>
                <p className="pront-transcription-text">"{transcricao}"</p>
              </div>
            )}
          </aside>
        )}

        <article className="pront-document">
          <header className="pront-doc-header">
            <div>
              <h1>Prontuario Clinico Veterinario</h1>
              <p>Documento oficial de atendimento medico-veterinario</p>
            </div>
            <div className="pront-doc-meta">
              <span className="pront-badge-numero">#{numeroProntuario}</span>
              <div>Data: <strong>{dateStr}</strong></div>
              <div>Hora: <strong>{timeStr}</strong></div>
            </div>
          </header>

          <section className="pront-section">
            <SectionHeader title="Identificacao do Responsavel" icon={<User size={16} />} />
            <div className="pront-grid-2">
              {renderField('Nome completo', 'tutor_nome')}
              {renderField('CPF', 'tutor_cpf')}
            </div>
            <div className="pront-grid-1-2">
              {renderField('Telefone', 'tutor_telefone')}
              {renderField('Endereco', 'tutor_endereco')}
            </div>
          </section>

          <section className="pront-section">
            <SectionHeader title="Identificacao do Paciente" icon={<PawPrint size={16} />} />
            <div className="pront-grid-4">
              {renderField('Nome', 'animal_nome')}
              {renderField('Especie', 'animal_especie')}
              {renderField('Raca', 'animal_raca')}
              {renderField('Pelagem', 'animal_pelagem')}
            </div>
            <div className="pront-grid-4">
              {renderField('Idade', 'animal_idade')}
              {renderField('Sexo', 'animal_sexo')}
              {renderField('Peso (kg)', 'animal_peso', 'number', { step: '0.1' })}
              {renderField('Microchip', 'animal_microchip')}
            </div>

            {renderBooleanField(
              'Paciente castrado/esterilizado',
              form.animal_castrado,
              (checked) => handleChange('animal_castrado', checked)
            )}
          </section>

          <section className="pront-section">
            <SectionHeader title="Anamnese e Evolucao" icon={<ClipboardList size={16} />} />
            <div className="pront-grid-1">
              {renderField('Queixa principal', 'queixa_principal', 'textarea')}
              {renderField('Historico da doenca atual', 'historico_doenca', 'textarea')}
              {renderField('Evolucao clinica', 'evolucao_clinica', 'textarea')}
              {renderListField('Sintomas relatados', sintomas, setSintomas, 'sintomas')}
              {renderListField('Comportamento', comportamento, setComportamento, 'comportamento')}
            </div>
          </section>

          <section className="pront-section">
            <SectionHeader title="Exame Fisico (Sinais Vitais)" icon={<Activity size={16} />} />
            <div className="pront-grid-4">
              {renderField('Temp. (C)', 'temperatura', 'number', { step: '0.1' })}
              {renderField('FC (bpm)', 'frequencia_cardiaca', 'number')}
              {renderField('FR (mrm)', 'frequencia_respiratoria', 'number')}
              {renderField('TPC (s)', 'tempo_preenchimento_capilar', 'number', { step: '0.1' })}
            </div>
            <div className="pront-grid-4">
              {renderField('Glicose (mg/dL)', 'glicose', 'number', { step: '0.1' })}
              {renderField('Hidratacao', 'hidratacao')}
              {renderField('Linfonodos', 'linfonodos')}
              {renderField('Mucosas', 'mucosas')}
            </div>
            <div className="pront-grid-1">
              {renderField('Palpacao abdominal', 'palpacao_abdominal', 'textarea')}
              {renderField('Outros achados', 'outros_achados', 'textarea')}
            </div>
          </section>

          <section className="pront-section">
            <SectionHeader title="Diagnostico" icon={<Stethoscope size={16} />} />
            <div className="pront-grid-1">
              {renderField('Hipoteses diagnosticas', 'suspeita_diagnostica', 'textarea')}
              {renderField('Diagnostico definitivo', 'diagnostico_definitivo', 'textarea')}
            </div>
          </section>

          <section className="pront-section">
            <SectionHeader title="Conduta e Tratamento" icon={<FileText size={16} />} />
            <div className="pront-grid-1">
              {renderListField('Exames solicitados', exames, setExames, 'exames_solicitados')}
              {renderField('Procedimentos realizados', 'procedimentos_realizados', 'textarea')}
              {renderField('Tratamento prescrito', 'tratamento_prescrito', 'textarea')}
              {renderListField('Medicamentos adicionais', medicamentos, setMedicamentos, 'medicamentos')}
            </div>
          </section>

          <section className="pront-section">
            <SectionHeader title="Observacoes Finais" icon={<Check size={16} />} />
            <div className="pront-grid-1">
              {renderField('Atualizacao vacinal', 'atualizacao_vacinal', 'textarea')}
              {renderField('Observacoes gerais', 'observacoes_gerais', 'textarea')}
              {renderField('Recomendacoes', 'recomendacoes', 'textarea')}
            </div>

            {renderBooleanField(
              'Termo de consentimento livre e esclarecido assinado pelo responsavel legal',
              form.termo_consentimento_assinado,
              (checked) => handleChange('termo_consentimento_assinado', checked),
              {
                wrapperStyle: { width: '100%', background: '#f4fbf8', borderColor: '#cde9dd', padding: '14px' },
                inputStyle: { accentColor: '#1f8a62' },
                labelStyle: { color: '#0f5132' },
              }
            )}
          </section>

          <footer className="pront-footer">
            <div className="pront-footer-crmv">
              <span>CRMV do Medico Veterinario</span>
              <input
                type="text"
                className="pront-input"
                value={form.veterinario_crmv}
                onChange={(e) => handleChange('veterinario_crmv', e.target.value)}
                disabled={!editMode}
                placeholder="Insira o CRMV"
              />
              <div className="pront-print-value">{getPrintValue(form.veterinario_crmv)}</div>
            </div>

            <div className="pront-signature">
              <div className="pront-signature-line" />
              <div className="pront-signature-text">Assinatura e carimbo</div>
            </div>
          </footer>

          <div className="pront-generated-at print-only">
            Documento gerado em {dateStr} as {timeStr}
          </div>
        </article>
      </div>
    </div>
  );
}
