import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTutores() {
  const queryClient = useQueryClient();

  const { data: tutores = [], isLoading } = useQuery({
    queryKey: ['tutores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutores')
        .select('*, pacientes(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveTutorMutation = useMutation({
    mutationFn: async (tutor) => {
      const { id, pacientes: _, ...tutorData } = tutor;
      if (id) {
        const { data, error } = await supabase
          .from('tutores')
          .update(tutorData)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('tutores')
          .insert(tutorData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tutores'] }),
  });

  const deleteTutorMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('tutores').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tutores'] }),
  });

  const savePacienteMutation = useMutation({
    mutationFn: async (paciente) => {
      const { id, ...pacienteData } = paciente;
      if (id) {
        const { data, error } = await supabase
          .from('pacientes')
          .update(pacienteData)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('pacientes')
          .insert(pacienteData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tutores'] }),
  });

  const deletePacienteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('pacientes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tutores'] }),
  });

  return {
    tutores,
    isLoading,
    saveTutor: (tutor) => saveTutorMutation.mutateAsync(tutor),
    deleteTutor: (id) => deleteTutorMutation.mutateAsync(id),
    savePaciente: (paciente) => savePacienteMutation.mutateAsync(paciente),
    deletePaciente: (id) => deletePacienteMutation.mutateAsync(id),
  };
}
