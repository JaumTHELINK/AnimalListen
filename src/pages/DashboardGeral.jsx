import React, { useState, useEffect } from 'react';
import { Users, PawPrint as Paw, AlertCircle, FileText, Bed } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiJson } from '@/utils/api';

const DashboardGeral = ({ setCurrentPage }) => {
  const [stats, setStats] = useState({
    tutores: 0,
    animais: 0,
    triagens_pendentes: 0,
    internacoes_ativas: 0
  });

  const { token, user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tutores, animais, triagens, internacoes] = await Promise.all([
          apiJson('/tutores', { token }),
          apiJson('/animais', { token }),
          apiJson('/triagens', { token }),
          apiJson('/internacoes', { token }).catch(() => [])
        ]);

        const triagens_pendentes = Array.isArray(triagens) ? triagens.filter(t => !t.atendida).length : 0;
        const internacoes_ativas = Array.isArray(internacoes) ? internacoes.filter(i => i.status !== 'alta').length : 0;

        setStats({
          tutores: Array.isArray(tutores) ? tutores.length : 0,
          animais: Array.isArray(animais) ? animais.length : 0,
          triagens_pendentes,
          internacoes_ativas
        });
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  return (
    <div className="dashboard">
      <h1>Dashboard - {user?.nome_completo || 'Equipe'}</h1>
      
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon"><Users size={32} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.tutores}</div>
            <div className="stat-label">Tutores</div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon"><Paw size={32} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.animais}</div>
            <div className="stat-label">Animais</div>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon"><AlertCircle size={32} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.triagens_pendentes}</div>
            <div className="stat-label">Triagens Pendentes</div>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon"><Bed size={32} /></div>
          <div className="stat-content">
            <div className="stat-value">{stats.internacoes_ativas}</div>
            <div className="stat-label">Internações Ativas</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Ações Rápidas</h2>
        <div className="action-buttons">
          <button onClick={() => setCurrentPage('tutores')} className="action-card">
            <Users size={24} />
            <span>Novo Tutor</span>
          </button>
          <button onClick={() => setCurrentPage('animais')} className="action-card">
            <Paw size={24} />
            <span>Novo Animal</span>
          </button>
          <button onClick={() => setCurrentPage('triagem')} className="action-card">
            <AlertCircle size={24} />
            <span>Nova Triagem</span>
          </button>
          <button onClick={() => setCurrentPage('prontuarios')} className="action-card">
            <FileText size={24} />
            <span>Novo Prontuário</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardGeral;
