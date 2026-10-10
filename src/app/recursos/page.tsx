import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { LandingHeroActions } from "@/components/landing/landing-hero-actions";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Film,
  Eye,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Maximize2,
  ImageIcon,
  Mic,
  PenTool,
  Bot,
  Layers,
  Cpu,
  ShieldCheck,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Recursos da Plataforma — Imagens, Vídeos, Áudios e Textos com IA",
  description:
    "Descubra todos os recursos da Kriativa: Kriativa Vision (imagens), Kriativa Motion (vídeos com controle 3D), Kriativa Voice (áudios e vozes neurais) e Kriativa Mind (textos e roteiros).",
  openGraph: {
    title: "Recursos da Plataforma — Kriativa.app",
    description:
      "Todas as IAs que você precisa em um só lugar: Imagens, Vídeos, Áudios, Textos e Agentes Criativos sem precisar de 10 assinaturas.",
  },
};

export default function RecursosPage() {
  const suites = [
    {
      id: "vision",
      name: "Kriativa Vision",
      category: "🖼️ IMAGENS",
      headline: "Imagens com fotorrealismo e flexibilidade de estilos",
      desc: "Crie imagens para redes sociais, campanhas, produtos, personagens, anúncios e muito mais.",
      accent: "from-amber-500/20 via-orange-500/10 to-transparent",
      borderColor: "border-amber-500/30",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      icon: ImageIcon,
      features: [
        "Renderização fotográfica em alta definição e iluminação de estúdio",
        "Criação de mockups, embalagens e criativos de alta conversão para anúncios",
        "Arquétipos visuais de personagens para storytelling contínuo",
        "Vários modelos integrados para estilos realistas, conceituais e artísticos",
      ],
    },
    {
      id: "motion",
      name: "Kriativa Motion",
      category: "🎬 VÍDEOS",
      headline: "Vídeos cinemáticos com física de movimento e controle 3D",
      desc: "Transforme ideias e imagens em vídeos para conteúdo, anúncios, Reels, Shorts e projetos criativos.",
      accent: "from-[#FF5500]/20 via-[#FF5500]/10 to-transparent",
      borderColor: "border-[#FF5500]/40",
      badgeColor: "text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/30",
      icon: Film,
      features: [
        "Controle físico de câmera 3D: Dolly Zoom, Drone FPV, Órbita 360° e Grua",
        "Cofre de Consistência de Atores para manter o mesmo rosto plano a plano",
        "Emulação de lentes anamórficas com flares e granulação master 35mm",
        "Formatos nativos: 2.39:1 Cinema, 16:9 Widescreen, 9:16 Reels/TikTok e 1:1",
      ],
    },
    {
      id: "voice",
      name: "Kriativa Voice",
      category: "🔊 ÁUDIOS",
      headline: "Vozes naturais e áudios que dão vida aos seus projetos",
      desc: "Crie vozes e áudios para seus conteúdos, vídeos e projetos.",
      accent: "from-purple-500/20 via-purple-500/10 to-transparent",
      borderColor: "border-purple-500/30",
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      icon: Mic,
      features: [
        "Vozes neurais expressivas com sotaques regionais e entonação humana",
        "Dublagem automatizada e sincronização de fala para vídeos",
        "Efeitos sonoros e paisagens sonoras cinemáticas de fundo",
        "Geração de trilhas de suporte para comerciais e conteúdo dinâmico",
      ],
    },
    {
      id: "mind",
      name: "Kriativa Mind",
      category: "✍️ TEXTOS",
      headline: "Roteiros, decupagens técnicas e copies de alta conversão",
      desc: "Crie ideias, roteiros, anúncios, textos e conteúdos com inteligência artificial.",
      accent: "from-cyan-500/20 via-cyan-500/10 to-transparent",
      borderColor: "border-cyan-500/30",
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      icon: PenTool,
      features: [
        "Roteirização completa com divisão cena a cena e decupagem de direção",
        "Copies persuasivas para Meta Ads, Google Ads e postagens sociais",
        "Briefings estratégicos para equipes de marketing e criadores",
        "Agentes inteligentes especializados em direções criativas específicas",
      ],
    },
  ];

  const cameraMotions = [
    {
      name: "Dolly Zoom (Efeito Vertigo)",
      desc: "Simulação de contração de distância focal combinada a movimento físico oposto. Cria tensão psicológica e impacto dramático.",
      tag: "Óptica Clássica",
    },
    {
      name: "Drone FPV Chase Cam",
      desc: "Voo rasante de alta velocidade com rotação dinâmica em 3 eixos (Pitch, Roll e Yaw) e inércia de aerodinâmica real.",
      tag: "Ação & Velocidade",
    },
    {
      name: "Órbita 360° Circular",
      desc: "Rotação orbital perfeita ao redor do ponto central de interesse, mantendo iluminação e geometria tridimensional consistentes.",
      tag: "Planos Sequência",
    },
    {
      name: "Pan & Tilt Estabilizado",
      desc: "Movimentos horizontais e verticais fluidos simulando cabeças hidráulicas de tripés profissionais de cinema.",
      tag: "Enquadramento",
    },
    {
      name: "Crane / Jib Shot (Grua)",
      desc: "Movimento vertical ascendente ou descendente revelando a grandiosidade de cenários e a escala dos ambientes.",
      tag: "Planos Gerais",
    },
    {
      name: "Câmera na Mão (Handheld Real)",
      desc: "Micro-vibrações orgânicas e respiração de câmera documental para criar sensação de intimidade e realismo visceral.",
      tag: "Documental & Drama",
    },
  ];

  const aspectRatios = [
    {
      ratio: "2.39:1",
      title: "Cinema Anamórfico Ultra-Wide",
      detail: "O padrão estético dos grandes filmes de ficção científica e épicos de Hollywood. Permite flares horizontais e campo visual expandido.",
    },
    {
      ratio: "16:9",
      title: "Widescreen / Televisão & YouTube",
      detail: "Formato padrão de alta definição para comerciais de televisão, documentários e produções para plataformas de streaming.",
    },
    {
      ratio: "9:16",
      title: "Vertical Cinema / Reels & TikTok",
      detail: "Produção vertical com tratamento e composição cinematográfica para campanhas publicitárias de mobile e criadores de conteúdo.",
    },
    {
      ratio: "1:1",
      title: "Square Feed / Redes Sociais",
      detail: "Enquadramento quadrado balanceado com máxima retenção em feeds sociais e apresentações de produtos.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Recursos Completos da Plataforma Kriativa.app",
    description:
      "Imagens com Kriativa Vision, vídeos com Kriativa Motion, áudios com Kriativa Voice e textos com Kriativa Mind reunidos em uma só plataforma.",
    author: {
      "@type": "Organization",
      name: "Kriativa.app",
    },
  };

  return (
    <div className="min-h-screen bg-[#050506] text-[#F8FAFC] flex flex-col selection:bg-[#FF5500] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader />

      <main className="flex-1 space-y-20 sm:space-y-28 py-14 sm:py-20">
        {/* Hero Section */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-white/10 text-white/80 bg-white/5 mb-4"
          >
            A NOVA PLATAFORMA BRASILEIRA DE IA
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold uppercase tracking-tight max-w-4xl mx-auto leading-[0.98]">
            Tudo o que você precisa para criar.{" "}
            <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent">
              Em um só lugar.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
            Imagens. Vídeos. Áudios. Textos. Crie com diferentes modelos de inteligência artificial sem precisar assinar uma plataforma para cada tarefa.
          </p>

          <div className="mt-8 max-w-md mx-auto">
            <LandingHeroActions />
          </div>
        </section>

        {/* The 4 Creative Pillars */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5500]">
              SUÍTE COMPLETA
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Uma plataforma. Vários modelos.
            </h2>
            <p className="text-sm text-neutral-400 font-sans">
              Não existe um único modelo perfeito para tudo. Por isso, a Kriativa reúne diferentes tecnologias em uma única interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suites.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  id={s.id}
                  className={`rounded-3xl border ${s.borderColor} bg-gradient-to-b ${s.accent} p-7 sm:p-9 space-y-6 flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
                          <Icon className="size-5" />
                        </div>
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                          {s.category}
                        </span>
                      </div>
                      <Badge variant="outline" className={`text-xs font-mono font-bold ${s.badgeColor}`}>
                        {s.name}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                        {s.headline}
                      </h3>
                      <p className="text-sm text-neutral-300 mt-2 font-sans leading-relaxed">
                        {s.desc}
                      </p>
                    </div>

                    <ul className="space-y-2.5 pt-3 border-t border-white/10">
                      {s.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                          <CheckCircle2 className="size-4 text-[#FF5500] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 text-xs font-heading font-bold text-white hover:text-[#FF5500] transition-colors"
                    >
                      <span>Experimentar {s.name}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feature Focus: Câmera 3D & Direção */}
        <section id="camera" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-[#08090C] p-8 sm:p-14 space-y-10">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] font-bold uppercase tracking-wider">
                  <Camera className="size-4" />
                  <span>Kriativa Motion • Física de Direção</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
                  Controle Tridimensional de Câmera & Física de Movimento
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                  Em vez de instruções vagas de texto como &quot;câmera se move&quot;, você seleciona e calibra vetores cinemáticos exatos de inércia, aceleração e profundidade.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-[#0C0D12] text-xs font-mono space-y-2 w-full lg:max-w-xs">
                <div className="text-[#FF5500] font-bold uppercase">Telemetria de Câmera Ativa:</div>
                <div className="text-muted-foreground flex justify-between">
                  <span>Eixos Tridimensionais:</span>
                  <span className="text-white">Yaw, Pitch, Roll</span>
                </div>
                <div className="text-muted-foreground flex justify-between">
                  <span>Inércia de Movimento:</span>
                  <span className="text-white">Física Não-Linear</span>
                </div>
                <div className="text-muted-foreground flex justify-between">
                  <span>Taxa de Quadros:</span>
                  <span className="text-white">24fps / 60fps</span>
                </div>
              </div>
            </div>

            {/* Camera Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              {cameraMotions.map((cam) => (
                <div
                  key={cam.name}
                  className="rounded-xl border border-white/10 bg-[#0C0D12] p-5 space-y-2 hover:border-[#FF5500]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-white">
                      {cam.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-mono border-white/10 text-muted-foreground"
                    >
                      {cam.tag}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cam.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Consistency Vault */}
        <section id="consistencia" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0C0D12] to-[#08090C] p-8 sm:p-14 space-y-8">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider">
                <Eye className="size-4" />
                <span>Consistência Narrativa</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
                Cofre de Consistência de Personagens & Estilo
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                O maior desafio de produzir com IA é o personagem mudar de rosto a cada nova geração. O Cofre de Consistência da Kriativa resolve isso definitivamente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="rounded-2xl border border-white/10 bg-[#08090C] p-6 space-y-2.5">
                <span className="text-xs font-mono text-[#00E5FF] font-bold uppercase">
                  Identidade Fisionômica
                </span>
                <h3 className="font-heading font-bold text-base text-white">
                  Preservação de Feições
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  O personagem mantém a mesma estrutura óssea, tom de pele e cabelo mesmo sob diferentes iluminações e ângulos.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#08090C] p-6 space-y-2.5">
                <span className="text-xs font-mono text-[#00E5FF] font-bold uppercase">
                  Figurino & Acessórios
                </span>
                <h3 className="font-heading font-bold text-base text-white">
                  Persistência de Figurino
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Roupas, texturas de tecido, relógios e trajes permanecem coerentes plano a plano sem metamorfoses aleatórias.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#08090C] p-6 space-y-2.5">
                <span className="text-xs font-mono text-[#00E5FF] font-bold uppercase">
                  Multi-Cena Narrativa
                </span>
                <h3 className="font-heading font-bold text-base text-white">
                  Continuidade de Direção
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Crie sequências inteiras (plano geral, plano médio, close e contraplano) prontas para edição e publicação.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Optical Lenses & Formats */}
        <section id="formatos" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-[#08090C] p-8 sm:p-14 space-y-8">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] font-bold uppercase tracking-wider">
                <Maximize2 className="size-4" />
                <span>Multi-Formato & Master</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
                Multi-Formato para Todas as Telas
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                Entregue seus projetos no formato ideal para cada tela, da sala de cinema IMAX à tela de bloqueio do smartphone.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
              {aspectRatios.map((ar) => (
                <div
                  key={ar.ratio}
                  className="rounded-2xl border border-white/10 bg-[#0C0D12] p-6 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-base text-white">
                      {ar.title}
                    </span>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs text-[#FF5500] border-[#FF5500]/30 bg-[#FF5500]/10"
                    >
                      {ar.ratio}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {ar.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: "Você não precisa entender de modelos de IA" */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0C0D12] to-black p-8 sm:p-14 text-center space-y-6">
            <div className="max-w-2xl mx-auto space-y-3">
              <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-white/80 bg-white/5">
                SIMPLICIDADE RADICAL
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
                Você não precisa entender de modelos de IA.
              </h2>
              <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                Não precisa acompanhar lançamentos. Não precisa saber qual modelo é melhor. Não precisa abrir 15 abas para descobrir onde fazer cada coisa. Escolha o que quer criar. A Kriativa coloca as ferramentas necessárias no mesmo lugar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4 text-left">
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <span className="font-mono text-xs text-[#FF5500] font-bold">01. Imagens</span>
                <p className="text-xs text-neutral-300 mt-1">Gere posts, conceitos e ilustrações sem complicação.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <span className="font-mono text-xs text-[#FF5500] font-bold">02. Vídeos</span>
                <p className="text-xs text-neutral-300 mt-1">Transforme ideias em movimento com controle de câmera.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <span className="font-mono text-xs text-[#FF5500] font-bold">03. Áudios</span>
                <p className="text-xs text-neutral-300 mt-1">Adicione vozes realistas e efeitos em segundos.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <span className="font-mono text-xs text-[#FF5500] font-bold">04. Textos</span>
                <p className="text-xs text-neutral-300 mt-1">Escreva roteiros, decupagens e anúncios persuasivos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Offers Callout */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border-2 border-[#FF5500]/50 bg-gradient-to-r from-[#FF5500]/15 via-[#FF5500]/5 to-transparent p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF5500] text-white font-mono text-[10px] font-black uppercase">
                  OFERTAS
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  Flexibilidade Total
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase">
                A partir de R$ 5 ou Ilimitado por R$ 200/mês
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 font-sans max-w-xl">
                Comece comprando créditos a partir de R$ 5 (créditos que nunca expiram) ou assine a Kriativa Ilimitada para criar sem contar créditos com redirecionamento contínuo entre modelos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/precos"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all text-center"
              >
                Ver Tabela de Preços
              </Link>
              <Link
                href="/#planos"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-[#FF5500] hover:bg-[#ff681a] text-white transition-all shadow-[0_0_25px_rgba(255,85,0,0.4)] text-center flex items-center justify-center gap-2"
              >
                <span>Conhecer Ofertas</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0C0D12] to-black p-8 sm:p-14 text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Pare de procurar qual IA usar. Comece a criar.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Imagens. Vídeos. Áudios. Textos. Tudo em um só lugar. Comece agora sem custo.
            </p>
            <div className="pt-2 max-w-sm mx-auto">
              <LandingHeroActions />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
