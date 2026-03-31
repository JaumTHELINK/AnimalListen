import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Edit, Phone, MapPin, User, Clock,
  PawPrint as Paw, FileText, Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TutorModal } from './TutoresPage';
import { apiJson } from '../utils/api';

const TABS = [
  { id: 'animais', label: 'Animais', icon: Paw },
  { id: 'historicos', label: 'Históricos', icon: FileText },
  { id: 'lembretes', label: 'Lembretes para o Responsável', icon: Bell },
];

const formatPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0,2)}) ${digits.slice(2,3)} ${digits.slice(3,7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  }
  return phone;
};

const TutorDetailsPage = ({ tutorId, setCurrentPage }) => {
  const { token } = useAuth();
  const [tutor, setTutor] = useState(null);
  const [animais, setAnimais] = useState([]);
  const [allAnimais, setAllAnimais] = useState([]);
  const [prontuarios, setProntuarios] = useState([]);
  const [activeTab, setActiveTab] = useState('animais');
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tutorData, allA, allPront] = await Promise.all([
        apiJson(`/tutores/${tutorId}`, { token }),
        apiJson('/animais', { token }),
        apiJson('/prontuarios', { token })
      ]);

      setTutor(tutorData);
      const tutorAnimais = allA.filter(a => a.tutor_id === tutorId);
      setAllAnimais(allA);
      setAnimais(tutorAnimais);

      const ids = tutorAnimais.map(a => a.id);
      const tutorProntuarios = allPront.filter(p => ids.includes(p.animal_id));
      tutorProntuarios.sort((a, b) => new Date(b.data_atendimento) - new Date(a.data_atendimento));
      setProntuarios(tutorProntuarios);
    } catch (error) {
      console.error("Erro ao buscar dados do tutor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && tutorId) fetchData();
  }, [tutorId, token]);

  if (loading) {
    return <div className="page-container"><p>Carregando informações do responsável...</p></div>;
  }

  if (!tutor) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Tutor não encontrado.</div>
        <button className="btn btn-secondary" onClick={() => setCurrentPage('tutores')}>
          Voltar para Lista
        </button>
      </div>
    );
  }

  const endereco = [tutor.endereco_rua, tutor.endereco_numero, tutor.endereco_bairro, tutor.endereco_cidade]
    .filter(Boolean).join(', ') || 'Não informado';

  const animalNames = animais.map(a => a.nome);

  const renderTabContent = () => {
    if (activeTab === 'animais') {
      return (
        <div>
          <div className="history-header">
            <h3>{animais.length > 1 ? 'Animais' : 'Animal'} do Responsável</h3>
            <span className="badge badge-outline">{animais.length}</span>
          </div>

          {animais.length === 0 ? (
            <div className="empty-state">
              <Paw size={48} color="#cbd5e1" />
              <p>Nenhum animal vinculado a este responsável.</p>
            </div>
          ) : (
            <div className="tutor-animais-list">
              {animais.map(animal => (
                <div
                  key={animal.id}
                  className="tutor-animal-card"
                  onClick={() => setCurrentPage(`animal-detalhes-${animal.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="tutor-animal-avatar">
                    {animal.foto_base64 ? (
                      <img src={animal.foto_base64} alt={animal.nome} />
                    ) : (
                      <Paw size={24} color="#64748b" />
                    )}
                  </div>
                  <div className="tutor-animal-info">
                    <div className="tutor-animal-name">{animal.nome}</div>
                    <div className="tutor-animal-meta">
                      <span>{animal.especie}</span>
                      {animal.raca && <><span className="dot-separator">•</span><span>{animal.raca}</span></>}
                      {animal.sexo && <><span className="dot-separator">•</span><span>{animal.sexo}</span></>}
                    </div>
                  </div>
                  <div className="tutor-animal-extra">
                    {animal.idade_calculada && <span className="tutor-animal-age-badge">{animal.idade_calculada}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'historicos') {
      return (
        <div className="history-timeline">
          <div className="history-header">
            <h3>Histórico de Registros</h3>
            <span className="badge badge-outline">{prontuarios.length} registro{prontuarios.length !== 1 ? 's' : ''}</span>
          </div>

          {prontuarios.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} color="#cbd5e1" />
              <p>Nenhum prontuário registrado para os animais deste responsável.</p>
            </div>
          ) : (
            <div className="timeline-container">
              {prontuarios.map(prontuario => {
                const animalDoPront = animais.find(a => a.id === prontuario.animal_id);
                return (
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
                            <FileText size={20} color="var(--color-primary)" />
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '16px' }}>Prontuário #{prontuario.id}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                              {animalDoPront ? `Paciente: ${animalDoPront.nome}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="card-body" style={{ padding: '16px' }}>
                        {prontuario.queixa_principal && (
                          <div style={{ marginBottom: '12px' }}>
                            <strong style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Motivo / Queixa:</strong>
                            <p style={{ margin: 0, fontSize: '14px' }}>{prontuario.queixa_principal}</p>
                          </div>
                        )}
                        {prontuario.diagnostico_definitivo && (
                          <div>
                            <strong style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Diagnóstico:</strong>
                            <p style={{ margin: 0, fontSize: '14px' }}>{prontuario.diagnostico_definitivo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'lembretes') {
      return (
        <div className="empty-state">
          <Bell size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Lembretes</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Funcionalidade de lembretes para o responsável será implementada em breve.</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="page-container">
      {/* Back Link */}
      <div className="back-link" onClick={() => setCurrentPage('tutores')}>
        <ArrowLeft size={20} />
        <span>Voltar para Tutores</span>
      </div>

      {/* Tutor Profile Banner */}
      <div className="profile-banner">
        <div className="profile-banner-inner">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-placeholder">
              <User size={48} color="white" />
            </div>
          </div>

          <div className="profile-main-info">
            <div className="profile-title-row">
              <h1 className="profile-name">{tutor.nome_completo}</h1>
              <span className="profile-id">ID: {tutor.id}</span>
            </div>

            <div className="profile-subtitle">
              <span>Responsável por: </span>
              {animalNames.length > 0 ? (
                <strong>{animalNames.join(', ')}</strong>
              ) : (
                <span>Nenhum animal</span>
              )}
            </div>

          </div>

          <div className="profile-quick-actions">
            <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>
              <Edit size={18} />
              Editar Responsável
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="profile-stats-bar">
          <div className="stat-item">
            <div className="stat-label">CPF</div>
            <div className="stat-value">{tutor.cpf || '--'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Telefone</div>
            <div className="stat-value">{formatPhone(tutor.telefone) || '--'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Bairro</div>
            <div className="stat-value">{tutor.endereco_bairro || '--'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Cidade</div>
            <div className="stat-value">{tutor.endereco_cidade || '--'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">{animais.length > 1 ? 'Animais' : 'Animal'}</div>
            <div className="stat-value">{animais.length}</div>
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
                {tab.id === 'animais' && <span className="tab-badge">{animais.length}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content-area">
        {renderTabContent()}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <TutorModal
          tutor={tutor}
          tutorAnimais={animais}
          allAnimais={allAnimais}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            fetchData();
          }}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default TutorDetailsPage;
