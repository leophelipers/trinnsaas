"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { trackMetaLead } from "@/lib/meta-pixel";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Film,
  Mic,
  Brain,
  Heart,
  Infinity as InfinityIcon,
  Ticket,
} from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "O plano já está disponível?",
    a: "Ainda não. Esta página é exclusivamente para o pré-lançamento. Quem se cadastrar receberá as informações sobre o lançamento e poderá acompanhar as novidades antes da abertura oficial.",
  },
  {
    q: "Quanto custará?",
    a: "O preço normal estimado do plano cheio será de R$500/mês. Durante o pré-lançamento, serão disponibilizadas condições especiais para os primeiros participantes.",
  },
  {
    q: "Os primeiros 50 pagarão R$50?",
    a: "A condição planejada para os primeiros 50 participantes é de R$50/mês enquanto mantiverem a assinatura ativa.",
  },
  {
    q: "E depois dos primeiros 50?",
    a: "Novas condições serão disponibilizadas conforme a lista avançar. A quantidade de pessoas que poderá garantir cada condição é limitada.",
  },
  {
    q: "Preciso pagar para entrar na lista?",
    a: "Não. O cadastro no pré-lançamento é gratuito.",
  },
  {
    q: "O que são os R$5?",
    a: "Os R$5 correspondem exclusivamente à reserva da condição de lançamento (um lugar prioritário na fila para o primeiro mês de R$50). O pagamento é feito apenas por cartão de crédito, pois utilizaremos o mesmo cartão para as assinaturas. A reserva não representa a mensalidade, não será convertida em créditos e não concede acesso imediato ao plano.",
  },
  {
    q: "O que significa “IA ilimitada”?",
    a: "Significa que o plano não funcionará com um saldo de créditos que é descontado a cada geração. O uso continuará sujeito aos limites técnicos, disponibilidade de infraestrutura, capacidade de processamento e regras de uso justo da plataforma.",
  },
  {
    q: "Quais modelos estarão disponíveis?",
    a: "Estarão disponíveis exclusivamente os motores integrados da plataforma: Kriativa Vision (Swift, Pro e Ultra), Kriativa Motion (Swift, Pro e Cinema), Kriativa Voice (Swift, Pro e Transcribe) e Kriativa Mind (Swift, Pro e Ultra).",
  },
  {
    q: "Quando poderei usar?",
    a: "A data de lançamento será comunicada aos participantes do pré-lançamento.",
  },
];

const AI_PILLARS = [
  {
    index: "01",
    tag: "KRIATIVA VISION",
    title: "IMAGENS",
    description:
      "Crie imagens, personagens, conceitos, campanhas, cenários e universos visuais.",
    tiers: ["Swift", "Pro", "Ultra"],
    models: "Vision Swift · Vision Pro · Vision Ultra",
    icon: ImageIcon,
    accent: "from-[#FF5500]/12 via-white/[0.02] to-transparent",
  },
  {
    index: "02",
    tag: "KRIATIVA MOTION",
    title: "VÍDEOS",
    description:
      "Transforme ideias e imagens em movimento e crie vídeos com diferentes níveis de geração e refinamento.",
    tiers: ["Swift", "Pro", "Cinema"],
    models: "Motion Swift · Motion Pro · Motion Cinema",
    icon: Film,
    accent: "from-white/[0.06] via-[#FF5500]/08 to-transparent",
  },
  {
    index: "03",
    tag: "KRIATIVA VOICE",
    title: "ÁUDIO",
    description:
      "Crie vozes, falas e trabalhe com transcrição diretamente na plataforma.",
    tiers: ["Swift", "Pro", "Transcribe"],
    models: "Voice Swift · Voice Pro · Voice Transcribe",
    icon: Mic,
    accent: "from-[#FF5500]/10 via-white/[0.02] to-transparent",
  },
  {
    index: "04",
    tag: "KRIATIVA MIND",
    title: "TEXTO",
    description:
      "Escreva, analise, pesquise, programe, planeje e desenvolva ideias com modelos de linguagem.",
    tiers: ["Swift", "Pro", "Ultra"],
    models: "Mind Swift · Mind Pro · Mind Ultra",
    icon: Brain,
    accent: "from-white/[0.06] via-[#FF5500]/08 to-transparent",
  },
];

const CREATIVE_FLOW_STEPS = [
  "Você teve uma ideia.",
  "Gerou uma imagem.",
  "Não ficou boa.",
  "Tentou outra.",
  "Mudou o prompt.",
  "Tentou novamente.",
  "Agora quer transformar aquilo em vídeo.",
  "Depois testar outra versão.",
];

