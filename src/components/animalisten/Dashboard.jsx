import { AlertCircle, Bed, FileText, Heart, Users, PawPrint } from 'lucide-react';

export default function Dashboard({ prontuarios = [], tutores = [], internacoes = [], triagens = [], onNavigate, onSelectProntuario }) {
  const triagensPendentes = triagens.filter(t => !t.atendida);
  const internacoesAtivas = internacoes.filter(i => i.status !== 'alta');
  const totalTutores = tutores.length;
  const totalAnimais = tutores.reduce((acc, t) => acc + (t.pacientes?.length || 0), 0);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">
            <Users size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalTutores}</div>
            <div className="stat-label">Tutores Cadastrados</div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">
            <PawPrint size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalAnimais}</div>
            <div className="stat-label">Pacientes</div>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">
            <AlertCircle size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{triagensPendentes.length}</div>
            <div className="stat-label">Triagens Pendentes</div>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">
            <Bed size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{internacoesAtivas.length}</div>
            <div className="stat-label">Internações Ativas</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Ações Rápidas</h2>
        <div className="action-buttons">
          <button onClick={() => onNavigate('triagem')} className="action-card">
            <AlertCircle size={24} />
            <span>Nova Triagem</span>
          </button>
          <button onClick={() => onNavigate('triagens-pendentes')} className="action-card">
            <FileText size={24} />
            <span>Ver Triagens</span>
          </button>
          <button onClick={() => onNavigate('prontuario-hub')} className="action-card">
            <FileText size={24} />
            <span>Prontuários</span>
          </button>
          <button onClick={() => onNavigate('internacao')} className="action-card">
            <Bed size={24} />
            <span>Internações</span>
          </button>
          <button onClick={() => onNavigate('tutores')} className="action-card">
            <Users size={24} />
            <span>Novo Tutor</span>
          </button>
          <button onClick={() => onNavigate('animais')} className="action-card">
            <PawPrint size={24} />
            <span>Animais</span>
          </button>
        </div>
      </div>
    </div>
  );
}
