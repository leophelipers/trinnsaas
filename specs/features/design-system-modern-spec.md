# SPEC: Novo Design System (Convex, Clerk & shadcn/ui)
> **Status:** HOMOLOGADO  
> **Data de Criação:** 2026-10-30  
> **Última Atualização:** 2026-10-30  
> **Autor / Agente Responsável:** Antigravity  
> **Feature Flag Associada:** `design_system_preview_enabled`

---

## 1. Objetivo & Justificativa de Negócio
- **Problema:** A plataforma utilizava uma linguagem visual de alto contraste e saturação (Solar Cinema com laranja expressivo), demandando uma evolução para uma estética mais corporativa, elegante e profissional inspirada nos principais referenciais de ferramentas para desenvolvedores: a arquitetura e reatividade do **Convex**, o polimento e segurança do **Clerk**, e o minimalismo de componentes do **shadcn/ui**.
- **Público-Alvo:** Desenvolvedores, criadores de cinema, operadores de estúdio e administradores.
- **Impacto:** Elevação da percepção de valor corporativo, redução de fadiga visual em longas sessões de criação, facilidade de manutenção de componentes primitivos e alinhamento com os padrões modernos de software de inteligência artificial.

---

## 2. Requisitos Funcionais
1. [x] **Página Interativa `/desingsystem` (e `/designsystem`):** Showcase interativo com visualização ao vivo de 4 presets: *Convex Reactive*, *Clerk Slate & Indigo*, *shadcn/ui Pure Zinc* e o atual *Solar Cinema*.
2. [x] **Biblioteca de Componentes Primitivos:** Exibição dinâmica de botões, tags reativas, indicadores de sincronização em tempo real (Convex Live Sync), formulários de busca com atalho ⌘K, campos de chaves de API com cópia em 1 clique e switches táteis.
3. [x] **Composições de Telas Reais:** Demonstração prática de como cartões de monitoramento de motores de renderização, perfis de desenvolvedores e projetos cinematográficos se comportam com a nova identidade visual.
4. [x] **Studio Workspace em Tela Completa (`ChatWorkspaceFull`):** Experiência imersiva 100vh com chat reativo multi-turn, raciocínio lógico colapsável, envio interativo de mensagens com atalho `Enter ↵` e 4 artefatos de produção:
   - *Artefato 1 (React):* `CameraAnamorphicPlayer.tsx` (HUD de Câmera 3D, controle de aspecto 2.39:1 / 16:9 / 9:16, distância focal 24-135mm e temperatura de cor).
   - *Artefato 2 (Markdown):* `Decupagem_Cena_04_NeoTokyo.md` (Roteiro e decupagem técnica de set cinemático).
   - *Artefato 3 (GLSL):* `AnamorphicStreak.glsl` (Fragment Shader de aberração cromática e flares horizontais).
   - *Artefato 4 (React Widget):* `StudioTelemetryWidget.tsx` (Métricas de vazão de tokens, latência reativa de 11ms e motores conectados).
5. [x] **Catálogo de Tokens e Código CSS:** Exportador de variáveis CSS (`globals.css`) e paleta de cores para aplicação progressiva no estúdio.

---

## 3. Segurança, Antifraude & Governança de UI
- **Conformidade Terminológica:** Proibição estrita de menções diretas a hardware bruto (GPU, VRAM, clusters). Uso exclusivo de terminologia de estúdio: "motores de renderização", "instâncias de processamento", "resolução cinemática" e "estúdio ativo".
- **Zero Mocks:** Elementos de UI refletem as entidades reais da plataforma (modelos `kriativa-code`, chaves `krt_live_...`, livro-razão de créditos e instâncias ativas).

---

## 4. Arquivos Envolvidos
- [`src/components/designsystem/chat-workspace-full.tsx`](file:///C:/dev/kriativa.app/src/components/designsystem/chat-workspace-full.tsx): Workspace completo do Studio em tela cheia (100vh) com chat interativo e 4 artefatos.
- [`src/components/designsystem/chat-artifacts-preview.tsx`](file:///C:/dev/kriativa.app/src/components/designsystem/chat-artifacts-preview.tsx): Componente modular de visualização de artefatos.
- [`src/app/desingsystem/page.tsx`](file:///C:/dev/kriativa.app/src/app/desingsystem/page.tsx): Página de showcase do Design System com alternância entre Workspace e Catálogo.
- [`src/app/desingsystem/workspace/page.tsx`](file:///C:/dev/kriativa.app/src/app/desingsystem/workspace/page.tsx): Rota dedicada direta para o Studio Workspace em tela cheia.
- [`src/app/designsystem/page.tsx`](file:///C:/dev/kriativa.app/src/app/designsystem/page.tsx): Rota canônica reexportada para prevenir erros de digitação.
- [`specs/MASTER_SPEC.md`](file:///C:/dev/kriativa.app/specs/MASTER_SPEC.md): Registro da especificação do design system.
