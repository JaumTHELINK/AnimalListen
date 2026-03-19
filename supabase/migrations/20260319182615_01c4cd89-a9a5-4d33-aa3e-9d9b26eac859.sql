
-- ===== TABELA: prontuarios =====
CREATE TABLE public.prontuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_prontuario TEXT NOT NULL,
  tutor_nome TEXT,
  tutor_cpf TEXT,
  tutor_telefone TEXT,
  tutor_email TEXT,
  tutor_endereco TEXT,
  animal_nome TEXT,
  animal_especie TEXT,
  animal_raca TEXT,
  animal_idade TEXT,
  animal_sexo TEXT,
  animal_peso NUMERIC,
  animal_microchip TEXT,
  queixa_principal TEXT,
  historico_doenca TEXT,
  sintomas TEXT[] DEFAULT '{}',
  comportamento TEXT[] DEFAULT '{}',
  temperatura NUMERIC,
  frequencia_cardiaca INTEGER,
  frequencia_respiratoria INTEGER,
  mucosas TEXT,
  palpacao_abdominal TEXT,
  suspeita_diagnostica TEXT,
  exames_solicitados TEXT[] DEFAULT '{}',
  tratamento_prescrito TEXT,
  medicamentos TEXT[] DEFAULT '{}',
  observacoes_gerais TEXT,
  recomendacoes TEXT,
  data_atendimento TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to prontuarios" ON public.prontuarios FOR ALL USING (true) WITH CHECK (true);

-- ===== TABELA: internacoes =====
CREATE TABLE public.internacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_nome TEXT,
  animal_especie TEXT,
  animal_raca TEXT,
  animal_idade TEXT,
  animal_peso NUMERIC,
  animal_microchip TEXT,
  tutor_nome TEXT,
  tutor_cpf TEXT,
  tutor_telefone TEXT,
  foto TEXT,
  motivo TEXT,
  data_internacao TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'observacao',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.internacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to internacoes" ON public.internacoes FOR ALL USING (true) WITH CHECK (true);

-- ===== TABELA: internacao_registros =====
CREATE TABLE public.internacao_registros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  internacao_id UUID NOT NULL REFERENCES public.internacoes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  valor TEXT,
  hora TIMESTAMPTZ,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.internacao_registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to internacao_registros" ON public.internacao_registros FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_internacao_registros_internacao_id ON public.internacao_registros(internacao_id);

