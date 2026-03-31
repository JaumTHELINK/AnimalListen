import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, PawPrint as Paw, User, Calendar, Activity, X, Upload, FileText, Scale, Dog, Cat, Bird, Rat, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Select from 'react-select';
import { apiJson } from '../utils/api';

export const AnimalModal = ({ animal, tutores, onClose, onSave }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState(animal || {
    tutor_id: tutores.length > 0 ? tutores[0].id : '',
    nome: '',
    especie: 'Cão',
    raca: '',
    sexo: 'Macho',
    data_nascimento: '',
    peso: '',
    condicao_corporal: '',
    cor: '',
    porte: 'Médio',
    pelagem: '',
    microchip: '',
    temperamento: '',
    castrado: false,
    foto_base64: ''
  });

  const [idadeAnos, setIdadeAnos] = useState(() => {
    if (animal?.data_nascimento) {
      const birth = new Date(animal.data_nascimento + 'T12:00:00');
      const now = new Date();
      const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      return Math.max(0, Math.floor(totalMonths / 12));
    }
    return 0;
  });
  const [idadeMeses, setIdadeMeses] = useState(() => {
    if (animal?.data_nascimento) {
      const birth = new Date(animal.data_nascimento + 'T12:00:00');
      const now = new Date();
      const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      return Math.max(0, totalMonths % 12);
    }
    return 0;
  });

  const normalizeText = (value = '') => value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const tutorOptions = tutores.map((t) => ({
    value: t.id,
    label: `${t.nome_completo} (CPF: ${t.cpf})`,
    searchText: `${t.nome_completo} ${t.cpf}`
  }));

  const handleMicrochipChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
    setFormData({ ...formData, microchip: digits });
  };

  const formatMicrochip = (value) => {
    if (!value) return '';
    const d = value.replace(/\D/g, '');
    if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return d;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto_base64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validação do microchip (quando preenchido deve ter 15 dígitos ISO 11784/11785)
    if (formData.microchip && formData.microchip.length > 0 && formData.microchip.length !== 15) {
      alert('Microchip deve conter 15 dígitos (ISO 11784/11785).');
      return;
    }

    let finalDataNascimento = formData.data_nascimento;
    if (!finalDataNascimento && (idadeAnos > 0 || idadeMeses > 0)) {
      const date = new Date();
      date.setFullYear(date.getFullYear() - idadeAnos);
      date.setMonth(date.getMonth() - idadeMeses);
      finalDataNascimento = date.toISOString().split('T')[0];
    }

    const tutorId = Number(formData.tutor_id);
    if (!Number.isInteger(tutorId) || tutorId <= 0) {
      alert('Selecione um tutor válido para o animal.');
      return;
    }

    if (!finalDataNascimento) {
      alert('Informe a data de nascimento ou idade aproximada do animal.');
      return;
    }

    const payload = {
      ...formData,
      tutor_id: tutorId,
      peso: formData.peso ? parseFloat(formData.peso) : null,
      data_nascimento: finalDataNascimento
    };

    try {
      await apiJson(animal?.id ? `/animais/${animal.id}` : '/animais', {
        method: animal?.id ? 'PUT' : 'POST',
        token,
        body: payload
      });

      onSave();
    } catch (error) {
      alert(error.message || 'Não foi possível salvar o animal.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2>{animal ? 'Editar Animal' : 'Novo Animal'}</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-section-title">Foto do Paciente</div>
          <div className="form-row" style={{ alignItems: 'center', marginBottom: '1.5rem' }}>
            {formData.foto_base64 ? (
              <img
                src={formData.foto_base64}
                alt="Preview"
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginRight: '1rem' }}
              />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                <Paw size={32} color="#aaa" />
              </div>
            )}
            <div>
              <label htmlFor="foto-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={16} />
                Escolher Imagem
              </label>
              <input
                id="foto-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="form-section-title">Informações Principais</div>
          <div className="form-row">
            <div className="form-group flex-2">
              <label>Nome do Animal *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div className="form-group flex-2">
              <label>Tutor Responsável *</label>
              <Select
                value={tutorOptions.find(opt => opt.value === Number(formData.tutor_id))}
                onChange={(selected) => setFormData({ ...formData, tutor_id: selected ? selected.value : '' })}
                options={tutorOptions}
                placeholder="Pesquisar tutor..."
                isSearchable
                isClearable
                filterOption={(option, inputValue) => {
                  if (!inputValue) return true;
                  return normalizeText(option.data.searchText).includes(normalizeText(inputValue));
                }}
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Espécie *</label>
              <select
                value={formData.especie}
                onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                required
              >
                <option value="Cão">Cão</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Roedor">Roedor</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Raça</label>
              <input
                type="text"
                value={formData.raca}
                onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Sexo *</label>
              <select
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                required
              >
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>
          </div>

          <div className="birth-or-age-row">
            <div className="form-group birth-date-group">
              <label>Data de Nascimento *</label>
              <input
                type="date"
                value={formData.data_nascimento}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
              />
            </div>
            <div className="birth-ou-label">OU</div>
            <div className="form-group">
              <label>Anos</label>
              <select value={idadeAnos} onChange={(e) => setIdadeAnos(parseInt(e.target.value))}>
                {Array.from({ length: 31 }, (_, i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Meses</label>
              <select value={idadeMeses} onChange={(e) => setIdadeMeses(parseInt(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row animal-metrics-row">
            <div className="form-group">
              <label>Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Porte</label>
              <select
                value={formData.porte}
                onChange={(e) => setFormData({ ...formData, porte: e.target.value })}
              >
                <option value="Micro">Micro</option>
                <option value="Pequeno">Pequeno</option>
                <option value="Médio">Médio</option>
                <option value="Grande">Grande</option>
                <option value="Gigante">Gigante</option>
              </select>
            </div>
            <div className="form-group">
              <label>Condição Corporal</label>
              <select
                value={formData.condicao_corporal || ''}
                onChange={(e) => setFormData({ ...formData, condicao_corporal: e.target.value })}
              >
                <option value="">Não informado</option>
                <option value="magro">Magro</option>
                <option value="ideal">Ideal</option>
                <option value="obeso">Obeso</option>
              </select>
            </div>
          </div>

          <div className="form-section-title">Detalhes Médicos</div>

          <div className="form-row">
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="castrado"
                checked={formData.castrado}
                onChange={(e) => setFormData({ ...formData, castrado: e.target.checked })}
                style={{ width: '20px', height: '20px' }}
              />
              <label htmlFor="castrado" style={{ margin: 0, cursor: 'pointer' }}>Animal Castrado</label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Temperamento</label>
              <input
                type="text"
                value={formData.temperamento || ''}
                onChange={(e) => setFormData({ ...formData, temperamento: e.target.value })}
                placeholder="Ex: Calmo, agressivo, ansioso"
              />
            </div>
            <div className="form-group">
              <label>Pelagem</label>
              <input
                type="text"
                value={formData.pelagem || ''}
                onChange={(e) => setFormData({ ...formData, pelagem: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Microchip (ISO 11784/11785)</label>
              <input
                type="text"
                value={formData.microchip ? (formData.microchip.length > 3 ? `${formData.microchip.slice(0, 3)}-${formData.microchip.slice(3)}` : formData.microchip) : ''}
                onChange={handleMicrochipChange}
                placeholder="000-000000000000"
                maxLength={16}
              />
              <small style={{ display: 'block', marginTop: '6px', color: '#64748b', fontSize: '12px' }}>
                Formato ISO 11784/11785 — 15 dígitos. Ex: 123-456789012345. Os 3 primeiros indicam país/fabricante.
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Animal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AnimaisPage = ({ setCurrentPage, autoOpenNovoModalWithTutorId }) => {
  const { token } = useAuth();
  const [animais, setAnimais] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAnimal, setCurrentAnimal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (autoOpenNovoModalWithTutorId && tutores.length > 0 && !showModal) {
      setCurrentAnimal({
        tutor_id: autoOpenNovoModalWithTutorId,
        nome: '',
        especie: 'Cão',
        raca: '',
        sexo: 'Macho',
        data_nascimento: '',
        peso: '',
        condicao_corporal: '',
        cor: '',
        porte: 'Médio',
        pelagem: '',
        microchip: '',
        temperamento: '',
        castrado: false,
        foto_base64: ''
      });
      setShowModal(true);
      if (setCurrentPage) {
        setCurrentPage('animais');
      }
    }
  }, [autoOpenNovoModalWithTutorId, tutores, showModal, setCurrentPage]);

  const fetchData = async () => {
    const [tutoresData, animaisData] = await Promise.all([
      apiJson('/tutores', { token }),
      apiJson('/animais', { token })
    ]);

    setTutores(tutoresData);
    setAnimais(animaisData);
  };

  const handleEdit = (animal) => {
    setCurrentAnimal(animal);
    setShowModal(true);
  };

  const handleNew = () => {
    setCurrentAnimal(null);
    setShowModal(true);
  };

  // Associate tutor details locally for the list
  const animaisComTutores = animais.map(a => ({
    ...a,
    tutor_nome: tutores.find(t => t.id === a.tutor_id)?.nome_completo || 'Desconhecido'
  }));

  const filteredAnimais = animaisComTutores.filter(a =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.tutor_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Animais Pacientes</h1>
        <div className="page-actions">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por pet ou tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleNew} className="btn btn-primary">
            <Plus size={18} />
            Cadastrar Animal
          </button>
        </div>
      </div>

      <div className="card-grid">
        {filteredAnimais.map(animal => (
          <div key={animal.id} className="card">
            <div className="card-header">
              {animal.foto_base64 ? (
                <img
                  src={animal.foto_base64}
                  alt={animal.nome}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div className="avatar-large" style={{ backgroundColor: '#e2e8f0', color: '#64748b' }}>
                  <Paw size={24} />
                </div>
              )}
            </div>
            <div className="card-body">
              <h3 style={{ margin: '8px 0', fontSize: '18px' }}>{animal.nome}</h3>

              <div className="info-list" style={{ marginTop: '12px' }}>
                <div className="info-item">
                  {(() => {
                    const e = (animal.especie || '').toLowerCase();
                    if (e.includes('cão') || e.includes('cachorro')) return <Dog size={14} />;
                    if (e.includes('gato') || e.includes('felino')) return <Cat size={14} />;
                    if (e.includes('ave') || e.includes('pássaro')) return <Bird size={14} />;
                    if (e.includes('roedor') || e.includes('hamster') || e.includes('rato')) return <Rat size={14} />;
                    return <Paw size={14} />;
                  })()}
                  <span>{animal.especie} {animal.raca && `- ${animal.raca}`}</span>
                </div>

                <div className="info-item">
                  <Scale size={14} />
                  <span>
                    {animal.peso ? `${animal.peso} kg` : 'Peso n/a'} • {animal.porte}
                    {animal.condicao_corporal ? ` • ${animal.condicao_corporal.charAt(0).toUpperCase()}${animal.condicao_corporal.slice(1)}` : ''}
                  </span>
                </div>

                {animal.microchip && (
                  <div className="info-item" style={{ fontSize: '12px', color: '#64748b' }}>
                    <Cpu size={13} color="#64748b" />
                    <span style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>{animal.microchip.length > 3 ? `${animal.microchip.slice(0, 3)}-${animal.microchip.slice(3)}` : animal.microchip}</span>
                  </div>
                )}

                <div className="info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Responsável:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={12} color="#475569" />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>{animal.tutor_nome}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setCurrentPage('animal-detalhes-' + animal.id)}
                >
                  <FileText size={16} />
                  Ver Prontuário / Detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredAnimais.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
            Nenhum animal cadastrado ou encontrado na busca.
          </div>
        )}
      </div>

      {showModal && (
        <AnimalModal
          animal={currentAnimal}
          tutores={tutores}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchData();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AnimaisPage;
