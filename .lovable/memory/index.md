# Memory: index.md
Updated: now

AnimalListen Pro - Sistema veterinário multi-tenant com prontuários, internações e transcrição de áudio via IA

## Stack
- React (JSX, não TypeScript nos componentes originais)
- CSS puro (não Tailwind) em index.css com variáveis CSS customizadas
- Backend: Lovable Cloud (Supabase)
- Multi-tenancy via assinante_id em todas as tabelas de dados

## Cores
- Primary: #0855a1 (azul)
- Secondary: #65ab36 (verde)
- Background: #fefff3

## Estrutura
- Componentes em src/components/animalisten/
- Dados em src/data/
- Página principal: src/pages/Index.tsx (porta o App original)

## Multi-tenancy
- Cada assinante = consultório com user auth próprio
- assinante_id em prontuarios, internacoes, tutores (pacientes via tutor)
- RLS: get_current_assinante_id() filtra dados por user logado
- Senha padrão "12345678", forçar troca no primeiro acesso (senha_alterada flag)
- Edge function create-assinante-user cria auth user + assinante

## Admin
- Rota /admin, role 'admin' em user_roles
- Tabelas: planos, assinantes
- Assinantes com controle de expiração manual
