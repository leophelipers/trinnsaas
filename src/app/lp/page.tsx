import type { Metadata } from "next";
import { LpHeader } from "@/components/lp/lp-header";
import { LpHero } from "@/components/lp/lp-hero";
import { LpPresentation } from "@/components/lp/lp-presentation";
import { LpTools } from "@/components/lp/lp-tools";
import { LpProblem } from "@/components/lp/lp-problem";
import { LpHowItWorks } from "@/components/lp/lp-how-it-works";
import { LpDifferentials } from "@/components/lp/lp-differentials";
import { LpDemos } from "@/components/lp/lp-demos";
import { LpPricing } from "@/components/lp/lp-pricing";
import { LpTech } from "@/components/lp/lp-tech";
import { LpFaq } from "@/components/lp/lp-faq";
import { LpFinalCta } from "@/components/lp/lp-final-cta";
import { LpFooter } from "@/components/lp/lp-footer";
import { LpStickyBar } from "@/components/lp/lp-sticky-bar";

export const metadata: Metadata = {
  title: "KRIATIVA — Todas as IAs que você precisa. Em um só lugar.",
  description:
    "Crie imagens incríveis, vídeos cinematográficos, vozes com inteligência artificial e textos para seus projetos em uma única plataforma. Comece grátis sem cartão de crédito.",
  keywords: [
    "kriativa ia",
    "todas as ias em um so lugar",
    "inteligencia artificial para criar mais",
    "kriativa vision motion voice mind",
    "gerador de imagem video audio texto brasil",
    "ia brasileira sem mensalidade",
  ],
  openGraph: {
    title: "KRIATIVA — Inteligência artificial para criar mais.",
    description:
      "Todas as IAs que você precisa em um só lugar: Imagens, vídeos, áudios e textos em uma única plataforma.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function LandingPageDedicated() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Kriativa.app",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        description:
          "Plataforma brasileira de inteligência artificial que reúne ferramentas de geração de imagens, vídeos cinematográficos, áudios e textos.",
        offers: [
          {
            "@type": "Offer",
            name: "Créditos Avulsos",
            price: "5.00",
            priceCurrency: "BRL",
            description: "70 créditos por R$ 5 (com bônus de boas-vindas). Créditos não expiram.",
          },
          {
            "@type": "Offer",
            name: "Plano Mensal Ilimitado",
            price: "200.00",
            priceCurrency: "BRL",
            description: "Acesso recorrente às ferramentas incluídas na assinatura.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "A Kriativa é gratuita?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Criar uma conta é gratuito e não exige cartão de crédito. O acesso às gerações e aos recursos de cada ferramenta depende das condições disponíveis na plataforma.",
            },
          },
          {
            "@type": "Question",
            name: "Como funcionam os créditos?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Você pode comprar pacotes a partir de R$ 5, com 70 créditos. Os créditos comprados não expiram.",
            },
          },
          {
            "@type": "Question",
            name: "Como funciona o plano mensal de R$ 200?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "O plano oferece acesso aos recursos incluídos na assinatura, sujeito às condições de uso justo e aos limites técnicos de cada ferramenta.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#050506] text-[#F8FAFC] flex flex-col selection:bg-[#FF5500] selection:text-white pb-20 md:pb-0 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header com navegação e botão Começar Grátis */}
      <LpHeader />

      <main className="flex-1 space-y-4 sm:space-y-8">
        {/* HERO — Primeira dobra */}
        <LpHero />

        {/* SEÇÃO 2 — Apresentação */}
        <LpPresentation />

        {/* SEÇÃO 3 — Ferramentas (Vision, Motion, Voice, Mind) */}
        <LpTools />

        {/* SEÇÃO 4 — O problema */}
        <LpProblem />

        {/* SEÇÃO 5 — Como funciona (Passos 1 a 4) */}
        <LpHowItWorks />

        {/* SEÇÃO 6 — Diferenciais */}
        <LpDifferentials />

        {/* SEÇÃO 7 — Demonstrações */}
        <LpDemos />

        {/* SEÇÃO 8 — Preços (R$ 5 e R$ 200/mês) */}
        <LpPricing />

        {/* SEÇÃO 9 — Tecnologias */}
        <LpTech />

        {/* SEÇÃO 10 — Perguntas frequentes */}
        <LpFaq />

        {/* SEÇÃO 11 — CTA FINAL */}
        <LpFinalCta />
      </main>

      {/* RODAPÉ + DISCLAIMERS DO META & ANÚNCIOS */}
      <LpFooter />

      {/* Sticky Conversion Bar no Mobile */}
      <LpStickyBar />
    </div>
  );
}
