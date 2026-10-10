# SPEC: Landing Page de Alta Conversão & Ecossistema de Páginas Públicas (`copy.md`)
> **Status:** HOMOLOGADO EM PRODUÇÃO  
> **Data de Criação:** 2026-10-10  
> **Última Atualização:** 2026-10-10  
> **Autor / Agente Responsável:** Antigravity (Pair Programming)  
> **Feature Flag Associada:** `landing_page_offers_v2`

---

## 1. Objetivo & Justificativa de Negócio
- **Problema:** A plataforma precisava de uma linguagem unificada e de alta conversão para tráfego pago (Meta Ads, Google Ads) e orgânico, eliminando atritos entre o anúncio, a Home e as páginas públicas satélites (`/recursos`, `/precos`, `/comparativo`, `/sobre`). A premissa central é responder à dor real do criador: *"Por que assinar 5 ferramentas diferentes em dólar se você pode ter Imagens, Vídeos, Áudios e Textos em um só lugar?"*, apresentando com clareza as duas grandes ofertas da Kriativa (Recarga flexível a partir de R$ 5,00 e Assinatura Ilimitada por R$ 200,00/mês).
- **Usuário Alvo:** Criadores de conteúdo para redes sociais, social medias, empresas, empreendedores, profissionais criativos e entusiastas.
- **Impacto:** Máxima conversão de anúncios em cadastros sem cartão (`COMEÇAR GRÁTIS`), permitindo ativação imediata, nutrição e conversão posterior em créditos (a partir de R$ 5 via PIX) ou na assinatura ilimitada (R$ 200/mês).

---

## 2. Estrutura Canônica Integrada (`copy.md`)
1. [x] **Home (`/`) — Fluxo de Alta Conversão Meta Ads:**
   - **Hero:** "Todas as IAs que você precisa. Em um só lugar." + "Imagens. Vídeos. Áudios. Textos." + CTA "COMEÇAR GRÁTIS - Cadastro gratuito. Sem cartão de crédito."
   - **Seção "Por que assinar 5 ferramentas diferentes?":** Quebra da fragmentação (Midjourney + Runway + ElevenLabs + ChatGPT) mostrando os benefícios de uma única conta e interface.
   - **Seção de Produto (4 Motores Criativos):**
     - 🖼️ Kriativa Vision (Imagens)
     - 🎬 Kriativa Motion (Vídeos)
     - 🔊 Kriativa Voice (Áudios)
     - ✍️ Kriativa Mind (Textos)
   - **Seção "Escolha o Modelo":** Demonstração da curadoria inteligente de modelos open source e tecnologias de ponta ("Você escolhe o que quer criar. A Kriativa cuida da complexidade.").
   - **Seção "Comece sem Pagar":** Redução drástica de risco ("Você não precisa comprar nada para começar.").
   - **Seção de Ofertas & Planos:**
     - 🟦 **Créditos:** A partir de R$ 5 (20 créditos imediatos). Créditos não expiram, sem mensalidade.
     - 🟩 **Kriativa Ilimitada:** R$ 200/mês. Criação contínua nos modelos incluídos, cancele quando quiser.
   - **Seção "E se um modelo atingir o limite?":** Redirecionamento transparente e inteligente para modelos alternativos disponíveis para manter o usuário sempre criando.
   - **Manifesto & Tecnologia Aberta:** Tecnologia aberta + "Estamos construindo uma IA brasileira" ("Seu feedback pode mudar o produto").
   - **Público Alvo ("Para quem é?"):** Criadores, Social Media, Empresas, Empreendedores, Profissionais Criativos e Curiosos.
   - **Comparativo:** Várias plataformas ❌ vs Kriativa ✓.
   - **Roadmap Visual & Transparente:** 3 fases (No Ar, Q4 2026, Q1 2027).
   - **FAQ de Conversão:** Respostas diretas sobre preços, créditos vitalícios, modelo ilimitado, tecnologia brasileira e direitos comerciais.
   - **CTA Final:** "Pare de procurar qual IA usar. Comece a criar."
   - **Disclaimers Oficiais de Anúncios:** Conformidade jurídica com Meta, Google, TikTok e aviso sobre uso de IA e plano ilimitado.
   - **Sticky Bar Mobile:** Barra flutuante inferior com botão de ação rápida para tráfego mobile.

2. [x] **Recursos da Plataforma (`/recursos`):**
   - Apresentação completa dos 4 pilares (Vision, Motion, Voice, Mind) mais as ferramentas de direção cinemática (Câmera 3D, Inércia física, Cofre de Consistência de Atores, Lentes Anamórficas e Aspect Ratios).
   - "Você não precisa entender de modelos de IA": síntese dos 4 passos.
   - Callout das 2 ofertas (R$ 5 flexível ou R$ 200 ilimitado) e CTAs "COMEÇAR GRÁTIS".

3. [x] **Planos & Preços (`/precos`):**
   - Destaque hero com os cards das duas ofertas centrais de `copy.md`: 🟦 Créditos a partir de R$ 5 (20 créditos) e 🟩 Kriativa Ilimitada (R$ 200/mês).
   - Bloco "E se um modelo atingir o limite? Você não fica parado."
   - Pacotes de volume com desconto para produtoras e estúdios (Starter, Creator Pro, Director, Cinema Master).
   - Garantia de créditos vitalícios, liquidação instantânea via PIX em menos de 3 segundos e FAQ de faturamento.

