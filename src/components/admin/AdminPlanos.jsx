import { useState } from 'react';
import { usePlanos } from '../../hooks/useAdmin';
import { Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import { toast } from 'sonner';

const emptyPlano = { nome: '', preco: '', duracao_dias: 30, descricao: '', ativo: true };

export default function AdminPlanos() {
  const { planos, isLoading, savePlano, deletePlano } = usePlanos();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlano);

  const startNew = () => {
    setForm(emptyPlano);
    setEditing('new');
  };

  const startEdit = (p) => {
    setForm({ id: p.id, nome: p.nome, preco: p.preco, duracao_dias: p.duracao_dias, descricao: p.descricao || '', ativo: p.ativo });
    setEditing(p.id);
  };

  const handleSave = async () => {
    try {
      await savePlano({ ...form, preco: Number(form.preco) });
      setEditing(null);
      toast.success('Plano salvo com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar plano: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este plano permanentemente?')) return;
    try {
      await deletePlano(id);
      toast.success('Plano excluído');
    } catch (err) {
      toast.error('Erro ao excluir: ' + err.message);
    }
  };

  if (isLoading) return <div className="admin-loading"><div className="spinner" /></div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2><Package size={22} /> Gerenciar Planos</h2>
        <button className="admin-btn primary" onClick={startNew}>
          <Plus size={16} /> Novo Plano
        </button>
      </div>

      {editing && (
        <div className="admin-form-card">
          <h3>{editing === 'new' ? 'Novo Plano' : 'Editar Plano'}</h3>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label>Nome</label>
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Básico" />
            </div>
            <div className="admin-field">
              <label>Preço (R$)</label>
              <input type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} placeholder="99.90" />
            </div>
            <div className="admin-field">
              <label>Duração (dias)</label>
              <input type="number" value={form.duracao_dias} onChange={(e) => setForm({ ...form, duracao_dias: Number(e.target.value) })} />
            </div>
            <div className="admin-field">
              <label>Descrição</label>
              <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição do plano..." />
            </div>
            <div className="admin-field checkbox">
              <label>
                <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
                Plano ativo
              </label>
            </div>
          </div>
          <div className="admin-form-actions">
            <button className="admin-btn primary" onClick={handleSave}><Save size={16} /> Salvar</button>
            <button className="admin-btn ghost" onClick={() => setEditing(null)}><X size={16} /> Cancelar</button>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Duração</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {planos.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">Nenhum plano cadastrado</td></tr>
            )}
            {planos.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.nome}</td>
                <td>R$ {Number(p.preco).toFixed(2)}</td>
                <td>{p.duracao_dias} dias</td>
                <td>
                  <span className={`admin-badge ${p.ativo ? 'success' : 'muted'}`}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="admin-actions-cell">
                  <button className="admin-icon-btn" onClick={() => startEdit(p)} title="Editar"><Edit2 size={16} /></button>
                  <button className="admin-icon-btn danger" onClick={() => handleDelete(p.id)} title="Excluir"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
