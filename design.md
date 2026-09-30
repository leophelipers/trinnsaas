# Design System — kriativa.app
> **Identidade Visual, Estilo e Tokens de Design para o concorrente do Higgsfield AI.**

---

## 1. Visão Geral & Posicionamento

* **Nome do Produto**: `kriativa.app`
* **Nicho**: Plataforma de geração de vídeo, movimento e cinema com Inteligência Artificial generativa.
* **Concorrente de Referência**: **Higgsfield AI** (*higgsfield.ai*), Runway Gen-3, Luma Dream Machine e Sora.
* **Conceito / Estética Central**: **"Neo-Cinema & Solar Flare"**.
  - O design combina a precisão técnica de uma câmera de cinema profissional (*ARRI/RED/Panavision*) com o visual editorial escultural e vanguardista de marcas de luxo e streetwear futurista.
  - O produto vive em **Dark Mode absoluto (Obsidian Black)**: telas escuras e profundas fazem os vídeos e animações geradas saltarem aos olhos com contraste máximo e saturação cinematográfica.
  - A cor de destaque é o **Solar Flare Orange (`#FF5500`)**, evocando luz incandescente de estúdio, lenses anamórficas e calor criativo, sem o desgaste visual de tons verde/amarelo neon.

---

## 2. Paleta de Cores (Color Tokens)

A paleta de `kriativa.app` é construída sobre o contraste dramático entre preto obsidiana OLED e o calor do **Solar Flare Orange**, pontuado por reflexos de **Anamorphic Cyan**.

### 2.1 Cores Principais

| Nome do Token | Hex | OKLCH | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Obsidian Pitch** (Background) | `#050506` | `oklch(0.11 0.005 260)` | Fundo da aplicação e do canvas de vídeo |
| **Onyx Surface** (Card / Sidebar) | `#0C0D12` | `oklch(0.15 0.008 260)` | Cards, sidebar, painéis flutuantes e modais |
| **Carbon Elevated** (Hover / Muted) | `#16171E` | `oklch(0.20 0.015 260)` | Elementos elevados, hover states, inputs |
| **Solar Flare Orange** (Primary Accent) | `#FF5500` | `oklch(0.68 0.24 38)` | Botão "Generate Motion", badges ativas, foco de alta energia |
| **Anamorphic Cyan** (Secondary Accent) | `#00E5FF` | `oklch(0.78 0.18 205)` | Vetores de câmera 3D, trajetórias de drone e flares |
| **Cinema Violet** (Tertiary) | `#8B5CF6` | `oklch(0.65 0.23 290)` | Badges de modelo Pro, brilhos holográficos, filtros IA |
| **Pure White** (Foreground) | `#F8FAFC` | `oklch(0.985 0 0)` | Títulos principais, texto em destaque |
| **Muted Slate** (Text Muted) | `#94A3B8` | `oklch(0.70 0.02 250)` | Legendas, metadados secundários, descrições |
| **Glass Border** | `rgba(255,255,255,0.12)` | `oklch(1 0 0 / 12%)` | Bordas ultrafinas nítidas de cards, inputs e divisores |

### 2.2 Estados & Feedback

* **Sucesso / Render Concluído**: `#10B981` (Neon Emerald)
* **Processando / Renderizando**: `#FF5500` (Solar Pulse / Shimmer)
* **Aviso / Cota Baixa**: `#F59E0B` (Amber Flare)
* **Erro / Bloqueio**: `#EF4444` (Laser Crimson)

---

## 3. Tipografia

A tipografia é o diferencial que transforma a interface em um **estúdio editorial de alta cultura**:

### 3.1 Famílias Tipográficas

1. **Display & Headings**: `Syne` (Google Fonts)
   - **Estilo**: Pesos `Bold` (700) e `ExtraBold` (800) com *letter-spacing* levemente reduzido (`tracking-tight` ou `-0.03em`) e caixa alta (`uppercase`) em títulos principais.
   - **Personalidade**: Letras esculturais, modernas e com presença marcante imediata.
