import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { LandingHeroActions } from "@/components/landing/landing-hero-actions";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Film,
  Camera,
  HeartHandshake,
  ShieldCheck,
  Clapperboard,
  Code2,
  Users2,
  Flag,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Manifesto & Sobre Nós — Tecnologia Aberta, Plataforma Brasileira",
  description:
    "Estamos construindo uma IA brasileira. Conheça o manifesto da Kriativa: tecnologia aberta, democratização da criação e todas as IAs em um só lugar.",
  openGraph: {
    title: "Estamos construindo uma IA brasileira — Kriativa.app",
    description:
      "Acreditamos que você não precisa de 10 assinaturas caras em dólar para criar. Conheça a história e os valores da Kriativa.",
  },
};

export default function SobrePage() {
  const values = [
    {
      title: "Tecnologia Aberta & Evolução Rápida",
      description:
        "A Kriativa utiliza modelos open source e tecnologias de ponta desenvolvidas pela comunidade global de inteligência artificial. Nós cuidamos da tecnologia; você cuida da criação.",
      icon: Code2,
    },
    {
      title: "Construída com a Comunidade Brasileira",
      description:
        "A Kriativa está no começo, e aqui você não é só mais um número. O seu feedback real define quais modelos integramos, quais ferramentas priorizamos e quais recursos devem existir.",
      icon: Users2,
    },
    {
      title: "Zero Lock-in & Preços Acessíveis em Reais",
      description:
        "Somos contra o modelo predatório de assinaturas que apagam seus créditos no fim do mês. Compre a partir de R$ 5 via PIX (créditos vitalícios) ou assine a Kriativa Ilimitada por R$ 200/mês para criar sem freio.",
      icon: HeartHandshake,
    },
    {
      title: "Sua Propriedade Intelectual é Sagrada",
      description:
        "Todo conteúdo que você gera na Kriativa é 100% seu. Não cobramos royalties, não reivindicamos direitos sobre seus roteiros ou mídias e oferecemos liberdade comercial irrestrita.",
      icon: ShieldCheck,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Manifesto da Kriativa.app — Estamos construindo uma IA brasileira",
    description:
      "A missão da Kriativa é reunir todas as inteligências artificiais que você precisa em um só lugar, com tecnologia aberta e acesso democrático.",
    publisher: {
      "@type": "Organization",
      name: "Kriativa.app",
      url: "https://kriativa.app",
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
            className="text-[10px] font-mono border-white/10 text-white/80 bg-white/5 mb-4 inline-flex items-center gap-1.5"
          >
            <Flag className="size-3 text-[#FF5500]" />
            <span>MANIFESTO BRASILEIRO</span>
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold uppercase tracking-tight max-w-4xl mx-auto leading-[0.98]">
            Estamos construindo{" "}
            <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent">
              uma IA brasileira.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
            Tecnologia aberta. Uma única plataforma. Sem a necessidade de assinar 5 ferramentas gringas diferentes em dólar para criar seus projetos.
          </p>

          <div className="mt-8 max-w-md mx-auto">
            <LandingHeroActions />
          </div>
        </section>

        {/* Narrative / Manifesto Body */}
        <section className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-[#08090C] p-8 sm:p-14 space-y-8 font-sans leading-relaxed text-sm sm:text-base text-muted-foreground">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
              Por que a Kriativa existe?
            </h2>

            <p>
              Quem tenta produzir conteúdo com inteligência artificial hoje se depara rapidamente com uma barreira frustrante: a fragmentação.
            </p>

            <p>
              Para criar uma imagem, você abre o Midjourney. Para animar essa imagem em vídeo, precisa assinar o Runway. Para colocar uma narração profissional, precisa do ElevenLabs. Para escrever o roteiro, recorre ao ChatGPT. No fim do mês, você está pagando centenas de reais em dólares com IOF no cartão de crédito, gerenciando 5 logins diferentes e perdendo créditos que expiram se não forem utilizados.
            </p>

            <blockquote className="border-l-2 border-[#FF5500] pl-5 py-2 my-4 text-white font-heading font-bold text-base sm:text-lg italic">
              &quot;Você escolhe o que quer criar. A Kriativa cuida da complexidade técnica.&quot;
            </blockquote>

            <p>
              A Kriativa nasceu para reunir essas tecnologias em uma só interface intuitiva, desenvolvida no Brasil e com faturamento nacional via PIX. Seja através de recargas flexíveis a partir de <strong>R$ 5,00</strong> com créditos que nunca expiram, ou através do plano <strong>Kriativa Ilimitada por R$ 200/mês</strong>, nosso objetivo é dar acesso total ao que há de mais avançado em IA sem enrolação.
            </p>

            <div className="pt-4 border-t border-white/10">
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                Você faz parte dessa construção
              </h3>
              <p>
                A Kriativa está começando agora. Isso significa que você não é apenas um usuário anônimo. O seu feedback direciona o produto: quais modelos de código aberto devemos integrar a seguir, quais fluxos facilitam o seu dia a dia e quais recursos deveriam existir.
              </p>
            </div>
          </div>
        </section>

        {/* Values Grid */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-white/10 text-white/80 bg-white/5"
            >
              Compromissos
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Os Pilares da Kriativa
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="rounded-2xl border border-white/10 bg-[#0C0D12] p-8 space-y-3.5 hover:border-white/20 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#FF5500] w-fit">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    {v.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Bottom */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-[#FF5500]/30 bg-gradient-to-b from-[#0C0D12] to-black p-8 sm:p-14 text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Entre desde o começo.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Crie sua conta gratuitamente sem cartão de crédito e comece a produzir com tecnologia de ponta.
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
