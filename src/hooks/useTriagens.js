import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTriagens(assinanteId) {
  const queryClient = useQueryClient();

  const { data: triagens = [], isLoading } = useQuery({
    queryKey: ['triagens', assinanteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('triagens')
        .select('*, pacientes(*, tutores(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!assinanteId,
  });

  const addTriagem = useMutation({
    mutationFn: async (triagem) => {
      const { data, error } = await supabase
        .from('triagens')
        .insert({ ...triagem, assinante_id: assinanteId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['triagens', assinanteId] }),
  });

  const markAtendida = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('triagens')
        .update({ atendida: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['triagens', assinanteId] }),
  });

  return {
    triagens,
    isLoading,
    addTriagem: addTriagem.mutateAsync,
    markAtendida: markAtendida.mutateAsync,
  };
}
