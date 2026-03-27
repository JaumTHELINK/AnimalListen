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
- Admin em src/components/admin/ e src/pages/Admin.jsx
- Hooks em src/hooks/
- Dados: Supabase (tabelas: prontuarios, internacoes, internacao_registros, tutores, pacientes, planos, assinantes, user_roles)
- Página principal: src/pages/Index.tsx
- Painel admin: /admin
- mockData.js mantido apenas para constantes (statusLabels, generateProntuarioNumber etc.)

## Auth & Roles
- Autenticação via Supabase Auth (email/senha, auto-confirm habilitado)
- Tabela user_roles com enum app_role (admin, veterinario)
- Função has_role() security definer para RLS
- Admin inicial: admin@animalisten.com / Admin@2024
- Edge function setup-admin para criar admin inicial (uso único)

## RLS
- user_roles: somente admins gerenciam
- planos: leitura pública, escrita admin
- assinantes: leitura pública, escrita admin
- Demais tabelas: políticas permissivas temporárias (sem auth real para vets ainda)

## Assinaturas
- Controle manual (sem gateway de pagamento)
- Planos com livre configuração (nome, preço, duração em dias)
- Suspensão automática quando assinatura expira
- Suspensão manual pelo admin
- Quando suspenso: modo somente leitura para o veterinário
