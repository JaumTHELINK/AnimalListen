

# Plano: Conectar ao Supabase para Persistir Dados

## Resumo

Substituir os dados mock (`mockProntuarios`, `mockInternacoes`) por tabelas no Supabase, com leitura e escrita real. O login continuará estético por enquanto (sem autenticação Supabase).

## Tabelas no Supabase

### `prontuarios`
Todos os campos do mock atual: `id` (uuid, PK), `numero_prontuario`, `tutor_nome`, `tutor_cpf`, `tutor_telefone`, `tutor_email`, `tutor_endereco`, `animal_nome`, `animal_especie`, `animal_raca`, `animal_idade`, `animal_sexo`, `animal_peso` (numeric), `animal_microchip`, `queixa_principal`, `historico_doenca`, `sintomas` (text[]), `comportamento` (text[]), `temperatura` (numeric), `frequencia_cardiaca` (int), `frequencia_respiratoria` (int), `mucosas`, `palpacao_abdominal`, `suspeita_diagnostica`, `exames_solicitados` (text[]), `tratamento_prescrito`, `medicamentos` (text[]), `observacoes_gerais`, `recomendacoes`, `data_atendimento` (timestamptz), `created_at`.

### `internacoes`
`id` (uuid, PK), `animal_nome`, `animal_especie`, `animal_raca`, `animal_idade`, `animal_peso` (numeric), `animal_microchip`, `tutor_nome`, `tutor_cpf`, `tutor_telefone`, `foto` (text, base64 ou URL), `motivo`, `data_internacao` (timestamptz), `status` (text: estavel/critico/observacao/alta), `created_at`.

### `internacao_registros`
`id` (uuid, PK), `internacao_id` (uuid, FK → internacoes), `tipo` (text: bpm/temperatura/alimentacao/medicacao/hidratacao/evolucao), `valor`, `hora` (timestamptz), `notas`, `created_at`.

Registros são separados em tabela própria (1:N) em vez de array JSONB, para facilitar queries e inserções.

## RLS

Como não há autenticação real ainda, as tabelas terão RLS habilitado com políticas permissivas temporárias (allow all para `anon`). Quando autenticação for adicionada, as políticas serão restringidas.

## Mudanças no Frontend

### 1. Inicializar Supabase Client
- Criar `src/integrations/supabase/client.ts` com o client configurado (Lovable Cloud faz isso automaticamente).

### 2. Criar hook `useProntuarios`
- `src/hooks/useProntuarios.js` — fetch all, insert, update via Supabase.
- Usar `useQuery` e `useMutation` do React Query.

### 3. Criar hook `useInternacoes`
- `src/hooks/useInternacoes.js` — fetch internações com registros (join), insert internação, add/update/delete registro, update status.

### 4. Atualizar `Index.tsx`
- Remover imports de `mockData`.
- Usar os hooks em vez de `useState` com dados mock.
- Passar funções de mutação para os componentes filhos.

### 5. Atualizar componentes
- `Dashboard.jsx` — recebe dados do hook (sem mudança na interface).
- `Prontuario.jsx` — `onSave` chama mutação do Supabase (upsert).
- `Internacao.jsx` — operações CRUD via hook.
- `InternacaoDetalhes.jsx` — add/update/delete registros via hook.
- `HistoricoPaciente.jsx` — sem mudanças (recebe prontuarios como prop).

### 6. Seed dos dados mock
- Inserir os dados mock existentes como seed inicial via migration para que o app não comece vazio.

## Arquivos Modificados/Criados
- **Migration**: criar tabelas + seed data
- `src/hooks/useProntuarios.js` (novo)
- `src/hooks/useInternacoes.js` (novo)
- `src/pages/Index.tsx` (refatorar para usar hooks)
- `src/components/animalisten/Prontuario.jsx` (ajustar save)
- `src/components/animalisten/Internacao.jsx` (ajustar CRUD)
- `src/components/animalisten/InternacaoDetalhes.jsx` (ajustar registros)