2. **Subheadings & Botões**: `Space Grotesk`
   - **Estilo**: Pesos `Medium` (500) e `SemiBold` (600). Traz uma estética neo-brutalista e técnica de estúdio.
3. **Body & Interface**: `Geist Sans`
   - **Estilo**: Pesos `Regular` (400) e `Medium` (500), excelente legibilidade em fundos escuros e em telas de qualquer resolução.
4. **Telemetria de Câmera & Código**: `Geist Mono`
   - **Uso Obrigatório**: Para parâmetros de renderização de vídeo, e.g.:
     - Resolução: `1080p`, `4K UHD`
     - Aspect Ratio: `16:9`, `9:16`, `2.39:1`
     - FPS: `24 FPS`, `60 FPS`
     - Trajetória de Câmera: `PAN 45°`, `ZOOM IN 1.8X`, `TILT UP`
     - Seed e Motion Buckets: `SEED: 884192`, `MOTION: 7.5`

### 3.2 Escala de Texto

* **Hero Display**: `text-4xl sm:text-6xl md:text-8xl font-heading font-extrabold uppercase tracking-tight`
* **Seções / H2**: `text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight`
* **Cards / H3**: `text-base sm:text-lg font-heading font-bold`
* **Corpo Geral**: `text-sm sm:text-base text-muted-foreground font-sans leading-relaxed`
* **HUD / Badges / Parâmetros**: `text-[11px] sm:text-xs font-mono uppercase tracking-wider`

---

## 4. Linguagem Visual & Componentes Característicos

Seguindo o padrão de plataformas de vídeo como Higgsfield, o `kriativa.app` adota os seguintes elementos:

### 4.1 HUD Cinematográfico (Camera & Motion Badges)
Badges estilizados com aparência de display de visor de câmera:
```tsx
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-[11px] text-muted-foreground">
  <span className="size-2 rounded-full bg-[#FF5500] animate-pulse" />
  <span className="text-white font-medium">[REC] 4K UHD</span>
  <span className="text-white/20">•</span>
  <span>60 FPS</span>
  <span className="text-white/20">•</span>
  <span className="text-[#FF5500]">3D MOTION DYNAMICS</span>
</div>
```

### 4.2 Prompt Bar Flutuante com Seletores Rápidos
Uma barra de comando na parte inferior ou central do estúdio:
* Campo de texto com suporte a expansão automática e comandos rápidos.
* Seletores de Aspect Ratio com ícones visuais (`16:9` widescreen, `9:16` vertical reels/tiktok, `1:1` quadrado, `2.39:1` cinema).
* Seletor de Câmera: *Dynamic Orbit*, *Drone Flythrough*, *FPV Chase*, *Dolly Zoom (Vertigo)*.
* Botão de Ação Primária: **"Generate Motion"** estilizado em **Solar Flare Orange (`#FF5500`)** com brilho incandescente.

### 4.3 Cards de Vídeo com Auto-Play em Hover
* Proporções de aspecto fixas (`aspect-video`, `aspect-[9/16]`, `aspect-square`).
* Bordas com micro-brilho reativo no hover (`hover:border-[#FF5500]/50 transition-all`).
* Overlay gradual com botões de remix, download e parâmetros de prompt.

---

## 5. Implementação no Tailwind CSS v4 (`src/app/globals.css`)

```css
@theme inline {
  --color-solar: #FF5500;
  --color-cyan-flare: #00E5FF;
  --font-heading: var(--font-syne), sans-serif;
  --font-sans: var(--font-space-grotesk), var(--font-geist-sans), sans-serif;
  --font-mono: var(--font-geist-mono), monospace;
}

:root,
.dark {
  --background: oklch(0.11 0.005 260);          /* #050506 */
  --foreground: oklch(0.985 0 0);                /* #F8FAFC */
  --card: oklch(0.15 0.008 260);                 /* #0C0D12 */
  --primary: oklch(0.68 0.24 38);                /* #FF5500 */
  --primary-foreground: oklch(0.99 0 0);
  --accent: oklch(0.78 0.18 205);                /* #00E5FF */
  --border: oklch(1 0 0 / 12%);
  --ring: oklch(0.68 0.24 38);
}
```
