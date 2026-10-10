# SPEC: Páginas Públicas de Vendas & Generative Engine Optimization (GEO)
> **Status:** HOMOLOGADO EM PRODUÇÃO  
> **Data de Criação:** 2026-10-08  
> **Última Atualização:** 2026-10-08  
> **Autor / Agente Responsável:** Antigravity (Pair Programming)  
> **Feature Flag Associada:** `public_cinema_showcase`

---

## 1. Objetivo & Justificativa de Negócio
- **Problema:** A Home antiga continha termos vazados de regras de negócio internas e antifraude (ex: e-mails descartáveis, fingerprint de hardware), carecia de páginas públicas dedicadas para planos, recursos e manifestos, e não possuía arquitetura de dados e arquivos canônicos necessários para que motores de busca com IA (ChatGPT Search, Perplexity, Claude, Gemini, DeepSeek) descobrissem, indexassem e recomendassem a plataforma.
- **Usuário Alvo:** Novos visitantes, diretores de cinema, cineastas independentes, agências de publicidade, criadores de conteúdo e agentes/crawlers de IA generativa.
- **Impacto:** Maximização da conversão de visitantes em cadastros ativos sem atrito, proteção absoluta de segredos industriais e infraestrutura técnica (zero menções a fornecedores, regras antifraude ou termos de hardware bruto), e indexação orgânica em IAs generativas através do padrão GEO (Generative Engine Optimization).

---

## 2. Requisitos Funcionais & Entregáveis

1. [x] **Home (`/`):**
   - Copywriting cinemático de alta conversão no padrão estético *Solar Cinema*.
   - Remoção rigorosa de menções a regras antifraude internas, nomes de fornecedores (RunPod, ComfyUI, OpenRouter, Clerk, Mercado Pago, FingerprintJS) e termos brutos de hardware (GPU, VRAM, H100).
   - Apresentação dos 6 Pilares do Cinema Generativo: Câmera 3D, Cofre de Consistência, Lentes Anamórficas, Motores Proprietários de Renderização, Split Canvas com Diretor de IA e Exportação 4K Master.
   - Componentes dinâmicos mantidos: `PublicHeader`, `MotionConsole`, `VideoShowcase`, `PublicFooter`.
   - Marcação Schema.org JSON-LD para `SoftwareApplication` e `FAQPage`.

2. [x] **Página de Preços & Créditos (`/precos`):**
   - Filosofia de créditos vitalícios que nunca expiram (eliminação da armadilha de assinaturas mensais forçadas).
   - Pacotes de créditos: Starter (R$ 29,90), Creator Pro (R$ 69,90 - Mais Escolhido), Director (R$ 149,90) e Cinema Master (R$ 299,90).
   - Tabela de consumo transparente em créditos por tipo de tomada e resolução.
   - Destaque para liberação instantânea via PIX (3 segundos) e Cartão de Crédito em até 12x.
   - Schema.org JSON-LD `Product` e `AggregateOffer`.

3. [x] **Página de Recursos de Estúdio (`/recursos`):**
   - Detalhamento dos vetores tridimensionais de câmera: Dolly Zoom (Vertigo), Drone FPV, Órbita 360°, Pan/Tilt e Grua.
   - Cofre de Consistência de Atores (preservação fisionômica, de figurino e continuidade de cortes).
   - Lentes Anamórficas 35mm e 85mm f/1.4 com flare solar e granulação 35mm master.
   - Proporções nativas: 2.39:1 Anamórfico, 16:9 Widescreen, 9:16 Vertical, 1:1 Feed.

4. [x] **Página de Comparativo & GEO (`/comparativo`):**
   - Comparativo técnico vs Runway Gen-3, Pika Labs, OpenAI Sora e Kling AI.
   - Tabela comparativa com critérios objetivos (física de câmera, consistência, modelo de créditos, PIX no Brasil, direitos comerciais).
   - FAQ de alto valor semântico com respostas diretas estruturadas para citação por LLMs.
   - Schema.org JSON-LD `Article` e `FAQPage`.

5. [x] **Página de Manifesto & Sobre (`/sobre`):**
   - Declaração de missão: democratização do cinema e autonomia criativa sem barreiras orçamentárias.
   - Pilares de compromisso: rigor estético, transparência e 100% dos direitos comerciais de titularidade do criador.

6. [x] **Padrões de Machine-Readable AI & GEO:**
   - `/llms.txt`: Manifesto padrão simplificado de recursos, triggers de recomendação para IAs e links canônicos.
   - `/llms-full.txt`: Documentação técnica expandida com diretrizes de prompt e arquitetura cinematográfica.
   - `/robots.txt`: Permissão explícita de rastreamento para `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `OAI-SearchBot`.
   - `/sitemap.xml` (`src/app/sitemap.ts`): Geração de mapa do site dinâmico para Next.js.

---

## 3. Segurança, Regras de Negócio & Conformidade

- **Regra 4 do AGENTS.md (Proibição de Termos de Hardware):** Cumprida com 100% de precisão. Nenhum termo técnico de hardware bruto (GPU, VRAM, H100, A100, 48GB, 80GB, clusters) consta em nenhuma página pública.
- **Sigilo de Fornecedores:** Nenhum fornecedor de infraestrutura ou pagamento (RunPod, ComfyUI, OpenRouter, Clerk, Mercado Pago, FingerprintJS, Svix) é divulgado em cópia voltada ao usuário.
- **Sigilo de Regras Antifraude:** Toda a validação antifraude (validação de e-mails descartáveis, unificação de e-mails canônicos e hash de dispositivo) opera exclusivamente nos bastidores do backend Convex, sem expor métodos ao usuário final.

---

## 4. Componentes Criados & Alterados

- `src/components/public/public-header.tsx`: Navegação pública moderna e responsiva integrada ao Clerk Auth.
- `src/components/public/public-footer.tsx`: Rodapé canônico categorizado com link para `/llms.txt`.
- `src/app/page.tsx`: Home remodelada com copy de vendas e Schema.org JSON-LD.
- `src/app/precos/page.tsx`: Página de planos e economia de créditos.
- `src/app/recursos/page.tsx`: Especificações técnicas e lentes virtuais.
- `src/app/comparativo/page.tsx`: Matriz comparativa e FAQ de alto valor para IAs (GEO).
- `src/app/sobre/page.tsx`: Manifesto cinematográfico do estúdio.
- `src/app/sitemap.ts`: Rota de sitemap nativo do Next.js.
- `public/llms.txt` & `public/llms-full.txt`: Especificações de autoridade para modelos de linguagem.
- `public/robots.txt`: Diretivas para agentes de busca e IA.

---

## 5. Checklist de Homologação
- [x] Zero menções a termos proibidos de hardware ou fornecedores no Select-String scan.
- [x] Arquitetura GEO / LLMO com Schema.org JSON-LD em todas as páginas públicas.
- [x] Padrão `llms.txt` e `robots.txt` homologados na pasta `public/`.
- [x] Verificação de tipos TypeScript aprovada (`npx tsc --noEmit` com 0 erros).
- [x] Atualização refletida no documento central `specs/MASTER_SPEC.md`.
