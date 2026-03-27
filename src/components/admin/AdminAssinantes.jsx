import { useState, useEffect } from 'react';
import { useAssinantes, usePlanos } from '../../hooks/useAdmin';
import { Plus, Edit2, Trash2, Save, X, Users, Ban, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const emptyAssinante = { nome: '', email: '', telefone: '', crmv: '', plano_id: '', assinatura_inicio: '', assinatura_fim: '', status: 'ativo' };

export default function AdminAssinantes() {
  const { assinantes, isLoading, saveAssinante, deleteAssinante, suspenderAssinante, reativarAssinante } = useAssinantes();
  const { planos } = usePlanos();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAssinante);

  // Auto-suspender expirados
  useEffect(() => {
    assinantes.forEach((a) => {
      if (a.status === 'ativo' && a.assinatura_fim && new Date(a.assinatura_fim) < new Date()) {
        suspenderAssinante(a.id).then(() => {
          toast.warning(`Assinatura de ${a.nome} expirou e foi suspensa automaticamente.`);
        });
      }
    });
  }, [assinantes]);

  const startNew = () => {
    setForm(emptyAssinante);
    setEditing('new');
  };

  const startEdit = (a) => {
    setForm({
      id: a.id,
      nome: a.nome,
      email: a.email || '',
      telefone: a.telefone || '',
      crmv: a.crmv || '',
      plano_id: a.plano_id || '',
      assinatura_inicio: a.assinatura_inicio ? a.assinatura_inicio.slice(0, 10) : '',
      assinatura_fim: a.assinatura_fim ? a.assinatura_fim.slice(0, 10) : '',
      status: a.status,
    });
    setEditing(a.id);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (!payload.plano_id) payload.plano_id = null;
      if (!payload.assinatura_inicio) payload.assinatura_inicio = null;
      if (!payload.assinatura_fim) payload.assinatura_fim = null;
      await saveAssinante(payload);
      setEditing(null);
      toast.success('Assinante salvo!');
    } catch (err) {
      toast.error('Erro: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este assinante?')) return;
    try {
      await deleteAssinante(id);
      toast.success('Assinante excluído');
    } catch (err) {
      toast.error('Erro: ' + err.message);
    }
  };

  const handleSuspender = async (id) => {
    if (!confirm('Suspender este assinante? O sistema ficará em modo leitura para ele.')) return;
    try {
      await suspenderAssinante(id);
      toast.success('Assinante suspenso');
    } catch (err) {
      toast.error('Erro: ' + err.message);
    }
  };

  const handleReativar = async (a) => {
    const plano = planos.find((p) => p.id === a.plano_id);
    const dias = plano ? plano.duracao_dias : 30;
    const novaFim = new Date();
    novaFim.setDate(novaFim.getDate() + dias);
    try {
      await reativarAssinante({ id: a.id, assinatura_fim: novaFim.toISOString() });
      toast.success(`Assinante reativado por ${dias} dias`);
    } catch (err) {
      toast.error('Erro: ' + err.message);
    }
  };

  const getStatusBadge = (status, assinatura_fim) => {
    const isExpired = assinatura_fim && new Date(assinatura_fim) < new Date();
    if (status === 'suspenso' || status === 'expirado') return <span className="admin-badge danger">Suspenso</span>;
    if (isExpired) return <span className="admin-badge warning">Expirado</span>;
    return <span className="admin-badge success">Ativo</span>;
  };

  const getDaysLeft = (fim) => {
    if (!fim) return null;
    const diff = Math.ceil((new Date(fim) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return <span className="days-expired"><AlertTriangle size={12} /> Expirado há {Math.abs(diff)} dias</span>;
    if (diff <= 7) return <span className="days-warning">{diff} dias restantes</span>;
    return <span className="days-ok">{diff} dias restantes</span>;
  };

  if (isLoading) return <div className="admin-loading"><div className="spinner" /></div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2><Users size={22} /> Gerenciar Assinantes</h2>
        <button className="admin-btn primary" onClick={startNew}>
          <Plus size={16} /> Novo Assinante
        </button>
      </div>

      {editing && (
        <div className="admin-form-card">
          <h3>{editing === 'new' ? 'Novo Assinante' : 'Editar Assinante'}</h3>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label>Nome *</label>
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do veterinário" required />
            </div>
            <div className="admin-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
            <div className="admin-field">
              <label>Telefone</label>
              <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div className="admin-field">
              <label>CRMV</label>
              <input value={form.crmv} onChange={(e) => setForm({ ...form, crmv: e.target.value })} placeholder="CRMV-SP 12345" />
            </div>
            <div className="admin-field">
              <label>Plano</label>
              <select value={form.plano_id} onChange={(e) => setForm({ ...form, plano_id: e.target.value })}>
                <option value="">Sem plano</option>
                {planos.filter((p) => p.ativo).map((p) => (
                  <option key={p.id} value={p.id}>{p.nome} - R$ {Number(p.preco).toFixed(2)}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label>Início da Assinatura</label>
              <input type="date" value={form.assinatura_inicio} onChange={(e) => setForm({ ...form, assinatura_inicio: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Fim da Assinatura</label>
              <input type="date" value={form.assinatura_fim} onChange={(e) => setForm({ ...form, assinatura_fim: e.target.value })} />
            </div>
            <div className="admin-field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="expirado">Expirado</option>
              </select>
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
              <th>CRMV</th>
              <th>Plano</th>
              <th>Validade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {assinantes.length === 0 && (
              <tr><td colSpan={6} className="admin-empty">Nenhum assinante cadastrado</td></tr>
            )}
            {assinantes.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="admin-cell-main">{a.nome}</div>
                  <div className="admin-cell-sub">{a.email}</div>
                </td>
                <td>{a.crmv || '—'}</td>
                <td>{a.planos?.nome || '—'}</td>
                <td>
                  {a.assinatura_fim
                    ? <>{new Date(a.assinatura_fim).toLocaleDateString('pt-BR')}<br />{getDaysLeft(a.assinatura_fim)}</>
                    : '—'
                  }
                </td>
                <td>{getStatusBadge(a.status, a.assinatura_fim)}</td>
                <td className="admin-actions-cell">
                  <button className="admin-icon-btn" onClick={() => startEdit(a)} title="Editar"><Edit2 size={16} /></button>
                  {a.status === 'ativo' ? (
                    <button className="admin-icon-btn warning" onClick={() => handleSuspender(a.id)} title="Suspender"><Ban size={16} /></button>
                  ) : (
                    <button className="admin-icon-btn success" onClick={() => handleReativar(a)} title="Reativar"><RefreshCw size={16} /></button>
                  )}
                  <button className="admin-icon-btn danger" onClick={() => handleDelete(a.id)} title="Excluir"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
