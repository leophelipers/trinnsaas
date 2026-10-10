import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { LandingHeroActions } from "@/components/landing/landing-hero-actions";
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
  Check,
  RefreshCw,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Planos & Ofertas — A partir de R$ 5 ou Ilimitado por R$ 200/mês",
  description:
    "Escolha como quer criar na Kriativa: compre créditos a partir de R$ 5 que nunca expiram via PIX ou assine a Kriativa Ilimitada por R$ 200/mês com IA ilimitada.",
  openGraph: {
    title: "Planos & Ofertas — Kriativa.app",
    description:
      "A partir de R$ 5 ou R$ 200/mês Ilimitado. Imagens, vídeos, áudios e textos sem precisar de 10 assinaturas.",
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
      description: "Ideal para criadores iniciantes, testes rápidos e comerciais curtos.",
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
      description: "O pacote favorito de criadores e social medias com ritmo contínuo de produção.",
      features: [
        "500 créditos vitalícios (nunca expiram)",
        "Até 50 tomadas cinematográficas",
        "Trajetórias de drone FPV e órbitas 360°",
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
      description: "Para campanhas publicitárias completas, curta-metragens e videoclipes.",
      features: [
        "1.400 créditos vitalícios (+15% bônus incluso)",
        "Até 140 tomadas completas",
        "Consistência de múltiplos atores na mesma cena",
        "Exportação em 4K Master Ultra-Wide (2.39:1)",
        "Direção e roteirização assistida completa",
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
      description: "Para produtoras de vídeo e agências que demandam alto volume semanal.",
      features: [
        "3.200 créditos vitalícios (+25% bônus incluso)",
        "Até 320+ tomadas em ultra-definição",
        "Processamento concorrente multitarefa",
        "Acesso prioritário a novos motores cinemáticos",
        "Exportação em alta fidelidade ProRes",
        "Canal direto de suporte técnico para estúdios",
        "Direitos comerciais irrestritos",
      ],
      ctaText: "Escolher Cinema Master",
      highlighted: false,
    },
  ];

  const consumptionExamples = [
    {
      title: "Kriativa Vision / Imagem Estática",
      credits: "2 a 4 créditos",
      detail: "Exploração visual de posts, produtos, cenários e conceitos em alta resolução.",
    },
    {
      title: "Kriativa Motion / Vídeo HD (5s)",
      credits: "10 a 15 créditos",
      detail: "Movimento cinematográfico suave em widescreen (16:9) ou vertical (9:16).",
    },
    {
      title: "Câmera 3D Dinâmica (Dolly / FPV Drone)",
      credits: "15 a 25 créditos",
      detail: "Física de aceleração, voo rasante e órbitas 360° com profundidade focal ativa.",
    },
    {
      title: "Kriativa Voice & Mind / Voz + Roteiro",
      credits: "1 a 3 créditos",
      detail: "Roteiro técnico completo com decupagem ou narração de locução neural realista.",
    },
  ];

  const pricingFaq = [
    {
      q: "Preciso pagar para criar minha conta?",
      a: "Não. O cadastro é gratuito e você não precisa inserir cartão de crédito para começar. Você recebe 50 créditos imediatos de boas-vindas.",
    },
    {
      q: "Quanto custa usar a Kriativa?",
      a: "Você pode comprar créditos flexíveis a partir de R$ 5,00 ou assinar o plano Kriativa Ilimitada por R$ 200,00/mês.",
    },
    {
      q: "Os créditos expiram?",
      a: "Não. Os créditos comprados nunca expiram. Você compra quando precisa e usa exatamente quando tiver um projeto ativo.",
    },
    {
      q: "Posso cancelar a assinatura ilimitada a qualquer momento?",
      a: "Sim. A assinatura não tem fidelidade ou multa. Você pode cancelar quando quiser diretamente no painel da sua conta.",
    },
    {
      q: "O que significa 'ilimitado'?",
      a: "Significa uso contínuo dos recursos incluídos na assinatura dentro dos limites técnicos, operacionais e de uso justo da plataforma. Alguns modelos podem ter limites específicos de disponibilidade.",
    },
    {
      q: "E se um modelo de IA atingir o limite temporário?",
      a: "Você não fica parado. A Kriativa trabalha com diferentes modelos integrados. Quando um modelo atingir seu limite de utilização, a plataforma direcionará sua solicitação para uma alternativa disponível para que sua produção não pare.",
    },
    {
      q: "Como recebo os créditos após o pagamento?",
      a: "Instantaneamente. No pagamento via PIX, o sistema reconhece a liquidação em menos de 3 segundos e injeta os créditos no seu saldo em tempo real. No cartão de crédito, a aprovação é imediata.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Planos e Créditos da Kriativa.app",
    description:
      "Créditos a partir de R$ 5 que nunca expiram e plano Kriativa Ilimitada por R$ 200/mês para geração de imagens, vídeos, áudios e textos com IA.",
    brand: {
      "@type": "Brand",
      name: "Kriativa.app",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: "5.00",
      highPrice: "299.90",
      offerCount: "6",
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
            PLANOS & OFERTAS TRANSPARENTES
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold uppercase tracking-tight max-w-4xl mx-auto leading-[0.98]">
            Escolha como você{" "}
            <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent">
              quer criar.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
            Pague apenas conforme usa com créditos a partir de R$ 5 que nunca expiram, ou assine a Kriativa Ilimitada por R$ 200/mês para criar sem freio.
          </p>

          {/* Free Trial Banner Pill */}
          <div className="mt-8 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 font-sans shadow-lg">
            <Sparkles className="size-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Você não precisa comprar nada para começar:</strong> Crie sua conta gratuitamente e receba 50 créditos imediatos.
            </span>
          </div>
        </section>

        {/* The 2 Core Offers from copy.md */}
        <section id="ofertas" className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Offer 1: Créditos a partir de R$ 5 */}
            <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-950/20 via-[#0A0D14] to-[#06080C] p-8 sm:p-10 space-y-6 flex flex-col justify-between transition-all hover:border-sky-500/50 shadow-xl">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-sky-500/40 text-sky-400 bg-sky-500/10 text-xs font-mono font-bold">
                    🟦 CRÉDITOS AVULSOS
                  </Badge>
                  <span className="text-xs font-mono text-neutral-400">Pague pelo que usar</span>
                </div>

                <div>
                  <span className="text-xs font-mono text-sky-400 uppercase tracking-wider block font-bold">
                    Recarga Flexível
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-mono text-neutral-400">A partir de</span>
                    <span className="text-4xl sm:text-5xl font-heading font-black text-white">
                      R$ 5
                    </span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 font-mono text-xs font-bold">
                    <span>70 créditos totais</span>
                    <span className="text-neutral-400 text-[10px]">(50 bônus + 20)</span>
                  </div>
                </div>

                <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                  Para quem quer pagar conforme usa, sem compromisso mensal ou surpresas na fatura.
                </p>

                <ul className="space-y-3 pt-4 border-t border-white/10 text-sm text-neutral-200">
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>Compra quando quiser via PIX</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-sky-400 shrink-0 mt-0.5" />
                    <span><strong>Créditos não expiram:</strong> use no seu próprio ritmo</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>Escolha quanto comprar</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>Sem mensalidade forçada</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>Acesso a todos os recursos disponíveis</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-2.5">
                <Link
                  href="/sign-up"
                  className="w-full py-4 rounded-2xl font-heading font-black text-sm uppercase tracking-wider bg-sky-500 hover:bg-sky-400 text-black transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(14,165,233,0.3)] active:scale-[0.98]"
                >
                  <Sparkles className="size-4 fill-black" />
                  <span>COMEÇAR GRÁTIS</span>
                  <ArrowRight className="size-4" />
                </Link>
                <p className="text-[11px] text-center text-neutral-400 font-sans">
                  Você poderá comprar créditos depois de criar sua conta.
                </p>
              </div>
            </div>

            {/* Offer 2: Kriativa Ilimitada R$ 200/mês */}
            <div className="rounded-3xl border-2 border-emerald-500/60 bg-gradient-to-b from-emerald-950/25 via-[#0A140F] to-[#060C08] p-8 sm:p-10 space-y-6 flex flex-col justify-between transition-all relative shadow-[0_0_50px_rgba(16,185,129,0.25)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-heading font-black text-[11px] uppercase tracking-wider shadow-lg">
                ASSINATURA COMPLETA
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs font-mono font-bold">
                    🟩 KRIATIVA ILIMITADA
                  </Badge>
                  <span className="text-xs font-mono text-emerald-400 font-bold">Zero Limite de Criação</span>
                </div>

                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                    Acesso Ilimitado
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-heading font-black text-white">
                      R$ 200
                    </span>
                    <span className="text-sm font-mono text-neutral-400">/mês</span>
                  </div>
                  <div className="mt-2 text-xs font-sans text-neutral-300">
                    Crie sem ficar contando créditos.
                  </div>
                </div>

                <p className="text-sm text-neutral-200 font-sans leading-relaxed">
                  Para criadores, produtoras e agências que demandam geração contínua em escala profissional.
                </p>

                <ul className="space-y-3 pt-4 border-t border-white/10 text-sm text-neutral-200">
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Imagens ilimitadas</strong> (Kriativa Vision)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Vídeos ilimitados</strong> (Kriativa Motion)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Áudios e vozes ilimitadas</strong> (Kriativa Voice)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Textos e roteiros ilimitados</strong> (Kriativa Mind)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Acesso completo aos modelos incluídos na plataforma</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Uso contínuo dentro dos limites da plataforma</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Cancele quando quiser</strong> sem multas</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-2.5">
                <Link
                  href="/sign-up"
                  className="w-full py-4 rounded-2xl font-heading font-black text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:opacity-95 text-black transition-all flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(16,185,129,0.35)] active:scale-[0.98]"
                >
                  <Sparkles className="size-4 fill-black" />
                  <span>COMEÇAR GRÁTIS</span>
                  <ArrowRight className="size-4" />
                </Link>
                <p className="text-[11px] text-center text-neutral-400 font-sans">
                  Crie sua conta gratuitamente e conheça a plataforma antes de assinar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 9: "E se um modelo atingir o limite?" from copy.md */}
        <section className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-[#08090C] p-8 sm:p-12 space-y-5 text-center">
            <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <RefreshCw className="size-6 animate-spin-slow" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
              E se um modelo atingir o limite?
            </h2>
            <p className="text-base font-heading font-bold text-emerald-400 uppercase tracking-wide">
              Você não fica parado.
            </p>
            <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed max-w-2xl mx-auto">
              A Kriativa trabalha com diferentes modelos integrados. Por isso, quando um modelo atingir seu limite de utilização ou passar por manutenção momentânea, a plataforma poderá direcionar sua solicitação para uma alternativa disponível de qualidade equivalente.
            </p>
            <div className="pt-2 font-heading font-black text-sm text-white uppercase tracking-wider">
              Você continua criando sem interrupções.
            </div>
          </div>
        </section>

        {/* Volume Packs for Studios */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-white/10 text-white/80 bg-white/5"
            >
              PACOTES DE VOLUME AVULSO
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Para Produtoras & Estúdios com Alto Fluxo
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Se você prefere adquirir pacotes em lote com descontos progressivos por crédito e mantê-los na conta para sempre.
            </p>
          </div>

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
                    href="/dashboard/credits"
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
                Como os Créditos São Gastos?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Cada fluxo possui um tempo e fidelidade visual específicos. Você sabe exatamente quantos créditos cada renderização consome antes de executar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {consumptionExamples.map((ex, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#0C0D12] p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-white">
                      {ex.title}
                    </span>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] text-[#FF5500] border-[#FF5500]/30 bg-[#FF5500]/10"
                    >
                      {ex.credits}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {ex.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PIX & Guarantee Section */}
        <section id="pix" className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-[#08090C] p-8 sm:p-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#FF5500] w-fit">
                  <QrCode className="size-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-white">
                  Pagamento Instantâneo via PIX
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Créditos liberados em menos de 3 segundos no saldo da plataforma sem necessidade de confirmação manual ou demora bancária.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-emerald-400 w-fit">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-white">
                  Créditos Vitalícios
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ao contrário das plataformas tradicionais que expiram seus créditos no final do ciclo, aqui o que você adquire permanece disponível para sempre.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#00E5FF] w-fit">
                  <Lock className="size-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-white">
                  Checkout 100% Blindado
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Processamento via Mercado Pago com criptografia de ponta a ponta e total conformidade com a LGPD e o sistema financeiro nacional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing FAQ Section */}
        <section className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold">
              <HelpCircle className="size-3.5" />
              Perguntas Frequentes
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Tire Suas Dúvidas Sobre Preços
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Transparência completa em todos os planos e modelos de recarga.
            </p>
          </div>

          <div className="space-y-4">
            {pricingFaq.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#0C0D12] p-6 space-y-2.5"
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
              Comece sem gastar nada hoje.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Ganhe 50 créditos imediatos de boas-vindas ao se cadastrar e teste nossos modelos de imagem, vídeo, áudio e texto.
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
