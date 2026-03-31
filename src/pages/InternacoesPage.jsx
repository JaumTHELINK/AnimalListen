import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, Bed, Heart, AlertTriangle, Eye, Activity, 
  Thermometer, UtensilsCrossed, Clock, Camera, X, PawPrint, Droplets, Pill, Search, ChevronRight
} from 'lucide-react';
import InternacaoDetalhes from '@/components/InternacaoDetalhes';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';

import { apiJson } from '@/utils/api';

registerLocale('pt-BR', ptBR);

export default function InternacoesPage() {
  const { user, token } = useAuth();
  const [internacoes, setInternacoes] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [tutores, setTutores] = useState([]); // Needed to display tutor info correctly
  const [tutoresDbMapped, setTutoresDbMapped] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [newForm, setNewForm] = useState({
    animal_id: '',
    data_internacao: new Date(),
    motivo: '',
    observacoes: '',
    status: 'estavel'
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [internacoesData, animaisData, tutoresData] = await Promise.all([
        apiJson('/internacoes', { token }),
        apiJson('/animais', { token }),
        apiJson('/tutores', { token })
      ]);

      let tutObj = {};
      setTutores(tutoresData);
      tutoresData.forEach(t => tutObj[t.id] = t);
      setTutoresDbMapped(tutObj);

      let aniMap = {};
      setAnimais(animaisData);
      animaisData.forEach(a => aniMap[a.id] = a);

      const formatted = internacoesData.map(i => {
        const ani = aniMap[i.animal_id] || i.animal || {};
        const tutorId = ani.tutor_id || (i.tutor && i.tutor.id);
        const tutor = tutObj[tutorId] || i.tutor || {};
        return {
          ...i,
          animal_nome: ani.nome || 'Desconhecido',
          animal_especie: ani.especie || 'Indefinido',
          animal_raca: ani.raca || 'SRD',
          animal_peso: ani.peso || '?',
          tutor_nome: tutor.nome_completo || 'Sem tutor',
          tutor_telefone: tutor.telefone || 'Sem telefone',
          tutor_cpf: tutor.cpf || '',
          foto: ani.foto_base64 || null
        };
      });
      setInternacoes(formatted);
    } catch(e) {
      console.error(e);
    }
  };

  const selected = internacoes.find(i => i.id === selectedId);

    const getStatusInfo = (status) => {
    switch (status) {
      case 'estavel': return { label: 'ESTÁVEL', class: 'status-badge status-estavel', labelClass: 'lbl-estavel' };
      case 'critico': return { label: 'CRÍTICO', class: 'status-badge status-critico', labelClass: 'lbl-critico' };
      case 'alta': return { label: 'ALTA', class: 'status-badge status-alta', labelClass: 'lbl-alta' };
      default: return { label: 'DESCONHECIDO', class: 'status-badge', labelClass: '' };
    }
  };

  const getLastReading = (registros, tipo) => {
    const items = (registros || []).filter(r => r.tipo === tipo).sort((a,b) => new Date(a.data_hora) - new Date(b.data_hora));
    return items.length > 0 ? items[items.length - 1] : null;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddInternacao = async () => {
    if (!newForm.animal_id || !newForm.motivo) return;
    try {
      await apiJson('/internacoes', {
        method: 'POST',
        token,
        body: {
          animal_id: parseInt(newForm.animal_id),
          data_internacao: newForm.data_internacao ? new Date(newForm.data_internacao).toISOString() : new Date().toISOString(),
          motivo: newForm.motivo,
          observacoes: newForm.observacoes,
          status: newForm.status
        }
      });
      setShowModal(false);
      fetchData();
    } catch(e) { console.error(e); }
  };

  if (selected) {
    return <InternacaoDetalhes internacao={selected} onBack={() => setSelectedId(null)} onRefresh={fetchData} token={token} />;
  }

  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    return currentDate.getTime() >= selectedDate.getTime();
  };

  const ativos = internacoes.filter(i => i.status !== 'alta');

  return (
    <div className="intern-container animate-fade">
      {/* HEADER */}
      <div className="page-header">
        <h1>Internações</h1>
        <div className="page-actions">
          <button className="btn-primary btn-pill" onClick={() => {
             setNewForm({ animal_id: '', data_internacao: new Date(), motivo: '', observacoes: '', status: 'estavel' });
             setShowModal(true);
          }}>
            <Plus size={18} />
            Nova Internação
          </button>
        </div>
      </div>

      {/* TOP STATS CARDS */}
      <div className="stats-row mb-6">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue-bg"><Bed size={20} className="text-blue" /></div>
          <div>
            <div className="stat-value">{ativos.length}</div>
            <div className="stat-title">Total Internados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green-bg"><Heart size={20} className="text-green" /></div>
          <div>
            <div className="stat-value">{ativos.filter(i => i.status === 'estavel').length}</div>
            <div className="stat-title">Estáveis</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper red-bg"><AlertTriangle size={20} className="text-red" /></div>
          <div>
            <div className="stat-value">{ativos.filter(i => i.status === 'critico').length}</div>
            <div className="stat-title">Críticos</div>
          </div>
        </div>
      </div>

      {/* PATIENT CARDS GRID */}
      <div className="cards-grid">
        {ativos.map(intern => {
          const st = getStatusInfo(intern.status);
          const bpm = getLastReading(intern.registros, 'frequencia_cardiaca');
          const temp = getLastReading(intern.registros, 'temperatura');
          const alim = getLastReading(intern.registros, 'alimentacao');

          return (
            <div 
              key={intern.id} 
              className={`patient-card border-status-${intern.status}`}
              onClick={() => setSelectedId(intern.id)}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  {intern.foto ? (
                    <img src={intern.foto} alt={intern.animal_nome} className="patient-avatar-img patient-avatar-img-sm" />
                  ) : (
                    <div className="patient-avatar patient-avatar-sm">
                      <PawPrint size={20} />
                    </div>
                  )}
                  <div>
                    <h3 className="patient-name">{intern.animal_nome}</h3>
                    <p className="patient-breeds">{intern.animal_especie} • {intern.animal_raca} • {intern.animal_peso}kg</p>
                  </div>
                </div>
                <div className={`status-pill ${intern.status}`}>
                  <span className={`status-dot ${intern.status}`}></span>
                  <span className="status-text">{st.label}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="mb-4">
                <p className="patient-reason">Motivo: <span>{intern.motivo}</span></p>
                <p className="patient-tutor">Tutor: {intern.tutor_nome} • {intern.tutor_telefone}</p>
              </div>

              {/* Vitals Box */}
              <div className="vitals-box">
                <div className="vital-item">
                  <span className="vital-lbl"><Heart size={12} className="text-red" /> BPM</span>
                  <span className="vital-val">{bpm ? bpm.valor : '--'}</span>
                  <span className="vital-time">{bpm ? formatTime(bpm.data_hora) : '--:--'}</span>
                </div>
                <div className="vital-item">
                  <span className="vital-lbl"><Thermometer size={12} className="text-yellow" /> Temp</span>
                  <span className="vital-val">{temp ? temp.valor : '--'}{temp && !temp.valor.includes('C') ? '°C' : ''}</span>
                  <span className="vital-time">{temp ? formatTime(temp.data_hora) : '--:--'}</span>
                </div>
                <div className="vital-item">
                  <span className="vital-lbl"><UtensilsCrossed size={12} className="text-green" /> Comeu</span>
                  {alim ? (
                    <span className={`vital-val ${alim.valor.toLowerCase() === 'sim' ? 'text-green' : alim.valor.toLowerCase() === 'não' || alim.valor.toLowerCase() === 'nao' ? 'text-red' : ''}`}>{alim.valor}</span>
                  ) : (
                    <span className="vital-val">--</span>
                  )}
                  <span className="vital-time">{alim ? formatTime(alim.data_hora) : '--:--'}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t">
                <span className="footer-time"><Clock size={12} className="inline mr-1" /> Internado em {new Date(intern.data_internacao).toLocaleDateString('pt-BR')}</span>
                <span className="footer-records">{intern.registros ? intern.registros.length : 0} registros <ChevronRight size={14} /></span>
              </div>
            </div>
          );
        })}
      </div>

      {ativos.length === 0 && (
         <div className="empty-state text-center" style={{marginTop: '40px', color: '#94a3b8'}}>
           <Bed size={48} style={{margin: '0 auto', marginBottom: '16px', opacity: 0.5}}/>
           Nenhum paciente internado no momento.
         </div>
      )}

      {/* NEW INTERNACAO MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="modal-title">Nova Internação</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>

            <div className="form-group mb-4">
              <label>Paciente (Apenas cadastrados)</label>
              <Select
                value={animais.map(a => ({ value: a.id, label: `${a.nome} (Tutor: ${tutoresDbMapped[a.tutor_id]?.nome_completo || 'Desconhecido'})` })).find(opt => opt.value === Number(newForm.animal_id)) || null}
                onChange={(selected) => setNewForm({...newForm, animal_id: selected ? selected.value : ''})}
                options={animais.map(a => ({ value: a.id, label: `${a.nome} (Tutor: ${tutoresDbMapped[a.tutor_id]?.nome_completo || 'Desconhecido'})` }))}
                placeholder="Pesquisar animal pelo nome..."
                isSearchable
                isClearable
                noOptionsMessage={() => 'Nenhum animal encontrado'}
                components={{ IndicatorSeparator: () => null }}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '6px',
                    borderColor: '#d1d5db',
                    padding: '2px',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: '#94a3b8'
                    }
                  })
                }}
              />
            </div>

            <div className="form-group mb-4">
              <label>Data e Hora da Internação</label>
              <DatePicker
                selected={newForm.data_internacao}
                onChange={(date) => setNewForm({...newForm, data_internacao: date})}
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

            <div className="form-group mb-4">
              <label>Status Inicial</label>
              <select className="form-control" value={newForm.status} onChange={e => setNewForm({...newForm, status: e.target.value})}>
                <option value="estavel">Estável</option>
                <option value="critico">Crítico</option>
              </select>
            </div>

            <div className="form-group mb-4">
              <label>Motivo da Internação</label>
              <textarea className="form-control" rows={3} value={newForm.motivo} onChange={e => setNewForm({...newForm, motivo: e.target.value})} placeholder="Descreva o motivo..." />
            </div>

            <div className="form-group mb-6">
              <label>Observações (Opcional)</label>
              <textarea className="form-control" rows={3} value={newForm.observacoes} onChange={e => setNewForm({...newForm, observacoes: e.target.value})} placeholder="Adicione observações aqui..." />
            </div>

            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary btn-pill" onClick={handleAddInternacao}>Criar Internação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
