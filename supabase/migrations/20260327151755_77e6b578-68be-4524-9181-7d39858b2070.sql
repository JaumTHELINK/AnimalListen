
-- Add user_id and senha_alterada to assinantes
ALTER TABLE public.assinantes ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.assinantes ADD COLUMN IF NOT EXISTS senha_alterada boolean NOT NULL DEFAULT false;

-- Add assinante_id to all data tables
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS assinante_id uuid REFERENCES public.assinantes(id) ON DELETE CASCADE;
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS assinante_id uuid REFERENCES public.assinantes(id) ON DELETE CASCADE;
ALTER TABLE public.tutores ADD COLUMN IF NOT EXISTS assinante_id uuid REFERENCES public.assinantes(id) ON DELETE CASCADE;

-- Function to get assinante_id from current auth user
CREATE OR REPLACE FUNCTION public.get_current_assinante_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.assinantes WHERE user_id = auth.uid() LIMIT 1
$$;

-- Update RLS policies for prontuarios
DROP POLICY IF EXISTS "Allow all access to prontuarios" ON public.prontuarios;
CREATE POLICY "Assinantes manage own prontuarios" ON public.prontuarios
  FOR ALL TO authenticated
  USING (assinante_id = get_current_assinante_id())
  WITH CHECK (assinante_id = get_current_assinante_id());

-- Update RLS policies for internacoes
DROP POLICY IF EXISTS "Allow all access to internacoes" ON public.internacoes;
CREATE POLICY "Assinantes manage own internacoes" ON public.internacoes
  FOR ALL TO authenticated
  USING (assinante_id = get_current_assinante_id())
  WITH CHECK (assinante_id = get_current_assinante_id());

-- Update RLS policies for tutores
DROP POLICY IF EXISTS "Allow all access to tutores" ON public.tutores;
CREATE POLICY "Assinantes manage own tutores" ON public.tutores
  FOR ALL TO authenticated
  USING (assinante_id = get_current_assinante_id())
  WITH CHECK (assinante_id = get_current_assinante_id());

-- Update RLS policies for pacientes (via tutor's assinante_id)
DROP POLICY IF EXISTS "Allow all access to pacientes" ON public.pacientes;
CREATE POLICY "Assinantes manage own pacientes" ON public.pacientes
  FOR ALL TO authenticated
  USING (tutor_id IN (SELECT id FROM public.tutores WHERE assinante_id = get_current_assinante_id()))
  WITH CHECK (tutor_id IN (SELECT id FROM public.tutores WHERE assinante_id = get_current_assinante_id()));

-- Update RLS policies for internacao_registros (via internacao's assinante_id)
DROP POLICY IF EXISTS "Allow all access to internacao_registros" ON public.internacao_registros;
CREATE POLICY "Assinantes manage own internacao_registros" ON public.internacao_registros
  FOR ALL TO authenticated
  USING (internacao_id IN (SELECT id FROM public.internacoes WHERE assinante_id = get_current_assinante_id()))
  WITH CHECK (internacao_id IN (SELECT id FROM public.internacoes WHERE assinante_id = get_current_assinante_id()));

-- Admin policies for all data tables (admins can see everything)
CREATE POLICY "Admins manage all prontuarios" ON public.prontuarios
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage all internacoes" ON public.internacoes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage all tutores" ON public.tutores
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage all pacientes" ON public.pacientes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage all internacao_registros" ON public.internacao_registros
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
