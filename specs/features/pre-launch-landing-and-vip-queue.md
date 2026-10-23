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
   - **Passo 3 — Comprar um Lugar na Fila (R$ 5,00 Apenas no Cartão):** Pagamento exclusivo via cartão de crédito (pois o mesmo cartão será utilizado para as assinaturas). Deixa explícito que o plano cheio será de **R$ 500/mês**, que os R$ 5,00 compram apenas um lugar prioritário na fila para o primeiro mês de R$ 50,00, **não sendo convertido em créditos** (`creditsTotal: 0`) e **não concedendo acesso imediato**. Exibir exclusivamente os modelos proprietários **Kriativa Vision, Kriativa Motion, Kriativa Voice e Kriativa Mind** (sem citar modelos originais).
6. [x] Enviar aviso automático para `leo.phe.rod@gmail.com` sempre que um novo usuário se cadastrar, confirmar o e-mail ou comprar um lugar na fila (`convex/emails.ts`).
7. [x] Permitir no painel administrativo (`/dashboard/admin`) visualizar as badges `PRÉ-LANÇAMENTO` e `FURA-FILA` e liberar/restringir usuários com 1 clique (`toggleUserPreLaunchTag`).
8. [x] Configurar o Meta Pixel (`1126197216455519`) e a API de Conversões da Meta (CAPI v21.0) hardcoded com deduplicação por `event_id` para:
   - `PageView`: Disparado em todas as rotas.
   - `Lead`: Disparado quando o usuário conclui o cadastro de pré-lançamento ou confirma seu e-mail/WhatsApp.
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
- **Conformidade de Terminologia:** Nenhuma menção a hardware bruto na interface.

---

## 6. Checklist de Homologação
- [x] Implementação de código sem mocks conectada ao Convex, Clerk e Mercado Pago.
- [x] Feature Flags `pre_launch_mode` e `pre_launch_skip_queue_payment` registradas em `convex/featureFlags.ts`.
- [x] Verificação de tipos TypeScript aprovada: `npx tsc --noEmit`.
- [x] Atualização refletida no documento central [`specs/MASTER_SPEC.md`](file:///C:/dev/trinnsaas/specs/MASTER_SPEC.md).
