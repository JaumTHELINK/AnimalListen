import React, { useState } from 'react';
import { PawPrint as Paw, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleEnter = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Erro ao entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo-container">
            <div className="logo-circle">
              <Paw className="logo-icon-large" />
            </div>
            <h1>ApexVet</h1>
            <p>Sistema Veterinário Premium</p>
          </div>

          <form className="login-action" onSubmit={handleEnter}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="pront-input"
              placeholder="Email"
              autoComplete="username"
              required
              style={{ marginBottom: '12px' }}
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pront-input"
              placeholder="Senha"
              autoComplete="current-password"
              required
              style={{ marginBottom: '12px' }}
            />
            {error && <p className="login-hint" style={{ color: '#b91c1c', marginBottom: '12px' }}>{error}</p>}
            <button 
              type="submit"
              className="btn-premium btn-block" 
              disabled={loading}
            >
              <span>{loading ? 'Acessando...' : 'Acessar Sistema'}</span>
              {!loading && <ArrowRight className="btn-icon-right" size={20} />}
            </button>
            <p className="login-hint">Use uma conta válida cadastrada no backend.</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
