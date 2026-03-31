
-- Triagens table
CREATE TABLE public.triagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  queixa_principal text NOT NULL,
  prioridade text NOT NULL DEFAULT 'leve',
  aviso_profissional text,
  atendida boolean NOT NULL DEFAULT false,
  assinante_id uuid REFERENCES public.assinantes(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.triagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all triagens" ON public.triagens FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Assinantes manage own triagens" ON public.triagens FOR ALL TO authenticated
  USING (assinante_id = get_current_assinante_id()) WITH CHECK (assinante_id = get_current_assinante_id());

-- Paciente pesos (weight tracking)
CREATE TABLE public.paciente_pesos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  data date NOT NULL,
  peso numeric NOT NULL,
  condicao_corporal text,
  assinante_id uuid REFERENCES public.assinantes(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.paciente_pesos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all paciente_pesos" ON public.paciente_pesos FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Assinantes manage own paciente_pesos" ON public.paciente_pesos FOR ALL TO authenticated
  USING (assinante_id = get_current_assinante_id()) WITH CHECK (assinante_id = get_current_assinante_id());

-- Vacinas table
CREATE TABLE public.vacinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  nome_vacina text NOT NULL,
  data_aplicacao date NOT NULL,
  proxima_dose date,
  lote text,
  responsavel_aplicacao text,
  assinante_id uuid REFERENCES public.assinantes(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vacinas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all vacinas" ON public.vacinas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Assinantes manage own vacinas" ON public.vacinas FOR ALL TO authenticated
  USING (assinante_id = get_current_assinante_id()) WITH CHECK (assinante_id = get_current_assinante_id());

-- Add new columns to prontuarios
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS paciente_id uuid REFERENCES public.pacientes(id);
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS evolucao_clinica text;
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS diagnostico_definitivo text;
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS procedimentos_realizados text;
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS atualizacao_vacinal text;
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS tempo_preenchimento_capilar text;
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS glicose numeric;
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS hidratacao text;
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS linfonodos text;
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS outros_achados text;
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS veterinario_crmv text;
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS termo_consentimento_assinado boolean DEFAULT false;
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS triagem_id uuid REFERENCES public.triagens(id);

-- Add data_nascimento and more fields to pacientes
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS data_nascimento date;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS condicao_corporal text;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS cor text;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS temperamento text;

-- Add observacoes to internacoes
ALTER TABLE public.internacoes ADD COLUMN IF NOT EXISTS observacoes text;
