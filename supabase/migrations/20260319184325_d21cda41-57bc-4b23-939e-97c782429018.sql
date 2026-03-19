
-- Tabela de tutores
CREATE TABLE public.tutores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf text,
  telefone text,
  email text,
  endereco text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tutores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to tutores"
  ON public.tutores FOR ALL TO public
  USING (true) WITH CHECK (true);

-- Tabela de pacientes (animais vinculados a tutores)
CREATE TABLE public.pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES public.tutores(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  especie text,
  raca text,
  idade text,
  sexo text,
  peso numeric,
  microchip text,
  foto text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to pacientes"
  ON public.pacientes FOR ALL TO public
  USING (true) WITH CHECK (true);
