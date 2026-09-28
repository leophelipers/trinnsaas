# Trinn SaaS Starter

Template moderno e completo para desenvolvimento de aplicações SaaS fullstack, combinando:

- **Next.js 16** (App Router, Turbopack e convenção `proxy.ts`)
- **Tailwind CSS v4** (Nova engine CSS-first)
- **shadcn/ui** (Componentes acessíveis com `@base-ui/react`)
- **Convex** (Backend reativo com banco de dados em tempo real)
- **Clerk** (Autenticação moderna com Clerk Core 3 e suporte a `@clerk/nextjs`)

---

## 🚀 Começando

### 1. Clonar e instalar dependências

Se ainda não instalou as dependências:

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha as variáveis com as chaves dos dashboards do **Clerk** e **Convex**:

```env
# Clerk Authentication Keys (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Redirects
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Convex Deployment URL (gerado ao rodar `npx convex dev`)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud

# Clerk JWT Issuer Domain (para autenticação Convex + Clerk)
CLERK_JWT_ISSUER_DOMAIN=https://your-issuer.clerk.accounts.dev
```

### 3. Conectar ao Convex

Inicie o Convex para conectar ao seu projeto na nuvem e gerar as tipagens automáticas:

```bash
npx convex dev
```

> Na primeira execução, o Convex abrirá o navegador para login ou criação do projeto.

### 4. Integrar Clerk com Convex

1. No dashboard do **Clerk**, acesse a [configuração da integração com Convex](https://dashboard.clerk.com/apps/setup/convex) ou **JWT Templates** -> **Convex**.
2. Ative a integração e copie a **Frontend API URL** (formato: `https://verb-noun-00.clerk.accounts.dev`).
3. Defina a variável no ambiente do Convex:
   ```bash
   npx convex env set CLERK_FRONTEND_API_URL https://sua-url-do-clerk.clerk.accounts.dev
   ```
4. Salve também no `.env.local` na variável `CLERK_FRONTEND_API_URL` ou `CLERK_JWT_ISSUER_DOMAIN`.
5. O arquivo `convex/auth.config.ts` já está preparado com `AuthConfig` para consumir essa configuração e sincronizar com o Convex.


### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📁 Estrutura do Projeto

```text
├── convex/
│   ├── _generated/         # Tipos e utilitários gerados pelo Convex
│   ├── auth.config.ts      # Integração do Convex com o JWT do Clerk
│   ├── schema.ts           # Definição do schema do banco de dados Convex
│   └── tasks.ts            # Exemplo de queries e mutations
├── src/
│   ├── app/
│   │   ├── sign-in/        # Rota de login Clerk (/sign-in)
│   │   ├── sign-up/        # Rota de cadastro Clerk (/sign-up)
│   │   ├── globals.css     # Estilos globais e tema Tailwind v4
│   │   ├── layout.tsx      # Root layout com ConvexClientProvider
│   │   └── page.tsx        # Página inicial com dashboard e status
│   ├── components/
│   │   ├── providers/      # ConvexClientProvider com Clerk
│   │   └── ui/             # Componentes shadcn/ui (Button, Card, Badge, etc.)
│   ├── lib/
│   │   └── utils.ts        # Utilitário cn (tailwind-merge / clsx)
│   └── proxy.ts            # Middleware de proteção de rotas (Next.js 16 Proxy)
├── .env.example            # Modelo das variáveis de ambiente
└── package.json
```

---

## 🧩 Adicionar novos componentes do shadcn/ui

Para adicionar novos componentes:

```bash
npx shadcn add dialog
npx shadcn add dropdown-menu
npx shadcn add input
```

---

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento com Next.js e Turbopack.
- `npm run build` - Cria o build otimizado de produção.
- `npm run start` - Inicia o servidor em modo de produção.
- `npm run lint` - Executa a verificação estática do ESLint.
- `npx convex dev` - Executa o watcher do Convex e sincroniza funções em tempo real.
