import Link from "next/link";
import { AuthNavControls, AuthHeroActions } from "@/components/auth-showcase";
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
  Cpu,
  Eye,
  ArrowRight,
  Maximize2,
  Flame,
} from "lucide-react";

export default function Home() {
  const competitorFeatures = [
    {
      title: "Controle de Câmera 3D em Tempo Real",
      description:
        "Defina trajetórias de drone FPV, órbitas 360°, dolly zoom (efeito Vertigo) e pans cinematográficos com física de inércia real.",
      icon: Camera,
      tag: "Câmera Pro",
    },
    {
      title: "Consistência de Atores & Estilo",
      description:
        "Gere múltiplos planos da mesma cena mantendo o mesmo personagem, roupa, penteado e iluminação sem distorções entre cortes.",
      icon: Eye,
      tag: "Consistência",
    },
    {
      title: "Lentes Anamórficas & Física de Luz",
      description:
        "Emulação óptica de lentes 35mm e 85mm com flare anamórfico solar e ciano, granulação 35mm e profundidade de campo f/1.4 real.",
      icon: Film,
      tag: "Óptica de Cinema",
    },
    {
      title: "Motor Reativo Ultrarrápido em Tempo Real",
      description:
        "Arquitetura 100% reativa via WebSockets. Acompanhe o progresso de cada frame renderizado em tempo real sem recarregar a tela.",
      icon: Zap,
      tag: "Zero Latência",
    },
    {
      title: "Proteção Antifraude Integrada (50 Free)",
      description:
        "Sistema que bloqueia e-mails descartáveis, unifica e-mails canônicos e valida hardware fingerprint para proteger a cota free.",
      icon: ShieldCheck,
      tag: "Segurança Fair-Use",
    },
    {
      title: "Exportação em 4K ProRes & Vários Formatos",
      description:
        "Exporte em 2.39:1 (Cinema Ultra-Wide), 16:9 (Widescreen), 9:16 (TikTok/Reels) ou 1:1 com suporte a cores DCI-P3.",
      icon: Maximize2,
      tag: "Multi-Formato",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050506] text-[#F8FAFC] flex flex-col selection:bg-[#FF5500] selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050506]/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="size-9 rounded-xl bg-gradient-to-br from-[#FF5500] via-[#FF4500] to-[#CC3700] text-white flex items-center justify-center font-heading font-black text-sm shadow-[0_0_20px_rgba(255,85,0,0.4)] border border-white/20 group-hover:scale-105 transition-transform">
                K
              </div>
              <div className="flex items-baseline">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white uppercase">
                  kriativa
                </span>
                <span className="font-mono text-sm text-[#FF5500] font-bold">
                  .app
                </span>
              </div>
            </Link>
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-white/10 text-white/70 bg-white/5 hidden sm:inline-flex"
            >
              v2.4 MOTION
            </Badge>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider">
            <a href="#console" className="hover:text-white transition-colors">
              Studio Console
            </a>
            <a href="#showcase" className="hover:text-white transition-colors">
              Galeria
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Diferenciais
            </a>
            <Link
              href="/dashboard"
              className="hover:text-[#FF5500] transition-colors font-mono font-semibold"
            >
              Área do Criador →
            </Link>
          </nav>

          {/* Auth Controls */}
          <div className="flex items-center gap-3">
            <AuthNavControls />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-16 sm:space-y-24">
        {/* Hero Section */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 pt-16 sm:pt-28 text-center relative">
          {/* Subtle Ambient Background Glow in Solar Flare */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.12),transparent_70%)] pointer-events-none" />

          {/* Cinematic Telemetry HUD pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] font-mono text-muted-foreground mb-6 shadow-sm">
            <span className="size-2 rounded-full bg-[#FF5500] animate-pulse" />
            <span className="text-white font-medium">[REC] 4K UHD</span>
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
            criadores visuais. Controle lentes 35mm, trajetórias de drone FPV e
            crie tomadas cinematográficas a partir de texto com física de movimento
            real e consistência total.
          </p>

          {/* Hero Actions */}
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <AuthHeroActions />
          </div>

          {/* Telemetry Ticker */}
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
              Zero Latency WebSocket
            </span>
            <span className="flex items-center gap-1.5 text-white/90">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              50 Créditos Grátis no Cadastro
            </span>
          </div>
        </section>

        {/* Interactive Studio Prompt Console (Higgsfield Style) */}
        <section id="console" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <MotionConsole />
        </section>

        {/* Video Showcase Gallery */}
        <section id="showcase" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <VideoShowcase />
        </section>

        {/* Competitor / Feature Grid */}
        <section id="features" className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold">
              <Cpu className="size-3.5" />
              Tecnologia de Vanguarda
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white uppercase">
              Por que diretores escolhem o Kriativa
            </h2>
            <p className="text-sm text-muted-foreground font-sans">
              Projetado desde a raiz para superar as limitações de inconsistência
              e falta de controle dos modelos de vídeo tradicionais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitorFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="bg-[#0C0D12] border-white/10 hover:border-[#FF5500]/50 transition-colors shadow-xl rounded-2xl"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#FF5500] w-fit shadow-sm">
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
              Cadastre-se agora e receba 50 créditos gratuitos verificados por
              dispositivo para experimentar o motor de movimento cinematográfico
              mais avançado do mercado.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-3.5 rounded-xl font-heading font-bold text-sm bg-[#FF5500] text-white hover:bg-[#ff681a] active:scale-[0.98] transition-all flex items-center gap-2 shadow-[0_0_35px_rgba(255,85,0,0.45)]"
              >
                Abrir Studio no Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/90 py-10 text-xs text-muted-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-white tracking-tight">kriativa.app</span>
            <span className="text-white/20">•</span>
            <span>The Next-Gen AI Cinema & Generative Motion Studio.</span>
          </div>

          <div className="flex items-center gap-5 font-mono text-[11px]">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Studio
            </Link>
            <Link href="/dashboard/tasks" className="hover:text-white transition-colors">
              Fila de Render
            </Link>
            <Link href="/dashboard/profile" className="hover:text-white transition-colors">
              Conta & Antifraude
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
