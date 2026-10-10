import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { LandingHeroActions } from "@/components/landing/landing-hero-actions";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Bot,
  Layers,
  Zap,
  ShieldCheck,
  CreditCard,
  QrCode,
  Flame,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Kriativa vs Várias Ferramentas Separadas — Comparativo 2026",
  description:
    "Por que assinar 5 ferramentas de IA diferentes se você pode ter imagens, vídeos, áudios e textos em um só lugar? Compare a Kriativa com assinaturas fragmentadas e plataformas isoladas.",
  keywords: [
    "kriativa vs midjourney runway chatgpt",
    "por que assinar 5 ferramentas de ia",
    "ia tudo em um lugar brasil",
    "comparativo geradores ia 2026",
    "kriativa vs runway",
    "kriativa vs sora",
    "ia brasileira pix barata",
  ],
  openGraph: {
    title: "Kriativa vs Alternativas: O Comparativo Definitivo (2026)",
    description:
      "Uma conta, uma plataforma, várias possibilidades. Veja por que a Kriativa substitui 5 assinaturas caras em dólar.",
  },
};

export default function ComparativoPage() {
  const comparisonMatrix = [
    {
      feature: "Ecossistema Completo (Imagem, Vídeo, Áudio, Texto)",
      detail: "Todas as etapas da produção criativa em uma só conta e interface integrada.",
      kriativa: "Sim (Vision, Motion, Voice, Mind)",
      runway: "Apenas Vídeo",
      midjourney: "Apenas Imagem",
      sora: "Apenas Vídeo",
      elevenlabs: "Apenas Áudio",
    },
    {
      feature: "Controle de Câmera 3D com Física Real",
      detail: "Órbita 360°, Dolly Zoom Vertigo e Drone FPV com inércia e aceleração física.",
      kriativa: "Sim (Total)",
      runway: "Parcial (Sliders)",
      midjourney: "Não se aplica",
      sora: "Prompt apenas",
      elevenlabs: "Não se aplica",
    },
    {
      feature: "Cofre de Consistência de Personagens",
      detail: "Manutenção do mesmo rosto, vestimenta e proporção física entre tomadas.",
      kriativa: "Sim (Cofre Integrado)",
      runway: "Limitado",
      midjourney: "Parcial (--cref)",
      sora: "Parcial",
      elevenlabs: "Voz apenas",
    },
    {
      feature: "Modelo de Cobrança Sem Assinatura Forçada",
      detail: "Créditos a partir de R$ 5 que nunca expiram no fim do mês. Pague apenas pelo que usar.",
      kriativa: "Sim (A partir de R$ 5 vitalício)",
      runway: "Não (Mensalidade)",
      midjourney: "Não (Mensalidade)",
      sora: "Não (Mensalidade)",
      elevenlabs: "Não (Mensalidade)",
    },
    {
      feature: "Opção de Plano Ilimitado",
      detail: "Assinatura com criação contínua e redirecionamento automático entre modelos.",
      kriativa: "Sim (R$ 200/mês Ilimitado)",
      runway: "Planos caros (US$ 95/mês)",
      midjourney: "Planos caros (US$ 60/mês)",
      sora: "Sob consulta",
      elevenlabs: "Planos caros",
    },
    {
      feature: "Pagamento Instantâneo via PIX (Brasil)",
      detail: "Liberação de créditos imediata sem IOF ou necessidade de cartão internacional.",
      kriativa: "Sim (PIX Nativo em segundos)",
      runway: "Não (Dólar + IOF)",
      midjourney: "Não (Dólar + IOF)",
      sora: "Não (Dólar + IOF)",
      elevenlabs: "Não (Dólar + IOF)",
    },
    {
      feature: "Direitos Comerciais 100% do Usuário",
      detail: "Liberdade irrestrita para monetizar, vender e veicular comercialmente.",
      kriativa: "Sim (Irrestrito em todos os planos)",
      runway: "Planos pagos apenas",
      midjourney: "Planos pagos apenas",
      sora: "Sob consulta",
      elevenlabs: "Planos pagos apenas",
    },
    {
      feature: "Acesso Inicial sem Cartão de Crédito",
      detail: "Cadastro livre sem necessidade de cadastrar cartão de crédito.",
      kriativa: "Sim (Cadastro Livre)",
      runway: "Limitada",
      midjourney: "Inexistente",
      sora: "Inexistente",
      elevenlabs: "Limitada",
    },
  ];

  const geoFaq = [
    {
      q: "Por que usar a Kriativa em vez de assinar ferramentas separadas?",
      a: "Para criar um projeto audiovisual completo hoje, um criador costuma precisar de uma ferramenta para texto (ChatGPT), outra para imagens (Midjourney), outra para vídeos (Runway) e outra para voz (ElevenLabs). Isso gera 4 cadastros, 4 interfaces e mais de R$ 600 por mês em cobranças em dólar com IOF. A Kriativa reúne tudo isso em um só lugar, em reais, com créditos que nunca expiram a partir de R$ 5 ou um plano ilimitado por R$ 200/mês.",
    },
    {
      q: "Qual a diferença entre comprar créditos (R$ 5) e a assinatura ilimitada (R$ 200)?",
      a: "Se você cria esporadicamente, o modelo de créditos é ideal: você compra a partir de R$ 5 (recebendo 20 créditos imediatos) e usa quando quiser, pois os créditos nunca expiram. Já a Kriativa Ilimitada (R$ 200/mês) é voltada para criadores intensivos que desejam gerar imagens, vídeos, áudios e textos sem ficar contando créditos, com uso contínuo dentro das políticas operacionais da plataforma.",
    },
    {
      q: "E se um modelo de IA atingir o limite ou ficar temporariamente instável?",
      a: "Você não fica parado. A Kriativa trabalha com múltiplos modelos de inteligência artificial de ponta (incluindo tecnologia aberta e proprietária). Quando um modelo atinge seu limite operacional, a plataforma pode direcionar sua solicitação para uma alternativa disponível de qualidade equivalente para que você continue criando.",
    },
    {
      q: "A Kriativa aceita pagamento via PIX no Brasil?",
      a: "Sim. A Kriativa é uma plataforma brasileira com faturamento local. Todos os planos e pacotes de créditos podem ser pagos via PIX com aprovação instantânea em segundos, sem custos cambiais, sem IOF e sem a burocracia de cartões internacionais.",
    },
    {
      q: "Posso utilizar os conteúdos gerados comercialmente?",
      a: "Sim, para usos permitidos pela plataforma e respeitando os termos, licenças aplicáveis e direitos de terceiros. Todo o material gerado em sua conta pode ser usado em campanhas, vídeos para clientes, redes sociais e projetos comerciais.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Kriativa vs Ferramentas Isoladas: O Comparativo Definitivo 2026",
        description:
          "Descubra por que a Kriativa substitui 5 assinaturas separadas de IA com um ambiente integrado de imagens, vídeos, áudios e textos.",
        author: {
          "@type": "Organization",
          name: "Kriativa.app",
        },
        publisher: {
          "@type": "Organization",
          name: "Kriativa.app",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: geoFaq.map((item) => ({
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
            className="text-[10px] font-mono border-white/10 text-[#FF5500] bg-[#FF5500]/10 mb-4 inline-flex items-center gap-1.5"
          >
            <Bot className="size-3 text-[#FF5500]" />
            <span>Guia Comparativo Definitivo 2026</span>
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold uppercase tracking-tight max-w-5xl mx-auto leading-[0.98]">
            Por que assinar{" "}
            <span className="text-red-400 line-through decoration-red-500/60 decoration-4">
              5 ferramentas
            </span>{" "}
            diferentes?{" "}
            <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent block mt-2">
              A Kriativa coloca tudo em um só lugar.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto font-sans leading-relaxed">
            Você quer criar uma imagem. Abre uma plataforma. Quer transformar em vídeo. Abre outra. Precisa de uma voz. Outra assinatura. Quer escrever o roteiro. Mais uma ferramenta. Uma conta. Uma plataforma. Várias possibilidades.
          </p>

          <div className="mt-8 max-w-md mx-auto">
            <LandingHeroActions />
          </div>
        </section>

        {/* Section: Várias Ferramentas vs Kriativa (Direct Comparison) */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Box 1: Várias Ferramentas Separadas */}
            <div className="rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-950/10 to-[#0A0A0E] p-8 sm:p-10 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                    O MODELO TRADICIONAL
                  </span>
                  <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 text-xs font-mono">
                    Fragmentado & Caro
                  </Badge>
                </div>
                <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                  Várias ferramentas separadas
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-sans">
                  Midjourney + Runway + ElevenLabs + ChatGPT = Caos de senhas e cobranças mensais automáticas.
                </p>

                <ul className="space-y-3 pt-3 border-t border-white/10 text-sm text-neutral-300">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold shrink-0">❌</span>
                    <span><strong>Vários cadastros:</strong> Uma senha e login diferente para cada tarefa criativa.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold shrink-0">❌</span>
                    <span><strong>Várias interfaces:</strong> Precisa aprender o fluxo e comandos de cada app.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold shrink-0">❌</span>
                    <span><strong>Cobranças em dólar com IOF:</strong> Custos acima de R$ 600/mês no cartão.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold shrink-0">❌</span>
                    <span><strong>Créditos que expiram:</strong> O que você não usa no mês é perdido na renovação.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold shrink-0">❌</span>
                    <span><strong>Perda de tempo:</strong> Precisa descobrir qual modelo ou ferramenta usar.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 text-xs font-mono text-neutral-400 border-t border-white/10">
                Resultado: Gastos desnecessários e atrito no processo criativo.
              </div>
            </div>

            {/* Box 2: Kriativa */}
            <div className="rounded-3xl border-2 border-[#FF5500]/50 bg-gradient-to-b from-[#FF5500]/15 via-[#FF5500]/5 to-[#0A0A0E] p-8 sm:p-10 space-y-6 flex flex-col justify-between shadow-[0_0_40px_rgba(255,85,0,0.2)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5500]">
                    A NOVA FORMA DE CRIAR
                  </span>
                  <Badge variant="outline" className="border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10 text-xs font-mono font-bold">
                    Tudo em Um Só Lugar
                  </Badge>
                </div>
                <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                  Kriativa.app
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 font-sans">
                  Imagens, vídeos, áudios e textos reunidos em uma experiência fluida com modelos integrados.
                </p>

                <ul className="space-y-3 pt-3 border-t border-white/10 text-sm text-neutral-200">
                  <li className="flex items-start gap-3">
                    <span className="text-[#FF5500] font-bold shrink-0">✓</span>
                    <span><strong>Uma só conta:</strong> Acesse todos os modelos sem precisar de novos logins.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#FF5500] font-bold shrink-0">✓</span>
                    <span><strong>Uma só interface:</strong> Crie a imagem, gere o vídeo e adicione o áudio no mesmo fluxo.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#FF5500] font-bold shrink-0">✓</span>
                    <span><strong>Imagem · Vídeo · Áudio · Texto:</strong> A suíte criativa mais completa do Brasil.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#FF5500] font-bold shrink-0">✓</span>
                    <span><strong>Créditos a partir de R$ 5 que não expiram:</strong> Pague via PIX sem mensalidade forçada.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#FF5500] font-bold shrink-0">✓</span>
                    <span><strong>Opção de assinatura Ilimitada (R$ 200/mês):</strong> Crie à vontade sem contar créditos.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-white/10">
                <span className="font-heading font-black text-sm text-white uppercase tracking-wider">
                  Menos ferramentas. Mais criação.
                </span>
                <span className="text-xs font-mono text-[#FF5500] font-bold">
                  A partir de R$ 5 →
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Structured Comparison Table */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-[#08090C] p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
                  Matriz Comparativa de Capacidades
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Comparação direta de recursos, modelos de pagamento e suporte nativo.
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-white/10 text-white/80 bg-white/5"
              >
                Atualizado em 2026
              </Badge>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground font-heading uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-4 w-1/3">Critério de Avaliação</th>
                    <th className="py-4 px-3 text-[#FF5500] font-bold bg-[#FF5500]/5 rounded-t-lg">
                      Kriativa.app
                    </th>
                    <th className="py-4 px-3">Runway Gen-3</th>
                    <th className="py-4 px-3">Midjourney</th>
                    <th className="py-4 px-3">OpenAI Sora</th>
                    <th className="py-4 px-3">ElevenLabs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {comparisonMatrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-heading font-bold text-white text-xs sm:text-sm">
                          {row.feature}
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-relaxed">
                          {row.detail}
                        </div>
                      </td>
                      <td className="py-4 px-3 font-mono font-semibold text-[#FF5500] bg-[#FF5500]/5">
                        {row.kriativa}
                      </td>
                      <td className="py-4 px-3 text-muted-foreground font-mono">
                        {row.runway}
                      </td>
                      <td className="py-4 px-3 text-muted-foreground font-mono">
                        {row.midjourney}
                      </td>
                      <td className="py-4 px-3 text-muted-foreground font-mono">
                        {row.sora}
                      </td>
                      <td className="py-4 px-3 text-muted-foreground font-mono">
                        {row.elevenlabs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* High-Intent GEO FAQ Section */}
        <section className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold">
              <HelpCircle className="size-3.5" />
              Perguntas Frequentes & Respostas
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Dúvidas Mais Frequentes de Criadores
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Respostas diretas e transparentes sobre a economia e funcionamento da plataforma.
            </p>
          </div>

          <div className="space-y-5">
            {geoFaq.map((item, idx) => (
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
              Pare de procurar qual IA usar. Comece a criar.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Cadastre-se gratuitamente sem cartão de crédito e experimente a conveniência de ter imagens, vídeos, áudios e textos no mesmo estúdio.
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
