import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProntuarios() {
  const queryClient = useQueryClient();

  const { data: prontuarios = [], isLoading, error } = useQuery({
    queryKey: ['prontuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .order('data_atendimento', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (prontuario) => {
      const { id, ...rest } = prontuario;
      // If id looks like a UUID (from DB), update; otherwise insert
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
        // Insert new — remove the id field (let DB generate UUID)
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
      queryClient.invalidateQueries({ queryKey: ['prontuarios'] });
    },
  });

  return {
    prontuarios,
    isLoading,
    error,
    saveProntuario: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
