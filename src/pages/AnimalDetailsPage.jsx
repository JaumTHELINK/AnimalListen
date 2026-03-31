import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Edit, Calendar, Activity,
  Pill, FileText, Syringe, Clock,
  Paperclip, FileCheck, Phone, MapPin, PawPrint as Paw, User, Search,
  Trash2, Plus, Weight, ClipboardList, Scale, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, CalendarClock, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AnimalModal } from '@/pages/AnimaisPage';
import { apiJson, apiRequest } from '@/utils/api';

const TABS = [
  { id: 'historico', label: 'Histórico', icon: Clock },
  { id: 'pesos', label: 'Pesos', icon: Scale },
  { id: 'consultas', label: 'Consultas', icon: FileText },
  { id: 'vacinas', label: 'Vacinas', icon: Syringe },
  { id: 'medicamentos', label: 'Medicamentos', icon: Pill },
  { id: 'prescricoes', label: 'Prescrições', icon: FileCheck },
  { id: 'exames', label: 'Exames', icon: Search },
  { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
  { id: 'retornos', label: 'Retornos', icon: ArrowLeft },
  { id: 'atestados', label: 'Atestados e Termos', icon: FileText },
  { id: 'cirurgias', label: 'Cirurgias', icon: Activity },
  { id: 'internacao', label: 'Internação', icon: Activity },
  { id: 'anexos', label: 'Anexos', icon: Paperclip },
];

const AnimalDetailsPage = ({ animalId, setCurrentPage }) => {
  const { token } = useAuth();
  const [animal, setAnimal] = useState(null);
  const [prontuarios, setProntuarios] = useState([]);
  const [activeTab, setActiveTab] = useState('historico');
  const [tutores, setTutores] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pesos, setPesos] = useState([]);
  const [novoPeso, setNovoPeso] = useState({ data: '', peso: '', condicao_corporal: '' });
  const [savingPeso, setSavingPeso] = useState(false);
  const [showPesoModal, setShowPesoModal] = useState(false);
  const [novaVacina, setNovaVacina] = useState({
    nome_vacina: '',
    data_aplicacao: '',
    proxima_dose: '',
    lote: '',
    responsavel_aplicacao: ''
  });
  const [savingVacina, setSavingVacina] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [animalData, prontData, tutoresData, pesosData] = await Promise.all([
        apiJson(`/animais/${animalId}`, { token }),
        apiJson(`/prontuarios?animal_id=${animalId}`, { token }),
        apiJson('/tutores', { token }),
        apiJson(`/animais/${animalId}/pesos`, { token })
      ]);
      prontData.sort((a, b) => new Date(b.data_atendimento) - new Date(a.data_atendimento));
      setAnimal(animalData);
      setTutores(tutoresData);
      setPesos(pesosData);
      setProntuarios(prontData);
    } catch (error) {
      console.error("Erro ao buscar dados do animal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newFotoBase64 = reader.result;

        // Optimistic update
        setAnimal(prev => ({ ...prev, foto_base64: newFotoBase64 }));

        const payload = {
          ...animal,
          foto_base64: newFotoBase64
        };

        try {
          await apiJson(`/animais/${animalId}`, {
            method: 'PUT',
            token,
            body: payload
          });
        } catch (error) {
          console.error("Erro ao atualizar foto:", error);
          // Revert on error
          fetchData();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (animalId) {
      fetchData();
    }
  }, [animalId, token]);

  if (loading) {
    return <div className="page-container"><p>Carregando informações do paciente...</p></div>;
  }

  if (!animal) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Animal não encontrado.</div>
        <button className="btn btn-secondary" onClick={() => setCurrentPage('animais')}>
          Voltar para Lista
        </button>
      </div>
    );
  }

  const renderTabContent = () => {
    if (activeTab === 'historico') {
      return (
        <div className="history-timeline">
          <div className="history-header">
            <h3>Histórico de Registros Clinicos</h3>
            <span className="badge badge-outline">{prontuarios.length} registros</span>
          </div>

          {prontuarios.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} color="#cbd5e1" />
              <p>Nenhum prontuário registrado para este animal.</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '16px' }}
                onClick={() => setCurrentPage(`novo-prontuario-novo-${animal.id}`)}
              >
                Criar Novo Prontuário
              </button>
            </div>
          ) : (
            <div className="timeline-container">
              {prontuarios.map(prontuario => (
                <div key={prontuario.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-date">
                    <span className="date-day">{new Date(prontuario.data_atendimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                    <span className="date-year">{new Date(prontuario.data_atendimento).getFullYear()}</span>
                  </div>
                  <div className="timeline-content card">
                    <div className="card-header" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="icon-circle bg-blue">
                          <StethoscopeIcon size={20} color="var(--color-primary)" />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '16px' }}>Prontuário Clínico #{prontuario.id}</h4>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {new Date(prontuario.data_atendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <button className="btn-icon" title="Ver Prontuário" onClick={() => setCurrentPage('prontuarios')}>
                        <FileText size={16} />
                      </button>
                    </div>
                    <div className="card-body" style={{ padding: '16px' }}>
                      {prontuario.queixa_principal && (
                        <div style={{ marginBottom: '12px' }}>
                          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Motivo / Queixa:</strong>
                          <p style={{ margin: 0, fontSize: '14px' }}>{prontuario.queixa_principal}</p>
                        </div>
                      )}
                      {prontuario.diagnostico_definitivo && (
                        <div style={{ marginBottom: '12px' }}>
                          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Diagnóstico:</strong>
                          <p style={{ margin: 0, fontSize: '14px' }}>{prontuario.diagnostico_definitivo}</p>
                        </div>
                      )}
                      <div className="vital-signs-min" style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                        {prontuario.peso && <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Peso: <strong>{prontuario.peso}kg</strong></span>}
                        {prontuario.temperatura && <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Temp: <strong>{prontuario.temperatura}°C</strong></span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'pesos') {
      const handleAddPeso = async () => {
        if (!novoPeso.data || !novoPeso.peso) return false;
        setSavingPeso(true);
        try {
          await apiJson(`/animais/${animalId}/pesos`, {
            method: 'POST',
            token,
            body: {
              data: novoPeso.data,
              peso: parseFloat(novoPeso.peso),
              condicao_corporal: novoPeso.condicao_corporal || null
            }
          });

          setPesos(await apiJson(`/animais/${animalId}/pesos`, { token }));
          const novoP = parseFloat(novoPeso.peso);
          const payloadAtualizacaoAnimal = {
            ...animal,
            peso: novoP,
            condicao_corporal: novoPeso.condicao_corporal || null
          };

          await apiJson(`/animais/${animalId}`, {
            method: 'PUT',
            token,
            body: payloadAtualizacaoAnimal
          });
          setAnimal(prev => ({
            ...prev,
            peso: novoP,
            condicao_corporal: novoPeso.condicao_corporal || null
          }));

          setNovoPeso({ data: '', peso: '', condicao_corporal: '' });
          return true;
        } catch (err) {
          console.error('Erro ao adicionar peso:', err);
          return false;
        } finally {
          setSavingPeso(false);
        }
      };

      const handleDeletePeso = async (pesoId) => {
        try {
          await apiRequest(`/animais/${animalId}/pesos/${pesoId}`, {
            method: 'DELETE',
            token
          });
          setPesos(prev => prev.filter(p => p.id !== pesoId));
        } catch (err) {
          console.error('Erro ao remover peso:', err);
        }
      };

      const pesosOrdenadosAsc = [...pesos].sort((a, b) => new Date(a.data) - new Date(b.data));
      const pesosOrdenadosDesc = [...pesosOrdenadosAsc].reverse();
      const pesoInicial = pesosOrdenadosAsc.length ? pesosOrdenadosAsc[0].peso : null;
      const pesoAtual = pesosOrdenadosAsc.length ? pesosOrdenadosAsc[pesosOrdenadosAsc.length - 1].peso : null;
      const variacaoTotal = pesoAtual != null && pesoInicial != null ? pesoAtual - pesoInicial : null;
      const indicePorId = new Map(pesosOrdenadosAsc.map((item, index) => [item.id, index]));

      return (
        <>
        <div className="wt-section">
          <div className="wt-actions-row">
            <button
              className="btn btn-primary wt-add-btn"
              onClick={() => {
                setNovoPeso((prev) => ({
                  ...prev,
                  data: prev.data || new Date().toISOString().split('T')[0],
                  condicao_corporal: prev.condicao_corporal || animal.condicao_corporal || ''
                }));
                setShowPesoModal(true);
              }}
            >
              <Plus size={16} />
              Novo Registro
            </button>
          </div>

          <div className="wt-summary-row">
            <div className="wt-summary-card">
              <div className="wt-summary-icon wt-summary-icon-primary">
                <Scale size={20} />
              </div>
              <div>
                <div className="wt-summary-label">Peso atual</div>
                <div className="wt-summary-value">{pesoAtual != null ? `${pesoAtual.toFixed(1)} kg` : '--'}</div>
              </div>
            </div>

            <div className="wt-summary-card">
              <div className={`wt-summary-icon ${variacaoTotal > 0 ? 'wt-summary-icon-up' : variacaoTotal < 0 ? 'wt-summary-icon-down' : 'wt-summary-icon-neutral'}`}>
                {variacaoTotal > 0 ? <TrendingUp size={20} /> : variacaoTotal < 0 ? <TrendingDown size={20} /> : <Minus size={20} />}
              </div>
              <div>
                <div className="wt-summary-label">Variação total</div>
                <div className={`wt-summary-value ${variacaoTotal > 0 ? 'wt-text-up' : variacaoTotal < 0 ? 'wt-text-down' : ''}`}>
                  {variacaoTotal != null ? `${variacaoTotal > 0 ? '+' : ''}${variacaoTotal.toFixed(1)} kg` : '--'}
                </div>
              </div>
            </div>

            <div className="wt-summary-card">
              <div className="wt-summary-icon wt-summary-icon-muted">
                <CalendarClock size={20} />
              </div>
              <div>
                <div className="wt-summary-label">Registros</div>
                <div className="wt-summary-value">{pesosOrdenadosAsc.length}</div>
              </div>
            </div>

            <div className="wt-summary-card">
              <div className="wt-summary-icon wt-summary-icon-muted">
                <Activity size={20} />
              </div>
              <div>
                <div className="wt-summary-label">Condição Corporal</div>
                <div className="wt-summary-value wt-summary-body-status">
                  {animal.condicao_corporal === 'magro' && 'Magro'}
                  {animal.condicao_corporal === 'ideal' && 'Ideal'}
                  {animal.condicao_corporal === 'obeso' && 'Obeso'}
                  {!animal.condicao_corporal && '--'}
                </div>
              </div>
            </div>
          </div>

          {/* Records list */}
          {pesos.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '16px' }}>
              <Scale size={48} color="#cbd5e1" />
              <p>Nenhum registro de peso ainda.</p>
            </div>
          ) : (
            <div className="wt-records-list">
              {pesosOrdenadosDesc.map((record) => {
                const indexAsc = indicePorId.get(record.id);
                const pesoAnterior = (indexAsc != null && indexAsc > 0) ? pesosOrdenadosAsc[indexAsc - 1].peso : null;
                const diff = pesoAnterior != null ? (record.peso - pesoAnterior) : null;
                const dataFormatada = new Date(record.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

                return (
                  <div className={`wt-record-card ${diff > 0 ? 'is-up' : diff < 0 ? 'is-down' : 'is-same'}`} key={record.id}>
                    <div className="wt-record-left">
                      <div className="wt-record-date-badge">
                        <Calendar size={14} />
                        <span>{dataFormatada}</span>
                      </div>
                      <span className="wt-record-age">{record.idade_na_data || '--'}</span>
                    </div>
                    <div className="wt-record-center">
                      <span className="wt-record-peso">{record.peso}</span>
                      <span className="wt-record-unit">kg</span>
                    </div>
                    <div className="wt-record-right">
                      {diff != null ? (
                        <span className={`wt-record-diff ${diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'}`}>
                          {diff > 0 ? '↑' : diff < 0 ? '↓' : '='} {diff !== 0 ? `${Math.abs(diff).toFixed(1)} kg` : 'Igual'}
                        </span>
                      ) : (
                        <span className="wt-record-diff first">1º registro</span>
                      )}
                      <button className="wt-delete-btn" title="Remover" onClick={() => handleDeletePeso(record.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {showPesoModal && (
          <div className="modal-overlay" onClick={() => !savingPeso && setShowPesoModal(false)}>
            <div className="modal peso-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header peso-modal-header">
                <h2>Novo Registro de Peso</h2>
                <button
                  onClick={() => !savingPeso && setShowPesoModal(false)}
                  className="btn-icon"
                  disabled={savingPeso}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body peso-modal-body">
                <div className="peso-modal-grid">
                  <div className="wt-field">
                    <label>Data do registro</label>
                    <input
                      type="date"
                      value={novoPeso.data}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNovoPeso((prev) => ({ ...prev, data: e.target.value }))}
                    />
                  </div>

                  <div className="wt-field">
                    <label>Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Ex: 12.4"
                      value={novoPeso.peso}
                      onChange={(e) => setNovoPeso((prev) => ({ ...prev, peso: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="peso-condicao-section">
                  <div className="peso-condicao-title">Condição corporal</div>
                  <div className="peso-condicao-options">
                    <button
                      type="button"
                      className={`peso-condicao-option ${novoPeso.condicao_corporal === 'magro' ? 'active-magro' : ''}`}
                      onClick={() => setNovoPeso((prev) => ({ ...prev, condicao_corporal: 'magro' }))}
                    >
                      Magro
                    </button>
                    <button
                      type="button"
                      className={`peso-condicao-option ${novoPeso.condicao_corporal === 'ideal' ? 'active-ideal' : ''}`}
                      onClick={() => setNovoPeso((prev) => ({ ...prev, condicao_corporal: 'ideal' }))}
                    >
                      Ideal
                    </button>
                    <button
                      type="button"
                      className={`peso-condicao-option ${novoPeso.condicao_corporal === 'obeso' ? 'active-obeso' : ''}`}
                      onClick={() => setNovoPeso((prev) => ({ ...prev, condicao_corporal: 'obeso' }))}
                    >
                      Obeso
                    </button>
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowPesoModal(false)}
                  className="btn btn-secondary"
                  disabled={savingPeso}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const success = await handleAddPeso();
                    if (success) setShowPesoModal(false);
                  }}
                  className="btn btn-primary"
                  disabled={savingPeso || !novoPeso.data || !novoPeso.peso}
                >
                  {savingPeso ? 'Salvando...' : 'Salvar Registro'}
                </button>
              </div>
            </div>
          </div>
        )}
        </>
      );
    }

    if (activeTab === 'vacinas') {
      const handleAddVacina = async () => {
        if (!novaVacina.nome_vacina || !novaVacina.data_aplicacao) return;

        setSavingVacina(true);
        try {
          const vacinaCriada = await apiJson(`/animais/${animalId}/vacinas`, {
            method: 'POST',
            token,
            body: {
              animal_id: animalId,
              nome_vacina: novaVacina.nome_vacina,
              data_aplicacao: novaVacina.data_aplicacao,
              proxima_dose: novaVacina.proxima_dose || null,
              lote: novaVacina.lote || null,
              responsavel_aplicacao: novaVacina.responsavel_aplicacao || null
            }
          });
          setAnimal((prev) => ({
            ...prev,
            vacinas: [...(prev.vacinas || []), vacinaCriada]
          }));
          setNovaVacina({
            nome_vacina: '',
            data_aplicacao: '',
            proxima_dose: '',
            lote: '',
            responsavel_aplicacao: ''
          });
        } catch (err) {
          console.error('Erro ao adicionar vacina:', err);
          alert(err.message || 'Erro ao registrar vacina.');
        } finally {
          setSavingVacina(false);
        }
      };

      const vacinasOrdenadas = [...(animal.vacinas || [])].sort((a, b) => {
        return new Date(b.data_aplicacao) - new Date(a.data_aplicacao);
      });

      const hojeIso = new Date().toISOString().split('T')[0];
      const getVacinaStatus = (vac) => {
        if (!vac.proxima_dose) return 'sem_retorno';
        if (vac.proxima_dose < hojeIso) return 'atrasada';
        if (vac.proxima_dose === hojeIso) return 'hoje';
        return 'programada';
      };

      const vacinasStats = vacinasOrdenadas.reduce((acc, vac) => {
        const status = getVacinaStatus(vac);
        acc[status] += 1;
        return acc;
      }, { atrasada: 0, hoje: 0, programada: 0, sem_retorno: 0 });

      const handleDeleteVacina = async (vacinaId) => {
        if (!window.confirm('Tem certeza que deseja apagar esta vacina?')) return;

        try {
          await apiRequest(`/animais/${animalId}/vacinas/${vacinaId}`, {
            method: 'DELETE',
            token
          });

          setAnimal((prev) => ({
            ...prev,
            vacinas: (prev.vacinas || []).filter((vac) => vac.id !== vacinaId)
          }));
        } catch (err) {
          console.error('Erro ao apagar vacina:', err);
          alert(err.message || 'Erro ao apagar vacina.');
        }
      };

      return (
        <div className="wt-section vac-section">
          <div className="vac-kpi-grid">
            <div className="vac-kpi-card danger">
              <div className="vac-kpi-head">
                <AlertTriangle size={18} />
                <span>Atrasadas</span>
              </div>
              <strong>{vacinasStats.atrasada}</strong>
            </div>
            <div className="vac-kpi-card warning">
              <div className="vac-kpi-head">
                <Clock size={18} />
                <span>Hoje</span>
              </div>
              <strong>{vacinasStats.hoje}</strong>
            </div>
            <div className="vac-kpi-card info">
              <div className="vac-kpi-head">
                <Calendar size={18} />
                <span>Programadas</span>
              </div>
              <strong>{vacinasStats.programada}</strong>
            </div>
            <div className="vac-kpi-card success">
              <div className="vac-kpi-head">
                <CheckCircle2 size={18} />
                <span>Sem próxima dose</span>
              </div>
              <strong>{vacinasStats.sem_retorno}</strong>
            </div>
          </div>

          <div className="wt-add-card">
            <div className="wt-add-title">
              <Syringe size={18} />
              <span>Atualizar Vacinas</span>
            </div>

            <div className="wt-add-fields" style={{ gridTemplateColumns: '2fr 1fr 1fr', alignItems: 'end' }}>
              <div className="wt-field">
                <label>Vacina aplicada</label>
                <input
                  type="text"
                  placeholder="Ex: V10"
                  value={novaVacina.nome_vacina}
                  onChange={(e) => setNovaVacina((prev) => ({ ...prev, nome_vacina: e.target.value }))}
                />
              </div>
              <div className="wt-field">
                <label>Data da aplicação</label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={novaVacina.data_aplicacao}
                  onChange={(e) => setNovaVacina((prev) => ({ ...prev, data_aplicacao: e.target.value }))}
                />
              </div>
              <div className="wt-field">
                <label>Próxima dose</label>
                <input
                  type="date"
                  value={novaVacina.proxima_dose}
                  onChange={(e) => setNovaVacina((prev) => ({ ...prev, proxima_dose: e.target.value }))}
                />
              </div>
            </div>

            <div className="wt-add-fields" style={{ gridTemplateColumns: '1fr 2fr auto', alignItems: 'end', marginTop: '12px' }}>
              <div className="wt-field">
                <label>Lote</label>
                <input
                  type="text"
                  placeholder="Ex: LOTE-2026-01"
                  value={novaVacina.lote}
                  onChange={(e) => setNovaVacina((prev) => ({ ...prev, lote: e.target.value }))}
                />
              </div>
              <div className="wt-field">
                <label>Responsável pela aplicação</label>
                <input
                  type="text"
                  placeholder="Nome do profissional"
                  value={novaVacina.responsavel_aplicacao}
                  onChange={(e) => setNovaVacina((prev) => ({ ...prev, responsavel_aplicacao: e.target.value }))}
                />
              </div>
              <button
                className="btn btn-primary wt-add-btn"
                onClick={handleAddVacina}
                disabled={savingVacina || !novaVacina.nome_vacina || !novaVacina.data_aplicacao}
              >
                {savingVacina ? 'Salvando...' : 'Registrar vacina'}
              </button>
            </div>
          </div>

          {vacinasOrdenadas.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '16px' }}>
              <Syringe size={48} color="#cbd5e1" />
              <p>Nenhuma vacina registrada para este paciente.</p>
            </div>
          ) : (
            <div className="wt-records-list vac-records-list">
              {vacinasOrdenadas.map((vac) => (
                <div className={`wt-record-card vac-record-card status-${getVacinaStatus(vac)}`} key={vac.id}>
                  <div className="wt-record-left">
                    <div className="wt-record-date-badge">
                      <Calendar size={14} />
                      <span>{new Date(`${vac.data_aplicacao}T00:00:00`).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className="wt-record-age">{vac.nome_vacina}</span>
                  </div>
                  <div className="wt-record-center" style={{ alignItems: 'flex-start' }}>
                    <span className="wt-record-peso" style={{ fontSize: '14px', fontWeight: 500 }}>Responsável</span>
                    <span className="wt-record-unit" style={{ fontSize: '13px' }}>{vac.responsavel_aplicacao || '--'}</span>
                  </div>
                  <div className="wt-record-right" style={{ alignItems: 'flex-end' }}>
                    <span className={`vac-status-badge status-${getVacinaStatus(vac)}`}>
                      {getVacinaStatus(vac) === 'atrasada' && 'Atrasada'}
                      {getVacinaStatus(vac) === 'hoje' && 'Aplicar hoje'}
                      {getVacinaStatus(vac) === 'programada' && 'Programada'}
                      {getVacinaStatus(vac) === 'sem_retorno' && 'Sem próxima dose'}
                    </span>
                    <span className="wt-record-diff same">Próxima dose: {vac.proxima_dose ? new Date(`${vac.proxima_dose}T00:00:00`).toLocaleDateString('pt-BR') : '--'}</span>
                    <span className="wt-record-age">Lote: {vac.lote || '--'}</span>
                    <button
                      className="wt-delete-btn"
                      title="Apagar vacina"
                      onClick={() => handleDeleteVacina(vac.id)}
                      style={{ marginTop: '8px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="empty-state">
        <Clock size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Em Desenvolvimento</h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>Esta funcionalidade ({TABS.find(t => t.id === activeTab)?.label}) será implementada em breve.</p>
      </div>
    );
  };

  return (
    <div className="animal-details-page page-container">
      {/* Header Navigation */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => setCurrentPage('animais')} style={{ padding: '8px 16px' }}>
          <ArrowLeft size={18} />
          Voltar para Animais
        </button>
      </div>

      {/* Animal Profile Banner */}
      <div className="profile-banner">
        <div className="profile-banner-inner">
          <div className="profile-avatar-wrapper">
            <label htmlFor="foto-upload-direct" style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}>
              {animal.foto_base64 ? (
                <img src={animal.foto_base64} alt={animal.nome} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  <Paw size={48} color="white" />
                </div>
              )}
              <div className="avatar-edit-btn" title="Editar Foto">
                <Edit size={14} />
              </div>
            </label>
            <input
              id="foto-upload-direct"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </div>

          <div className="profile-main-info">
            <div className="profile-title-row">
              <h1 className="profile-name">{animal.nome}</h1>
              <span className="profile-id">ID: {animal.id}</span>
            </div>

            <div className="profile-subtitle">
              <span>{animal.especie}</span>
              {animal.raca && <span className="dot-separator">•</span>}
              {animal.raca && <span>{animal.raca}</span>}
              <span className="dot-separator">•</span>
              <span>{animal.sexo}</span>
              <span className="dot-separator">•</span>
              <span>{animal.idade_calculada || 'Idade desconhecida'}</span>
            </div>

            <div className="profile-tutor-info" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Responsável:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={12} color="#475569" />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>{animal.tutor?.nome_completo || 'Desconhecido'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-quick-actions">
            <button className="btn btn-primary" onClick={() => setCurrentPage('triagem')}>
              <ClipboardList size={18} />
              Nova Triagem
            </button>
            <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>
              <Edit size={18} />
              Editar Paciente
            </button>
          </div>
        </div>

        {/* Vital/Extra Stats Banner Footer */}
        <div className="profile-stats-bar">
          <div className="stat-item">
            <div className="stat-label">Peso Atual</div>
            <div className="stat-value">{animal.peso ? `${animal.peso} kg` : '--'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Condição Corporal</div>
            <div className="stat-value" style={{ textTransform: 'capitalize' }}>
              {animal.condicao_corporal || '--'}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Porte</div>
            <div className="stat-value">{animal.porte || '--'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Microchip</div>
            <div className="stat-value">
              {animal.microchip 
                ? (animal.microchip.length > 3 ? `${animal.microchip.slice(0, 3)}-${animal.microchip.slice(3)}` : animal.microchip) 
                : 'Não preenchido'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>ISO 11784/11785 — 15 dígitos. Os 3 primeiros indicam país/fabricante.</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Pelagem</div>
            <div className="stat-value">{animal.pelagem || '--'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Temperamento</div>
            <div className="stat-value">{animal.temperamento || '--'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Castrado(a)</div>
            <div className="stat-value">{animal.castrado ? 'Sim' : 'Não'}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <div className="tabs-scroll-area">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
                {tab.id === 'historico' && <span className="tab-badge">{prontuarios.length}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="tab-content-area">
        {renderTabContent()}
      </div>

      {showEditModal && (
        <AnimalModal
          animal={animal}
          tutores={tutores}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

// Componente simples para esteto
const StethoscopeIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);

export default AnimalDetailsPage;
