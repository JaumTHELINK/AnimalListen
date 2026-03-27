import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminAuth() {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        if (data) {
          setAdminUser(session.user);
        } else {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        if (data) {
          setAdminUser(session.user);
        } else {
          setAdminUser(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleData) {
      await supabase.auth.signOut();
      throw new Error('Acesso negado. Usuário não é administrador.');
    }
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
  };

  return { adminUser, loading, login, logout };
}

export function usePlanos() {
  const queryClient = useQueryClient();

  const { data: planos = [], isLoading } = useQuery({
    queryKey: ['planos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const savePlano = useMutation({
    mutationFn: async (plano) => {
      const { id, ...rest } = plano;
      if (id) {
        const { data, error } = await supabase.from('planos').update(rest).eq('id', id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('planos').insert(rest).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['planos'] }),
  });

  const deletePlano = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('planos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['planos'] }),
  });

  return {
    planos,
    isLoading,
    savePlano: (p) => savePlano.mutateAsync(p),
    deletePlano: (id) => deletePlano.mutateAsync(id),
  };
}

export function useAssinantes() {
  const queryClient = useQueryClient();

  const { data: assinantes = [], isLoading } = useQuery({
    queryKey: ['assinantes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assinantes')
        .select('*, planos(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveAssinante = useMutation({
    mutationFn: async (assinante) => {
      const { id, planos: _, ...rest } = assinante;
      if (id) {
        // Update existing - direct DB update
        const { data, error } = await supabase.from('assinantes').update(rest).eq('id', id).select('*, planos(*)').single();
        if (error) throw error;
        return data;
      } else {
        // New assinante - use edge function to create auth user + assinante
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-assinante-user`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify(rest),
          }
        );
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Erro ao criar assinante');
        return result.assinante;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assinantes'] }),
  });

  const deleteAssinante = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('assinantes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assinantes'] }),
  });

  const suspenderAssinante = useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase
        .from('assinantes')
        .update({ status: 'suspenso' })
        .eq('id', id)
        .select('*, planos(*)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assinantes'] }),
  });

  const reativarAssinante = useMutation({
    mutationFn: async ({ id, assinatura_fim }) => {
      const { data, error } = await supabase
        .from('assinantes')
        .update({ status: 'ativo', assinatura_fim })
        .eq('id', id)
        .select('*, planos(*)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assinantes'] }),
  });

  return {
    assinantes,
    isLoading,
    saveAssinante: (a) => saveAssinante.mutateAsync(a),
    deleteAssinante: (id) => deleteAssinante.mutateAsync(id),
    suspenderAssinante: (id) => suspenderAssinante.mutateAsync(id),
    reativarAssinante: (params) => reativarAssinante.mutateAsync(params),
  };
}
