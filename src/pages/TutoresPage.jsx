import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Phone, Mail, MapPin, X, PawPrint as Paw, FileText, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Select from 'react-select';
import { apiJson } from '@/utils/api';

const formatCep = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export const TutorModal = ({ tutor, tutorAnimais, allAnimais, onClose, onSave, setCurrentPage }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState(tutor || {
    nome_completo: '',
    cpf: '',
    telefone: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_cep: ''
  });
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [lastFetchedCep, setLastFetchedCep] = useState('');

  const [selectedPetOption, setSelectedPetOption] = useState(null);

  useEffect(() => {
    if (tutor?.endereco_cep) {
      setFormData((prev) => ({ ...prev, endereco_cep: formatCep(tutor.endereco_cep) }));
      setLastFetchedCep(tutor.endereco_cep.replace(/\D/g, '').slice(0, 8));
    }
  }, [tutor]);

  const fetchCepData = async (cepDigits) => {
    if (cepDigits.length !== 8 || cepDigits === lastFetchedCep) return;

    try {
      setIsCepLoading(true);
      setCepError('');
      const data = await apiJson(`https://viacep.com.br/ws/${cepDigits}/json/`);

      if (!data || data.erro) {
        setCepError('CEP nao encontrado.');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        endereco_cep: formatCep(cepDigits),
        endereco_rua: data.logradouro || '',
        endereco_bairro: data.bairro || '',
        endereco_cidade: data.localidade || ''
      }));
      setLastFetchedCep(cepDigits);
    } catch {
      setCepError('Nao foi possivel consultar o CEP agora.');
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleCepChange = (e) => {
    const maskedCep = formatCep(e.target.value);
    const cepDigits = maskedCep.replace(/\D/g, '');

    setFormData((prev) => ({ ...prev, endereco_cep: maskedCep }));
    setCepError('');

    if (cepDigits.length < 8) {
      setLastFetchedCep('');
      return;
    }

    fetchCepData(cepDigits);
  };

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setFormData({ ...formData, cpf: value });
  };

  const petOptions = [
    { value: 'novo', label: '+ Cadastrar novo paciente...', isNovo: true },
    ...(tutorAnimais || []).map(a => ({ value: a.id, label: `✅ ${a.nome} (${a.especie}) - Já vinculado` })),
    ...(allAnimais || []).filter(a => a.tutor_id !== tutor?.id).map(a => ({ value: a.id, label: `${a.nome} (${a.especie}) - Buscar outro` }))
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const savedTutor = await apiJson(tutor ? `/tutores/${tutor.id}` : '/tutores', {
      method: tutor ? 'PUT' : 'POST',
      token,
      body: formData
    });

    if (selectedPetOption?.value === 'novo') {
      onClose();
      if (setCurrentPage) {
        setCurrentPage(`animais-novo-${savedTutor.id}`);
      }
      return;
    }

    if (selectedPetOption && selectedPetOption.value !== 'novo') {
      const animalData = await apiJson(`/animais/${selectedPetOption.value}`, {
        token
      });
      if (animalData.tutor) delete animalData.tutor;
      animalData.tutor_id = savedTutor.id;
      await apiJson(`/animais/${selectedPetOption.value}`, {
        method: 'PUT',
        token,
        body: animalData
      });
    }

    onSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{tutor ? 'Editar Tutor' : 'Novo Tutor'}</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Nome Completo *</label>
              <input
                type="text"
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CPF *</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                maxLength="14"
                required
              />
            </div>
            <div className="form-group">
              <label>Telefone *</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '');
                  if (v.length > 11) v = v.slice(0, 11);
                  if (v.length > 7) {
                    v = `(${v.slice(0,2)}) ${v.slice(2,3)} ${v.slice(3,7)}-${v.slice(7)}`;
                  } else if (v.length > 3) {
                    v = `(${v.slice(0,2)}) ${v.slice(2)}`;
                  } else if (v.length > 2) {
                    v = `(${v.slice(0,2)}) ${v.slice(2)}`;
                  }
                  setFormData({ ...formData, telefone: v });
                }}
                placeholder="(00) 0 0000-0000"
                maxLength="16"
                required
              />
            </div>
          </div>



          <div className="form-section-title">Endereço</div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Rua</label>
              <input
                type="text"
                value={formData.endereco_rua}
                onChange={(e) => setFormData({ ...formData, endereco_rua: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Número</label>
              <input
                type="text"
                value={formData.endereco_numero}
                onChange={(e) => setFormData({ ...formData, endereco_numero: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bairro</label>
              <input
                type="text"
                value={formData.endereco_bairro}
                onChange={(e) => setFormData({ ...formData, endereco_bairro: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <input
                type="text"
                value={formData.endereco_cidade}
                onChange={(e) => setFormData({ ...formData, endereco_cidade: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>CEP</label>
              <input
                type="text"
                value={formData.endereco_cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength="9"
              />
              {isCepLoading && <small style={{ color: '#64748b' }}>Buscando endereco...</small>}
              {!isCepLoading && cepError && <small style={{ color: '#dc2626' }}>{cepError}</small>}
            </div>
          </div>

          <div className="form-section-title" style={{ marginTop: '20px' }}>Paciente (Animal)</div>

          <div className="form-row" style={{ marginBottom: selectedPetOption?.value === 'novo' ? '4px' : '20px' }}>
            <div className="form-group flex-2">
              <label>Animal(is) do Tutor</label>
              <Select
                value={selectedPetOption}
                onChange={setSelectedPetOption}
                options={petOptions}
                placeholder="Pesquisar paciente existente ou cadastrar um novo..."
                isSearchable
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
                  }),
                  option: (base, { data }) => ({
                    ...base,
                    fontWeight: data.isNovo ? 'bold' : 'normal',
                    color: data.isNovo ? '#0284c7' : base.color
                  })
                }}
              />
            </div>
          </div>

          {selectedPetOption?.value === 'novo' && (
            <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              Ao salvar o tutor, você será redirecionado para a tela de Animais para concluir o cadastro do paciente passo a passo.
            </div>
          )}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

const TutoresPage = ({ setCurrentPage }) => {
  const { token } = useAuth();
  const [tutores, setTutores] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTutor, setCurrentTutor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTutores();
  }, []);

  const fetchTutores = async () => {
    const [tutoresData, animaisData] = await Promise.all([
      apiJson('/tutores', { token }),
      apiJson('/animais', { token })
    ]);

    setTutores(tutoresData);
    setAnimais(animaisData);
  };

  const handleEdit = (tutor) => {
    setCurrentTutor(tutor);
    setShowModal(true);
  };

  const handleNew = () => {
    setCurrentTutor(null);
    setShowModal(true);
  };

  const filteredTutores = tutores.filter(t =>
    t.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.cpf.includes(searchTerm)
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Tutores</h1>
        <div className="page-actions">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleNew} className="btn btn-primary">
            <Plus size={18} />
            Novo Tutor
          </button>
        </div>
      </div>

      <div className="card-grid">
        {filteredTutores.map(tutor => {
          const tutorAnimais = animais.filter(a => a.tutor_id === tutor.id);
          return (
            <div key={tutor.id} className="card">
              <div className="card-header">
                <div className="avatar-large">
                  {tutor.nome_completo[0]}
                </div>
              </div>
              <div className="card-body">
                <h3 style={{ margin: '8px 0', fontSize: '18px' }}>{tutor.nome_completo}</h3>

                <div className="info-list" style={{ marginTop: '12px' }}>
                  <div className="info-item">
                    <Phone size={14} />
                    <span style={{ fontSize: '14px' }}>{formatPhone(tutor.telefone)}</span>
                  </div>
                  <div className="info-item" style={{ fontSize: '13px', color: '#64748b' }}>
                    <BadgeCheck size={14} />
                    <span>CPF: {tutor.cpf || 'Não informado'}</span>
                  </div>
                  <div className="info-item">
                    <MapPin size={14} />
                    <span style={{ fontSize: '14px' }}>{tutor.endereco_bairro || 'Endereço não informado'}</span>
                  </div>
                  <div className="info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Responsável por:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {tutorAnimais.length > 0 ? (
                        tutorAnimais.map(a => (
                          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                            {a.foto_base64 ? (
                              <img src={a.foto_base64} alt={a.nome} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Paw size={12} color="#475569" />
                              </div>
                            )}
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>{a.nome}</span>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Nenhum paciente</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setCurrentPage(`tutor-detalhes-${tutor.id}`)}
                  >
                    <FileText size={16} />
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <TutorModal
          tutor={currentTutor}
          tutorAnimais={animais.filter(a => a.tutor_id === currentTutor?.id)}
          allAnimais={animais}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchTutores();
            setShowModal(false);
          }}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default TutoresPage;
