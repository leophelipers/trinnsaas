import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  QrCode,
  CreditCard,
  Lock,
  Layers,
  Flame,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Planos & Créditos Transparentes — Sem Assinatura",
  description:
    "Compre créditos de vídeo cinematográfico que nunca expiram. Pague apenas pelo que renderizar via PIX instantâneo ou cartão de crédito.",
  openGraph: {
    title: "Preços & Créditos — Kriativa.app",
    description:
      "Créditos vitalícios de cinema generativo sem mensalidade obrigatória. 50 créditos grátis no cadastro.",
  },
};

export default function PrecosPage() {
  const tiers = [
    {
      name: "Starter",
      badge: "Iniciação",
      price: "29,90",
      credits: "150 Créditos",
      costPerCredit: "R$ 0,19 por crédito",
      description: "Ideal para cineastas iniciantes, testes rápidos e comerciais curtos.",
      features: [
        "150 créditos vitalícios (nunca expiram)",
        "Até 15 tomadas em alta definição",
        "Controles de Câmera 3D básicos",
        "Formato 16:9 e 9:16 vertical",
        "Direitos comerciais irrestritos",
      ],
      ctaText: "Escolher Starter",
      highlighted: false,
    },
    {
      name: "Creator Pro",
      badge: "Mais Escolhido",
      price: "69,90",
      credits: "500 Créditos",
      costPerCredit: "R$ 0,13 por crédito",
      description: "O pacote favorito de diretores e criadores de conteúdo com alto ritmo de produção.",
      features: [
        "500 créditos vitalícios (nunca expiram)",
        "Até 50 tomadas cinematográficas",
        "Trajetórias completas de drone FPV e órbitas 360°",
        "Cofre de Consistência de Atores ativo",
        "Emulação de lentes 35mm e flare anamórfico",
        "Fila de processamento acelerada",
        "Direitos comerciais irrestritos",
      ],
      ctaText: "Adquirir Creator Pro",
      highlighted: true,
    },
    {
      name: "Director",
      badge: "Profissional",
      price: "149,90",
      credits: "1.400 Créditos",
      costPerCredit: "R$ 0,10 por crédito",
      description: "Para curta-metragens, séries, videoclipes e produções completas.",
      features: [
        "1.400 créditos vitalícios (+15% bônus incluso)",
        "Até 140 tomadas completas",
        "Consistência de múltiplos atores na mesma cena",
        "Exportação em 4K Master Ultra-Wide (2.39:1)",
        "Split Canvas com Diretor de IA completo",
        "Prioridade máxima na fila de renderização",
        "Direitos comerciais irrestritos",
      ],
      ctaText: "Escolher Director",
      highlighted: false,
    },
    {
      name: "Cinema Master",
      badge: "Estúdios & Agências",
      price: "299,90",
      credits: "3.200 Créditos",
      costPerCredit: "R$ 0,09 por crédito",
      description: "Para produtoras de vídeo e agências que demandam volume diário contínuo.",
      features: [
        "3.200 créditos vitalícios (+25% bônus incluso)",
        "Até 320+ tomadas em ultra-definição",
        "Processamento concorrente multitarefa",
        "Acesso antecipado a novos motores cinemáticos",
        "Exportação ProRes / DCI-P3 em alta fidelidade",
        "Canal direto de suporte técnico para estúdios",
        "Direitos comerciais irrestritos",
      ],
      ctaText: "Escolher Cinema Master",
      highlighted: false,
    },
  ];

  const consumptionExamples = [
    {
      title: "Concept Art / Imagem Estática",
      credits: "2 a 4 créditos",
      detail: "Exploração visual de cenários, iluminação dramática e arquétipos de personagens.",
    },
    {
      title: "Tomada Padrão HD (5s)",
      credits: "10 a 15 créditos",
      detail: "Movimento suave de câmera em 1080p widescreen ou vertical para redes.",
    },
    {
      title: "Câmera 3D Dinâmica (Dolly / FPV)",
      credits: "15 a 25 créditos",
      detail: "Física de aceleração, voo rasante e órbitas com profundidade focal ativa.",
    },
    {
      title: "Master Cinemático 4K Anamórfico",
      credits: "25 a 35 créditos",
      detail: "Renderização em 2.39:1 com simulação de granulação 35mm e flare solar.",
    },
  ];

  const pricingFaq = [
    {
      q: "Por que o modelo de créditos é melhor do que assinaturas mensais?",
      a: "Porque na maioria das ferramentas de vídeo com IA, você paga uma mensalidade fixa de R$ 150 a R$ 300 e, se não gastar todos os créditos antes da virada do mês, você perde tudo. No Kriativa, seus créditos nunca expiram. Você compra quando precisa e usa exatamente quando tiver um projeto ativo.",
    },
    {
      q: "Como recebo os créditos após o pagamento?",
      a: "Instantaneamente. No pagamento via PIX, o sistema reconhece o pagamento em menos de 3 segundos e injeta os créditos no seu saldo do Studio em tempo real. No cartão de crédito, a aprovação é imediata.",
    },
    {
      q: "Posso recarregar um valor personalizado além dos pacotes prontos?",
      a: "Sim. Dentro do Studio você tem a opção de Recarga Livre, onde pode digitar qualquer quantia entre R$ 10,00 e R$ 1.000,00 com cálculo automático de créditos bônus para compras maiores.",
    },
    {
      q: "Os vídeos gerados têm marca d'água?",
      a: "Não. Em nenhum dos pacotes (inclusive nas tomadas criadas com a cota gratuita) os seus vídeos recebem marca d'água ou logotipos.",
    },
    {
      q: "Tenho nota fiscal e recibo para despesas de empresa/agência?",
      a: "Sim. Todas as transações geram comprovante fiscal detalhado com data, código de operação e discriminação de créditos para contabilidade.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Créditos de Renderização de Cinema Generativo Kriativa.app",
    description:
      "Pacotes de créditos vitalícios para geração de vídeos cinematográficos com IA, controle de câmera 3D e lentes anamórficas.",
    brand: {
      "@type": "Brand",
      name: "Kriativa.app",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: "29.90",
      highPrice: "299.90",
      offerCount: "4",
      offers: tiers.map((t) => ({
        "@type": "Offer",
        name: t.name,
        price: t.price.replace(",", "."),
        priceCurrency: "BRL",
        description: t.description,
        availability: "https://schema.org/InStock",
      })),
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
        {/* Header Hero */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-white/10 text-white/80 bg-white/5 mb-4"
          >
            Zero Assinaturas • 100% On-Demand
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold uppercase tracking-tight max-w-4xl mx-auto leading-[0.98]">
            Preços Transparentes.{" "}
            <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent">
              Seus Créditos Nunca Expiram.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
            Eliminamos as mensalidades forçadas do mercado de IA. Compre o pacote que se encaixa no seu projeto, renderize tomadas cinematográficas e mantenha seu saldo intacto para sempre.
          </p>

          {/* Free Trial Banner Pill */}
          <div className="mt-8 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 font-sans shadow-lg">
            <Sparkles className="size-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Novo no Kriativa?</strong> Ganhe 50 créditos gratuitos imediatamente ao se cadastrar.
            </span>
            <Link
              href="/sign-up"
              className="font-bold underline hover:text-white transition-colors ml-1"
            >
              Criar conta grátis →
            </Link>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 ${
                  t.highlighted
                    ? "border-[#FF5500] bg-gradient-to-b from-[#181310] via-[#0D0D12] to-[#08080C] shadow-[0_0_50px_rgba(255,85,0,0.2)] relative"
                    : "border-white/10 bg-[#0C0D12] hover:border-white/20"
                }`}
              >
                {t.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#FF5500] text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-md">
                    {t.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm uppercase tracking-wider text-white">
                      {t.name}
                    </span>
                    {!t.highlighted && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono border-white/10 text-muted-foreground bg-white/5"
                      >
                        {t.badge}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-mono text-muted-foreground">R$</span>
                      <span className="text-4xl font-heading font-black text-white">
                        {t.price}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#FF5500] font-bold mt-1">
                      {t.credits}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {t.costPerCredit}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed font-sans pt-1">
                    {t.description}
                  </p>

                  <div className="pt-3 border-t border-white/10 space-y-2.5">
                    {t.features.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href="/dashboard"
                    className={`w-full py-3 rounded-xl font-heading font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      t.highlighted
                        ? "bg-[#FF5500] hover:bg-[#ff681a] text-white shadow-[0_0_25px_rgba(255,85,0,0.4)]"
                        : "bg-white/10 hover:bg-white/15 text-white"
                    }`}
                  >
                    <span>{t.ctaText}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How Credits Work Section */}
        <section className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-[#08090C] p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-white/10 text-white/80 bg-white/5"
              >
                Transparência de Consumo
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
                Como os Créditos São Gastos no Studio?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Cada fluxo possui um tempo e fidelidade visual específicos. Você sabe exatamente quantos créditos cada renderização consome antes de clicar no botão.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {consumptionExamples.map((ex, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#0C0D12] p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-white">
                      {ex.title}
                    </span>
                    <span className="font-mono text-xs text-[#FF5500] font-bold">
                      {ex.credits}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {ex.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Payment Trust Badges */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-xs text-muted-foreground font-mono">
              <div className="flex items-center gap-2 text-white">
                <QrCode className="size-4 text-[#00E5FF]" />
                <span>PIX Instantâneo (3 segundos)</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CreditCard className="size-4 text-[#FF5500]" />
                <span>Cartão em até 12x</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Lock className="size-4 text-emerald-400" />
                <span>Criptografia de Ponta a Ponta</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing FAQ */}
        <section className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold">
              <HelpCircle className="size-3.5" />
              Perguntas sobre Pagamento & Créditos
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
              Dúvidas Frequentes sobre Preços
            </h2>
          </div>

          <div className="space-y-4">
            {pricingFaq.map((item, idx) => (
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

        {/* CTA Bottom */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-[#FF5500]/30 bg-gradient-to-b from-[#0C0D12] to-black p-8 sm:p-14 text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Comece Agora com 50 Créditos Grátis
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Teste o controle tridimensional de câmera e gere suas primeiras tomadas antes de decidir comprar qualquer pacote de créditos.
            </p>
            <div className="pt-2">
              <Link
                href="/sign-up"
                className="px-8 py-3.5 rounded-xl font-heading font-bold text-sm bg-[#FF5500] text-white hover:bg-[#ff681a] inline-flex items-center gap-2 shadow-[0_0_30px_rgba(255,85,0,0.4)]"
              >
                Cadastrar e Resgatar 50 Créditos
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
