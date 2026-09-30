"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Coins,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Sparkles,
  ShieldAlert,
  User,
  Package,
  FileText,
  X,
  RefreshCw,
  Gift,
  CreditCard,
  History,
  Sliders,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { AdminNavBar } from "./admin-nav-bar";

export function CreditsView() {
  const adminStatus = useQuery(api.admin.getCurrentAdminStatus);
  const isAuthorized = Boolean(adminStatus?.isAdmin);

  // Queries
  const packages = useQuery(api.adminCredits.listPackages, isAuthorized ? {} : "skip");
  const pricingOverview = useQuery(api.adminPricing.getPricingOverview, isAuthorized ? {} : "skip");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEligible, setFilterEligible] = useState("all");

  const userCreditsList = useQuery(
    api.adminCredits.listUserCredits,
    isAuthorized
      ? {
          search: searchTerm || undefined,
          filterEligible: filterEligible !== "all" ? filterEligible : undefined,
        }
      : "skip"
  );

  const globalTransactions = useQuery(
    api.adminCredits.listGlobalTransactions,
    isAuthorized ? { limit: 50 } : "skip"
  );

  // Mutations
  const upsertPackageMutation = useMutation(api.adminCredits.upsertPackage);
  const deletePackageMutation = useMutation(api.adminCredits.deletePackage);
  const togglePackageMutation = useMutation(api.adminCredits.togglePackageActive);
  const seedPackagesMutation = useMutation(api.adminCredits.seedDefaultPackages);
  const adjustUserCreditsMutation = useMutation(api.adminCredits.adjustUserCredits);
  const updateSettingsMutation = useMutation(api.adminPricing.updatePricingSettings);

  // Estados de Notificação
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Recarga Customizada em Valor Livre (Mínimo de R$ 5,00)
  const [customTestAmount, setCustomTestAmount] = useState<number>(15);
  const [isCustomSettingsOpen, setIsCustomSettingsOpen] = useState(false);
  const [customSettingsForm, setCustomSettingsForm] = useState({
    minCustomDepositBrl: 5.0,
    customCreditPriceBrl: 0.25,
    allowCustomDeposit: true,
  });
  const [isSubmittingCustomSettings, setIsSubmittingCustomSettings] = useState(false);

  // Modal Pacote
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<Id<"creditPackages"> | null>(null);
  const [packageForm, setPackageForm] = useState({
    slug: "",
    name: "",
    creditsBase: 100,
    creditsBonus: 0,
    priceBrl: 29.0,
    priceUsd: 5.9,
    badge: "",
    isPopular: false,
    isActive: true,
    sortOrder: 1,
    featuresText: "",
  });
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);

  // Modal Ajuste de Créditos do Usuário
  const [adjustingUser, setAdjustingUser] = useState<any | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    operation: "add" as "add" | "deduct",
    creditType: "paid" as "paid" | "bonus",
    amount: 50,
    notes: "",
  });
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // Modal Extrato / Histórico do Usuário
  const [viewingUserLedger, setViewingUserLedger] = useState<any | null>(null);
  const userTransactions = useQuery(
    api.adminCredits.getUserTransactions,
    viewingUserLedger ? { clerkId: viewingUserLedger.clerkId } : "skip"
  );

  // Loading
  if (adminStatus === undefined) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="size-8 animate-spin text-[#FF5500]" />
        <p className="text-xs font-mono text-neutral-400">Verificando credenciais...</p>
      </div>
    );
  }

  // Não autorizado
  if (!adminStatus.isAdmin) {
    return (
      <Card className="bg-[#0C0D12]/90 border border-rose-500/30 shadow-2xl backdrop-blur-xl max-w-xl mx-auto my-12 text-center p-8 space-y-4">
        <div className="size-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="size-8" />
        </div>
        <h3 className="font-heading text-xl uppercase font-bold text-white">
          Acesso Restrito
        </h3>
        <p className="text-xs text-neutral-400 font-sans">
          A gestão de pacotes e tesouraria de créditos é restrita a administradores.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" className="border-white/15 text-white hover:bg-white/10 text-xs">
            Voltar ao Início
          </Button>
        </Link>
      </Card>
    );
  }

  // Abertura do Modal de Pacote (Criar)
  const handleOpenCreatePackage = () => {
    setEditingPackageId(null);
    setPackageForm({
      slug: "",
      name: "",
      creditsBase: 100,
      creditsBonus: 0,
      priceBrl: 29.0,
      priceUsd: 5.9,
      badge: "",
      isPopular: false,
      isActive: true,
      sortOrder: (packages?.length || 0) + 1,
      featuresText: "Acesso a todos os workflows ComfyUI\nCréditos sem expiração\nAtiva Estúdio para bônus diário",
    });
    setIsPackageModalOpen(true);
  };

  // Abertura do Modal de Pacote (Editar)
  const handleOpenEditPackage = (pkg: any) => {
    setEditingPackageId(pkg._id.startsWith("fallback") ? null : pkg._id);
    setPackageForm({
      slug: pkg.slug,
      name: pkg.name,
      creditsBase: pkg.creditsBase,
      creditsBonus: pkg.creditsBonus,
      priceBrl: pkg.priceBrl,
      priceUsd: pkg.priceUsd,
      badge: pkg.badge || "",
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
      sortOrder: pkg.sortOrder,
      featuresText: (pkg.features || []).join("\n"),
    });
    setIsPackageModalOpen(true);
  };

  // Salvar Pacote
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmittingPackage(true);
    try {
      const features = packageForm.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      await upsertPackageMutation({
        id: editingPackageId || undefined,
        slug: packageForm.slug,
        name: packageForm.name,
        creditsBase: Number(packageForm.creditsBase),
        creditsBonus: Number(packageForm.creditsBonus),
        priceBrl: Number(packageForm.priceBrl),
        priceUsd: Number(packageForm.priceUsd),
        badge: packageForm.badge.trim() || undefined,
        isPopular: packageForm.isPopular,
        isActive: packageForm.isActive,
        sortOrder: Number(packageForm.sortOrder),
        features,
      });

      setIsPackageModalOpen(false);
      setFeedback({ type: "success", message: `Pacote "${packageForm.name}" salvo com sucesso!` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao salvar pacote." });
    } finally {
      setIsSubmittingPackage(false);
    }
  };

  // Excluir Pacote
  const handleDeletePackage = async (id: Id<"creditPackages">, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o pacote "${name}"?`)) return;
    try {
      await deletePackageMutation({ id });
      setFeedback({ type: "success", message: `Pacote "${name}" excluído com sucesso.` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao excluir." });
    }
  };

  // Recarregar Pacotes Padrão
  const handleSeedPackages = async () => {
    try {
      await seedPackagesMutation({});
      setFeedback({ type: "success", message: "Pacotes padrões de créditos inicializados na base!" });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao inicializar pacotes." });
    }
  };

  // Abrir Modal de Ajuste de Crédito
  const handleOpenAdjustUser = (user: any) => {
    setAdjustingUser(user);
    setAdjustForm({
      operation: "add",
      creditType: "paid",
      amount: 50,
      notes: "",
    });
  };

  // Submeter Ajuste de Crédito
  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;
    setFeedback(null);
    setIsSubmittingAdjust(true);
    try {
      await adjustUserCreditsMutation({
        userId: adjustingUser.clerkId,
        amount: Number(adjustForm.amount),
        creditType: adjustForm.creditType,
        operation: adjustForm.operation,
        notes: adjustForm.notes,
      });
      setFeedback({
        type: "success",
        message: `Ajuste de créditos para ${adjustingUser.name} aplicado com sucesso!`,
      });
      setAdjustingUser(null);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao aplicar ajuste de créditos.",
      });
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  // Parâmetros da Recarga em Valor Livre (mínimo de R$ 5,00)
  const minDeposit = (pricingOverview?.settings as any)?.minCustomDepositBrl ?? 5.0;
  const creditPrice = (pricingOverview?.settings as any)?.customCreditPriceBrl ?? 0.25;
  const allowCustom = (pricingOverview?.settings as any)?.allowCustomDeposit ?? true;

  const handleOpenCustomSettings = () => {
    setCustomSettingsForm({
      minCustomDepositBrl: minDeposit,
      customCreditPriceBrl: creditPrice,
      allowCustomDeposit: allowCustom,
    });
    setIsCustomSettingsOpen(true);
  };

  const handleSaveCustomSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmittingCustomSettings(true);
    try {
      const currentSettings = pricingOverview?.settings;
      await updateSettingsMutation({
        usdToBrlRate: currentSettings?.usdToBrlRate ?? 5.8,
        fixedGpu48gbMonthlyUsd: currentSettings?.fixedGpu48gbMonthlyUsd ?? 800,
        fixedGpu80gbMonthlyUsd: currentSettings?.fixedGpu80gbMonthlyUsd ?? 1800,
        minBalanceForDailyBonus: currentSettings?.minBalanceForDailyBonus ?? 20,
        dailyBonusCredits: currentSettings?.dailyBonusCredits ?? 5,
        minCustomDepositBrl: Number(customSettingsForm.minCustomDepositBrl),
        customCreditPriceBrl: Number(customSettingsForm.customCreditPriceBrl),
        allowCustomDeposit: Boolean(customSettingsForm.allowCustomDeposit),
      });
      setIsCustomSettingsOpen(false);
      setFeedback({ type: "success", message: "Regras de recarga em valor livre atualizadas com sucesso!" });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao salvar regras." });
    } finally {
      setIsSubmittingCustomSettings(false);
    }
  };

  // Cálculos do simulador de valor livre
  const isCustomValid = customTestAmount >= minDeposit;
  const baseCreditsCalculated = Math.floor(Math.max(0, customTestAmount) / creditPrice);
  let bonusPercentage = 0;
  if (customTestAmount >= 250) bonusPercentage = 25;
  else if (customTestAmount >= 100) bonusPercentage = 15;
  else if (customTestAmount >= 50) bonusPercentage = 10;

  const bonusCreditsCalculated = Math.round((baseCreditsCalculated * bonusPercentage) / 100);
  const totalCustomCredits = baseCreditsCalculated + bonusCreditsCalculated;
  const costPerCreditCustom = totalCustomCredits > 0 ? customTestAmount / totalCustomCredits : creditPrice;

  return (
    <div className="space-y-6">
      {/* Sub-navegação interna de Administrador */}
      <AdminNavBar currentTab="credits" />

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-mono border flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <AlertTriangle className="size-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Tabs Principais da Tesouraria */}
      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="bg-[#0C0D12] border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="packages" className="flex items-center gap-2 text-xs">
            <Package className="size-3.5" />
            Pacotes de Créditos (Loja)
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2 text-xs">
            <Coins className="size-3.5" />
            Créditos por Usuário (CRUD & Auditoria)
          </TabsTrigger>
          <TabsTrigger value="ledger" className="flex items-center gap-2 text-xs">
            <History className="size-3.5" />
            Livro-Razão Global ({globalTransactions?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* ABA 1: CRUD DE PACOTES DE CRÉDITOS                                        */}
        {/* ========================================================================= */}
        <TabsContent value="packages" className="space-y-6">
          {/* Card Especial de Recarga em Valor Livre (Mínimo de R$ 5,00) */}
          <Card className="bg-gradient-to-r from-[#0C0D12] via-[#12141C] to-[#0C0D12] border border-[#FF5500]/40 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-full bg-[#FF5500]/5 blur-3xl pointer-events-none" />

            <CardHeader className="p-5 pb-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30">
                    <Sparkles className="size-4" />
                  </div>
                  <CardTitle className="text-base font-heading font-bold uppercase tracking-tight text-white">
                    Recarga em Valor Livre (Escolha pelo Usuário)
                  </CardTitle>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                    MÍNIMO R$ {minDeposit.toFixed(2)}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-neutral-400 font-sans mt-1">
                  O criador não precisa ficar preso a pacotes fixos. Ele pode recarregar qualquer quantia a partir de <strong>R$ {minDeposit.toFixed(2)}</strong> via PIX ou cartão, recebendo créditos proporcionais com bonificação progressiva automática.
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenCustomSettings}
                className="border-white/15 text-white hover:bg-white/10 text-xs h-8 rounded-xl cursor-pointer shrink-0"
              >
                <Sliders className="size-3.5 mr-1.5 text-[#FF5500]" />
                Configurar Regras (R$ 5 mín)
              </Button>
            </CardHeader>

            <CardContent className="p-5 space-y-4 relative z-10">
              {/* Simulador Interativo do Administrador */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-200">
                      Simulador de Conversão em Tempo Real
                    </span>
                    <p className="text-[11px] text-neutral-400 font-sans">
                      Digite qualquer quantia para testar a entrega de créditos ao criador:
                    </p>
                  </div>

                  {/* Chips rápidos de teste */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[5, 15, 30, 50, 100, 250].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCustomTestAmount(val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          customTestAmount === val
                            ? "bg-[#FF5500] text-white font-bold shadow-[0_0_12px_rgba(255,85,0,0.3)]"
                            : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        R$ {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
                  {/* Input do valor */}
                  <div className="md:col-span-4 relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-neutral-400">
                      R$
                    </span>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      value={customTestAmount}
                      onChange={(e) => setCustomTestAmount(Number(e.target.value))}
                      className="pl-9 bg-[#050506] border-white/15 text-white font-mono font-bold text-sm rounded-xl h-10 focus:border-[#FF5500]"
                      placeholder="Valor livre em R$"
                    />
                  </div>

                  {/* Output da conversão */}
                  <div className="md:col-span-8 flex flex-wrap items-center gap-3 bg-white/[0.03] border border-white/5 p-2.5 rounded-xl">
                    {!isCustomValid ? (
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-mono">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Valor abaixo do mínimo permitido de R$ {minDeposit.toFixed(2)}.</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Coins className="size-4 text-[#FF5500]" />
                          <span className="font-heading font-black text-white text-base">
                            {totalCustomCredits} créditos
                          </span>
                        </div>

                        {bonusPercentage > 0 ? (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                            +{bonusPercentage}% bônus ({bonusCreditsCalculated} cr grátis)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-neutral-400 border-white/10 text-[10px] font-mono">
                            {baseCreditsCalculated} créditos base
                          </Badge>
                        )}

                        <span className="text-[11px] font-mono text-neutral-400 ml-auto">
                          R$ {costPerCreditCustom.toFixed(3)} / crédito
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cabeçalho da Seção de Pacotes Sugeridos */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0C0D12]/90 border border-white/10 p-4 rounded-xl">
            <div>
              <h3 className="font-heading font-bold text-sm text-white uppercase tracking-tight">
                Sugestões de Recarga Rápida (Pacotes Comerciais)
              </h3>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                Opções pré-configuradas em 1 clique para checkout rápido dos criadores.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSeedPackages}
                className="border-white/15 text-neutral-300 hover:text-white text-xs h-9 rounded-xl cursor-pointer"
              >
                <RefreshCw className="size-3 mr-1.5" />
                Restaurar Padrões
              </Button>
              <Button
                type="button"
                onClick={handleOpenCreatePackage}
                className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase h-9 rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.3)] cursor-pointer"
              >
                <Plus className="size-4 mr-1.5" />
                Novo Pacote
              </Button>
            </div>
          </div>

          {/* Grid de Pacotes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(packages || []).map((pkg) => {
              const totalCredits = pkg.creditsBase + pkg.creditsBonus;
              const costPerCreditBrl = totalCredits > 0 ? pkg.priceBrl / totalCredits : 0;

              return (
                <Card
                  key={pkg.slug}
                  className={`bg-[#0C0D12]/90 border shadow-xl relative overflow-hidden flex flex-col justify-between transition-all group ${
                    pkg.isPopular ? "border-[#FF5500]/50" : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Top Badge */}
                  {pkg.badge && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-[#FF5500] text-white border-none font-mono text-[9px] uppercase px-2 py-0.5">
                        {pkg.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`size-2 rounded-full ${pkg.isActive ? "bg-emerald-400" : "bg-neutral-600"}`} />
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                        slug: {pkg.slug}
                      </span>
                    </div>

                    <CardTitle className="text-lg font-heading font-black text-white">
                      {pkg.name}
                    </CardTitle>

                    {/* Preço */}
                    <div className="pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-heading font-black text-white">
                          R$ {pkg.priceBrl.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          (~${pkg.priceUsd.toFixed(2)} USD)
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-emerald-400 mt-0.5">
                        R$ {costPerCreditBrl.toFixed(3)} / crédito
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    {/* Créditos */}
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-400">Créditos Base:</span>
                        <span className="text-white font-bold">{pkg.creditsBase}</span>
                      </div>
                      {pkg.creditsBonus > 0 && (
                        <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                          <span>Bônus Grátis:</span>
                          <span className="font-bold">+{pkg.creditsBonus}</span>
                        </div>
                      )}
                      <div className="pt-1 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#FF5500] font-bold">
                        <span>Saldo Total:</span>
                        <span>{totalCredits} créditos</span>
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-1.5 text-[11px] text-neutral-400 font-sans">
                      {(pkg.features || []).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="size-3 text-[#FF5500] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Ações */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditPackage(pkg)}
                        className="flex-1 border-white/15 text-white hover:bg-white/10 text-xs h-8 rounded-xl cursor-pointer"
                      >
                        <Edit2 className="size-3 mr-1" />
                        Editar
                      </Button>
                      {!pkg._id.startsWith("fallback") && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePackage(pkg._id, pkg.name)}
                          className="size-8 p-0 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* ABA 2: CRUD DE CRÉDITOS POR USUÁRIO (TESOURARIA & SALDO MÍNIMO)           */}
        {/* ========================================================================= */}
        <TabsContent value="users" className="space-y-4">
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0C0D12]/90 border border-white/10 p-3.5 rounded-xl">
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-3 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuário por nome ou e-mail para auditar saldo..."
                className="pl-9 bg-[#050506] border-white/10 text-white rounded-xl h-10 text-xs focus:border-[#FF5500]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterEligible}
                onChange={(e) => setFilterEligible(e.target.value)}
                className="bg-[#050506] border border-white/15 text-white text-xs rounded-xl h-10 px-3 cursor-pointer outline-none focus:border-[#FF5500]"
              >
                <option value="all">Todos os Status de Saldo</option>
                <option value="eligible">Estúdio Ativo (Saldo ≥ 20)</option>
                <option value="below_min">Abaixo do Mínimo (&lt; 20)</option>
              </select>
            </div>
          </div>

          {/* Tabela de Usuários */}
          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08090C] text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-3">Créditos Pagos</th>
                    <th className="py-3 px-3">Créditos Bônus</th>
                    <th className="py-3 px-3 text-[#FF5500]">Saldo Total</th>
                    <th className="py-3 px-3">Mecânica OpenRouter</th>
                    <th className="py-3 px-4 text-right">Ações de Tesouraria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(userCreditsList || []).map((u) => (
                    <tr key={u.clerkId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 rounded-xl border border-white/15">
                            <AvatarImage src={u.imageUrl} />
                            <AvatarFallback className="text-[10px] font-bold bg-[#FF5500] text-white">
                              {u.name?.slice(0, 2).toUpperCase() || "CR"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-heading font-bold text-white text-xs truncate">
                              {u.name}
                            </p>
                            <p className="text-[10px] text-neutral-500 font-mono truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-white font-medium">{u.paidCredits} cr</span>
                        <span className="text-[10px] text-neutral-500 block">não expiram</span>
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-amber-400 font-medium">+{u.bonusCredits} cr</span>
                        <span className="text-[10px] text-neutral-500 block">bônus/promo</span>
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <div className="flex items-center gap-1.5 text-base font-heading font-black text-[#FF5500]">
                          <Coins className="size-4" />
                          <span>{u.totalCredits}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        {u.minBalanceEligible ? (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono gap-1">
                            <Sparkles className="size-3" />
                            Estúdio Ativo (≥ {u.minBalanceRequired} cr)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-neutral-500 border-white/10 text-[10px] font-mono">
                            Abaixo do Mínimo (&lt; {u.minBalanceRequired} cr)
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleOpenAdjustUser(u)}
                            className="bg-[#FF5500]/15 hover:bg-[#FF5500] text-[#FF5500] hover:text-white border border-[#FF5500]/30 text-xs h-8 px-3 rounded-xl transition-all cursor-pointer font-heading font-bold"
                          >
                            <Coins className="size-3.5 mr-1" />
                            Ajustar Créditos
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingUserLedger(u)}
                            className="border-white/15 text-neutral-300 hover:text-white text-xs h-8 px-2.5 rounded-xl cursor-pointer"
                            title="Ver Extrato de Transações"
                          >
                            <History className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* ABA 3: LIVRO-RAZÃO GLOBAL (AUDITORIA DE TESOURARIA)                       */}
        {/* ========================================================================= */}
        <TabsContent value="ledger" className="space-y-4">
          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader className="p-5 pb-3 border-b border-white/10">
              <CardTitle className="text-sm font-heading font-bold uppercase tracking-tight text-white flex items-center gap-2">
                <History className="size-4 text-[#FF5500]" />
                Auditoria de Transações e Movimentações Financeiras
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400 font-sans">
                Registro imutável de recargas, consumos de renders ComfyUI e ajustes manuais de administradores.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08090C] text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Data & Hora</th>
                    <th className="py-3 px-3">Usuário</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-3">Variação</th>
                    <th className="py-3 px-3">Saldo Resultante</th>
                    <th className="py-3 px-4">Descrição & Auditoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(globalTransactions || []).map((tx) => (
                    <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                        {new Date(tx.timestamp).toLocaleString("pt-BR")}
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        <p className="font-heading font-bold text-white text-xs truncate max-w-[150px]">
                          {tx.userName}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono truncate max-w-[150px]">
                          {tx.userEmail}
                        </p>
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 uppercase ${
                            tx.type === "purchase"
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                              : tx.type === "admin_adjustment"
                              ? "border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10"
                              : "border-blue-500/40 text-blue-400 bg-blue-500/10"
                          }`}
                        >
                          {tx.type}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold">
                        <span
                          className={
                            tx.amount > 0 ? "text-emerald-400" : "text-rose-400"
                          }
                        >
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount} cr
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-white font-medium">
                        {tx.balanceAfter} cr
                      </td>

                      <td className="py-3.5 px-4 font-sans text-xs">
                        <p className="text-neutral-200">{tx.description}</p>
                        {tx.adminNotes && (
                          <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                            {tx.adminNotes}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* MODAL: CRIAR / EDITAR PACOTE DE CRÉDITOS                                   */}
      {/* ========================================================================= */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0C0D12] p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-[#FF5500]" />
                <h3 className="font-heading font-bold text-white uppercase text-sm">
                  {editingPackageId ? "Editar Pacote Comercial" : "Novo Pacote de Créditos"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPackageModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Slug Único</label>
                  <Input
                    required
                    value={packageForm.slug}
                    onChange={(e) => setPackageForm({ ...packageForm, slug: e.target.value })}
                    placeholder="ex: creator-pro"
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Nome Comercial</label>
                  <Input
                    required
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    placeholder="ex: Creator Pro"
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Créditos Base</label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={packageForm.creditsBase}
                    onChange={(e) => setPackageForm({ ...packageForm, creditsBase: Number(e.target.value) })}
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                    Créditos Bônus (Grátis)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={packageForm.creditsBonus}
                    onChange={(e) => setPackageForm({ ...packageForm, creditsBonus: Number(e.target.value) })}
                    className="bg-[#050506] border-emerald-500/30 text-emerald-400 font-bold rounded-xl h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Preço BRL (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={packageForm.priceBrl}
                    onChange={(e) => setPackageForm({ ...packageForm, priceBrl: Number(e.target.value) })}
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Preço USD ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.5"
                    required
                    value={packageForm.priceUsd}
                    onChange={(e) => setPackageForm({ ...packageForm, priceUsd: Number(e.target.value) })}
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Selo / Badge (opcional)</label>
                  <Input
                    value={packageForm.badge}
                    onChange={(e) => setPackageForm({ ...packageForm, badge: e.target.value })}
                    placeholder="ex: Mais Popular"
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Ordem de Exibição</label>
                  <Input
                    type="number"
                    value={packageForm.sortOrder}
                    onChange={(e) => setPackageForm({ ...packageForm, sortOrder: Number(e.target.value) })}
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">
                  Benefícios Inclusos (1 por linha)
                </label>
                <textarea
                  rows={3}
                  value={packageForm.featuresText}
                  onChange={(e) => setPackageForm({ ...packageForm, featuresText: e.target.value })}
                  placeholder="Acesso total a workflows ComfyUI&#10;Fila prioritária&#10;Sem expiração"
                  className="w-full bg-[#050506] border border-white/10 text-white rounded-xl p-2.5 text-xs font-sans outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-neutral-300">
                  <input
                    type="checkbox"
                    checked={packageForm.isPopular}
                    onChange={(e) => setPackageForm({ ...packageForm, isPopular: e.target.checked })}
                    className="size-4 accent-[#FF5500] cursor-pointer"
                  />
                  <span>Destacar como "Mais Popular"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-neutral-300">
                  <input
                    type="checkbox"
                    checked={packageForm.isActive}
                    onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })}
                    className="size-4 accent-[#FF5500] cursor-pointer"
                  />
                  <span>Pacote Ativo</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="border-white/15 text-neutral-400 hover:text-white text-xs h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingPackage}
                  className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase h-9 rounded-xl cursor-pointer"
                >
                  {isSubmittingPackage ? <Loader2 className="size-4 animate-spin" /> : "Salvar Pacote"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AJUSTAR CRÉDITOS DE UM USUÁRIO (CRUD TESOURARIA COM AUDITORIA)     */}
      {/* ========================================================================= */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0C0D12] p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="size-4 text-[#FF5500]" />
                <h3 className="font-heading font-bold text-white uppercase text-sm">
                  Ajuste de Créditos do Usuário
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustingUser(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Resumo do Usuário */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-heading font-bold text-white">{adjustingUser.name}</p>
                <p className="text-[10px] text-neutral-400 font-mono">{adjustingUser.email}</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-neutral-500 uppercase">Saldo Atual</span>
                <p className="text-sm font-bold text-[#FF5500]">{adjustingUser.totalCredits} cr</p>
              </div>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Operação</label>
                  <select
                    value={adjustForm.operation}
                    onChange={(e) =>
                      setAdjustForm({ ...adjustForm, operation: e.target.value as "add" | "deduct" })
                    }
                    className="w-full bg-[#050506] border border-white/15 text-white text-xs rounded-xl h-9 px-3 cursor-pointer outline-none focus:border-[#FF5500]"
                  >
                    <option value="add">Adicionar Créditos (+)</option>
                    <option value="deduct">Deduzir / Estornar (-)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Tipo do Crédito</label>
                  <select
                    value={adjustForm.creditType}
                    onChange={(e) =>
                      setAdjustForm({ ...adjustForm, creditType: e.target.value as "paid" | "bonus" })
                    }
                    className="w-full bg-[#050506] border border-white/15 text-white text-xs rounded-xl h-9 px-3 cursor-pointer outline-none focus:border-[#FF5500]"
                  >
                    <option value="paid">Créditos Pagos (Never Expire)</option>
                    <option value="bonus">Créditos Bônus (Promocionais)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">Quantidade de Créditos</label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={adjustForm.amount}
                  onChange={(e) => setAdjustForm({ ...adjustForm, amount: Number(e.target.value) })}
                  className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">
                  Motivo / Justificativa (Auditoria Obrigatória)
                </label>
                <Input
                  required
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  placeholder="ex: Recarga manual comprovante PIX #4928 ou bonificação de boas-vindas"
                  className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs"
                />
              </div>

              {/* Previsão do Novo Saldo */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400">Novo Saldo Projetado:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {adjustForm.operation === "add"
                    ? adjustingUser.totalCredits + Number(adjustForm.amount)
                    : Math.max(0, adjustingUser.totalCredits - Number(adjustForm.amount))}{" "}
                  créditos
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdjustingUser(null)}
                  className="border-white/15 text-neutral-400 hover:text-white text-xs h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase h-9 rounded-xl cursor-pointer"
                >
                  {isSubmittingAdjust ? <Loader2 className="size-4 animate-spin" /> : "Confirmar Ajuste"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXTRATO / HISTÓRICO DE TRANSAÇÕES DO USUÁRIO                       */}
      {/* ========================================================================= */}
      {viewingUserLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0C0D12] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <History className="size-4 text-[#FF5500]" />
                <h3 className="font-heading font-bold text-white uppercase text-sm">
                  Extrato de Créditos: {viewingUserLedger.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingUserLedger(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {(userTransactions || []).length === 0 ? (
                <div className="text-center py-8 text-neutral-500 font-mono text-xs">
                  Nenhuma movimentação registrada no livro-razão para este criador.
                </div>
              ) : (
                (userTransactions || []).map((tx) => (
                  <div
                    key={tx._id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold ${
                            tx.amount > 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount} cr
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase font-mono border-white/10">
                          {tx.creditType}
                        </Badge>
                      </div>
                      <p className="text-neutral-300 font-sans">{tx.description}</p>
                      {tx.adminNotes && (
                        <p className="text-[10px] font-mono text-neutral-500">{tx.adminNotes}</p>
                      )}
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <span className="text-neutral-400 font-medium">{tx.balanceAfter} cr</span>
                      <p className="text-[9px] text-neutral-500">
                        {new Date(tx.timestamp).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewingUserLedger(null)}
                className="border-white/15 text-neutral-300 hover:text-white text-xs h-8"
              >
                Fechar Extrato
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURAÇÃO DE RECARGA EM VALOR LIVRE (MÍNIMO DE R$ 5,00)         */}
      {/* ========================================================================= */}
      {isCustomSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0C0D12] p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-[#FF5500]" />
                <h3 className="font-heading font-bold text-white uppercase text-sm">
                  Regras de Recarga em Valor Livre
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomSettingsOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomSettings} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">
                  Valor Mínimo Aceito por Recarga (R$)
                </label>
                <Input
                  type="number"
                  step="0.50"
                  min="1"
                  required
                  value={customSettingsForm.minCustomDepositBrl}
                  onChange={(e) =>
                    setCustomSettingsForm({
                      ...customSettingsForm,
                      minCustomDepositBrl: Number(e.target.value),
                    })
                  }
                  className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-neutral-500 font-mono">
                  Padrão solicitado: R$ 5,00
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">
                  Preço Base por Crédito em Valor Livre (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={customSettingsForm.customCreditPriceBrl}
                  onChange={(e) =>
                    setCustomSettingsForm({
                      ...customSettingsForm,
                      customCreditPriceBrl: Number(e.target.value),
                    })
                  }
                  className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                />
                <span className="text-[10px] text-neutral-500 font-mono">
                  Ex: R$ 0,25 resulta em 4 créditos a cada R$ 1,00 gasto
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs">
                <span className="font-heading font-bold text-white uppercase text-[11px]">
                  Bônus Progressivos Aplicados
                </span>
                <p className="text-[11px] text-neutral-400 font-mono">
                  • R$ 50 a R$ 99: <strong>+10%</strong> de créditos bônus
                </p>
                <p className="text-[11px] text-neutral-400 font-mono">
                  • R$ 100 a R$ 249: <strong>+15%</strong> de créditos bônus
                </p>
                <p className="text-[11px] text-neutral-400 font-mono">
                  • R$ 250+: <strong>+25%</strong> de créditos bônus
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-neutral-300">
                  <input
                    type="checkbox"
                    checked={customSettingsForm.allowCustomDeposit}
                    onChange={(e) =>
                      setCustomSettingsForm({
                        ...customSettingsForm,
                        allowCustomDeposit: e.target.checked,
                      })
                    }
                    className="size-4 accent-[#FF5500] cursor-pointer"
                  />
                  <span>Habilitar campo de valor livre para os usuários</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCustomSettingsOpen(false)}
                  className="border-white/15 text-neutral-400 hover:text-white text-xs h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingCustomSettings}
                  className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase h-9 rounded-xl cursor-pointer"
                >
                  {isSubmittingCustomSettings ? <Loader2 className="size-4 animate-spin" /> : "Salvar Parâmetros"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
