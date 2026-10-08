import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Film,
  Camera,
  HeartHandshake,
  ShieldCheck,
  Clapperboard,
  Eye,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre Nós & Manifesto do Cinema Generativo",
  description:
    "Conheça a missão do Kriativa.app: devolver o controle da câmera aos diretores e democratizar a alta produção cinematográfica com IA.",
  openGraph: {
    title: "Manifesto do Cinema Generativo — Kriativa.app",
    description:
      "Acreditamos que a inteligência artificial não deve substituir a visão do diretor, mas eliminar os limites orçamentários entre a imaginação e a tela.",
  },
};

export default function SobrePage() {
  const values = [
    {
      title: "Autonomia Criativa Absoluta",
      description:
        "Acreditamos que a IA não deve tomar decisões estéticas arbitrárias. O diretor define os vetores de câmera, a iluminação e a decupagem; o motor de renderização executa com precisão matemática.",
      icon: Clapperboard,
    },
    {
      title: "Rigor Estético de Cinema",
      description:
        "Recusamos a textura plástica e os movimentos caóticos de geradores comuns. Nossos motores foram calibrados para simular a física real de lentes anamórficas, granulação 35mm e iluminação volumétrica.",
      icon: Film,
    },
    {
      title: "Transparência & Zero Lock-in",
      description:
        "Somos contra o modelo predatório de assinaturas que apagam créditos não utilizados no fim do mês. No Kriativa, você adquire créditos vitalícios e os utiliza no seu próprio ritmo de produção.",
      icon: HeartHandshake,
    },
    {
      title: "Sua Propriedade Intelectual é Sagrada",
      description:
        "Todo filme, comercial, conceito ou tomada que você renderiza no Kriativa é 100% seu. Não reivindicamos direitos, não cobramos royalties e não restringimos uso comercial.",
      icon: ShieldCheck,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Manifesto do Cinema Generativo Kriativa.app",
    description:
      "A missão do Kriativa.app é conceder a qualquer criador audiovisual as mesmas capacidades visuais dos maiores estúdios de Hollywood.",
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
            className="text-[10px] font-mono border-white/10 text-white/80 bg-white/5 mb-4"
          >
            Manifesto Institucional
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold uppercase tracking-tight max-w-4xl mx-auto leading-[0.98]">
            O Futuro da Direção.{" "}
            <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent">
              Sem Limites Orçamentários.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
            Historicamente, o cinema sempre foi a arte mais cara do mundo. O Kriativa nasceu com uma missão clara: colocar o poder visual dos maiores estúdios de Hollywood na ponta dos dedos de qualquer criador.
          </p>
        </section>

        {/* Narrative / Manifesto Body */}
        <section className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-[#08090C] p-8 sm:p-14 space-y-8 font-sans leading-relaxed text-sm sm:text-base text-muted-foreground">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
              Por que Criamos o Kriativa.app
            </h2>

            <p>
              Durante décadas, contar uma história visual com grande escala exigia milhões de dólares em equipamentos: câmeras cinematográficas pesadas, gruas, lentes anamórficas de dezenas de milhares de dólares e diárias monumentais de equipe.
            </p>

            <p>
              Quando a primeira onda de geradores de vídeo por inteligência artificial surgiu, a promessa era deslumbrante. No entanto, o que os diretores encontraram na prática foi frustração: caixas de texto com resultados randômicos, câmeras que se moviam de forma errática sem qualquer física de inércia, e personagens que mudavam de rosto a cada novo corte gerado.
            </p>

            <blockquote className="border-l-2 border-[#FF5500] pl-5 py-2 my-4 text-white font-heading font-bold text-base sm:text-lg italic">
              &quot;A inteligência artificial não deve substituir a sensibilidade do diretor. Ela deve destruir as barreiras financeiras entre a sua imaginação e a tela grande.&quot;
            </blockquote>

            <p>
              Foi com essa visão que construímos o <strong>Kriativa.app</strong>: uma plataforma construída por cineastas e tecnólogos que compreendem a linguagem da luz, das lentes e do enquadramento. Aqui, você não apenas digita; você dirige, calibra e orquestra cada detalhe da sua produção com total previsibilidade.
            </p>
          </div>
        </section>

        {/* Values Grid */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-white/10 text-white/80 bg-white/5"
            >
              Nossos Compromissos
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-white">
              Os Pilares do Estúdio
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
              Seja Bem-Vindo à Nova Era do Cinema
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Experimente agora com 50 créditos gratuitos e comece a dar vida aos seus próprios roteiros.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="px-8 py-3.5 rounded-xl font-heading font-bold text-sm bg-[#FF5500] text-white hover:bg-[#ff681a] inline-flex items-center gap-2 shadow-[0_0_30px_rgba(255,85,0,0.4)]"
              >
                Abrir Studio de Criação
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
