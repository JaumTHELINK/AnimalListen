import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error('Preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) throw error;

      // Check if user is a veterinario (assinante)
      const { data: assinante, error: assinanteError } = await supabase
        .from('assinantes')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!assinante) {
        await supabase.auth.signOut();
        toast.error('Acesso negado. Conta não vinculada a um consultório.');
        return;
      }

      if (assinante.status === 'suspenso' || assinante.status === 'expirado') {
        await supabase.auth.signOut();
        toast.error('Sua assinatura está suspensa. Entre em contato com o administrador.');
        return;
      }

      onLogin({
        id: data.user.id,
        nome: assinante.nome,
        email: assinante.email,
        crmv: assinante.crmv,
        assinante_id: assinante.id,
        senha_alterada: assinante.senha_alterada,
      });
    } catch (err) {
      toast.error('Erro no login: ' + err.message);
    } finally {
      setLoading(false);
    }
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
              required
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
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            <LogIn size={20} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
