# SPEC: Experiência de Onboarding Obrigatório do Criador (`/onboarding`)
> **Status:** HOMOLOGADO EM PRODUÇÃO  
> **Data de Criação:** 2026-10-10  
> **Última Atualização:** 2026-10-10  
> **Autor / Agente Responsável:** Antigravity (Pair Programming)  
> **Feature Flag Associada:** `user_onboarding_wizard`

---

## 1. Objetivo & Justificativa de Negócio
- **Problema:** Após criar a conta, os usuários eram despejados diretamente no Dashboard sem personalização de perfil, sem canal de comunicação direta (WhatsApp) para suporte e notificações, e sem a oportunidade de direcionamento imediato para a oferta ideal (Plano Ilimitado de R$ 200/mês ou Créditos a partir de R$ 5,00).
- **Usuário Alvo:** Novos criadores recém-cadastrados na plataforma (via Landing Page, modais de cadastro ou rotas de sign-up).
- **Impacto de Negócio:**
  1. **Qualificação e Ativação Rápida:** Coleta de primeiro nome, sobrenome e WhatsApp com DDD para relacionamento e suporte.
  2. **Segmentação por Nível de IA:** Mapeamento do grau de proficiência (Iniciante, Intermediário, Avançado) para calibração de ferramentas.
  3. **Conversão Imediata (CRO):** Apresentação das opções de plano (Kriativa Ilimitada, Créditos ou Explorar Grátis) gerando conversão antecipada.

---

## 2. Requisitos Funcionais & Fluxo de Telas
1. [x] **Passo 1 — Identificação & WhatsApp:**
   - Coleta de Nome (mínimo 2 caracteres).
   - Coleta de Sobrenome (mínimo 2 caracteres).
   - Coleta de WhatsApp com máscara brasileira `(XX) XXXXX-XXXX` e validação estrita de DDD + número (10 a 11 dígitos numéricos).
2. [x] **Passo 2 — Nível de Conhecimento de IA:**
   - Seleção em 3 cartões interativos:
     - `beginner`: Iniciante / Estou começando agora.
     - `intermediate`: Intermediário / Criador ativo no dia a dia.
     - `advanced`: Avançado / Audiovisual, marketing e direção.
3. [x] **Passo 3 — Escolha de Preferência de Plano:**
   - Seleção entre as opções centrais da plataforma:
     - `unlimited`: **Kriativa Ilimitada (R$ 200/mês)** -> Redireciona para `/dashboard/credits?plan=unlimited`.
     - `credits`: **Créditos sob Demanda (A partir de R$ 5,00)** -> Redireciona para `/dashboard/credits`.
     - `explore_later`: **Ver Depois & Explorar Primeiro** -> Redireciona para `/dashboard` para conhecer a interface e ferramentas antes de recarregar.
4. [x] **Guarda de Acesso (Onboarding Guard):**
   - Inserido no layout do Dashboard (`/dashboard/*`).
   - Se o usuário autenticado não possui `onboardingCompleted: true`, é redirecionado instantaneamente para `/onboarding`.
   - Se o usuário já concluiu o onboarding e tenta acessar `/onboarding`, é redirecionado para `/dashboard`.
5. [x] **Redirecionamento Pós-Cadastro:**
   - Todos os botões `SignUpButton` e o formulário `/sign-up` configurados com `fallbackRedirectUrl="/onboarding"`.

---

## 3. Modelo de Dados (Convex Schema)
Adicionados os seguintes campos à tabela `users` em `convex/schema.ts`:

```typescript
users: defineTable({
  clerkId: v.string(),
  email: v.string(),
  canonicalEmail: v.optional(v.string()),
  name: v.optional(v.string()),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  whatsapp: v.optional(v.string()),
  aiExperienceLevel: v.optional(
    v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    )
  ),
  preferredPlan: v.optional(
    v.union(
      v.literal("unlimited"),
      v.literal("credits"),
      v.literal("explore_later")
    )
  ),
  onboardingCompleted: v.optional(v.boolean()),
  onboardingCompletedAt: v.optional(v.number()),
  // ... campos pré-existentes
})
  .index("by_clerkId", ["clerkId"])
  .index("by_onboardingCompleted", ["onboardingCompleted"])
```

---

## 4. Segurança, Antifraude & Feature Flag
- **Feature Flag Obrigatória:** `user_onboarding_wizard` registrada em `DEFAULT_FEATURE_FLAGS` no arquivo `convex/featureFlags.ts`.
- **Validação no Servidor:** Mutation `completeOnboarding` em `convex/users.ts` valida `assertFeatureFlag(ctx, "user_onboarding_wizard")`, checa autenticação via `ctx.auth.getUserIdentity()`, sanitiza strings e valida o formato numérico do WhatsApp.
- **Auditoria & Observabilidade:** Conclusão de onboarding registrada na tabela `systemLogs` com nível `info` e categoria `users`.
- **Zero Mocks:** Dados gravados diretamente no banco de dados Convex e persistidos na sessão Clerk.
- **Regra 4 de AGENTS.md:** Zero menções a termos de hardware bruto na interface de onboarding.

---

## 5. Interface & UX (Design System Solar Cinema)
- **Rota Dedicada:** `/onboarding` (`src/app/onboarding/page.tsx`).
- **Componente Principal:** `src/components/onboarding/onboarding-wizard.tsx`.
- **Guard Reativo:** `src/components/dashboard/onboarding-guard.tsx`.
- **Responsividade 100% Mobile:** Inputs com altura confortável (`min-h-[48px]`), stepper visual compacto, cards fáceis de tocar e botões full-width no mobile.

---

## 6. Checklist de Homologação
- [x] Mutation transacional `completeOnboarding` implementada e validada.
- [x] Feature flag `user_onboarding_wizard` registrada em `convex/featureFlags.ts`.
- [x] Proteção de rota `/onboarding` adicionada ao Clerk middleware (`src/proxy.ts`).
- [x] Redirecionamento de novos cadastros e bloqueio do dashboard via `OnboardingGuard`.
- [x] Registro de eventos no `systemLogs` do Convex.
- [x] Verificação de tipos TypeScript aprovada: `npx tsc --noEmit` com 0 erros.
- [x] Documento central `specs/MASTER_SPEC.md` atualizado com o Módulo 14.
