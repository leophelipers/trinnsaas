import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Film,
  Eye,
  Zap,
  Clapperboard,
  Maximize2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Move3d,
  Layers,
  Palette,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Recursos de Cinema Generativo & Controle de Câmera 3D",
  description:
    "Descubra as capacidades do Kriativa.app: controle físico de câmera 3D, consistência temporal de atores, lentes anamórficas e decupagem de roteiros com IA.",
  openGraph: {
    title: "Recursos de Estúdio — Kriativa.app",
    description:
      "Controle de câmera 3D com inércia real, lentes anamórficas e persistência fisionômica de atores entre cortes.",
  },
};

export default function RecursosPage() {
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
    headline: "Recursos e Especificações Técnicas do Estúdio Kriativa.app",
    description:
      "Documentação completa de física de câmera 3D, lentes anamórficas virtuais e cofre de consistência de personagens do Kriativa.app.",
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
            Especificações Técnicas de Estúdio
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold uppercase tracking-tight max-w-4xl mx-auto leading-[0.98]">
            Ferramentas de Cinema.{" "}
            <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent">
              Controle Absoluto de Direção.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
            Eliminamos a incerteza do vídeo com inteligência artificial. Conheça as tecnologias desenvolvidas para conceder a diretores o mesmo controle milimétrico de uma equipe de câmera em set.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-7 py-3 rounded-xl font-heading font-bold text-xs bg-[#FF5500] text-white hover:bg-[#ff681a] flex items-center gap-2 shadow-[0_0_25px_rgba(255,85,0,0.35)]"
            >
              <span>Abrir Studio de Criação</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>

        {/* Feature 1: Camera 3D Dynamics */}
        <section id="camera" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-[#08090C] p-8 sm:p-14 space-y-10">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] font-bold uppercase tracking-wider">
                  <Camera className="size-4" />
                  <span>Módulo 01</span>
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

        {/* Feature 2: Consistency Vault */}
        <section id="consistencia" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0C0D12] to-[#08090C] p-8 sm:p-14 space-y-8">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider">
                <Eye className="size-4" />
                <span>Módulo 02</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
                Cofre de Consistência de Atores & Estilo
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                O maior desafio de produzir filmes com IA é que o ator muda de rosto a cada tomada gerada. O Cofre de Consistência do Kriativa resolve isso definitivamente.
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
                  O ator mantém a mesma estrutura óssea, cor de olhos, tom de pele e cabelo mesmo sob diferentes iluminações e ângulos.
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
                  Crie sequências inteiras (plano geral, plano médio, close e contraplano) prontas para edição na sua timeline favorita.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Optical & Lenses */}
        <section id="lentes" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-[#08090C] p-8 sm:p-14 space-y-8">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] font-bold uppercase tracking-wider">
                <Film className="size-4" />
                <span>Módulo 03</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
                Lentes Anamórficas & Óptica de Cinema
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                Substitua a textura digital lisa pela riqueza visual das lentes ópticas reais utilizadas nas grandes produções de cinema.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
              <div className="p-5 rounded-xl border border-white/10 bg-[#0C0D12] space-y-2">
                <span className="font-heading font-bold text-sm text-white">Lente Prime 35mm</span>
                <p className="text-xs text-muted-foreground">
                  Visão ampla com distorção periférica sutil e excelente profundidade para planos médios e gerais.
                </p>
              </div>
              <div className="p-5 rounded-xl border border-white/10 bg-[#0C0D12] space-y-2">
                <span className="font-heading font-bold text-sm text-white">Lente Portrait 85mm</span>
                <p className="text-xs text-muted-foreground">
                  Compressão elegante de planos de fundo com abertura f/1.4 gerando bokeh aveludado e separação de sujeito.
                </p>
              </div>
              <div className="p-5 rounded-xl border border-white/10 bg-[#0C0D12] space-y-2">
                <span className="font-heading font-bold text-sm text-white">Flare Anamórfico</span>
                <p className="text-xs text-muted-foreground">
                  Raios horizontais de luz em tons de azul ciano e âmbar solar inspirados em lentes anamórficas Panavision.
                </p>
              </div>
              <div className="p-5 rounded-xl border border-white/10 bg-[#0C0D12] space-y-2">
                <span className="font-heading font-bold text-sm text-white">Granulação de Película 35mm</span>
                <p className="text-xs text-muted-foreground">
                  Textura orgânica de grão cinematográfico master que confere peso estético e elimina o aspecto plástico digital.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 4: Formats & Aspect Ratios */}
        <section id="formatos" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0C0D12] to-[#08090C] p-8 sm:p-14 space-y-8">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] font-bold uppercase tracking-wider">
                <Maximize2 className="size-4" />
                <span>Módulo 04</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
                Multi-Formato & Exportação Master
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                Entregue seus projetos no formato ideal para cada tela, da sala de cinema IMAX à tela de bloqueio do smartphone.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
              {aspectRatios.map((ar) => (
                <div
                  key={ar.ratio}
                  className="rounded-2xl border border-white/10 bg-[#08090C] p-6 space-y-2"
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

        {/* CTA Section */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-[#FF5500]/30 bg-gradient-to-b from-[#0C0D12] to-black p-8 sm:p-14 text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Pronto para Experimentar no Studio?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Cadastre-se gratuitamente agora e receba 50 créditos imediatos para criar suas primeiras tomadas com lentes anamórficas e câmera 3D.
            </p>
            <div className="pt-2">
              <Link
                href="/sign-up"
                className="px-8 py-3.5 rounded-xl font-heading font-bold text-sm bg-[#FF5500] text-white hover:bg-[#ff681a] inline-flex items-center gap-2 shadow-[0_0_30px_rgba(255,85,0,0.4)]"
              >
                Começar Gratuitamente no Studio
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
