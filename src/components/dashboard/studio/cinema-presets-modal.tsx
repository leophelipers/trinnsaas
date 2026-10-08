"use client";

import React, { useState } from "react";
import {
  Camera,
  Aperture,
  Sun,
  Maximize2,
  X,
  Check,
  Sparkles,
  Film,
  Eye,
  Sliders,
  Play,
  Palette,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type PresetCategory = "camera" | "motion" | "lens" | "lighting" | "style";

export interface CinemaPresetItem {
  id: string;
  category: PresetCategory;
  name: string;
  sub: string;
  description: string;
  exampleScene: string;
  visualDiagram: string;
  promptSnippet: string;
  tagLabel: string;
  iconName?: string;
  badge?: string;
}

export const CINEMA_PRESETS: Record<PresetCategory, CinemaPresetItem[]> = {
  motion: [
    {
      id: "push_in",
      category: "motion",
      name: "Push-In (Aproximação Dramática)",
      sub: "Dolly forward em direção ao assunto",
      description:
        "A câmera avança suavemente em direção ao ponto focal, intensificando a emoção, o suspense ou a revelação de um detalhe íntimo.",
      exampleScene:
        "O Iluminado (Kubrick) — Aproximação lenta e sufocante pelo corredor do hotel até fechar no olhar em choque do protagonista.",
      visualDiagram: "➔ [ PUSH-IN DOLLY ]",
      promptSnippet:
        "slow push-in camera movement, dramatic forward dolly motion, cinematic focus pull",
      tagLabel: "Push-In",
      badge: "Popular",
    },
    {
      id: "pull_out",
      category: "motion",
      name: "Pull-Out (Recuo Revelador)",
      sub: "Dolly backward afastando-se da cena",
      description:
        "A câmera se afasta do assunto, revelando o ambiente circundante, a solidão ou a escala monumental do cenário.",
      exampleScene:
        "Bastardos Inglórios — A câmera recua do plano fechado na mesa até revelar que a casa inteira está cercada pelo exército.",
      visualDiagram: "⬅ [ PULL-OUT REVEAL ]",
      promptSnippet:
        "slow pull-out camera movement, revealing wide shot, backward dolly zoom",
      tagLabel: "Pull-Out",
    },
    {
      id: "orbit_360",
      category: "motion",
      name: "Orbit 360° (Giro Cinemático)",
      sub: "Rotação contínua ao redor do assunto",
      description:
        "A câmera orbita fluidamente ao redor do personagem ou objeto central, gerando dinamismo tridimensional e sensação de momento épico.",
      exampleScene:
        "Matrix / Vingadores — Giro orbital contínuo ao redor do herói cercado no centro da batalha, com perspectiva e paralaxe tridimensional.",
      visualDiagram: "⟳ [ ORBIT 360° PARALLAX ]",
      promptSnippet:
        "360 degree orbiting camera shot, smooth rotational pan around subject, dynamic parallax",
      tagLabel: "Orbit 360°",
      badge: "Destaque",
    },
    {
      id: "tracking",
      category: "motion",
      name: "Tracking Shot (Acompanhamento Lateral)",
      sub: "Câmera sobre trilhos em sincronia com o movimento",
      description:
        "A câmera acompanha o personagem em movimento lateral ou frontal, mantendo a composição estável e o ritmo contínuo da ação.",
      exampleScene:
        "1917 / Bons Companheiros — O protagonista caminha em ritmo acelerado e a câmera desliza paralelamente, sem nunca perdê-lo de vista.",
      visualDiagram: "⇄ [ TRACKING STEADICAM ]",
      promptSnippet:
        "smooth cinematic tracking shot, lateral dolly movement following subject, steadycam flow",
      tagLabel: "Tracking",
    },
    {
      id: "crane_up",
      category: "motion",
      name: "Crane / Drone Up (Ascensão Vertical)",
      sub: "Elevação suave do solo ao ar",
      description:
        "A câmera sobe verticalmente a partir do nível dos olhos até uma visão aérea imponente, criando sensação de triunfo ou perspectiva ampla.",
      exampleScene:
        "Um Sonho de Liberdade — O herói ajoelhado na chuva abre os braços enquanto a grua sobe verticalmente até uma vista aérea majestosa.",
      visualDiagram: "⇡ [ CRANE UP ELEVATION ]",
      promptSnippet:
        "dramatic crane shot elevating upwards, high angle jib movement, grand perspective transition",
      tagLabel: "Crane Up",
    },
    {
      id: "pan_lateral",
      category: "motion",
      name: "Pan Lateral (Varredura Horizontal)",
      sub: "Giro de câmera sobre eixo fixo",
      description:
        "Varredura horizontal fluida de um lado a outro do cenário, orientando a atenção do espectador para novos pontos de interesse.",
      exampleScene:
        "La La Land — Varredura horizontal contínua do pôr do sol nas colinas de Los Angeles até alcançar o casal iniciando a dança.",
      visualDiagram: "↔ [ PAN HORIZONTAL ]",
      promptSnippet:
        "smooth horizontal pan camera movement, sweeping environment view",
      tagLabel: "Pan Lateral",
    },
    {
      id: "dutch_angle",
      category: "motion",
      name: "Dutch Angle (Enquadramento Inclinado)",
      sub: "Horizonte diagonal para tensão psicológica",
      description:
        "A câmera é inclinada sobre seu eixo, criando desequilíbrio visual, tensão psicológica, mistério ou senso de perigo iminente.",
      exampleScene:
        "Batman Begins / Terceiro Homem — O horizonte inclinado transmite a perda de controle mental ou a sensação de que a realidade está distorcida.",
      visualDiagram: "◪ [ CANTED DUTCH ANGLE ]",
      promptSnippet:
        "dutch angle camera shot, tilted horizon line, psychological tension, dynamic canted angle",
      tagLabel: "Dutch Angle",
    },
    {
      id: "handheld",
      category: "motion",
      name: "Handheld Orgânico (Câmera na Mão)",
      sub: "Micromovimentos naturais da respiração humana",
      description:
        "Sensação tátil e visceral de estar presente na cena com o operador de câmera, transmitindo urgência e realismo cinematográfico puro.",
      exampleScene:
        "O Resgate do Soldado Ryan — Operador correndo na praia junto com os soldados; pequenas oscilações orgânicas que colocam o espectador dentro da ação.",
      visualDiagram: "〰 [ ORGANIC HANDHELD ]",
      promptSnippet:
        "realistic organic handheld camera motion, subtle camera shake, visceral cinéma vérité style",
      tagLabel: "Handheld",
      badge: "Realismo",
    },
    {
      id: "dolly_zoom",
      category: "motion",
      name: "Dolly Zoom (Efeito Vertigo)",
      sub: "Zoom óptico simultâneo ao recuo físico",
      description:
        "O fundo parece esticar ou comprimir enquanto o personagem permanece do mesmo tamanho, denotando choque súbito ou epifania dramática.",
      exampleScene:
        "Tubarão (Spielberg) — Chefe Brody na cadeira de praia assiste ao ataque no mar: o cenário ao fundo deforma e recua num choque paralisante.",
      visualDiagram: "⇥⇤ [ VERTIGO DOLLY ZOOM ]",
      promptSnippet:
        "dramatic vertigo dolly zoom effect, zolly shot, perspective distortion, sudden realization mood",
      tagLabel: "Dolly Zoom",
    },
    {
      id: "whip_pan",
      category: "motion",
      name: "Whip Pan (Transição Chicote)",
      sub: "Varredura ultrarrápida com rastro de desfoque",
      description:
        "Movimento ultrarrápido com rastro cinemático, ideal para cenas de ação, mudança brusca de perspectiva ou corte dinâmico.",
      exampleScene:
        "Whiplash — Transição relâmpago de alta velocidade da baqueta na bateria direto para os olhos furiosos do maestro.",
      visualDiagram: "⚡ [ WHIP PAN SNAP ]",
      promptSnippet:
        "fast whip pan camera motion, dynamic motion blur, rapid cinematic camera snap",
      tagLabel: "Whip Pan",
    },
  ],

  lens: [
    {
      id: "lens_35mm",
      category: "lens",
      name: "35mm Prime (Cinema Clássico)",
      sub: "Perspectiva equilibrada com profundidade sutil",
      description:
        "A lente mais consagrada da história do cinema. Captura o sujeito e o ambiente em harmonia perfeita, com proporções naturais e zero distorção.",
      exampleScene:
        "O Poderoso Chefão — Conversas íntimas no escritório de Don Corleone com proporções faciais humanas autênticas e ambiente presente.",
      visualDiagram: "[ 35mm Prime • f/2.0 ]",
      promptSnippet:
        "shot on 35mm prime cinema lens, natural perspective, balanced depth of field, sharp optics",
      tagLabel: "35mm Prime",
      badge: "Clássico",
    },
    {
      id: "lens_50mm",
      category: "lens",
      name: "50mm f/1.4 (Olho Humano)",
      sub: "Abertura ultrarrápida com foco seletivo",
      description:
        "Fidelidade idêntica ao campo de visão humano, com separação orgânica do fundo e desfoque suave de bokeh cremoso.",
      exampleScene:
        "Amélie Poulain — Rosto em foco cristalino com luzes do café ao fundo transformadas em círculos cremosos de bokeh suave.",
      visualDiagram: "[ 50mm • f/1.4 Creamy Bokeh ]",
      promptSnippet:
        "captured on 50mm f/1.4 lens, creamy bokeh, shallow depth of field, natural human eye perspective",
      tagLabel: "50mm f/1.4",
      badge: "Popular",
    },
    {
      id: "lens_85mm",
      category: "lens",
      name: "85mm Portrait (Retrato de Luxo)",
      sub: "Compressão facial perfeita e fundo desvanecido",
      description:
        "Comprime sutilmente as feições faciais para máxima beleza estética, isolando o olhar com profundidade de campo rasa exuberante.",
      exampleScene:
        "Duna (Denis Villeneuve) — Retrato em close de Paul Atreides no deserto: o vento e a areia ao fundo se fundem numa pintura abstrata suave.",
      visualDiagram: "[ 85mm Tele • Shallow DoF ]",
      promptSnippet:
        "shot on 85mm portrait telephoto lens, ultra shallow depth of field, creamy smooth bokeh background, tack sharp eyes",
      tagLabel: "85mm Portrait",
    },
    {
      id: "lens_24mm",
      category: "lens",
      name: "24mm Grande Angular (Imersão Épica)",
      sub: "Campo de visão aberto e perspectiva ampla",
      description:
        "Amplia a sensação de espaço e profundidade, excelente para paisagens majestosas, interiores arquitetônicos e composições dinâmicas.",
      exampleScene:
        "O Regresso (Iñárritu) — O explorador em primeiro plano dramático enquanto a floresta gélida e o rio se estendem infinitamente ao redor.",
      visualDiagram: "[ 24mm Wide Angle • Expansive ]",
      promptSnippet:
        "captured on 24mm wide angle cinema lens, dramatic expansive perspective, sweeping spatial depth",
      tagLabel: "24mm Wide",
    },
    {
      id: "lens_70mm_anamorphic",
      category: "lens",
      name: "70mm Anamórfica (Blockbuster Flares)",
      sub: "Flares horizontais azulados e bokeh oval",
      description:
        "O visual icônico dos grandes filmes de ficção científica e ação de Hollywood. Gera reflexos horizontais característicos e bokeh elíptico.",
      exampleScene:
        "Blade Runner 2049 / Oppenheimer — Faróis de viaturas e neons noturnos emitindo feixes azuis horizontais esticados pela lente cinematográfica.",
      visualDiagram: "[ 70mm Anamorphic • 2.39:1 Oval ]",
      promptSnippet:
        "shot on 70mm anamorphic cinema lens, horizontal blue streak lens flares, oval bokeh, cinematic letterbox aesthetic",
      tagLabel: "70mm Anamórfica",
      badge: "Cinemático",
    },
    {
      id: "lens_100mm_macro",
      category: "lens",
      name: "Macro 100mm (Hiperdetalhe Tátil)",
      sub: "Ampliação extrema de texturas e reflexos",
      description:
        "Revela poros da pele, gotas de água, tecidos finos e texturas minúsculas com nitidez microscópica estonteante.",
      exampleScene:
        "O Gambito da Rainha — Detalhe microscópico da mão pousando o peão de madeira no tabuleiro, revelando as veias da mão e a textura do verniz.",
      visualDiagram: "[ 100mm 1:1 Macro Detail ]",
      promptSnippet:
        "captured on 100mm macro lens, extreme microscopic texture detail, razor sharp focus, tactile surface fidelity",
      tagLabel: "Macro 100mm",
    },
    {
      id: "lens_200mm_tele",
      category: "lens",
      name: "200mm Telephoto (Compressão Espacial)",
      sub: "Aproxima planos de fundo com achatamento dramático",
      description:
        "Faz o plano de fundo parecer colado imediatamente atrás do assunto, criando uma estética de espionagem, escala massiva e elegância visual.",
      exampleScene:
        "O Espião Que Sabia Demais — Alvo observado à distância: prédios, pedestres e carros parecem comprimidos na mesma camada visual plana.",
      visualDiagram: "[ 200mm Super Tele • Flattened ]",
      promptSnippet:
        "shot on 200mm telephoto lens, extreme spatial background compression, dramatic focal stacking",
      tagLabel: "200mm Tele",
    },
  ],

  lighting: [
    {
      id: "light_golden_hour",
      category: "lighting",
      name: "Golden Hour (Hora Mágica)",
      sub: "Luz solar dourada rasante de fim de tarde",
      description:
        "Tons quentes de âmbar e dourado, sombras longas e suaves e uma aura brilhante de retroiluminação (rim light) nos contornos do personagem.",
      exampleScene:
        "Gladiador — Máximo na plantação de trigo ao entardecer: raios de sol dourados cortam as espigas e desenham um halo luminoso em seus cabelos.",
      visualDiagram: "[ ☀️ 3200K Golden Sun • Warm Rim ]",
      promptSnippet:
        "warm golden hour sunlight, low sun angle, amber atmospheric rim lighting, long cinematic shadows",
      tagLabel: "Golden Hour",
      badge: "Mais Usado",
    },
    {
      id: "light_cyberpunk_neon",
      category: "lighting",
      name: "Cyberpunk Neon & Volumétrica",
      sub: "Contraste vibrante de ciano e magenta com névoa",
      description:
        "Luzes de neon brilhantes refletidas em superfícies molhadas, feixes volumétricos cortando a fumaça e atmosfera noturna futurista.",
      exampleScene:
        "John Wick 4 / Akira — Beco molhado em Tóquio iluminado exclusivamente por placas de neon magenta e ciano, com sombras profundas e fumaça de bueiro.",
      visualDiagram: "[ ⚡ Cyan/Magenta Neon • Volumetric ]",
      promptSnippet:
        "cyberpunk volumetric neon lighting, vibrant cyan and magenta backlights, hazy wet surface reflections, moody dark atmospheric contrast",
      tagLabel: "Cyberpunk Neon",
      badge: "Estilizado",
    },
    {
      id: "light_film_noir",
      category: "lighting",
      name: "Film Noir (Chiaroscuro & Sombras)",
      sub: "Altíssimo contraste entre luz direta e escuridão",
      description:
        "Estética noir clássica com sombras duras de persianas, feixes de luz pontuais e áreas de mistério impenetrável.",
      exampleScene:
        "Sin City / Casablanca — Detetive fumando no escuro enquanto a luz de um poste lá fora corta a janela e desenha listras de sombra no seu rosto.",
      visualDiagram: "[ 🌓 Venetian Blind Chiaroscuro ]",
      promptSnippet:
        "high-contrast film noir chiaroscuro lighting, deep Venetian blind shadows, dramatic hard key light, moody vintage suspense",
      tagLabel: "Film Noir",
    },
    {
      id: "light_studio_3point",
      category: "lighting",
      name: "Luz de Estúdio 3-Pontos (Moda & Luxo)",
      sub: "Key light, fill light e backlight perfeitamente calibrados",
      description:
        "Iluminação balanceada e impecável de publicidade premium, sem sombras duras no rosto, realçando contornos com sofisticação.",
      exampleScene:
        "Vídeos de Lançamento da Apple / Capa da Vanity Fair — Luz principal suave a 45°, leve preenchimento do outro lado e luz de recorte nítida no cabelo.",
      visualDiagram: "[ 💡 Key 45° + Fill + Hair Light ]",
      promptSnippet:
        "commercial studio three-point lighting, soft key light, gentle fill, crisp hair backlight, pristine beauty lighting",
      tagLabel: "Estúdio 3-Pontos",
    },
    {
      id: "light_rembrandt",
      category: "lighting",
      name: "Rembrandt Dramática",
      sub: "Triângulo clássico de luz na bochecha sombreada",
      description:
        "Inspirada nos mestres da pintura clássica, projeta um triângulo luminoso sob o olho oposto à fonte de luz, conferindo autoridade e mistério.",
      exampleScene:
        "Retratos Master da National Geographic — Olhar penetrante do ancião com um lado do rosto na penumbra e um triângulo de luz suave na bochecha.",
      visualDiagram: "[ 🔺 Rembrandt Triangle Light ]",
      promptSnippet:
        "classic Rembrandt lighting, distinctive triangle of light under eye, rich textural shadows, artistic renaissance mood",
      tagLabel: "Rembrandt",
    },
    {
      id: "light_overcast_soft",
      category: "lighting",
      name: "Luz Suave Difusa (Overcast Natural)",
      sub: "Iluminação uniforme sem sombras marcadas",
      description:
        "Luz natural difusa rebatida por nuvens ou softboxes gigantes, gerando gradientes de pele extremamente suaves, calmos e realistas.",
      exampleScene:
        "A Chegada (Arrival) / Manchester À Beira-Mar — Dia nublado nórdico onde tudo ganha um tom melancólico suave, sem reflexos fortes nem sombras duras.",
      visualDiagram: "[ ☁️ 5600K Diffused Soft Sky ]",
      promptSnippet:
        "soft diffused overcast daylight, even ambient illumination, gentle shadow falloff, natural cinematic realism",
      tagLabel: "Luz Suave Difusa",
    },
    {
      id: "light_moonlight_blue",
      category: "lighting",
      name: "Moonlight Azul Frio (Noite Mística)",
      sub: "Tons azuis prateados e reflexos noturnos",
      description:
        "Iluminação noturna cinematográfica em tons de azul índigo e prata, evocando misticismo, suspense noturno ou serenidade silenciosa.",
      exampleScene:
        "Interestelar / O Labirinto do Fauno — Clareira da floresta à noite sob o luar prateado frio com neblina densa rasteira.",
      visualDiagram: "[ 🌙 Cool Indigo Moonlight ]",
      promptSnippet:
        "cool blue moonlight illumination, silver rim light accents, deep nocturnal atmosphere, atmospheric fog",
      tagLabel: "Moonlight Azul",
    },
  ],

  camera: [
    {
      id: "frame_extreme_closeup",
      category: "camera",
      name: "Extreme Close-Up (Hiperdetalhe)",
      sub: "Foco total nos olhos, lábios ou expressão",
      description:
        "Corta o topo da cabeça e o queixo, prendendo a atenção na intensidade crua do olhar ou em um detalhe crucial da narrativa.",
      exampleScene:
        "O Silêncio dos Inocentes — O enquadramento fecha nos olhos frios e estáticos do Dr. Lecter enquanto fala calmamente através do vidro.",
      visualDiagram: "[ 👁️ EXTREME CLOSE-UP: EYES ]",
      promptSnippet:
        "extreme close-up shot, intense facial focal point, macro framing on eyes and raw emotional expression",
      tagLabel: "Extreme Close-Up",
    },
    {
      id: "frame_closeup",
      category: "camera",
      name: "Close-Up (Rosto & Expressão)",
      sub: "Enquadramento clássico de atuação dramática",
      description:
        "Enquadra a cabeça e a linha dos ombros, destacando reações emocionais e diálogos íntimos com clareza cristalina.",
      exampleScene:
        "O Discurso do Rei — Enquadramento fechado do queixo até o topo do chapéu, revelando a tensão nos músculos da boca e o nervosismo.",
      visualDiagram: "[ 👤 CLOSE-UP: FACE & SHOULDERS ]",
      promptSnippet:
        "cinematic close-up portrait framing, sharp focus on subject face, subtle background separation",
      tagLabel: "Close-Up",
      badge: "Popular",
    },
    {
      id: "frame_medium",
      category: "camera",
      name: "Plano Médio (Cintura para Cima)",
      sub: "Equilíbrio entre o personagem e o espaço",
      description:
        "Mostra da cintura para cima, permitindo observar a linguagem corporal, gestos das mãos e o contexto ao redor do sujeito.",
      exampleScene:
        "Pulp Fiction — Jules e Vincent conversando no carro ou restaurante com gestos das mãos e postura corporal plenamente visíveis.",
      visualDiagram: "[ 🧍 MEDIUM SHOT: WAIST-UP ]",
      promptSnippet:
        "medium shot framing from waist up, natural conversational composition, clear subject gesture and posture",
      tagLabel: "Plano Médio",
    },
    {
      id: "frame_american",
      category: "camera",
      name: "Plano Americano (Cowboy Shot)",
      sub: "Estilo clássico de ação e postura heroica",
      description:
        "Nascido nos westerns para mostrar dos joelhos para cima, é ideal para postura imponente, trajes de ação e confiança física.",
      exampleScene:
        "Três Homens em Conflito / Matrix — Pistoleiro no duelo: do joelho à cabeça, exibindo a mão próxima do coldre e a postura desafiadora.",
      visualDiagram: "[ 🤠 COWBOY SHOT: KNEES-UP ]",
      promptSnippet:
        "cowboy shot framing from knees up, confident cinematic hero posture, balanced full upper body view",
      tagLabel: "Plano Americano",
    },
    {
      id: "frame_wide",
      category: "camera",
      name: "Plano Geral / Wide Shot (Escala Monumental)",
      sub: "O personagem imerso na vastidão do mundo",
      description:
        "Mostra o corpo inteiro com abundância de cenário ao redor, enfatizando a escala do mundo, a atmosfera e o isolamento ou magnitude da cena.",
      exampleScene:
        "O Senhor dos Anéis — Frodo e Sam caminhando na crista rochosa da montanha enquanto as montanhas cinzentas de Mordor dominam o horizonte.",
      visualDiagram: "[ 🏔️ WIDE ESTABLISHING SHOT ]",
      promptSnippet:
        "wide angle establishing shot, full body subject in vast monumental environment, epic cinematic scale",
      tagLabel: "Plano Geral",
      badge: "Épico",
    },
    {
      id: "frame_low_angle",
      category: "camera",
      name: "Low-Angle Hero (De Baixo para Cima)",
      sub: "Câmera contra-plongée conferindo poder e domínio",
      description:
        "A câmera posicionada abaixo da linha dos olhos olha para cima, conferindo poder, autoridade, majestade e imponência inquestionável.",
      exampleScene:
        "Os Vingadores / O Cavaleiro das Trevas — O herói de pé sobre a gárgula visto a partir do solo, parecendo um gigante lendário.",
      visualDiagram: "[ ⬆️ CONTRA-PLONGÉE HERO ]",
      promptSnippet:
        "low-angle hero shot, dramatic upward perspective, powerful dominant subject presence, imposing cinematic composition",
      tagLabel: "Low-Angle Hero",
    },
    {
      id: "frame_high_angle",
      category: "camera",
      name: "High-Angle (De Cima para Baixo)",
      sub: "Câmera plongée conferindo vulnerabilidade ou visão tática",
      description:
        "A câmera posicionada no alto olha para baixo, revelando o piso, padrões arquitetônicos, fragilidade ou o desenho tático do cenário.",
      exampleScene:
        "Parasita (Bong Joon-ho) — A família correndo sob o dilúvio vista do alto da escadaria interminável da cidade, enfatizando a vulnerabilidade social.",
      visualDiagram: "[ ⬇️ PLONGÉE OVERHEAD VIEW ]",
      promptSnippet:
        "high-angle overhead shot, bird's eye perspective looking down, dramatic environmental layout",
      tagLabel: "High-Angle",
    },
    {
      id: "frame_pov",
      category: "camera",
      name: "Ponto de Vista POV (Primeira Pessoa)",
      sub: "O espectador enxerga através dos olhos do personagem",
      description:
        "Coloca o espectador diretamente no lugar do protagonista, experimentando o que ele vê em primeira pessoa com imersão total.",
      exampleScene:
        "2001: Uma Odisseia no Espaço — Visão subjetiva através do visor do capacete do astronauta se aproximando do monólito misterioso.",
      visualDiagram: "[ 👁️ SUBJECTIVE POV EYES ]",
      promptSnippet:
        "first-person point of view POV shot, subjective camera perspective, seeing directly through character eyes",
      tagLabel: "POV",
    },
  ],

  style: [
    {
      id: "style_editorial_vogue",
      category: "style",
      name: "Editorial de Moda Vogue",
      sub: "Alta costura, maquiagem impecável e iluminação de passarela",
      description:
        "Estilo de revista internacional de moda, com pose deliberada, texturas táteis de tecidos finos, acabamento editorial impecável e sofisticação visual.",
      exampleScene:
        "Capa da Vogue Paris — Modelo com vestido de gala de seda preta em estúdio cinza minimalista, iluminação escultural e olhar magnético.",
      visualDiagram: "[ 💎 VOGUE EDITORIAL HIGH FASHION ]",
      promptSnippet:
        "high fashion editorial photography, Vogue cover aesthetic, flawless makeup, sculptural lighting, luxury texture fidelity",
      tagLabel: "Editorial Vogue",
      badge: "Fotografia",
    },
    {
      id: "style_kodak_portra",
      category: "style",
      name: "Filme Analógico Kodak Portra 400",
      sub: "Grão fino de película, tons quentes e nostalgia orgânica",
      description:
        "A emulsão fotográfica mais amada pelos fotógrafos retratistas. Cores quentes e pastéis, transições tonais suaves e textura orgânica inconfundível.",
      exampleScene:
        "Cinema Independente A24 — Retrato de fim de tarde com grão analógico suave, tons de pele dourados e sensação tátil de foto impressa.",
      visualDiagram: "[ 🎞️ 35mm KODAK PORTRA 400 ]",
      promptSnippet:
        "shot on 35mm film, Kodak Portra 400 aesthetic, organic film grain, warm nostalgic tones, subtle chromatic halation",
      tagLabel: "Kodak Portra",
      badge: "Analógico",
    },
    {
      id: "style_hasselblad_8k",
      category: "style",
      name: "Hiper-Realismo Médio Formato 8K",
      sub: "Nitidez cirúrgica de câmera Hasselblad de 100MP",
      description:
        "Extrema fidelidade óptica de sensores de médio formato comercial. Revela detalhes microscópicos de pele, íris dos olhos e materiais com precisão física.",
      exampleScene:
        "Fotografia Comercial Suíça — Detalhe frontal onde cada poro facial, textura de couro e reflexo nos olhos possui nitidez estonteante sem artefatos.",
      visualDiagram: "[ 📷 100MP HASSELBLAD MEDIUM FORMAT ]",
      promptSnippet:
        "shot on Hasselblad H6D-100c medium format camera, 8k ultra high resolution, immaculate texture fidelity, surgical optical sharpness",
      tagLabel: "Hasselblad 8K",
      badge: "Máximo Detalhe",
    },
    {
      id: "style_fine_art_bw",
      category: "style",
      name: "Fine Art Preto & Branco",
      sub: "Contraste profundo, sombras esculpidas e preto puro",
      description:
        "Estética monocromática de galeria de arte. Elimina as distrações da cor para focar integralmente nas formas, volumes e intensidade da luz.",
      exampleScene:
        "Trabalhos de Sebastião Salgado — Rosto esculpido pela luz em preto e branco profundo, com sombras aveludadas e brancos puros reluzentes.",
      visualDiagram: "[ ⬛ MONOCHROME FINE ART B&W ]",
      promptSnippet:
        "fine art black and white photography, deep velvety shadows, rich tonal range, high contrast monochrome masterpiece",
      tagLabel: "Preto & Branco",
    },
    {
      id: "style_octane_3d",
      category: "style",
      name: "Render 3D Cinematográfico Octane",
      sub: "Iluminação volumétrica física, raytracing e materiais PBR",
      description:
        "Estética visual de computação gráfica de nível Pixar ou Unreal Engine 5, com materiais foto-realistas, reflexos perfeitos e iluminação volumétrica mágica.",
      exampleScene:
        "Cena de Animação de Longa-Metragem — Objeto ou criatura fantástica com reflexos complexos, dispersão subsuperficial na pele e brilho mágico.",
      visualDiagram: "[ 🖥️ 3D OCTANE ENGINE RAYTRACED ]",
      promptSnippet:
        "cinematic 3D render, Octane Engine raytracing, subsurface scattering, physically based rendering materials, volumetric ambient glow",
      tagLabel: "Render 3D Octane",
    },
  ],
};

interface CinemaPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: PresetCategory;
  selectedId: string | null;
  onSelect: (preset: CinemaPresetItem | null) => void;
}

