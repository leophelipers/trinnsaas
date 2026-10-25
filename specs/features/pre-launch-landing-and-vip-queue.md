# SPEC: Landing Page de Pré-Lançamento, Tag `pre_lancamento` & Sala VIP com Fura-Fila
> **Status:** HOMOLOGADO  
> **Data de Criação:** 2026-10-23  
> **Última Atualização:** 2026-10-23  
> **Autor / Agente Responsável:** Antigravity AI  
> **Feature Flags Associadas:** `pre_launch_mode`, `pre_launch_skip_queue_payment`, `meta_pixel_tracking`

---

## 1. Objetivo & Justificativa de Negócio
- **Preservação da Home Completa em `/futhome2026`:** Todo o conteúdo completo de lançamento da Home original foi movido integralmente para a rota `/futhome2026`.
- **Captura de Pré-Lançamento na Home (`/`):** A rota raiz passa a operar como uma Landing Page de alta conversão de Pré-Lançamento, permitindo o cadastro gratuito do usuário e atribuindo automaticamente a tag `pre_lancamento` no Convex.
- **Isolamento Estrito de Acesso (`/pre-lancamento`):** Todos os usuários autenticados que possuem a tag `pre_lancamento` (exceto administradores) ficam restritos exclusivamente à visualização da Sala VIP de Pré-Lançamento (`/pre-lancamento`), sendo redirecionados automaticamente por `PreLaunchGuard` caso tentem acessar qualquer outra rota (`/dashboard`, `/chat`, `/onboarding`, `/futhome2026`, etc.).
- **Monetização Antecipada & Comunidade (WhatsApp + Fura-Fila R$ 5 / R$ 10):** Na Sala VIP (`/pre-lancamento`), o usuário tem acesso ao Grupo Oficial de WhatsApp, confirmação de seu número de WhatsApp e opção de pagamento real de Fura-Fila de **R$ 5,00** (25 créditos vitalícios inclusos) ou **R$ 10,00** (55 créditos vitalícios inclusos) via PIX ou Cartão de Crédito.

---

## 2. Requisitos Funcionais
1. [x] Mover todo o conteúdo anterior de `src/app/page.tsx` para `src/app/futhome2026/page.tsx`.
2. [x] Implementar nova Landing Page de Pré-Lançamento em `src/app/page.tsx` onde todas as CTAs abrem o cadastro do Clerk (`SignUpButton`) e redirecionam diretamente para `/pre-lancamento`.
3. [x] Atribuir automaticamente `tags: ["pre_lancamento"]` e `isPreLaunch: true` em novos registros de usuários enquanto a flag `pre_launch_mode` estiver ativa.
4. [x] Garantir via `PreLaunchGuard` global (no `ConvexClientProvider` e `OnboardingGuard`) que usuários logados com a tag `pre_lancamento` só possam ver a página `/pre-lancamento`.
5. [x] Estruturar `/pre-lancamento` em **3 Passos claros**:
   - **Passo 1 — Confirmar o E-mail com Código de 6 Dígitos:** Envia um código de 6 dígitos para o e-mail do usuário (`requestPreLaunchEmailCode`), que o preenche de volta na plataforma (`verifyPreLaunchEmailCode`), disparando o E-mail de Boas-Vindas (`convex/emails.ts`).
   - **Passo 2 — Entrar no Grupo do WhatsApp:** Link inicial padrão `https://chat.whatsapp.com/Hl24R2NuhRh7Iq4qU9ce4Y?s=cl&p=i&mlu=4&ilr=4&iam=0`.
   - **Passo 3 — Comprar um Lugar na Fila (R$ 5,00 Apenas no Cartão + Cofre 1-Click):** Pagamento exclusivo via cartão de crédito (bloqueado em PIX tanto em `/api/mercadopago/create-pix` quanto em `convex/credits.ts` `createPendingOrder`), pois o mesmo cartão é salvo no cofre do Mercado Pago (`Customer` + `CustomerCard` + `CardToken` não consumido) para ativar a assinatura de R$ 50/mês em **1 clique** (`/api/mercadopago/one-click-subscribe`). Deixa explícito que o plano cheio será de **R$ 500/mês**, que os R$ 5,00 compram apenas um lugar prioritário na fila para o primeiro mês de R$ 50,00, **não sendo convertido em créditos** (`creditsTotal: 0`) e **não concedendo acesso imediato**. Exibir exclusivamente os modelos proprietários **Kriativa Vision, Kriativa Motion, Kriativa Voice e Kriativa Mind** (sem citar modelos originais).
