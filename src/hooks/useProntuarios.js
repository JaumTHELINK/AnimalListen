import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProntuarios(assinanteId) {
  const queryClient = useQueryClient();

  const { data: prontuarios = [], isLoading, error } = useQuery({
    queryKey: ['prontuarios', assinanteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .order('data_atendimento', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!assinanteId,
  });

  const saveMutation = useMutation({
    mutationFn: async (prontuario) => {
      const { id, ...rest } = prontuario;
      // Always include assinante_id
      rest.assinante_id = assinanteId;
      if (id && typeof id === 'string' && id.includes('-')) {
        const { data, error } = await supabase
          .from('prontuarios')
          .update(rest)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('prontuarios')
          .insert(rest)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prontuarios', assinanteId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('prontuarios')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prontuarios', assinanteId] });
    },
  });

  return {
    prontuarios,
    isLoading,
    error,
    saveProntuario: saveMutation.mutateAsync,
    deleteProntuario: deleteMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
