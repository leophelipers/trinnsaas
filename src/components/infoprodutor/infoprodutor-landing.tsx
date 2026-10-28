"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Video,
  Image as ImageIcon,
  Mic,
  FileText,
  Code2,
  Bot,
  ChevronDown,
  ShieldCheck,
  Zap,
  Sparkle,
  Check,
  Smartphone,
  Globe,
  Rocket,
  Users,
  Target,
  TrendingUp,
  Compass,
  HelpCircle,
  Briefcase,
} from "lucide-react";
import { InfoprodutorStepForm } from "./infoprodutor-step-form";

const FAQ_ITEMS = [
  {
    q: "Preciso pagar mensalidade?",
    a: "Não necessariamente. A proposta não é vender uma assinatura tradicional para parceiros. Dependendo do projeto, podemos estruturar uma parceria de coprodução em que cada parte contribui com aquilo que possui.",
  },
  {
    q: "A Kriativa desenvolve SaaS?",
    a: "Sim. Podemos avaliar projetos de SaaS e outros produtos digitais que tenham potencial de parceria.",
  },
  {
    q: "Vocês criam aplicativos?",
    a: "Sim. A parceria pode incluir o desenvolvimento e a preparação do produto para publicação nas lojas de aplicativos.",
  },
  {
    q: "Vocês colocam o aplicativo na App Store e Google Play?",
    a: "Sim. Quando o projeto envolver um aplicativo mobile, podemos cuidar também do processo necessário para disponibilizá-lo nas lojas.",
  },
  {
    q: "Preciso ter uma empresa de tecnologia?",
    a: "Não. A ideia é justamente permitir que especialistas, empreendedores, criadores e empresas possam construir produtos tecnológicos sem precisar montar toda a estrutura internamente.",
  },
  {
    q: "Preciso saber programar?",
    a: "Não. Você precisa conhecer o problema, mercado ou oportunidade. A parte tecnológica pode ser desenvolvida em parceria com a Kriativa.",
  },
  {
    q: "Posso transformar meu curso em um SaaS ou aplicativo?",
    a: "Sim. Esse é um dos tipos de projeto que podemos avaliar. Seu conhecimento pode ser transformado em uma ferramenta, plataforma, aplicativo ou experiência digital.",
  },
  {
    q: "Posso usar inteligência artificial no meu produto?",
    a: "Sim. A IA pode ser incorporada como parte central ou como uma funcionalidade do produto, dependendo do projeto.",
  },
  {
    q: "Qual é o percentual da coprodução?",
    a: "Não existe uma porcentagem fixa. A estrutura depende do projeto, do investimento necessário, da audiência, da operação e da contribuição de cada parte.",
  },
  {
    q: "Todo projeto é aprovado?",
    a: "Não. Analisamos cada oportunidade individualmente e buscamos projetos em que exista potencial real para os dois lados.",
  },
];

