"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { UserButton, useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import type { PreLaunchStatusData } from "@/lib/pre-launch-session";
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
  Sparkles,
  Bell,
  Film,
  Eye,
  Phone,
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

type StageId =
  | "step2_offer"
  | "step3_checkout"
  | "step4_whatsapp"
  | "step5_phone"
  | "step6_hub";

function formatCpf(val: string): string {
  const clean = val.replace(/\D/g, "").slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

function formatWhatsapp(val: string): string {
  const clean = val.replace(/\D/g, "").slice(0, 11);
  if (clean.length === 0) return "";
  if (clean.length <= 2) return `(${clean}`;
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

function detectCardBrand(cardNumber: string): { brand: string; label: string } {
  const clean = cardNumber.replace(/\D/g, "");
  if (/^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|650|6516|6550)/.test(clean))
    return { brand: "elo", label: "Elo" };
  if (/^(606282|3841)/.test(clean)) return { brand: "hipercard", label: "Hipercard" };
  if (/^3[47]/.test(clean)) return { brand: "amex", label: "Amex" };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { brand: "master", label: "Mastercard" };
  if (/^4/.test(clean)) return { brand: "visa", label: "Visa" };
  return { brand: "card", label: "Cartão" };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

type PreLaunchVipViewProps = {
  initialStatus?: PreLaunchStatusData | null;
};

export function PreLaunchVipView({ initialStatus = null }: PreLaunchVipViewProps) {
  const {
    isLoading: isConvexAuthLoading,
    isAuthenticated: isConvexAuthenticated,
  } = useConvexAuth();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const liveStatus = useQuery(
    api.preLaunch.getMyPreLaunchStatus,
    isConvexAuthenticated ? {} : "skip"
  );
  const publicSettings = useQuery(api.preLaunch.getPublicPreLaunchSettings, {});
  const markGroupJoinedMutation = useMutation(api.preLaunch.markWhatsappGroupJoined);
  const createOrderMutation = useMutation(api.credits.createPendingOrder);
  const updateSettingsMutation = useMutation(api.preLaunch.updatePreLaunchSettings);

  const [serverStatus, setServerStatus] = useState<PreLaunchStatusData | null>(
    initialStatus
  );
  const [isSyncingSession, setIsSyncingSession] = useState<boolean>(!initialStatus);
  const syncAttemptedRef = useRef(false);

  const { isEnabled, isMaintenanceMode } = useFeatureFlags();
  const isSkipQueueEnabled = isEnabled("pre_launch_skip_queue_payment");
  const isCardEnabled = isEnabled("payments_card");

  const profileInitializedRef = useRef(false);

  // Feedback global
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Controle sequencial do funil pós-cadastro no Clerk (1 tela por vez):
  // 1) "step2_offer": Oferta de R$ 5,00 (Lugar na fila: 1º mês R$ 50 e restante R$ 300)
  // 2) "step3_checkout": Checkout de R$ 5,00 no cartão (se aceitar a oferta)
  // 3) "step4_whatsapp": Página com botão para o Grupo do WhatsApp (após pagar OU se recusar a oferta)
  // 4) "step5_phone": Pedir o WhatsApp para enviar o link do plano (se recusar entrar no grupo)
  // 5) "step6_hub": Página final de Pré-Lançamento (status de fila reservada, próximos passos, etc.)
  const [currentStage, setCurrentStage] = useState<StageId | null>(null);
  const [offerSkipped, setOfferSkipped] = useState(false);
  const [whatsappInput, setWhatsappInput] = useState("");
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);

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
  const [adminResendAudienceId, setAdminResendAudienceId] = useState("");
  const [adminMetaTestCode, setAdminMetaTestCode] = useState("");
  const [isSavingAdminConfig, setIsSavingAdminConfig] = useState(false);
  const [isSyncingResendContacts, setIsSyncingResendContacts] = useState(false);

  const clerkClientEmail =
    clerkUser?.primaryEmailAddress?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    clerkUser?.externalAccounts?.[0]?.emailAddress ||
    "";
  const clerkClientName =
    clerkUser?.fullName ||
    clerkUser?.firstName ||
    clerkUser?.externalAccounts?.[0]?.firstName ||
    clerkUser?.username ||
    "";

  // Sincroniza a sessão de pré-lançamento pelo servidor caso necessário (ou envia dados salvos no localStorage)
  useEffect(() => {
    if (syncAttemptedRef.current) return;
    if (!isClerkLoaded && !initialStatus?.email) return;
    syncAttemptedRef.current = true;

    let savedName: string | undefined;
    let savedWhatsapp: string | undefined;
    try {
      const rawLead = localStorage.getItem("kriativa_prelaunch_lead");
      if (rawLead) {
        const parsed = JSON.parse(rawLead) as { name?: string; whatsapp?: string };
        savedName = parsed.name;
        savedWhatsapp = parsed.whatsapp;
      }
      if (!savedName) {
        savedName = localStorage.getItem("kriativa_prelaunch_name") || undefined;
      }
      if (!savedWhatsapp) {
        savedWhatsapp =
          localStorage.getItem("kriativa_prelaunch_whatsapp") || undefined;
      }
    } catch {
      // ignore
    }

  const isSyncingNeeded =
    !initialStatus ||
    !initialStatus.email ||
    Boolean(savedName) ||
    Boolean(savedWhatsapp);

    if (!isSyncingNeeded) {
      setIsSyncingSession(false);
      return;
    }

    setIsSyncingSession(true);
    fetch("/api/pre-launch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sync",
        emailOverride: clerkClientEmail || initialStatus?.email || undefined,
        nameOverride: savedName || clerkClientName || undefined,
        whatsapp: savedWhatsapp,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.status) {
          setServerStatus(data.status);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsSyncingSession(false);
      });
  }, [initialStatus, isClerkLoaded, clerkClientEmail, clerkClientName]);

  // Fallback cliente via Clerk se tanto liveStatus quanto serverStatus ainda não responderam
  const clerkFallbackStatus: PreLaunchStatusData | null =
    isClerkLoaded && clerkUser
      ? {
          userId: clerkUser.id,
          name: clerkClientName || "Criador",
          email: clerkClientEmail,
          whatsapp: clerkUser.primaryPhoneNumber?.phoneNumber || "",
          role:
            clerkUser.publicMetadata?.role === "admin" ||
            clerkClientEmail.toLowerCase() === "leo.phe.rod@gmail.com"
              ? "admin"
              : "user",
          tags: ["pre_lancamento"],
          hasPreLaunchTag: true,
          emailConfirmed: Boolean(clerkUser.publicMetadata?.emailConfirmed),
          verificationCodeSent: true,
          welcomeEmailSent: Boolean(clerkUser.publicMetadata?.welcomeEmailSent),
          whatsappGroupJoined: Boolean(
            clerkUser.publicMetadata?.whatsappGroupJoined
          ),
          skipQueuePaid: Boolean(clerkUser.publicMetadata?.skipQueuePaid),
          skipQueueAmountBrl:
            typeof clerkUser.publicMetadata?.skipQueueAmountBrl === "number"
              ? clerkUser.publicMetadata.skipQueueAmountBrl
              : 0,
          paidCredits: 0,
          bonusCredits: 0,
          totalCredits: 0,
          settings: publicSettings ?? {
            key: "global_prelaunch_config",
            whatsappGroupUrl: DEFAULT_WHATSAPP_URL,
            whatsappGroupTitle: "Grupo Oficial do Pré-Lançamento no WhatsApp",
            whatsappGroupDescription:
              "Entre no grupo oficial do pré-lançamento para acompanhar as novidades, sua posição na lista e o comunicado oficial de abertura das 50 primeiras vagas de R$ 50/mês.",
            skipQueue5Title: "Comprar um Lugar na Fila (R$ 5,00 no Cartão)",
            skipQueue5Subtitle:
              "Os R$ 5,00 compram apenas um lugar prioritário na fila para a condição do primeiro mês de R$ 50,00 (Os Primeiros 50).",
            skipQueue5CreditsBase: 0,
            skipQueue5CreditsBonus: 0,
            skipQueue10Title: "Lugar na Fila + Selo Fundador (R$ 10,00)",
            skipQueue10Subtitle:
              "Prioridade na fila para o lote de abertura + selo fundador na conta.",
            skipQueue10CreditsBase: 0,
            skipQueue10CreditsBonus: 0,
            extraInfoBlocks: [],
          },
        }
      : null;

  const status = (liveStatus ?? serverStatus ?? clerkFallbackStatus) as
    | PreLaunchStatusData
    | null
    | undefined;

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

  if (
    !status &&
    (liveStatus === undefined || isConvexAuthLoading || isSyncingSession || !isClerkLoaded)
  ) {
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

  if (!status) {
    return (
      <div className="min-h-screen bg-[#040406] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="size-12 rounded-2xl bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#FF5500] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)]">
          <AlertTriangle className="size-5" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            Sessão expirada
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Faça login novamente para acessar os seus 3 passos do pré-lançamento.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-1">
          <Link
            href="/sign-in?redirect_url=/pre-lancamento"
            className="w-full sm:w-auto min-h-[46px] px-5 py-3 rounded-2xl font-semibold text-xs uppercase tracking-[0.11em] bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white border border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>Entrar na Conta</span>
          </Link>
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

  const isAdmin = status.role === "admin";
  const stepTicketDone = Boolean(status.skipQueuePaid);
  const stepWhatsappDone = Boolean(status.whatsappGroupJoined);
  const hasSavedWhatsapp = Boolean(
    status.whatsapp && status.whatsapp.replace(/\D/g, "").length >= 10
  );
  const isReturningCompletedUser = Boolean(
    stepWhatsappDone || hasSavedWhatsapp || stepTicketDone
  );

  // Resolve qual tela exclusiva do funil deve ser exibida:
  // - A verificação de e-mail acontece direto no modal do Clerk no momento do cadastro.
  // - Assim que o novo usuário chega em /pre-lancamento, ele vai direto para a Oferta de R$ 5,00 (step2_offer).
  // - Usuários já cadastrados que concluíram o fluxo vão direto para o Painel da Fila (step6_hub).
  const activeStage: StageId =
    currentStage !== null
      ? currentStage
      : isReturningCompletedUser
        ? "step6_hub"
        : offerSkipped
          ? "step4_whatsapp"
          : "step2_offer";

  // TELA 1 (OFERTA) -> ACEITAR OFERTA DE R$ 5: Vai para o Checkout (step3_checkout)
  const handleAcceptOffer = () => {
    setFeedback(null);
    if (isMaintenanceMode) {
      setFeedback({
        type: "error",
        message: "Sistema em manutenção rápida. Tente novamente em instantes.",
      });
      return;
    }
    if (!isSkipQueueEnabled) {
      setFeedback({
        type: "error",
        message: "A reserva de lugar na fila está temporariamente pausada.",
      });
      return;
    }
    setCurrentStage("step3_checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // TELA 2 -> RECUSAR OFERTA DE R$ 5: Vai direto para Tela 4 (Grupo do WhatsApp)
  const handleDeclineOffer = () => {
    setFeedback(null);
    setOfferSkipped(true);
    setCurrentStage("step4_whatsapp");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // TELA 4 -> ACEITAR GRUPO DO WHATSAPP: Registra entrada e avança para Tela 6 (Página de Pré-Lançamento)
  const handleJoinWhatsappGroup = () => {
    setFeedback(null);
    setServerStatus((prev) =>
      prev ? { ...prev, whatsappGroupJoined: true } : prev
    );
    fetch("/api/pre-launch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join_whatsapp" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.status) setServerStatus(data.status);
      })
      .catch(() => {});
    markGroupJoinedMutation({}).catch(() => {});
    setCurrentStage("step6_hub");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // TELA 4 -> RECUSAR GRUPO DO WHATSAPP: Vai para Tela 5 (Pedir número do WhatsApp)
  const handleDeclineWhatsappGroup = () => {
    setFeedback(null);
    if (status.whatsapp && !whatsappInput) {
      setWhatsappInput(formatWhatsapp(status.whatsapp));
    }
    setCurrentStage("step5_phone");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // TELA 5 -> SALVAR WHATSAPP PARA RECEBER O LINK DO PLANO: Vai para Tela 6 (Página de Pré-Lançamento)
  const handleSaveWhatsappNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const digits = whatsappInput.replace(/\D/g, "");
    if (digits.length < 10) {
      setFeedback({
        type: "error",
        message: "Digite seu WhatsApp com DDD (ex: 11 99999-9999).",
      });
      return;
    }

    setIsSavingWhatsapp(true);
    try {
      const res = await fetch("/api/pre-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_whatsapp",
          whatsapp: whatsappInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar seu WhatsApp.");
      }
      if (data.status) {
        setServerStatus(data.status);
      } else {
        setServerStatus((prev) =>
          prev ? { ...prev, whatsapp: whatsappInput.trim() } : prev
        );
      }
      try {
        localStorage.setItem("kriativa_prelaunch_whatsapp", whatsappInput.trim());
      } catch {
        // ignore
      }
      setCurrentStage("step6_hub");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Não foi possível salvar seu WhatsApp."),
      });
    } finally {
      setIsSavingWhatsapp(false);
    }
  };

  // TELA 3 (CHECKOUT): Processa o pagamento de R$ 5,00 e leva para a Tela 4 (Página com botão do Grupo do WhatsApp)
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
        throw new Error("Informe o nome impresso no cartão.");
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

      let orderId: string | undefined;
      try {
        orderId = await createOrderMutation({
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
      } catch {
        orderId = undefined;
      }

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
        setServerStatus((prev) =>
          prev
            ? {
                ...prev,
                skipQueuePaid: true,
                skipQueueAmountBrl: (prev.skipQueueAmountBrl || 0) + 5,
                subscriptionCardLast4: cleanNum.slice(-4),
                subscriptionCardBrand: brandInfo.brand,
              }
            : prev
        );
        fetch("/api/pre-launch")
          .then((r) => r.json())
          .then((refreshed) => {
            if (refreshed?.status) setServerStatus(refreshed.status);
          })
          .catch(() => {});
        trackMetaAddPaymentInfo({
          eventId: `add_payment_info_${data.paymentId || orderId}`,
          amountBrl: 5,
          packageSlug: "fura_fila_5",
          title: "Lugar na Fila — 1º mês R$ 50 e demais R$ 300",
          paymentMethod: "credit_card",
          name: status.name,
          email: status.email,
          phone: status.whatsapp,
        });

        // Avança para a página que tem o botão para o Grupo do WhatsApp (Tela 4)
        setCurrentStage("step4_whatsapp");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(
          "Pagamento não aprovado pela operadora. Verifique os dados do cartão."
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
      const res = await fetch("/api/pre-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          whatsappGroupUrl: adminWhatsappUrl?.trim() || DEFAULT_WHATSAPP_URL,
          resendApiKey: adminResendKey.trim() ? adminResendKey.trim() : undefined,
          resendAudienceId: adminResendAudienceId.trim()
            ? adminResendAudienceId.trim()
            : undefined,
          metaTestEventCode: adminMetaTestCode.trim()
            ? adminMetaTestCode.trim()
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        await updateSettingsMutation({
          whatsappGroupUrl: adminWhatsappUrl?.trim() || DEFAULT_WHATSAPP_URL,
          resendApiKey: adminResendKey.trim() ? adminResendKey.trim() : undefined,
          resendAudienceId: adminResendAudienceId.trim()
            ? adminResendAudienceId.trim()
            : undefined,
          metaTestEventCode: adminMetaTestCode.trim()
            ? adminMetaTestCode.trim()
            : undefined,
        });
      } else if (data?.status) {
        setServerStatus(data.status);
      }
      setAdminConfigOpen(false);
      setFeedback({
        type: "success",
        message:
          "Configurações atualizadas e sincronização da Audiência Resend disparada!",
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

  const handleSyncResendContacts = async () => {
    setIsSyncingResendContacts(true);
    try {
      const res = await fetch("/api/pre-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_resend_contacts",
          resendApiKey: adminResendKey.trim() ? adminResendKey.trim() : undefined,
          resendAudienceId: adminResendAudienceId.trim()
            ? adminResendAudienceId.trim()
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Erro ao sincronizar contatos.");
      }
      setFeedback({
        type: "success",
        message:
          "Todos os contatos (Clerk e Convex) foram enviados para a Audiência do Resend!",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          err,
          "Erro ao sincronizar contatos na Audiência do Resend."
        ),
      });
    } finally {
      setIsSyncingResendContacts(false);
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
      {isAdmin && (
        <div className="w-full bg-white/[0.04] border-b border-white/[0.08] px-3.5 sm:px-4 py-2.5 text-[11px] sm:text-xs font-mono relative z-50">
          <div className="container mx-auto max-w-5xl flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start sm:items-center gap-2 text-zinc-300">
                <Crown className="size-4 shrink-0 mt-0.5 sm:mt-0 text-[#FF5500]" />
                <span className="leading-snug">
                  <strong className="text-white">ADMIN:</strong> Navegação livre pelas 5 telas do funil ativa ({" "}
                  <code className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white">
                    leo.phe.rod@gmail.com
                  </code>{" "}
                  )
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setAdminConfigOpen(!adminConfigOpen)}
                  className={`min-h-[36px] px-3 py-1 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors text-[11px] ${
                    status.settings.resendConfigured
                      ? "bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.1] text-white"
                      : "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-200"
                  }`}
                >
                  <Settings className="size-3.5" />
                  <span>
                    {status.settings.resendConfigured
                      ? "WhatsApp & E-mail (Resend Ativo)"
                      : "Configurar Resend API Key"}
                  </span>
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

            {/* Seletor Rápido das 5 Telas para o Admin */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/[0.07]">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 flex items-center gap-1 mr-1">
                <Eye className="size-3 text-[#FF5500]" />
                <span>Telas:</span>
              </span>
              {[
                { id: "step2_offer" as const, label: "1. Oferta R$ 5" },
                { id: "step3_checkout" as const, label: "2. Checkout" },
                { id: "step4_whatsapp" as const, label: "3. Grupo WhatsApp" },
                { id: "step5_phone" as const, label: "4. Pedir WhatsApp" },
                { id: "step6_hub" as const, label: "5. Fila Pré-Lançamento" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCurrentStage(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer border ${
                    activeStage === tab.id
                      ? "bg-[#FF5500] border-[#FF5500] text-white font-semibold"
                      : "bg-white/[0.04] hover:bg-white/[0.1] border-white/[0.1] text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {adminConfigOpen && (
            <form
              onSubmit={handleSaveAdminConfig}
              className="container mx-auto max-w-5xl mt-3 pt-3 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-6 gap-2 items-center"
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
                value={adminResendAudienceId}
                onChange={(e) => setAdminResendAudienceId(e.target.value)}
                placeholder="Resend Audience ID (Auto)"
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
                {isSavingAdminConfig ? "Salvando..." : "Salvar Config"}
              </Button>
              <Button
                type="button"
                onClick={handleSyncResendContacts}
                disabled={isSyncingResendContacts}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs h-10 px-3 font-semibold cursor-pointer w-full md:w-auto flex items-center justify-center gap-1.5"
              >
                <RefreshCw
                  className={`size-3.5 ${isSyncingResendContacts ? "animate-spin" : ""}`}
                />
                <span>
                  {isSyncingResendContacts ? "Sincronizando..." : "Sync Resend"}
                </span>
              </Button>
            </form>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* HEADER COMPACTO E MOBILE-FIRST                           */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#040406]/85 backdrop-blur-md">
        <div className="container mx-auto flex h-14 sm:h-16 max-w-xl items-center justify-between px-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-xl bg-gradient-to-b from-white/[0.1] to-white/[0.02] border border-white/[0.14] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-white">
              KRIATIVA
            </span>
            <span className="text-[9px] font-mono uppercase tracking-[0.16em] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.09] text-zinc-400">
              PRÉ-LANÇAMENTO
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {stepTicketDone && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/40 text-[10px] font-mono text-[#FF5500] font-semibold">
                <Ticket className="size-3" />
                Fila R$ 50
              </span>
            )}
            <UserButton />
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* CONTEÚDO PRINCIPAL: 1 TELA POR VEZ (MOBILE-FIRST)        */}
      {/* ======================================================== */}
      <main className="flex-1 container mx-auto max-w-xl px-4 py-6 sm:py-10 space-y-4 relative z-10 flex flex-col justify-center">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-mono border flex items-start justify-between gap-2.5 shadow-xl ${
              feedback.type === "success"
                ? "bg-[#FF5500]/10 border-[#FF5500]/40 text-white"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-start gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="size-4 shrink-0 text-[#FF5500] mt-0.5" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span className="leading-relaxed">{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-zinc-400 hover:text-white cursor-pointer p-0.5 shrink-0"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TELA 1: OFERTA DE R$ 5,00 (1º MÊS R$ 50 E DEMAIS R$ 300) */}
        {/* ======================================================== */}
        {activeStage === "step2_offer" && (
          <section className="relative rounded-3xl bg-gradient-to-b from-[#170E0A] via-[#0A0A0E] to-[#060609] border border-[#FF5500]/45 p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.22)] overflow-hidden space-y-5">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5500] to-transparent" />

            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5500] text-white font-mono text-[10px] font-bold uppercase tracking-[0.16em] shadow-[0_0_20px_rgba(255,85,0,0.4)]">
                <Ticket className="size-3.5" />
                OFERTA EXCLUSIVA DE FILA
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Opcional
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                Garanta seu lugar na fila por apenas{" "}
                <span className="text-[#FF5500]">R$ 5,00</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Nenhum plano está aberto para compra agora. Ao reservar seu lugar na fila hoje por{" "}
                <strong className="text-white">R$ 5,00</strong>, você trava a condição prioritária para pagar{" "}
                <strong className="text-[#FF5500]">R$ 50 no 1º mês</strong> e{" "}
                <strong className="text-white">R$ 300/mês nos seguintes</strong>{" "}
                assim que o estúdio abrir.
              </p>
            </div>

            {/* Resumo direto da oferta */}
            <div className="rounded-2xl bg-black/55 border border-white/[0.12] p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Reserva de Lugar na Fila
                  </span>
                  <span className="text-xs text-[#FF5500] font-mono font-semibold">
                    1º mês R$ 50 · Demais R$ 300/mês
                  </span>
                </div>
                <div className="font-display text-3xl font-bold text-white">
                  R$ 5<span className="text-sm font-normal text-zinc-400">,00</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-zinc-300 leading-snug pt-0.5">
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#FF5500] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Acesso antecipado na fila</strong> para garantir o 1º mês de{" "}
                    <strong className="text-white">R$ 50,00</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#FF5500] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Ativação em 1 clique:</strong> exclusivo no Cartão de Crédito.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#FF5500] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Transparência:</strong> os R$ 5 reservam sua posição na fila (não viram créditos).
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleAcceptOffer}
                className="w-full min-h-[56px] px-5 py-4 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-[0.11em] bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white border border-white/20 transition-all flex items-center justify-center gap-2 shadow-[0_14px_45px_-8px_rgba(255,85,0,0.6)] cursor-pointer active:scale-[0.99]"
              >
                <Ticket className="size-4 shrink-0" />
                <span>Garantir Meu Lugar por R$ 5,00</span>
                <ArrowRight className="size-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleDeclineOffer}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl font-medium text-xs text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Não quero reservar agora · Continuar</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TELA 3: CHECKOUT DE R$ 5,00 NO CARTÃO                    */}
        {/* ======================================================== */}
        {activeStage === "step3_checkout" && (
          <section className="relative rounded-3xl bg-[#09090D] border border-[#FF5500]/45 p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.2)] space-y-5">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5500] to-transparent" />

            <div className="flex items-start justify-between gap-2 border-b border-white/[0.08] pb-3.5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#FF5500] block font-semibold">
                  CHECKOUT · LUGAR NA FILA
                </span>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-white mt-0.5 leading-tight">
                  Reservar Lugar por R$ 5,00
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Garante 1º mês por <strong className="text-white">R$ 50</strong> e demais por{" "}
                  <strong className="text-white">R$ 300/mês</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStage("step2_offer")}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-mono text-zinc-400 hover:text-white bg-white/[0.04] border border-white/[0.08] cursor-pointer shrink-0"
              >
                ← Voltar
              </button>
            </div>

            <form onSubmit={handleProcessCard} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-300 uppercase">
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
                  className="w-full min-h-[50px] px-4 rounded-xl bg-white/[0.03] border border-white/[0.12] text-white font-mono text-base sm:text-sm focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-300 uppercase">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  autoComplete="cc-name"
                  required
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="NOME IMPRESSO NO CARTÃO"
                  className="w-full min-h-[50px] px-4 rounded-xl bg-white/[0.03] border border-white/[0.12] text-white text-base sm:text-sm uppercase focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-300 uppercase">
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
                    className="w-full min-h-[50px] px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.12] text-white font-mono text-base sm:text-sm focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-300 uppercase">
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
                    className="w-full min-h-[50px] px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.12] text-white font-mono text-base sm:text-sm focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-mono text-zinc-300 uppercase">
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
                    className="w-full min-h-[50px] px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.12] text-white font-mono text-base sm:text-sm focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingCard}
                className="w-full min-h-[56px] mt-1 px-5 py-4 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-[0.11em] bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white flex items-center justify-center gap-2 cursor-pointer shadow-[0_14px_40px_-8px_rgba(255,85,0,0.55)] disabled:opacity-50 active:scale-[0.99]"
              >
                {isProcessingCard ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Confirmando Reserva...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    <span>Pagar R$ 5,00 e Garantir Lugar</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-1 border-t border-white/[0.08] text-center">
              <button
                type="button"
                onClick={handleDeclineOffer}
                className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                Continuar sem reservar lugar na fila →
              </button>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TELA 4: PÁGINA COM O BOTÃO PARA O GRUPO DO WHATSAPP      */}
        {/* ======================================================== */}
        {activeStage === "step4_whatsapp" && (
          <section className="relative rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.015] border border-white/[0.12] p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.2)] overflow-hidden space-y-5">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5500] to-transparent" />

            {stepTicketDone && (
              <div className="rounded-2xl bg-[#FF5500]/15 border border-[#FF5500]/45 p-3.5 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-[#FF5500] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    Lugar na fila garantido! (1º mês R$ 50 · demais R$ 300)
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Agora escolha onde prefere receber o aviso de abertura.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/40 text-white font-mono text-[10px] uppercase tracking-[0.16em]">
                <Bell className="size-3 text-[#FF5500]" />
                RADAR DE LANÇAMENTO
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight pt-1">
                Receba os bastidores e o alerta de abertura no WhatsApp
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Entre no canal silencioso do pré-lançamento para ver prévias reais do{" "}
                <strong className="text-white">
                  Kriativa Vision, Motion, Voice e Mind
                </strong>{" "}
                e ser avisado no minuto exato em que os planos abrirem.
              </p>
            </div>

            <div className="rounded-2xl bg-black/45 border border-white/[0.1] p-4 space-y-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#FF5500] shrink-0" />
                <span>
                  <strong className="text-white">Spoilers inéditos:</strong> veja na prática o que você vai criar no estúdio ativo.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-[#FF5500] shrink-0" />
                <span>
                  <strong className="text-white">Aviso em tempo real:</strong> não perca sua vaga por um e-mail que caiu no spam.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#FF5500] shrink-0" />
                <span>
                  <strong className="text-white">Zero ruído:</strong> grupo fechado apenas para comunicados oficiais.
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleJoinWhatsappGroup}
                className="w-full min-h-[56px] px-5 py-4 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-[0.11em] bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white border border-white/20 transition-all flex items-center justify-center gap-2 shadow-[0_14px_45px_-8px_rgba(255,85,0,0.6)] active:scale-[0.99]"
              >
                <MessageCircle className="size-5 shrink-0" />
                <span>Entrar no Grupo do WhatsApp</span>
                <ExternalLink className="size-4 shrink-0" />
              </a>

              <button
                type="button"
                onClick={handleDeclineWhatsappGroup}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl font-medium text-xs text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Não quero entrar no grupo · Me envie o link no privado</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TELA 5: PEDIR O WHATSAPP (SE RECUSAR O GRUPO)            */}
        {/* ======================================================== */}
        {activeStage === "step5_phone" && (
          <section className="relative rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.015] border border-white/[0.12] p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.2)] overflow-hidden space-y-5">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5500] to-transparent" />

            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/40 text-white font-mono text-[10px] uppercase tracking-[0.16em]">
                <Phone className="size-3 text-[#FF5500]" />
                AVISO INDIVIDUAL
              </span>
              <button
                type="button"
                onClick={() => setCurrentStage("step4_whatsapp")}
                className="text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
              >
                ← Voltar
              </button>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                Qual é o seu WhatsApp?
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Informe seu número abaixo para enviarmos o{" "}
                <strong className="text-white">
                  link do seu plano diretamente no seu WhatsApp
                </strong>{" "}
                assim que estiver disponível.
              </p>
            </div>

            <form onSubmit={handleSaveWhatsappNumber} className="space-y-3">
              <div className="relative">
                <Phone className="size-4 text-[#FF5500] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  autoFocus
                  required
                  value={whatsappInput}
                  onChange={(e) =>
                    setWhatsappInput(formatWhatsapp(e.target.value))
                  }
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="w-full min-h-[56px] pl-11 pr-4 rounded-2xl bg-black/60 border border-white/[0.16] focus:border-[#FF5500] text-white font-mono text-lg placeholder:text-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={
                  isSavingWhatsapp ||
                  whatsappInput.replace(/\D/g, "").length < 10
                }
                className="w-full min-h-[56px] px-5 py-4 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-[0.11em] bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white border border-white/20 shadow-[0_12px_35px_-8px_rgba(255,85,0,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isSavingWhatsapp ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <span>Receber Link no Meu WhatsApp</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>
          </section>
        )}

        {/* ======================================================== */}
        {/* TELA 6: PÁGINA DE PRÉ-LANÇAMENTO (STATUS DA FILA & HUB)  */}
        {/* ======================================================== */}
        {activeStage === "step6_hub" && (
          <section className="relative rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.015] border border-white/[0.12] p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.2)] overflow-hidden space-y-5">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5500] to-transparent" />

            {/* Cabeçalho de Status da Fila */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/40 text-white font-mono text-[10px] uppercase tracking-[0.16em]">
                <CheckCircle2 className="size-3.5 text-[#FF5500]" />
                {stepTicketDone ? "FILA PRIORITÁRIA RESERVADA" : "FILA DE PRÉ-LANÇAMENTO"}
              </span>
              {stepTicketDone && (
                <Badge className="bg-[#FF5500] text-white font-mono font-semibold text-[10px] uppercase px-2.5 py-0.5">
                  Passe R$ 5 Ativo
                </Badge>
              )}
            </div>

            <div className="space-y-1.5">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {stepTicketDone
                  ? "Seu lugar prioritário na fila está reservado."
                  : "Você está na fila do pré-lançamento."}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {stepTicketDone ? (
                  <>
                    Sua condição de <strong className="text-[#FF5500]">R$ 50 no 1º mês</strong> (e{" "}
                    <strong className="text-white">R$ 300/mês nos seguintes</strong>) está travada. Nenhum plano está aberto hoje — avisaremos você assim que a ativação liberar.
                  </>
                ) : (
                  <>
                    Nenhum plano está disponível para compra ainda. Assim que o estúdio abrir, enviaremos o link de acesso pelos canais confirmados abaixo.
                  </>
                )}
              </p>
            </div>

            {/* Resumo de Status em 3 Linhas Compactas */}
            <div className="rounded-2xl bg-black/50 border border-white/[0.1] divide-y divide-white/[0.07] text-xs">
              <div className="p-3.5 flex items-center justify-between gap-2">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Mail className="size-4 text-[#FF5500] shrink-0" />
                  <span>E-mail verificado</span>
                </span>
                <span className="font-mono text-white truncate max-w-[190px]">
                  {status.email}
                </span>
              </div>

              <div className="p-3.5 flex items-center justify-between gap-2">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Ticket className="size-4 text-[#FF5500] shrink-0" />
                  <span>Status na fila</span>
                </span>
                {stepTicketDone ? (
                  <span className="font-mono text-[#FF5500] font-semibold">
                    Prioridade (1º mês R$ 50)
                  </span>
                ) : (
                  <span className="font-mono text-zinc-300">
                    Lista Geral
                  </span>
                )}
              </div>

              <div className="p-3.5 flex items-center justify-between gap-2">
                <span className="text-zinc-400 flex items-center gap-2">
                  <MessageCircle className="size-4 text-[#FF5500] shrink-0" />
                  <span>Aviso do link</span>
                </span>
                <span className="font-mono text-white">
                  {stepWhatsappDone
                    ? "Grupo Oficial WhatsApp"
                    : status.whatsapp
                      ? `WhatsApp (${status.whatsapp})`
                      : "Por E-mail"}
                </span>
              </div>
            </div>

            {/* Próximos Passos Enxutos */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#FF5500] font-semibold">
                Próximos passos:
              </div>
              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#FF5500]/20 text-[#FF5500] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    <strong className="text-white">Bastidores & Novidades:</strong> enviaremos prévias reais dos motores{" "}
                    <strong className="text-white">Kriativa Vision, Motion, Voice e Mind</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#FF5500]/20 text-[#FF5500] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    <strong className="text-white">Envio do Link Oficial:</strong> você receberá o link do plano no seu WhatsApp e e-mail assim que abrir.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#FF5500]/20 text-[#FF5500] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    <strong className="text-white">Liberação do Estúdio:</strong>{" "}
                    {stepTicketDone
                      ? "acesso prioritário antecipado com seu cartão já validado."
                      : "abertura conforme ordem de chegada na lista de espera."}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações rápidas caso o usuário ainda não tenha reservado R$ 5 ou queira acessar o Grupo */}
            <div className="space-y-2.5 pt-1">
              {!stepTicketDone && (
                <button
                  type="button"
                  onClick={() => setCurrentStage("step2_offer")}
                  className="w-full min-h-[54px] px-5 py-3.5 rounded-2xl font-semibold text-xs uppercase tracking-[0.11em] bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white border border-white/20 transition-all flex items-center justify-center gap-2 shadow-[0_14px_45px_-8px_rgba(255,85,0,0.6)] cursor-pointer"
                >
                  <Ticket className="size-4 shrink-0" />
                  <span>Garantir Lugar na Fila por R$ 5 (1º mês R$ 50)</span>
                  <ArrowRight className="size-4 shrink-0" />
                </button>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleJoinWhatsappGroup}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl font-medium text-xs text-zinc-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="size-4 text-[#FF5500]" />
                <span>Acessar Grupo Oficial do WhatsApp</span>
                <ExternalLink className="size-3.5 text-zinc-400" />
              </a>
            </div>
          </section>
        )}
      </main>

      {/* Rodapé Compacto */}
      <footer className="w-full border-t border-white/[0.06] py-6 px-4 text-center space-y-1.5 mt-8 relative z-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400">
          by trinn
        </div>
        <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
          <span>Feito com amor no Brasil.</span>
          <Heart className="w-3 h-3 text-[#FF5500] fill-[#FF5500]" />
        </p>
      </footer>
    </div>
  );
}
