import React, { useState } from 'react';
import { 
  ArrowLeft, Edit, Plus, Heart, Thermometer, UtensilsCrossed, 
  Pill, Droplets, PawPrint, Activity, CheckCircle, X, Droplet
} from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';
import '../pages/Internacoes.css';
import { apiJson, apiRequest } from '../utils/api';

registerLocale('pt-BR', ptBR);

export default function InternacaoDetalhes({ internacao, onBack, onRefresh, token }) {
  const [showModal, setShowModal] = useState(false);
  const [showObsModal, setShowObsModal] = useState(false);
  const [obsDraft, setObsDraft] = useState(internacao.observacoes || '');
  const [showConfirmFeed, setShowConfirmFeed] = useState(false);
  const [showConfirmMed, setShowConfirmMed] = useState(false);
  const [showConfirmGli, setShowConfirmGli] = useState(false);
  const [newRegistro, setNewRegistro] = useState({
    tipo: 'alimentacao',
    valorCombo: '',
    valorText: '',
    notas: '',
    data_hora: new Date(),
    // Novos campos
    alim_tipo: 'Espontânea',
    alim_qtd: '',
    alim_intervalo: '3 em 3 horas',
    alim_alimento: 'Recovery',
    med_nome: '',
    med_dosagem: '',
    med_via: 'Intravenosa',
    med_intervalo: '',
    gli_valor: '',
    gli_intervalo: '',
    hid_status: 'Normo hidratado'
  });

  const handleUpdateStatus = async (novoStatus) => {
    if (novoStatus === 'alta' && !window.confirm('Tem certeza que deseja dar alta?')) {
      return;
    }

    try {
      await apiRequest(`/internacoes/${internacao.id}/status?status=${novoStatus}`, {
        method: 'PUT',
        token
      });
      onRefresh();
    } catch(e) { console.error(e); }
  };

  const handleUpdateObservacoes = async () => {
    try {
      await apiJson(`/internacoes/${internacao.id}`, {
        method: 'PUT',
        token,
        body: { observacoes: obsDraft }
      });
      setShowObsModal(false);
      onRefresh();
    } catch(e) { console.error(e); }
  };

  const submitRegistro = async (payload, closeModal = false) => {
    try {
      await apiJson(`/internacoes/${internacao.id}/registros`, {
        method: 'POST',
        token,
        body: payload
      });
      if (closeModal) setShowModal(false);
      onRefresh();
    } catch(e) { console.error(e); }
  };

  const handleQuickSubmit = async (payload, setConfirmState) => {
    setConfirmState(true);
    await submitRegistro(payload);
    setTimeout(() => setConfirmState(false), 1500);
  };

  const parseIntervalHours = (alimReg) => {
    if (!alimReg) return null;
    const parts = (alimReg.valor || '').split('|');
    if (parts.length >= 3) {
      const s = parts[2].trim();
      const m = s.match(/(\d+)\s*horas?/i);
      if (m) return parseInt(m[1]);
      const mNum = s.match(/^(\d+(?:[.,]\d+)?)$/);
      if (mNum) return parseFloat(mNum[1].replace(',', '.'));
    }
    if (alimReg.notas) {
      const mn = alimReg.notas.match(/(\d+(?:[.,]\d+)?)\s*horas?/i);
      if (mn) return parseFloat(mn[1].replace(',', '.'));
    }
    return null;
  };

  const parseMedIntervalHours = (medReg) => {
    if (!medReg) return null;
    const parts = (medReg.valor || '').split('|');
    if (parts.length >= 4) {
      const s = parts[3].trim();
      const m = s.match(/(\d+)\s*horas?/i);
      if (m) return parseInt(m[1]);
      const mNum = s.match(/^(\d+(?:[.,]\d+)?)$/);
      if (mNum) return parseFloat(mNum[1].replace(',', '.'));
    }
    return null;
  };

  const parseGliIntervalHours = (gliReg) => {
    if (!gliReg) return null;
    const parts = (gliReg.valor || '').split('|');
    if (parts.length >= 2) {
      const s = parts[1].trim();
      const m = s.match(/(\d+)\s*horas?/i);
      if (m) return parseInt(m[1]);
      const mNum = s.match(/^(\d+(?:[.,]\d+)?)$/);
      if (mNum) return parseFloat(mNum[1].replace(',', '.'));
    }
    return null;
  };

  const handleAddRegistro = async () => {
    let finalValor = '';
    
    if (newRegistro.tipo === 'alimentacao') {
      finalValor = `${newRegistro.alim_tipo} | ${newRegistro.alim_qtd}g | ${newRegistro.alim_intervalo} | ${newRegistro.alim_alimento}`;
    } else if (newRegistro.tipo === 'medicacao') {
      finalValor = `${newRegistro.med_nome} | ${newRegistro.med_dosagem} | ${newRegistro.med_via} | ${newRegistro.med_intervalo}`;
    } else if (newRegistro.tipo === 'glicose') {
      finalValor = `${newRegistro.gli_valor}mg/dL | ${newRegistro.gli_intervalo}`;
    } else if (newRegistro.tipo === 'hidratacao') {
      finalValor = newRegistro.hid_status;
    } else {
      finalValor = newRegistro.valorText;
    }
      
    if (!finalValor) return;

    await submitRegistro({
      tipo: newRegistro.tipo,
      valor: finalValor,
      notas: newRegistro.notas,
      data_hora: newRegistro.data_hora ? new Date(newRegistro.data_hora).toISOString() : new Date().toISOString()
    }, true);
  };

  const openRegistroModal = () => {
    setNewRegistro({
      tipo: 'alimentacao',
      valorCombo: '',
      valorText: '',
      notas: '',
      data_hora: new Date(),
      alim_tipo: 'Espontânea',
      alim_qtd: '',
      alim_intervalo: '3 em 3 horas',
      alim_alimento: 'Recovery',
      med_nome: '',
      med_dosagem: '',
      med_via: 'Intravenosa',
      med_intervalo: '',
      gli_valor: '',
      gli_intervalo: '',
      hid_status: 'Normo hidratado'
    });
    setShowModal(true);
  };

  const formatHora = (dStr) => dStr ? new Date(dStr).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : '--:--';
  const formatDataInfo = (dStr) => dStr ? new Date(dStr).toLocaleDateString('pt-BR') : '--/--/----';

  const getLast = (tipo) => {
    const arr = (internacao.registros || []).filter(r => r.tipo === tipo).sort((a,b) => new Date(a.data_hora) - new Date(b.data_hora));
    return arr.length > 0 ? arr[arr.length - 1] : null;
  };

  const bpm = getLast('frequencia_cardiaca');
  const temp = getLast('temperatura');
  const alim = getLast('alimentacao');
  const med = getLast('medicacao');
  const hid = getLast('hidratacao');
  const gli = getLast('glicose');

  const getStatusText = (st) => {
    if (st === 'observacao') return 'OBSERVAÇÃO';
    if (st === 'critico') return 'CRÍTICO';
    if (st === 'estavel') return 'ESTÁVEL';
    if (st === 'alta') return 'ALTA';
    return 'DESCONHECIDO';
  };

  // Timeline render helper
  const renderTimelineItem = (reg) => {
    let icn = <Activity size={16}/>;
    let label = 'Aviso';
    let labelClass = 'timeline-badge blue';

    if (reg.tipo === 'alimentacao') { icn = <UtensilsCrossed size={16}/>; label = 'Alimentação'; labelClass = 'timeline-badge green'; }
    if (reg.tipo === 'temperatura') { icn = <Thermometer size={16}/>; label = 'Temperatura'; labelClass = 'timeline-badge yellow'; }
    if (reg.tipo === 'frequencia_cardiaca') { icn = <Heart size={16}/>; label = 'Freq. Cardíaca'; labelClass = 'timeline-badge red'; }
    if (reg.tipo === 'medicacao') { icn = <Pill size={16}/>; label = 'Medicação'; labelClass = 'timeline-badge blue'; }
    if (reg.tipo === 'hidratacao') { icn = <Droplets size={16}/>; label = 'Hidratação'; labelClass = 'timeline-badge blue'; }
    if (reg.tipo === 'glicose') { icn = <Droplet size={16} style={{color: '#dc2626', fill: '#fca5a5'}}/>; label = 'Glicose'; labelClass = 'timeline-badge purple'; }

    return (
      <div key={reg.id} className="timeline-item">
        <div className="timeline-dot bg-white">
          <div className="timeline-dot-inner" style={{backgroundColor: labelClass.includes('yellow') ? '#f59e0b' : labelClass.includes('green') ? '#22c55e' : labelClass.includes('red') ? '#ef4444' : labelClass.includes('purple') ? '#9333ea' : '#3b82f6'}}></div>
        </div>
        <div className="timeline-time">{formatDataInfo(reg.data_hora)}, {formatHora(reg.data_hora)}</div>
        <div className="timeline-card">
          <div className="flex items-center gap-2 mb-2">
            <div className={`t-badge ${labelClass}`}><span className="mr-1">{icn}</span> {label}</div>
            <div style={{fontSize: '14px', color: (reg.tipo==='alimentacao' || reg.tipo==='hidratacao') && reg.valor?.toLowerCase()==='sim' ? '#16a34a' : (reg.tipo==='alimentacao' || reg.tipo==='hidratacao') && (reg.valor?.toLowerCase()==='não' || reg.valor?.toLowerCase()==='nao') ? '#dc2626' : '#1e293b'}}>{reg.valor}</div>
          </div>
          {reg.notas && <p className="timeline-notes">{reg.notas}</p>}
        </div>
      </div>
    );
  };

  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    return currentDate.getTime() >= selectedDate.getTime();
  };

  const sortedRegs = [...(internacao.registros || [])].sort((a,b) => new Date(b.data_hora) - new Date(a.data_hora));

  const nextFeedingHours = parseIntervalHours(alim);
  const nextFeedingTime = (nextFeedingHours && alim)
    ? new Date(new Date(alim.data_hora).getTime() + nextFeedingHours * 3600 * 1000)
    : null;
  const minutesUntilFeeding = nextFeedingTime ? (nextFeedingTime - new Date()) / 60000 : null;
  const feedingBtnClass = minutesUntilFeeding === null ? '' :
    minutesUntilFeeding < 10 ? 'next-feeding-btn--red' :
    minutesUntilFeeding < 30 ? 'next-feeding-btn--yellow' : '';

  const formatAlimDisplay = (valor) => {
    if (!valor) return '--';
    const parts = valor.split('|').map(p => p.trim());
    if (parts.length >= 4) return `${parts[0]} | ${parts[1]} | ${parts[3]}`;
    return valor;
  };

  const nextDoseHours = parseMedIntervalHours(med);
  const nextDoseTime = (nextDoseHours && med)
    ? new Date(new Date(med.data_hora).getTime() + nextDoseHours * 3600 * 1000)
    : null;
  const minutesUntilDose = nextDoseTime ? (nextDoseTime - new Date()) / 60000 : null;
  const doseBtnClass = minutesUntilDose === null ? '' :
    minutesUntilDose < 10 ? 'next-feeding-btn--red' :
    minutesUntilDose < 30 ? 'next-feeding-btn--yellow' : '';

  const formatMedDisplay = (valor) => {
    if (!valor) return '--';
    const parts = valor.split('|').map(p => p.trim());
    if (parts.length >= 3) return `${parts[0]} | ${parts[1]} | ${parts[2]}`;
    return valor;
  };

  const nextGliHours = parseGliIntervalHours(gli);
  const nextGliTime = (nextGliHours && gli)
    ? new Date(new Date(gli.data_hora).getTime() + nextGliHours * 3600 * 1000)
    : null;
  const minutesUntilGli = nextGliTime ? (nextGliTime - new Date()) / 60000 : null;
  const gliBtnClass = minutesUntilGli === null ? '' :
    minutesUntilGli < 10 ? 'next-feeding-btn--red' :
    minutesUntilGli < 30 ? 'next-feeding-btn--yellow' : '';

  return (
    <div className="intern-container animate-fade">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <button className="btn-ghost-circle" onClick={onBack} title="Voltar">
            <ArrowLeft size={20} />
          </button>
          {internacao.foto ? (
            <img src={internacao.foto} alt={internacao.animal_nome} className="patient-avatar-img patient-avatar-img-lg" />
          ) : (
            <div className="patient-avatar patient-avatar-lg shadow-sm">
              <PawPrint size={28} />
            </div>
          )}
          <div>
            <h1 className="header-title">{internacao.animal_nome}</h1>
            <p className="header-subtitle">{internacao.animal_especie} • {internacao.animal_raca} • {internacao.animal_peso}kg • Internado em {formatDataInfo(internacao.data_internacao)}</p>
          </div>
        </div>
        
        <div className="internacao-header-actions">
          <div className={`status-select-pill status-${internacao.status}`}>
            <span className={`status-dot ${internacao.status}`}></span>
            <select
               className="status-select-pill-control"
               value={internacao.status}
               onChange={e => handleUpdateStatus(e.target.value)}
               aria-label="Atualizar status"
            >
              <option value="estavel">Estável</option>
              <option value="critico">Crítico</option>
              <option value="alta">Dar Alta</option>
            </select>
          </div>
          <button className="btn-primary btn-pill" onClick={openRegistroModal}>
            <Plus size={16}/> Novo Registro
          </button>
        </div>
      </div>

      {/* INFO ROW */}
      <div className="info-bar mb-6">
        <div>
          <span className="lbl">TUTOR</span>
          <span className="val">{internacao.tutor_nome}</span>
        </div>
        <div>
          <span className="lbl">CPF</span>
          <span className="val">{internacao.tutor_cpf || '--'}</span>
        </div>
        <div>
          <span className="lbl">TELEFONE</span>
          <span className="val">{internacao.tutor_telefone}</span>
        </div>
        <div className="flex-2">
          <span className="lbl">MOTIVO</span>
          <span className="val text-truncate">{internacao.motivo}</span>
        </div>
        <div className="flex-2">
          <span className="lbl">OBSERVAÇÕES</span>
          <div className="flex items-center gap-2">
            <span className="val text-truncate">{internacao.observacoes || '--'}</span>
            <button
              className="icon-btn"
              onClick={() => setShowObsModal(true)}
              title="Editar observações"
              style={{
                width: '24px',
                height: '24px',
                border: 'none',
                background: 'transparent',
                opacity: 0.55,
                padding: 0
              }}
            >
              <Edit size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* VITALS ROW */}
      <div className="vitals-row mb-8" style={{marginTop: '20px'}}>
        <div className="vital-card">
          <div className="vital-hdr"><Heart size={16} className="text-red mr-2"/> FREQUÊNCIA CARDÍACA</div>
          <div className="vital-content">
            <div className="v-big">{bpm ? bpm.valor : '--'}</div>
            <div className="v-sub">{bpm ? `${formatHora(bpm.data_hora)} • ${bpm.notas || 'Sem obs'}` : 'Sem registros'}</div>
          </div>
        </div>
        <div className="vital-card">
          <div className="vital-hdr"><Thermometer size={16} className="text-yellow mr-2"/> TEMPERATURA</div>
          <div className="vital-content">
            <div className="v-big">{temp ? temp.valor : '--'}{temp && !temp.valor.includes('C') ? '°C' : ''}</div>
            <div className="v-sub">{temp ? `${formatHora(temp.data_hora)} • ${temp.notas || 'Sem obs'}` : 'Sem registros'}</div>
          </div>
        </div>
        <div className="vital-card">
          <div className="vital-hdr"><UtensilsCrossed size={16} className="text-green mr-2"/> ALIMENTAÇÃO</div>
          <div className="vital-content">
            <div className={`v-big ${(alim?.valor?.toLowerCase()==='não'||alim?.valor?.toLowerCase()==='nao') ? 'text-red' : ''}`}>{alim ? formatAlimDisplay(alim.valor) : '--'}</div>
            <div className="v-sub">{alim ? `${formatHora(alim.data_hora)} • ${alim.notas || 'Sem obs'}` : 'Sem registros'}</div>
          </div>
          {nextFeedingTime && (
            <button
              className={`next-feeding-btn ${feedingBtnClass} ${showConfirmFeed ? 'confirmed' : ''}`}
              title={`Próxima alimentação: ${nextFeedingTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`}
              onClick={() => handleQuickSubmit({
                tipo: 'alimentacao',
                valor: alim.valor,
                notas: alim.notas || '',
                data_hora: new Date().toISOString()
              }, setShowConfirmFeed)}
            >
              {showConfirmFeed ? (
                <><CheckCircle size={16} style={{marginRight: '6px'}}/> Confirmado!</>
              ) : (
                `${nextFeedingTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}h`
              )}
            </button>
          )}
        </div>
        <div className="vital-card">
          <div className="vital-hdr"><Pill size={16} className="text-blue mr-2"/> MEDICAÇÃO</div>
          <div className="vital-content">
            <div className="v-big text-truncate-1">{med ? formatMedDisplay(med.valor) : '--'}</div>
            <div className="v-sub">{med ? `${formatHora(med.data_hora)} • ${med.notas || 'Sem obs'}` : 'Sem registros'}</div>
          </div>
          {nextDoseTime && (
            <button
              className={`next-feeding-btn ${doseBtnClass} ${showConfirmMed ? 'confirmed' : ''}`}
              title={`Próxima dose: ${nextDoseTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`}
              onClick={() => handleQuickSubmit({
                tipo: 'medicacao',
                valor: med.valor,
                notas: med.notas || '',
                data_hora: new Date().toISOString()
              }, setShowConfirmMed)}
            >
              {showConfirmMed ? (
                <><CheckCircle size={16} style={{marginRight: '6px'}}/> Confirmado!</>
              ) : (
                `${nextDoseTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}h`
              )}
            </button>
          )}
        </div>
        <div className="vital-card">
          <div className="vital-hdr"><Droplets size={16} className="text-blue mr-2"/> HIDRATAÇÃO</div>
          <div className="vital-content">
            <div className="v-big">{hid ? hid.valor : '--'}</div>
            <div className="v-sub">{hid ? `${formatHora(hid.data_hora)} • ${hid.notas || 'Sem obs'}` : 'Sem registros'}</div>
          </div>
        </div>
        <div className="vital-card">
          <div className="vital-hdr"><Droplet size={16} style={{color: '#dc2626', fill: '#fca5a5'}} className="mr-2"/> GLICOSE</div>
          <div className="vital-content">
            <div className="v-big">{gli ? gli.valor.split('|')[0].trim() : '--'}</div>
            <div className="v-sub">{gli ? `${formatHora(gli.data_hora)} • ${gli.notas || 'Sem obs'}` : 'Sem registros'}</div>
          </div>
          {nextGliTime && (
            <button
              className={`next-feeding-btn ${gliBtnClass} ${showConfirmGli ? 'confirmed' : ''}`}
              title={`Próxima glicemia: ${nextGliTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`}
              onClick={() => handleQuickSubmit({
                tipo: 'glicose',
                valor: gli.valor,
                notas: gli.notas || '',
                data_hora: new Date().toISOString()
              }, setShowConfirmGli)}
            >
              {showConfirmGli ? (
                <><CheckCircle size={16} style={{marginRight: '6px'}}/> Confirmado!</>
              ) : (
                `${nextGliTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}h`
              )}
            </button>
          )}
        </div>
      </div>

      {/* TIMELINE SECTION */}
      <div className="timeline-section">
        <div className="flex justify-between items-center mb-6">
          <h2 className="timeline-title">Histórico de Registros</h2>
        </div>

        <div className="timeline">
          {sortedRegs.length === 0 ? (
            <p className="text-gray" style={{marginLeft: '24px'}}>Nenhum registro encontrado para este paciente.</p>
          ) : (
            sortedRegs.map(reg => renderTimelineItem(reg))
          )}
        </div>
      </div>

      {/* NOVO REGISTRO MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{maxWidth: '450px'}} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="modal-title">Novo Registro</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>

            <div className="form-group mb-4">
              <label>TIPO DE REGISTRO</label>
              <select className="form-control" value={newRegistro.tipo} onChange={e => setNewRegistro({...newRegistro, tipo: e.target.value})}>
                <option value="alimentacao">Alimentação</option>
                <option value="hidratacao">Hidratação</option>
                <option value="frequencia_cardiaca">Frequência Cardíaca</option>
                <option value="temperatura">Temperatura</option>
                <option value="medicacao">Medicação</option>
                <option value="glicose">Glicose</option>
                <option value="evolucao">Aviso</option>
              </select>
            </div>

            <div className="form-group mb-4">
              <label>DATA E HORA</label>
              <DatePicker
                selected={newRegistro.data_hora}
                onChange={(date) => setNewRegistro({...newRegistro, data_hora: date})}
                locale="pt-BR"
                showTimeSelect
                timeFormat="HH:mm"
                dateFormat="dd/MM/yyyy HH:mm"
                maxDate={new Date()}
                filterTime={filterPassedTime}
                className="form-control"
                wrapperClassName="date-picker-wrapper"
              />
            </div>

            {/* CONDITIONAL INPUT BASED ON TYPE */}
            {newRegistro.tipo === 'alimentacao' && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label>TIPO DE ALIMENTAÇÃO</label>
                    <select className="form-control" value={newRegistro.alim_tipo} onChange={e => setNewRegistro({...newRegistro, alim_tipo: e.target.value})}>
                      <option value="Espontânea">Espontânea</option>
                      <option value="Forçada (seringa)">Forçada (seringa)</option>
                      <option value="Guiada (sonda)">Guiada (sonda)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>QUANTIDADE (G)</label>
                    <input type="number" className="form-control" value={newRegistro.alim_qtd} onChange={e => setNewRegistro({...newRegistro, alim_qtd: e.target.value})} placeholder="Ex: 50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label>INTERVALO</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newRegistro.alim_intervalo}
                      onChange={e => setNewRegistro({...newRegistro, alim_intervalo: e.target.value})}
                      placeholder="Ex: 3 horas"
                    />
                  </div>
                  <div className="form-group">
                    <label>TIPO DE ALIMENTO</label>
                    <select className="form-control" value={newRegistro.alim_alimento} onChange={e => setNewRegistro({...newRegistro, alim_alimento: e.target.value})}>
                      <option value="Recovery">Recovery</option>
                      <option value="Nutrilife">Nutrilife</option>
                      <option value="Ração">Ração</option>
                      <option value="Comida caseira">Comida caseira</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {newRegistro.tipo === 'medicacao' && (
              <>
                <div className="form-group mb-4">
                  <label>NOME DO MEDICAMENTO</label>
                  <input type="text" className="form-control" value={newRegistro.med_nome} onChange={e => setNewRegistro({...newRegistro, med_nome: e.target.value})} placeholder="Ex: Dipirona" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="form-group">
                    <label>DOSAGEM</label>
                    <input type="text" className="form-control" value={newRegistro.med_dosagem} onChange={e => setNewRegistro({...newRegistro, med_dosagem: e.target.value})} placeholder="Ex: 1ml" />
                  </div>
                  <div className="form-group">
                    <label>VIA</label>
                    <select className="form-control" value={newRegistro.med_via} onChange={e => setNewRegistro({...newRegistro, med_via: e.target.value})}>
                      <option value="Intramuscular">Intramuscular</option>
                      <option value="Intravenosa">Intravenosa</option>
                      <option value="Subcutânea">Subcutânea</option>
                    </select>
                  </div>
                </div>
                <div className="form-group mb-4">
                  <label>INTERVALO</label>
                  <input type="text" className="form-control" value={newRegistro.med_intervalo} onChange={e => setNewRegistro({...newRegistro, med_intervalo: e.target.value})} placeholder="Ex: 8 horas" />
                </div>
              </>
            )}

            {newRegistro.tipo === 'hidratacao' && (
              <div className="form-group mb-4">
                <label>STATUS DE HIDRATAÇÃO</label>
                <select className="form-control" value={newRegistro.hid_status} onChange={e => setNewRegistro({...newRegistro, hid_status: e.target.value})}>
                  <option value="Normo hidratado">Normo hidratado</option>
                  <option value="Desidratado">Desidratado</option>
                </select>
              </div>
            )}

            {newRegistro.tipo === 'glicose' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label>GLICOSE (mg/dL)</label>
                  <input type="number" className="form-control" value={newRegistro.gli_valor} onChange={e => setNewRegistro({...newRegistro, gli_valor: e.target.value})} placeholder="Ex: 90" />
                </div>
                <div className="form-group">
                  <label>INTERVALO</label>
                  <input type="text" className="form-control" value={newRegistro.gli_intervalo} onChange={e => setNewRegistro({...newRegistro, gli_intervalo: e.target.value})} placeholder="Ex: 4 horas" />
                </div>
              </div>
            )}

            {['frequencia_cardiaca', 'temperatura', 'evolucao'].includes(newRegistro.tipo) && (
              <div className="form-group mb-4">
                <label>{newRegistro.tipo === 'evolucao' ? 'AVISO' : 'VALOR / DESCRIÇÃO'}</label>
                <input type="text" className="form-control" placeholder={newRegistro.tipo === 'temperatura' ? 'Ex: 38.5' : newRegistro.tipo === 'frequencia_cardiaca' ? 'Ex: 120' : 'Ex: paciente vomitou após alimentação'} value={newRegistro.valorText} onChange={e => setNewRegistro({...newRegistro, valorText: e.target.value})} />
              </div>
            )}

            <div className="form-group mb-6">
              <label>NOTAS / OBSERVAÇÕES</label>
              <textarea className="form-control" rows={4} value={newRegistro.notas} onChange={e => setNewRegistro({...newRegistro, notas: e.target.value})}></textarea>
            </div>

            <div className="flex gap-2 justify-end">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAddRegistro}>+ Adicionar Registro</button>
            </div>
          </div>
        </div>
      )}

      {showObsModal && (
        <div className="modal-overlay" onClick={() => setShowObsModal(false)}>
          <div className="modal-content" style={{maxWidth: '450px'}} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="modal-title">Editar observações</h2>
              <button className="icon-btn" onClick={() => setShowObsModal(false)}><X size={20}/></button>
            </div>

            <div className="form-group mb-6">
              <label>OBSERVAÇÕES</label>
              <textarea className="form-control" rows={5} value={obsDraft} onChange={e => setObsDraft(e.target.value)}></textarea>
            </div>

            <div className="flex gap-2 justify-end">
              <button className="btn-secondary" onClick={() => setShowObsModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleUpdateObservacoes}>Salvar observações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
