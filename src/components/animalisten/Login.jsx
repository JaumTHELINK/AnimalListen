import { useState } from 'react';
import { PawPrint as Paw, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) { toast.error('Preencha email e senha'); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;

      const { data: assinante } = await supabase
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
      toast.error('Email ou senha inválidos. Tente novamente.');
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
            <h1>AnimalListen</h1>
            <p>Sistema Veterinário Premium</p>
          </div>

          <form className="login-action" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pront-input"
              placeholder="Email"
              autoComplete="username"
              required
            />
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="pront-input"
              placeholder="Senha"
              autoComplete="current-password"
              required
            />
            <button type="submit" className="btn-premium" disabled={loading}>
              <span>{loading ? 'Acessando...' : 'Acessar Sistema'}</span>
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