export function CinemaPresetsModal({
  isOpen,
  onClose,
  category,
  selectedId,
  onSelect,
}: CinemaPresetsModalProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const items = CINEMA_PRESETS[category] || [];
  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.exampleScene.toLowerCase().includes(search.toLowerCase()) ||
      item.sub.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryInfo = () => {
    switch (category) {
      case "motion":
        return {
          title: "Movimentos de Câmera Cinemáticos (Exclusivo para Vídeo)",
          subtitle: "Escolha como a câmera percorre a cena no espaço tridimensional com vetores dinâmicos.",
          icon: Film,
          badgeColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        };
      case "lens":
        return {
          title: "Lentes & Óptica de Produção",
          subtitle: "Defina a profundidade de campo, distância focal, distorção e formato óptico.",
          icon: Aperture,
          badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        };
      case "lighting":
        return {
          title: "Iluminação & Temperatura de Cor",
          subtitle: "Configure o contraste, direção dos feixes de luz, chiaroscuro e atmosfera.",
          icon: Sun,
          badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
        };
      case "camera":
        return {
          title: "Enquadramento & Ângulo de Visão",
          subtitle: "Determine o plano, distância focal do sujeito e proporção de enquadramento.",
          icon: Camera,
          badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        };
      case "style":
        return {
          title: "Estilos Fotográficos & Texturas Visuais",
          subtitle: "Aplique estética de filmes analógicos, alta moda, fotografia comercial ou render 3D.",
          icon: Palette,
          badgeColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
        };
    }
  };

  const info = getCategoryInfo();
  const IconComponent = info.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[88vh] bg-[#0C0D12] border border-white/15 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 size-72 bg-[#FF5500]/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0 relative z-10 bg-[#090A0E]">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5500]">
              <IconComponent className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {info.title}
                </h2>
                <Badge variant="outline" className={`text-[10px] font-mono ${info.badgeColor}`}>
                  {items.length} presets com exemplos
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {info.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Opção Nenhum / Desmarcar */}
            {selectedId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSelect(null);
                  onClose();
                }}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8 gap-1.5"
              >
                <X className="size-3.5" />
                <span>Nenhum (Remover)</span>
              </Button>
            )}

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Busca e Barra de Ação */}
        <div className="p-3.5 sm:p-4 border-b border-white/5 bg-black/40 flex items-center justify-between gap-3 shrink-0">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar por nome, técnica ou exemplo de cena em ${info.title.toLowerCase()}...`}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FF5500]/50"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className="text-xs text-zinc-400 hover:text-white shrink-0 hover:bg-white/5 font-mono"
          >
            Não selecionar nenhum
          </Button>
        </div>

        {/* Grid de Exemplos com Detalhes Visuais */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
          {filtered.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(isSelected ? null : item);
                  onClose();
                }}
                className={`group relative rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#FF5500]/15 border-[#FF5500] shadow-[0_0_25px_rgba(255,85,0,0.25)] ring-1 ring-[#FF5500]/50"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                <div>
                  {/* Topo do Card: Nome + Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#FF5500] transition-colors">
                          {item.name}
                        </span>
                        {item.badge && (
                          <Badge
                            variant="outline"
                            className="bg-[#FF5500]/10 border-[#FF5500]/30 text-[#FF5500] text-[9px] font-mono py-0 px-1.5"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 font-medium">
                        {item.sub}
                      </div>
                    </div>

                    <div
                      className={`size-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#FF5500] border-[#FF5500] text-white shadow-sm"
                          : "border-white/20 group-hover:border-white/40 text-transparent"
                      }`}
                    >
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                  </div>

                  {/* Wireframe / Diagrama Visual */}
                  <div className="my-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] text-zinc-300">
                      {item.visualDiagram}
                    </span>
                  </div>

                  {/* Descrição Técnica */}
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  {/* Exemplo Prático em Cena / Filme Consagrado */}
                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF5500] font-semibold">
                      <Sparkles className="size-3 text-[#FF5500]" />
                      <span>Exemplo Real em Cena:</span>
                    </div>
                    <p className="text-xs text-zinc-300 italic leading-snug">
                      "{item.exampleScene}"
                    </p>
                  </div>
                </div>

                {/* Footer do Card com Snippet do Prompt */}
                <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-mono">Injeta no Prompt:</span>
                  <span
                    className="text-zinc-300 font-mono italic truncate max-w-[220px]"
                    title={item.promptSnippet}
                  >
                    "{item.promptSnippet.slice(0, 38)}..."
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer do Modal */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#090A0E] flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-400 font-mono">
            {selectedId ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <Check className="size-4" />
                Preset ativo! O efeito será composto automaticamente no prompt.
              </span>
            ) : (
              <span>Nenhum preset selecionado (opcional). Clique em qualquer item para ativar.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-white/10 text-zinc-300 hover:text-white"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
