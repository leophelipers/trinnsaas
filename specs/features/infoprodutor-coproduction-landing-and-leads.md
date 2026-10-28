# SPEC: Página de Parceria e Coprodução para Infoprodutores (/infoprodutor)
> **Status:** HOMOLOGADO EM PRODUÇÃO  
> **Data de Criação:** 2026-10-28  
> **Última Atualização:** 2026-10-28  
> **Autor / Agente Responsável:** Antigravity (Advanced Agentic Coding)  
> **Feature Flag Associada:** `infoprodutor_partnership_page`

---

## 1. Objetivo & Justificativa de Negócio
- **Problema Resolvido:** O mercado de infoprodutos exige que cursos e mentorias entreguem mais do que conteúdo estático: os alunos demandam capacidade de execução prática imediata. Ao mesmo tempo, criar uma plataforma própria de inteligência artificial do zero exigiria uma operação tecnológica complexa e onerosa para o infoprodutor.
- **Solução & Modelo de Negócio:** Modelo de **coprodução ganha-ganha sem mensalidade**. O infoprodutor entra com o seu conhecimento, método, produto, audiência e capacidade de distribuição, enquanto a Kriativa entra com a infraestrutura completa de inteligência artificial (imagem, vídeo, áudio, texto, código e agentes).
- **Público Alvo:** Infoprodutores, mentores, líderes de comunidades e criadores de cursos digitais com produtos validados ou audiência consolidada.
- **Impacto:** Aceleração na aquisição de parceiros de grande porte e distribuição em massa dos motores da Kriativa dentro dos maiores cursos e treinamentos do mercado brasileiro.

---

