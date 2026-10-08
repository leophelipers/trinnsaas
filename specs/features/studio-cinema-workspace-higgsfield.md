# SPEC: KRIATIVA CINEMA STUDIO WORKSPACE (HIGGSFIELD-STYLE & CONSISTENCY ECOSYSTEM)
> **Status:** ATIVO & HOMOLOGADO — V3.1 CINEMA STUDIO  
> **Versão da Spec:** 3.1.0  
> **Data de Criação:** 2026-10-01  
> **Última Atualização:** 2026-10-01  
> **Autores:** Kriativa Core Team & Film Architecture  
> **Feature Flag Mestre:** `studio_generation_hub`  
> **Feature Flags Integradas:** `studio_projects_management`, `studio_elements_consistency`, `studio_prompt_enhancer`, `studio_batch_generation`

---

## 1. Visão Geral do Produto & Arquitetura

O **Kriativa Cinema Studio** é a evolução do Kriativa.app para um **Ambiente Integrado de Produção Cinematográfica (IDE Audiovisual)** inspirado no padrão de excelência de ferramentas como **Higgsfield Cinema Studio**, Runway Gen-3 e Krea.

O ambiente é composto por módulos fundamentais interconectados:
1. **Workspace Dedicado com Sidebar Própria:** Layout full-viewport imersivo (obsidian dark `#08090C`), com navegação específica para diretores (Projetos, Cofre, Elementos `@`, Roteiros e Parâmetros).
2. **Projetos como Pastas Organizadoras:** Modelagem limpa e enxuta onde o projeto serve exclusivamente como contêiner organizacional (apenas Nome e Descrição), guardando imagens, vídeos, trilhas sonoras e roteiros.
3. **Modais de Presets Cinematográficos com Exemplos:** Enquadramento de Câmera, Movimentos, Lentes e Iluminação operam através de modais ricos com descrições visuais de cada técnica de cinema. O usuário pode desmarcar a qualquer momento ("Nenhum / Remover"), e cada seleção compõe o prompt de forma dinâmica e reativa.
4. **Dock Flutuante de Criação Espaçoso & Ergonômico:** Área de digitação generosa, abas de modo Vídeo/Imagem, tags ativas removíveis, seletor de duração até 15s (3s, 5s, 10s, 15s), slots de referência e cálculo dinâmico e transparente de créditos.
5. **Reaproveitamento de Mídias Geradas (Vault Picker):** O usuário pode usar qualquer imagem gerada anteriormente no estúdio como quadro inicial para animação I2V ou morphing, com um clique a partir do Showreel, do Cofre (Vault) ou do modal seletor do Dock.
6. **Modo Cinema com Minimizar Console & Fita de Cenas (Filmstrip):** Botão para recolher o console de criação para uma barra ultra-compacta na base da tela, liberando o palco principal para visualização das mídias em escala ampla (`max-w-5xl`) e permitindo navegar pelas gerações recentes na fita de cenas horizontal com 1 clique.
7. **Air-Gap Security & Anti-Bypass Guard:** Os endpoints do RunPod e credenciais são 100% blindados no servidor; nenhuma chave ou endpoint é exposto ao browser, e toda geração exige retenção atômica de créditos em escrow no banco Convex antes do despacho.

---

## 2. Air-Gap Security & Blindagem Contra Bypass

Para garantir que nenhum usuário consiga invocar os clusters de renderização sem pagar os créditos devidos:
1. **Isolamento de Credenciais:** `RUNPOD_API_KEY` e IDs de endpoints serverless existem exclusivamente nas variáveis de ambiente do servidor.
2. **Escrow Obrigatório:** A rota `/api/studio/generate` exige `generationId`. Ela consulta o Convex e confirma que:
   - A geração pertence ao usuário autenticado (`clerkId === identity.subject`).
   - O status é `queued`.
   - Os créditos foram efetivamente debitados da carteira do usuário (`creditsCharged > 0` e transação gravada no ledger).
3. **Cancelamento e Estorno Atômico:** Em caso de falha imediata ou cancelamento pelo usuário, o estorno é processado via mutation interna autenticada com segredo de servidor.

---

## 3. Melhorador de Prompt com IA por Motor Específico (Prompt Enhancer)

O endpoint `/api/studio/enhance-prompt` utiliza modelos de ponta via OpenRouter para transformar ideias simples em direções de cena cinematográficas profissionais, calibradas para a arquitetura de tensores de cada motor:

