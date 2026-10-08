import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { AuthHeroActions } from "@/components/auth-showcase";
import { MotionConsole } from "@/components/kriativa/motion-console";
import { VideoShowcase } from "@/components/kriativa/video-showcase";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Film,
  Sparkles,
  Zap,
  ShieldCheck,
  Eye,
  ArrowRight,
  Maximize2,
  Flame,
  CheckCircle2,
  Layers,
  Clapperboard,
  Sliders,
  DollarSign,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const cinemaPillars = [
    {
      title: "Controle de Câmera 3D em Tempo Real",
      description:
        "Defina trajetórias de drone FPV, órbitas 360°, dolly zoom (efeito Vertigo) e pans cinematográficos com física de inércia e aceleração realista.",
      icon: Camera,
      tag: "Câmera Pro",
    },
    {
      title: "Cofre de Consistência de Atores",
      description:
        "Gere múltiplos planos da mesma narrativa mantendo rigorosamente o mesmo ator, figurino, traços fisionômicos e iluminação entre cortes.",
      icon: Eye,
      tag: "Consistência Absoluta",
    },
    {
      title: "Lentes Anamórficas & Óptica Real",
      description:
        "Emulação física de lentes de 35mm e 85mm com flare anamórfico solar e ciano, granulação 35mm master e profundidade de campo f/1.4 real.",
      icon: Film,
      tag: "Óptica de Cinema",
    },
    {
      title: "Motores Proprietários de Alta Fidelidade",
      description:
        "Processamento por nós otimizados para cinema. Movimentos fluidos sem deformações anatômicas ou texturas plásticas comuns.",
      icon: Zap,
      tag: "Ultra Fidelidade",
    },
    {
      title: "Split Canvas com Diretor de IA",
      description:
        "Interface de roteiro integrada: transforme sinopses em especificações técnicas de tomadas, ângulos de câmera e parâmetros de iluminação.",
      icon: Clapperboard,
      tag: "Direção Narrativa",
    },
    {
      title: "Exportação em 4K Master & Multi-Formato",
      description:
        "Exporte em 2.39:1 (Cinema Anamórfico), 16:9 (Widescreen), 9:16 (TikTok/Reels) ou 1:1 com suporte a cores vibrantes de estúdio.",
      icon: Maximize2,
      tag: "Multi-Formato Master",
    },
  ];

  const useCases = [
    {
      role: "Agências & Publicidade",
      headline: "Comerciais de alto impacto em horas, não semanas",
      points: [
        "Apresente concepts e storyboards vivos para clientes",
        "Reduza até 80% do orçamento de set de filmagem",
        "Variações ilimitadas de cenários e iluminação solar",
      ],
    },
    {
      role: "Cineastas & Séries",
      headline: "Produza tomadas complexas com consistência narrativa",
      points: [
        "Mantenha o mesmo elenco ao longo de todos os episódios",
        "Efeitos visuais (VFX) e planos aéreos de difícil execução",
        "Aspect ratio 2.39:1 pronto para projeção cinematográfica",
      ],
    },
    {
      role: "Criadores de Conteúdo",
      headline: "Destaque visual absoluto no feed e nas redes",
      points: [
        "Vídeos verticais 9:16 com estética de filme hollywoodiano",
        "Movimentos de câmera dinâmicos que retêm atenção",
        "Gere com prompts simples ou refinamento profissional",
      ],
    },
  ];

  const faqItems = [
    {
      q: "Preciso de um computador potente para usar o Kriativa.app?",
      a: "Não. Toda a renderização pesada e os cálculos de física de câmera ocorrem na nuvem em nossas instâncias dedicadas de processamento. Você só precisa de um navegador comum no celular ou computador.",
    },
    {
      q: "Os créditos adquiridos expiram no fim do mês?",
      a: "Nunca. Ao contrário de plataformas que cobram assinaturas recorrentes e apagam créditos não utilizados, no Kriativa seus créditos são vitalícios e permanecem disponíveis até você decidir usá-los.",
    },
    {
      q: "Posso utilizar os vídeos gerados comercialmente?",
      a: "Sim, 100%. Todos os direitos autorais e patrimoniais sobre as imagens e vídeos renderizados pertencem exclusivamente a você, sem royalties adicionais.",
    },
    {
      q: "Como funciona a degustação gratuita de 50 créditos?",
      a: "Basta criar sua conta gratuitamente. Você recebe 50 créditos imediatos no Studio para testar comandos de câmera 3D e renderizar suas primeiras tomadas, sem necessidade de cadastrar cartão de crédito.",
    },
    {
      q: "Como o Kriativa garante a consistência do mesmo personagem em vários cortes?",
      a: "Utilizamos o Cofre de Consistência de Atores, que memoriza as feições, vestimentas e proporções do personagem, permitindo que você mude de ângulo, iluminação e plano sem desfigurar o ator.",
    },
    {
      q: "Quais são as formas de pagamento disponíveis?",
      a: "Aceitamos PIX com liberação instantânea de créditos em menos de 3 segundos e Cartão de Crédito em até 12 parcelas, com processo de pagamento totalmente seguro.",
    },
  ];

  // Schema.org Structured Data for SEO & Generative Engine Optimization (GEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Kriativa.app",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0.00",
          priceCurrency: "BRL",
          description: "50 créditos gratuitos de boas-vindas para novos criadores",
        },
        description:
          "Estúdio de cinema generativo com física de câmera 3D, lentes anamórficas virtuais e consistência de atores entre cortes.",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "840",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#050506] text-[#F8FAFC] flex flex-col selection:bg-[#FF5500] selection:text-white">
      {/* Schema.org JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Unified Public Header */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1 space-y-20 sm:space-y-28">
        {/* Hero Section */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 pt-16 sm:pt-28 text-center relative">
          {/* Subtle Ambient Background Glow in Solar Flare */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.12),transparent_70%)] pointer-events-none" />

          {/* Cinematic Telemetry HUD pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] font-mono text-muted-foreground mb-6 shadow-sm">
            <span className="size-2 rounded-full bg-[#FF5500] animate-pulse" />
            <span className="text-white font-medium">[REC] 4K MASTER</span>
            <span className="text-white/20">•</span>
            <span>60 FPS</span>
            <span className="text-white/20">•</span>
            <span>2.39:1 ANAMORPHIC</span>
            <span className="text-white/20">•</span>
            <span className="text-[#FF5500] font-semibold">3D MOTION DYNAMICS</span>
          </div>

          {/* Bold Display Headline with Syne Typography */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tight max-w-5xl mx-auto leading-[0.98] uppercase">
            Cinema Hiper-Realista.{" "}
            <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent">
              Câmera Absoluta.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-sans">
            A plataforma de IA generativa de vídeo para diretores, estúdios e
            criadores audiovisuais. Controle lentes 35mm, trajetórias de drone FPV
            com física de inércia real e garanta consistência total de atores
            entre cortes.
          </p>

          {/* Hero Actions */}
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <AuthHeroActions />
          </div>

          {/* Telemetry Strip */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] font-mono text-muted-foreground border-y border-white/10 py-3.5">
            <span className="flex items-center gap-1.5">
              <Flame className="size-3.5 text-[#FF5500]" />
              Física de Tecidos & Fluídos
            </span>
            <span className="flex items-center gap-1.5">
              <Camera className="size-3.5 text-[#00E5FF]" />
              Controle de Lentes 35mm / 85mm
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-[#FF5500]" />
              Feedback Reativo Instantâneo
            </span>
            <span className="flex items-center gap-1.5 text-white/90">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              50 Créditos Grátis no Cadastro
            </span>
          </div>
        </section>

        {/* Interactive Studio Prompt Console */}
        <section id="console" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
              Experimente o Console de Direção
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Selecione um estilo cinemático e teste a simulação de controle de câmera em tempo real.
            </p>
          </div>
          <MotionConsole />
        </section>

        {/* Video Showcase Gallery */}
        <section id="showcase" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold">
              <Film className="size-3.5" />
              Galeria de Produções
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-white uppercase">
              Tomadas Criadas com o Kriativa
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Veja o nível de iluminação volumétrica, fidelidade de textura e profundidade focal gerado em nossas instâncias.
            </p>
          </div>
          <VideoShowcase />
        </section>

        {/* The 6 Pillars of Generative Cinema */}
        <section id="features" className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold">
              <Sliders className="size-3.5" />
              Tecnologia de Vanguarda
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white uppercase">
              Por que diretores escolhem o Kriativa
            </h2>
            <p className="text-sm text-muted-foreground font-sans">
              Projetado desde a raiz para superar as limitações de inconsistência
              e falta de controle dos modelos de vídeo convencionais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cinemaPillars.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="bg-[#0C0D12] border-white/10 hover:border-[#FF5500]/50 transition-colors shadow-xl rounded-2xl group"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#FF5500] w-fit shadow-sm group-hover:scale-105 transition-transform">
                        <Icon className="size-5" />
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono border-white/10 text-white/70 bg-white/5"
                      >
                        {item.tag}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4 text-base font-heading font-bold text-white tracking-tight">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed font-sans">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/recursos"
              className="inline-flex items-center gap-2 text-xs font-mono text-[#FF5500] hover:text-[#ff7733] font-semibold transition-colors uppercase tracking-wider"
            >
              <span>Explorar Especificações Técnicas de Todos os Recursos</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-[#08090C] p-8 sm:p-14">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-[#FF5500]/30 text-[#FF5500] bg-[#FF5500]/10"
              >
                Casos de Uso
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
                Construído para Produções Reais
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Do storyboard preliminar à entrega final em 4K para cinema, televisão e mídia digital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {useCases.map((uc) => (
                <div
                  key={uc.role}
                  className="rounded-2xl border border-white/10 bg-[#0C0D12] p-6 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="text-xs font-mono text-[#FF5500] font-bold uppercase tracking-wider">
                      {uc.role}
                    </span>
                    <h3 className="font-heading font-bold text-base text-white leading-snug">
                      {uc.headline}
                    </h3>
                    <ul className="space-y-2 pt-2">
                      {uc.points.map((pt, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GEO AI & Competitor Comparison Teaser */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0C0D12] to-[#060608] p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl text-center lg:text-left">
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-white/10 text-white/80 bg-white/5"
                >
                  Comparativo de Mercado 2026
                </Badge>
                <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
                  Por que Diretores Migram de Outras IAs para o Kriativa?
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Enquanto geradores tradicionais dependem de sorte em caixas de prompt com câmeras imprevisíveis, o Kriativa oferece parâmetros de lentes físicas, persistência de atores e modelo de créditos sem cobranças mensais compulsórias.
                </p>
                <div className="pt-2">
                  <Link
                    href="/comparativo"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-xs bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all"
                  >
                    <span>Ver Tabela Comparativa Completa vs Runway, Pika & Sora</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              {/* Quick Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:max-w-md">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    ✓ Física de Câmera 3D Real
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Inércia, órbitas e Dolly Zoom Vertigo precisos.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    ✓ Cofre de Consistência
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Mesmo ator e vestimenta entre cortes sucessivos.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    ✓ Sem Assinatura Forçada
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Créditos vitalícios que nunca expiram no fim do mês.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    ✓ PIX Instantâneo
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Liberação de saldo em 3 segundos sem taxas extras.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Teaser Section */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold">
              <DollarSign className="size-3.5" />
              Preços Transparentes
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Pague Apenas Pelo que Renderizar
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sem mensalidades automáticas. Compre pacotes de créditos e utilize no seu próprio ritmo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="rounded-2xl border border-white/10 bg-[#0C0D12] p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Starter
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-mono text-muted-foreground">R$</span>
                  <span className="text-3xl font-heading font-black text-white">29,90</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  150 créditos para testes e tomadas pontuais.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>Créditos vitalícios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>Até 1080p Full HD</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>Controles básicos de câmera</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/precos"
                className="w-full py-2.5 rounded-xl font-heading font-bold text-xs bg-white/10 hover:bg-white/15 text-white text-center transition-colors block"
              >
                Ver Detalhes do Plano
              </Link>
            </div>

            {/* Creator (Popular) */}
            <div className="rounded-2xl border border-[#FF5500]/60 bg-gradient-to-b from-[#141210] to-[#0C0D12] p-6 space-y-5 flex flex-col justify-between shadow-[0_0_40px_rgba(255,85,0,0.15)] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#FF5500] text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-md">
                Mais Escolhido
              </div>
              <div className="space-y-3">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#FF5500]">
                  Creator Pro
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-mono text-muted-foreground">R$</span>
                  <span className="text-3xl font-heading font-black text-white">69,90</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  500 créditos com render acelerado e todos os movimentos.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>Física 3D total de câmera (FPV & Órbita)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>Cofre de Consistência ativo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>Fila prioritária de render</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/precos"
                className="w-full py-2.5 rounded-xl font-heading font-bold text-xs bg-[#FF5500] hover:bg-[#ff681a] text-white text-center transition-all shadow-[0_0_20px_rgba(255,85,0,0.35)] block"
              >
                Adquirir Pacote Creator
              </Link>
            </div>

            {/* Director */}
            <div className="rounded-2xl border border-white/10 bg-[#0C0D12] p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Director
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-mono text-muted-foreground">R$</span>
                  <span className="text-3xl font-heading font-black text-white">149,90</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  1.400 créditos para produções completas e séries.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>Exportação Master 4K UHD</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>Suporte a múltiplos atores consistentes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>Prioridade máxima no estúdio</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/precos"
                className="w-full py-2.5 rounded-xl font-heading font-bold text-xs bg-white/10 hover:bg-white/15 text-white text-center transition-colors block"
              >
                Ver Detalhes do Plano
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold">
              <HelpCircle className="size-3.5" />
              Tire Suas Dúvidas
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Perguntas Frequentes
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tudo o que você precisa saber para começar a dirigir com IA hoje mesmo.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#0C0D12] p-5 sm:p-6 space-y-2"
              >
                <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                  {item.q}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Big Call to Action (CTA) */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 pb-20">
          <div className="rounded-3xl border border-[#FF5500]/30 bg-gradient-to-b from-[#0C0D12] via-[#050506] to-black p-8 sm:p-16 text-center relative overflow-hidden shadow-2xl">
            {/* Glow effect in Solar Flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-[#FF5500]/15 blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#FF5500]/30 bg-[#FF5500]/10 text-xs font-mono text-[#FF5500] mb-4">
              <Sparkles className="size-3" />
              Crie sem cartão de crédito
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-white max-w-3xl mx-auto uppercase">
              Pronto para dirigir o seu próximo filme com IA?
            </h2>

            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto font-sans">
              Cadastre-se agora e receba 50 créditos imediatos de boas-vindas para experimentar o motor de movimento cinematográfico mais avançado da web.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-3.5 rounded-xl font-heading font-bold text-sm bg-[#FF5500] text-white hover:bg-[#ff681a] active:scale-[0.98] transition-all flex items-center gap-2 shadow-[0_0_35px_rgba(255,85,0,0.45)]"
              >
                Abrir Studio de Criação
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Unified Public Footer */}
      <PublicFooter />
    </div>
  );
}
