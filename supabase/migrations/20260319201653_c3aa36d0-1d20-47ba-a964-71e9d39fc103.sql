
ALTER TABLE public.prontuarios
  ADD COLUMN animal_porte text,
  ADD COLUMN animal_pelagem text,
  ADD COLUMN animal_alergias text,
  ADD COLUMN animal_doenca_cronica text,
  ADD COLUMN animal_castrado boolean DEFAULT false;
