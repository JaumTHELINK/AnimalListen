AnimalListen Pro - Sistema veterinário com prontuários, internações e transcrição de áudio via IA

## Stack
- React (JSX, não TypeScript nos componentes originais)
- CSS puro (não Tailwind) em index.css com variáveis CSS customizadas
- Backend de IA: Python/FastAPI com Whisper + Llama (roda localmente na máquina do usuário)
- Dados persistidos no Supabase (Lovable Cloud)
- Hooks: useProntuarios.js, useInternacoes.js (React Query + Supabase)

## Cores
- Primary: #0855a1 (azul)
- Secondary: #65ab36 (verde)
- Background: #fefff3

## Estrutura
- Componentes em src/components/animalisten/
- Hooks em src/hooks/
- Dados: Supabase (tabelas: prontuarios, internacoes, internacao_registros)
- Página principal: src/pages/Index.tsx
- mockData.js mantido apenas para constantes (statusLabels, generateProntuarioNumber etc.)

## RLS
- Políticas permissivas temporárias (sem autenticação real ainda)
- Quando auth for adicionada, restringir RLS
