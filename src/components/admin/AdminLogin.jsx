import { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <div className="admin-login-icon">
          <Shield size={40} />
        </div>
        <h1>Acesso Administrativo</h1>
        <p className="admin-login-subtitle">AnimalListen Pro</p>

        {error && (
          <div className="admin-login-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="admin-field">
          <label><Mail size={14} /> Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@animalisten.com"
            required
          />
        </div>

        <div className="admin-field">
          <label><Lock size={14} /> Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="admin-login-btn" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
