"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Layers,
  DollarSign,
  Briefcase,
  Store,
  MessageSquare,
  Clock,
  Send,
  Loader2,
  Check,
  ShieldCheck,
  Zap,
} from "lucide-react";

const REVENUE_OPTIONS = [
  "Até R$ 10.000 / mês",
  "R$ 10.000 a R$ 50.000 / mês",
  "R$ 50.000 a R$ 100.000 / mês",
  "R$ 100.000 a R$ 500.000 / mês",
  "Acima de R$ 500.000 / mês",
  "Outro / Prefiro especificar",
];

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
  "Plataforma própria / LMS Customizado",
  "Outra plataforma",
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function InfoprodutorStepForm() {
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
  const [customRevenue, setCustomRevenue] = useState<string>("");

  const [aiUsage, setAiUsage] = useState<string>("");
  const [customAiUsage, setCustomAiUsage] = useState<string>("");

  const [platform, setPlatform] = useState<string>("");
  const [customPlatform, setCustomPlatform] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

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

  // Sincroniza estado rascunho com o backend Convex e localStorage
  const persistStep = async (
    targetStep: number,
    completed: boolean = false
  ) => {
    setErrorMsg("");

    const effectiveRevenue =
      revenue === "Outro / Prefiro especificar" && customRevenue.trim()
        ? `Outro: ${customRevenue.trim()}`
        : revenue;

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
          revenue: effectiveRevenue,
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
        revenueLast30Days: effectiveRevenue || undefined,
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
      // Não bloqueia o usuário se for apenas progresso parcial, mas avisa em caso de erro na submissão
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

  // Validação do Passo 3
  const handleNextStep3 = async () => {
    if (!revenue) {
      setErrorMsg("Por favor, selecione sua faixa de faturamento recente.");
      return;
    }
    if (revenue === "Outro / Prefiro especificar" && !customRevenue.trim()) {
      setErrorMsg("Por favor, detalhe seu faturamento.");
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
  // TELA DE OBRIGADO (COMPLETED STATE)
  // --------------------------------------------------------------------------
  if (isCompleted) {
    const effectiveRevenue =
      revenue === "Outro / Prefiro especificar" && customRevenue.trim()
        ? `Outro: ${customRevenue.trim()}`
        : revenue;

    return (
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0e1612] via-[#090b0d] to-[#050506] p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
        {/* Glow de sucesso */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 mb-2 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 animate-pulse" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            Aplicação Enviada com Sucesso
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Parabéns, {name.split(" ")[0]}!
          </h2>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-[#FF5500] shrink-0 mt-0.5" />
              <div>
                <p className="text-lg font-semibold text-white">
                  O nosso time analisará o seu perfil e entrará em contato com você.
                </p>
                <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                  Recebemos todas as informações da sua operação. Nosso time de parcerias e coprodução entrará em contato diretamente pelo seu{" "}
                  <strong className="text-emerald-400">WhatsApp ({whatsapp})</strong> e pelo e-mail{" "}
                  <strong className="text-[#00E5FF]">{email}</strong> nos próximos dias úteis para conversarmos sobre como transformar a inteligência artificial em parte do seu produto.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Análise individual da sua operação</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Modelo sem mensalidade (coprodução)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Tecnologia pronta para seus alunos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Notificação administrativa despachada</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 pt-2">
            Faturamento informado: <strong className="text-zinc-300">{effectiveRevenue}</strong> · Plataforma: <strong className="text-zinc-300">{platform}</strong>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#topo"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/10"
            >
              Revisar Apresentação da Parceria
            </a>
            <a
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white text-sm font-semibold transition-all shadow-lg shadow-[#FF5500]/25"
            >
              Conhecer a Plataforma Kriativa
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // FORMULÁRIO EM PASSOS INTERATIVO
  // --------------------------------------------------------------------------
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#101116] via-[#0c0d12] to-[#070709] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
      {/* Luz ambiente solar */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Barra de Progresso */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-[#FF5500] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Passo {step} de {totalSteps}
          </span>
          <span className="text-zinc-400">
            {step === 1 && "Identificação & Contato"}
            {step === 2 && "WhatsApp Direto"}
            {step === 3 && "Faturamento Atual"}
            {step === 4 && "Uso de Inteligência Artificial"}
            {step === 5 && "Plataforma & Envio"}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#FF5500] via-orange-400 to-[#00E5FF] transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Mensagem de Erro */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2 animate-shake">
          <span className="font-bold">Atenção:</span> {errorMsg}
        </div>
      )}

      {/* PASSO 1: NOME & E-MAIL */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-xs font-semibold uppercase tracking-wider mb-2">
              Passo 01 · Identificação
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Vamos começar. Quem é você?
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Informe seu nome e seu e-mail principal para que possamos iniciar sua ficha de parceria.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Seu Nome Completo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lucas Mendes"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none transition-all text-base"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Seu Melhor E-mail Profissional *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: lucas@seucurso.com.br"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none transition-all text-base"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacidade 100% garantida</span>
            </div>
            <button
              type="button"
              onClick={handleNextStep1}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white text-sm font-bold tracking-wide uppercase transition-all shadow-lg shadow-[#FF5500]/25 cursor-pointer active:scale-95"
            >
              Continuar
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASSO 2: WHATSAPP */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-semibold uppercase tracking-wider mb-2">
              Passo 02 · Contato Direto
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Qual é o seu WhatsApp?
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Nosso time entrará em contato diretamente com você pelo WhatsApp para apresentar a proposta de coprodução.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Número de WhatsApp com DDD *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold text-base">
                🇧🇷 +55
              </span>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                placeholder="(11) 98765-4321"
                className="w-full pl-22 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none transition-all text-base font-mono tracking-wider"
                autoFocus
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Não se preocupe: não enviamos mensagens automáticas ou grupos indesejados. O contato é individual e humano.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              type="button"
              onClick={handleNextStep2}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white text-sm font-bold tracking-wide uppercase transition-all shadow-lg shadow-[#FF5500]/25 cursor-pointer active:scale-95"
            >
              Avançar para Faturamento
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASSO 3: FATURAMENTO DOS ÚLTIMOS 30 DIAS */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Passo 03 · Escala & Maturidade
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Qual foi o faturamento da sua operação nos últimos 30 dias?
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Essa informação é fundamental para dimensionarmos o potencial de coprodução e a capacidade tecnológica necessária.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REVENUE_OPTIONS.map((opt) => {
              const isSelected = revenue === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setRevenue(opt);
                    setErrorMsg("");
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FF5500]/15 border-[#FF5500] text-white shadow-md shadow-[#FF5500]/10"
                      : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <DollarSign
                      className={`w-4 h-4 ${isSelected ? "text-[#FF5500]" : "text-zinc-500"}`}
                    />
                    <span className="text-sm font-semibold">{opt}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
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

          {revenue === "Outro / Prefiro especificar" && (
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Especifique seu faturamento recente ou estágio do projeto *
              </label>
              <input
                type="text"
                value={customRevenue}
                onChange={(e) => setCustomRevenue(e.target.value)}
                placeholder="Ex: R$ 35.000 / mês ou Primeiro lançamento programado"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none text-sm"
                autoFocus
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              type="button"
              onClick={handleNextStep3}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white text-sm font-bold tracking-wide uppercase transition-all shadow-lg shadow-[#FF5500]/25 cursor-pointer active:scale-95"
            >
              Continuar para Uso de IA
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASSO 4: PARA O QUE MAIS USA IA */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Passo 04 · Inteligência Artificial
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Para o que você mais usa Inteligência Artificial hoje?
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Queremos entender onde a tecnologia já gera tração no seu negócio ou onde seus alunos mais precisam de apoio.
            </p>
          </div>

          <div className="space-y-2.5">
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
                  className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FF5500]/15 border-[#FF5500] text-white shadow-md shadow-[#FF5500]/10"
                      : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#FF5500] text-white"
                          : "bg-white/5 text-zinc-400"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold">{item.label}</span>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Descreva brevemente como você usa ou pretende usar IA *
              </label>
              <input
                type="text"
                value={customAiUsage}
                onChange={(e) => setCustomAiUsage(e.target.value)}
                placeholder="Ex: Gerar prompts para alunos criarem aplicativos"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none text-sm"
                autoFocus
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              type="button"
              onClick={handleNextStep4}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white text-sm font-bold tracking-wide uppercase transition-all shadow-lg shadow-[#FF5500]/25 cursor-pointer active:scale-95"
            >
              Avançar para Plataforma
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PASSO 5: PLATAFORMA DE VENDAS & ENVIO */}
      {step === 5 && (
        <form onSubmit={handleFinalSubmit} className="space-y-6 animate-fadeIn">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-semibold uppercase tracking-wider mb-2">
              Passo 05 · Plataforma & Conclusão
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Em qual plataforma você vende atualmente?
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Onde seus clientes compram e consomem seu produto ou treinamento digital?
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    isSelected
                      ? "bg-[#FF5500]/15 border-[#FF5500] text-white shadow-md shadow-[#FF5500]/10"
                      : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <Store className={`w-4 h-4 ${isSelected ? "text-[#FF5500]" : "text-zinc-500"}`} />
                  <span className="text-xs font-semibold">{item}</span>
                </button>
              );
            })}
          </div>

          {platform === "Outra plataforma" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Nome da Plataforma *
              </label>
              <input
                type="text"
                value={customPlatform}
                onChange={(e) => setCustomPlatform(e.target.value)}
                placeholder="Ex: Kajabi, Skool, App próprio, etc."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none text-sm"
                autoFocus
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Link do seu produto / Instagram ou observações (opcional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: https://instagram.com/seuperfil ou breve resumo do formato do seu curso/mentoria..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-white placeholder:text-zinc-600 outline-none text-sm resize-none"
            />
          </div>

          {/* Resumo da Aplicação */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-400 space-y-1.5">
            <div className="font-semibold text-zinc-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Resumo da sua aplicação:
            </div>
            <div>Criador: <strong className="text-white">{name}</strong> ({email})</div>
            <div>WhatsApp: <strong className="text-white">{whatsapp}</strong></div>
            <div>Faturamento 30d: <strong className="text-emerald-400">{revenue}</strong></div>
            <div>Uso de IA: <strong className="text-white">{aiUsage}</strong></div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF5500] to-orange-500 hover:from-orange-500 hover:to-[#FF5500] text-white text-sm font-bold tracking-wide uppercase transition-all shadow-xl shadow-[#FF5500]/30 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando Aplicação...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Finalizar & Enviar Aplicação</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
