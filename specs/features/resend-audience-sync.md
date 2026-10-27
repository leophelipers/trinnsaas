# SPEC: Sincronização Automática de Usuários e Contatos com a Audiência do Resend
> **Status:** HOMOLOGADO  
> **Data de Criação:** 2026-10-27  
> **Última Atualização:** 2026-10-27  
> **Autor / Agente Responsável:** Antigravity  
> **Feature Flag Associada:** `resend_audience_sync`

---

## 1. Objetivo & Justificativa de Negócio
- **Problema resolvido:** Anteriormente, após o cadastro no Clerk e sincronização no Convex, o Resend era utilizado apenas para disparo de e-mails transacionais (`POST /emails`), sem registrar o usuário na Audiência de Contatos do Resend (`/audiences/{audience_id}/contacts` e `/contacts`).
- **Público-alvo:** Todos os criadores cadastrados (via Clerk, Sala VIP de Pré-Lançamento, Onboarding) e contatos criados ou atualizados manualmente pela administração.
- **Impacto esperado:** Garante que 100% dos leads, membros de pré-lançamento e contatos criados na plataforma fiquem imediatamente registrados e atualizados (`email`, `first_name`, `last_name`, `unsubscribed: false`) na Audiência oficial do Resend para campanhas, broadcasts e automações.

---

## 2. Requisitos Funcionais
1. [x] **Descoberta e Criação Automática de Audiência (`resolveOrCreateResendAudienceId`):** Utiliza `resendAudienceId` (de `preLaunchSettings` ou `RESEND_AUDIENCE_ID`) ou consulta automaticamente `GET https://api.resend.com/audiences` (criando a audiência `"Kriativa"` via `POST /audiences` caso nenhuma exista) e persiste o ID descoberto no Convex.
2. [x] **Registro Automático no Cadastro Clerk & Convex:** Sincroniza o contato na Audiência do Resend em todos os fluxos de entrada (`upsertFromClerk`, `syncUser`, `syncPreLaunchSession`, `sendPreLaunchEmails`, `savePreLaunchProfile`, `completeOnboarding`, `updateName`).
3. [x] **Registro de Contatos Criados Manualmente (`admin.createUser` e `admin.updateUser`):** Todo contato criado ou atualizado pelo painel administrativo é registrado/atualizado imediatamente na Audiência do Resend.
4. [x] **Sincronização em Lote / Backfill (`syncAllUsersToResendAudience` e `syncExistingContactsToResend`):** Sincroniza todos os usuários e contatos já existentes no Convex e no Clerk para a Audiência do Resend, com controle de taxa (`550ms` por requisição) e botão rápido na barra administrativa da Sala VIP.

---

## 3. Modelo de Dados (Convex Schema)
Campos adicionados em [`convex/schema.ts`](file:///C:/dev/trinnsaas/convex/schema.ts):

```typescript
// Na tabela users:
resendContactId: v.optional(v.string()),
resendAudienceId: v.optional(v.string()),
resendSyncedAt: v.optional(v.number()),

// Na tabela preLaunchSettings:
resendAudienceId: v.optional(v.string()),
```

---

## 4. Segurança, Antifraude & Feature Flag
- **Feature Flag Obrigatória:** `resend_audience_sync` registrada em [`convex/featureFlags.ts`](file:///C:/dev/trinnsaas/convex/featureFlags.ts).
- **Validação no Servidor:** Verificação de `isFeatureFlagActive(ctx, "resend_audience_sync")` em [`convex/emails.ts`](file:///C:/dev/trinnsaas/convex/emails.ts).
- **Nível de Acesso (RBAC):** Actions de sincronização são `internalAction` no Convex; o gatilho manual em lote exige privilégio de administrador (`requireAdmin` ou `INTERNAL_CONVEX_SECRET`).
- **Auditoria:** Todas as sincronizações individuais e em lote são registradas na tabela `systemLogs` com `resendContactId` e `resendAudienceId`.

---

## 5. Interface & UX (Design System Solar Cinema)
- Barra de controle administrativa em [`src/components/pre-launch/pre-launch-vip-view.tsx`](file:///C:/dev/trinnsaas/src/components/pre-launch/pre-launch-vip-view.tsx):
  - Campo opcional para `Resend Audience ID (Auto)` (detectado automaticamente se deixado em branco).
  - Botão **Sync Resend** para disparar a sincronização imediata de todos os contatos existentes no Clerk e Convex para a Audiência do Resend.

---

## 6. Checklist de Homologação
- [x] Implementação de código sem mocks conectada ao Convex, Clerk e API oficial do Resend.
- [x] Feature Flag `resend_audience_sync` registrada em `convex/featureFlags.ts`.
- [x] Verificação de tipos TypeScript aprovada: `npx tsc --noEmit`.
- [x] Atualização refletida no documento central [`specs/MASTER_SPEC.md`](file:///C:/dev/trinnsaas/specs/MASTER_SPEC.md).
