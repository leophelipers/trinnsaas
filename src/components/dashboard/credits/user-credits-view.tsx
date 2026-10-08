"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Coins,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  CreditCard,
  QrCode,
  History,
  Gift,
  ArrowRight,
  ShieldCheck,
  Flame,
  X,
  RefreshCw,
  Lock,
  Sliders,
  Wallet,
  CheckCheck,
  TrendingDown,
  TrendingUp,
  Search,
  Film,
  Clock,
  ArrowUpRight,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

/**
 * Detecta a bandeira do cartão de crédito com base nos dígitos iniciais
 */
function detectCardBrand(cardNumber: string): { brand: string; label: string; color: string; bg: string } {
  const clean = cardNumber.replace(/\D/g, "");
  if (/^4/.test(clean)) return { brand: "visa", label: "Visa", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { brand: "master", label: "Mastercard", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
  if (/^3[47]/.test(clean)) return { brand: "amex", label: "Amex", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30" };
  if (/^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|650|6516|6550)/.test(clean))
    return { brand: "elo", label: "Elo", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" };
  if (/^(606282|3841)/.test(clean)) return { brand: "hipercard", label: "Hipercard", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30" };
  return { brand: "card", label: "Cartão", color: "text-neutral-400", bg: "bg-white/5 border-white/10" };
}

/**
 * Formata CPF com pontuação padrão brasileira
 */
function formatCpf(val: string): string {
  const clean = val.replace(/\D/g, "").slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

export function UserCreditsView() {
  const creditsInfo = useQuery(api.credits.getMyCredits);

  // Paginação reativa de Extrato de Movimentações
  const TRANSACTIONS_PAGE_SIZE = 15;
  const {
    results: paginatedTransactions,
    status: paginationStatus,
    loadMore,
    isLoading: isTransactionsLoading,
  } = usePaginatedQuery(
    api.credits.getMyTransactionsPaginated,
    {},
    { initialNumItems: TRANSACTIONS_PAGE_SIZE }
  );

  // Filtros e busca no extrato
  const [filterType, setFilterType] = useState<"all" | "purchase" | "bonus" | "generation" | "admin">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTransactions = useMemo(() => {
    return (paginatedTransactions || []).filter((tx) => {
      if (filterType === "purchase" && tx.type !== "purchase") return false;
      if (filterType === "bonus" && tx.type !== "bonus_granted") return false;
      if (filterType === "generation" && tx.type !== "generation_spend") return false;
      if (filterType === "admin" && tx.type !== "admin_adjustment") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = (tx.description || "").toLowerCase().includes(q);
        const typeMatch = (tx.type || "").toLowerCase().includes(q);
        return descMatch || typeMatch;
      }
      return true;
    });
  }, [paginatedTransactions, filterType, searchQuery]);

  // Estatísticas acumuladas do extrato
  const stats = useMemo(() => {
    let totalPurchased = 0;
    let totalBonus = 0;
    let totalSpent = 0;

    (paginatedTransactions || []).forEach((tx) => {
      if (tx.type === "purchase") totalPurchased += tx.amount;
      else if (tx.type === "bonus_granted") totalBonus += tx.amount;
      else if (tx.type === "generation_spend") totalSpent += Math.abs(tx.amount);
    });

    return { totalPurchased, totalBonus, totalSpent };
  }, [paginatedTransactions]);

  const claimBonusMutation = useMutation(api.credits.claimDailyBonus);
  const createOrderMutation = useMutation(api.credits.createPendingOrder);
  const updateAutoTopUpMutation = useMutation(api.credits.updateAutoTopUpSettings);

  // Feature Flags do sistema em tempo real
  const { isEnabled, isMaintenanceMode } = useFeatureFlags();
  const isPixEnabled = isEnabled("payments_pix");
  const isCardEnabled = isEnabled("payments_card");
  const isAutoTopUpEnabled = isEnabled("auto_topup");
  const isDailyBonusEnabled = isEnabled("daily_bonus");
  const isCustomRechargeEnabled = isEnabled("custom_recharge");

  // Feedback e Toasts
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Timer em tempo real para contagem regressiva de bônus diário
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Controle de Abas Ativas (Recarregar, Auto Top-up, Extrato)
  const [activeTab, setActiveTab] = useState<string>("buy");

  // Estado da Recarga: Escolha entre Reais (R$) e Créditos (CR)
  const minDeposit = creditsInfo?.minCustomDepositBrl ?? 5.0;
  const creditPrice = creditsInfo?.customCreditPriceBrl ?? 0.25;

  const [inputMode, setInputMode] = useState<"brl" | "credits">("brl");
  const [customAmount, setCustomAmount] = useState<number>(50);
  const [customCreditsInput, setCustomCreditsInput] = useState<number>(200);

  // Sincronização ao alterar valor em Reais
  const handleAmountBrlChange = (val: number) => {
    const safeVal = Math.max(0, val);
    setCustomAmount(safeVal);
    setCustomCreditsInput(Math.floor(safeVal / creditPrice));
  };

  // Sincronização ao alterar quantidade de Créditos desejados
  const handleCreditsDesiredChange = (credits: number) => {
    const safeCredits = Math.max(0, credits);
    setCustomCreditsInput(safeCredits);
    const calculatedBrl = Number((safeCredits * creditPrice).toFixed(2));
    setCustomAmount(calculatedBrl);
  };

  // Cálculos dinâmicos de créditos e bônus progressivos
  const isCustomValid = customAmount >= minDeposit && customAmount <= 50000;
  const baseCredits = Math.floor(Math.max(0, customAmount) / creditPrice);

  let bonusPct = 0;
  if (customAmount >= 250) bonusPct = 25;
  else if (customAmount >= 100) bonusPct = 15;
  else if (customAmount >= 50) bonusPct = 10;

  const bonusCredits = Math.round((baseCredits * bonusPct) / 100);
  const totalCustomCredits = baseCredits + bonusCredits;
  const costPerCredit = totalCustomCredits > 0 ? customAmount / totalCustomCredits : creditPrice;

  // Próximo patamar de bônus para gamificação e incentivo de ticket
  const nextTierInfo = useMemo(() => {
    if (customAmount < 50) {
      return {
        target: 50,
        pct: 10,
        diff: 50 - customAmount,
        message: `Faltam R$ ${(50 - customAmount).toFixed(2)} para desbloquear +10% de Bônus Grátis!`,
        progress: (customAmount / 50) * 100,
      };
    }
    if (customAmount < 100) {
      return {
        target: 100,
        pct: 15,
        diff: 100 - customAmount,
        message: `Faltam R$ ${(100 - customAmount).toFixed(2)} para subir para +15% de Bônus Grátis!`,
        progress: ((customAmount - 50) / 50) * 100,
      };
    }
    if (customAmount < 250) {
      return {
        target: 250,
        pct: 25,
        diff: 250 - customAmount,
        message: `Faltam R$ ${(250 - customAmount).toFixed(2)} para atingir o Bônus Máximo (+25%)!`,
        progress: ((customAmount - 100) / 150) * 100,
      };
    }
    return {
      target: 250,
      pct: 25,
      diff: 0,
      message: `🎉 Bônus Máximo Ativado! Você está recebendo +25% de créditos adicionais grátis.`,
      progress: 100,
    };
  }, [customAmount]);

  // Projeção estimada de renders com base nos créditos calculados
  const estimatedWanVideos = Math.max(0, Math.floor(totalCustomCredits / 25));
  const estimatedHunyuanVideos = Math.max(0, Math.floor(totalCustomCredits / 60));
  const estimatedFluxImages = Math.max(0, Math.floor(totalCustomCredits / 2));
  const estimated4kUpscales = Math.max(0, Math.floor(totalCustomCredits / 5));

  // Autonomia estimada com o saldo atual do estúdio
  const currentWanVideos = creditsInfo ? Math.floor(creditsInfo.totalCredits / 25) : 0;
  const currentFluxImages = creditsInfo ? Math.floor(creditsInfo.totalCredits / 2) : 0;

  // Contagem regressiva do Bônus Diário
  const bonusCooldown = useMemo(() => {
    if (!creditsInfo?.lastDailyBonusAt) return null;
    const nextClaimTime = creditsInfo.lastDailyBonusAt + 24 * 60 * 60 * 1000;
    const diff = nextClaimTime - now;
    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const progressPct = Math.min(100, Math.max(0, ((24 * 3600 * 1000 - diff) / (24 * 3600 * 1000)) * 100));

    return {
      formatted: `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`,
      progressPct,
    };
  }, [creditsInfo?.lastDailyBonusAt, now]);

  // Estado de Auto Top-up
  const [autoTopUpActive, setAutoTopUpActive] = useState<boolean>(false);
  const [autoTopUpThreshold, setAutoTopUpThreshold] = useState<number>(20);
  const [autoTopUpAmount, setAutoTopUpAmount] = useState<number>(50);
  const [isSavingAutoTopUp, setIsSavingAutoTopUp] = useState<boolean>(false);

  useEffect(() => {
    if (creditsInfo) {
      setAutoTopUpActive(creditsInfo.autoTopUpEnabled ?? false);
      setAutoTopUpThreshold(creditsInfo.autoTopUpThreshold ?? 20);
      setAutoTopUpAmount(creditsInfo.autoTopUpAmountBrl ?? 50);
    }
  }, [creditsInfo?.autoTopUpEnabled, creditsInfo?.autoTopUpThreshold, creditsInfo?.autoTopUpAmountBrl]);

  // Regra: Só permite ligar o Auto Top-up se houver cartão cadastrado e feature flag ativa
  const handleToggleAutoTopUp = (enabled: boolean) => {
    if (enabled && !isAutoTopUpEnabled) {
      setFeedback({
        type: "error",
        message: "O sistema de Auto Top-up está temporariamente desativado pela administração.",
      });
      return;
    }
    if (enabled && !creditsInfo?.autoTopUpCardLast4) {
      setFeedback({
        type: "error",
        message: "Para ativar o Auto Top-up, você precisa vincular um cartão de crédito. Realize uma recarga com cartão marcando a opção de vinculação.",
      });
      return;
    }
    setAutoTopUpActive(enabled);
  };

  // Estado do Modal de Checkout Mercado Pago
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethodTab, setPaymentMethodTab] = useState<"pix" | "card">("pix");
  const [checkoutItem, setCheckoutItem] = useState<{
    name: string;
    amountBrl: number;
    creditsBase: number;
    creditsBonus: number;
    creditsTotal: number;
    packageSlug?: string;
  } | null>(null);

  // Estado do Pagamento PIX
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
    ticketUrl?: string;
    orderId?: Id<"creditOrders">;
  } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "approved" | "rejected">("pending");

  // Estado do Pagamento por Cartão de Crédito
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardCpf, setCardCpf] = useState("");
  const [cardInstallments, setCardInstallments] = useState(1);
  const [saveCardForAutoTopUp, setSaveCardForAutoTopUp] = useState(true);

  // Resgate de Bônus Diário
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);

  const cardBrandInfo = detectCardBrand(cardNumber);

  // Polling automático seguro para verificar aprovação do PIX no servidor
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (checkoutModalOpen && pixData?.paymentId && paymentStatus === "pending") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/mercadopago/check-status?paymentId=${pixData.paymentId}`);
          const data = await res.json();

          if (data.isApproved) {
            setPaymentStatus("approved");
            setFeedback({
              type: "success",
              message: "Pagamento confirmado com sucesso! Seus créditos já foram liberados no estúdio.",
            });
          }
        } catch (err) {
          console.error("Erro no polling de status:", err);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [checkoutModalOpen, pixData, paymentStatus]);

  // Abrir modal de checkout para recarga
  const handleOpenCheckout = () => {
    if (isMaintenanceMode) {
      setFeedback({
        type: "error",
        message: "O Estúdio está em manutenção temporária. Recargas de créditos estão pausadas no momento.",
      });
      return;
    }
    if (!isCustomRechargeEnabled) {
      setFeedback({
        type: "error",
        message: "Recargas de valor personalizado estão temporariamente desativadas pela administração.",
      });
      return;
    }
    if (!isCustomValid) return;
    setCheckoutItem({
      name: `Recarga Personalizada (R$ ${customAmount.toFixed(2)})`,
      amountBrl: customAmount,
      creditsBase: baseCredits,
      creditsBonus: bonusCredits,
      creditsTotal: totalCustomCredits,
      packageSlug: "custom_deposit",
    });
    setPixData(null);
    setPaymentStatus("pending");
    setPaymentMethodTab(isPixEnabled ? "pix" : "card");
    setCheckoutModalOpen(true);
  };

  // Gerar cobrança PIX
  const handleGeneratePix = async () => {
    if (!isPixEnabled) {
      setFeedback({
        type: "error",
        message: "Recargas via PIX estão temporariamente em manutenção.",
      });
      return;
    }
    if (!checkoutItem) return;
    setIsGeneratingPix(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/mercadopago/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountBrl: checkoutItem.amountBrl,
          creditsBase: checkoutItem.creditsBase,
          creditsBonus: checkoutItem.creditsBonus,
          packageSlug: checkoutItem.packageSlug,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha ao gerar cobrança PIX.");
      }

      // Registrar pedido pendente no Convex
      const orderId = await createOrderMutation({
        amountBrl: checkoutItem.amountBrl,
        creditsBase: checkoutItem.creditsBase,
        creditsBonus: checkoutItem.creditsBonus,
        creditsTotal: checkoutItem.creditsTotal,
        packageSlug: checkoutItem.packageSlug,
        paymentMethod: "pix",
        mpPaymentId: data.paymentId,
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
        ticketUrl: data.ticketUrl,
      });

      setPixData({
        paymentId: data.paymentId,
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
        ticketUrl: data.ticketUrl,
        orderId,
      });
      setPaymentStatus("pending");
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao conectar com o gateway de pagamento seguro.",
      });
    } finally {
      setIsGeneratingPix(false);
    }
  };

  // Processar pagamento com Cartão de Crédito
  const handleProcessCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCardEnabled) {
      setFeedback({
        type: "error",
        message: "Recargas via Cartão de Crédito estão temporariamente em manutenção.",
      });
      return;
    }
    if (!checkoutItem) return;

    setIsProcessingCard(true);
    setFeedback(null);

    try {
      const cleanNum = cardNumber.replace(/\D/g, "");
      const cleanCpf = cardCpf.replace(/\D/g, "");
      const [expMonth, expYear] = cardExpiry.split("/");

      if (cleanNum.length < 13 || cleanNum.length > 19) {
        throw new Error("Digite um número de cartão de crédito válido (13 a 19 dígitos).");
      }
      if (!cardholderName.trim()) {
        throw new Error("Informe o nome do titular exatamente como impresso no cartão.");
      }
      if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
        throw new Error("Informe a validade do cartão no formato MM/AA.");
      }
      const expMonthNum = parseInt(expMonth, 10);
      if (expMonthNum < 1 || expMonthNum > 12) {
        throw new Error("Mês de validade inválido.");
      }
      if (cardCvv.length < 3 || cardCvv.length > 4) {
        throw new Error("Código de segurança (CVV) inválido (3 ou 4 dígitos).");
      }
      if (cleanCpf.length !== 11) {
        throw new Error("Informe um CPF válido com 11 dígitos para autorização antifraude bancária.");
      }

      // Registrar pedido pendente no Convex antes de enviar para o Mercado Pago
      const orderId = await createOrderMutation({
        amountBrl: checkoutItem.amountBrl,
        creditsBase: checkoutItem.creditsBase,
        creditsBonus: checkoutItem.creditsBonus,
        creditsTotal: checkoutItem.creditsTotal,
        packageSlug: checkoutItem.packageSlug,
        paymentMethod: "credit_card",
        cardLast4: cleanNum.slice(-4),
        cardBrand: cardBrandInfo.brand,
        installments: cardInstallments,
      });

      const res = await fetch("/api/mercadopago/create-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amountBrl: checkoutItem.amountBrl,
          creditsBase: checkoutItem.creditsBase,
          creditsBonus: checkoutItem.creditsBonus,
          packageSlug: checkoutItem.packageSlug || "custom_deposit",
          cardNumber: cleanNum,
          cardholderName: cardholderName.trim(),
          expirationMonth: expMonth,
          expirationYear: expYear,
          securityCode: cardCvv,
          cpf: cleanCpf,
          installments: cardInstallments,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Transação não autorizada pela operadora do cartão.");
      }

      if (data.isApproved || data.status === "approved") {
        if (saveCardForAutoTopUp) {
          await updateAutoTopUpMutation({
            enabled: true,
            threshold: autoTopUpThreshold,
            amountBrl: autoTopUpAmount,
            cardLast4: data.cardLast4,
            cardBrand: data.cardBrand,
          });
        }

        setPaymentStatus("approved");
        setFeedback({
          type: "success",
          message: `Pagamento com cartão aprovado! +${checkoutItem.creditsTotal} créditos foram adicionados ao seu estúdio.`,
        });
      } else if (data.status === "in_process") {
        setFeedback({
          type: "success",
          message: "Pagamento em análise pela operadora do cartão. Seus créditos serão liberados em instantes.",
        });
        setCheckoutModalOpen(false);
      } else {
        throw new Error("Transação recusada pela operadora do cartão. Verifique os dados ou tente via PIX.");
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Não foi possível concluir a cobrança no cartão.",
      });
    } finally {
      setIsProcessingCard(false);
    }
  };

  // Copiar código PIX copia e cola
  const handleCopyPix = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  // Salvar configurações de Auto Top-up
  const handleSaveAutoTopUp = async () => {
    if (autoTopUpActive && !isAutoTopUpEnabled) {
      setFeedback({
        type: "error",
        message: "O sistema de Auto Top-up está temporariamente desativado pela administração.",
      });
      return;
    }
    setIsSavingAutoTopUp(true);
    setFeedback(null);
    try {
      await updateAutoTopUpMutation({
        enabled: autoTopUpActive,
        threshold: autoTopUpThreshold,
        amountBrl: autoTopUpAmount,
        cardLast4: creditsInfo?.autoTopUpCardLast4,
        cardBrand: creditsInfo?.autoTopUpCardBrand,
      });

      setFeedback({
        type: "success",
        message: autoTopUpActive
          ? `Auto Top-up configurado! Recarga de R$ ${autoTopUpAmount.toFixed(2)} sempre que o saldo cair para ${autoTopUpThreshold} créditos. Bônus diário dobrado para 10 cr/dia!`
          : "Auto Top-up desativado. Você continuará utilizando seu saldo atual manualmente.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao salvar configurações de Auto Top-up.",
      });
    } finally {
      setIsSavingAutoTopUp(false);
    }
  };

  // Resgatar Bônus Diário
  const handleClaimBonus = async () => {
    if (!isDailyBonusEnabled) {
      setFeedback({
        type: "error",
        message: "O bônus diário está temporariamente desativado pela administração.",
      });
      return;
    }
    setIsClaimingBonus(true);
    setFeedback(null);
    try {
      const res = await claimBonusMutation({});
      setFeedback({
        type: "success",
        message: `Parabéns! Você resgatou +${res.bonusAdded} créditos diários gratuitos do Estúdio Ativo.`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Não foi possível resgatar o bônus agora.",
      });
    } finally {
      setIsClaimingBonus(false);
    }
  };

  if (!creditsInfo) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4 rounded-3xl bg-[#0C0D12]/70 border border-white/10 backdrop-blur-xl">
        <div className="relative">
          <div className="size-14 rounded-full border-2 border-[#FF5500]/20 border-t-[#FF5500] animate-spin" />
          <Coins className="size-6 text-[#FF5500] absolute top-4 left-4" />
        </div>
        <p className="text-xs font-mono text-neutral-400">Sincronizando saldo e créditos do estúdio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerta de Notificação / Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-mono border flex items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="size-4 shrink-0 text-rose-400" />
            )}
            <span className="leading-relaxed">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-white cursor-pointer transition-colors p-1"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Alerta de Modo Manutenção Geral */}
      {isMaintenanceMode && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-white">
                Estúdio em Manutenção Preventiva Programada
              </p>
              <p className="text-xs text-amber-200/90 font-sans mt-0.5">
                Operações financeiras e recargas estão temporariamente em pausa técnica pela administração. Seus créditos e tarefas continuam protegidos.
              </p>
            </div>
          </div>
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] shrink-0 uppercase">
            Manutenção Ativa
          </Badge>
        </div>
      )}

      {/* Hero: Saldo Disponível & Estúdio Ativo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Saldo Disponível para Criação */}
        <Card className="bg-gradient-to-br from-[#0D0E15] via-[#131520] to-[#0A0B10] border border-[#FF5500]/40 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FF5500]/15 transition-all duration-500" />

          <CardHeader className="p-6 pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-[#FF5500]" />
                Saldo Disponível para Criação
              </span>
              <div className="p-2 rounded-xl bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 shadow-inner">
                <Coins className="size-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 pt-3">
              <span className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight">
                {creditsInfo.totalCredits}
              </span>
              <span className="text-sm font-mono text-[#FF5500] font-bold">créditos</span>
            </div>

            {/* Medidor visual de autonomia do estúdio */}
            <div className="pt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>Autonomia do Estúdio:</span>
                <span className="text-emerald-400 font-bold">
                  {creditsInfo.totalCredits >= 100
                    ? "Excelente Autonomia"
                    : creditsInfo.totalCredits >= 20
                    ? "Estúdio Operacional"
                    : "Saldo Baixo"}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    creditsInfo.totalCredits >= 100
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                      : creditsInfo.totalCredits >= 20
                      ? "bg-gradient-to-r from-amber-500 to-[#FF5500]"
                      : "bg-rose-500"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(8, (creditsInfo.totalCredits / 200) * 100))}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-neutral-500 block">
                Autonomia estimada: ~{currentWanVideos} vídeos Wan 2.1 ou {currentFluxImages} imagens FLUX.1
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-3 relative z-10">
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <span className="text-neutral-400 block text-[10px]">Créditos Pagos:</span>
                <span className="text-white font-bold text-xs">{creditsInfo.paidCredits} cr</span>
                <span className="text-[9px] text-emerald-400 block font-sans">Sem expiração ∞</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <span className="text-neutral-400 block text-[10px]">Bônus & Promo:</span>
                <span className="text-amber-400 font-bold text-xs">+{creditsInfo.bonusCredits} cr</span>
                <span className="text-[9px] text-neutral-400 block font-sans">Recompensas ativas</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenCheckout}
              className="w-full border-white/10 hover:border-[#FF5500]/50 hover:bg-[#FF5500]/10 text-white text-xs font-heading font-bold uppercase tracking-wider h-9 rounded-xl cursor-pointer transition-all"
            >
              Adicionar Mais Créditos
              <ArrowUpRight className="size-3.5 ml-1 text-[#FF5500]" />
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Estúdio Ativo & Bônus Diário (Mecânica com Countdown e 2X VIP) */}
        <Card className="lg:col-span-2 bg-[#0C0D12]/95 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <CardHeader className="p-6 pb-2 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Flame className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-heading font-bold uppercase tracking-tight text-white flex items-center gap-2">
                    Programa Estúdio Ativo
                  </CardTitle>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Recompensa diária recorrente para criadores frequentes
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {creditsInfo.autoTopUpEnabled ? (
                  <Badge className="bg-gradient-to-r from-amber-400 via-amber-300 to-[#FF5500] text-black font-black border border-amber-300 text-[10px] font-mono gap-1.5 py-1 px-3 shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                    <Sparkles className="size-3.5 text-black fill-black" />
                    BÔNUS VIP DOBRADO (+10 CR/DIA)
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono gap-1 py-1 px-2.5">
                    <Sparkles className="size-3" />
                    BÔNUS PADRÃO (+5 CR/DIA)
                  </Badge>
                )}

                {creditsInfo.minBalanceEligible ? (
                  <Badge className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono py-1 px-2">
                    ESTÚDIO QUALIFICADO
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px] font-mono py-1 px-2">
                    MÍNIMO: {creditsInfo.minBalanceRequired} CR
                  </Badge>
                )}
              </div>
            </div>

            <CardDescription className="text-xs text-neutral-400 font-sans mt-3">
              {creditsInfo.autoTopUpEnabled ? (
                <span>
                  Com o <strong className="text-white">Auto Top-up ativo</strong>, seu estúdio recebe <strong className="text-amber-400">+10 créditos bônus grátis</strong> a cada 24 horas (o dobro do padrão de 5 créditos)!
                </span>
              ) : (
                <span>
                  Mantenha um saldo mínimo de <strong className="text-white">{creditsInfo.minBalanceRequired} créditos</strong> para receber <strong className="text-white">+5 créditos diários grátis</strong>. 
                  <span className="text-cyan-400 block sm:inline sm:ml-1">
                    Ative o Auto Top-up para dobrar seu bônus diário para 10 créditos!
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("auto_topup");
                        setTimeout(() => {
                          const el = document.getElementById("main-credits-tabs");
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }, 40);
                      }}
                      className="ml-1.5 underline hover:text-white font-bold cursor-pointer inline-flex items-center gap-0.5"
                    >
                      Configurar
                      <ArrowRight className="size-3" />
                    </button>
                  </span>
                </span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-3 relative z-10 space-y-3">
            {/* Box Interativo com Status e Ação */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Gift className="size-4 text-amber-400 shrink-0" />
                  <p className="text-xs font-heading font-bold text-white">
                    {creditsInfo.minBalanceEligible
                      ? creditsInfo.canClaimDailyBonus
                        ? `Seu bônus diário de +${creditsInfo.dailyBonusAmount} créditos está pronto para resgate!`
                        : "Bônus diário já resgatado nas últimas 24 horas."
                      : `Mantenha pelo menos ${creditsInfo.minBalanceRequired} créditos para desbloquear as recompensas diárias.`}
                  </p>
                </div>

                {/* Feedback em tempo real com cronômetro */}
                {creditsInfo.minBalanceEligible && !creditsInfo.canClaimDailyBonus && bonusCooldown && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3 text-cyan-400" />
                        Próximo resgate disponível em:
                      </span>
                      <span className="text-cyan-400 font-bold">{bonusCooldown.formatted}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                        style={{ width: `${bonusCooldown.progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {!creditsInfo.minBalanceEligible && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>Progresso para qualificação:</span>
                      <span className="text-amber-400 font-bold">
                        {creditsInfo.totalCredits} / {creditsInfo.minBalanceRequired} cr
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (creditsInfo.totalCredits / creditsInfo.minBalanceRequired) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-neutral-500 font-sans">
                      Adicione {creditsInfo.minBalanceRequired - creditsInfo.totalCredits} créditos para ativar o fluxo de bônus diário contínuo.
                    </p>
                  </div>
                )}
              </div>

              {/* Botão de Resgate de Bônus Diário */}
              {creditsInfo.minBalanceEligible ? (
                <Button
                  type="button"
                  disabled={!creditsInfo.canClaimDailyBonus || isClaimingBonus || !isDailyBonusEnabled}
                  onClick={handleClaimBonus}
                  className={`text-xs font-heading font-bold uppercase tracking-wider h-11 px-6 rounded-xl shrink-0 transition-all ${
                    !isDailyBonusEnabled
                      ? "bg-white/5 text-neutral-500 border border-white/10 cursor-not-allowed"
                      : creditsInfo.canClaimDailyBonus
                      ? "bg-gradient-to-r from-amber-500 via-[#FF5500] to-amber-500 hover:opacity-95 text-white shadow-[0_0_25px_rgba(255,85,0,0.4)] hover:scale-105 animate-pulse cursor-pointer"
                      : "bg-white/5 text-neutral-500 border border-white/10 cursor-not-allowed"
                  }`}
                >
                  {isClaimingBonus ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : !isDailyBonusEnabled ? (
                    <span>Bônus em Manutenção</span>
                  ) : (
                    <>
                      <Sparkles className="size-4 mr-1.5 text-amber-200" />
                      Resgatar +{creditsInfo.dailyBonusAmount} Bônus
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const neededCredits = Math.max(1, creditsInfo.minBalanceRequired - creditsInfo.totalCredits);
                    const neededBrl = Number((neededCredits * creditPrice).toFixed(2));
                    const finalBrl = Math.max(minDeposit, neededBrl);
                    handleAmountBrlChange(finalBrl);
                    setActiveTab("buy");
                    document.getElementById("recharge-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase h-10 px-5 rounded-xl cursor-pointer shrink-0"
                >
                  Completar Saldo Mínimo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principais de Gerenciamento de Créditos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} id="main-credits-tabs" className="space-y-6">
        <TabsList className="bg-[#0C0D12] border border-white/10 p-1.5 rounded-2xl flex flex-wrap gap-2 shadow-lg">
          <TabsTrigger value="buy" className="flex items-center gap-2 text-xs py-2 px-4 rounded-xl cursor-pointer">
            <Coins className="size-3.5 text-[#FF5500]" />
            Recarregar Saldo
          </TabsTrigger>
          <TabsTrigger value="auto_topup" className="flex items-center gap-2 text-xs py-2 px-4 rounded-xl cursor-pointer">
            <Sliders className="size-3.5 text-cyan-400" />
            Auto Top-up (Recarga Automática)
            {creditsInfo.autoTopUpEnabled ? (
              <Badge className="bg-amber-500/20 text-amber-400 border-none text-[9px] font-mono px-1.5 py-0">
                10 CR/DIA
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="ledger" className="flex items-center gap-2 text-xs py-2 px-4 rounded-xl cursor-pointer">
            <History className="size-3.5 text-neutral-400" />
            Extrato de Consumo ({paginatedTransactions?.length ?? 0}{paginationStatus === "CanLoadMore" ? "+" : ""})
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* ABA 1: ABASTECIMENTO FLEXÍVEL (ESCOLHA ENTRE REAIS OU CRÉDITOS)            */}
        {/* ========================================================================= */}
        <TabsContent value="buy" id="recharge-section" className="space-y-6">
          <Card className="bg-gradient-to-br from-[#0C0D12] via-[#10121A] to-[#0C0D12] border border-[#FF5500]/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-full bg-[#FF5500]/5 blur-3xl pointer-events-none" />

            <CardHeader className="p-6 pb-4 border-b border-white/10 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30 shadow-md">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-heading font-black uppercase tracking-tight text-white">
                      Abastecimento Flexível do Estúdio
                    </CardTitle>
                    <p className="text-xs text-neutral-400 font-sans mt-0.5">
                      Defina o investimento em Reais (R$) ou a quantidade exata de créditos que deseja renderizar.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Segmented Control: Em Reais vs Em Créditos */}
                  <div className="flex rounded-xl bg-white/[0.05] p-1 border border-white/10 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setInputMode("brl")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold uppercase transition-all cursor-pointer ${
                        inputMode === "brl"
                          ? "bg-[#FF5500] text-white shadow-md"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Em Reais (R$)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("credits")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold uppercase transition-all cursor-pointer ${
                        inputMode === "credits"
                          ? "bg-[#FF5500] text-white shadow-md"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Em Créditos (CR)
                    </button>
                  </div>

                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono py-1.5 px-3">
                    MÍNIMO R$ {minDeposit.toFixed(2)}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 relative z-10">
              {/* Seletor Dinâmico com base no Modo de Entrada */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300">
                    {inputMode === "brl"
                      ? "Escolha ou Digite um Valor em Reais:"
                      : "Escolha ou Digite a Quantidade de Créditos:"}
                  </label>

                  {/* Chips Rápidos de Seleção */}
                  {inputMode === "brl" ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { val: 15, label: "R$ 15" },
                        { val: 30, label: "R$ 30" },
                        { val: 50, label: "R$ 50 (+10%)" },
                        { val: 100, label: "R$ 100 (+15%)" },
                        { val: 250, label: "R$ 250 (+25%)" },
                        { val: 500, label: "R$ 500 (+25%)" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleAmountBrlChange(item.val)}
                          className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                            customAmount === item.val
                              ? "bg-[#FF5500] text-white font-bold shadow-[0_0_15px_rgba(255,85,0,0.4)] scale-105"
                              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { cr: 60, label: "60 cr" },
                        { cr: 120, label: "120 cr" },
                        { cr: 200, label: "200 cr (+10%)" },
                        { cr: 400, label: "400 cr (+15%)" },
                        { cr: 1000, label: "1000 cr (+25%)" },
                        { cr: 2000, label: "2000 cr (+25%)" },
                      ].map((item) => (
                        <button
                          key={item.cr}
                          type="button"
                          onClick={() => handleCreditsDesiredChange(item.cr)}
                          className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                            customCreditsInput === item.cr
                              ? "bg-[#FF5500] text-white font-bold shadow-[0_0_15px_rgba(255,85,0,0.4)] scale-105"
                              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input com Slider Interativo */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-5 space-y-3">
                    <div className="relative">
                      {inputMode === "brl" ? (
                        <>
                          <span className="absolute left-4 top-3 text-base font-mono font-bold text-neutral-400">
                            R$
                          </span>
                          <Input
                            type="number"
                            step="1"
                            min={minDeposit}
                            max={50000}
                            value={customAmount}
                            onChange={(e) => handleAmountBrlChange(Number(e.target.value))}
                            className="pl-12 bg-[#050506] border-white/20 text-white font-mono font-black text-2xl rounded-2xl h-14 focus:border-[#FF5500] shadow-inner"
                            placeholder="0.00"
                          />
                        </>
                      ) : (
                        <>
                          <Input
                            type="number"
                            step="10"
                            min={Math.ceil(minDeposit / creditPrice)}
                            max={200000}
                            value={customCreditsInput}
                            onChange={(e) => handleCreditsDesiredChange(Number(e.target.value))}
                            className="pr-20 bg-[#050506] border-white/20 text-white font-mono font-black text-2xl rounded-2xl h-14 focus:border-[#FF5500] shadow-inner"
                            placeholder="100"
                          />
                          <span className="absolute right-4 top-4 text-xs font-mono font-bold text-neutral-400 uppercase">
                            créditos
                          </span>
                        </>
                      )}
                    </div>

                    {/* Range Slider Elegante */}
                    <div className="px-1 space-y-1.5">
                      <input
                        type="range"
                        min={minDeposit}
                        max={500}
                        step={5}
                        value={customAmount}
                        onChange={(e) => handleAmountBrlChange(Number(e.target.value))}
                        className="w-full accent-[#FF5500] bg-white/10 rounded-lg h-2 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                        <span>R$ 5</span>
                        <span className={customAmount >= 50 ? "text-emerald-400 font-bold" : ""}>R$ 50 (+10%)</span>
                        <span className={customAmount >= 100 ? "text-emerald-400 font-bold" : ""}>R$ 100 (+15%)</span>
                        <span className={customAmount >= 250 ? "text-emerald-400 font-bold" : ""}>R$ 250 (+25%)</span>
                        <span>R$ 500</span>
                      </div>
                    </div>

                    {/* Barra de Progresso de Meta de Bônus */}
                    {isCustomValid && (
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-neutral-400 flex items-center gap-1">
                            <Sparkles className="size-3 text-amber-400" />
                            {nextTierInfo.message}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-[#FF5500] rounded-full transition-all duration-300"
                            style={{ width: `${nextTierInfo.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resumo da Conversão & Botão de Pagamento */}
                  <div className="md:col-span-7 flex flex-wrap items-center justify-between gap-4 bg-white/[0.03] border border-white/10 p-5 sm:p-6 rounded-2xl shadow-xl">
                    {!isCustomValid ? (
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-mono py-1">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Valor mínimo de recarga: R$ {minDeposit.toFixed(2)} ({Math.ceil(minDeposit / creditPrice)} créditos).</span>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-heading font-black text-white">
                              {totalCustomCredits} créditos
                            </span>
                            {bonusPct > 0 && (
                              <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono py-0.5">
                                +{bonusPct}% BÔNUS (+{bonusCredits} cr grátis)
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs font-mono text-neutral-400 space-x-2">
                            <span>Investimento: <strong>R$ {customAmount.toFixed(2)}</strong></span>
                            <span>•</span>
                            <span>Custo real: <strong>~R$ {costPerCredit.toFixed(3)}/cr</strong></span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          disabled={!isCustomRechargeEnabled || isMaintenanceMode}
                          onClick={handleOpenCheckout}
                          className={`font-heading font-bold text-xs uppercase tracking-wider h-12 px-7 rounded-xl transition-all ${
                            !isCustomRechargeEnabled || isMaintenanceMode
                              ? "bg-white/10 text-neutral-400 cursor-not-allowed border border-white/10"
                              : "bg-[#FF5500] hover:bg-[#FF5500]/90 text-white shadow-[0_0_25px_rgba(255,85,0,0.4)] hover:scale-105 cursor-pointer"
                          }`}
                        >
                          {!isCustomRechargeEnabled
                            ? "Recarga Personalizada em Pausa"
                            : isMaintenanceMode
                            ? "Estúdio em Manutenção"
                            : `Recarregar R$ ${customAmount.toFixed(2)}`}
                          {isCustomRechargeEnabled && !isMaintenanceMode && <ArrowRight className="size-4 ml-1.5" />}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Régua de Bônus Progressivos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
                  <div className={`p-3 rounded-xl border transition-all ${customAmount < 50 ? "bg-[#FF5500]/10 border-[#FF5500]/40 text-white shadow-sm" : "bg-white/[0.02] border-white/5 text-neutral-500"}`}>
                    <span className="block font-bold">R$ 5 a R$ 49</span>
                    <span className="text-[10px] text-neutral-400">Taxa base padrão</span>
                  </div>
                  <div className={`p-3 rounded-xl border transition-all ${customAmount >= 50 && customAmount < 100 ? "bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm" : "bg-white/[0.02] border-white/5 text-neutral-500"}`}>
                    <span className="block font-bold text-emerald-400">+10% de Bônus</span>
                    <span className="text-[10px] text-neutral-400">A partir de R$ 50 (200 cr)</span>
                  </div>
                  <div className={`p-3 rounded-xl border transition-all ${customAmount >= 100 && customAmount < 250 ? "bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm" : "bg-white/[0.02] border-white/5 text-neutral-500"}`}>
                    <span className="block font-bold text-emerald-400">+15% de Bônus</span>
                    <span className="text-[10px] text-neutral-400">A partir de R$ 100 (400 cr)</span>
                  </div>
                  <div className={`p-3 rounded-xl border transition-all ${customAmount >= 250 ? "bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm" : "bg-white/[0.02] border-white/5 text-neutral-500"}`}>
                    <span className="block font-bold text-emerald-400">+25% de Bônus Máximo</span>
                    <span className="text-[10px] text-neutral-400">A partir de R$ 250 (1000 cr)</span>
                  </div>
                </div>

                {/* Projeção de Renders com os Modelos de IA */}
                {isCustomValid && (
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <span className="text-xs font-heading font-bold text-neutral-300 uppercase tracking-wider block">
                      Capacidade Estimada de Renderização Com Esse Saldo:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-sans">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="p-2 rounded-lg bg-[#FF5500]/15 text-[#FF5500]">
                          <Film className="size-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">~{estimatedWanVideos} vídeos Wan 2.1</span>
                          <span className="text-[10px] text-neutral-400">720p 14B Cinema (~25 cr)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
                          <Zap className="size-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">~{estimatedHunyuanVideos} vídeos Hunyuan</span>
                          <span className="text-[10px] text-neutral-400">1080p Ultra HD (~60 cr)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
                          <Sparkles className="size-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">~{estimatedFluxImages} imagens FLUX.1</span>
                          <span className="text-[10px] text-neutral-400">Ultra-realismo (~2 cr)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
                          <Layers className="size-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">~{estimated4kUpscales} upscales 4K</span>
                          <span className="text-[10px] text-neutral-400">RIFE 60fps & 4K (~5 cr)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Destaque / Banner para Auto Top-up */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#0C0D12] to-amber-950/20 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
                <Sliders className="size-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-heading font-bold text-white uppercase tracking-tight">
                    Criação Contínua Sem Risco de Paradas
                  </p>
                  <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono">
                    DOBRA O BÔNUS DIÁRIO
                  </Badge>
                </div>
                <p className="text-xs text-neutral-400 font-sans">
                  Ative o Auto Top-up para evitar que suas criações de vídeos e imagens parem por saldo insuficiente e <strong>receba 10 créditos diários grátis</strong> (o dobro de 5 cr).
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setActiveTab("auto_topup");
                setTimeout(() => {
                  const el = document.getElementById("main-credits-tabs");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 40);
              }}
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 text-xs font-heading font-bold uppercase rounded-xl shrink-0 cursor-pointer h-10 px-5"
            >
              Configurar Auto Top-up (+10 cr/dia)
              <ArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* ABA 2: AUTO TOP-UP (RECARGA AUTOMÁTICA INTELIGENTE COM REGRA DE CARTÃO)    */}
        {/* ========================================================================= */}
        <TabsContent value="auto_topup" id="auto-topup-section" className="space-y-6">
          <Card className="bg-[#0C0D12]/95 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-3xl pointer-events-none" />

            <CardHeader className="p-6 pb-4 border-b border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Sliders className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-heading font-black uppercase tracking-tight text-white flex items-center gap-2">
                      Auto Top-up Inteligente
                      {autoTopUpActive ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                          ATIVADO (+10 CR/DIA)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-white/10 text-neutral-400 text-[10px] font-mono">
                          DESATIVADO
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-xs text-neutral-400 font-sans mt-0.5">
                      Garante que suas criações de vídeos e imagens não parem por saldo insuficiente e dobra sua recompensa diária para 10 créditos grátis.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!creditsInfo.autoTopUpCardLast4 && (
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px] font-mono gap-1">
                      <Lock className="size-3" />
                      REQUER CARTÃO
                    </Badge>
                  )}
                  <label className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300">
                    {autoTopUpActive ? "Status: Ligado" : "Status: Desligado"}
                  </label>
                  <button
                    type="button"
                    disabled={!isAutoTopUpEnabled}
                    onClick={() => handleToggleAutoTopUp(!autoTopUpActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      !isAutoTopUpEnabled
                        ? "bg-white/10 opacity-50 cursor-not-allowed"
                        : autoTopUpActive
                        ? "bg-emerald-500 cursor-pointer"
                        : "bg-white/20 cursor-pointer"
                    } ${!creditsInfo.autoTopUpCardLast4 ? "opacity-75" : ""}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        autoTopUpActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {!isAutoTopUpEnabled && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                  <span>O sistema de Auto Top-up está temporariamente desativado para calibração pela administração. Suas preferências salvas continuam guardadas.</span>
                </div>
              )}
              {/* Alerta de Vantagem VIP */}
              <div className="p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Flame className="size-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-heading font-bold text-white uppercase">
                      Bônus Diário Dobrado (10 Créditos/Dia)
                    </p>
                    <p className="text-[11px] text-neutral-300 font-sans">
                      Ao manter o Auto Top-up ligado, você ganha <strong>10 créditos diários</strong> a cada 24 horas no programa Estúdio Ativo (em vez de 5 cr).
                    </p>
                  </div>
                </div>
                <Badge className="bg-amber-500 text-black font-heading font-black text-[10px] uppercase shrink-0 px-2.5 py-0.5">
                  2X BÔNUS
                </Badge>
              </div>

              {/* Seletor de Limiar de Ativação (Threshold) */}
              <div className="space-y-3">
                <label className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <TrendingDown className="size-4 text-cyan-400" />
                  1. Disparar Recarga Quando o Saldo Ficar Abaixo De:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { th: 10, label: "Mínimo absoluto" },
                    { th: 20, label: "Garante Estúdio Ativo" },
                    { th: 50, label: "Fluxos moderados" },
                    { th: 100, label: "Grandes produções" },
                  ].map((item) => (
                    <button
                      key={item.th}
                      type="button"
                      onClick={() => setAutoTopUpThreshold(item.th)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        autoTopUpThreshold === item.th
                          ? "bg-cyan-500/15 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                          : "bg-white/[0.02] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span className="text-sm font-heading font-bold text-white block">
                        {item.th} créditos
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seletor de Valor da Recarga Automática */}
              <div className="space-y-3">
                <label className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-400" />
                  2. Valor da Recarga a Ser Processada:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { amount: 25, credits: 100, bonus: 0 },
                    { amount: 50, credits: 220, bonus: 10 },
                    { amount: 100, credits: 460, bonus: 15 },
                    { amount: 200, credits: 920, bonus: 15 },
                  ].map((item) => (
                    <button
                      key={item.amount}
                      type="button"
                      onClick={() => setAutoTopUpAmount(item.amount)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        autoTopUpAmount === item.amount
                          ? "bg-[#FF5500]/15 border-[#FF5500]/60 shadow-[0_0_15px_rgba(255,85,0,0.2)]"
                          : "bg-white/[0.02] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-heading font-bold text-white">
                          R$ {item.amount}
                        </span>
                        {item.bonus > 0 && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[9px] font-mono px-1.5 py-0">
                            +{item.bonus}%
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                        +{item.credits} créditos
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status do Cartão Vinculado & Regra de Habilitação */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="size-4 text-cyan-400" />
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-white">
                      Cartão Cadastrado para Cobrança Automática
                    </span>
                  </div>
                  {creditsInfo.autoTopUpCardLast4 ? (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                      CARTÃO CONECTADO
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-rose-500/30 text-rose-400 text-[10px] font-mono">
                      NENHUM CARTÃO VINCULADO
                    </Badge>
                  )}
                </div>

                {creditsInfo.autoTopUpCardLast4 ? (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10">
                    <div className="flex items-center gap-3.5">
                      <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center font-mono text-xs uppercase font-bold text-white border border-white/10">
                        {creditsInfo.autoTopUpCardBrand || "CC"}
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-white">
                          •••• •••• •••• {creditsInfo.autoTopUpCardLast4}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-sans">
                          Processamento seguro com tokenização PCI-DSS Nível 1
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPaymentMethodTab("card");
                        handleOpenCheckout();
                      }}
                      className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                    >
                      Trocar Cartão
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 space-y-2">
                    <p className="text-xs text-rose-300 font-sans">
                      <strong>Cartão de crédito obrigatório:</strong> O Auto Top-up só pode ser ligado quando houver um cartão cadastrado na conta.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setPaymentMethodTab("card");
                        handleOpenCheckout();
                      }}
                      className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase h-8 px-4 rounded-xl cursor-pointer"
                    >
                      Recarregar com Cartão e Vincular
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Botão Salvar Preferências */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  disabled={isSavingAutoTopUp || (autoTopUpActive && !isAutoTopUpEnabled)}
                  onClick={handleSaveAutoTopUp}
                  className={`font-heading font-bold text-xs uppercase tracking-wider h-11 px-7 rounded-xl transition-all ${
                    autoTopUpActive && !isAutoTopUpEnabled
                      ? "bg-white/10 text-neutral-400 cursor-not-allowed border border-white/10"
                      : "bg-cyan-500 hover:bg-cyan-600 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 cursor-pointer"
                  }`}
                >
                  {isSavingAutoTopUp ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : autoTopUpActive && !isAutoTopUpEnabled ? (
                    <span>Auto Top-up em Pausa</span>
                  ) : (
                    <>
                      <CheckCheck className="size-4 mr-1.5" />
                      Salvar Preferências de Auto Top-up
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* ABA 3: EXTRATO DE CONSUMO & MOVIMENTAÇÕES (AUDITORIA E BUSCA)              */}
        {/* ========================================================================= */}
        <TabsContent value="ledger" className="space-y-4">
          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader className="p-6 pb-4 border-b border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-heading font-bold uppercase tracking-tight text-white flex items-center gap-2">
                    <History className="size-4 text-[#FF5500]" />
                    Histórico de Transações & Criações
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-400 font-sans mt-0.5">
                    Transparência completa com paginação e busca: acompanhe cada crédito adquirido, bônus recebido e créditos utilizados em suas criações.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-white/10 text-neutral-400 text-xs font-mono">
                    {filteredTransactions.length} de {paginatedTransactions?.length ?? 0} carregados
                  </Badge>
                </div>
              </div>

              {/* Estatísticas Rápidas do Extrato */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400">Total Comprado:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">+{stats.totalPurchased} cr</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400">Total Bônus Resgatado:</span>
                  <span className="text-xs font-mono font-bold text-amber-400">+{stats.totalBonus} cr</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400">Gasto em Renders:</span>
                  <span className="text-xs font-mono font-bold text-rose-400">-{stats.totalSpent} cr</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400">Saldo Atual:</span>
                  <span className="text-xs font-mono font-bold text-white">{creditsInfo.totalCredits} cr</span>
                </div>
              </div>

              {/* Filtros e Barra de Busca */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <div className="relative flex-1">
                  <Search className="size-3.5 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Filtrar por descrição, modelo (Wan, Hunyuan) ou tipo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-[#050506] border-white/10 text-neutral-300 font-mono text-xs h-9 rounded-xl focus:border-[#FF5500]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-neutral-500 hover:text-white cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtros por Categoria */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "all", label: "Todos" },
                    { id: "purchase", label: "Compras" },
                    { id: "bonus", label: "Bônus" },
                    { id: "generation", label: "Renders" },
                    { id: "admin", label: "Ajustes" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilterType(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        filterType === f.id
                          ? "bg-white/15 text-white font-bold border border-white/20"
                          : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08090C] text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Data & Horário</th>
                    <th className="py-3 px-3">Tipo de Operação</th>
                    <th className="py-3 px-3">Variação</th>
                    <th className="py-3 px-3">Saldo Resultante</th>
                    <th className="py-3 px-4">Descrição da Atividade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginationStatus === "LoadingFirstPage" ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-neutral-400 font-mono text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="size-4 animate-spin text-[#FF5500]" />
                          <span>Carregando movimentações do estúdio...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-neutral-500 font-mono text-xs">
                        {searchQuery || filterType !== "all"
                          ? "Nenhuma movimentação corresponde aos filtros selecionados."
                          : "Nenhuma movimentação de créditos registrada ainda."}
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px] whitespace-nowrap">
                          {new Date(tx.timestamp).toLocaleString("pt-BR")}
                        </td>

                        <td className="py-3.5 px-3 font-mono whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 uppercase ${
                              tx.type === "purchase"
                                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                : tx.type === "bonus_granted"
                                ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                                : tx.type === "generation_spend"
                                ? "border-blue-500/40 text-blue-400 bg-blue-500/10"
                                : "border-white/10 text-neutral-300"
                            }`}
                          >
                            {tx.type === "purchase"
                              ? "Compra"
                              : tx.type === "bonus_granted"
                              ? "Bônus"
                              : tx.type === "generation_spend"
                              ? "Render"
                              : tx.type}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-3 font-mono font-bold whitespace-nowrap">
                          <span className={tx.amount > 0 ? "text-emerald-400" : "text-rose-400"}>
                            {tx.amount > 0 ? `+${tx.amount}` : tx.amount} cr
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-white font-medium whitespace-nowrap">
                          {tx.balanceAfter} cr
                        </td>

                        <td className="py-3.5 px-4 font-sans text-neutral-300">
                          {tx.description}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Barra Inferior de Paginação e Status */}
              <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#08090C]/60">
                <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                  <span>
                    Total Carregado: <strong>{paginatedTransactions?.length ?? 0}</strong> movimentações
                  </span>
                  {paginationStatus === "Exhausted" && (
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                      FIM DO HISTÓRICO
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {paginationStatus === "CanLoadMore" && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isTransactionsLoading}
                        onClick={() => loadMore(15)}
                        className="border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 text-xs font-mono h-8 rounded-xl cursor-pointer"
                      >
                        {isTransactionsLoading ? (
                          <Loader2 className="size-3.5 animate-spin mr-1.5" />
                        ) : (
                          <RefreshCw className="size-3 mr-1.5" />
                        )}
                        Carregar Mais (15)
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isTransactionsLoading}
                        onClick={() => loadMore(50)}
                        className="border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 text-xs font-mono h-8 rounded-xl cursor-pointer"
                      >
                        {isTransactionsLoading ? (
                          <Loader2 className="size-3.5 animate-spin mr-1.5" />
                        ) : (
                          <RefreshCw className="size-3 mr-1.5" />
                        )}
                        Carregar Mais (50)
                      </Button>
                    </>
                  )}

                  {paginationStatus === "LoadingMore" && (
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 py-1">
                      <Loader2 className="size-3.5 animate-spin text-[#FF5500]" />
                      <span>Buscando registros anteriores...</span>
                    </div>
                  )}

                  {paginationStatus === "Exhausted" && (
                    <span className="text-[11px] font-mono text-neutral-500">
                      Todas as movimentações foram carregadas.
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* MODAL: PAGAMENTO SEGURO MERCADO PAGO (PIX & CARTÃO DE CRÉDITO)            */}
      {/* ========================================================================= */}
      {checkoutModalOpen && checkoutItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0C0D12] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header do Pagamento */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF5500]/20 text-[#FF5500]">
                  <Wallet className="size-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-white uppercase text-sm">
                    Pagamento Seguro
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    Ambiente Blindado 256-bit • Liberação Imediata de Créditos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Resumo do Pedido */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-sans">Item Selecionado:</span>
                <span className="text-white font-heading font-bold">{checkoutItem.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-sans">Créditos a Liberar:</span>
                <span className="text-[#FF5500] font-mono font-bold">
                  +{checkoutItem.creditsTotal} créditos
                </span>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-sans text-neutral-300">Total do Investimento:</span>
                <span className="text-2xl font-heading font-black text-white">
                  R$ {checkoutItem.amountBrl.toFixed(2)}
                </span>
              </div>

              {/* Seletor rápido de valor no modal */}
              {paymentStatus === "pending" && !pixData && (
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase block">
                    Escolha ou ajuste o valor da recarga:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[15, 30, 50, 100, 250, 500].map((val) => {
                      const bCredits = Math.floor(val / creditPrice);
                      let bPct = 0;
                      if (val >= 250) bPct = 25;
                      else if (val >= 100) bPct = 15;
                      else if (val >= 50) bPct = 10;
                      const bBonus = Math.round((bCredits * bPct) / 100);
                      const bTotal = bCredits + bBonus;

                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            handleAmountBrlChange(val);
                            setCheckoutItem({
                              name: `Recarga Personalizada (R$ ${val.toFixed(2)})`,
                              amountBrl: val,
                              creditsBase: bCredits,
                              creditsBonus: bBonus,
                              creditsTotal: bTotal,
                              packageSlug: "custom_deposit",
                            });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                            checkoutItem.amountBrl === val
                              ? "bg-[#FF5500] text-white font-bold shadow-md"
                              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          R$ {val} {bPct > 0 ? `(+${bPct}%)` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Status do Pagamento Aprovado */}
            {paymentStatus === "approved" ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-7" />
                </div>
                <h4 className="font-heading font-bold text-white uppercase text-base">
                  Pagamento Confirmado!
                </h4>
                <p className="text-xs text-neutral-300 font-sans">
                  Sua recarga de <strong>{checkoutItem.creditsTotal} créditos</strong> já foi adicionada ao saldo do seu estúdio.
                </p>
                <Button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-heading font-bold text-xs uppercase px-6 h-10 rounded-xl mt-2 cursor-pointer"
                >
                  Continuar Criando
                </Button>
              </div>
            ) : pixData ? (
              /* QR Code e Pix Copia e Cola Gerados */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center space-y-3">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-heading font-bold text-white uppercase tracking-wider">
                    <QrCode className="size-4 text-[#FF5500]" />
                    <span>Pague via PIX com Qualquer Banco</span>
                  </div>

                  {/* QR Code Imagem */}
                  {pixData.qrCodeBase64 ? (
                    <div className="size-48 p-2 rounded-xl bg-white mx-auto flex items-center justify-center shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                        alt="QR Code PIX Instantâneo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="size-48 bg-white/5 rounded-xl mx-auto flex items-center justify-center text-xs text-neutral-400">
                      QR Code não disponível
                    </div>
                  )}

                  {/* Campo Copia e Cola */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      Ou utilize o código Copia e Cola:
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={pixData.qrCode}
                        className="bg-[#050506] border-white/15 text-neutral-300 font-mono text-[11px] h-9 rounded-xl truncate"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCopyPix}
                        className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs h-9 px-3 rounded-xl shrink-0 cursor-pointer"
                      >
                        {copiedPix ? (
                          <>
                            <Check className="size-3.5 mr-1" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5 mr-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Status em tempo real */}
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-mono text-neutral-400">
                  <Loader2 className="size-3.5 animate-spin text-[#FF5500]" />
                  <span>Aguardando pagamento no app do seu banco... Liberação imediata.</span>
                </div>
              </div>
            ) : (
              /* Abas de Escolha do Método de Pagamento (PIX vs Cartão) */
              <div className="space-y-4">
                <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => isPixEnabled && setPaymentMethodTab("pix")}
                    disabled={!isPixEnabled}
                    className={`flex-1 py-2 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                      !isPixEnabled
                        ? "opacity-50 cursor-not-allowed text-neutral-500"
                        : paymentMethodTab === "pix"
                        ? "bg-[#FF5500] text-white shadow-md cursor-pointer"
                        : "text-neutral-400 hover:text-white cursor-pointer"
                    }`}
                  >
                    <QrCode className="size-3.5" />
                    <span>PIX Instantâneo</span>
                    {!isPixEnabled && <span className="text-[9px] font-mono text-amber-400">(Pausa)</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => isCardEnabled && setPaymentMethodTab("card")}
                    disabled={!isCardEnabled}
                    className={`flex-1 py-2 rounded-lg text-xs font-heading font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                      !isCardEnabled
                        ? "opacity-50 cursor-not-allowed text-neutral-500"
                        : paymentMethodTab === "card"
                        ? "bg-[#FF5500] text-white shadow-md cursor-pointer"
                        : "text-neutral-400 hover:text-white cursor-pointer"
                    }`}
                  >
                    <CreditCard className="size-3.5" />
                    <span>Cartão de Crédito</span>
                    {!isCardEnabled && <span className="text-[9px] font-mono text-amber-400">(Pausa)</span>}
                  </button>
                </div>

                {!isPixEnabled && !isCardEnabled && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                    <span>Os canais de recarga estão temporariamente em manutenção pela administração.</span>
                  </div>
                )}

                {/* Opção 1: PIX */}
                {paymentMethodTab === "pix" && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center">
                          <QrCode className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-heading font-bold text-white">
                            PIX com Confirmação em Segundos
                          </p>
                          <p className="text-[10px] text-neutral-400 font-sans">
                            Disponível 24/7 com liberação imediata de créditos.
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono">
                        INSTANTÂNEO
                      </Badge>
                    </div>

                    <Button
                      type="button"
                      disabled={isGeneratingPix}
                      onClick={handleGeneratePix}
                      className="w-full bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase tracking-wider h-11 rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.3)] cursor-pointer"
                    >
                      {isGeneratingPix ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <QrCode className="size-4 mr-2" />
                          Gerar QR Code PIX (R$ {checkoutItem.amountBrl.toFixed(2)})
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Opção 2: Cartão de Crédito */}
                {paymentMethodTab === "card" && (
                  <form onSubmit={handleProcessCard} className="space-y-3">
                    {/* Visualização de Cartão Mockup */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-neutral-900 to-[#141620] border border-white/10 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">
                          Cartão Selecionado
                        </span>
                        <p className="font-mono text-xs text-white tracking-widest">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </p>
                        <p className="text-[10px] font-mono text-neutral-400 uppercase">
                          {cardholderName || "NOME DO TITULAR"} • {cardExpiry || "MM/AA"}
                        </p>
                      </div>
                      <div className={`font-mono text-xs uppercase font-extrabold ${cardBrandInfo.color}`}>
                        {cardBrandInfo.label}
                      </div>
                    </div>

                    {/* Número do Cartão */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-heading font-bold uppercase tracking-wider text-neutral-300">
                          Número do Cartão
                        </label>
                        <span className={`text-[10px] font-mono font-bold ${cardBrandInfo.color}`}>
                          {cardBrandInfo.label}
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          type="text"
                          required
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, "").slice(0, 16);
                            const formatted = clean.replace(/(\d{4})(?=\d)/g, "$1 ");
                            setCardNumber(formatted);
                          }}
                          className="bg-[#050506] border-white/15 text-white font-mono text-xs h-10 rounded-xl"
                        />
                        <CreditCard className="size-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    {/* Nome do Titular */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-heading font-bold uppercase tracking-wider text-neutral-300">
                        Nome Impresso no Cartão
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="NOME COMO NO CARTÃO"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                        className="bg-[#050506] border-white/15 text-white font-mono text-xs h-10 rounded-xl uppercase"
                      />
                    </div>

                    {/* Validade, CVV e CPF */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-heading font-bold uppercase tracking-wider text-neutral-300">
                          Validade (MM/AA)
                        </label>
                        <Input
                          type="text"
                          required
                          placeholder="12/28"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                            if (val.length >= 3) {
                              val = `${val.slice(0, 2)}/${val.slice(2)}`;
                            }
                            setCardExpiry(val);
                          }}
                          className="bg-[#050506] border-white/15 text-white font-mono text-xs h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-heading font-bold uppercase tracking-wider text-neutral-300">
                          CVV
                        </label>
                        <Input
                          type="password"
                          required
                          placeholder="123"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          className="bg-[#050506] border-white/15 text-white font-mono text-xs h-10 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* CPF do Titular */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-heading font-bold uppercase tracking-wider text-neutral-300">
                        CPF do Titular
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        maxLength={14}
                        value={cardCpf}
                        onChange={(e) => setCardCpf(formatCpf(e.target.value))}
                        className="bg-[#050506] border-white/15 text-white font-mono text-xs h-10 rounded-xl"
                      />
                    </div>

                    {/* Parcelas */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-heading font-bold uppercase tracking-wider text-neutral-300">
                        Opções de Parcelamento
                      </label>
                      <select
                        value={cardInstallments}
                        onChange={(e) => setCardInstallments(Number(e.target.value))}
                        className="w-full bg-[#050506] border border-white/15 text-white font-mono text-xs h-10 rounded-xl px-3 outline-none focus:border-[#FF5500]"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
                          const val = checkoutItem.amountBrl / n;
                          return (
                            <option key={n} value={n} className="bg-[#0C0D12] text-white">
                              {n === 1
                                ? `1x de R$ ${checkoutItem.amountBrl.toFixed(2)} (à vista sem juros)`
                                : `${n}x de R$ ${val.toFixed(2)}`}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Checkbox Auto Top-up */}
                    <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-cyan-500/[0.05] border border-cyan-500/20 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={saveCardForAutoTopUp}
                        onChange={(e) => setSaveCardForAutoTopUp(e.target.checked)}
                        className="rounded border-white/20 text-cyan-400 focus:ring-0 mt-0.5"
                      />
                      <span className="text-[11px] font-sans text-neutral-300">
                        Vincular este cartão ao <strong>Auto Top-up</strong> para recargas automáticas e <strong>dobrar meu bônus diário para 10 créditos</strong>.
                      </span>
                    </label>

                    {/* Botão de Pagamento Cartão */}
                    <Button
                      type="submit"
                      disabled={isProcessingCard}
                      className="w-full bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase tracking-wider h-11 rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.3)] cursor-pointer mt-2"
                    >
                      {isProcessingCard ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          <span>Processando Cartão com Antifraude...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="size-4" />
                          <span>Pagar R$ {checkoutItem.amountBrl.toFixed(2)} no Cartão</span>
                        </div>
                      )}
                    </Button>
                  </form>
                )}

                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500 pt-1">
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                  <span>Criptografia bancária de ponta a ponta 256-bit • PCI-DSS Nível 1</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
