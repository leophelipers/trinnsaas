"use client";

import React, { useState } from "react";
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
  Users,
  DollarSign,
  ChevronDown,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  HelpCircle,
  Clock,
  Sparkle,
} from "lucide-react";
import { InfoprodutorStepForm } from "./infoprodutor-step-form";

const FAQ_ITEMS = [
  {
    q: "Preciso pagar uma mensalidade para participar?",
    a: "Não. A proposta da parceria não é vender uma assinatura tradicional para o infoprodutor. A estrutura é construída através de um modelo de coprodução ganha-ganha, conforme o projeto e o potencial da parceria.",
  },
  {
    q: "Posso usar a Kriativa para criar meu próprio produto?",
    a: "Sim. A proposta é que você possa utilizar a infraestrutura de inteligência artificial também na sua própria operação, para criação acelerada de conteúdos, materiais, produtos, campanhas e experiências visuais.",
  },
  {
    q: "Meus alunos terão acesso à Kriativa?",
    a: "Essa é uma das grandes forças da parceria. A estrutura pode ser desenhada para que a Kriativa faça parte da experiência entregue aos seus alunos, permitindo que eles coloquem em prática o conhecimento imediatamente.",
  },
  {
    q: "Preciso ter um curso pronto?",
    a: "Não necessariamente. Avaliamos diferentes formatos de parceria, desde produtos consolidados e mentorias em andamento até novos projetos e métodos que possam ser construídos utilizando inteligência artificial.",
  },
  {
    q: "Posso usar a Kriativa para outros projetos da minha empresa?",
    a: "A estrutura da parceria será definida de acordo com cada projeto e negócio. O objetivo é criar uma relação duradoura e vantajosa para os dois lados.",
  },
  {
    q: "Qual é o percentual da coprodução?",
    a: "Não existe uma porcentagem rígida ou única para todos os parceiros. A divisão percentual é calibrada de acordo com o produto, o tamanho da audiência, a maturidade da operação e a participação de cada parte na entrega.",
  },
  {
    q: "Existe garantia de aprovação?",
    a: "Não. Todas as aplicações passam por uma análise criteriosa e individualizada da nossa equipe. Buscamos infoprodutores e criadores sérios, com produtos de qualidade e foco em construir relacionamentos de longo prazo.",
  },
];

