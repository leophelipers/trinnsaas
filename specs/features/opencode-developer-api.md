# SPEC: API de Desenvolvedores & Gateway OpenAI / OpenCode
> **Status:** HOMOLOGADO  
> **Data de Criação:** 2026-10-27  
> **Última Atualização:** 2026-10-27  
> **Autor / Agente Responsável:** Antigravity  
> **Feature Flag Associada:** `developer_api_enabled`

---

## 1. Objetivo & Justificativa de Negócio
- **Problema:** Desenvolvedores e criadores avançados utilizam agentes de código e ambientes de desenvolvimento assistidos por IA (como OpenCode CLI, Cursor, Continue.dev e Aider) e necessitam conectar seus fluxos de trabalho a instâncias de processamento e modelos de inteligência artificial de elite sem depender exclusivamente da interface web do Kriativa Studio.
- **Público-Alvo:** Desenvolvedores, engenheiros de prompts, criadores técnicos e usuários do estúdio que possuem saldo de créditos ou uso ilimitado.
- **Impacto:** Expansão direta do uso do saldo de créditos em ambiente de desenvolvimento local, fidelização de usuários técnicos através de ferramentas como o OpenCode e posicionamento da plataforma como provedora oficial de infraestrutura de inferência.

---

## 2. Requisitos Funcionais
1. [x] **Gestão de Chaves de API (`krt_live_...`):** Criação, listagem com prefixo seguro e revogação instantânea de chaves de API pelo criador no console do perfil.
2. [x] **Console Administrativo com Chave Seletora On/Off (OpenRouter vs RunPod):** O administrador controla em `/dashboard/admin/ai-settings` para onde cada modelo proprietário (`kriativa-code`, `kriativa-mind`, `kriativa-reasoning`, `kriativa-fast`) aponta, podendo alternar entre OpenRouter e RunPod com 1 clique, definir o nome exato do modelo e ligar/desligar a rota.
3. [x] **Endpoint OpenAI-Compatible (`GET /api/v1/models`):** Listagem de modelos proprietários da Kriativa (`kriativa-code`, `kriativa-mind`, `kriativa-reasoning`, `kriativa-fast`) com `owned_by: "kriativa"`, consultando dinamicamente o banco Convex e ocultando 100% dos nomes e provedores originais de terceiros.
4. [x] **Endpoint de Inferência e Streaming (`POST /api/v1/chat/completions`):** Suporte integral ao protocolo OpenAI Chat Completions com Server-Sent Events (SSE), parâmetros de temperatura, max_tokens e suporte obrigatório a chamadas de ferramentas (*tool calling* / `tools`), indispensável para a execução de tarefas pelo OpenCode. Roteia os modelos proprietários nos bastidores de forma invisível conforme configurado no Admin.
5. [x] **Dedução Atômica de Créditos:** Ao término de cada inferência (`flush` do stream SSE ou resposta síncrona), o consumo real de tokens (prompt + completion) é debitado de forma transacional e atômica via `fulfillOrDeductCredits` na tabela de livro-razão `creditTransactions` do Convex.
6. [x] **Proteção de Quota:** Bloqueio imediato com código HTTP 402 (*Payment Required*) quando o usuário não-administrador possui saldo zerado ou insuficiente.

---

## 3. Modelo de Dados (Convex Schema)

```typescript
// 19. CHAVES DE API PARA DESENVOLVEDORES & INTEGRAÇÕES EXTERNAS (OPENCODE, CURSOR, CLI)
apiKeys: defineTable({
  userId: v.string(), // clerkId
  name: v.string(), // ex: "OpenCode CLI", "Cursor Studio"
  key: v.string(), // chave secreta completa (krt_live_...)
  keyPrefix: v.string(), // ex: "krt_live_abc1..." para exibição segura na interface
  status: v.union(v.literal("active"), v.literal("revoked")),
  lastUsedAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_key", ["key"])
  .index("by_userId", ["userId"])
  .index("by_userId_status", ["userId", "status"]),
```

---

## 4. Segurança, Antifraude & Feature Flag
- **Feature Flag Obrigatória:** `developer_api_enabled` em `DEFAULT_FEATURE_FLAGS` no arquivo [`convex/featureFlags.ts`](file:///C:/dev/trinnsaas/convex/featureFlags.ts).
- **Validação no Servidor:** Inclusão de `await assertFeatureFlag(ctx, "developer_api_enabled")` nas mutations e verificação via secret interno no gateway HTTP.
- **Limite de Segurança:** Máximo de 10 chaves ativas por criador para prevenir vazamento e abuso descontrolado.
- **Auditoria:** Toda criação, revogação e consumo anômalo é registrado na tabela `systemLogs` sob a categoria `"developer_api"`.

---

## 5. Interface & UX (Design System Solar Cinema)
- **Rotas:** Integrado à aba **"Chaves de API & OpenCode"** em `/dashboard/profile` através do componente [`ApiKeysManager`](file:///C:/dev/trinnsaas/src/components/dashboard/api-keys-manager.tsx).
- **UX de Chave Única:** Ao criar uma chave, o usuário recebe um alerta de cópia única com botão de cópia instantânea para a área de transferência.
- **Snippet Pronto para OpenCode:** Bloco interativo que gera o arquivo `opencode.json` pré-configurado com a Base URL (`/api/v1`) e os modelos habilitados para tool calling e raciocínio.
- **Conformidade de Linguagem:** Zero termos de hardware bruto na interface. Menções exclusivas a "motores de renderização", "instâncias de processamento" e "estúdio de IA".

---

## 6. Checklist de Homologação
- [x] Implementação de código sem mocks conectada ao Convex e APIs reais de inferência.
- [x] Feature Flag `developer_api_enabled` registrada e funcional.
- [x] Tipagem TypeScript estrita e compatibilidade OpenAI validada.
- [x] Documentação refletida no [`specs/MASTER_SPEC.md`](file:///C:/dev/trinnsaas/specs/MASTER_SPEC.md).
