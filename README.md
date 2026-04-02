# Core Finanças — Front-end

Aplicação web para gerenciamento de finanças pessoais. Permite controlar contas bancárias, categorias de transações e registrar receitas e despesas com indicação de status (pago/pendente).

## Tecnologias

| Ferramenta | Versão |
|---|---|
| Vue 3 (Composition API) | ^3.5 |
| TypeScript | ~5.9 |
| Vite | ^8 |
| Vue Router | ^4.6 |
| Axios | ^1.13 |
| Vitest + @vue/test-utils | ^3 / ^2 |
| ESLint + Prettier | ^9 / ^3 |

## Pré-requisitos

- Node.js 20+
- API back-end rodando (ver configuração de ambiente abaixo)

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/adriellealves/front-gerenciador-fin.git
cd front-gerenciador-fin

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com a URL da sua API

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
VITE_API_URL=http://localhost:8080/api
```

> ⚠️ O arquivo `.env` está no `.gitignore` e nunca deve ser commitado.

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento (Vite HMR) |
| `npm run build` | Compila TypeScript e gera o bundle de produção (`dist/`) |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa o ESLint em `src/` |
| `npm run format` | Formata o código com Prettier |
| `npm run test` | Executa os testes com Vitest |
| `npm run test:coverage` | Executa os testes e gera relatório de cobertura |

## Estrutura do Projeto

```
src/
├── types/             # Interfaces TypeScript (Account, Category, Transaction, User)
├── services/
│   └── api.ts         # Instância Axios com interceptors de autenticação
├── router/
│   └── index.ts       # Rotas da aplicação com guardas de autenticação
├── composables/
│   ├── useAuth.ts         # Login, logout, leitura de sessão
│   ├── useTransactions.ts # Busca, cálculo de totais e formatação de transações
│   ├── useAccounts.ts     # CRUD de contas bancárias
│   ├── useCategories.ts   # CRUD e árvore hierárquica de categorias
│   ├── useToast.ts        # Sistema de notificações toast global
│   └── useFormValidation.ts # Validação reutilizável de formulários
├── components/
│   ├── TransactionModal.vue  # Modal unificado para receitas e despesas
│   └── ToastNotification.vue # Componente de notificações
├── views/
│   ├── DashboardView.vue
│   ├── LoginView.vue
│   ├── RegisterView.vue
│   ├── AccountsView.vue
│   └── CategoriesView.vue
└── __tests__/         # Testes unitários e de componente (Vitest)
```

## Fluxo de Autenticação

1. O usuário faz login em `/login` — o back-end retorna um JWT, `userId` e `name`.
2. O token é armazenado no `localStorage` (`@CoreFinancas:token`).
3. O interceptor de requisição do Axios injeta automaticamente o token no header `Authorization: Bearer <token>`.
4. O interceptor de resposta redireciona para `/login` em caso de 401 ou 403.
5. O guard `router.beforeEach` protege as rotas autenticadas e redireciona visitantes para o login.

## Integração com a API

A API base é configurada via `VITE_API_URL`. Os principais endpoints utilizados são:

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/auth/login` | Autenticação |
| POST | `/users` | Registro de novo usuário |
| GET | `/accounts/user/:id` | Listar contas do usuário |
| POST | `/accounts` | Criar conta |
| PUT | `/accounts/:id` | Atualizar conta |
| PATCH | `/accounts/:id/inactivate` | Inativar conta |
| GET | `/categories/user/:id` | Listar categorias |
| POST | `/categories` | Criar categoria |
| PUT | `/categories/:id` | Atualizar categoria |
| DELETE | `/categories/:id` | Excluir categoria |
| GET | `/transactions/user/:id` | Listar transações |
| POST | `/transactions` | Criar transação |

