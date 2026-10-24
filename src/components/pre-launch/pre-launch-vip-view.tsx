"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { UserButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import {
  MessageCircle,
  Crown,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Check,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Tag,
  Info,
  Loader2,
  X,
  Settings,
  Heart,
  Lock,
  Mail,
  Ticket,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  trackMetaLead,
  trackMetaAddPaymentInfo,
} from "@/lib/meta-pixel";

const DEFAULT_WHATSAPP_URL =
  "https://chat.whatsapp.com/Hl24R2NuhRh7Iq4qU9ce4Y?s=cl&p=i&mlu=4&ilr=4&iam=0";

function formatCpf(val: string): string {
  const clean = val.replace(/\D/g, "").slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

function detectCardBrand(cardNumber: string): { brand: string; label: string } {
  const clean = cardNumber.replace(/\D/g, "");
  if (/^4/.test(clean)) return { brand: "visa", label: "Visa" };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { brand: "master", label: "Mastercard" };
  if (/^3[47]/.test(clean)) return { brand: "amex", label: "Amex" };
  if (/^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|650|6516|6550)/.test(clean))
    return { brand: "elo", label: "Elo" };
  if (/^(606282|3841)/.test(clean)) return { brand: "hipercard", label: "Hipercard" };
  return { brand: "card", label: "Cartão" };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function PreLaunchVipView() {
  const status = useQuery(api.preLaunch.getMyPreLaunchStatus);
  const requestCodeMutation = useMutation(api.preLaunch.requestPreLaunchEmailCode);
  const verifyCodeMutation = useMutation(api.preLaunch.verifyPreLaunchEmailCode);
  const markGroupJoinedMutation = useMutation(api.preLaunch.markWhatsappGroupJoined);
  const createOrderMutation = useMutation(api.credits.createPendingOrder);
  const updateSettingsMutation = useMutation(api.preLaunch.updatePreLaunchSettings);

  const { isEnabled, isMaintenanceMode } = useFeatureFlags();
  const isSkipQueueEnabled = isEnabled("pre_launch_skip_queue_payment");
  const isCardEnabled = isEnabled("payments_card");

  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const profileInitializedRef = useRef(false);

  // Feedback global
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal de Checkout Lugar na Fila (R$ 5,00 apenas Cartão)
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "approved" | "rejected">("pending");

  // Estado Cartão
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardCpf, setCardCpf] = useState("");

  // Estado Admin Quick Config
  const [adminConfigOpen, setAdminConfigOpen] = useState(false);
  const [adminWhatsappUrl, setAdminWhatsappUrl] = useState<string | null>(null);
  const [adminResendKey, setAdminResendKey] = useState("");
  const [adminMetaTestCode, setAdminMetaTestCode] = useState("");
  const [isSavingAdminConfig, setIsSavingAdminConfig] = useState(false);

  useEffect(() => {
    if (status && !profileInitializedRef.current) {
      profileInitializedRef.current = true;

      // Dispara o evento Lead no Meta Pixel + CAPI na primeira vez que o usuário recém-cadastrado entra na Sala VIP
      try {
        const leadKey = `kriativa_meta_lead_fired_${status.userId}`;
        if (!localStorage.getItem(leadKey)) {
          localStorage.setItem(leadKey, "1");
          trackMetaLead({
            eventId: `lead_signup_${status.userId}`,
            name: status.name,
            email: status.email,
            phone: status.whatsapp,
            source: "pre_launch_signup_completed",
          });
        }
      } catch {
        // ignore
      }
    }
  }, [status]);

  if (status === undefined) {
    return (
      <div className="min-h-screen bg-[#040406] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="size-12 rounded-2xl bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#FF5500] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)]">
          <Loader2 className="size-5 animate-spin" />
        </div>
        <p className="text-xs font-mono text-zinc-400 uppercase tracking-[0.2em] text-center">
          Carregando seus 3 passos do Pré-Lançamento...
        </p>
      </div>
    );
  }

  if (status === null) {
    return (
      <div className="min-h-screen bg-[#040406] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="size-12 rounded-2xl bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#FF5500] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)]">
          <AlertTriangle className="size-5" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            Sessão não reconhecida
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Sua conta está autenticada, mas não conseguimos validar a sessão de
            pré-lançamento neste momento. Recarregue a página; se o problema
            persistir, saia da conta e entre novamente.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-1">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto min-h-[46px] px-5 py-3 rounded-2xl font-semibold text-xs uppercase tracking-[0.11em] bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white border border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className="size-4" />
            <span>Recarregar Página</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto min-h-[46px] px-5 py-3 rounded-2xl font-medium text-xs uppercase tracking-[0.11em] text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-colors flex items-center justify-center cursor-pointer"
          >
            Voltar à Página Inicial
          </Link>
        </div>
      </div>
    );
  }

  const settings = status.settings;
  const whatsappUrl = settings.whatsappGroupUrl || DEFAULT_WHATSAPP_URL;

  const step1Done = Boolean(status.emailConfirmed);
  const step2Done = Boolean(status.whatsappGroupJoined);
  const step3Done = Boolean(status.skipQueuePaid);
  const completedStepsCount = [step1Done, step2Done, step3Done].filter(Boolean).length;

  // PASSO 1 (ETAPA A): Enviar / Reenviar código de 6 dígitos para o e-mail
  const handleSendVerificationCode = async () => {
    setFeedback(null);
    setIsSendingCode(true);
    try {
      await requestCodeMutation({});
      setFeedback({
        type: "success",
        message: `Enviamos um código de 6 dígitos para ${status.email}. Digite o código abaixo para confirmar seu e-mail.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Não foi possível enviar o código de verificação."),
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  // PASSO 1 (ETAPA B): Validar o código de 6 dígitos digitado pelo usuário
  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const clean = verificationCode.replace(/\D/g, "").trim();
    if (clean.length !== 6) {
      setFeedback({
        type: "error",
        message: "Digite os 6 números do código enviado para o seu e-mail.",
      });
      return;
    }

    setIsVerifyingCode(true);
    try {
      await verifyCodeMutation({ code: clean });
      setVerificationCode("");
      setFeedback({
        type: "success",
        message: `Passo 1 concluído! Seu e-mail (${status.email}) foi confirmado com sucesso e seu e-mail de boas-vindas foi enviado.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Código inválido. Confira os 6 dígitos enviados ao seu e-mail."),
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // PASSO 2: Entrar no Grupo do WhatsApp
  const handleJoinWhatsappGroup = () => {
    markGroupJoinedMutation().catch(() => {});
  };

  // PASSO 3: Abrir Checkout de R$ 5,00 (Lugar na Fila — Apenas Cartão)
  const handleOpenQueueCheckout = () => {
    if (isMaintenanceMode) {
      setFeedback({
        type: "error",
        message: "O sistema está em manutenção preventiva programada. Tente novamente em instantes.",
      });
      return;
    }
    if (!isSkipQueueEnabled) {
      setFeedback({
        type: "error",
        message: "A compra de lugar na fila está temporariamente pausada pela administração.",
      });
      return;
    }
    setPaymentStatus("pending");
    setCheckoutOpen(true);
  };

  const handleProcessCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCardEnabled) {
      setFeedback({
        type: "error",
        message: "Pagamentos via Cartão estão temporariamente em manutenção.",
      });
      return;
    }

    setIsProcessingCard(true);
    setFeedback(null);

    try {
      const cleanNum = cardNumber.replace(/\D/g, "");
      const cleanCpf = cardCpf.replace(/\D/g, "");
      const [expMonth, expYear] = cardExpiry.split("/");

      if (cleanNum.length < 13 || cleanNum.length > 19) {
        throw new Error("Digite um número de cartão de crédito válido.");
      }
      if (!cardholderName.trim()) {
        throw new Error("Informe o nome do titular impresso no cartão.");
      }
      if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
        throw new Error("Informe a validade no formato MM/AA.");
      }
      if (cardCvv.length < 3 || cardCvv.length > 4) {
        throw new Error("Informe um CVV válido (3 ou 4 dígitos).");
      }
      if (cleanCpf.length !== 11) {
        throw new Error("Informe um CPF válido com 11 dígitos.");
      }

      const brandInfo = detectCardBrand(cleanNum);

      const orderId = await createOrderMutation({
        amountBrl: 5,
        creditsBase: 0,
        creditsBonus: 0,
        creditsTotal: 0,
        packageSlug: "fura_fila_5",
        paymentMethod: "credit_card",
        cardLast4: cleanNum.slice(-4),
        cardBrand: brandInfo.brand,
        installments: 1,
      });

      const res = await fetch("/api/mercadopago/create-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amountBrl: 5,
          creditsBase: 0,
          creditsBonus: 0,
          packageSlug: "fura_fila_5",
          cardNumber: cleanNum,
          cardholderName: cardholderName.trim(),
          expirationMonth: expMonth,
          expirationYear: expYear,
          securityCode: cardCvv,
          cpf: cleanCpf,
          installments: 1,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Transação não autorizada pela operadora.");
      }

      if (data.isApproved || data.status === "approved") {
        setPaymentStatus("approved");
        trackMetaAddPaymentInfo({
          eventId: `add_payment_info_${data.paymentId || orderId}`,
          amountBrl: 5,
          packageSlug: "fura_fila_5",
          title: "Lugar na Fila — Condição R$ 50/mês (Cartão)",
          paymentMethod: "credit_card",
          name: status.name,
          email: status.email,
          phone: status.whatsapp,
        });
        setFeedback({
          type: "success",
          message:
            "Passo 3 concluído! Seu lugar prioritário na fila para a condição de R$ 50/mês foi confirmado e seu cartão ficou vinculado para a assinatura.",
        });
      } else {
        throw new Error(
          "Pagamento não aprovado pela operadora. Verifique os dados do cartão de crédito e tente novamente."
        );
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Erro ao processar cartão de crédito."),
      });
    } finally {
      setIsProcessingCard(false);
    }
  };

  const handleSaveAdminConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAdminConfig(true);
    try {
      await updateSettingsMutation({
        whatsappGroupUrl: adminWhatsappUrl?.trim() || DEFAULT_WHATSAPP_URL,
        resendApiKey: adminResendKey.trim() ? adminResendKey.trim() : undefined,
        metaTestEventCode: adminMetaTestCode.trim() ? adminMetaTestCode.trim() : undefined,
      });
      setAdminConfigOpen(false);
      setFeedback({
        type: "success",
        message: "Configurações de WhatsApp e E-mail/Meta atualizadas em tempo real!",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Erro ao atualizar configurações."),
      });
    } finally {
      setIsSavingAdminConfig(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040406] text-zinc-100 flex flex-col selection:bg-[#FF5500]/30 selection:text-white relative overflow-x-hidden">
      {/* Lightweight Atmospheric Refraction (Zero GPU blur filter for iOS Safari stability) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,85,0,0.11) 0%, rgba(255,255,255,0.03) 45%, transparent 80%)",
        }}
      />

      {/* ======================================================== */}
      {/* BARRA DE CONTROLE DE ADMIN (VISÍVEL APENAS PARA ADMINS)  */}
      {/* ======================================================== */}
      {status.role === "admin" && (
        <div className="w-full bg-white/[0.04] border-b border-white/[0.08] px-3.5 sm:px-4 py-2.5 text-[11px] sm:text-xs font-mono relative z-50">
          <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start sm:items-center gap-2 text-zinc-300">
              <Crown className="size-4 shrink-0 mt-0.5 sm:mt-0 text-[#FF5500]" />
              <span className="leading-snug">
                <strong className="text-white">ADMIN:</strong> Avisos de cadastros, códigos e reservas ativos para{" "}
                <code className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white">
                  leo.phe.rod@gmail.com
                </code>
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setAdminConfigOpen(!adminConfigOpen)}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white flex items-center gap-1.5 cursor-pointer transition-colors text-[11px]"
              >
                <Settings className="size-3.5" />
                <span>WhatsApp & E-mail</span>
              </button>
              <Link
                href="/dashboard/admin"
                className="min-h-[36px] px-3 py-1 rounded-lg bg-[#FF5500] text-white hover:bg-[#ff661a] font-semibold flex items-center gap-1 transition-colors text-[11px]"
              >
                <span>Painel Admin</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {adminConfigOpen && (
            <form
              onSubmit={handleSaveAdminConfig}
              className="container mx-auto max-w-5xl mt-3 pt-3 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
            >
              <Input
                value={adminWhatsappUrl ?? status.settings.whatsappGroupUrl ?? DEFAULT_WHATSAPP_URL}
                onChange={(e) => setAdminWhatsappUrl(e.target.value)}
                placeholder="Link do Grupo WhatsApp"
                className="bg-black/60 border-white/15 text-white text-base sm:text-xs h-10 font-mono"
              />
              <Input
                type="password"
                value={adminResendKey}
                onChange={(e) => setAdminResendKey(e.target.value)}
                placeholder="Resend API Key (re_...)"
                className="bg-black/60 border-white/15 text-white text-base sm:text-xs h-10 font-mono"
              />
              <Input
                value={adminMetaTestCode}
                onChange={(e) => setAdminMetaTestCode(e.target.value)}
                placeholder="Meta Test Event Code (Opcional)"
                className="bg-black/60 border-white/15 text-white text-base sm:text-xs h-10 font-mono"
              />
              <Button
                type="submit"
                disabled={isSavingAdminConfig}
                className="bg-[#FF5500] hover:bg-[#ff661a] text-white text-xs h-10 px-4 font-semibold cursor-pointer w-full md:w-auto"
              >
                {isSavingAdminConfig ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* HEADER DA SALA DE PRÉ-LANÇAMENTO                         */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#040406]/85 backdrop-blur-md">
        <div className="container mx-auto flex h-15 sm:h-18 max-w-5xl items-center justify-between px-4 sm:px-6 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-b from-white/[0.1] to-white/[0.02] border border-white/[0.14] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm sm:text-base tracking-tight text-white">
                KRIATIVA
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.09] text-zinc-400">
                by trinn
              </span>
            </div>

            <Badge className="hidden sm:inline-flex bg-white/[0.05] text-zinc-300 border border-white/[0.1] font-mono text-[10px] uppercase tracking-[0.16em] gap-1.5 px-2.5 py-0.5">
              <Tag className="size-3 text-[#FF5500]" />
              PRÉ-LANÇAMENTO
            </Badge>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.09] bg-white/[0.03] text-[11px] sm:text-xs font-mono">
              <Lock className="size-3.5 text-[#FF5500] shrink-0" />
              <span className="text-zinc-400 hidden sm:inline">Etapas:</span>
              <span className="text-white font-semibold">
                {completedStepsCount}/3 concluídas
              </span>
            </div>

            <UserButton />
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* CONTEÚDO PRINCIPAL: OS 3 PASSOS                          */}
      {/* ======================================================== */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 py-7 sm:py-12 space-y-6 sm:space-y-8 relative z-10">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-mono border flex items-start sm:items-center justify-between gap-3 shadow-xl ${
              feedback.type === "success"
                ? "bg-[#FF5500]/10 border-[#FF5500]/40 text-white"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-start sm:items-center gap-2.5">
              {feedback.type === "success" ? (
                <CheckCircle2 className="size-4 shrink-0 text-[#FF5500] mt-0.5 sm:mt-0" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 text-rose-400 mt-0.5 sm:mt-0" />
              )}
              <span className="leading-relaxed">{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-zinc-400 hover:text-white cursor-pointer p-1 shrink-0"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* HERO + BARRA DE PROGRESSO DOS 3 PASSOS */}
        <section className="relative rounded-[28px] sm:rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.015] border border-white/[0.11] p-5 sm:p-9 shadow-[0_24px_60px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.2)] overflow-hidden space-y-6">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5500]/60 to-transparent" />

          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.12] text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
              Pré-Lançamento Oficial · Área do Membro
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Olá, {status.name ? status.name.split(" ")[0] : "Criador"}. Conclua seus 3 passos:
            </h1>
            <p className="text-xs sm:text-base text-zinc-400 leading-relaxed">
              Siga as 3 etapas abaixo para validar seu e-mail com o código de confirmação, entrar no grupo oficial do WhatsApp e, se desejar, garantir seu lugar prioritário na fila para o{" "}
              <strong className="text-white">1º mês de R$ 50,00</strong> (plano cheio de{" "}
              <span className="line-through text-zinc-500">R$ 500/mês</span> com{" "}
              <strong className="text-zinc-200">
                Kriativa Vision, Motion, Voice e Mind
              </strong>
              ).
            </p>
          </div>

          {/* 3-Step Visual Progress Dock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {[
              {
                num: "01",
                title: "Confirmar o E-mail",
                done: step1Done,
                href: "#passo-1",
              },
              {
                num: "02",
                title: "Entrar no Grupo",
                done: step2Done,
                href: "#passo-2",
              },
              {
                num: "03",
                title: "Lugar na Fila (R$ 5)",
                done: step3Done,
                href: "#passo-3",
              },
            ].map((s) => (
              <a
                key={s.num}
                href={s.href}
                className={`rounded-2xl p-3.5 border transition-all flex items-center justify-between gap-3 ${
                  s.done
                    ? "bg-[#FF5500]/15 border-[#FF5500]/45 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                    : "bg-white/[0.025] border-white/[0.08] text-zinc-300 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                      s.done
                        ? "bg-[#FF5500] text-white"
                        : "bg-white/[0.06] border border-white/[0.1] text-zinc-300"
                    }`}
                  >
                    {s.done ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </span>
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {s.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider shrink-0 text-zinc-400">
                  {s.done ? "OK" : "Pendente"}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* PASSO 1: CONFIRMAR O E-MAIL COM CÓDIGO DE 6 DÍGITOS      */}
        {/* ======================================================== */}
        <section
          id="passo-1"
          className="scroll-mt-24 rounded-[28px] bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.1] p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.14)]"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.12] text-zinc-200 font-mono text-[10px] uppercase tracking-[0.18em]">
              <span className="text-[#FF5500] font-bold">01</span> · Confirmar E-mail por Código
            </span>
            {step1Done ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#FF5500] font-semibold">
                <CheckCircle2 className="size-3.5" />
                E-mail Confirmado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                <Mail className="size-3.5 text-[#FF5500]" />
                Código enviado para {status.email}
              </span>
            )}
          </div>

          <div className="space-y-5">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                1. Confirme seu E-mail Digitando o Código de 6 Dígitos
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Enviamos um código numérico de 6 dígitos para{" "}
                <strong className="text-white font-mono">{status.email}</strong>.
                Preencha o código abaixo para validar seu e-mail na plataforma e receber o e-mail oficial de boas-vindas.
              </p>
            </div>

            {step1Done ? (
              <div className="rounded-2xl bg-[#FF5500]/12 border border-[#FF5500]/35 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF5500] text-white flex items-center justify-center shrink-0">
                    <Check className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      E-mail confirmado com sucesso ({status.email})
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-300">
                      Seu e-mail de boas-vindas já foi disparado. Siga para o Passo 2.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleVerifyEmailCode}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1"
              >
                <div className="relative flex-1 max-w-xs">
                  <KeyRound className="size-4 text-[#FF5500] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full min-h-[52px] pl-11 pr-4 rounded-2xl bg-black/50 border border-white/[0.15] focus:border-[#FF5500] text-white font-mono text-lg tracking-[0.35em] placeholder:text-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingCode || verificationCode.length !== 6}
                  className="min-h-[52px] px-6 py-3.5 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-[0.11em] bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white border border-white/20 shadow-[0_12px_35px_-8px_rgba(255,85,0,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {isVerifyingCode ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Validando...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Código</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isSendingCode}
                  className="min-h-[52px] px-4 py-3 rounded-2xl font-medium text-xs text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {isSendingCode ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin text-[#FF5500]" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-3.5 text-[#FF5500]" />
                      <span>Reenviar Código</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* PASSO 2: ENTRAR NO GRUPO DO WHATSAPP                     */}
        {/* ======================================================== */}
        <section
          id="passo-2"
          className="scroll-mt-24 rounded-[28px] bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.1] p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.14)]"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.12] text-zinc-200 font-mono text-[10px] uppercase tracking-[0.18em]">
              <span className="text-[#FF5500] font-bold">02</span> · Comunidade Oficial
            </span>
            {step2Done && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#FF5500] font-semibold">
                <CheckCircle2 className="size-3.5" />
                Grupo Acessado
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                2. Entre no Grupo do Pré-Lançamento no WhatsApp
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Entre no grupo oficial para acompanhar as novidades dos modelos{" "}
                <strong className="text-zinc-200">
                  Kriativa Vision, Motion, Voice e Mind
                </strong>
                , sua posição na lista e o comunicado exato de abertura das{" "}
                <strong className="text-white">50 primeiras vagas de R$ 50/mês</strong>.
              </p>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleJoinWhatsappGroup}
                className="w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-[0.11em] bg-white hover:bg-zinc-100 text-zinc-950 transition-all inline-flex items-center justify-center gap-2.5 shadow-[0_12px_35px_-8px_rgba(255,255,255,0.25)] active:scale-[0.98]"
              >
                <MessageCircle className="size-4 shrink-0" />
                <span>Entrar no Grupo do WhatsApp</span>
                <ExternalLink className="size-4 shrink-0" />
              </a>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PASSO 3: COMPRAR UM LUGAR NA FILA (R$ 5,00 NO CARTÃO)    */}
        {/* ======================================================== */}
        <section
          id="passo-3"
          className="scroll-mt-24 relative rounded-[28px] sm:rounded-3xl bg-gradient-to-b from-[#170E0A] via-[#0A0A0E] to-[#060609] border border-[#FF5500]/40 p-5 sm:p-9 shadow-[0_24px_60px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.22)] overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5500] to-transparent" />

          <div className="flex items-center justify-between gap-2 flex-wrap mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5500] text-white font-mono text-[10px] font-bold uppercase tracking-[0.16em] shadow-[0_0_20px_rgba(255,85,0,0.4)]">
              <Ticket className="size-3.5" />
              03 · Comprar Lugar na Fila (Opcional · Apenas Cartão)
            </span>
            {step3Done && (
              <Badge className="bg-white text-zinc-950 font-mono font-semibold text-[10px] uppercase px-2.5 py-0.5">
                Lugar na Fila Confirmado
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                3. Comprar um Lugar na Fila para o 1º Mês de R$ 50,00
              </h2>

              <p className="text-xs sm:text-base text-zinc-300 leading-relaxed">
                O preço cheio do plano de IA ilimitada será de{" "}
                <span className="line-through text-zinc-500">R$ 500/mês</span>,
                mas os <strong className="text-white">Primeiros 50</strong>{" "}
                pagarão <strong className="text-white">R$ 50/mês</strong>{" "}
                enquanto mantiverem a assinatura ativa.
              </p>

              {/* Aviso Transparente Obrigatório */}
              <div className="rounded-2xl bg-black/50 border border-white/[0.12] p-4 sm:p-5 space-y-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
                <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#FF5500] font-semibold flex items-center gap-1.5">
                  <Info className="size-3.5 shrink-0" />
                  <span>Importante — Como funciona a Reserva de R$ 5,00:</span>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-[#FF5500] shrink-0 mt-0.5" />
                    <span>
                      Os <strong>R$ 5,00</strong> compram{" "}
                      <strong className="text-white">
                        APENAS um lugar prioritário na fila
                      </strong>{" "}
                      para o primeiro mês de{" "}
                      <strong className="text-white">R$ 50,00</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-[#FF5500] shrink-0 mt-0.5" />
                    <span>
                      Pagamento{" "}
                      <strong className="text-white">
                        exclusivamente via Cartão de Crédito
                      </strong>
                      , pois utilizaremos o mesmo cartão para as assinaturas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="size-4 text-[#FF5500] shrink-0 mt-0.5" />
                    <span>
                      Esse valor{" "}
                      <strong className="text-white">
                        NÃO será convertido em créditos
                      </strong>{" "}
                      e{" "}
                      <strong className="text-white">
                        NÃO concede acesso imediato
                      </strong>{" "}
                      ao plano.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-black/50 border border-white/[0.14] p-5 sm:p-6 space-y-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)]">
                <div className="flex items-baseline justify-between border-b border-dashed border-white/[0.12] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-400 block">
                      Reserva via Cartão
                    </span>
                    <div className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight mt-1">
                      R$ 5<span className="text-lg font-normal text-zinc-400">,00</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                      De R$ 500/mês por
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[#FF5500]">
                      Lote R$ 50/mês
                    </span>
                  </div>
                </div>

                {step3Done ? (
                  <div className="rounded-2xl bg-[#FF5500]/15 border border-[#FF5500]/40 p-4 text-center space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white font-semibold">
                      <CheckCircle2 className="size-4 text-[#FF5500]" />
                      <span>Lugar na Fila Garantido</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Sua reserva prioritária de R$ 5,00 já está ativa
                      {status.subscriptionCardLast4
                        ? ` (Cartão final •••• ${status.subscriptionCardLast4} vinculado para a assinatura).`
                        : " na sua conta."}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenQueueCheckout}
                    className="w-full min-h-[54px] px-5 py-4 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-[0.11em] bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white border border-white/20 transition-all flex items-center justify-center gap-2 shadow-[0_12px_40px_-8px_rgba(255,85,0,0.55)] cursor-pointer active:scale-[0.98]"
                  >
                    <CreditCard className="size-4 shrink-0" />
                    <span>Reservar no Cartão por R$ 5,00</span>
                    <ArrowRight className="size-4 shrink-0" />
                  </button>
                )}

                <p className="text-[11px] text-zinc-500 text-center italic leading-relaxed">
                  Pagamento apenas por cartão de crédito (usaremos o mesmo cartão para a assinatura). Se preferir não reservar, seu cadastro continua gratuito.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* MODAL DE CHECKOUT R$ 5,00 (EXCLUSIVO CARTÃO DE CRÉDITO)  */}
      {/* ======================================================== */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85">
          <div
            className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/[0.14] bg-[#09090D] p-5 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-4 sm:space-y-5 max-h-[92dvh] overflow-y-auto"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 1.25rem))" }}
          >
            <div className="w-12 h-1.5 rounded-full bg-white/15 mx-auto sm:hidden" />

            <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3.5">
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#FF5500] block">
                  Passo 03 · Reserva Exclusiva via Cartão
                </span>
                <h3 className="font-display text-base sm:text-xl font-bold text-white mt-0.5 leading-snug">
                  Lugar na Fila (Lote R$ 50/mês) — R$ 5,00
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Usaremos o mesmo cartão para a sua assinatura · Não converte em créditos e não dá acesso imediato
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
                aria-label="Fechar checkout"
              >
                <X className="size-5" />
              </button>
            </div>

            {paymentStatus === "approved" ? (
              <div className="py-6 sm:py-8 text-center space-y-4">
                <div className="size-16 rounded-2xl bg-[#FF5500]/15 border border-[#FF5500]/40 text-[#FF5500] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-9" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-display text-lg sm:text-xl font-bold text-white">
                    Lugar na Fila Confirmado!
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Sua reserva prioritária para a condição do primeiro mês de R$ 50,00 está ativa e seu cartão ficou vinculado para a assinatura.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="w-full sm:w-auto min-h-[48px] bg-[#FF5500] hover:bg-[#ff661a] text-white font-semibold text-xs uppercase px-6 py-3 rounded-xl cursor-pointer"
                >
                  Concluir e Voltar
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.09] px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-zinc-300">
                  <CreditCard className="size-4 text-[#FF5500] shrink-0" />
                  <span>
                    Pagamento exclusivo por <strong>Cartão de Crédito</strong> (o mesmo cartão será utilizado para a assinatura).
                  </span>
                </div>

                <form onSubmit={handleProcessCard} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400 uppercase">
                      Número do Cartão
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full min-h-[46px] px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white font-mono text-base sm:text-xs focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400 uppercase">
                      Nome Impresso no Cartão
                    </label>
                    <input
                      type="text"
                      autoComplete="cc-name"
                      required
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="COMO ESTÁ NO CARTÃO"
                      className="w-full min-h-[46px] px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white text-base sm:text-xs uppercase focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        Validade
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        required
                        value={cardExpiry}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setCardExpiry(
                            digits.length > 2
                              ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                              : digits
                          );
                        }}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full min-h-[46px] px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white font-mono text-base sm:text-xs focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        CVV
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        required
                        value={cardCvv}
                        onChange={(e) =>
                          setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        placeholder="123"
                        maxLength={4}
                        className="w-full min-h-[46px] px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white font-mono text-base sm:text-xs focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>

                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        CPF do Titular
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        required
                        value={cardCpf}
                        onChange={(e) => setCardCpf(formatCpf(e.target.value))}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full min-h-[46px] px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white font-mono text-base sm:text-xs focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingCard}
                    className="w-full min-h-[50px] mt-2 px-6 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-[0.12em] bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white flex items-center justify-center gap-2 cursor-pointer shadow-[0_12px_35px_-8px_rgba(255,85,0,0.5)] disabled:opacity-50 active:scale-[0.99]"
                  >
                    {isProcessingCard ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Autorizando Cartão...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" />
                        <span>Pagar R$ 5,00 no Cartão (Lugar na Fila)</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rodapé da Sala de Pré-Lançamento */}
      <footer className="w-full border-t border-white/[0.06] py-8 px-4 text-center space-y-2 mt-12 relative z-10">
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
    </div>
  );
}
