# SPEC: [NOME DA FEATURE / MÓDULO]
> **Status:** [PLANEJAMENTO | EM DESENVOLVIMENTO | HOMOLOGADO | DESCONTINUADO]  
> **Data de Criação:** AAAA-MM-DD  
> **Última Atualização:** AAAA-MM-DD  
> **Autor / Agente Responsável:** [Nome / Agente]  
> **Feature Flag Associada:** `[ex: studio_export_4k]`

---

## 1. Objetivo & Justificativa de Negócio
- Qual problema esta funcionalidade resolve?
- Quem é o usuário alvo (Criador geral, Assinante VIP, Administrador)?
- Qual o impacto esperado na experiência do usuário e nas métricas de retenção/faturamento?

---

## 2. Requisitos Funcionais
1. [ ] Requisito 1: ...
2. [ ] Requisito 2: ...
3. [ ] Requisito 3: ...

---

## 3. Modelo de Dados (Convex Schema)
Descreva as tabelas novas ou campos adicionados ao `convex/schema.ts`:

```typescript
// Exemplo de modelagem
minhaTabela: defineTable({
  userId: v.string(),
  parametroA: v.string(),
  // ...
}).index("by_userId", ["userId"])
```

---

## 4. Segurança, Antifraude & Feature Flag
- **Feature Flag Obrigatória:** `sua_flag_key`
- **Validação no Servidor:** Inclusão de `await assertFeatureFlag(ctx, "sua_flag_key")` em todas as mutations/actions críticas.
- **Nível de Acesso (RBAC):** [Público / Autenticado / Administrador]
- **Auditoria:** Eventos registrados na tabela `systemLogs`.

---

## 5. Interface & UX (Design System Solar Cinema)
- Rotas envolvidas (ex: `/dashboard/...`).
- Componentes criados ou alterados.
- Estados de UI: Carregamento (Skeleton), Sucesso, Erro, Flag Desativada (`FeatureGate`).
- **Atenção:** Termos de hardware proibidos (potência, gpu, cluster bruto) NÃO devem aparecer em nenhum texto de UI.

---

## 6. Checklist de Homologação
- [ ] Implementação de código sem mocks conectada ao Convex/APIs reais.
- [ ] Feature Flag registrada e testada no console administrativo (`/dashboard/admin/flags`).
- [ ] Verificação de tipos TypeScript aprovada: `npx tsc --noEmit`.
- [ ] Atualização refletida no documento central [`specs/MASTER_SPEC.md`](file:///C:/dev/trinnsaas/specs/MASTER_SPEC.md).
