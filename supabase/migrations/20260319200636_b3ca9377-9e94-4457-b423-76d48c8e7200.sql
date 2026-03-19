
ALTER TABLE public.pacientes
  ADD COLUMN porte text,
  ADD COLUMN pelagem text,
  ADD COLUMN alergias text,
  ADD COLUMN doenca_cronica text,
  ADD COLUMN castrado boolean DEFAULT false;

ALTER TABLE public.tutores
  ADD COLUMN observacoes text;
