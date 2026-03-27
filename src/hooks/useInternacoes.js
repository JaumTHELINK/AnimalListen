import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useInternacoes(assinanteId) {
  const queryClient = useQueryClient();

  const { data: internacoes = [], isLoading, error } = useQuery({
    queryKey: ['internacoes', assinanteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internacoes')
        .select('*, internacao_registros(*)')
        .order('data_internacao', { ascending: false });
      if (error) throw error;
      return data.map((i) => ({
        ...i,
        registros: (i.internacao_registros || []).sort(
          (a, b) => new Date(a.hora) - new Date(b.hora)
        ),
      }));
    },
    enabled: !!assinanteId,
  });

  const addInternacaoMutation = useMutation({
    mutationFn: async (internacao) => {
      const { registros, ...rest } = internacao;
      rest.assinante_id = assinanteId;
      const { data, error } = await supabase
        .from('internacoes')
        .insert(rest)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internacoes', assinanteId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase
        .from('internacoes')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internacoes', assinanteId] });
    },
  });

  const updatePacienteMutation = useMutation({
    mutationFn: async ({ id, data: updates }) => {
      const { error } = await supabase
        .from('internacoes')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internacoes', assinanteId] });
    },
  });

  const addRegistroMutation = useMutation({
    mutationFn: async ({ internacao_id, registro }) => {
      const { data, error } = await supabase
        .from('internacao_registros')
        .insert({ internacao_id, ...registro })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internacoes', assinanteId] });
    },
  });

  const updateRegistroMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { error } = await supabase
        .from('internacao_registros')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internacoes', assinanteId] });
    },
  });

  const deleteRegistroMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('internacao_registros')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internacoes', assinanteId] });
    },
  });

  return {
    internacoes,
    isLoading,
    error,
    addInternacao: addInternacaoMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    updatePaciente: updatePacienteMutation.mutateAsync,
    addRegistro: addRegistroMutation.mutateAsync,
    updateRegistro: updateRegistroMutation.mutateAsync,
    deleteRegistro: deleteRegistroMutation.mutateAsync,
  };
}