## 2. Requisitos Funcionais
1. [x] **Página de Alta Conversão em `/infoprodutor`:** Implementada com base na copy estruturada de [`copyinfo.md`](file:///C:/dev/trinnsaas/copyinfo.md) no padrão de design *Solar Cinema* da Kriativa.
2. [x] **Apresentação da Proposta de Valor:** Destaque para os três pilares cardeais (*Conhecimento + Tecnologia + Execução*), catálogo dos motores (`Kriativa Vision, Motion, Voice, Mind, Code, Agents`), aceleração da própria operação do infoprodutor e comparativo de coprodução.
3. [x] **Formulário em Passos (Step Wizard Interativo):**
   - **Passo 1:** Nome completo e e-mail profissional.
   - **Passo 2:** WhatsApp direto com DDD e formatação automática.
   - **Passo 3:** Faturamento dos últimos 30 dias (faixas pré-definidas ou valor customizado).
   - **Passo 4:** Para o que mais usa inteligência artificial na operação.
   - **Passo 5:** Plataforma onde está vendendo atualmente (Hotmart, Kiwify, Eduzz, Ticto, Monetizze, Kirvano, LMS próprio ou outra) + observações adicionais/link.
4. [x] **Persistência de Resultados Parciais e Completos no Convex:**
   - Cada avanço de passo salva automaticamente o lead com `status: "partial"` e `currentStep`.
   - Se o usuário recarregar a página, a sessão (`clientSessionId`) recupera e atualiza o mesmo registro sem duplicar no banco de dados.
   - Na submissão final, atualiza para `status: "completed"`, carimba `submittedAt: Date.now()` e registra auditoria em `systemLogs`.
5. [x] **Disparo Automático de E-mail para `leo.phe.rod@gmail.com`:**
   - Convex `internalAction` (`notifyAdminCompletedLead`) acionado atomicamente após submissão completa.
   - Tenta envio prioritário via Resend com candidatos verificados (`Kriativa <nao-responda@kriativa.app>`, etc.).
   - Possui fallback resiliente via `FormSubmit.co` para garantir a entrega imediata dos dados da aplicação na caixa postal do administrador.
   - Link de 1 clique para iniciar conversa direta no WhatsApp do infoprodutor.
6. [x] **Tela de Obrigado:**
   - Mensagem clara destacando: *"O nosso time analisará o seu perfil e entrará em contato com você via WhatsApp e e-mail nos próximos dias úteis para conversarmos sobre a parceria."*
7. [x] **FAQ Interativo:** Accordion nativo com as 7 dúvidas frequentes respondidas conforme `copyinfo.md`.

---

## 3. Modelo de Dados (Convex Schema)
Adicionado ao [`convex/schema.ts`](file:///C:/dev/trinnsaas/convex/schema.ts):

```typescript
// 22. APLICAÇÕES E LEADS DE PARCERIA PARA INFOPRODUTORES (COPRODUÇÃO KRIATIVA)
infoprodutorLeads: defineTable({
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  whatsapp: v.optional(v.string()),
  revenueLast30Days: v.optional(v.string()),
  aiUsagePrimary: v.optional(v.string()),
  salesPlatform: v.optional(v.string()),
  additionalNotes: v.optional(v.string()),
  status: v.union(v.literal("partial"), v.literal("completed")),
  currentStep: v.number(),
  lastUpdatedAt: v.number(),
  submittedAt: v.optional(v.number()),
  emailNotifiedAt: v.optional(v.number()),
  emailNotificationStatus: v.optional(v.string()),
  clientSessionId: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  referer: v.optional(v.string()),
})
  .index("by_email", ["email"])
  .index("by_status", ["status"])
  .index("by_clientSessionId", ["clientSessionId"])
  .index("by_lastUpdatedAt", ["lastUpdatedAt"]),
```

---

## 4. Segurança, Antifraude & Feature Flag
- **Feature Flag Obrigatória:** `infoprodutor_partnership_page` configurada em [`convex/featureFlags.ts`](file:///C:/dev/trinnsaas/convex/featureFlags.ts).
- **Validação no Servidor:** Inclusão de `await assertFeatureFlag(ctx, "infoprodutor_partnership_page")` em `convex/infoprodutor.ts`.
- **Nível de Acesso (RBAC):** Página e submissão públicas; listagem e leitura protegidas ou via internal actions.
- **Auditoria:** Eventos registrados na tabela `systemLogs` (categoria `"system"`) com log detalhado de cada aplicação e entrega de e-mail.

---

## 5. Interface & UX (Design System Solar Cinema)
- **Rota:** `/infoprodutor` ([`src/app/infoprodutor/page.tsx`](file:///C:/dev/trinnsaas/src/app/infoprodutor/page.tsx)).
- **Componentes:**
  - [`InfoprodutorLanding`](file:///C:/dev/trinnsaas/src/components/infoprodutor/infoprodutor-landing.tsx)
  - [`InfoprodutorStepForm`](file:///C:/dev/trinnsaas/src/components/infoprodutor/infoprodutor-step-form.tsx)
- **Estética:** Fundo *Pitch Obsidian* (`#050506`), acentos em *Solar Flare Orange* (`#FF5500`), *Anamorphic Cyan* (`#00E5FF`) e *Emerald Confirm* (`#22c55e`).
- **Blindagem de Vocabulário:** Nenhuma menção a termos de hardware bruto (zero referências a GPUs, clusters ou placas). Utilização estrita de termos de cinema e produção (*motores de renderização, instâncias de processamento, estúdio ativo*).

---

## 6. Checklist de Homologação
- [x] Implementação de código sem mocks conectada ao Convex real.
- [x] Feature Flag `infoprodutor_partnership_page` registrada em `DEFAULT_FEATURE_FLAGS` e `schema.ts`.
- [x] Verificação de tipos TypeScript aprovada: `npx tsc --noEmit`.
- [x] Notificação administrativa por e-mail para `leo.phe.rod@gmail.com` com dados completos e fallback.
- [x] Tela de agradecimento confirmando que a equipe entrará em contato.
- [x] Atualização refletida no documento mestre [`specs/MASTER_SPEC.md`](file:///C:/dev/trinnsaas/specs/MASTER_SPEC.md).
