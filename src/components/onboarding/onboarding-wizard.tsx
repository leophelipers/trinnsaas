"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Phone,
  User,
  Compass,
  Wand2,
  Film,
  Infinity as InfinityIcon,
  Coins,
  Rocket,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type AiExperience = "beginner" | "intermediate" | "advanced";
export type PreferredPlan = "unlimited" | "credits" | "explore_later";

function formatWhatsAppInput(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function OnboardingWizard() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const convexUser = useQuery(api.users.current);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [aiLevel, setAiLevel] = useState<AiExperience>("beginner");
  const [planPreference, setPlanPreference] = useState<PreferredPlan>("unlimited");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preenche nome e sobrenome se disponíveis no Clerk ou Convex
  useEffect(() => {
    if (clerkUser) {
      if (!firstName && clerkUser.firstName) {
        setFirstName(clerkUser.firstName);
      }
      if (!lastName && clerkUser.lastName) {
        setLastName(clerkUser.lastName);
      }
    }
  }, [clerkUser, firstName, lastName]);

  // Se o usuário já concluiu o onboarding anteriormente, redireciona para o dashboard
  useEffect(() => {
    if (convexUser && convexUser.onboardingCompleted === true) {
      router.replace("/dashboard");
    }
  }, [convexUser, router]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatWhatsAppInput(e.target.value));
    if (errorMsg) setErrorMsg(null);
  };

  const isStep1Valid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    whatsapp.replace(/\D/g, "").length >= 10;

  const handleSubmit = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await completeOnboarding({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        whatsapp: whatsapp.trim(),
        aiExperienceLevel: aiLevel,
        preferredPlan: planPreference,
      });

      // Redirecionamento com base na escolha
      if (planPreference === "unlimited") {
        router.push("/dashboard/credits?plan=unlimited");
      } else if (planPreference === "credits") {
        router.push("/dashboard/credits");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Falha ao salvar onboarding:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao concluir o onboarding. Tente novamente.";
      setErrorMsg(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl border border-white/10 bg-[#0C0D12]/95 backdrop-blur-2xl p-5 sm:p-9 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
      {/* Top Solar Accent Line */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#FF5500] to-transparent opacity-80" />

      {/* Header com Stepper Visual */}
      <div className="space-y-4 pb-6 border-b border-white/10">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#FF5500] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#FF5500] animate-pulse" />
            Configuração Inicial
          </span>
          <span className="text-neutral-400">
            Passo {step} de 3
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF5500] to-[#FF8800] transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Stepper Titles */}
        <div className="flex justify-between text-[11px] font-mono text-neutral-400">
          <span className={step >= 1 ? "text-white font-bold" : ""}>
            1. Dados Pessoais
          </span>
          <span className={step >= 2 ? "text-white font-bold" : ""}>
            2. Nível com IA
          </span>
          <span className={step === 3 ? "text-white font-bold" : ""}>
            3. Seu Plano
          </span>
        </div>
      </div>

      {/* Erro Geral se houver */}
      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-xs font-mono animate-in fade-in duration-200">
          {errorMsg}
        </div>
      )}

      {/* ======================================================== */}
      {/* ETAPA 1: NOME, SOBRENOME E WHATSAPP                      */}
      {/* ======================================================== */}
      {step === 1 && (
        <div className="py-6 space-y-6 animate-in fade-in-50 duration-200">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
              Bem-vindo à Kriativa!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
              Vamos preparar seu estúdio de criação. Preencha seus dados para receber suporte e novidades no WhatsApp.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primeiro Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="size-3.5 text-[#FF5500]" />
                  <span>Nome *</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Ex: Leo"
                  className="w-full min-h-[48px] px-4 rounded-xl bg-black/60 border border-white/15 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]/40 transition-all font-sans"
                />
              </div>

              {/* Sobrenome */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="size-3.5 text-[#FF5500]" />
                  <span>Sobrenome *</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Ex: Phelipe"
                  className="w-full min-h-[48px] px-4 rounded-xl bg-black/60 border border-white/15 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]/40 transition-all font-sans"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
                <Phone className="size-3.5 text-emerald-400" />
                <span>WhatsApp com DDD *</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="w-full min-h-[48px] px-4 rounded-xl bg-black/60 border border-white/15 text-white text-sm font-mono placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                />
                {whatsapp.replace(/\D/g, "").length >= 10 && (
                  <CheckCircle2 className="size-5 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-sans leading-relaxed pt-0.5">
                Utilizamos para avisos do estúdio, atualizações de novos modelos e suporte prioritário. Zero spam.
              </p>
            </div>
          </div>

          {/* Botão Avançar */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!isStep1Valid}
              className="w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-gradient-to-r from-[#FF5500] via-[#FF6600] to-[#FF7700] hover:from-[#ff6600] hover:to-[#ff8800] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(255,85,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <span>Continuar para Perfil de IA</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ETAPA 2: NÍVEL DE CONHECIMENTO DE IA                     */}
      {/* ======================================================== */}
      {step === 2 && (
        <div className="py-6 space-y-6 animate-in fade-in-50 duration-200">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
              Qual seu nível com Inteligência Artificial?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
              Isso nos ajuda a calibrar a interface e sugerir os modelos mais adequados para a sua produção.
            </p>
          </div>

          <div className="space-y-3">
            {/* Opção 1: Iniciante */}
            <button
              type="button"
              onClick={() => setAiLevel("beginner")}
              className={`w-full p-4.5 sm:p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${
                aiLevel === "beginner"
                  ? "border-[#FF5500] bg-[#FF5500]/10 shadow-[0_0_20px_rgba(255,85,0,0.15)]"
                  : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <div
                className={`p-3 rounded-xl border shrink-0 mt-0.5 ${
                  aiLevel === "beginner"
                    ? "bg-[#FF5500] text-white border-[#FF5500]"
                    : "bg-white/5 border-white/10 text-neutral-400"
                }`}
              >
                <Compass className="size-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                    Iniciante / Estou começando agora
                  </h3>
                  {aiLevel === "beginner" && (
                    <Badge className="bg-[#FF5500] text-white text-[10px] font-mono">
                      Selecionado
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Quero criar imagens, vídeos e textos com facilidade e sem me preocupar com comandos ou termos técnicos difíceis.
                </p>
              </div>
            </button>

            {/* Opção 2: Intermediário */}
            <button
              type="button"
              onClick={() => setAiLevel("intermediate")}
              className={`w-full p-4.5 sm:p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${
                aiLevel === "intermediate"
                  ? "border-[#FF5500] bg-[#FF5500]/10 shadow-[0_0_20px_rgba(255,85,0,0.15)]"
                  : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <div
                className={`p-3 rounded-xl border shrink-0 mt-0.5 ${
                  aiLevel === "intermediate"
                    ? "bg-[#FF5500] text-white border-[#FF5500]"
                    : "bg-white/5 border-white/10 text-neutral-400"
                }`}
              >
                <Wand2 className="size-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                    Intermediário / Criador Ativo
                  </h3>
                  {aiLevel === "intermediate" && (
                    <Badge className="bg-[#FF5500] text-white text-[10px] font-mono">
                      Selecionado
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Já utilizo ferramentas como ChatGPT, Midjourney ou similares no meu dia a dia e busco uma plataforma completa em português.
                </p>
              </div>
            </button>

            {/* Opção 3: Avançado */}
            <button
              type="button"
              onClick={() => setAiLevel("advanced")}
              className={`w-full p-4.5 sm:p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${
                aiLevel === "advanced"
                  ? "border-[#FF5500] bg-[#FF5500]/10 shadow-[0_0_20px_rgba(255,85,0,0.15)]"
                  : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <div
                className={`p-3 rounded-xl border shrink-0 mt-0.5 ${
                  aiLevel === "advanced"
                    ? "bg-[#FF5500] text-white border-[#FF5500]"
                    : "bg-white/5 border-white/10 text-neutral-400"
                }`}
              >
                <Film className="size-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                    Avançado / Audiovisual & Direção
                  </h3>
                  {aiLevel === "advanced" && (
                    <Badge className="bg-[#FF5500] text-white text-[10px] font-mono">
                      Selecionado
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Produzo conteúdo para marcas, anúncios ou projetos cinematográficos. Busco controle de câmera 3D, consistência e alta resolução.
                </p>
              </div>
            </button>
          </div>

          {/* Botões Voltar e Avançar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Voltar</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-gradient-to-r from-[#FF5500] via-[#FF6600] to-[#FF7700] hover:from-[#ff6600] hover:to-[#ff8800] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(255,85,0,0.4)] active:scale-[0.98]"
            >
              <span>Continuar para Escolha de Plano</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ETAPA 3: ESCOLHA DE PLANO OU VER DEPOIS                  */}
      {/* ======================================================== */}
      {step === 3 && (
        <div className="py-6 space-y-6 animate-in fade-in-50 duration-200">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
              Como você prefere começar a criar?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
              Escolha a opção que melhor se adapta ao seu ritmo de produção para começar a criar:
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Opção 1: Kriativa Ilimitada (R$ 200/mês) */}
            <button
              type="button"
              onClick={() => setPlanPreference("unlimited")}
              className={`w-full p-4.5 sm:p-5 rounded-2xl border text-left transition-all relative flex flex-col gap-3 cursor-pointer ${
                planPreference === "unlimited"
                  ? "border-[#FF5500] bg-gradient-to-b from-[#18120F] via-[#100D0C] to-[#0A0A0E] shadow-[0_0_30px_rgba(255,85,0,0.25)]"
                  : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase">
                  Melhor Custo-Benefício • Assinatura
                </span>
                <span className="font-heading font-black text-lg text-white">
                  R$ 200 <span className="text-xs font-mono text-neutral-400 font-normal">/ mês</span>
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-black text-base text-white uppercase tracking-tight flex items-center gap-2">
                  <InfinityIcon className="size-4 text-[#FF5500]" />
                  <span>Kriativa Ilimitada</span>
                </h3>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Crie imagens, vídeos, áudios e textos continuamente sem ficar contando créditos. Cancele quando quiser.
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="size-3.5" /> Uso contínuo nos modelos incluídos
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="size-3.5" /> Redirecionamento transparente
                </span>
              </div>
            </button>

            {/* Opção 2: Créditos sob Demanda (A partir de R$ 5) */}
            <button
              type="button"
              onClick={() => setPlanPreference("credits")}
              className={`w-full p-4.5 sm:p-5 rounded-2xl border text-left transition-all relative flex flex-col gap-3 cursor-pointer ${
                planPreference === "credits"
                  ? "border-sky-500 bg-sky-950/20 shadow-[0_0_30px_rgba(14,165,233,0.2)]"
                  : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-[10px] font-bold uppercase">
                  Sem Mensalidade • Pague Conforme Usa
                </span>
                <span className="font-heading font-black text-lg text-white">
                  A partir de R$ 5,00
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-black text-base text-white uppercase tracking-tight flex items-center gap-2">
                  <Coins className="size-4 text-sky-400" />
                  <span>Créditos sob Demanda</span>
                </h3>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Compre créditos via PIX apenas quando precisar. <strong>Os créditos nunca expiram</strong> no final do mês.
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1 text-sky-400">
                  <Check className="size-3.5" /> 20 créditos imediatos (a partir de R$ 5)
                </span>
                <span className="flex items-center gap-1 text-sky-400">
                  <Check className="size-3.5" /> PIX liberado em 3 segundos
                </span>
              </div>
            </button>

            {/* Opção 3: Ver depois e explorar primeiro */}
            <button
              type="button"
              onClick={() => setPlanPreference("explore_later")}
              className={`w-full p-4.5 sm:p-5 rounded-2xl border text-left transition-all relative flex flex-col gap-3 cursor-pointer ${
                planPreference === "explore_later"
                  ? "border-amber-500 bg-amber-950/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                  : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold uppercase">
                  Acesso ao Estúdio
                </span>
                <span className="font-heading font-black text-lg text-white">
                  Gratuito
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-black text-base text-white uppercase tracking-tight flex items-center gap-2">
                  <Rocket className="size-4 text-amber-400" />
                  <span>Ver Depois & Explorar a Plataforma</span>
                </h3>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Conheça a interface, explore as ferramentas de imagem, vídeo, áudio e texto, e recarregue créditos ou assine quando quiser.
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1 text-amber-400">
                  <Check className="size-3.5" /> Sem cartão de crédito
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Check className="size-3.5" /> Acesso direto ao Dashboard
                </span>
              </div>
            </button>
          </div>

          {/* Botões Finais de Confirmação */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="size-4" />
              <span>Voltar</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[50px] px-8 py-3.5 rounded-xl font-heading font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-[#FF5500] via-[#FF6600] to-[#FF7700] hover:from-[#ff6600] hover:to-[#ff8800] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_35px_rgba(255,85,0,0.5)] active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Preparando seu Estúdio...</span>
                </>
              ) : planPreference === "unlimited" ? (
                <>
                  <span>Ativar Kriativa Ilimitada</span>
                  <ArrowRight className="size-4" />
                </>
              ) : planPreference === "credits" ? (
                <>
                  <span>Recarregar Créditos (a partir de R$ 5)</span>
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  <span>Explorar a Plataforma Grátis</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
