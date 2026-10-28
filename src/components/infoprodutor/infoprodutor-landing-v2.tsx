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
  Briefcase,
  ExternalLink,
  Laptop,
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
    q: "Os modelos de inteligência artificial oferecidos são próprios da Kriativa?",
    a: "Sim, exatamente. Todos os modelos e motores de inteligência artificial oferecidos aos nossos parceiros são nossos próprios modelos — desenvolvidos, treinados e operados diretamente pela equipe da Kriativa (para imagem, vídeo, áudio, texto, código e agentes). Não atuamos como simples revendedores nem dependemos de wrappers frágeis de terceiros. Isso confere ao seu produto estabilidade operacional, previsibilidade de custos, máxima fidelidade e diferenciação tecnológica exclusiva.",
  },
  {
    q: "Posso usar inteligência artificial no meu produto?",
    a: "Sim. Nossos próprios modelos de IA podem ser incorporados como parte central ou como funcionalidades específicas do produto (geração de imagens, vídeos cinematográficos, vozes neurais, assistentes de texto e agentes inteligentes).",
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

export function InfoprodutorLandingV2() {
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
    <div id="topo" className="min-h-screen bg-[#030304] text-white selection:bg-[#FF5500] selection:text-white font-sans antialiased">
      {/* HEADER / NAVBAR ELEGANTE */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#030304]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#FF5500] via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-[#FF5500]/25 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 truncate">
                KRIATIVA
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-[#FF5500] uppercase px-2 py-0.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/25">
                  Estúdio Digital
                </span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 tracking-widest font-mono">COPRODUÇÃO & TECH</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <a href="#proposta" className="hover:text-white transition-colors">A Proposta</a>
            <a href="#capacidades" className="hover:text-white transition-colors">Motores de IA</a>
            <a href="#mobile" className="hover:text-white transition-colors">App Store & Play</a>
            <a href="#o-que-construir" className="hover:text-white transition-colors">O Que Criamos</a>
            <a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={openForm}
              className="relative inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#FF5500] via-orange-500 to-[#FF5500] bg-[length:200%_auto] hover:bg-right text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#FF5500]/25 cursor-pointer active:scale-95 shrink-0"
            >
              <span>Quero ser Parceiro</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION DE ALTO IMPACTO CINEMÁTICO */}
      <section className="relative pt-12 pb-16 sm:pt-24 sm:pb-32 overflow-hidden border-b border-white/[0.06]">
        {/* Luzes de ambientação generativa */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] sm:w-[850px] h-[250px] sm:h-[450px] bg-gradient-to-b from-[#FF5500]/20 via-[#FF5500]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-72 sm:w-96 h-72 sm:h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Badge de status */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 text-[11px] sm:text-xs font-semibold tracking-wider uppercase mb-6 sm:mb-8 shadow-inner backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Vagas para Coprodução Estratégica · Kriativa Tech</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] sm:leading-[1.05] text-white">
            TRANSFORME SUA IDEIA<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-amber-300 to-[#00E5FF]">
              EM UM PRODUTO DIGITAL.
            </span>
          </h1>

          <div className="mt-5 sm:mt-8 inline-block px-4 py-2 rounded-xl bg-white/[0.03] border border-white/8 text-sm sm:text-xl font-extrabold uppercase tracking-wide text-zinc-100">
            Você entra com a ideia. A Kriativa entra com a tecnologia.
          </div>

          <p className="mt-4 sm:mt-5 text-sm sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Criamos, desenvolvemos e colocamos no mercado produtos digitais, SaaS, aplicativos, plataformas e experiências com inteligência artificial.
          </p>

          {/* Destaque central */}
          <div className="mt-6 sm:mt-8 max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FF5500]/10 via-white/[0.02] to-[#00E5FF]/10 border border-white/10 text-xs sm:text-sm text-zinc-200 leading-relaxed">
            Você não precisa montar uma equipe de tecnologia do zero.<br className="hidden sm:inline" />
            <strong className="text-white font-bold"> Construímos juntos através de um modelo de parceria e coprodução.</strong>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <button
              onClick={openForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-9 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-orange-500 hover:from-orange-500 hover:to-[#FF5500] text-white text-sm sm:text-base font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#FF5500]/30 cursor-pointer active:scale-95"
            >
              <span>Quero ser Parceiro</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#proposta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs sm:text-sm font-semibold transition-all border border-white/10"
            >
              Como Funciona
            </a>
          </div>

          {/* Pills de garantia */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-zinc-400 font-medium">
            <span className="px-3 py-1 rounded-lg bg-white/[0.02] border border-white/5">Sem mensalidade tradicional</span>
            <span className="text-zinc-600">·</span>
            <span className="px-3 py-1 rounded-lg bg-white/[0.02] border border-white/5 text-white font-semibold">Modelos Próprios de IA</span>
            <span className="text-zinc-600">·</span>
            <span className="px-3 py-1 rounded-lg bg-white/[0.02] border border-white/5">Tecnologia Proprietária</span>
            <span className="text-zinc-600">·</span>
            <span className="px-3 py-1 rounded-lg bg-white/[0.02] border border-white/5">Desenvolvimento Full-Stack</span>
            <span className="text-zinc-600">·</span>
            <span className="px-3 py-1 rounded-lg bg-white/[0.02] border border-white/5">Apps iOS & Android</span>
          </div>

          {/* Preview Visual Studio Mockup */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-black/80 p-3 sm:p-5 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 px-2 sm:px-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] sm:text-xs font-mono text-zinc-400 min-w-0">
                <Laptop className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                <span className="truncate max-w-[140px] xs:max-w-none">estudio.kriativa.app/coproducao</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE</span>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-left">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-[#FF5500] uppercase tracking-wider mb-1">Passo 01 · Visão</div>
                  <div className="text-sm sm:text-base font-bold text-white">Sua Ideia ou Método</div>
                  <p className="text-xs text-zinc-400 mt-1">Transformamos o seu conhecimento em produto acionável com mercado pronto.</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-zinc-500 font-mono">Protótipo em semanas</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider mb-1">Passo 02 · Execução</div>
                  <div className="text-sm sm:text-base font-bold text-white">Engenharia & Modelos Próprios</div>
                  <p className="text-xs text-zinc-400 mt-1">Arquitetura de nuvem, banco em tempo real e nossos próprios modelos neurais integrados.</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-zinc-500 font-mono">Infraestrutura escalável</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Passo 03 · Mercado</div>
                  <div className="text-sm sm:text-base font-bold text-white">Web, iOS & Android</div>
                  <p className="text-xs text-zinc-400 mt-1">Disponibilização do produto nas principais lojas de apps para retenção máxima.</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-zinc-500 font-mono">Monetização recorrente</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: VOCÊ NÃO PRECISA SER UMA EMPRESA DE TECNOLOGIA */}
      <section id="proposta" className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#050508]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Mudança de Escala
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              VOCÊ NÃO PRECISA SER UMA EMPRESA DE TECNOLOGIA PARA CRIAR TECNOLOGIA.
            </h2>
            <p className="text-base sm:text-2xl text-zinc-200 font-bold">
              SUA IDEIA PODE SER MUITO MAIOR DO QUE UM CURSO, UMA FERRAMENTA OU UM MVP.
            </p>
          </div>

          <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-[#FF5500]/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">Método → Plataforma</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Talvez você tenha um método que poderia virar uma plataforma própria completa e interativa.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-[#00E5FF]/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">Ferramenta → SaaS</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Uma ferramenta que poderia virar um SaaS com cobrança recorrente e alta retenção de clientes.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">Produto → Aplicativo</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Um produto digital que poderia se transformar em um aplicativo nativo para celular.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">Ideia no Papel</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Ou uma ideia que ainda está apenas no papel esperando os desenvolvedores certos para nascer.
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FF5500]/15 via-white/[0.02] to-[#00E5FF]/15 border border-white/10 text-center max-w-4xl mx-auto space-y-2">
            <h3 className="text-lg sm:text-2xl font-black text-white">
              Você entende do mercado. Nós entendemos de tecnologia.
            </h3>
            <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              A Kriativa entra para transformar sua expertise em um produto digital que pode ser utilizado, vendido e escalado.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: DO CONHECIMENTO AO PRODUTO. DO PRODUTO À TECNOLOGIA. */}
      <section className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#030304]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              DO CONHECIMENTO AO PRODUTO.<br />
              <span className="text-[#FF5500]">DO PRODUTO À TECNOLOGIA.</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-base">
              Não importa onde você esteja hoje. Você pode ter:
            </p>
          </div>

          <div className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              "Um infoproduto validado.",
              "Uma comunidade.",
              "Uma audiência.",
              "Um SaaS em funcionamento.",
              "Um MVP.",
              "Uma ferramenta interna.",
              "Uma ideia de aplicativo.",
              "Ou simplesmente uma oportunidade que você acredita que pode virar produto.",
            ].map((text, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-[#FF5500]/30 transition-all flex flex-col justify-between"
              >
                <div className="w-2 h-2 rounded-full bg-[#FF5500] mb-3" />
                <p className="text-xs sm:text-sm font-bold text-zinc-200 leading-snug">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-sm sm:text-lg font-bold text-white">
              A parceria existe para transformar isso em algo maior.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: CAPACIDADES DE INTELIGÊNCIA ARTIFICIAL */}
      <section id="capacidades" className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#050508]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Tecnologia Proprietária · Modelos Próprios
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              CRIE COM IA. DESENVOLVA COM IA.<br />
              <span className="text-[#00E5FF]">ENTREGUE COM NOSSOS PRÓPRIOS MODELOS.</span>
            </h2>
            <p className="text-base sm:text-xl text-zinc-200 font-bold">
              OS MODELOS OFERECIDOS SÃO DESENVOLVIDOS E OPERADOS DIRETAMENTE PELA KRIATIVA.
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Não atuamos como intermediários nem dependemos de wrappers de terceiros. Seu produto ou aplicativo parceiro terá acesso nativo aos nossos próprios modelos para acelerar a criação, entrega e escala do negócio.
            </p>
          </div>

          <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/8 hover:border-[#FF5500]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">IMAGEM</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Criação e edição de imagens para produtos, campanhas, interfaces e conteúdos.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/8 hover:border-[#00E5FF]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center mb-4">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">VÍDEO</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Produção de vídeos, demonstrações, conteúdos e experiências visuais cinematográficas.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/8 hover:border-emerald-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">ÁUDIO</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Narrações, vozes neurais, transcrições em tempo real e produção sonora completa.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/8 hover:border-purple-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">TEXTO</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Copy, conteúdo, documentação, roteiros, pesquisas profundas e planejamento estratégico.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/8 hover:border-amber-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">CÓDIGO</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Desenvolvimento de aplicações, ferramentas, protótipos funcionais e funcionalidades avançadas.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/8 hover:border-sky-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">AGENTES</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Automação de processos operacionais e criação de agentes inteligentes personalizados.
              </p>
            </div>
          </div>

          {/* Destaque de Modelos Próprios */}
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FF5500]/15 via-white/[0.02] to-[#00E5FF]/15 border border-white/10 text-center max-w-4xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF5500] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Diferencial de Mercado: Modelos Próprios e Exclusivos</span>
            </div>
            <p className="text-base sm:text-lg font-black text-white">
              Todos os modelos que impulsionam o seu produto são desenvolvidos e mantidos por nós.
            </p>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              Ao contrário de soluções que usam apenas integrações de APIs públicas de terceiros suscetíveis a cortes e inflação de preços, você constrói seu negócio sobre motores proprietários estáveis e com custo sob controle.
            </p>
          </div>

          <p className="mt-8 text-center text-xs sm:text-sm text-zinc-500 font-medium">
            E novas tecnologias são incorporadas continuamente à plataforma.
          </p>
        </div>
      </section>

      {/* SEÇÃO 5: NÃO É SÓ UMA PLATAFORMA DE IA. É UMA INFRAESTRUTURA PARA CONSTRUIR PRODUTOS. */}
      <section className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#030304]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              NÃO É SÓ UMA PLATAFORMA DE IA.<br />
              <span className="text-[#FF5500]">É UMA INFRAESTRUTURA PARA CONSTRUIR PRODUTOS.</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-base">
              Você pode utilizar a Kriativa para acelerar a criação do seu próprio negócio:
            </p>
          </div>

          <div className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              "Criar um MVP.",
              "Validar uma ideia.",
              "Desenvolver funcionalidades.",
              "Criar ferramentas internas.",
              "Produzir conteúdos.",
              "Automatizar processos.",
              "Criar experiências para seus clientes.",
              "Construir produtos baseados em IA.",
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/8 flex items-center gap-3 text-xs sm:text-sm font-semibold text-zinc-200"
              >
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <p className="text-sm sm:text-lg font-bold text-white">
              E transformar uma ideia em algo que as pessoas realmente possam usar.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: LEVANDO SEU PRODUTO PARA O CELULAR (APP STORE & GOOGLE PLAY) */}
      <section id="mobile" className="py-14 sm:py-24 border-b border-white/[0.06] bg-gradient-to-b from-[#050508] via-[#090b10] to-[#050508]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Ecossistema Mobile
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              E QUANDO O PRODUTO ESTIVER PRONTO?<br />
              <span className="text-[#00E5FF]">NÓS TAMBÉM PODEMOS LEVÁ-LO PARA O CELULAR.</span>
            </h2>
            <p className="text-base sm:text-xl font-bold text-zinc-200">
              Seu produto não precisa ficar preso ao navegador.
            </p>
            <p className="text-xs sm:text-base text-zinc-400">
              Colocamos seu aplicativo nas principais lojas de aplicativos:
            </p>
          </div>

          <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 max-w-3xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-[#00E5FF]/40 transition-all text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-[#00E5FF]">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">APP STORE</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Seu produto disponível para usuários de iPhone e iPad.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition-all text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-emerald-400">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">GOOGLE PLAY</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Seu aplicativo disponível para usuários Android.
              </p>
            </div>
          </div>

          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/8 text-center max-w-3xl mx-auto space-y-3">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Do desenvolvimento à publicação, a tecnologia necessária para transformar seu produto em uma experiência mobile pode fazer parte da parceria.
            </p>
            <p className="text-sm sm:text-lg font-bold text-[#FF5500]">
              Você pensa no produto. Nós ajudamos a construir o caminho até ele chegar às mãos do usuário.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7: POR QUE CONSTRUIR TUDO SOZINHO? (COMPARATIVO) */}
      <section className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#030304]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              POR QUE CONSTRUIR TUDO SOZINHO?
            </h2>
            <p className="text-xs sm:text-sm uppercase tracking-wider text-[#FF5500] font-black">
              CONTRATAR DESENVOLVEDORES. MONTAR INFRAESTRUTURA. INTEGRAR IA. CRIAR O APP. PUBLICAR NAS LOJAS.
            </p>
            <p className="text-xs sm:text-base text-zinc-400 leading-relaxed">
              Tudo isso custa tempo, dinheiro e energia. E, muitas vezes, faz uma boa ideia ficar meses parada.
              A proposta da Kriativa é diferente: em vez de você financiar sozinho toda a construção tecnológica, podemos construir juntos.
            </p>
          </div>

          <div className="mt-10 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
                Você Traz
              </div>
              <ul className="space-y-3 pt-2">
                {[
                  "Mercado.",
                  "Conhecimento.",
                  "Produto.",
                  "Audiência.",
                  "Distribuição.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm sm:text-base font-bold text-white">
                    <CheckCircle2 className="w-5 h-5 text-[#00E5FF] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#FF5500]/10 via-white/[0.02] to-transparent border border-[#FF5500]/30 space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-xs font-bold uppercase tracking-wider">
                A Kriativa Traz
              </div>
              <ul className="space-y-3 pt-2">
                {[
                  "Tecnologia.",
                  "Nossos próprios modelos de inteligência artificial.",
                  "Desenvolvimento.",
                  "Infraestrutura.",
                  "Produto digital.",
                  "Experiência mobile.",
                  "Evolução tecnológica.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm sm:text-base font-bold text-white">
                    <CheckCircle2 className="w-5 h-5 text-[#FF5500] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 8: VOCÊ NÃO COMPRA UMA TECNOLOGIA. VOCÊ CONSTRÓI UM NEGÓCIO COM ELA. */}
      <section className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#050508]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            Aliança de Longo Prazo
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            VOCÊ NÃO COMPRA UMA TECNOLOGIA.<br />
            <span className="text-[#00E5FF]">VOCÊ CONSTRÓI UM NEGÓCIO COM ELA.</span>
          </h2>
          <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            Nosso objetivo não é simplesmente vender uma licença ou mais uma assinatura. Queremos encontrar projetos em que exista potencial para construir uma parceria de longo prazo.
          </p>
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-xs sm:text-base text-zinc-200 leading-relaxed max-w-2xl mx-auto">
            Por isso, trabalhamos com modelos de <strong className="text-[#FF5500]">coprodução e parceria estratégica</strong>. Em vez de simplesmente pagar pela tecnologia, você pode construir o produto junto com quem desenvolve a tecnologia.
            <div className="mt-4 pt-4 border-t border-white/10 text-base sm:text-xl font-black text-white">
              Se o produto cresce, a parceria cresce junto.
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 9: O QUE PODEMOS CONSTRUIR JUNTOS? */}
      <section id="o-que-construir" className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#030304]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              O QUE PODEMOS CONSTRUIR JUNTOS?
            </h2>
            <p className="text-zinc-400 text-xs sm:text-base">
              Soluções sob medida para o seu público e modelo de negócio:
            </p>
          </div>

          <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Layers,
                title: "SAAS",
                desc: "Transforme seu conhecimento ou solução em um software por assinatura.",
              },
              {
                icon: Smartphone,
                title: "APLICATIVOS",
                desc: "Leve seu produto para iOS e Android.",
              },
              {
                icon: Globe,
                title: "PLATAFORMAS",
                desc: "Crie ambientes próprios para seus clientes, alunos ou usuários.",
              },
              {
                icon: Zap,
                title: "FERRAMENTAS DE IA",
                desc: "Transforme uma ideia em uma ferramenta inteligente.",
              },
              {
                icon: Briefcase,
                title: "PRODUTOS DIGITAIS",
                desc: "Crie experiências digitais que vão além de aulas e conteúdos.",
              },
              {
                icon: ShieldCheck,
                title: "PRODUTOS B2B",
                desc: "Desenvolva soluções para empresas e operações específicas.",
              },
              {
                icon: Rocket,
                title: "MVPs",
                desc: "Tire uma ideia do papel e coloque uma primeira versão no mercado.",
              },
              {
                icon: TrendingUp,
                title: "NOVOS NEGÓCIOS",
                desc: "Construa algo completamente novo a partir de uma oportunidade.",
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-[#FF5500]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] flex items-center justify-center mb-3">
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
      <section className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#050508]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              A Quem Se Destina
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              PARA QUEM É ESSA PARCERIA?
            </h2>
            <p className="text-base sm:text-xl text-zinc-200 font-bold">
              PARA QUEM TEM UMA IDEIA, UM MERCADO OU UM PRODUTO PARA CONSTRUIR.
            </p>
          </div>

          <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "INFOPRODUTORES",
                desc: "Transforme seu conhecimento em plataformas, ferramentas e experiências digitais.",
              },
              {
                title: "ESPECIALISTAS",
                desc: "Transforme seu método em um produto tecnológico.",
              },
              {
                title: "EMPREENDEDORES",
                desc: "Tire uma ideia de SaaS, app ou plataforma do papel.",
              },
              {
                title: "EMPRESAS",
                desc: "Crie novas ferramentas, produtos e soluções digitais.",
              },
              {
                title: "CRIADORES",
                desc: "Transforme audiência e conhecimento em novos produtos.",
              },
              {
                title: "SAAS E STARTUPS",
                desc: "Acelere desenvolvimento, IA e novas experiências para seu produto.",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white/[0.02] border border-white/8 space-y-2">
                <div className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">{item.title}</div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{item.desc}</p>
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
      <section className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#030304]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            VOCÊ NÃO PRECISA SABER PROGRAMAR.<br />
            <span className="text-[#FF5500]">PRECISA SABER O QUE QUER CONSTRUIR.</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto pt-2">
            {[
              "Você não precisa dominar inteligência artificial.",
              "Não precisa conhecer infraestrutura.",
              "Não precisa montar um time inteiro de desenvolvimento.",
              "Não precisa descobrir sozinho como colocar seu aplicativo nas lojas.",
            ].map((txt, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/8 flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{txt}</span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 max-w-2xl mx-auto">
            <p className="text-sm sm:text-lg font-bold text-white mb-1">
              Você precisa conhecer seu mercado e enxergar uma oportunidade.
            </p>
            <p className="text-xs sm:text-sm text-zinc-400">
              A parte tecnológica pode ser construída em parceria com a Kriativa.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 12: DO ZERO AO PRODUTO (ROADMAP) */}
      <section id="roadmap" className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#050508]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Metodologia de Entrega
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              DO ZERO AO PRODUTO.<br />
              <span className="text-[#00E5FF]">UMA PARCERIA PARA CADA ETAPA.</span>
            </h2>
          </div>

          <div className="mt-10 sm:mt-16 space-y-4 max-w-3xl mx-auto">
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
                desc: "A tecnologia, IA e infraestrutura entram em ação.",
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
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-[#FF5500]/40 transition-all flex items-start sm:items-center gap-4 sm:gap-6"
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
      <section className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#030304]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            MAIS DO QUE DESENVOLVER UM PRODUTO.<br />
            <span className="text-[#00E5FF]">QUEREMOS CONSTRUIR UM NEGÓCIO.</span>
          </h2>
          <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            A tecnologia é apenas uma parte. O objetivo é criar algo que tenha:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-2xl mx-auto pt-2">
            {["Usuários.", "Valor.", "Modelo de negócio.", "Mercado.", "Potencial de escala."].map((pillar, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm font-bold text-zinc-200"
              >
                {pillar}
              </span>
            ))}
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 max-w-2xl mx-auto text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-2">
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
      <section className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#050508]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              E SE SUA IDEIA JÁ EXISTE?
            </h2>
            <p className="text-xl sm:text-3xl font-extrabold text-[#FF5500]">
              Melhor ainda.
            </p>
            <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
              Podemos avaliar o que você já possui e identificar onde a tecnologia, a inteligência artificial ou o mobile podem criar uma nova oportunidade. Seu produto pode estar pronto para:
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {[
              "Ganhar IA.",
              "Virar SaaS.",
              "Ganhar um aplicativo.",
              "Criar novas funcionalidades.",
              "Atender outro mercado.",
              "Aumentar sua monetização.",
              "Escalar.",
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/8 text-center text-xs sm:text-sm font-bold text-white flex items-center justify-center"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 15: NÃO ESTAMOS PROCURANDO CLIENTES. ESTAMOS PROCURANDO PARCEIROS. */}
      <section className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#030304]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            Filtro de Seleção
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            NÃO ESTAMOS PROCURANDO CLIENTES.<br />
            <span className="text-[#FF5500]">ESTAMOS PROCURANDO PARCEIROS.</span>
          </h2>
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-xs sm:text-base text-zinc-300 leading-relaxed space-y-3 max-w-2xl mx-auto">
            <p>
              Se você está procurando apenas uma software house para executar um projeto, existem muitas opções no mercado.
            </p>
            <p>
              Se você quer apenas comprar créditos de IA ou uma ferramenta rasa que depende de wrappers de terceiros, também existem diversas plataformas.
            </p>
            <p className="text-white font-bold pt-1">
              A Kriativa está procurando algo diferente. Desenvolvemos nossos próprios modelos de IA e construímos a infraestrutura de tecnologia para criar produtos reais e duradouros com você.
            </p>
            <div className="pt-3 border-t border-white/10 text-sm sm:text-lg font-bold text-[#FF5500]">
              Você traz a visão. Nós trazemos a tecnologia e nossos próprios modelos. E construímos o produto em conjunto.
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 16: TEM UMA IDEIA? (CTA INTERMEDIÁRIO) */}
      <section className="py-14 sm:py-24 border-b border-white/[0.06] bg-gradient-to-b from-[#050508] to-[#0d0e16]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
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
      <section id="faq" className="py-14 sm:py-24 border-b border-white/[0.06] bg-[#030304]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 sm:space-y-3 mb-10 sm:mb-14">
            <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Respostas Claras
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              PERGUNTAS FREQUENTES
            </h2>
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
      <section className="py-16 sm:py-28 border-b border-white/[0.06] bg-gradient-to-b from-[#050508] to-[#030304] relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[350px] sm:w-[650px] h-[200px] sm:h-[320px] bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-4 sm:space-y-6">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            SUA IDEIA.<br />
            <span className="text-[#FF5500]">NOSSA TECNOLOGIA.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#00E5FF]">
              UM PRODUTO QUE PODE IR MUITO MAIS LONGE.
            </span>
          </h2>

          <p className="text-xs sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Se você já tem conhecimento, audiência, mercado, produto ou simplesmente uma oportunidade que acredita que pode virar negócio, queremos conhecer.
          </p>

          <p className="text-base sm:text-xl font-bold text-white">
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
      <footer className="py-8 sm:py-10 bg-[#030304] pb-24 md:pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FF5500] flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-zinc-300">KRIATIVA</span>
            <span>— Tecnologia e inteligência artificial para quem cria o futuro.</span>
          </div>
          <div>
            by Trinn · Feito no Brasil
          </div>
        </div>
      </footer>

      {/* BARRA FIXA FLUTUANTE INFERIOR MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#030304]/95 backdrop-blur-md border-t border-white/10 z-30 md:hidden flex items-center gap-3">
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