# SPEC: Promoção de Módulos de Produção para o Menu Principal do Dashboard
> **Status:** HOMOLOGADO EM PRODUÇÃO  
> **Data de Criação:** 2026-10-08  
> **Última Atualização:** 2026-10-08  
> **Autor / Agente Responsável:** Antigravity / DeepMind Pair Programming  
> **Feature Flag Associada:** `video_generation` (Governança geral do estúdio)

---

## 1. Objetivo & Justificativa de Negócio
- **Problema:** Anteriormente, o **Cofre de Mídia**, os **Atores e Elementos (@)** e os **Roteiros & Decupagem** estavam confinados como sub-telas secundárias no workspace do Kriativa Studio (`/dashboard/studio`). Isso sobrecarregava o Studio (que deve ser um ambiente de criação e timeline ágil) e ocultava as ferramentas centrais de gestão de acervo, consistência visual e planejamento narrativo dos usuários do painel.
- **Solução:** Elevação dessas três ferramentas vitais para rotas de primeira classe na barra de navegação principal da Dashboard (`/dashboard/vault`, `/dashboard/elements`, `/dashboard/scripts`), desacoplando o Studio e simplificando o fluxo de trabalho do criador.
- **Impacto:** Aumento da produtividade dos diretores de cena, navegação intuitiva tanto no desktop quanto no mobile drawer, além de permitir o intercâmbio rápido de dados entre roteiro, elementos, acervo e o console de renderização via parâmetros de URL.

---

## 2. Requisitos Funcionais
1. [x] **Navegação de Primeiro Nível:** Inclusão dos menus "Cofre de Mídias", "Atores & Elementos" e "Roteiro & Decupagem" em `navItems` de `src/components/dashboard/dashboard-nav.tsx`.
2. [x] **Rotas Dedicadas no Dashboard:**
   - `/dashboard/vault`: Acesso completo ao acervo de vídeos e imagens com busca, downloads em alta fidelidade, filtros e atalhos de animação contínua (I2V).
   - `/dashboard/elements`: Gestão de consistência facial de atores virtuais, objetos de cena (props), locações e estilos usando tags `@`.
   - `/dashboard/scripts`: Decupagem técnica de planos cinematográficos no formato Master Scene, enquadramentos de câmera e pistas sonoras.
3. [x] **Desacoplamento do Studio:** Remoção das sub-telas do Studio (`studio-view.tsx` e `studio-sidebar.tsx`). O Studio passa a focar 100% no palco de geração, feed de produção e console flutuante (`StudioDock`).
4. [x] **Interoperabilidade Fluida:** Capacidade de despachar cenas e mídias de qualquer uma das três telas diretamente para o Estúdio via search params (`/dashboard/studio?prompt=...&inputImageUrl=...&camera=...`).
5. [x] **Persistência Completa de Roteiros (Zero Mocks):** Criação da tabela `studioScripts` no Convex e do módulo `convex/studioScripts.ts` com sincronização em tempo real e auto-save debounced.

---

## 3. Modelo de Dados (Convex Schema)
Adicionada a tabela `studioScripts` em `convex/schema.ts` para persistência permanente das cenas e roteiros cinematográficos:

```typescript
// 17. ROTEIROS & DECUPAGEM TÉCNICA DE CENAS
studioScripts: defineTable({
  userId: v.string(),
  projectId: v.optional(v.id("studioProjects")),
  title: v.string(),
  description: v.optional(v.string()),
  scenes: v.array(
    v.object({
      id: v.string(),
      sceneNumber: v.number(),
      header: v.string(),
      visualPrompt: v.string(),
      audioCues: v.string(),
      cameraMovement: v.string(),
    })
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_projectId", ["projectId"]),
```

---

## 4. Segurança, Antifraude & Governança
- **Nível de Acesso (RBAC):** Autenticado. Usuários têm escopo estrito de seus próprios roteiros, mídias e elementos protegidos por `identity.subject`.
- **Zero Mocks:** Todas as ações (criação de atores, envio de referências para storage do Convex, salvamento de cenas e listagem de gerações) utilizam tabelas e mutações reais do Convex.
- **Governança de UI:** Proibição estrita de termos brutos de hardware (usando "motores de renderização", "instâncias de processamento", "estúdio ativo").

---

## 5. Interface & UX (Design System Solar Cinema)
- **Top Banners Temáticos:** Cada nova página do Dashboard possui um banner com iluminação ambiente cinematográfica, identificador de rota e seletores reativos de projeto (`studioProjects`).
- **DashboardShell Ampliado:** Páginas de produção utilizam container `max-w-7xl` para acomodar grades ricas de mídias e cartões de decupagem técnica.
- **Studio Simplificado:** A barra lateral do Studio (`StudioSidebar`) mantém foco total no projeto ativo e status do estúdio, oferecendo links diretos para os módulos de produção do painel.

---

## 6. Checklist de Homologação
- [x] Implementação de código sem mocks conectada ao Convex.
- [x] Novas rotas testadas e integradas ao menu lateral e mobile drawer.
- [x] Verificação de tipos TypeScript aprovada: `npx tsc --noEmit` com 0 erros.
- [x] Atualização refletida no documento central [`specs/MASTER_SPEC.md`](file:///C:/dev/trinnsaas/specs/MASTER_SPEC.md).
