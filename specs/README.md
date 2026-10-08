# Diretório de Especificações Técnicas (Specs) — Kriativa.app

Este diretório contém a documentação viva e autoritativa de arquitetura, módulos e governança do **Kriativa.app**.

---

## 📁 Estrutura de Arquivos

```
specs/
├── MASTER_SPEC.md                 # Especificação Master completa de todo o sistema
├── README.md                      # Este arquivo (Diretrizes de Governança e Documentação)
├── templates/
│   └── FEATURE_SPEC_TEMPLATE.md   # Template obrigatório para novas funcionalidades
└── features/                      # Especificações detalhadas por funcionalidade individual
    └── (specs específicas de cada épico ou feature)
```

---

## 🔄 Protocolo de Documentação Periódica

Toda vez que uma nova funcionalidade for planejada, desenvolvida ou modificada, deve-se seguir o seguinte ciclo:

### 1. Antes do Código (Fase de Planejamento)
- Crie um arquivo em `specs/features/<nome-da-feature>.md` baseado em `specs/templates/FEATURE_SPEC_TEMPLATE.md`.
- Defina os requisitos de negócio, modelo de dados no Convex, requisitos de segurança (RBAC, antifraude), e a respectiva **Feature Flag**.

### 2. Durante o Desenvolvimento
- Siga rigorosamente o padrão de Feature Flags:
  1. Registre a flag em `convex/schema.ts` e `DEFAULT_FEATURE_FLAGS` em `convex/featureFlags.ts`.
  2. Implemente a validação no servidor via `assertFeatureFlag(ctx, "sua_flag")`.
  3. No cliente, utilize o hook `useFeatureFlags()` ou o componente `<FeatureGate />`.
  4. Registre logs de auditoria significativos em `systemLogs`.

### 3. Após a Conclusão (Fase de Homologação)
- Atualize o arquivo central [`specs/MASTER_SPEC.md`](file:///C:/dev/trinnsaas/specs/MASTER_SPEC.md):
  - Incremente o número da versão da Spec (ex: `2.4.0` -> `2.5.0`).
  - Adicione o novo módulo à seção 5 e os novos campos/tabelas à seção 4.
  - Atualize a matriz de rotas e feature flags.
- Execute verificação estrita de TypeScript: `npx tsc --noEmit`.
- Garanta que nenhum mock foi deixado no código.
- Certifique-se de que termos proibidos para o usuário final (como hardware bruto ou potência) não foram utilizados na interface.