-- ===== SEED DATA: prontuarios =====
INSERT INTO public.prontuarios (numero_prontuario, tutor_nome, tutor_cpf, tutor_telefone, tutor_email, tutor_endereco, animal_nome, animal_especie, animal_raca, animal_idade, animal_sexo, animal_peso, animal_microchip, queixa_principal, historico_doenca, sintomas, comportamento, temperatura, frequencia_cardiaca, frequencia_respiratoria, mucosas, palpacao_abdominal, suspeita_diagnostica, exames_solicitados, tratamento_prescrito, medicamentos, observacoes_gerais, recomendacoes, data_atendimento) VALUES
('384720', 'João Silva', '123.456.789-00', '(11) 99999-1234', 'joao@email.com', 'Rua das Flores, 123 - São Paulo/SP', 'Rex', 'Cão', 'Golden Retriever', '5 anos', 'Macho', 32.5, '981000000012345', 'Vômito e diarreia há 2 dias', 'Animal começou a apresentar vômito após ingestão de alimento estragado. Diarreia aquosa sem sangue.', ARRAY['Vômito','Diarreia','Apatia','Inapetência'], ARRAY['Apático','Sem apetite'], 39.2, 120, 28, 'Rosadas', 'Sensibilidade à palpação em região epigástrica', 'Gastroenterite aguda', ARRAY['Hemograma','Bioquímico'], 'Metoclopramida 1ml a cada 8h, Dipirona 1ml SOS', ARRAY['Metoclopramida 1ml 8/8h','Dipirona 1ml SOS'], 'Animal hidratado, mucosas rosadas. Sem sinais de dor intensa.', 'Jejum de 12h, oferecer água aos poucos. Retorno em 3 dias.', '2026-03-17T10:00:00Z'),
('519836', 'Maria Santos', '987.654.321-00', '(11) 98888-5678', 'maria@email.com', 'Av. Paulista, 456 - São Paulo/SP', 'Mimi', 'Gato', 'Siamês', '3 anos', 'Fêmea Castrada', 4.2, '', 'Espirros frequentes e secreção nasal', 'Quadro de espirros há 5 dias. Secreção nasal serosa.', ARRAY['Espirros','Secreção nasal','Lacrimejamento'], ARRAY['Ativo','Comendo normalmente'], 38.8, 180, 30, 'Rosadas', 'Sem alterações', 'Rinotraqueíte viral felina', ARRAY['PCR para herpesvírus'], 'L-lisina 500mg/dia, limpeza nasal com soro fisiológico', ARRAY['L-lisina 500mg/dia','Soro fisiológico nasal 3x/dia'], 'Animal em bom estado geral. Alimentação normal.', 'Isolar de outros gatos. Retorno em 7 dias.', '2026-03-16T14:30:00Z'),
('672914', 'Carlos Oliveira', '456.789.123-00', '(11) 97777-9012', 'carlos@email.com', 'Rua Augusta, 789 - São Paulo/SP', 'Thor', 'Cão', 'Bulldog Francês', '2 anos', 'Macho Castrado', 12.8, '981000000067890', 'Coceira intensa e vermelhidão na pele', 'Prurido generalizado há 10 dias. Piora progressiva.', ARRAY['Prurido','Eritema','Alopecia focal'], ARRAY['Inquieto','Se coçando frequentemente'], 38.5, 110, 24, 'Rosadas', 'Sem alterações', 'Dermatite atópica', ARRAY['Raspado cutâneo','Citologia de pele'], 'Apoquel 5.4mg 1x/dia, banho com shampoo antisséptico 2x/semana', ARRAY['Apoquel 5.4mg 1x/dia','Shampoo Clorexidina 2x/semana'], 'Lesões predominantes em região axilar e interdigital.', 'Evitar gramado. Usar roupa hipoalergênica. Retorno em 15 dias.', '2026-03-15T09:00:00Z'),
('201458', 'João Silva', '123.456.789-00', '(11) 99999-1234', 'joao@email.com', 'Rua das Flores, 123 - São Paulo/SP', 'Rex', 'Cão', 'Golden Retriever', '5 anos', 'Macho', 32.5, '981000000012345', 'Vacinação anual de rotina', 'Sem queixas. Animal saudável para vacinação.', ARRAY[]::TEXT[], ARRAY['Ativo','Normal'], 38.5, 100, 22, 'Rosadas', 'Sem alterações', 'Animal saudável — vacinação preventiva', ARRAY[]::TEXT[], 'V10 aplicada. Próxima dose em 1 ano.', ARRAY['V10 (Vacina polivalente)'], 'Animal em excelente estado geral.', 'Retorno anual para reforço vacinal.', '2026-02-10T09:00:00Z');

-- ===== SEED DATA: internacoes =====
INSERT INTO public.internacoes (id, animal_nome, animal_especie, animal_raca, animal_idade, animal_peso, animal_microchip, tutor_nome, tutor_cpf, tutor_telefone, foto, motivo, data_internacao, status) VALUES
('a1000000-0000-0000-0000-000000000001', 'Buddy', 'Cão', 'Labrador', '7 anos', 30, '981000000099999', 'Ana Paula Costa', '111.222.333-44', '(11) 96666-1234', NULL, 'Cirurgia ortopédica - fratura de fêmur', '2026-03-15T08:00:00Z', 'estavel'),
('a1000000-0000-0000-0000-000000000002', 'Luna', 'Gato', 'Persa', '4 anos', 3.8, '', 'Roberto Mendes', '555.666.777-88', '(11) 95555-6789', NULL, 'Insuficiência renal aguda', '2026-03-16T14:00:00Z', 'critico'),
('a1000000-0000-0000-0000-000000000003', 'Pipoca', 'Cão', 'SRD', '10 anos', 8.5, '981000000054321', 'Fernanda Lima', '999.888.777-66', '(11) 94444-3456', NULL, 'Pós-operatório - retirada de tumor mamário', '2026-03-17T07:00:00Z', 'observacao');