6. [x] Enviar aviso automático para `leo.phe.rod@gmail.com` sempre que um novo usuário se cadastrar, confirmar o e-mail ou comprar um lugar na fila (`convex/emails.ts`).
7. [x] Permitir no painel administrativo (`/dashboard/admin`) visualizar as badges `PRÉ-LANÇAMENTO` e `FURA-FILA` e liberar/restringir usuários com 1 clique (`toggleUserPreLaunchTag`).
8. [x] Configurar o Meta Pixel (`1126197216455519`) e a API de Conversões da Meta (CAPI v21.0) hardcoded com deduplicação por `event_id` para:
   - `PageView`: Disparado em todas as rotas.
   - `Lead`: Disparado exclusivamente após a conclusão do cadastro de pré-lançamento, na primeira entrada autenticada do usuário em `/pre-lancamento` (`eventId: lead_signup_${status.userId}`).
   - `AddPaymentInfo`: Disparado quando o usuário compra o Lugar na Fila de R$ 5,00 (no cliente e nos endpoints de confirmação PIX/Cartão/Webhook).

---

## 3. Modelo de Dados (Convex Schema)
Campos adicionados à tabela `users` e nova tabela `preLaunchSettings` em [`convex/schema.ts`](file:///C:/dev/trinnsaas/convex/schema.ts):

```typescript
// Em users:
tags: v.optional(v.array(v.string())), // ex: ["pre_lancamento", "fura_fila_vip"]
isPreLaunch: v.optional(v.boolean()),
skipQueuePaid: v.optional(v.boolean()),
skipQueueAmountBrl: v.optional(v.number()),
skipQueuePaidAt: v.optional(v.number()),
subscriptionCardLast4: v.optional(v.string()),
subscriptionCardBrand: v.optional(v.string()),
subscriptionCardholderName: v.optional(v.string()),
subscriptionCardCpf: v.optional(v.string()),
mpCustomerId: v.optional(v.string()),
mpCardId: v.optional(v.string()),
mpCardTokenId: v.optional(v.string()),
mpPreApprovalId: v.optional(v.string()),

// Nova tabela preLaunchSettings:
preLaunchSettings: defineTable({
  key: v.string(), // "global_prelaunch_config"
  whatsappGroupUrl: v.string(),
  whatsappGroupTitle: v.string(),
  whatsappGroupDescription: v.string(),
  skipQueue5Title: v.string(),
  skipQueue5Subtitle: v.string(),
  skipQueue5CreditsBase: v.number(),
  skipQueue5CreditsBonus: v.number(),
  skipQueue10Title: v.string(),
  skipQueue10Subtitle: v.string(),
  skipQueue10CreditsBase: v.number(),
  skipQueue10CreditsBonus: v.number(),
  extraInfoBlocks: v.array(
    v.object({
      id: v.string(),
      badge: v.string(),
      title: v.string(),
      description: v.string(),
    })
  ),
  updatedAt: v.number(),
  updatedBy: v.optional(v.string()),
}).index("by_key", ["key"]),
```

---

## 4. Segurança, Antifraude & Feature Flag
- **Feature Flags Obrigatórias:** `pre_launch_mode` e `pre_launch_skip_queue_payment`.
- **Validação no Servidor:** Inclusão de `await assertFeatureFlag(ctx, "pre_launch_mode")` em `savePreLaunchProfile` e verificação de `isFeatureFlagActive(ctx, "pre_launch_mode")` em `syncUser` e `upsertFromClerk`.
- **Nível de Acesso (RBAC):**
  - Usuários com tag `pre_lancamento` ficam isolados em `/pre-lancamento`.
  - Administradores (`role === "admin"`) mantêm acesso livre a todas as rotas e contam com barra de configuração rápida em `/pre-lancamento`.
- **Auditoria:** Cadastros de pré-lançamento, atualizações de perfil, pagamentos de Fura-Fila e alterações de tags são gravados em `systemLogs`.

### 4.1 Cofre 1-Click Mercado Pago & Assinatura com 1º Mês Promocional (R$ 50 ➔ R$ 500/mês)
1. **Exclusividade de Cartão de Crédito para os R$ 5,00 (`fura_fila_5`):**
   - Bloqueado para PIX em [`/api/mercadopago/create-pix`](file:///C:/dev/trinnsaas/src/app/api/mercadopago/create-pix/route.ts#L42-L49) (HTTP `400`) e em [`convex/credits.ts`](file:///C:/dev/trinnsaas/convex/credits.ts#L280-L285) (`createPendingOrder` exige `paymentMethod === "credit_card"`).
   - Em [`/api/mercadopago/create-card`](file:///C:/dev/trinnsaas/src/app/api/mercadopago/create-card/route.ts#L77-L78), `effectiveInstallments` é fixado em `1`.
2. **Armazenamento no Cofre do Mercado Pago (`Customer` + `CustomerCard` + `CardToken`):**
   - Como o token de cartão do Mercado Pago (`/v1/card_tokens`) é de uso único e consumido na cobrança de R$ 5,00 (`mpPayment.create`), assim que o pagamento é aprovado (`status === "approved"`):
     1. O servidor localiza ou cria o cliente no Mercado Pago via `mpCustomer.search` / `mpCustomer.create` (`mpCustomerId`);
     2. Gera um novo token e vincula o cartão permanentemente à carteira do cliente via `mpCustomerCard.create` (`mpCardId`);
     3. Gera e armazena um token 1-Click não consumido (`mpCardTokenId`);
     4. Persiste `mpCustomerId`, `mpCardId`, `mpCardTokenId`, `subscriptionCardholderName`, `subscriptionCardCpf`, `subscriptionCardLast4` e `subscriptionCardBrand` nas tabelas `users`, `creditBalances` e `creditOrders` do Convex e em `privateMetadata`/`publicMetadata` do Clerk.
3. **Assinatura 1-Click com 1º Mês Diferente dos Meses Seguintes ([`/api/mercadopago/one-click-subscribe`](file:///C:/dev/trinnsaas/src/app/api/mercadopago/one-click-subscribe/route.ts) e [`/api/mercadopago/webhook`](file:///C:/dev/trinnsaas/src/app/api/mercadopago/webhook/route.ts)):**
   - **Renovação Automática de Token Expirado (> 7 dias):** Caso tenham se passado mais de 7 dias entre o pagamento de R$ 5,00 e a ativação da assinatura, `mintTokenFromVault()` gera automaticamente um novo `card_token` a partir de `mpCustomerId` + `mpCardId` antes de criar a assinatura.
   - **Cobrança do 1º Mês Promocional (`firstMonthAmountBrl = 50`):** Cria a assinatura recorrente (`mpPreApproval.create`) com `transaction_amount: 50` e `external_reference: "sub_1click_${userId}_next_${nextMonthsAmountBrl}"` (padrão `500`), debitando imediatamente R$ 50,00 no 1º mês.
   - **Virada Automática para o 2º Mês em Diante (`nextMonthsAmountBrl = 500`):** Assim que o webhook [`/api/mercadopago/webhook`](file:///C:/dev/trinnsaas/src/app/api/mercadopago/webhook/route.ts#L36-L65) confirma o pagamento do 1º mês (R$ 50,00), ele executa `mpPreApproval.update` (`PUT /preapproval/{id}`) alterando `auto_recurring.transaction_amount` para `500` (sem exigir novo token nem CVV), fazendo com que todas as renovações a partir do 2º mês ocorram no valor cheio.
   - **Contingência via Pagamento Direto no Cofre:** Se o 1º mês for cobrado via `mpPayment.create` direto no Customer Vault, a rota agenda no mesmo instante o `mpPreApproval.create` de `R$ 500/mês` com `auto_recurring.start_date` para `+30 dias`.

---

## 5. Interface & UX (Design System Liquid Glass Dark + Solar Orange `#FF5500`)
- **Rotas envolvidas:**
  - `/futhome2026` ([`src/app/futhome2026/page.tsx`](file:///C:/dev/trinnsaas/src/app/futhome2026/page.tsx))
  - `/` ([`src/app/page.tsx`](file:///C:/dev/trinnsaas/src/app/page.tsx))
  - `/pre-lancamento` ([`src/app/pre-lancamento/page.tsx`](file:///C:/dev/trinnsaas/src/app/pre-lancamento/page.tsx))
- **Estética Liquid Glass + Solar Orange (`#FF5500`) & Quebras de Seção Dopaminérgicas:**
  - Paleta escura sóbria (`#050507`), superfícies translúcidas em múltiplas camadas (`bg-white/[0.025] backdrop-blur-2xl`), bordas especulares finas e uso cirúrgico do laranja `#FF5500` para dar destaque aos pontos focais, CTAs primários e indicadores de progresso.
  - **Zero Formulário de Lead Padrão:** O card de formulário customizado (Nome + WhatsApp) foi integralmente removido; todos os CTAs da Landing Page e da barra fixa mobile abrem diretamente o modal oficial de cadastro do Clerk (`<SignUpButton mode="modal">`), levando o usuário autenticado para `/pre-lancamento`.
  - **Micro-Transições de Quebra de Seção (Picos de Dopamina Elegantes):**
    - *Filamento Luminoso Vertical (`SectionFilament`):* Fio de luz com ponto focal `#FF5500` conectando o Hero à narrativa.
    - *Horizonte de Refração Curvo (`SectionHorizon` / `SectionGlassStep`):* Degraus translúcidos que alteram sutilmente a profundidade óptica entre os blocos.
    - *Matriz Visual de 50 Vagas (`OS PRIMEIROS 50 — R$50/MÊS`):* Grade visual de 50 nós luminosos representando a capacidade física do Lote 01.
    - *Espinha Dorsal Iluminada (4 Etapas):* Linha vertical conectando os 4 passos com nós numerados e destaque solar na etapa inicial.
    - *Bilhete Perfurado (`RESERVA DE R$5`):* Card com recortes laterais de ingresso e linha tracejada técnica explicando que os R$ 5 reservam apenas o lugar na fila (sem créditos e sem acesso imediato).
- **Componentes criados/alterados:**
  - [`src/components/pre-launch/pre-launch-landing.tsx`](file:///C:/dev/trinnsaas/src/components/pre-launch/pre-launch-landing.tsx)
  - [`src/components/pre-launch/pre-launch-vip-view.tsx`](file:///C:/dev/trinnsaas/src/components/pre-launch/pre-launch-vip-view.tsx)
  - [`src/components/pre-launch/pre-launch-guard.tsx`](file:///C:/dev/trinnsaas/src/components/pre-launch/pre-launch-guard.tsx)
- **Otimização Mobile-First (320px–430px):**
  - **CTA Clerk Direto na 1ª Dobra Mobile:** Botão de destaque com chamada para o Lote 01 (`R$50/mês`) abrindo o modal do Clerk imediatamente.
  - **Prevenção de Auto-Zoom no iOS Safari:** Todos os campos `<input>` no checkout utilizam `text-base` (16px) no mobile (`text-base sm:text-xs`), evitando o zoom forçado do Safari ao focar nos campos.
  - **Bottom-Sheet no Checkout Fura-Fila (`/pre-lancamento`):** O modal de pagamento PIX/Cartão abre como *bottom-sheet* nativo no mobile (`items-end sm:items-center`, `rounded-t-3xl sm:rounded-3xl`, `max-h-[92dvh]`, suporte a `env(safe-area-inset-bottom)`).
  - **Barra Fixa Inferior Mobile (Sticky CTA):** Barra inferior com `backdrop-blur` e *safe-area* na Landing Page acionando diretamente o modal do Clerk.
- **Modal de Cadastro do Pré-Lançamento Simplificado ([`src/lib/clerk/prelaunch-modal.ts`](file:///C:/dev/trinnsaas/src/lib/clerk/prelaunch-modal.ts)):**
  - **Tema KRIATIVA (`KRIATIVA_CLERK_THEME`):** tema escuro (`dark` de `@clerk/ui/themes`) com `createTheme` experimental aplicando `colorPrimary: #FF5500`, cartão `#0A0A0E`, inputs `#14141A`, raio de borda `0.875rem` e backdrop `rgba(5, 5, 8, 0.82)`, alinhado à estética Liquid Glass Dark + Solar Orange.
  - **Formulário Enxuto (`options`):** `showOptionalFields: false` (esconde campos opcionais, ex.: telefone) e `socialButtonsVariant: "blockButton"` (botões sociais legíveis em bloco).
  - **Copy do Modal (`PRE_LAUNCH_CLERK_LOCALIZATION`):** pt-BR base (`@clerk/localizations/pt-BR`) aplicado globalmente no `ClerkProvider` de `src/app/layout.tsx`, com overrides em `signUp.start` — título **"Garanta seu lugar"** e subtítulo **"Cadastro gratuito. Sem cartão de crédito."** — continuando a copy da Landing.
  - **Aplicação:** o tema é injetado via `appearance` em `clerk.openSignUp`/`clerk.openSignIn` ([`pre-launch-landing.tsx`](file:///C:/dev/trinnsaas/src/components/pre-launch/pre-launch-landing.tsx)) e, nas rotas de fallback `/sign-up` e `/sign-in`, condicionalmente quando `redirect_url === "/pre-lancamento"` (wrapper client com `useSearchParams` + `Suspense`).
- **Resiliência da Sala VIP & Ponte de Sessão Server-Side (Zero "Sessão Não Reconhecida"):**
  - **Multi-Issuer em [`convex/auth.config.ts`](file:///C:/dev/trinnsaas/convex/auth.config.ts):** registra simultaneamente os domínios de produção (`https://clerk.kriativa.app`) e desenvolvimento (`https://epic-sponge-2961.clerk.accounts.dev`), além de `process.env.CLERK_FRONTEND_API_URL`, no array `providers`.
  - **SSR & Ponte Autenticada ([`src/lib/pre-launch-session.ts`](file:///C:/dev/trinnsaas/src/lib/pre-launch-session.ts) e [`src/app/api/pre-launch/route.ts`](file:///C:/dev/trinnsaas/src/app/api/pre-launch/route.ts)):** a página [`src/app/pre-lancamento/page.tsx`](file:///C:/dev/trinnsaas/src/app/pre-lancamento/page.tsx) resolve e sincroniza o perfil do usuário no servidor via `@clerk/nextjs/server` (`auth()` + `currentUser()`) e `api.preLaunch.syncPreLaunchSession` (autenticado com `INTERNAL_CONVEX_SECRET`), injetando `initialStatus` na renderização inicial de `<PreLaunchVipView />` e garantindo funcionamento contínuo das 3 etapas mesmo quando o cliente WebSocket Convex não possui JWT template `"convex"`.
  - **Error Boundary ([`src/components/pre-launch/pre-launch-error-boundary.tsx`](file:///C:/dev/trinnsaas/src/components/pre-launch/pre-launch-error-boundary.tsx)):** `PreLaunchErrorBoundary` (client, camada React) envolve `<PreLaunchVipView />` na rota `/pre-lancamento`, capturando erros em tempo de render e exibindo fallback com botão de recarregamento.
- **Conformidade de Terminologia:** Nenhuma menção a hardware bruto na interface.

---

## 6. Checklist de Homologação
- [x] Implementação de código sem mocks conectada ao Convex, Clerk e Mercado Pago.
- [x] Feature Flags `pre_launch_mode` e `pre_launch_skip_queue_payment` registradas em `convex/featureFlags.ts`.
- [x] Verificação de tipos TypeScript aprovada: `npx tsc --noEmit`.
- [x] Atualização refletida no documento central [`specs/MASTER_SPEC.md`](file:///C:/dev/trinnsaas/specs/MASTER_SPEC.md).
- [x] Modal de cadastro simplificado homologado: `npx tsc --noEmit`, `npx eslint` nos arquivos alterados e `npm run build` (Next 16.3.6, 40/40 rotas) aprovados.
