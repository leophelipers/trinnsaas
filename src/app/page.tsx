import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { LandingHeroActions } from "@/components/landing/landing-hero-actions";
import { LandingNo10Subs } from "@/components/landing/landing-no-10-subs";
import { LandingProductSuite } from "@/components/landing/landing-product-suite";
import { LandingChooseModel } from "@/components/landing/landing-choose-model";
import { LandingStartFree } from "@/components/landing/landing-start-free";
import { LandingPlans } from "@/components/landing/landing-plans";
import { LandingTargetAudience } from "@/components/landing/landing-target-audience";
import { LandingOpenSourceManifesto } from "@/components/landing/landing-open-source-manifesto";
import { LandingComparison } from "@/components/landing/landing-comparison";
import { LandingRoadmap } from "@/components/landing/landing-roadmap";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFinalCta } from "@/components/landing/landing-final-cta";
import { LandingAdDisclaimers } from "@/components/landing/landing-ad-disclaimers";
import { LandingMobileStickyBar } from "@/components/landing/landing-mobile-sticky-bar";
import { MotionConsole } from "@/components/kriativa/motion-console";
import { VideoShowcase } from "@/components/kriativa/video-showcase";
import { Sparkles, Sliders, Film } from "lucide-react";

export default function Home() {
  // Schema.org Structured Data for SEO & GEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Kriativa.app",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        offers: [
          {
            "@type": "Offer",
            name: "Créditos sob Demanda",
            price: "5.00",
            priceCurrency: "BRL",
            description: "Créditos a partir de R$ 5,00 para criar imagens, vídeos, áudios e textos sem mensalidade",
          },
          {
            "@type": "Offer",
            name: "Kriativa Ilimitada",
            price: "200.00",
            priceCurrency: "BRL",
            description: "Assinatura mensal de R$ 200,00 com uso contínuo dos modelos incluídos",
          },
          {
            "@type": "Offer",
            name: "Cadastro Gratuito",
            price: "0.00",
            priceCurrency: "BRL",
            description: "Cadastro gratuito sem cartão de crédito com acesso imediato à plataforma",
          },
        ],
        description:
          "Todas as IAs que você precisa em um só lugar. Imagens, vídeos, áudios e textos sem precisar assinar várias ferramentas.",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "840",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#050506] text-[#F8FAFC] flex flex-col selection:bg-[#FF5500] selection:text-white pb-20 md:pb-0 overflow-x-hidden">
      {/* Schema.org JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Público Unificado */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1 space-y-16 sm:space-y-24">
        
        {/* ======================================================== */}
        {/* SEÇÃO 01 — HERO (Todas as IAs que você precisa) */}
        {/* ======================================================== */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-24 text-center relative">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.14),transparent_70%)] pointer-events-none" />

          {/* Eyebrow do copy.md */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] font-mono text-neutral-300 mb-6 shadow-sm">
            <span className="size-2 rounded-full bg-[#FF5500] animate-pulse" />
            <span className="font-bold tracking-wider uppercase">A NOVA PLATAFORMA BRASILEIRA DE IA</span>
          </div>

          {/* Headline do copy.md */}
          <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black tracking-tight max-w-5xl mx-auto leading-[0.98] uppercase">
            Todas as IAs que você precisa.{" "}
            <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent">
              Em um só lugar.
            </span>
          </h1>

          {/* Subheadline do copy.md */}
          <div className="mt-6 space-y-2 max-w-3xl mx-auto">
            <p className="text-base sm:text-xl font-heading font-bold text-white uppercase tracking-wide">
              Imagens. Vídeos. Áudios. Textos.
            </p>
            <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
              Crie com diferentes modelos de inteligência artificial sem precisar assinar uma plataforma para cada tarefa.
            </p>
          </div>

          {/* CTA do copy.md */}
          <div className="mt-8">
            <LandingHeroActions />
          </div>

          {/* Categorias logo abaixo: Imagem · Vídeo · Áudio · Texto */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-mono text-neutral-400 border-y border-white/10 py-3.5">
            <span className="flex items-center gap-1.5 text-white font-medium">
              <span>🖼️</span> Imagem
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5 text-white font-medium">
              <span>🎬</span> Vídeo
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5 text-white font-medium">
              <span>🔊</span> Áudio
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5 text-white font-medium">
              <span>✍️</span> Texto
            </span>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SEÇÃO 02 — VOCÊ NÃO PRECISA DE 10 ASSINATURAS */}
        {/* ======================================================== */}
        <LandingNo10Subs />

        {/* ======================================================== */}
        {/* SEÇÃO 03 — SEÇÃO DE PRODUTO (Vision, Motion, Voice, Mind) */}
        {/* ======================================================== */}
        <LandingProductSuite />

        {/* ======================================================== */}
        {/* DEMONSTRAÇÃO VISUAL & CONSOLE DO ESTÚDIO */}
        {/* ======================================================== */}
        <section id="demonstracao" className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold">
              <Sliders className="size-3.5" />
              Interface em Tempo Real
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading font-black uppercase tracking-tight text-white">
              Veja a Plataforma em Ação
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Experimente a simulação de controle criativo e navegue pelas produções geradas.
            </p>
          </div>
          <MotionConsole />
          <VideoShowcase />
        </section>

        {/* ======================================================== */}
        {/* SEÇÃO 04 & 10 — ESCOLHA O MODELO / NÃO PRECISA ENTENDER */}
        {/* ======================================================== */}
        <LandingChooseModel />

        {/* ======================================================== */}
        {/* SEÇÃO 08 & 09 — PLANOS (Créditos & Kriativa Ilimitada) */}
        {/* ======================================================== */}
        <LandingPlans />

        {/* ======================================================== */}
        {/* SEÇÃO 07 — COMECE SEM PAGAR (Zero Fricção) */}
        {/* ======================================================== */}
        <LandingStartFree />

        {/* ======================================================== */}
        {/* SEÇÃO 13 — PARA QUEM É? */}
        {/* ======================================================== */}
        <LandingTargetAudience />

        {/* ======================================================== */}
        {/* SEÇÃO 11 & 12 — OPEN SOURCE + EMPRESA BRASILEIRA */}
        {/* ======================================================== */}
        <LandingOpenSourceManifesto />

        {/* ======================================================== */}
        {/* SEÇÃO 14 — COMPARAÇÃO (Kriativa vs Várias Ferramentas) */}
        {/* ======================================================== */}
        <LandingComparison />

        {/* ======================================================== */}
        {/* ROADMAP TRANSPARENTE DA PLATAFORMA */}
        {/* ======================================================== */}
        <LandingRoadmap />

        {/* ======================================================== */}
        {/* SEÇÃO 15 — FAQ DE CONVERSÃO */}
        {/* ======================================================== */}
        <LandingFaq />

        {/* ======================================================== */}
        {/* SEÇÃO 16 — CTA FINAL (Pare de procurar. Comece a criar) */}
        {/* ======================================================== */}
        <LandingFinalCta />

        {/* ======================================================== */}
        {/* SEÇÃO 17 — DISCLAIMERS DE ANÚNCIOS & CONFORMIDADE */}
        {/* ======================================================== */}
        <LandingAdDisclaimers />
      </main>

      {/* Barra de Conversão Mobile Sticky */}
      <LandingMobileStickyBar />

      {/* Rodapé Público Unificado */}
      <PublicFooter />
    </div>
  );
}