export function InfoprodutorLanding() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const scrollToApply = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById("aplicar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="topo" className="min-h-screen bg-[#050506] text-white selection:bg-[#FF5500] selection:text-white">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050506]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5500] to-orange-600 flex items-center justify-center shadow-lg shadow-[#FF5500]/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                KRIATIVA
                <span className="text-[10px] font-semibold tracking-wider text-[#FF5500] uppercase px-1.5 py-0.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20">
                  Coprodução
                </span>
              </span>
              <span className="text-[10px] text-zinc-500 tracking-wider">BY TRINN</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <a href="#proposta" className="hover:text-white transition-colors">A Proposta</a>
            <a href="#operacao" className="hover:text-white transition-colors">Sua Operação</a>
            <a href="#motores" className="hover:text-white transition-colors">Motores de IA</a>
            <a href="#coproducao" className="hover:text-white transition-colors">Coprodução</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <button
            onClick={scrollToApply}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#FF5500]/20 cursor-pointer active:scale-95"
          >
            <span>Quero ser Parceiro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Glows de Fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#FF5500]/15 via-[#FF5500]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FF5500] text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
            <Sparkle className="w-3.5 h-3.5" />
            Parceria Estratégica · Coprodução de Tecnologia
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-white">
            CRIE MAIS. ENTREGUE MAIS.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-orange-400 to-[#00E5FF]">
              SEM CRIAR UMA PLATAFORMA DO ZERO.
            </span>
          </h1>

          <p className="mt-6 text-xl sm:text-2xl text-zinc-200 font-medium max-w-3xl mx-auto">
            Transforme a inteligência artificial em parte do seu produto.
          </p>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Use a Kriativa para criar seus próprios conteúdos, materiais, aulas, criativos e produtos digitais — e ofereça uma infraestrutura completa de inteligência artificial para seus alunos.
          </p>

          {/* 3 Pills de Destaque */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm font-semibold text-zinc-200">
              <CheckCircle2 className="w-4 h-4 text-[#FF5500]" />
              Sem mensalidade para você
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm font-semibold text-zinc-200">
              <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
              Sem desenvolver tecnologia
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm font-semibold text-zinc-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Sem montar operação de IA do zero
            </div>
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-white/[0.02] border border-white/8 max-w-2xl mx-auto text-sm text-zinc-300 leading-relaxed">
            <span className="text-white font-semibold">Você entra com seu conhecimento, produto e audiência.</span><br />
            A Kriativa entra com a tecnologia de ponta.<br />
            <strong className="text-[#FF5500]">O modelo é simples: uma parceria de coprodução.</strong>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToApply}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4.5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-orange-500 hover:from-orange-500 hover:to-[#FF5500] text-white text-base font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#FF5500]/30 cursor-pointer active:scale-95"
            >
              <span>Quero ser Parceiro</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#proposta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-semibold transition-all border border-white/10"
            >
              Entenda Como Funciona
            </a>
          </div>
        </div>
      </section>

      {/* SEÇÃO 1: O MERCADO MUDOU */}
      <section id="proposta" className="py-20 border-t border-white/5 bg-[#08080b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold uppercase tracking-widest">
              Mudança de Paradigma
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              SEUS ALUNOS NÃO QUEREM APENAS APRENDER.<br />
              <span className="text-[#00E5FF]">ELES QUEREM CONSEGUIR FAZER.</span>
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed pt-2">
              O mercado de infoprodutos mudou. Ensinar uma pessoa a fazer algo já não é suficiente quando ela pode simplesmente abrir uma ferramenta de inteligência artificial e tentar fazer sozinha.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 relative">
              <div className="w-12 h-12 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Conhecimento</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Seu método, suas aulas e sua autoridade continuam sendo o protagonismo e o alicerce essencial do aprendizado.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 relative">
              <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Tecnologia</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                A infraestrutura de inteligência artificial da Kriativa integrada ao seu produto, pronta para uso imediato dos alunos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Execução</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                O aluno não apenas assiste a aulas: ele sai com o resultado prático gerado, acelerando o retorno e os depoimentos.
              </p>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-[#FF5500]/10 via-white/[0.02] to-[#00E5FF]/10 border border-white/10 text-center">
            <p className="text-lg text-zinc-200 font-medium">
              Seu aluno aprende com você. <strong className="text-white">E usa a Kriativa para colocar aquilo em prática imediatamente.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: E VOCÊ TAMBÉM PODE USAR (SUA OPERAÇÃO) */}
      <section id="operacao" className="py-20 border-t border-white/5 bg-[#050506]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-xs font-bold uppercase tracking-widest">
              Aceleração da Sua Empresa
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              E VOCÊ TAMBÉM PODE USAR.
            </h2>
            <p className="text-lg text-zinc-300 font-medium">
              A Kriativa não serve apenas para o seu aluno. Ela pode fazer parte da sua própria operação.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Use inteligência artificial para acelerar a criação do seu próximo produto, curso, comunidade ou treinamento:
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: "Aulas e Materiais", desc: "Apostilas, resumos e slides ricos", icon: Layers },
              { title: "Imagens e Apresentações", desc: "Artes e decks com acabamento profissional", icon: ImageIcon },
              { title: "Vídeos e Conteúdos", desc: "Cenas, cortes e dinâmicas visuais", icon: Video },
              { title: "Roteiros e Textos", desc: "Narrativas de vendas e roteiros de aula", icon: FileText },
              { title: "Criativos para Anúncios", desc: "Testes rápidos para tráfego pago", icon: Zap },
              { title: "Áudios e Narrações", desc: "Locuções neurais com timbre cinematográfico", icon: Mic },
              { title: "Agentes e Automações", desc: "Assistentes inteligentes para seus alunos", icon: Bot },
              { title: "Protótipos e Experiências", desc: "Ferramentas interativas próprias", icon: Code2 },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-[#FF5500]/40 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-[#FF5500]/20 text-[#FF5500] flex items-center justify-center mb-3 transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base mb-1">{item.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center text-sm sm:text-base text-zinc-400">
            Você não precisa contratar uma ferramenta diferente para cada etapa.<br />
            <strong className="text-white">A Kriativa concentra a infraestrutura de inteligência artificial que você precisa para criar.</strong>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: TRANSFORME SEU PRODUTO EM UMA EXPERIÊNCIA */}
      <section className="py-20 border-t border-white/5 bg-[#08080b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              DEIXE DE ENTREGAR APENAS CONTEÚDO.<br />
              <span className="text-[#FF5500]">TRANSFORME SEU PRODUTO EM UMA EXPERIÊNCIA.</span>
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
              Imagine vender um curso e, junto com as aulas, entregar ao seu aluno acesso a uma plataforma onde ele pode colocar o conhecimento em prática imediatamente.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
              <span className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">Você ensina Marketing?</span>
              <p className="text-zinc-200 text-sm leading-relaxed">
                Seu aluno pode criar campanhas completas, conteúdos, carrosséis e criativos de tráfego dentro da plataforma.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
              <span className="text-xs font-bold text-[#00E5FF] uppercase tracking-wider">Você ensina Design?</span>
              <p className="text-zinc-200 text-sm leading-relaxed">
                Ele pode produzir e renderizar imagens, apresentações e materiais visuais de alta definição.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Você ensina Vídeo?</span>
              <p className="text-zinc-200 text-sm leading-relaxed">
                Ele pode sintetizar cenas cinematográficas, animar imagens com áudio e experimentar novos formatos em vídeo.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Você ensina Negócios & Vendas?</span>
              <p className="text-zinc-200 text-sm leading-relaxed">
                Ele pode montar agentes de atendimento, automações inteligentes e ferramentas personalizadas.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
            <p className="text-zinc-300 text-base sm:text-lg">
              <span className="text-white font-bold">Seu conhecimento continua sendo o protagonista.</span><br />
              A tecnologia passa a ser o braço de execução.
            </p>
            <button
              onClick={scrollToApply}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/10 cursor-pointer"
            >
              Quero Levar a Kriativa Para Meu Produto →
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: POR QUE CONSTRUIR UMA PLATAFORMA DE IA? */}
      <section className="py-20 border-t border-white/5 bg-[#050506]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest">
                Foco no seu Negócio
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                POR QUE CONSTRUIR UMA PLATAFORMA DE IA?<br />
                <span className="text-zinc-400">SE VOCÊ PODE COMEÇAR COM UMA QUE JÁ EXISTE?</span>
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Criar uma plataforma própria de inteligência artificial exige tecnologia avançada, infraestrutura, integrações contínuas, manutenção de modelos, instâncias de processamento dedicadas, desenvolvimento constante e uma operação inteira por trás.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Você não precisa transformar sua empresa em uma empresa de software.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#101116] to-[#0c0d12] border border-white/10 space-y-5">
              <div className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">
                Continue fazendo aquilo que você faz melhor:
              </div>
              <div className="space-y-3">
                {[
                  "Criar conhecimento e métodos transformadores",
                  "Construir produtos digitais desejados",
                  "Vender e escalar suas ofertas",
                  "Ensinar e acompanhar seus alunos",
                  "Construir audiência e relevância de mercado",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5 text-xs text-zinc-400">
                A Kriativa cuida de 100% da infraestrutura tecnológica e da evolução contínua dos modelos de IA.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: UMA PLATAFORMA. MUITAS POSSIBILIDADES (MOTORES) */}
      <section id="motores" className="py-20 border-t border-white/5 bg-[#08080b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold uppercase tracking-widest">
              Ecossistema Completo
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              UMA PLATAFORMA. MUITAS POSSIBILIDADES.
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Seus alunos podem ter acesso a diferentes formas de inteligência artificial em um único lugar:
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "IMAGEM",
                desc: "Criação e edição de imagens cinematográficas para conteúdos, anúncios, produtos e projetos digitais.",
                badge: "Kriativa Vision",
                color: "#FF5500",
                icon: ImageIcon,
              },
              {
                title: "VÍDEO",
                desc: "Produção de vídeos, cenas dinâmicas, animação de imagens com áudio e materiais visuais de alta definição.",
                badge: "Kriativa Motion",
                color: "#00E5FF",
                icon: Video,
              },
              {
                title: "ÁUDIO",
                desc: "Narrações neurais em português brasileiro com expressividade de cinema, vozes calibradas e transcrição ágil.",
                badge: "Kriativa Voice",
                color: "#8B5CF6",
                icon: Mic,
              },
              {
                title: "TEXTO",
                desc: "Ideias, roteiros de aula, copys de alta conversão, planejamento editorial, pesquisas e produção estruturada.",
                badge: "Kriativa Mind",
                color: "#22c55e",
                icon: FileText,
              },
              {
                title: "CÓDIGO",
                desc: "Criação de ferramentas interativas, protótipos de software e soluções digitais sob medida.",
                badge: "Kriativa Code",
                color: "#eab308",
                icon: Code2,
              },
              {
                title: "AGENTES",
                desc: "Automação de tarefas operacionais, suporte e criação de fluxos inteligentes customizados.",
                badge: "Kriativa Agents",
                color: "#ec4899",
                icon: Bot,
              },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/20 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
                        <IconComp className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center text-xs text-zinc-500">
            E novas possibilidades e instâncias de processamento continuam sendo adicionadas continuamente à plataforma.
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: COMO VOCÊ GANHA (COPRODUÇÃO) & COMPARATIVO */}
      <section id="coproducao" className="py-20 border-t border-white/5 bg-[#050506]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              Modelo Ganha-Ganha
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              E COMO VOCÊ GANHA COM ISSO?
            </h2>
            <p className="text-xl text-zinc-200 font-semibold">
              Você não precisa pagar uma mensalidade para ter a Kriativa no seu produto.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Nosso objetivo não é vender mais uma assinatura de ferramenta para você. Queremos construir uma verdadeira parceria de negócios.
            </p>
          </div>

          {/* Comparativo de Papéis */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* O que você coloca */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                Sua Parte
              </div>
              <h3 className="text-2xl font-bold text-white">O que você coloca na mesa?</h3>
              <div className="space-y-4">
                {[
                  { title: "Seu Conhecimento", desc: "Você continua sendo especialista e autoridade máxima naquilo que ensina." },
                  { title: "Seu Produto", desc: "Curso, mentoria, comunidade, treinamento ou qualquer formato de infoproduto." },
                  { title: "Sua Audiência", desc: "Sua base de alunos ativos, seguidores qualificados e clientes existentes." },
                  { title: "Sua Distribuição", desc: "A capacidade comprovada de levar a oferta até as pessoas certas." },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="font-bold text-sm text-white">{item.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* O que a Kriativa coloca */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-[#14151e] to-[#0c0d12] border border-[#FF5500]/30 shadow-xl shadow-[#FF5500]/5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5500]/20 text-[#FF5500] text-xs font-bold uppercase tracking-wider">
                Nossa Parte
              </div>
              <h3 className="text-2xl font-bold text-white">O que a Kriativa coloca?</h3>
              <div className="space-y-4">
                {[
                  { title: "Tecnologia Pronta", desc: "Uma plataforma completa de inteligência artificial de última geração." },
                  { title: "Infraestrutura Robusta", desc: "A tecnologia necessária para que seus alunos utilizem as ferramentas sem travar." },
                  { title: "Evolução Contínua", desc: "Novos motores de renderização, recursos e atualizações frequentes sem custo extra." },
                  { title: "Operação Tecnológica", desc: "Você não precisa criar, manter ou dar suporte a servidores próprios." },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="font-bold text-sm text-[#FF5500]">{item.title}</div>
                    <div className="text-xs text-zinc-300 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-2">
            <p className="text-base sm:text-lg text-zinc-200">
              Em vez de simplesmente comprar uma licença, <strong className="text-white">você e a Kriativa constroem uma oferta juntos</strong>.
            </p>
            <p className="text-sm font-semibold text-[#FF5500]">
              Se o seu produto cresce, a parceria cresce junto.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7: PARA QUEM É & NÃO É PARA TODO MUNDO */}
      <section className="py-20 border-t border-white/5 bg-[#08080b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Para quem é */}
            <div className="p-8 rounded-3xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-4">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Público Alvo
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                Para quem é essa parceria?
              </h3>
              <p className="text-sm text-zinc-300">
                Estamos procurando infoprodutores que já tenham algo real para construir. Pode ser você se já possui:
              </p>
              <div className="space-y-2.5 pt-2">
                {[
                  "Um curso validado ou mentoria ativa",
                  "Uma comunidade engajada de membros",
                  "Uma audiência relevante e interessada no seu nicho",
                  "Um método próprio testado na prática",
                  "Uma operação consistente de conteúdo",
                  "Ou uma ideia de produto que ganha outra escala com IA",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Não é para todo mundo */}
            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10 space-y-4">
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Critério de Seleção
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                Não é para todo mundo. E tudo bem.
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Não estamos procurando pessoas que simplesmente querem uma ferramenta gratuita ou que buscam atalhos superficiais.
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Estamos procurando <strong className="text-white">parceiros</strong>. Pessoas que enxergam a inteligência artificial não apenas como uma tendência passageira, mas como uma nova camada de infraestrutura para seus negócios.
              </p>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400">
                Se você quer apenas uma assinatura de IA genérica, existem várias opções. Mas se quer construir uma oferta junto com uma empresa de tecnologia, a conversa é diferente.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 8: FORMULÁRIO EM PASSOS (CONTAINER #aplicar) */}
      <section id="aplicar" className="py-24 border-t border-white/5 bg-gradient-to-b from-[#08080b] to-[#050506] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Processo de Seleção de Parceiros
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              VAMOS CONSTRUIR JUNTOS?
            </h2>
            <p className="text-lg text-zinc-200 font-medium max-w-2xl mx-auto">
              Conte um pouco sobre você, seu produto e sua audiência.
            </p>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Nossa equipe vai analisar seu perfil e entender se existe uma oportunidade de parceria entre sua operação e a Kriativa. O preenchimento do formulário não significa garantia de aprovação. Estamos selecionando parceiros para construir projetos de longo prazo.
            </p>
          </div>

          {/* O COMPONENTE DE FORMULÁRIO EM PASSOS */}
          <InfoprodutorStepForm />
        </div>
      </section>

      {/* SEÇÃO 9: PERGUNTAS FREQUENTES (FAQ) */}
      <section id="faq" className="py-20 border-t border-white/5 bg-[#08080b]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-bold uppercase tracking-widest">
              Tire Suas Dúvidas
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              PERGUNTAS FREQUENTES
            </h2>
            <p className="text-sm text-zinc-400">
              Tudo o que você precisa saber sobre o modelo de parceria e coprodução com a Kriativa.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-white hover:text-[#FF5500] transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#FF5500]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-zinc-400 leading-relaxed border-t border-white/5 animate-fadeIn">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO 10: CTA FINAL */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-b from-[#050506] via-[#0c0d12] to-[#050506] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            SE VOCÊ JÁ TEM AUDIÊNCIA, CONHECIMENTO OU UM PRODUTO...<br />
            <span className="text-zinc-400">TALVEZ VOCÊ NÃO PRECISE DE MAIS UMA FERRAMENTA.</span><br />
            <span className="text-[#FF5500]">TALVEZ VOCÊ PRECISE DE UM PARCEIRO DE TECNOLOGIA.</span>
          </h2>

          <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto">
            Conte para nós o que você está construindo. Vamos desenhar juntos a melhor solução.
          </p>

          <div className="pt-4">
            <button
              onClick={scrollToApply}
              className="inline-flex items-center gap-3 px-8 py-4.5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-orange-500 hover:from-orange-500 hover:to-[#FF5500] text-white text-base font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#FF5500]/30 cursor-pointer active:scale-95"
            >
              <span>Quero ser Parceiro da Kriativa</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 bg-[#050506] text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="font-heading font-black text-white text-sm tracking-tight">KRIATIVA</span>
            <span>Inteligência artificial para quem cria o futuro.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-zinc-300 transition-colors">Início</Link>
            <Link href="/sobre" className="hover:text-zinc-300 transition-colors">Sobre</Link>
            <Link href="/recursos" className="hover:text-zinc-300 transition-colors">Recursos</Link>
            <a href="#aplicar" onClick={scrollToApply} className="text-[#FF5500] hover:underline">Aplicar</a>
          </div>

          <div>
            by trinn — Feito com amor no Brasil.
          </div>
        </div>
      </footer>
    </div>
  );
}
