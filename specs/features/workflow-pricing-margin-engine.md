# SPEC: MOTOR DE PRECIFICAÇÃO DINÂMICA POR TEMPO DE EXECUÇÃO & GOVERNANÇA DE MARGEM DE LUCRO DE WORKFLOWS
> **Status:** HOMOLOGADO EM PRODUÇÃO  
> **Data de Criação:** 2026-10-08  
> **Última Atualização:** 2026-10-08  
> **Autor / Agente Responsável:** Kriativa Core Financial Architecture & Antigravity  
> **Feature Flag Associada:** `dynamic_workflow_pricing`

---

## 1. Objetivo & Justificativa de Negócio

### 1.1 Contexto e Desafio
O estúdio de criação de vídeo e imagem do **Kriativa.app** utiliza múltiplos motores e fluxos baseados em ComfyUI e pipelines de difusão/transformers (ex: Krea-2 Turbo, FastH3 Image-to-Video, FastH3 Text-to-Video 480p, FastH3 Text-to-Video 720p HD, LTX-2.5 Distilled HD 22B, Upscale 4K HDR & RIFE). 

Mesmo quando alguns workflows utilizam o mesmo modelo base (como a família FastH3), o tempo real de inferência e alocação de nó varia drasticamente:
- **FastH3 Image-to-Video (2s a 5s):** ~45 segundos de alocação/execução.
- **FastH3 Text-to-Video 480p Preview:** ~45 segundos.
- **FastH3 Text-to-Video 720p HD (1344x768):** ~108 segundos.
- **LTX-2.5 Distilled HD 22B:** ~218 segundos (~3.6 minutos).
- **Krea-2 Turbo (Text-to-Image):** ~18 segundos.

Sem uma fórmula contábil rigorosa que una tempo de execução, custo real de GPU por segundo e margem de lucro alvo, o estúdio incorre em risco de erosão de margem ou prejuízo operacional em workflows mais longos ou em períodos de oscilação cambial.

### 1.2 Solução Implementada
Esta especificação introduz o **Motor de Precificação Dinâmica por Workflow com Governança de Margem de Lucro**:
1. Cada workflow possui seu próprio tempo médio de execução em segundos (`estimatedSeconds`) e taxa horária/por segundo de GPU (`gpuRatePerSecond`).
2. O administrador possui controle total no painel `/dashboard/admin/pricing` para estipular a **Margem de Lucro Alvo (`targetMarginPct`)** tanto individualmente por workflow quanto globalmente para todos os workflows.
3. O sistema calcula e ajusta automaticamente a quantidade de créditos cobrados (`creditsCharged`) garantindo com precisão matemática que a margem real de contribuição nunca caia abaixo do alvo estipulado.
4. O console de criação (`StudioDock` no `/dashboard/studio`) consome essa precificação de forma reativa via WebSockets, atualizando instantaneamente os créditos exigidos na interface do usuário.
5. Cada geração concluída tem seu custo real registrado na tabela `studioGenerations` e auditado na tabela `systemLogs` para contabilidade e telemetria imutáveis.

---

## 2. Requisitos Funcionais

1. [x] **Cálculo Matemático Rigoroso de Preço por Margem:**
   - Custo GPU em USD: $\text{Custo}_{\text{USD}} = \text{estimatedSeconds} \times \text{gpuRatePerSecond}$
   - Custo GPU em BRL: $\text{Custo}_{\text{BRL}} = \text{Custo}_{\text{USD}} \times \text{usdToBrlRate}$
   - Receita Alvo em BRL: $\text{Receita Alvo}_{\text{BRL}} = \frac{\text{Custo}_{\text{BRL}}}{1 - (\text{targetMarginPct} / 100)}$
   - Cobrança em Créditos: $\text{creditsCharged} = \max\left(1, \left\lceil \frac{\text{Receita Alvo}_{\text{BRL}}}{\text{creditValueBRL}} \right\rceil\right)$
   - O uso de teto matemático ($\lceil \dots \rceil$) assegura que a margem real efetiva é sempre $\ge \text{targetMarginPct}$.

2. [x] **Ajuste de Margem Individual no Painel Administrativo:**
   - Botões de preset rápido (`[80%] [85%] [90%] [95%]`) e modal dedicado inline em cada linha da tabela de Unit Economics.
   - Mutation atômica `adminPricing.updateWorkflowMargin({ id, targetMarginPct })` recalcula e persiste o novo valor de créditos em tempo real.

3. [x] **Ajuste de Margem em Lote (Global):**
   - Modal de controle para definir uma margem unificada (ex: 85%) em todos os workflows cadastrados em um único clique via `adminPricing.bulkUpdateWorkflowsMargin`.

