"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { trackMetaEvent } from "@/lib/meta-pixel";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Briefcase,
  Store,
  MessageSquare,
  Send,
  Loader2,
  Check,
  ShieldCheck,
  Zap,
  X,
} from "lucide-react";

const AI_USAGE_OPTIONS = [
  {
    id: "ads_creatives",
    label: "Criação de criativos e anúncios para tráfego pago",
    icon: Sparkles,
  },
  {
    id: "lessons_materials",
    label: "Produção de aulas, materiais e cursos complementares",
    icon: Layers,
  },
  {
    id: "images_visuals",
    label: "Geração de imagens e apresentações visuais de alta qualidade",
    icon: Briefcase,
  },
  {
    id: "videos_scripts",
    label: "Produção de vídeos, roteiros e conteúdos dinâmicos",
    icon: Zap,
  },
  {
    id: "automations_agents",
    label: "Automação de processos, tarefas e agentes inteligentes",
    icon: Check,
  },
  {
    id: "starting_out",
    label: "Ainda não uso no infoproduto, mas quero começar agora",
    icon: RocketIcon,
  },
  {
    id: "other",
    label: "Outro uso específico",
    icon: MessageSquare,
  },
];

function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

const PLATFORM_OPTIONS = [
  "Hotmart",
  "Kiwify",
  "Eduzz",
  "Ticto",
  "Monetizze",
  "Kirvano",
  "Plataforma própria / LMS",
  "Outra plataforma",
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface InfoprodutorStepFormProps {
  onClose?: () => void;
}

export function InfoprodutorStepForm({ onClose }: InfoprodutorStepFormProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const saveLead = useMutation(api.infoprodutor.saveLeadStep);

  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  const [leadId, setLeadId] = useState<Id<"infoprodutorLeads"> | null>(null);
  const [clientSessionId, setClientSessionId] = useState<string>("");

  // Form State
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [revenue, setRevenue] = useState<string>("");

  const [aiUsage, setAiUsage] = useState<string>("");
  const [customAiUsage, setCustomAiUsage] = useState<string>("");

  const [platform, setPlatform] = useState<string>("");
  const [customPlatform, setCustomPlatform] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Auto-preenchimento inteligente: dados da conta Clerk logada + parâmetros de URL
  useEffect(() => {
    // 1. URL search params (ex: /infoprodutor?nome=Lucas&email=lucas@exemplo.com&whatsapp=11987654321)
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlName = params.get("name") || params.get("nome");
        const urlEmail = params.get("email");
        const urlPhone =
          params.get("whatsapp") || params.get("phone") || params.get("tel");

        if (urlName) setName((prev) => (prev.trim() ? prev : urlName));
        if (urlEmail) setEmail((prev) => (prev.trim() ? prev : urlEmail));
        if (urlPhone)
          setWhatsapp((prev) => (prev.trim() ? prev : formatPhone(urlPhone)));
      } catch {
        // noop
      }
    }

    // 2. Se o usuário estiver autenticado no sistema via Clerk, auto-preenche
    if (isLoaded && isSignedIn && user) {
      setName((prev) => {
        if (prev.trim()) return prev;
        const fullName =
          user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim();
        return fullName || prev;
      });
      setEmail((prev) => {
        if (prev.trim()) return prev;
        return user.primaryEmailAddress?.emailAddress || prev;
      });
      setWhatsapp((prev) => {
        if (prev.trim()) return prev;
        const phone = user.primaryPhoneNumber?.phoneNumber;
        return phone ? formatPhone(phone) : prev;
      });
    }
  }, [isLoaded, isSignedIn, user]);

  // Inicializa a sessão única no localStorage para sincronizar parciais
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      let storedSession = localStorage.getItem("kriativa_infoprodutor_session_id");
      if (!storedSession) {
        storedSession = "lead_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now();
        localStorage.setItem("kriativa_infoprodutor_session_id", storedSession);
      }
      setClientSessionId(storedSession);

      const storedLeadId = localStorage.getItem("kriativa_infoprodutor_lead_id");
      if (storedLeadId) {
        setLeadId(storedLeadId as Id<"infoprodutorLeads">);
      }

      // Restaura dados salvos localmente se existirem
      const savedData = localStorage.getItem("kriativa_infoprodutor_draft");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.whatsapp) setWhatsapp(parsed.whatsapp);
        if (parsed.revenue) setRevenue(parsed.revenue);
        if (parsed.aiUsage) setAiUsage(parsed.aiUsage);
        if (parsed.platform) setPlatform(parsed.platform);
        if (parsed.notes) setNotes(parsed.notes);
        if (parsed.step && parsed.step <= totalSteps) setStep(parsed.step);
      }
    } catch {
      // Ignora erro de localStorage
    }
  }, []);

  // DISPARO DO EVENTO DE LEAD EXCLUSIVAMENTE NA PÁGINA DE OBRIGADO
  useEffect(() => {
    if (isCompleted) {
      try {
        trackMetaEvent({
          eventName: "Lead",
          customData: {
            content_name: "Aplicação Parceria Infoprodutor",
            content_category: "infoprodutor_partnership",
            lead_source: "infoprodutor_step_form",
            currency: "BRL",
            value: 0,
          },
          userData: {
            name: name.trim() || undefined,
            email: email.trim().toLowerCase() || undefined,
            phone: whatsapp.replace(/\D/g, "") || undefined,
          },
        });
      } catch (err) {
        console.error("[MetaEvent Lead] Erro ao disparar evento de lead:", err);
      }
    }
  }, [isCompleted, name, email, whatsapp]);

  // Sincroniza estado rascunho com o backend Convex e localStorage
  const persistStep = async (
    targetStep: number,
    completed: boolean = false
  ) => {
    setErrorMsg("");

    const effectiveAiUsage =
      aiUsage === "Outro uso específico" && customAiUsage.trim()
        ? `Outro: ${customAiUsage.trim()}`
        : aiUsage;

    const effectivePlatform =
      platform === "Outra plataforma" && customPlatform.trim()
        ? `Outra: ${customPlatform.trim()}`
        : platform;

    // Salva rascunho local
    try {
      localStorage.setItem(
        "kriativa_infoprodutor_draft",
        JSON.stringify({
          name,
          email,
          whatsapp,
          revenue: revenue.trim(),
          aiUsage: effectiveAiUsage,
          platform: effectivePlatform,
          notes,
          step: targetStep,
        })
      );
    } catch {
      // noop
    }

    try {
      const res = await saveLead({
        leadId: leadId || undefined,
        clientSessionId: clientSessionId || undefined,
        name: name.trim() || undefined,
        email: email.trim().toLowerCase() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        revenueLast30Days: revenue.trim() || undefined,
        aiUsagePrimary: effectiveAiUsage || undefined,
        salesPlatform: effectivePlatform || undefined,
        additionalNotes: notes.trim() || undefined,
        currentStep: targetStep,
        isComplete: completed,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        referer: typeof document !== "undefined" ? document.referrer : undefined,
      });

      if (res?.leadId) {
        setLeadId(res.leadId);
        try {
          localStorage.setItem("kriativa_infoprodutor_lead_id", res.leadId);
        } catch {
          // noop
        }
      }
      return true;
    } catch (err: unknown) {
      console.error("[saveLeadStep] Erro ao sincronizar:", err);
      if (completed) {
        setErrorMsg("Não foi possível enviar sua aplicação no momento. Por favor tente novamente.");
      }
      return false;
    }
  };

  // Validação do Passo 1
  const handleNextStep1 = async () => {
    if (!name.trim()) {
      setErrorMsg("Por favor, digite seu nome completo.");
      return;
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setErrorMsg("Por favor, digite um e-mail válido.");
      return;
    }
    setErrorMsg("");
    await persistStep(2);
    setStep(2);
  };

  // Validação do Passo 2
  const handleNextStep2 = async () => {
    const rawDigits = whatsapp.replace(/\D/g, "");
    if (rawDigits.length < 10) {
      setErrorMsg("Por favor, digite seu número de WhatsApp com DDD.");
      return;
    }
    setErrorMsg("");
    await persistStep(3);
    setStep(3);
  };

  // Validação do Passo 3 (Faturamento escrito livremente)
  const handleNextStep3 = async () => {
    if (!revenue.trim()) {
      setErrorMsg("Por favor, escreva o faturamento dos últimos 30 dias da sua operação.");
      return;
    }
    setErrorMsg("");
    await persistStep(4);
    setStep(4);
  };

  // Validação do Passo 4
  const handleNextStep4 = async () => {
    if (!aiUsage) {
      setErrorMsg("Por favor, selecione para o que você mais utiliza inteligência artificial.");
      return;
    }
    if (aiUsage === "Outro uso específico" && !customAiUsage.trim()) {
      setErrorMsg("Por favor, descreva para o que você usa ou planeja usar IA.");
      return;
    }
    setErrorMsg("");
    await persistStep(5);
    setStep(5);
  };

  // Submissão Final do Passo 5
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) {
      setErrorMsg("Por favor, selecione a plataforma onde você realiza suas vendas.");
      return;
    }
    if (platform === "Outra plataforma" && !customPlatform.trim()) {
      setErrorMsg("Por favor, informe a plataforma.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const success = await persistStep(5, true);
    setIsSubmitting(false);

    if (success) {
      setIsCompleted(true);
      try {
        localStorage.removeItem("kriativa_infoprodutor_draft");
      } catch {
        // noop
      }
    }
  };

  // --------------------------------------------------------------------------
  // TELA DE OBRIGADO (COMPLETED STATE) — ZERO LINKS, APENAS CONTATO NO WHATSAPP
  // --------------------------------------------------------------------------
  if (isCompleted) {
    return (
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0e1612] via-[#090b0d] to-[#050506] p-6 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
        {/* Glow de sucesso */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto space-y-5 sm:space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 mb-1 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">
            Aplicação Recebida com Sucesso
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Obrigado, {name.split(" ")[0] || "Criador"}!
          </h2>

          <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2.5 sm:space-y-3">
            <p className="text-base sm:text-lg font-semibold text-white leading-snug">
              A nossa equipe vai entrar em contato com você diretamente pelo seu WhatsApp.
            </p>
            <p className="text-lg sm:text-2xl text-emerald-400 font-mono font-bold tracking-wide">
              {whatsapp}
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-white/5">
              Analisaremos os dados da sua operação e chamaremos você em breve para conversarmos sobre a parceria de coprodução.
            </p>
          </div>

          {onClose && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
              >
                Concluir e Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // FORMULÁRIO EM PASSOS INTERATIVO (OTIMIZADO PARA MOBILE & DESKTOP)
  // --------------------------------------------------------------------------
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-[#101116] via-[#0c0d12] to-[#070709] p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Luz ambiente solar */}
      <div className="absolute top-0 right-0 w-64 sm:w-80 h-64 sm:h-80 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 sm:w-80 h-64 sm:h-80 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Botão de Fechar se estiver em Modal */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar formulário"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Barra de Progresso */}
      <div className="mb-6 sm:mb-8 pr-8 sm:pr-0">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-[#FF5500] uppercase tracking-wider flex items-center gap-1.5 text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Passo {step} de {totalSteps}
          </span>
          <span className="text-zinc-400 text-[11px] sm:text-xs text-right truncate max-w-[170px] sm:max-w-none">
            {step === 1 && "Identificação"}
            {step === 2 && "WhatsApp Direto"}
            {step === 3 && "Faturamento"}
            {step === 4 && "Uso de IA"}
            {step === 5 && "Plataforma & Envio"}
          </span>
        </div>
        <div className="w-full h-1.5 sm:h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#FF5500] via-orange-400 to-[#00E5FF] transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Mensagem de Erro */}
      {errorMsg && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-2">
          <span className="font-bold shrink-0">Atenção:</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* PASSO 1: NOME & E-MAIL */}
      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNextStep1();
          }}
          autoComplete="on"
          className="space-y-5 sm:space-y-6 animate-fadeIn"
        >
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
              Passo 01 · Identificação
            </div>
            <h3 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
              Vamos começar. Quem é você?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Informe seu nome e seu e-mail principal para iniciarmos sua ficha de parceria.
            </p>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            <div>
              <label htmlFor="infoprodutor-name" className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 sm:mb-2">
                Seu Nome Completo *
              </label>
              <input
                id="infoprodutor-name"
                name="name"
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                spellCheck={false}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lucas Mendes"
                className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none transition-all text-base"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="infoprodutor-email" className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 sm:mb-2">
                Seu Melhor E-mail Profissional *
              </label>
              <input
                id="infoprodutor-email"
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: lucas@seucurso.com.br"
                className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none transition-all text-base"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Privacidade 100% garantida</span>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white text-xs sm:text-sm font-bold tracking-wide uppercase transition-all shadow-lg shadow-[#FF5500]/25 cursor-pointer active:scale-95"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* PASSO 2: WHATSAPP */}
      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNextStep2();
          }}
          autoComplete="on"
          className="space-y-5 sm:space-y-6 animate-fadeIn"
        >
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
              Passo 02 · Contato Direto
            </div>
            <h3 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
              Qual é o seu WhatsApp?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Nossa equipe entrará em contato diretamente com você pelo WhatsApp para conversarmos sobre a parceria.
            </p>
          </div>

          <div>
            <label htmlFor="infoprodutor-whatsapp" className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 sm:mb-2">
              Número de WhatsApp com DDD *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold text-sm sm:text-base">
                🇧🇷 +55
              </span>
              <input
                id="infoprodutor-whatsapp"
                name="tel"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                placeholder="(11) 98765-4321"
                className="w-full pl-20 sm:pl-22 pr-3.5 sm:pr-4 py-3 sm:py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none transition-all text-base font-mono tracking-wider"
                autoFocus
              />
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-500 mt-2">
              O contato é individual, respeitoso e realizado diretamente por um especialista da nossa equipe.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-xs sm:text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white text-xs sm:text-sm font-bold tracking-wide uppercase transition-all shadow-lg shadow-[#FF5500]/25 cursor-pointer active:scale-95"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* PASSO 3: FATURAMENTO (CAMPO ESCRITO LIVRE PELO USUÁRIO) */}
      {step === 3 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNextStep3();
          }}
          autoComplete="off"
          className="space-y-5 sm:space-y-6 animate-fadeIn"
        >
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
              Passo 03 · Faturamento
            </div>
            <h3 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
              Faturamento nos últimos 30 dias
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Escreva o valor ou a estimativa de faturamento recente da sua operação de infoproduto.
            </p>
          </div>

          <div>
            <label htmlFor="infoprodutor-revenue" className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 sm:mb-2">
              Faturamento dos últimos 30 dias *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold text-sm sm:text-base">
                R$
              </span>
              <input
                id="infoprodutor-revenue"
                name="revenue"
                type="text"
                autoComplete="off"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="Ex: 50.000 ou 120 mil / mês"
                className="w-full pl-11 sm:pl-12 pr-3.5 sm:pr-4 py-3 sm:py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none transition-all text-base font-medium"
                autoFocus
              />
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-500 mt-2">
              Isso nos permite dimensionar a infraestrutura necessária e calibrar a proposta de coprodução.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-xs sm:text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white text-xs sm:text-sm font-bold tracking-wide uppercase transition-all shadow-lg shadow-[#FF5500]/25 cursor-pointer active:scale-95"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* PASSO 4: PARA O QUE MAIS USA IA */}
      {step === 4 && (
        <div className="space-y-5 sm:space-y-6 animate-fadeIn">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
              Passo 04 · Inteligência Artificial
            </div>
            <h3 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
              Para o que você mais usa IA hoje?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Queremos entender onde a tecnologia já gera tração no seu negócio ou onde seus alunos mais precisam.
            </p>
          </div>

          <div className="space-y-2">
            {AI_USAGE_OPTIONS.map((item) => {
              const isSelected = aiUsage === item.label;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setAiUsage(item.label);
                    setErrorMsg("");
                  }}
                  className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FF5500]/15 border-[#FF5500] text-white shadow-md shadow-[#FF5500]/10"
                      : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#FF5500] text-white"
                          : "bg-white/5 text-zinc-400"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold leading-snug">{item.label}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-[#FF5500] bg-[#FF5500]"
                        : "border-zinc-600"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {aiUsage === "Outro uso específico" && (
            <div className="pt-2">
              <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 sm:mb-2">
                Descreva brevemente seu uso de IA *
              </label>
              <input
                type="text"
                value={customAiUsage}
                onChange={(e) => setCustomAiUsage(e.target.value)}
                placeholder="Ex: Gerar prompts para alunos criarem aplicativos"
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none text-base"
                autoFocus
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-xs sm:text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep4}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white text-xs sm:text-sm font-bold tracking-wide uppercase transition-all shadow-lg shadow-[#FF5500]/25 cursor-pointer active:scale-95"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASSO 5: PLATAFORMA DE VENDAS & ENVIO */}
      {step === 5 && (
        <form onSubmit={handleFinalSubmit} className="space-y-5 sm:space-y-6 animate-fadeIn">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
              Passo 05 · Plataforma & Conclusão
            </div>
            <h3 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
              Onde você vende atualmente?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Onde seus clientes compram e consomem seu produto digital?
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PLATFORM_OPTIONS.map((item) => {
              const isSelected = platform === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setPlatform(item);
                    setErrorMsg("");
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 sm:gap-2 ${
                    isSelected
                      ? "bg-[#FF5500]/15 border-[#FF5500] text-white shadow-md shadow-[#FF5500]/10"
                      : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <Store className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? "text-[#FF5500]" : "text-zinc-500"}`} />
                  <span className="text-[11px] sm:text-xs font-semibold leading-tight">{item}</span>
                </button>
              );
            })}
          </div>

          {platform === "Outra plataforma" && (
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Nome da Plataforma *
              </label>
              <input
                type="text"
                value={customPlatform}
                onChange={(e) => setCustomPlatform(e.target.value)}
                placeholder="Ex: Kajabi, Skool, App próprio, etc."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none text-base"
                autoFocus
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Link do produto / Instagram ou observações (opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: https://instagram.com/seuperfil ou breve resumo..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none text-base sm:text-sm resize-none"
            />
          </div>

          {/* Resumo da Aplicação */}
          <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] sm:text-xs text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Resumo da sua aplicação:
            </div>
            <div className="truncate">Criador: <strong className="text-white">{name}</strong> ({email})</div>
            <div>WhatsApp: <strong className="text-white">{whatsapp}</strong></div>
            <div>Faturamento 30d: <strong className="text-emerald-400">{revenue}</strong></div>
            <div className="truncate">Uso de IA: <strong className="text-white">{aiUsage}</strong></div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-xs sm:text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#FF5500] to-orange-500 hover:from-orange-500 hover:to-[#FF5500] text-white text-xs sm:text-sm font-bold tracking-wide uppercase transition-all shadow-xl shadow-[#FF5500]/30 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Enviar Aplicação</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