export function PreLaunchLanding() {
  const { isSignedIn, isLoaded } = useAuth();
  const clerk = useClerk();
  const router = useRouter();
  const myStatus = useQuery(api.preLaunch.getMyPreLaunchStatus);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isHeroCtaVisible, setIsHeroCtaVisible] = useState(true);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("kriativa_prelaunch_intent", "true");
      }
    } catch {
      // Ignora em modo privado do iOS Safari / WebViews restritos
    }
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn && myStatus?.hasPreLaunchTag) {
      router.replace("/pre-lancamento");
    }
  }, [isLoaded, isSignedIn, myStatus?.hasPreLaunchTag, router]);

  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroCtaVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSaveLeadIntent = (source = "pre_launch_landing_cta") => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("kriativa_prelaunch_intent", "true");
        localStorage.setItem(
          "kriativa_prelaunch_lead",
          JSON.stringify({
            tag: "pre_lancamento",
            ts: Date.now(),
          })
        );
      }
    } catch {
      // Ignora se localStorage estiver bloqueado no navegador mobile
    }

    trackMetaLead({
      source,
    });
  };

  const handleOpenSignUp = (source: string) => {
    handleSaveLeadIntent(source);

    if (isSignedIn) {
      router.push("/pre-lancamento");
      return;
    }

    try {
      if (clerk && typeof clerk.openSignUp === "function") {
        clerk.openSignUp({
          forceRedirectUrl: "/pre-lancamento",
          fallbackRedirectUrl: "/pre-lancamento",
          signInForceRedirectUrl: "/pre-lancamento",
          signInFallbackRedirectUrl: "/pre-lancamento",
        });
        return;
      }
    } catch {
      // Fallback para rota direta caso o modal não abra em WebView específico
    }

    router.push("/sign-up?redirect_url=/pre-lancamento");
  };

  const handleOpenSignIn = () => {
    handleSaveLeadIntent("header_signin");

    if (isSignedIn) {
      router.push("/pre-lancamento");
      return;
    }

    try {
      if (clerk && typeof clerk.openSignIn === "function") {
        clerk.openSignIn({
          forceRedirectUrl: "/pre-lancamento",
          fallbackRedirectUrl: "/pre-lancamento",
          signUpForceRedirectUrl: "/pre-lancamento",
          signUpFallbackRedirectUrl: "/pre-lancamento",
        });
        return;
      }
    } catch {
      // Fallback para rota direta
    }

    router.push("/sign-in?redirect_url=/pre-lancamento");
  };

  /**
   * Botão CTA leve (sem instanciar múltiplos Portals do Clerk na árvore DOM mobile)
   */
  const renderClerkSignUpCta = (opts: {
    label: string;
    source: string;
    variant?: "primary-orange" | "primary-light" | "glass";
    fullWidth?: boolean;
    compact?: boolean;
  }) => {
    const baseClasses = opts.compact
      ? "min-h-[42px] px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-[0.08em] flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer active:scale-[0.98]"
      : `${
          opts.fullWidth ? "w-full" : "w-full sm:w-auto"
        } min-h-[54px] inline-flex items-center justify-center gap-3 px-7 sm:px-8 py-4 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-[0.11em] transition-colors cursor-pointer active:scale-[0.98]`;

    const variant = opts.variant || "primary-orange";
    const styleClasses =
      variant === "primary-orange"
        ? "bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white border border-white/20 shadow-[0_10px_30px_-8px_rgba(255,85,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.3)]"
        : variant === "primary-light"
          ? "bg-white hover:bg-zinc-100 text-zinc-950 shadow-[0_10px_30px_-8px_rgba(255,255,255,0.2)]"
          : "bg-gradient-to-b from-white/[0.07] to-white/[0.03] hover:from-white/[0.11] hover:to-white/[0.05] border border-white/[0.14] hover:border-[#FF5500]/40 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)]";

    return (
      <button
        type="button"
        onClick={() => handleOpenSignUp(opts.source)}
        className={`${baseClasses} ${styleClasses}`}
      >
        <span>{opts.label}</span>
        <ArrowRight className="w-4 h-4 shrink-0" />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#040406] text-zinc-100 font-sans selection:bg-[#FF5500]/30 selection:text-white overflow-x-hidden relative pb-28 lg:pb-0">
      {/* =====================================================================
          LIGHTWEIGHT ATMOSPHERE (ZERO GPU FILTER BLUR TO PREVENT IOS SAFARI CRASH)
      ===================================================================== */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,85,0,0.12) 0%, rgba(255,255,255,0.03) 45%, transparent 80%)",
        }}
      />

      {/* =====================================================================
          FLOATING LIQUID GLASS HEADER
      ===================================================================== */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#040406]/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-15 sm:h-18 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-b from-white/[0.1] to-white/[0.02] border border-white/[0.14] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28)] flex items-center justify-center shrink-0 relative">
              <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
            </div>
            <div className="flex items-center gap-2 truncate">
              <span className="font-display font-bold text-sm sm:text-base tracking-[-0.02em] text-white">
                KRIATIVA
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.09] text-zinc-400">
                by trinn
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSignedIn ? (
              <button
                type="button"
                onClick={() => router.push("/pre-lancamento")}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#FF5500] text-white font-semibold text-xs sm:text-sm hover:bg-[#ff661a] transition-colors flex items-center gap-1.5 active:scale-[0.98]"
              >
                <span>Acessar Pré-Lançamento</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleOpenSignIn}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] text-xs font-medium text-zinc-300 hover:text-white transition-colors active:scale-[0.98] cursor-pointer"
                >
                  Entrar
                </button>

                <div className="hidden sm:block">
                  {renderClerkSignUpCta({
                    label: "Entrar no Pré-Lançamento",
                    source: "header_signup",
                    variant: "primary-orange",
                    compact: true,
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* =====================================================================
            SECTION 1: MONUMENTAL EDITORIAL HERO (ZERO FORM FRICTION)
        ===================================================================== */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-14 sm:pt-20 sm:pb-24 text-center">
          {/* Liquid Glass Capsule */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)] mb-6 sm:mb-8">
            <span className="inline-flex rounded-full h-2 w-2 bg-[#FF5500]" />
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-200">
              Pré-Lançamento Oficial · Lote 01
            </span>
          </div>

          {/* Monumental Display Headline */}
          <h1 className="font-display text-[2.15rem] sm:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.035em] leading-[1.05] text-white mb-5 sm:mb-6">
            PARE DE CONTAR CRÉDITOS.
            <span className="block mt-1.5 bg-gradient-to-r from-white via-zinc-100 to-[#FF5500] bg-clip-text text-transparent">
              COMECE A CRIAR.
            </span>
          </h1>

          <h3 className="text-base sm:text-2xl font-medium text-zinc-200 tracking-tight leading-snug max-w-2xl mx-auto mb-7 sm:mb-9">
            Uma nova forma de usar inteligência artificial está chegando.
          </h3>

          {/* Liquid Glass Manifesto Panel */}
          <div className="max-w-2xl mx-auto rounded-[28px] bg-gradient-to-b from-white/[0.05] to-white/[0.018] border border-white/[0.1] p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.18)] text-left sm:text-center space-y-4 mb-8 sm:mb-10 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5500]/50 to-transparent" />

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Imagine poder criar imagens, vídeos, vozes e textos sem precisar
              pensar em quantos créditos ainda restam.
            </p>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Sem escolher entre{" "}
              <strong className="text-white font-medium">
                tentar mais uma vez
              </strong>{" "}
              ou{" "}
              <strong className="text-white font-medium">
                guardar seus créditos
              </strong>
              . Sem transformar cada ideia em uma conta.
            </p>

            <div className="py-1.5">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/[0.12] px-4 py-2 text-base sm:text-lg text-white font-display font-semibold tracking-tight shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                Você tem uma ideia. Você cria.
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Estamos preparando um plano de IA ilimitada, com acesso a
              diferentes modelos de geração dentro de uma única assinatura.
            </p>
            <p className="text-sm sm:text-base font-medium text-white pt-0.5">
              E quem chegar primeiro terá as melhores condições.
            </p>
          </div>

          {/* Primary Clerk SignUp CTA */}
          <div ref={heroCtaRef} className="max-w-md mx-auto space-y-3">
            {renderClerkSignUpCta({
              label: "Quero Entrar no Pré-Lançamento",
              source: "hero_primary_cta",
              variant: "primary-orange",
              fullWidth: true,
            })}
            <p className="text-[11px] sm:text-xs text-zinc-500 italic">
              Cadastro gratuito. O plano ainda não está disponível.
            </p>
          </div>
        </section>

        {/* DOPAMINE BREAK 01: Vertical Luminous Filament */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="w-px h-12 sm:h-16 bg-gradient-to-b from-transparent via-[#FF5500]/50 to-white/20" />
          <div className="w-2 h-2 rounded-full border border-[#FF5500]/60 bg-[#040406]" />
        </div>

        {/* =====================================================================
            SECTION 2: E SE VOCÊ PUDESSE SIMPLESMENTE... CRIAR?
        ===================================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="inline-block text-[10px] font-mono uppercase tracking-[0.22em] text-[#FF5500] mb-2.5">
              01 · O Fluxo Real
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight leading-[1.12]">
              E SE VOCÊ PUDESSE SIMPLESMENTE... CRIAR?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-stretch">
            {/* Left: The Creative Experimentation Stream */}
            <div className="lg:col-span-6 rounded-[28px] bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.08] p-5 sm:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                {CREATIVE_FLOW_STEPS.map((step, i) => (
                  <div
                    key={step}
                    className="rounded-2xl bg-white/[0.03] border border-white/[0.07] px-3.5 py-3 flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.09] font-mono text-[10px] text-[#FF5500] flex items-center justify-center shrink-0">
                      0{i + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-200 font-medium leading-snug">
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-[#FF5500]/12 via-white/[0.04] to-transparent border border-[#FF5500]/25 px-4 py-3.5 flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-zinc-300">
                  É assim que a criação funciona.
                </span>
                <strong className="font-display text-sm sm:text-base text-white font-semibold">
                  Você experimenta.
                </strong>
              </div>
            </div>

            {/* Right: The Mental Friction Resolution Card */}
            <div className="lg:col-span-6 rounded-[28px] bg-gradient-to-b from-white/[0.045] to-white/[0.015] border border-white/[0.1] p-5 sm:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)] flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  O problema é que muitas plataformas transformam cada tentativa
                  em um custo.
                </p>
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-zinc-500">
                  Você começa a pensar:
                </p>

                <blockquote className="relative rounded-2xl bg-black/50 border border-white/[0.12] p-5">
                  <div className="w-1 h-8 bg-[#FF5500] rounded-full absolute left-0 top-1/2 -translate-y-1/2" />
                  <p className="font-display text-lg sm:text-xl font-medium text-white italic tracking-tight pl-2">
                    “Será que vale gastar mais um crédito?”
                  </p>
                </blockquote>

                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  E, sem perceber, começa a criar menos.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] space-y-1.5">
                <p className="text-xs sm:text-sm font-medium text-zinc-300">
                  A inteligência artificial deveria fazer exatamente o
                  contrário.
                </p>
                <p className="font-display text-lg sm:text-2xl font-bold text-white tracking-tight">
                  Deveria dar liberdade para você experimentar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 3: SEM CONTADOR. SEM MEDO DE TENTAR DE NOVO.
        ===================================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="relative rounded-[32px] sm:rounded-[44px] bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent border-t border-x border-white/[0.14] px-5 py-10 sm:p-14 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22)] overflow-hidden">
            <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5500] to-transparent opacity-75" />

            <div className="space-y-2 mb-6 sm:mb-8">
              <h2 className="font-display text-2xl sm:text-5xl font-bold text-white tracking-[-0.025em] leading-[1.08]">
                SEM CONTADOR.
                <span className="block bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                  SEM MEDO DE TENTAR DE NOVO.
                </span>
              </h2>
            </div>

            <p className="text-xs sm:text-base text-zinc-400 max-w-xl mx-auto mb-5">
              Estamos preparando uma assinatura que funciona de uma forma
              simples:
            </p>

            {/* Centerpiece Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-2xl bg-black/50 border border-[#FF5500]/35 px-6 py-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)] mb-8">
              <InfinityIcon className="w-4 h-4 text-[#FF5500]" />
              <span className="font-display text-lg sm:text-2xl font-bold text-white tracking-tight">
                Você assina. E cria.
              </span>
            </div>

            {/* 4 Tactile Glass Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-2xl mx-auto mb-8">
              {[
                { label: "Imagem.", icon: ImageIcon },
                { label: "Vídeo.", icon: Film },
                { label: "Voz.", icon: Mic },
                { label: "Texto.", icon: Brain },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white/[0.035] border border-white/[0.09] py-4 px-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#FF5500]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-display text-base sm:text-lg font-semibold text-white">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="max-w-2xl mx-auto space-y-3 text-xs sm:text-base text-zinc-400 leading-relaxed mb-8">
              <p className="text-white font-semibold text-sm sm:text-lg">
                Tudo em um só lugar.
              </p>
              <p>
                Sem precisar comprar um novo pacote de créditos toda vez que
                quiser continuar criando.
              </p>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
                O uso continuará sujeito aos limites técnicos da plataforma e às
                regras de uso justo — mas a ideia é simples:
              </p>
              <p className="font-display text-base sm:text-xl font-semibold text-white pt-1">
                não transformar cada geração em uma pequena decisão de compra.
              </p>
            </div>

            {renderClerkSignUpCta({
              label: "Quero Ser Avisado do Lançamento",
              source: "section_sem_contador",
              variant: "glass",
            })}
          </div>
        </section>

        {/* =====================================================================
            SECTION 4: QUATRO TIPOS DE IA. UMA EXPERIÊNCIA.
        ===================================================================== */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-9 sm:mb-14">
            <span className="inline-block text-[10px] font-mono uppercase tracking-[0.22em] text-[#FF5500] mb-2.5">
              02 · Quatro Motores Criativos
            </span>
            <h2 className="font-display text-2xl sm:text-5xl font-bold text-white tracking-[-0.025em] leading-[1.08]">
              QUATRO TIPOS DE IA.
              <span className="block bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                UMA EXPERIÊNCIA.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {AI_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.tag}
                  className="group relative rounded-[28px] bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.09] p-5 sm:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] flex flex-col justify-between overflow-hidden"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${pillar.accent} opacity-70`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#FF5500] font-semibold">
                          /{pillar.index}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-200 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1]">
                          {pillar.tag}
                        </span>
                      </div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/40 border border-white/[0.12] flex items-center justify-center text-white">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>

                    <h3 className="font-display text-xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                      {pillar.title}
                    </h3>

                    <p className="text-xs sm:text-base text-zinc-400 leading-relaxed mb-6">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5">
                      {pillar.tiers.map((tier, idx) => (
                        <span
                          key={tier}
                          className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
                            idx === pillar.tiers.length - 1
                              ? "bg-[#FF5500]/15 border-[#FF5500]/40 text-white font-semibold"
                              : "bg-white/[0.03] border-white/[0.08] text-zinc-300"
                          }`}
                        >
                          {tier}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {pillar.models}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Launch Models Spec Matrix */}
          <div className="rounded-[28px] bg-gradient-to-b from-white/[0.035] to-white/[0.015] border border-white/[0.08] p-5 sm:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
              <h3 className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-zinc-200">
                Modelos Kriativa previstos para o lançamento
              </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4">
              {[
                {
                  label: "Kriativa Vision",
                  models: "Vision Swift · Vision Pro · Vision Ultra",
                },
                {
                  label: "Kriativa Motion",
                  models: "Motion Swift · Motion Pro · Motion Cinema",
                },
                {
                  label: "Kriativa Voice",
                  models: "Voice Swift · Voice Pro · Voice Transcribe",
                },
                {
                  label: "Kriativa Mind",
                  models: "Mind Swift · Mind Pro · Mind Ultra",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl bg-black/35 border border-white/[0.07] p-3.5 sm:p-4"
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#FF5500] mb-1">
                    {m.label}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-zinc-100">
                    {m.models}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] sm:text-xs text-zinc-500 italic leading-relaxed">
              *Os modelos Kriativa (Vision, Motion, Voice e Mind) operam de
              forma integrada dentro da assinatura para entregar diferentes
              níveis de velocidade e refinamento.
            </p>
          </div>
        </section>

        {/* =====================================================================
            SECTION 5 & 6: AGORA VEM A PARTE MAIS IMPORTANTE + OS PRIMEIROS 50
        ===================================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
          <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-8 sm:mb-12">
            <span className="inline-block text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-[#FF5500]">
              03 · Recompensa de Fundador
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
              AGORA VEM A PARTE MAIS IMPORTANTE.
            </h2>
            <p className="text-sm sm:text-xl font-medium text-zinc-300">
              QUEM CHEGAR PRIMEIRO, ENTRA EM UMA CONDIÇÃO MELHOR.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* Left Anchor Card */}
            <div className="lg:col-span-5 rounded-[28px] bg-gradient-to-b from-white/[0.035] to-white/[0.015] border border-white/[0.08] p-5 sm:p-8 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-zinc-400">
                  O plano cheio terá um preço normal de:
                </p>
                <div className="py-2.5 px-4 rounded-2xl bg-black/40 border border-white/[0.07] inline-block">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-zinc-500 line-through decoration-[#FF5500]/70">
                    R$500/mês
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Mas o pré-lançamento vai funcionar de outra maneira. Não
                  queremos simplesmente colocar um preço promocional por alguns
                  dias.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-white/[0.07]">
                <p className="font-display text-base sm:text-lg font-semibold text-white mb-1.5">
                  Queremos recompensar quem acreditou primeiro.
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Por isso, algumas condições especiais serão disponibilizadas
                  para um número limitado de pessoas.
                </p>
              </div>
            </div>

            {/* Right Vault Spotlight: OS PRIMEIROS 50 */}
            <div className="lg:col-span-7 relative rounded-[28px] sm:rounded-3xl bg-gradient-to-b from-[#170E0A] via-[#0A0A0E] to-[#060609] border border-[#FF5500]/40 p-6 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.22)] flex flex-col justify-between overflow-hidden">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5500] to-transparent" />

              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5500] text-white font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
                    OS PRIMEIROS 50
                  </span>
                  <span className="text-[11px] font-mono text-zinc-300 bg-white/[0.05] border border-white/[0.1] px-2.5 py-1 rounded-full">
                    Lote 01 · 50 Vagas
                  </span>
                </div>

                {/* 50-Node Visual Matrix */}
                <div className="mb-5 p-3 rounded-2xl bg-black/45 border border-white/[0.07]">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
                    <span>CAPACIDADE DO 1º LOTE</span>
                    <span className="text-[#FF5500] font-semibold">
                      50 POSIÇÕES
                    </span>
                  </div>
                  <div className="grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full ${
                          i < 12 ? "bg-[#FF5500]" : "bg-white/[0.12]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Price Hero Display */}
                <div className="my-4 sm:my-5 py-5 px-5 rounded-2xl bg-white/[0.035] border border-white/[0.1] flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <div className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight">
                      R$50
                      <span className="text-lg sm:text-2xl font-normal text-zinc-400">
                        /mês
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs sm:text-sm font-medium text-[#FF5500] block">
                      Enquanto mantiverem
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-zinc-200 block">
                      a assinatura ativa.
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs sm:text-base text-zinc-300 leading-relaxed mb-6">
                  <p className="text-white font-semibold">É isso.</p>
                  <p>
                    Os primeiros 50 participantes que garantirem essa condição
                    poderão contratar o plano por{" "}
                    <strong className="text-white">R$50/mês</strong> enquanto
                    mantiverem a assinatura ativa.
                  </p>
                  <p className="text-zinc-400">
                    Depois disso, uma nova condição será disponibilizada para os
                    próximos participantes.{" "}
                    <strong className="text-zinc-200">
                      As condições são limitadas.
                    </strong>
                  </p>
                </div>
              </div>

              {renderClerkSignUpCta({
                label: "Quero Tentar Pegar Uma das 50 Vagas",
                source: "section_primeiros_50",
                variant: "primary-orange",
                fullWidth: true,
              })}
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 7 & 8: E NÃO PRECISAMOS ESCONDER A REGRA + 4 PASSOS
        ===================================================================== */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-white/[0.06]">
          <div className="rounded-[28px] bg-gradient-to-b from-white/[0.035] to-white/[0.015] border border-white/[0.08] p-5 sm:p-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] text-center space-y-5 mb-14 sm:mb-20">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
              E NÃO PRECISAMOS ESCONDER A REGRA.
            </h2>

            <div className="max-w-2xl mx-auto space-y-2.5 text-xs sm:text-base text-zinc-400 leading-relaxed">
              <p>
                Conforme mais pessoas entram no pré-lançamento, novas condições
                serão abertas. A lógica é simples:
              </p>
              <p className="text-sm sm:text-lg text-white font-semibold">
                quanto antes você chegar, maior a chance de conseguir uma
                condição especial.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto py-1">
              <div className="rounded-2xl bg-black/40 border border-white/[0.07] p-3.5 text-xs sm:text-sm text-zinc-300">
                Não existe um cronômetro falso.
              </div>
              <div className="rounded-2xl bg-black/40 border border-white/[0.07] p-3.5 text-xs sm:text-sm text-zinc-300">
                Não existe “últimas horas” inventadas.
              </div>
              <div className="rounded-2xl bg-[#FF5500]/15 border border-[#FF5500]/40 p-3.5 text-xs sm:text-sm font-semibold text-white">
                Existe uma lista.
              </div>
            </div>

            <p className="text-xs sm:text-base text-zinc-400 max-w-xl mx-auto">
              E as condições disponíveis dependem de quantas pessoas já chegaram
              antes de você.
            </p>

            <div className="pt-1">
              {renderClerkSignUpCta({
                label: "Entrar na Lista Gratuitamente",
                source: "section_regra",
                variant: "glass",
              })}
            </div>
          </div>

          {/* VOCÊ NÃO PRECISA PAGAR AGORA */}
          <div className="text-center max-w-2xl mx-auto mb-9 sm:mb-12 space-y-2.5">
            <span className="inline-block text-[10px] font-mono uppercase tracking-[0.22em] text-[#FF5500]">
              04 · Passo a Passo Simples
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
              VOCÊ NÃO PRECISA PAGAR AGORA.
            </h2>
            <p className="text-xs sm:text-base text-zinc-400">
              Esse é um <strong className="text-zinc-200">pré-lançamento</strong>
              . O plano de IA ilimitada ainda está sendo preparado. Por
              enquanto, você pode simplesmente:
            </p>
          </div>

          <div className="max-w-xl mx-auto relative">
            <div className="pointer-events-none absolute left-[27px] sm:left-[31px] top-6 bottom-6 w-px bg-gradient-to-b from-[#FF5500] via-white/25 to-white/5" />

            <div className="space-y-3.5">
              {[
                { num: "1", label: "Cadastrar seu interesse" },
                { num: "2", label: "Entrar no grupo do pré-lançamento" },
                { num: "3", label: "Acompanhar as novidades e sua posição" },
                {
                  num: "4",
                  label:
                    "Quando o lançamento abrir, contratar na condição disponível para você",
                },
              ].map((step, idx) => (
                <div
                  key={step.num}
                  className="relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.08] p-3.5 sm:p-5 flex items-center gap-3.5 sm:gap-4"
                >
                  <span
                    className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-mono text-xs sm:text-sm font-bold flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? "bg-[#FF5500] text-white"
                        : "bg-[#0B0B0F] border border-white/[0.16] text-white"
                    }`}
                  >
                    {step.num}.
                  </span>
                  <span className="text-xs sm:text-base font-medium text-zinc-100 leading-snug">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-10 space-y-3.5">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-400">
              Cadastro gratuito.
            </p>
            {renderClerkSignUpCta({
              label: "Quero Entrar",
              source: "section_4_passos",
              variant: "primary-light",
            })}
          </div>
        </section>

        {/* =====================================================================
            SECTION 9 & 10: QUER GARANTIR SUA RESERVA? (R$5) + POR QUE ENTRAR AGORA?
        ===================================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-white/[0.06]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
            {/* Ticket Pass Card: RESERVA DE R$5 */}
            <div className="rounded-[28px] bg-gradient-to-b from-white/[0.045] to-white/[0.015] border border-white/[0.11] p-5 sm:p-9 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)] flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500]">
                    <Ticket className="w-3 h-3" />
                    Opcional · Após o Cadastro
                  </span>
                </div>

                <h2 className="font-display text-xl sm:text-3xl font-bold text-white tracking-tight">
                  QUER GARANTIR SUA RESERVA?
                </h2>
                <p className="text-xs sm:text-base text-zinc-400">
                  Depois de se cadastrar, você poderá optar por fazer uma:
                </p>

                <div className="my-3 rounded-2xl bg-black/50 border border-[#FF5500]/35 p-4 sm:p-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                      RESERVA DE R$5
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Lugar prioritário na fila para o 1º mês de R$50 (via
                      Cartão).
                    </p>
                  </div>
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-[#FF5500]/20 border border-[#FF5500]/40 text-white shrink-0">
                    R$ 5,00
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  <p>
                    <strong className="text-white">
                      Os R$5 compram apenas um lugar na fila para o primeiro mês
                      de R$50.
                    </strong>
                  </p>
                  <p>
                    O pagamento da reserva é realizado{" "}
                    <strong className="text-zinc-200">
                      exclusivamente por cartão de crédito
                    </strong>
                    , pois utilizaremos o mesmo cartão para a sua assinatura.
                  </p>
                  <p>
                    Eles não são a mensalidade,{" "}
                    <strong className="text-zinc-200">
                      não serão convertidos em créditos
                    </strong>{" "}
                    e{" "}
                    <strong className="text-zinc-200">
                      não dão acesso imediato ao plano
                    </strong>
                    .
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-dashed border-white/[0.12] text-xs sm:text-sm text-zinc-400">
                E se você preferir não reservar:{" "}
                <strong className="text-white">tudo bem.</strong> O cadastro no
                pré-lançamento continua gratuito.
              </div>
            </div>

            {/* Por que entrar agora? */}
            <div className="rounded-[28px] bg-gradient-to-b from-white/[0.035] to-white/[0.015] border border-white/[0.09] p-5 sm:p-9 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] flex flex-col justify-between">
              <div className="space-y-3.5">
                <span className="inline-block text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-zinc-300">
                  Decisão Sem Risco
                </span>
                <h2 className="font-display text-xl sm:text-3xl font-bold text-white tracking-tight">
                  POR QUE ENTRAR AGORA?
                </h2>

                <div className="space-y-3 text-xs sm:text-base text-zinc-400 leading-relaxed pt-1">
                  <p>Porque você pode esperar o lançamento acontecer.</p>
                  <p>
                    E descobrir depois que a condição que queria já não está
                    mais disponível.
                  </p>
                  <p className="text-zinc-200 font-medium">
                    Ou pode chegar antes.
                  </p>
                  <p className="font-display text-base sm:text-xl font-semibold text-white pt-1">
                    Entrar agora não custa nada.
                  </p>
                  <p>
                    Você acompanha o lançamento de dentro e pode decidir depois
                    se quer contratar.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                {renderClerkSignUpCta({
                  label: "Quero Entrar no Pré-Lançamento",
                  source: "section_por_que_entrar",
                  variant: "glass",
                  fullWidth: true,
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 11 & 12: O QUE VOCÊ ESTÁ REALMENTE GANHANDO? + VANTAGEM
        ===================================================================== */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-white/[0.06]">
          <div className="space-y-2 mb-7 sm:mb-10">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
              O QUE VOCÊ ESTÁ REALMENTE GANHANDO?
            </h2>
            <p className="text-sm sm:text-lg text-zinc-400">
              Não é apenas acesso a mais modelos.{" "}
              <strong className="text-white font-medium">
                É liberdade para experimentar.
              </strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-9 sm:mb-12">
            {[
              "Criar uma imagem sem pensar no próximo crédito.",
              "Gerar outra versão porque você não gostou da primeira.",
              "Testar cinco ideias quando normalmente testaria uma.",
              "Transformar uma imagem em vídeo.",
              "Criar uma voz para aquela cena.",
              "Pedir ajuda para desenvolver uma ideia.",
              "E continuar criando.",
            ].map((line, idx, arr) => (
              <div
                key={line}
                className={`rounded-2xl border px-4 py-3.5 flex items-center gap-3 ${
                  idx === arr.length - 1
                    ? "sm:col-span-2 bg-gradient-to-r from-[#FF5500]/15 via-white/[0.04] to-transparent border-[#FF5500]/35"
                    : "bg-white/[0.03] border-white/[0.08]"
                }`}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FF5500]/20 border border-[#FF5500]/40 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FF5500]" />
                </div>
                <span className="text-xs sm:text-base font-medium text-zinc-100 leading-snug">
                  {line}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-[28px] bg-gradient-to-b from-white/[0.05] to-white/[0.015] border border-white/[0.12] p-6 sm:p-12 text-center space-y-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] mb-14 sm:mb-20">
            <p className="text-xs sm:text-base text-zinc-400">
              Porque quando o custo de cada tentativa deixa de ocupar sua
              cabeça...
            </p>
            <p className="text-sm sm:text-xl font-medium text-zinc-200">
              você volta a pensar naquilo que realmente importa:
            </p>
            <h3 className="font-display text-2xl sm:text-5xl font-bold bg-gradient-to-r from-white via-zinc-100 to-[#FF5500] bg-clip-text text-transparent tracking-tight pt-1">
              O QUE VOCÊ VAI CRIAR?
            </h3>
          </div>

          {/* QUEM CHEGAR PRIMEIRO TEM A VANTAGEM */}
          <div className="text-center">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              QUEM CHEGAR PRIMEIRO TEM A VANTAGEM.
            </h2>
            <div className="max-w-xl mx-auto space-y-2 text-xs sm:text-base text-zinc-400 mb-7">
              <p>
                O cadastro é gratuito. O lançamento ainda não aconteceu. Você
                não precisa decidir nada agora.
              </p>
              <p className="text-base sm:text-lg font-semibold text-white pt-1">
                Apenas entre na lista.
              </p>
              <p>
                E quando chegar a hora, você saberá exatamente qual condição
                está disponível para você.
              </p>
            </div>

            {renderClerkSignUpCta({
              label: "Quero Entrar Gratuitamente",
              source: "section_vantagem",
              variant: "primary-orange",
            })}
            <p className="text-[11px] sm:text-xs text-zinc-500 italic mt-3">
              Sem cobrança para entrar no pré-lançamento.
            </p>
          </div>
        </section>

        {/* =====================================================================
            SECTION 13: PERGUNTAS FREQUENTES (FAQ)
        ===================================================================== */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-white/[0.06]">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block text-[10px] font-mono uppercase tracking-[0.22em] text-[#FF5500] mb-2">
              Tire Suas Dúvidas
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
              PERGUNTAS FREQUENTES
            </h2>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={item.q}
                  className={`rounded-2xl border overflow-hidden transition-colors ${
                    isOpen
                      ? "bg-white/[0.04] border-[#FF5500]/35"
                      : "bg-white/[0.02] border-white/[0.08]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <span className="font-display text-xs sm:text-base font-semibold text-zinc-100 leading-snug">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#FF5500]" : "text-zinc-400"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/[0.06]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            SECTION 14: FINAL CTA + FOOTER (BY TRINN)
        ===================================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-24 border-t border-white/[0.06]">
          <div className="relative rounded-[28px] sm:rounded-3xl bg-gradient-to-b from-[#170E0A] via-[#0B0B0F] to-[#060609] border border-[#FF5500]/35 p-6 sm:p-14 text-center shadow-[0_24px_60px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.2)] overflow-hidden">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5500] to-transparent" />

            <h2 className="font-display text-2xl sm:text-5xl font-bold text-white tracking-tight leading-[1.08] mb-3 sm:mb-4">
              NÃO CONTE CRÉDITOS.
              <span className="block bg-gradient-to-r from-white via-zinc-200 to-[#FF5500] bg-clip-text text-transparent">
                CONTE IDEIAS.
              </span>
            </h2>

            <p className="text-sm sm:text-xl text-zinc-300 font-medium mb-6 sm:mb-8">
              Entre agora no pré-lançamento.
            </p>

            {renderClerkSignUpCta({
              label: "Quero Entrar Gratuitamente",
              source: "footer_cta",
              variant: "primary-orange",
            })}

            <p className="text-[11px] sm:text-xs text-zinc-500 italic mt-3.5">
              O cadastro é gratuito. O plano ainda não está disponível para
              contratação.
            </p>
          </div>

          <footer className="mt-12 sm:mt-16 pt-8 border-t border-white/[0.06] text-center space-y-2">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-400">
              by trinn
            </div>
            <p className="text-xs text-zinc-500 flex items-center justify-center gap-1.5">
              <span>Feito com amor no Brasil.</span>
              <Heart className="w-3 h-3 text-[#FF5500] fill-[#FF5500]" />
            </p>
            <p className="text-[11px] text-zinc-600 max-w-2xl mx-auto leading-relaxed pt-2">
              Este site não possui qualquer vínculo, afiliação, patrocínio ou
              endosso da Meta, Instagram, Facebook, Google ou outras plataformas
              mencionadas. Todas as marcas pertencem aos seus respectivos
              proprietários.
            </p>
          </footer>
        </section>
      </main>

      {/* =====================================================================
          FLOATING LIQUID GLASS MOBILE DOCK
      ===================================================================== */}
      {!isSignedIn && !isHeroCtaVisible && (
        <div
          className="lg:hidden fixed inset-x-3 bottom-3 z-40"
          style={{
            marginBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="rounded-2xl bg-[#09090D]/95 backdrop-blur-md border border-white/[0.15] p-2.5 pl-4 shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.2)] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#FF5500] font-semibold truncate">
                Primeiros 50 · R$50/mês
              </div>
              <div className="text-xs font-medium text-white truncate">
                Cadastro gratuito no pré-lançamento
              </div>
            </div>
            {renderClerkSignUpCta({
              label: "Entrar",
              source: "mobile_dock_cta",
              variant: "primary-orange",
              compact: true,
            })}
          </div>
        </div>
      )}
    </div>
  );
}