4. [x] **Comparativo de IAs (`/comparativo`):**
   - Transição da comparação de apenas vídeos para a comparação do ecossistema completo: Várias plataformas separadas (5 assinaturas, R$ 600+/mês em dólar com IOF) vs Kriativa (uma conta, uma interface, R$ 5 a R$ 200/mês em reais).
   - Matriz comparativa técnica contra Runway, Midjourney, Sora e ElevenLabs.
   - FAQ de alta intenção otimizado para motores de busca e GEO.

5. [x] **Sobre & Manifesto (`/sobre`):**
   - Incorporação integral das Seções 11 e 12 de `copy.md`: "Tecnologia aberta. Plataforma brasileira." e "Estamos construindo uma IA brasileira."
   - Foco na cocriação com a comunidade de usuários e na erradicação de mensalidades abusivas e créditos que expiram.

6. [x] **Navegação & Rodapé Global (`PublicHeader` e `PublicFooter`):**
   - Cabeçalho limpo sem badges obsoletos (`v2.4 MOTION STUDIO`), com links diretos para Recursos, Ofertas (R$ 5 • R$ 200), Roadmap, Planos, Comparativo e Manifesto.
   - Rodapé com mapeamento dos 4 motores criativos, pacotes e ofertas, e inserção completa dos avisos legais de publicidade e conformidade de termos de IA.

7. [x] **Rota Dedicada `/lp` (`copy2.md`) com Disclaimers do Meta:**
   - Implementação em `src/app/lp/page.tsx` com suíte modular em `src/components/lp/`:
     - `LpHeader`: Topo com links e botão Começar Grátis.
     - `LpHero`: Primeira dobra ("Todas as IAs que você precisa. Em um só lugar.").
     - `LpPresentation`: Apresentação ("Sua próxima grande ideia começa aqui").
     - `LpTools`: As 4 ferramentas (Kriativa Vision, Motion, Voice, Mind).
     - `LpProblem`: O problema da fragmentação ("Chega de usar uma ferramenta diferente para cada tarefa").
     - `LpHowItWorks`: 4 passos para começar sem montar infraestrutura.
     - `LpDifferentials`: "Mais possibilidades. Menos complicação."
     - `LpDemos`: Vitrine interativa de imagens, vídeos, áudios e textos gerados.
     - `LpPricing`: Preços transparentes (R$ 5 avulso e R$ 200/mês ilimitado).
     - `LpTech`: Curadoria de diferentes tecnologias integradas.
     - `LpFaq`: Accordion com as 10 perguntas e respostas de `copy2.md`.
     - `LpFinalCta`: Chamada final de fechamento.
     - `LpFooter`: Rodapé com links e **Disclaimers Oficiais de Publicidade da Meta** (Meta Platforms, Inc., Instagram, Google LLC, tecnologias, termos do plano mensal e uso comercial).
     - `LpStickyBar`: Barra mobile inferior flutuante para conversão instantânea com 1 toque.

---

## 3. Modelo de Dados (Convex Schema)
A funcionalidade utiliza as tabelas existentes em `convex/schema.ts` sem necessidade de quebra de schema:
- `creditOrders`: Processamento de pedidos sob demanda (a partir de R$ 5,00) e pacotes de assinatura via PIX e Cartão de Crédito.
- `creditBalances`: Controle do saldo de créditos pagos, bônus e elegibilidade.
- `featureFlags`: Controle da chave `landing_page_offers_v2`.

---

## 4. Segurança, Antifraude & Governança
- **Feature Flag Obrigatória:** `landing_page_offers_v2` registrada em `DEFAULT_FEATURE_FLAGS` no arquivo `convex/featureFlags.ts`.
- **Nível de Acesso (RBAC):** Rotas públicas com autenticação e onboarding fluidos via Clerk.
- **Conformidade com a Regra 4 de AGENTS.md:** Zero menções a termos de hardware bruto (GPU, VRAM, H100, clusters, 48GB, 80GB) em toda a interface e cópia voltada ao usuário. Uso exclusivo de termos de cinema e estúdio ("motores de renderização", "instâncias de processamento", "resolução cinemática", "estúdio ativo").
- **Zero Mocks:** Fluxos conectados diretamente ao Clerk e Convex.

---

## 5. Checklist de Homologação
- [x] Implementação fiel da estrutura de `copy.md` em todas as páginas públicas.
- [x] Implementação fiel da estrutura de `copy2.md` na rota `/lp`.
- [x] Otimização Mobile 100% (Zero horizontal scroll, touch targets >= 44px, safe area insets para iOS, botões full-width responsivos).
- [x] Eliminação de menções duplicadas ao Studio para usuários autenticados.
- [x] Feature Flag `landing_page_offers_v2` registrada no backend Convex.
- [x] Verificação de tipos TypeScript aprovada: `npx tsc --noEmit` com 0 erros.
- [x] Varredura automatizada confirmando zero termos de hardware bruto na UI.
- [x] Atualização refletida no documento central `specs/MASTER_SPEC.md`.
