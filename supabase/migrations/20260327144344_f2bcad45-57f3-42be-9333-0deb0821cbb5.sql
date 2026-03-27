
-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'veterinario');

-- Tabela de roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função security definer para checar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS para user_roles: somente admins leem
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de planos
CREATE TABLE public.planos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  preco numeric NOT NULL DEFAULT 0,
  duracao_dias integer NOT NULL DEFAULT 30,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active planos"
  ON public.planos FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage planos"
  ON public.planos FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de assinantes (veterinários)
CREATE TABLE public.assinantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  telefone text,
  crmv text,
  plano_id uuid REFERENCES public.planos(id),
  assinatura_inicio timestamptz,
  assinatura_fim timestamptz,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'expirado')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assinantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage assinantes"
  ON public.assinantes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Leitura pública para checar status (o app precisa verificar)
CREATE POLICY "Public can read assinantes"
  ON public.assinantes FOR SELECT
  USING (true);
