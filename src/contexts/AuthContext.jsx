import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('supabase-session');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreUser = async (authUser) => {
      try {
        const { data: assinante } = await supabase
          .from('assinantes')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (mounted && assinante && assinante.status === 'ativo') {
          setUser({
            id: authUser.id,
            nome_completo: assinante.nome,
            email: assinante.email,
            crmv: assinante.crmv,
            perfil: 'veterinario',
            assinante_id: assinante.id,
            senha_alterada: assinante.senha_alterada,
          });
          setToken('supabase-session');
        }
      } catch (err) {
        console.error('Erro ao restaurar sessão:', err);
      }
      if (mounted) setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        if (mounted) { setUser(null); setToken(null); setLoading(false); }
        return;
      }
      if (session?.user && !user) restoreUser(session.user);
      else if (!session?.user && mounted) setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) restoreUser(session.user);
      else if (mounted) setLoading(false);
    }).catch(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: assinante } = await supabase
      .from('assinantes')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (!assinante) {
      await supabase.auth.signOut();
      throw new Error('Acesso negado. Conta não vinculada.');
    }

    if (assinante.status === 'suspenso' || assinante.status === 'expirado') {
      await supabase.auth.signOut();
      throw new Error('Sua assinatura está suspensa.');
    }

    setUser({
      id: data.user.id,
      nome_completo: assinante.nome,
      email: assinante.email,
      crmv: assinante.crmv,
      perfil: 'veterinario',
      assinante_id: assinante.id,
      senha_alterada: assinante.senha_alterada,
    });
    setToken('supabase-session');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