export function InfoprodutorLanding() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Trava scroll do body quando modal estiver aberto
  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFormOpen]);

  // Fecha modal ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFormOpen) {
        setIsFormOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormOpen]);

  const openForm = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsFormOpen(true);
  };

  return (
    <div id="topo" className="min-h-screen bg-[#050506] text-white selection:bg-[#FF5500] selection:text-white">
      {/* HEADER / NAVBAR (OTIMIZADO PARA MOBILE) */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050506]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#FF5500] to-orange-600 flex items-center justify-center shadow-lg shadow-[#FF5500]/25 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 truncate">
                KRIATIVA
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-[#FF5500] uppercase px-1.5 py-0.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20">
                  Coprodução
                </span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 tracking-wider">BY TRINN</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <a href="#proposta" className="hover:text-white transition-colors">A Parceria</a>
            <a href="#capacidades" className="hover:text-white transition-colors">Capacidades de IA</a>
            <a href="#mobile" className="hover:text-white transition-colors">Mobile & Apps</a>
            <a href="#o-que-construir" className="hover:text-white transition-colors">O Que Construímos</a>
            <a href="#etapas" className="hover:text-white transition-colors">Etapas</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <button
            onClick={openForm}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4.5 py-2 sm:py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#FF5500]/20 cursor-pointer active:scale-95 shrink-0"
          >
            <span>Quero ser Parceiro</span>
            <ArrowRight className="w-3.5 h-3.5 hidden xs:inline" />
          </button>
        </div>
      </header>

      {/* HERO SECTION (TRANSFORME SUA IDEIA EM UM PRODUTO DIGITAL) */}
      <section className="relative pt-10 pb-16 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Glows de Fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] sm:w-[700px] h-[250px] sm:h-[400px] bg-gradient-to-b from-[#FF5500]/15 via-[#FF5500]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-64 sm:w-80 h-64 sm:h-80 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-64 sm:w-80 h-64 sm:h-80 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FF5500] text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-5 sm:mb-6 shadow-sm">
            <Sparkle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Parceria & Coprodução Estratégica
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.12] sm:leading-[1.08] text-white">
            TRANSFORME SUA IDEIA<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-orange-400 to-[#00E5FF]">
              EM UM PRODUTO DIGITAL.
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-2xl text-zinc-200 font-bold max-w-3xl mx-auto leading-snug uppercase tracking-tight">
            Você entra com a ideia. A Kriativa entra com a tecnologia.
          </p>

          <p className="mt-3 sm:mt-4 text-xs sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Criamos, desenvolvemos e colocamos no mercado produtos digitais, SaaS, aplicativos, plataformas e experiências com inteligência artificial.
          </p>

          <div className="mt-5 sm:mt-6 inline-block px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-zinc-300 font-medium max-w-2xl mx-auto">
            Você não precisa montar uma equipe de tecnologia do zero.<br className="hidden sm:inline" />
            <strong className="text-white"> Construímos juntos através de um modelo de parceria e coprodução.</strong>
          </div>

          {/* CTA Principal */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={openForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-orange-500 hover:from-orange-500 hover:to-[#FF5500] text-white text-sm sm:text-base font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#FF5500]/30 cursor-pointer active:scale-95"
            >
              <span>Quero ser Parceiro</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <a
              href="#proposta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs sm:text-sm font-semibold transition-all border border-white/10"
            >
              Entenda Como Funciona
            </a>
          </div>

          {/* Tagline de Rodapé do Hero */}
          <p className="mt-5 sm:mt-6 text-[11px] sm:text-xs text-zinc-500 font-medium">
            Sem mensalidade tradicional · Tecnologia · IA · Desenvolvimento · Apps
          </p>
        </div>
      </section>

      {/* SEÇÃO 2: VOCÊ NÃO PRECISA SER UMA EMPRESA DE TECNOLOGIA */}
      <section id="proposta" className="py-12 sm:py-20 border-t border-white/5 bg-[#08080b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Sua Ideia Pode Ser Muito Maior
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              VOCÊ NÃO PRECISA SER UMA EMPRESA DE TECNOLOGIA PARA CRIAR TECNOLOGIA.
            </h2>
            <p className="text-zinc-300 text-sm sm:text-lg font-semibold pt-1">
              Sua ideia pode ser muito maior do que um curso, uma ferramenta ou um MVP.
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-[#FF5500]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] flex items-center justify-center font-bold text-sm mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">Método → Plataforma</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Talvez você tenha um método comprovado que poderia virar uma plataforma própria completa.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-[#00E5FF]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center font-bold text-sm mb-3">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">Ferramenta → SaaS</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Uma ferramenta ou automação interna que poderia virar um SaaS recorrente por assinatura.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">Produto → Aplicativo</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Um produto digital que poderia se transformar em um aplicativo nativo para celular.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-purple-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-3">
                <Rocket className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">Ideia no Papel</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ou simplesmente uma oportunidade de mercado que ainda está no papel esperando execução.
              </p>
            </div>
          </div>

          <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#FF5500]/10 via-white/[0.02] to-[#00E5FF]/10 border border-white/10 text-center">
            <p className="text-base sm:text-xl text-zinc-200 font-bold mb-1">
              Você entende do mercado. Nós entendemos de tecnologia.
            </p>
            <p className="text-xs sm:text-sm text-zinc-400">
              A Kriativa entra para transformar sua expertise em um produto digital que pode ser utilizado, vendido e escalado.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: DO CONHECIMENTO AO PRODUTO. DO PRODUTO À TECNOLOGIA. */}
      <section className="py-12 sm:py-20 border-t border-white/5 bg-[#050506]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              DO CONHECIMENTO AO PRODUTO.<br />
              <span className="text-[#FF5500]">DO PRODUTO À TECNOLOGIA.</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
              Não importa onde você esteja hoje. Você pode ter:
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              "Um infoproduto validado",
              "Uma comunidade ativa",
              "Uma audiência engajada",
              "Um SaaS em funcionamento",
              "Um MVP em testes",
              "Uma ferramenta interna",
              "Uma ideia de aplicativo",
              "Uma oportunidade de mercado",
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/8 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-zinc-200"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0" />
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>

          <p className="mt-6 sm:mt-8 text-center text-sm sm:text-base font-bold text-zinc-300">
            A parceria existe para transformar isso em algo maior.
          </p>
        </div>
      </section>

      {/* SEÇÃO 4: CAPACIDADES DE INTELIGÊNCIA ARTIFICIAL */}
      <section id="capacidades" className="py-12 sm:py-20 border-t border-white/5 bg-[#08080b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Infraestrutura de IA
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              CRIE COM IA. DESENVOLVA COM IA.<br />
              <span className="text-[#00E5FF]">ENTREGUE COM IA.</span>
            </h2>
            <p className="text-zinc-300 text-sm sm:text-lg font-semibold">
              A inteligência artificial faz parte da nossa infraestrutura.
            </p>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
              A Kriativa reúne diferentes capacidades de inteligência artificial para acelerar a criação e operação dos seus produtos.
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-[#FF5500]/30 transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] flex items-center justify-center mb-4">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">IMAGEM</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Criação e edição de imagens para produtos, campanhas, interfaces e conteúdos com acabamento profissional.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-[#00E5FF]/30 transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center mb-4">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">VÍDEO</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Produção de vídeos, demonstrações, conteúdos e experiências visuais imersivas em alta fidelidade.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">ÁUDIO</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Narrações neurais ultra-realistas, clonagem de voz, transcrições automáticas e produção sonora completa.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-purple-500/30 transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">TEXTO</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Copywriting persuasivo, documentação técnica, roteiros de alta retenção, pesquisas e planejamento estratégico.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-amber-500/30 transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">CÓDIGO</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Desenvolvimento ágil de aplicações full-stack, ferramentas sob medida, protótipos funcionais e integrações.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-sky-500/30 transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">AGENTES</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Automação de processos complexos e criação de agentes inteligentes autônomos personalizados para sua operação.
              </p>
            </div>
          </div>

          <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-zinc-500 font-medium">
            E novas tecnologias são incorporadas continuamente à plataforma.
          </p>
        </div>
      </section>

      {/* SEÇÃO 5: NÃO É SÓ UMA PLATAFORMA DE IA. É UMA INFRAESTRUTURA PARA CONSTRUIR PRODUTOS. */}
      <section className="py-12 sm:py-20 border-t border-white/5 bg-[#050506]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              NÃO É SÓ UMA PLATAFORMA DE IA.<br />
              <span className="text-[#FF5500]">É UMA INFRAESTRUTURA PARA CONSTRUIR PRODUTOS.</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
              Você pode utilizar a Kriativa para acelerar a criação do seu próprio negócio:
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              "Criar um MVP",
              "Validar uma ideia",
              "Desenvolver funcionalidades",
              "Criar ferramentas internas",
              "Produzir conteúdos",
              "Automatizar processos",
              "Criar experiências para clientes",
              "Construir produtos baseados em IA",
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/8 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-zinc-200"
              >
                <div className="w-2 h-2 rounded-full bg-[#FF5500] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
            <p className="text-sm sm:text-lg font-bold text-white">
              E transformar uma ideia em algo que as pessoas realmente possam usar.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: LEVANDO SEU PRODUTO PARA O CELULAR (APP STORE & GOOGLE PLAY) */}
      <section id="mobile" className="py-12 sm:py-20 border-t border-white/5 bg-gradient-to-b from-[#08080b] to-[#0c0d12]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Presença Mobile
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              E QUANDO O PRODUTO ESTIVER PRONTO?<br />
              <span className="text-[#00E5FF]">NÓS TAMBÉM PODEMOS LEVÁ-LO PARA O CELULAR.</span>
            </h2>
            <p className="text-zinc-300 text-sm sm:text-lg font-semibold">
              Seu produto não precisa ficar preso ao navegador.
            </p>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Colocamos seu aplicativo nas principais lojas de aplicativos do mundo:
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#00E5FF]/40 transition-all text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-white">
                <Smartphone className="w-7 h-7 text-[#00E5FF]" />
              </div>
              <h3 className="text-xl font-bold text-white">APP STORE</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Seu produto disponível na loja da Apple para usuários de iPhone e iPad, com visual elegante e alta performance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-white">
                <Globe className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">GOOGLE PLAY</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Seu aplicativo disponível na Google Play Store para toda a base de usuários Android no Brasil e no mundo.
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/8 text-center max-w-3xl mx-auto space-y-2">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Do desenvolvimento à publicação, a tecnologia necessária para transformar seu produto em uma experiência mobile pode fazer parte da parceria.
            </p>
            <p className="text-sm sm:text-base font-bold text-[#FF5500]">
              Você pensa no produto. Nós ajudamos a construir o caminho até ele chegar às mãos do usuário.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7: POR QUE CONSTRUIR TUDO SOZINHO? (COMPARATIVO) */}
      <section className="py-12 sm:py-20 border-t border-white/5 bg-[#050506]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              POR QUE CONSTRUIR TUDO SOZINHO?
            </h2>
            <p className="text-xs sm:text-sm uppercase tracking-wider text-[#FF5500] font-bold">
              Contratar desenvolvedores · Montar infraestrutura · Integrar IA · Criar o app · Publicar nas lojas
            </p>
            <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
              Tudo isso custa tempo, dinheiro e energia. E, muitas vezes, faz uma boa ideia ficar meses parada.
              A proposta da Kriativa é diferente: em vez de você financiar sozinho toda a construção tecnológica, podemos construir juntos.
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* O Que Você Traz */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
                Você Traz
              </div>
              <ul className="space-y-3 pt-2">
                {[
                  { title: "Mercado", desc: "A compreensão profunda das dores e necessidades reais dos clientes." },
                  { title: "Conhecimento", desc: "Sua metodologia comprovada, expertise e autoridade no assunto." },
                  { title: "Produto", desc: "A visão funcional daquilo que resolve o problema do usuário." },
                  { title: "Audiência", desc: "A base de alunos, seguidores, clientes ou comunidade engajada." },
                  { title: "Distribuição", desc: "A capacidade de comunicar, comercializar e tracionar o negócio." },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="text-white">{item.title}:</strong>{" "}
                      <span className="text-zinc-400">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* O Que a Kriativa Traz */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#FF5500]/10 via-white/[0.02] to-white/[0.01] border border-[#FF5500]/30 space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-xs font-bold uppercase tracking-wider">
                A Kriativa Traz
              </div>
              <ul className="space-y-3 pt-2">
                {[
                  { title: "Tecnologia", desc: "Arquitetura moderna, escalável e segura para sustentar milhares de acessos." },
                  { title: "Inteligência Artificial", desc: "Integração nativa de modelos para texto, imagem, vídeo, áudio e código." },
                  { title: "Desenvolvimento", desc: "Equipe técnica sênior cuidando de código, APIs e estabilidade." },
                  { title: "Infraestrutura", desc: "Instâncias de processamento e servidores em nuvem de ponta." },
                  { title: "Produto Digital & Mobile", desc: "Construção de plataformas web e aplicativos para iOS e Android." },
                  { title: "Evolução Tecnológica", desc: "Atualizações constantes para o produto nunca ficar obsoleto." },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <strong className="text-white">{item.title}:</strong>{" "}
                      <span className="text-zinc-300">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 8: VOCÊ NÃO COMPRA UMA TECNOLOGIA. VOCÊ CONSTRÓI UM NEGÓCIO COM ELA. */}
      <section className="py-12 sm:py-20 border-t border-white/5 bg-[#08080b]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            Modelo Ganha-Ganha
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            VOCÊ NÃO COMPRA UMA TECNOLOGIA.<br />
            <span className="text-[#00E5FF]">VOCÊ CONSTRÓI UM NEGÓCIO COM ELA.</span>
          </h2>
          <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            Nosso objetivo não é simplesmente vender uma licença ou mais uma assinatura. Queremos encontrar projetos em que exista potencial para construir uma parceria de longo prazo.
          </p>
          <div className="p-5 sm:p-7 rounded-2xl bg-white/[0.03] border border-white/10 text-xs sm:text-base text-zinc-200 leading-relaxed max-w-2xl mx-auto">
            Por isso, trabalhamos com modelos de <strong className="text-[#FF5500]">coprodução e parceria estratégica</strong>. Em vez de simplesmente pagar pela tecnologia, você pode construir o produto junto com quem desenvolve a tecnologia.
            <div className="mt-3 pt-3 border-t border-white/10 text-sm sm:text-lg font-bold text-white">
              Se o produto cresce, a parceria cresce junto.
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 9: O QUE PODEMOS CONSTRUIR JUNTOS? */}
      <section id="o-que-construir" className="py-12 sm:py-20 border-t border-white/5 bg-[#050506]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              O QUE PODEMOS CONSTRUIR JUNTOS?
            </h2>
            <p className="text-zinc-400 text-xs sm:text-base">
              Formatos flexíveis adaptados à maturidade e objetivos do seu projeto.
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Layers,
                title: "SAAS",
                desc: "Transforme seu conhecimento ou solução em um software por assinatura recorrente.",
              },
              {
                icon: Smartphone,
                title: "APLICATIVOS",
                desc: "Leve seu produto direto para as lojas oficiais do iOS e Android.",
              },
              {
                icon: Globe,
                title: "PLATAFORMAS",
                desc: "Crie ambientes próprios e exclusivos para seus clientes, alunos ou usuários.",
              },
              {
                icon: Zap,
                title: "FERRAMENTAS DE IA",
                desc: "Transforme uma ideia em uma ferramenta inteligente de alta produtividade.",
              },
              {
                icon: Briefcase,
                title: "PRODUTOS DIGITAIS",
                desc: "Crie experiências digitais interativas que vão muito além de aulas gravadas.",
              },
              {
                icon: ShieldCheck,
                title: "PRODUTOS B2B",
                desc: "Desenvolva soluções robustas para empresas e operações corporativas específicas.",
              },
              {
                icon: Rocket,
                title: "MVPs",
                desc: "Tire uma ideia do papel e coloque uma primeira versão validada rapidamente no mercado.",
              },
              {
                icon: TrendingUp,
                title: "NOVOS NEGÓCIOS",
                desc: "Construa algo completamente novo e escalável a partir de uma oportunidade de mercado.",
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-[#FF5500]/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#FF5500] flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1.5">{card.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO 10: PARA QUEM É ESSA PARCERIA? */}
      <section className="py-12 sm:py-20 border-t border-white/5 bg-[#08080b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Perfil dos Parceiros
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              PARA QUEM É ESSA PARCERIA?
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base font-semibold">
              Para quem tem uma ideia, um mercado ou um produto para construir.
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "INFOPRODUTORES",
                desc: "Transforme seu conhecimento em plataformas, ferramentas e experiências digitais interativas.",
              },
              {
                title: "ESPECIALISTAS",
                desc: "Transforme seu método e consultoria em um produto tecnológico escalável.",
              },
              {
                title: "EMPREENDEDORES",
                desc: "Tire uma ideia de SaaS, aplicativo ou plataforma do papel sem depender de agências tradicionais.",
              },
              {
                title: "EMPRESAS",
                desc: "Crie novas ferramentas, produtos e soluções digitais para atender clientes ou otimizar processos.",
              },
              {
                title: "CRIADORES",
                desc: "Transforme sua audiência e influência em novos produtos digitais de alta retenção.",
              },
              {
                title: "SAAS E STARTUPS",
                desc: "Acelere desenvolvimento, inteligência artificial e novas experiências para seu produto existente.",
              },
            ].map((p, idx) => (
              <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
                <div className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">{p.title}</div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
              Se existe uma oportunidade de negócio, podemos conversar sobre a tecnologia necessária para construí-la.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 11: VOCÊ NÃO PRECISA SABER PROGRAMAR */}
      <section className="py-12 sm:py-20 border-t border-white/5 bg-[#050506]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            VOCÊ NÃO PRECISA SABER PROGRAMAR.<br />
            <span className="text-[#FF5500]">PRECISA SABER O QUE QUER CONSTRUIR.</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto pt-2">
            {[
              "Você não precisa dominar inteligência artificial.",
              "Não precisa conhecer infraestrutura complexa.",
              "Não precisa montar um time inteiro de desenvolvimento.",
              "Não precisa descobrir sozinho como colocar seu app nas lojas.",
            ].map((txt, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 flex items-center gap-2.5 text-xs sm:text-sm text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{txt}</span>
              </div>
            ))}
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 max-w-2xl mx-auto">
            <p className="text-sm sm:text-lg font-bold text-white mb-1">
              Você precisa conhecer seu mercado e enxergar uma oportunidade.
            </p>
            <p className="text-xs sm:text-sm text-zinc-400">
              A parte tecnológica pode ser construída em parceria com a Kriativa.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 12: DO ZERO AO PRODUTO (UMA PARCERIA PARA CADA ETAPA) */}
      <section id="etapas" className="py-12 sm:py-20 border-t border-white/5 bg-[#08080b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Passo a Passo
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              DO ZERO AO PRODUTO.<br />
              <span className="text-[#00E5FF]">UMA PARCERIA PARA CADA ETAPA.</span>
            </h2>
          </div>

          <div className="mt-8 sm:mt-12 space-y-4 max-w-3xl mx-auto">
            {[
              {
                step: "01",
                title: "IDEIA",
                desc: "Você apresenta o problema, mercado e oportunidade.",
              },
              {
                step: "02",
                title: "ESTRATÉGIA",
                desc: "Definimos o que faz sentido construir e como transformar a ideia em produto.",
              },
              {
                step: "03",
                title: "DESENVOLVIMENTO",
                desc: "A tecnologia, IA e infraestrutura entram em ação com velocidade.",
              },
              {
                step: "04",
                title: "LANÇAMENTO",
                desc: "Colocamos o produto no mercado e, quando aplicável, nas lojas de aplicativos.",
              },
              {
                step: "05",
                title: "EVOLUÇÃO",
                desc: "O produto continua sendo desenvolvido conforme usuários, mercado e negócio evoluem.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-[#FF5500]/30 transition-all flex items-start sm:items-center gap-4 sm:gap-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF5500]/20 to-orange-500/10 border border-[#FF5500]/30 text-[#FF5500] flex items-center justify-center font-black text-lg shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 13: MAIS DO QUE DESENVOLVER UM PRODUTO */}
      <section className="py-12 sm:py-20 border-t border-white/5 bg-[#050506]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            MAIS DO QUE DESENVOLVER UM PRODUTO.<br />
            <span className="text-[#00E5FF]">QUEREMOS CONSTRUIR UM NEGÓCIO.</span>
          </h2>
          <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            A tecnologia é apenas uma parte. O objetivo é criar algo que tenha:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-2xl mx-auto pt-2">
            {["Usuários", "Valor Real", "Modelo de Negócio", "Mercado", "Potencial de Escala"].map((pillar, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-semibold text-zinc-200"
              >
                {pillar}
              </span>
            ))}
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 max-w-2xl mx-auto text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-2">
            <p>
              Por isso, analisamos cada projeto individualmente antes de propor uma parceria.
            </p>
            <p className="text-white font-bold text-sm sm:text-base">
              Não queremos simplesmente entregar código. Queremos construir produtos que façam sentido.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 14: E SE SUA IDEIA JÁ EXISTE? */}
      <section className="py-12 sm:py-20 border-t border-white/5 bg-[#08080b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              E SE SUA IDEIA JÁ EXISTE?
            </h2>
            <p className="text-lg sm:text-2xl font-bold text-[#FF5500]">
              Melhor ainda.
            </p>
            <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
              Podemos avaliar o que você já possui e identificar onde a tecnologia, a inteligência artificial ou o mobile podem criar uma nova oportunidade. Seu produto pode estar pronto para:
            </p>
          </div>

          <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {[
              "Ganhar IA",
              "Virar SaaS",
              "Ganhar um aplicativo",
              "Novas funcionalidades",
              "Atender outro mercado",
              "Aumentar monetização",
              "Escalar faturamento",
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/8 text-center text-xs sm:text-sm font-bold text-white flex items-center justify-center"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 15: NÃO ESTAMOS PROCURANDO CLIENTES. ESTAMOS PROCURANDO PARCEIROS. */}
      <section className="py-12 sm:py-20 border-t border-white/5 bg-[#050506]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            Alinhamento Estratégico
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            NÃO ESTAMOS PROCURANDO CLIENTES.<br />
            <span className="text-[#FF5500]">ESTAMOS PROCURANDO PARCEIROS.</span>
          </h2>
          <div className="p-5 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 text-xs sm:text-base text-zinc-300 leading-relaxed space-y-3 max-w-2xl mx-auto">
            <p>
              Se você está procurando apenas uma software house para executar um projeto, existem muitas opções no mercado.
            </p>
            <p>
              Se você quer apenas comprar créditos de IA, também existem diversas plataformas.
            </p>
            <p className="text-white font-semibold pt-1">
              <strong>A Kriativa está procurando algo diferente.</strong> Queremos encontrar pessoas e empresas com potencial para construir produtos juntos.
            </p>
            <div className="pt-3 border-t border-white/10 text-sm sm:text-lg font-bold text-[#FF5500]">
              Você traz a visão. Nós trazemos a tecnologia. E construímos o produto em conjunto.
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 16: TEM UMA IDEIA? (CTA INTERMEDIÁRIO) */}
      <section className="py-12 sm:py-20 border-t border-white/5 bg-gradient-to-b from-[#08080b] to-[#0f1118]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            TEM UMA IDEIA?<br />
            <span className="text-[#00E5FF]">TALVEZ ELA ESTEJA MAIS PERTO DE VIRAR PRODUTO DO QUE VOCÊ IMAGINA.</span>
          </h2>
          <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            Conte para nós sobre seu negócio, sua ideia ou seu produto atual. Nossa equipe vai analisar o projeto e entender se existe uma oportunidade real de parceria.
          </p>
          <p className="text-xs sm:text-sm text-zinc-400 font-semibold">
            O preenchimento leva poucos minutos.
          </p>

          <div className="pt-2">
            <button
              onClick={openForm}
              className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-orange-500 hover:from-orange-500 hover:to-[#FF5500] text-white text-sm sm:text-base font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#FF5500]/30 cursor-pointer active:scale-95"
            >
              <span>Quero Construir com a Kriativa</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-zinc-500">
            Processo seletivo individual · Modelo de parceria · Coprodução
          </p>
        </div>
      </section>

      {/* SEÇÃO 17: FAQ (PERGUNTAS FREQUENTES — 10 ITENS COMPLETOS) */}
      <section id="faq" className="py-12 sm:py-20 border-t border-white/5 bg-[#050506]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 sm:space-y-3 mb-8 sm:mb-12">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Dúvidas Frequentes
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              PERGUNTAS FREQUENTES
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Tudo o que você precisa saber sobre o modelo de parceria e coprodução da Kriativa.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-xs sm:text-base font-bold text-white leading-snug">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-[#FF5500] shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO 18: FECHAMENTO FINAL & FOOTER */}
      <section className="py-16 sm:py-24 border-t border-white/5 bg-gradient-to-b from-[#08080b] to-[#050506] relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[340px] sm:w-[600px] h-[200px] sm:h-[300px] bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            SUA IDEIA.<br />
            <span className="text-[#FF5500]">NOSSA TECNOLOGIA.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#00E5FF]">
              UM PRODUTO QUE PODE IR MUITO MAIS LONGE.
            </span>
          </h2>

          <p className="text-xs sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Se você já tem conhecimento, audiência, mercado, produto ou simplesmente uma oportunidade que acredita que pode virar negócio, queremos conhecer.
          </p>

          <p className="text-sm sm:text-lg font-bold text-white">
            Conte o que você está construindo.
          </p>

          <div className="pt-2">
            <button
              onClick={openForm}
              className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-orange-500 hover:from-orange-500 hover:to-[#FF5500] text-white text-sm sm:text-base font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#FF5500]/30 cursor-pointer active:scale-95"
            >
              <span>Quero ser Parceiro da Kriativa</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 sm:py-10 border-t border-white/5 bg-[#050506] pb-24 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FF5500] flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-zinc-400">KRIATIVA</span>
            <span>— Tecnologia e inteligência artificial para quem cria o futuro.</span>
          </div>
          <div>
            by Trinn · Feito no Brasil
          </div>
        </div>
      </footer>

      {/* BARRA FIXA FLUTUANTE INFERIOR MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#050506]/95 backdrop-blur-md border-t border-white/10 z-30 md:hidden flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-white truncate">Coprodução Kriativa</p>
          <p className="text-[10px] text-zinc-400 truncate">Sem mensalidade tradicional</p>
        </div>
        <button
          onClick={openForm}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-orange-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#FF5500]/25 shrink-0 active:scale-95"
        >
          <span>Quero ser Parceiro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MODAL RESPONSIVO / BOTTOM-SHEET MOBILE DO FORMULÁRIO */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormOpen(false);
          }}
        >
          <div className="w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl shadow-2xl transition-all">
            <InfoprodutorStepForm onClose={() => setIsFormOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}