- **Para Krea-2 Turbo (T2I):** Enfatiza ótica de médio formato (Hasselblad), iluminação de estúdio comercial, detalhes de pele, texturas táteis e claridade anamórfica 8k.
- **Para FastH3 (T2V / I2V):** Enfatiza vetores de movimento dinâmicos, fluidez de câmera e **pistas de sonoplastia nativa** (sons ambientes, foley e ritmo de trilha sonora).
- **Para LTX-2.5 Distilled HD:** Enfatiza cadência de 24fps cinematográfica, granulação orgânica de película 35mm (Kodak Vision3) e profundidade de campo rasa com flares horizontais.

---

## 4. O Sistema de Consistência (`@mentions`)

Ao digitar `@` no dock de prompt:
- Um popover de autocomplete sugere os elementos cadastrados no projeto ativo:
  - `@Elena` ➔ Injeta a descrição canônica de rosto, idade e roupas, mais o `referenceImageStorageId` facial.
  - `@CyberCar` ➔ Injeta especificações exatas do veículo.
  - `@BarNeon` ➔ Injeta a arquitetura interior e iluminação padrão do cenário.
  - `@Kodak35mm` ➔ Injeta granulação, paleta de cores e perfil de lente.

---

## 5. Dock Flutuante de Criação: Parâmetros & Duração Suportada

| Parâmetro | Opções Disponíveis | Comportamento no Pipeline |
| :--- | :--- | :--- |
| **Modo** | `Vídeo Cinemático` / `Síntese de Imagem` | Alterna nós entre Krea, FastH3 e LTX |
| **Duração** | `3s`, `5s`, `10s`, `15s` | Escala frames de renderização e calcula créditos progressivos |
| **Câmera & Enquadramento** | Extreme Close-Up, Close-Up, Plano Médio, Plano Americano, Plano Geral, Low-Angle, High-Angle, POV, Nenhum | Modal com exemplos visuais; compõe diretamente no prompt |
| **Movimento de Câmera** | Push-in, Pull-out, Orbit 360°, Tracking Shot, Crane, Pan Lateral, Dutch Angle, Handheld, Dolly Zoom, Whip Pan, Nenhum | Modal com exemplos visuais; compõe diretamente no prompt |
| **Lente & Óptica** | 35mm Prime, 50mm f/1.4, 85mm Portrait, 24mm Wide, 70mm Anamorphic, Macro 100mm, 200mm Tele, Nenhum | Modal com exemplos visuais; compõe diretamente no prompt |
| **Iluminação** | Golden Hour, Cyberpunk Neon, Film Noir, Estúdio 3-Pontos, Rembrandt, Luz Suave Difusa, Moonlight Azul, Nenhum | Modal com exemplos visuais; compõe diretamente no prompt |
| **Proporção** | 16:9, 9:16, 1:1, 2.39:1 CinemaScope, 4:3 | Ajusta dimensões em múltiplos de 16px |
| **Qualidade** | 480p Preview, 720p HD, 1080p Master, 4K Master | Define resolução e taxa de bits |
| **Batch** | 1x1, 1x2, 2x2 | Multiplica a quantidade de renders gerados |
| **Input Image / Ref** | Upload Local ou Seleção do Cofre de Gerações | Aloca como quadro inicial I2V ou referência |

---

## 6. Feed Contínuo de Produção da Sessão (Session Production Grid)

Em vez de limitar a área de trabalho a apenas uma cena em destaque, o Kriativa Studio adota um **Feed Contínuo de Produção**:
- **Visibilidade Integral:** Todas as gerações recentes da sessão e do projeto ativo aparecem organizadas em uma grade dinâmica e responsiva.
- **Filtros Imediatos:** Abas com contadores em tempo real (`Todas`, `Vídeos`, `Imagens`).
- **Card de Processamento Ativo:** Quando uma geração é disparada, um card animado em gradiente âmbar `#FF5500` pulsa no topo da grade exibindo o status de alocação de nós e processamento de tensores, permitindo cancelamento com estorno imediato.
- **Interatividade nos Cards de Cena:**
  - **Reprodutor Integrado de Vídeo:** Com controles nativos de reprodução e scrubber.
  - **Badges Cinemáticas:** Proporção, duração em segundos, áudio sincronizado e motor de renderização.
  - **Ações Imediatas:** "Animar I2V" (carrega imagem e prompt diretamente no dock), "Remixar" (copia prompt e parâmetros para o dock), "Copiar Prompt" e "Baixar Arquivo".
  - **Modo Cinema / Theater:** Botão de expandir para visualização imersiva em tela cheia com alta fidelidade.
- **Espaço Expansivo com Dock Minimizado:** Ao clicar no botão de minimizar o console de criação, o feed ganha 100% da amplitude visual da tela, organizando-se em até 5 colunas fluidas.

---

## 7. Modelo Econômico e Calibração de Créditos Baseada em Cold Start Real

