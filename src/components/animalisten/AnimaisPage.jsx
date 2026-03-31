import { useState } from 'react';
import { Search, Plus, PawPrint as Paw, User, Edit, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AnimaisPage({ tutores, onSavePaciente, onDeletePaciente, onNavigate }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editAnimal, setEditAnimal] = useState(null);

  const allPacientes = (tutores || []).flatMap(t => (t.pacientes || []).map(p => ({ ...p, tutor: t })));
  
  const filtered = allPacientes.filter(p => {
    const s = search.toLowerCase();
    return p.nome?.toLowerCase().includes(s) || p.especie?.toLowerCase().includes(s) || p.tutor?.nome?.toLowerCase().includes(s);
  });

  const [form, setForm] = useState({ tutor_id: '', nome: '', especie: 'Cão', raca: '', sexo: 'Macho', peso: '', porte: 'Médio', pelagem: '', microchip: '', castrado: false, alergias: '', doenca_cronica: '' });

  const openNew = () => {
    setEditAnimal(null);
    setForm({ tutor_id: '', nome: '', especie: 'Cão', raca: '', sexo: 'Macho', peso: '', porte: 'Médio', pelagem: '', microchip: '', castrado: false, alergias: '', doenca_cronica: '' });
    setShowModal(true);
  };

  const openEdit = (animal) => {
    setEditAnimal(animal);
    setForm({ ...animal, tutor_id: animal.tutor_id });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tutor_id || !form.nome) { toast.error('Preencha tutor e nome'); return; }
    try {
      await onSavePaciente({ ...form, id: editAnimal?.id, peso: form.peso ? parseFloat(form.peso) : null });
      toast.success(editAnimal ? 'Animal atualizado!' : 'Animal cadastrado!');
      setShowModal(false);
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Animais</h1>
        <button className="btn btn-primary btn-pill" onClick={openNew}><Plus size={18} /> Novo Animal</button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input placeholder="Buscar por nome, espécie ou tutor..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><Paw size={48} color="#9ca3af" /><p>Nenhum animal encontrado</p></div>
      ) : (
        <div className="animal-cards-list">
          {filtered.map(p => (
            <div key={p.id} className="animal-card" onClick={() => openEdit(p)}>
              <div className="animal-card-avatar"><Paw size={24} /></div>
              <div className="animal-card-info">
                <div className="animal-card-name">{p.nome}</div>
                <div className="animal-card-meta">
                  {p.especie}{p.raca && <><span className="dot-separator">•</span>{p.raca}</>}
                  {p.sexo && <><span className="dot-separator">•</span>{p.sexo}</>}
                </div>
                <div className="animal-card-meta">Tutor: {p.tutor?.nome || '-'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>{editAnimal ? 'Editar Animal' : 'Novo Animal'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Nome *</label>
                  <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Tutor *</label>
                  <select value={form.tutor_id} onChange={e => setForm({ ...form, tutor_id: e.target.value })} required>
                    <option value="">Selecione</option>
                    {(tutores || []).map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Espécie</label>
                  <select value={form.especie} onChange={e => setForm({ ...form, especie: e.target.value })}>
                    <option>Cão</option><option>Gato</option><option>Ave</option><option>Roedor</option><option>Outro</option>
                  </select>
                </div>
                <div className="form-group"><label>Raça</label><input value={form.raca || ''} onChange={e => setForm({ ...form, raca: e.target.value })} /></div>
                <div className="form-group"><label>Sexo</label>
                  <select value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })}>
                    <option>Macho</option><option>Fêmea</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Peso (kg)</label><input type="number" step="0.1" value={form.peso || ''} onChange={e => setForm({ ...form, peso: e.target.value })} /></div>
                <div className="form-group"><label>Porte</label>
                  <select value={form.porte || ''} onChange={e => setForm({ ...form, porte: e.target.value })}>
                    <option>Mini</option><option>Pequeno</option><option>Médio</option><option>Grande</option><option>Gigante</option>
                  </select>
                </div>
                <div className="form-group"><label>Pelagem</label><input value={form.pelagem || ''} onChange={e => setForm({ ...form, pelagem: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Microchip</label><input value={form.microchip || ''} onChange={e => setForm({ ...form, microchip: e.target.value })} /></div>
                <div className="form-group"><label>Castrado</label>
                  <select value={form.castrado ? 'sim' : 'nao'} onChange={e => setForm({ ...form, castrado: e.target.value === 'sim' })}>
                    <option value="nao">Não</option><option value="sim">Sim</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Alergias</label><input value={form.alergias || ''} onChange={e => setForm({ ...form, alergias: e.target.value })} /></div>
              <div className="form-group"><label>Doença Crônica</label><input value={form.doenca_cronica || ''} onChange={e => setForm({ ...form, doenca_cronica: e.target.value })} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                {editAnimal && <button type="button" className="btn btn-danger" onClick={async () => { await onDeletePaciente(editAnimal.id); setShowModal(false); toast.success('Removido'); }}>Excluir</button>}
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