-- ===== SEED DATA: internacao_registros =====
INSERT INTO public.internacao_registros (internacao_id, tipo, valor, hora, notas) VALUES
('a1000000-0000-0000-0000-000000000001', 'bpm', '90', '2026-03-17T08:00:00Z', 'FC estável'),
('a1000000-0000-0000-0000-000000000001', 'temperatura', '38.5', '2026-03-17T08:00:00Z', 'Temperatura normal'),
('a1000000-0000-0000-0000-000000000001', 'alimentacao', 'Sim', '2026-03-17T07:30:00Z', 'Ração pastosa 200g - comeu tudo'),
('a1000000-0000-0000-0000-000000000001', 'medicacao', 'Meloxicam 0.5mg', '2026-03-17T08:00:00Z', 'Analgésico administrado'),
('a1000000-0000-0000-0000-000000000001', 'hidratacao', 'Ringer Lactato 500ml', '2026-03-17T06:00:00Z', 'Fluidoterapia IV'),
('a1000000-0000-0000-0000-000000000001', 'evolucao', 'Estável', '2026-03-17T09:00:00Z', 'Animal alerta, sem dor aparente. Curativo limpo.'),
('a1000000-0000-0000-0000-000000000001', 'bpm', '88', '2026-03-17T12:00:00Z', 'FC estável pós-almoço'),
('a1000000-0000-0000-0000-000000000001', 'alimentacao', 'Sim', '2026-03-17T12:00:00Z', 'Ração pastosa 200g - comeu 80%'),
('a1000000-0000-0000-0000-000000000001', 'temperatura', '38.6', '2026-03-17T12:00:00Z', ''),
('a1000000-0000-0000-0000-000000000002', 'bpm', '200', '2026-03-17T06:00:00Z', 'Taquicardia'),
('a1000000-0000-0000-0000-000000000002', 'temperatura', '37.2', '2026-03-17T06:00:00Z', 'Hipotermia leve'),
('a1000000-0000-0000-0000-000000000002', 'alimentacao', 'Não', '2026-03-17T07:00:00Z', 'Recusou alimentação'),
('a1000000-0000-0000-0000-000000000002', 'medicacao', 'Ondansetrona 0.5mg', '2026-03-17T06:30:00Z', 'Anti-emético IV'),
('a1000000-0000-0000-0000-000000000002', 'hidratacao', 'NaCl 0.9% 200ml', '2026-03-17T06:00:00Z', 'Fluidoterapia IV contínua'),
('a1000000-0000-0000-0000-000000000002', 'evolucao', 'Crítico', '2026-03-17T08:00:00Z', 'Animal prostrado, desidratação moderada. Ureia e creatinina elevadas.'),
('a1000000-0000-0000-0000-000000000002', 'bpm', '190', '2026-03-17T12:00:00Z', 'Leve melhora'),
('a1000000-0000-0000-0000-000000000002', 'temperatura', '37.8', '2026-03-17T12:00:00Z', 'Temperatura subindo'),
('a1000000-0000-0000-0000-000000000003', 'bpm', '100', '2026-03-17T10:00:00Z', 'Acordando da anestesia'),
('a1000000-0000-0000-0000-000000000003', 'temperatura', '37.8', '2026-03-17T10:00:00Z', 'Hipotermia pós-anestésica leve'),
('a1000000-0000-0000-0000-000000000003', 'alimentacao', 'Não', '2026-03-17T12:00:00Z', 'Jejum pós-cirúrgico'),
('a1000000-0000-0000-0000-000000000003', 'medicacao', 'Tramadol 2mg/kg', '2026-03-17T10:30:00Z', 'Analgesia pós-operatória'),
('a1000000-0000-0000-0000-000000000003', 'evolucao', 'Em observação', '2026-03-17T11:00:00Z', 'Recuperando anestesia. Reflexos presentes. Curativo seco e limpo.');