Para proteger as margens da plataforma contra a variabilidade do tempo de alocação de instâncias em nuvem (RunPod Serverless), o cálculo de créditos foi estipulado considerando o **tempo médio de execução sob Cold Start** (inicialização do pod + montagem do volume + carregamento dos checkpoints ComfyUI + inferência):

| Motor Cinemático | Duração / Resolução | Tempo Cold Start Médio | Créditos Cobrados | Proteção de Margem |
| :--- | :--- | :--- | :--- | :--- |
| **Krea-2 Turbo** | Imagem 1024x1024 (T2I) | ~18s - 20s | **2 créditos** | > 80% margem bruta |
| **FastH3 i2v / 480p** | Vídeo 3s com Áudio | ~45s - 55s | **6 créditos** | > 75% margem bruta |
| **FastH3 i2v / 480p** | Vídeo 5s com Áudio | ~65s - 75s | **8 créditos** | > 75% margem bruta |
| **FastH3 i2v / 480p** | Vídeo 10s com Áudio | ~100s - 110s | **14 créditos** | > 70% margem bruta |
| **FastH3 i2v / 480p** | Vídeo 15s com Áudio | ~130s - 140s | **20 créditos** | > 70% margem bruta |
| **FastH3 t2v 720p HD** | Vídeo 3s HD com Áudio | ~75s - 85s | **14 créditos** | > 75% margem bruta |
| **FastH3 t2v 720p HD** | Vídeo 5s HD com Áudio | ~95s - 105s | **18 créditos** | > 75% margem bruta |
| **FastH3 t2v 720p HD** | Vídeo 10s HD com Áudio | ~150s - 160s | **26 créditos** | > 72% margem bruta |
| **FastH3 t2v 720p HD** | Vídeo 15s HD com Áudio | ~200s - 210s | **34 créditos** | > 70% margem bruta |
| **LTX-2.5 Distilled HD** | Vídeo 5s (22B Transformer) | ~200s - 220s | **30 créditos** | > 75% margem bruta |
| **LTX-2.5 Distilled HD** | Vídeo 10s (22B Transformer) | ~270s - 290s | **42 créditos** | > 75% margem bruta |
| **LTX-2.5 Distilled HD** | Vídeo 15s (22B Transformer) | ~350s - 370s | **55 créditos** | > 75% margem bruta |

A função `calculateRequiredCredits(engine, duration, batch)` atua no servidor Convex como **barreira de segurança mandatória** dentro da mutation `createGeneration`, impedindo qualquer discrepância ou envio de valores defasados pelo cliente.

---

## 8. Execução Paralela de Batch & Diferenciação Estrita Imagem vs Vídeo

### 8.1 Disparo Paralelo de Lotes (Batch Real)
Quando o criador seleciona um batch de $N$ cenas (ex: $N = 4$):
1. O cliente divide o total de créditos uniformemente por cena ($C_{\text{item}} = \frac{C_{\text{total}}}{N}$).
2. São disparadas **$N$ mutações independentes** `createGenerationMutation` no Convex, cada uma com uma semente aleatória única (`seed: Math.floor(Math.random() * 2147483647)`), garantindo variações criativas autênticas.
3. O servidor despacha **$N$ requisições paralelas** aos endpoints do RunPod via `/api/studio/generate`, recebendo $N$ `jobId`s distintos.
4. Cada job é monitorado individualmente via polling assíncrono. À medida que cada nó finaliza a renderização, a cena surge de imediato no feed de produção em tempo real.
5. Em caso de cancelamento pelo criador, a rotina `handleCancelGeneration` estorna atomicamente todas as solicitações ativas do lote.

### 8.2 Diferenciação Dinâmica entre Vídeo e Imagem
- **No Modo Imagem:**
  - O console oculta controles irrelevantes para mídia estática (duração em segundos, sonoplastia nativa, morphing de último quadro e movimentos de câmera).
  - A barra de direção disponibiliza: **Composição Fotográfica**, **Lente & Óptica**, **Iluminação** e **Estilo Fotográfico & Textura** (Vogue Editorial, Kodak Portra 35mm, Hasselblad 8K, Fine Art P&B, Render 3D Octane).
  - O seletor de motores prioriza o **Krea-2 Turbo**.
- **No Modo Vídeo:**
  - Exibe seletores de duração até 15s (`3s`, `5s`, `10s`, `15s`), campo de sonoplastia nativa e morphing de transição de quadros.
  - A barra de direção foca em: **Enquadramento**, **Movimento de Câmera 3D**, **Lente Anamórfica/Cinema** e **Iluminação de Cinema**.
  - Todos os modais exibem **exemplos práticos de cenas consagradas do cinema mundial** e wireframes visuais explicativos.