4. [x] **Recálculo Bidirecional no Modal de Workflow:**
   - Ao alterar o tempo estimado de execução em segundos, os créditos recomendados são recalculados preservando a margem alvo.
   - Ao alterar a margem alvo, os créditos são recalculados instantaneamente.
   - Ao ajustar manualmente os créditos cobrados, a margem efetiva é recalculada e exibida em tempo real em um card de simulação financeira.

5. [x] **Integração Reativa com o Estúdio (Zero Hardcoding):**
   - O dock de criação do estúdio (`StudioDock`) consulta `api.studioGenerations.getStudioPricing` e reflete imediatamente as alterações do administrador.
   - A mutation `createGeneration` em `convex/studioGenerations.ts` valida o saldo e debita exatamente os créditos ativos de `workflowPricing` no banco.
   - A mutation `completeGeneration` computa e persiste o custo contábil real baseado na taxa do workflow específico e no tempo de execução faturado.

---

## 3. Modelo de Dados (Convex Schema)

Tabela `workflowPricing` em [`convex/schema.ts`](file:///C:/dev/trinnsaas/convex/schema.ts):

```typescript
workflowPricing: defineTable({
  slug: v.string(), // ex: "krea2_turbo", "fasth3_i2v", "fasth3_t2v_720p", "ltx25_i2v"
  name: v.string(),
  description: v.string(),
  gpuType: v.union(v.literal("80gb"), v.literal("48gb")),
  gpuRatePerSecond: v.number(), // $0.000486 (48gb) ou $0.000756 (80gb)
  estimatedSeconds: v.number(), // Tempo médio de execução em segundos
  creditsCharged: v.number(), // Créditos cobrados do criador
  targetMarginPct: v.optional(v.number()), // Margem de lucro alvo (ex: 85 para 85%)
  category: v.string(),
  isActive: v.boolean(),
  sortOrder: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_isActive", ["isActive"])
  .index("by_sortOrder", ["sortOrder"]),
```

Campos financeiros em `studioGenerations`:
- `executionTimeMs`: Duração real em milissegundos reportada pelo provedor de inferência.
- `costUsd`: Custo real computado com base em `gpuRatePerSecond`.
- `costBrl`: Custo convertido em moeda nacional.
- `creditsCharged`: Débito exato retido do usuário.

---

## 4. Segurança, Antifraude & Feature Flag

- **Feature Flag Obrigatória:** `dynamic_workflow_pricing` registrada em `convex/featureFlags.ts`.
- **Nível de Acesso (RBAC):** Mutações de ajuste de precificação e margem (`upsertWorkflow`, `updateWorkflowMargin`, `bulkUpdateWorkflowsMargin`, `seedDefaultWorkflows`) exigem estritamente autenticação de Administrador (`await requireAdmin(ctx)`).
- **Observabilidade Contínua:** Todas as alterações de margem, precificação ou criação de novos workflows geram registros detalhados na tabela `systemLogs` (categoria `"pricing"`), visíveis no console `/dashboard/admin/observability`.
- **Proteção Anti-Drain (Cold Start Escrow):** O sistema nunca permite débitos inferiores ao custo contábil seguro de um workflow, mesmo que a requisição do cliente tente submeter valores adulterados.

---

## 5. Interface & UX (Design System Solar Cinema)

- **Rotas Envolvidas:**
  - `/dashboard/admin/pricing`: Tabela de Unit Economics, cartões de infraestrutura, controle de margem por linha e modais de ajuste global e individual.
  - `/dashboard/studio`: Dock de controle cinematográfico com exibição reativa dos créditos exigidos.
- **Componentes:**
  - [`PricingView`](file:///C:/dev/trinnsaas/src/components/dashboard/admin/pricing-view.tsx): Console administrativo completo com visualização de custo, receita bruta, lucro líquido e margem real efetiva.
  - [`StudioDock`](file:///C:/dev/trinnsaas/src/components/dashboard/studio/studio-dock.tsx): Painel de controle de geração do usuário final.
- **Conformidade com a Regra de Ouro UI:**
  - Nenhuma menção a hardware bruto ("GPU", "VRAM", "H100/A100", "potência") é visível na interface do criador comum.
  - Apenas terminologia cinematográfica elegante é empregada no estúdio: "Renderização", "Motores de renderização", "Resolução cinemática", "Estúdio ativo".

---

## 6. Checklist de Homologação

- [x] Implementação de fórmulas de margem e precificação 100% livre de mocks, conectada diretamente ao Convex.
- [x] Feature flag `dynamic_workflow_pricing` ativa e registrada em `DEFAULT_FEATURE_FLAGS`.
- [x] Recálculo dinâmico testado no client e server.
- [x] Verificação estrita de tipagem TypeScript aprovada (`npx tsc --noEmit` exit code 0).
- [x] Auditoria de eventos de margem registrada em `systemLogs`.
- [x] Especificação Master atualizada em `specs/MASTER_SPEC.md`.
