import { useState } from 'react';
import { LogIn } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Login estético — entra direto sem validação
    onLogin({ nome: 'Dr. Veterinário', email: email || 'admin@animalisten.com', crmv: 'CRMV-CE 12345' });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo.png" alt="AnimaListen" />
          <h1>AnimaListen</h1>
          <p>Sistema Veterinários</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-input"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn">
            <LogIn size={20} />
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
