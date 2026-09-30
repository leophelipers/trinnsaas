"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Calculator,
  Cpu,
  Coins,
  DollarSign,
  TrendingUp,
  Server,
  Zap,
  Sliders,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Percent,
  RefreshCw,
  X,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AdminNavBar } from "./admin-nav-bar";

export function PricingView() {
  const adminStatus = useQuery(api.admin.getCurrentAdminStatus);
  const isAuthorized = Boolean(adminStatus?.isAdmin);

  const pricingData = useQuery(
    api.adminPricing.getPricingOverview,
    isAuthorized ? {} : "skip"
  );

  // Mutations
  const upsertWorkflowMutation = useMutation(api.adminPricing.upsertWorkflow);
  const deleteWorkflowMutation = useMutation(api.adminPricing.deleteWorkflow);
  const toggleWorkflowMutation = useMutation(api.adminPricing.toggleWorkflowActive);
  const updateSettingsMutation = useMutation(api.adminPricing.updatePricingSettings);
  const seedWorkflowsMutation = useMutation(api.adminPricing.seedDefaultWorkflows);

  // Estados de Formulários e Modais
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal Workflow
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<Id<"workflowPricing"> | null>(null);
  const [workflowForm, setWorkflowForm] = useState({
    slug: "",
    name: "",
    description: "",
    gpuType: "48gb" as "80gb" | "48gb",
    gpuRatePerSecond: 0.000486,
    estimatedSeconds: 35,
    creditsCharged: 25,
    category: "video_generation",
    isActive: true,
    sortOrder: 1,
  });
  const [isSubmittingWorkflow, setIsSubmittingWorkflow] = useState(false);

  // Modal Configurações de Custos e Câmbio
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    usdToBrlRate: 5.8,
    fixedGpu48gbMonthlyUsd: 800,
    fixedGpu80gbMonthlyUsd: 1800,
    minBalanceForDailyBonus: 20,
    dailyBonusCredits: 5,
    minCustomDepositBrl: 5.0,
    customCreditPriceBrl: 0.25,
    allowCustomDeposit: true,
  });
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false);

  // Estado da Calculadora de Projeção Interativa
  const [projectedMonthlyRuns, setProjectedMonthlyRuns] = useState<number>(15000);
  const [selectedWorkflowSlug, setSelectedWorkflowSlug] = useState<string>("all");

  // Loading
  if (adminStatus === undefined) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="size-8 animate-spin text-[#FF5500]" />
        <p className="text-xs font-mono text-neutral-400">Verificando permissões de administrador...</p>
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
        <div className="space-y-2">
          <h3 className="font-heading text-xl uppercase font-bold text-white">
            Acesso Restrito
          </h3>
          <p className="text-xs text-neutral-400 font-sans">
            A página de precificação e custos de infraestrutura é restrita exclusivamente a administradores.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="outline" className="border-white/15 text-white hover:bg-white/10 text-xs">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const workflows = pricingData?.workflows || [];
  const settings = pricingData?.settings;
  const avgCreditBrl = pricingData?.averageCreditValueBrl || 0.25;
  const usdToBrl = settings?.usdToBrlRate || 5.8;

  // Abrir Modal para Criar Novo Workflow
  const handleOpenCreateWorkflow = () => {
    setEditingWorkflowId(null);
    setWorkflowForm({
      slug: "",
      name: "",
      description: "",
      gpuType: "48gb",
      gpuRatePerSecond: 0.000486,
      estimatedSeconds: 30,
      creditsCharged: 20,
      category: "video_generation",
      isActive: true,
      sortOrder: workflows.length + 1,
    });
    setIsWorkflowModalOpen(true);
  };

  // Abrir Modal para Editar Workflow Existente
  const handleOpenEditWorkflow = (wf: any) => {
    setEditingWorkflowId(wf._id.startsWith("fallback") ? null : wf._id);
    setWorkflowForm({
      slug: wf.slug,
      name: wf.name,
      description: wf.description,
      gpuType: wf.gpuType,
      gpuRatePerSecond: wf.gpuRatePerSecond,
      estimatedSeconds: wf.estimatedSeconds,
      creditsCharged: wf.creditsCharged,
      category: wf.category,
      isActive: wf.isActive,
      sortOrder: wf.sortOrder,
    });
    setIsWorkflowModalOpen(true);
  };

  // Salvar Workflow
  const handleSaveWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmittingWorkflow(true);
    try {
      await upsertWorkflowMutation({
        id: editingWorkflowId || undefined,
        slug: workflowForm.slug,
        name: workflowForm.name,
        description: workflowForm.description,
        gpuType: workflowForm.gpuType,
        gpuRatePerSecond: Number(workflowForm.gpuRatePerSecond),
        estimatedSeconds: Number(workflowForm.estimatedSeconds),
        creditsCharged: Number(workflowForm.creditsCharged),
        category: workflowForm.category,
        isActive: workflowForm.isActive,
        sortOrder: Number(workflowForm.sortOrder),
      });
      setIsWorkflowModalOpen(false);
      setFeedback({
        type: "success",
        message: `Workflow "${workflowForm.name}" salvo com sucesso!`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Falha ao salvar workflow.",
      });
    } finally {
      setIsSubmittingWorkflow(false);
    }
  };

  // Deletar Workflow
  const handleDeleteWorkflow = async (id: Id<"workflowPricing">, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o workflow "${name}"?`)) return;
    try {
      await deleteWorkflowMutation({ id });
      setFeedback({ type: "success", message: `Workflow "${name}" removido com sucesso.` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao excluir." });
    }
  };

  // Abrir Modal de Parâmetros Globais
  const handleOpenSettings = () => {
    if (settings) {
      setSettingsForm({
        usdToBrlRate: settings.usdToBrlRate,
        fixedGpu48gbMonthlyUsd: settings.fixedGpu48gbMonthlyUsd,
        fixedGpu80gbMonthlyUsd: settings.fixedGpu80gbMonthlyUsd,
        minBalanceForDailyBonus: settings.minBalanceForDailyBonus,
        dailyBonusCredits: settings.dailyBonusCredits,
        minCustomDepositBrl: (settings as any).minCustomDepositBrl ?? 5.0,
        customCreditPriceBrl: (settings as any).customCreditPriceBrl ?? 0.25,
        allowCustomDeposit: (settings as any).allowCustomDeposit ?? true,
      });
    }
    setIsSettingsModalOpen(true);
  };

  // Salvar Configurações
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmittingSettings(true);
    try {
      await updateSettingsMutation({
        usdToBrlRate: Number(settingsForm.usdToBrlRate),
        fixedGpu48gbMonthlyUsd: Number(settingsForm.fixedGpu48gbMonthlyUsd),
        fixedGpu80gbMonthlyUsd: Number(settingsForm.fixedGpu80gbMonthlyUsd),
        minBalanceForDailyBonus: Number(settingsForm.minBalanceForDailyBonus),
        dailyBonusCredits: Number(settingsForm.dailyBonusCredits),
        minCustomDepositBrl: Number(settingsForm.minCustomDepositBrl),
        customCreditPriceBrl: Number(settingsForm.customCreditPriceBrl),
        allowCustomDeposit: Boolean(settingsForm.allowCustomDeposit),
      });
      setIsSettingsModalOpen(false);
      setFeedback({
        type: "success",
        message: "Configurações de infraestrutura, câmbio e recarga livre atualizadas!",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Falha ao atualizar parâmetros.",
      });
    } finally {
      setIsSubmittingSettings(false);
    }
  };

  // Inicializar Workflows Padrões se Vazio
  const handleSeedDefaults = async () => {
    try {
      await seedWorkflowsMutation({});
      setFeedback({
        type: "success",
        message: "Workflows e parâmetros padrões inicializados com sucesso na base!",
      });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao inicializar." });
    }
  };

  // Cálculos da Calculadora de Projeção Interativa
  const targetWorkflows =
    selectedWorkflowSlug === "all"
      ? workflows
      : workflows.filter((w) => w.slug === selectedWorkflowSlug);

  // Média ponderada por workflow
  const runsCount = targetWorkflows.length || 1;
  const avgGpuCostUsd =
    targetWorkflows.reduce((acc, w) => acc + w.economics.gpuCostUsd, 0) / runsCount;
  const avgRevenueBrl =
    targetWorkflows.reduce((acc, w) => acc + w.economics.revenueBrl, 0) / runsCount;
  const avgGpuCostBrl = avgGpuCostUsd * usdToBrl;
  const avgProfitBrl = avgRevenueBrl - avgGpuCostBrl;

  // Totais mensais projetados
  const projectedRevenueBrl = projectedMonthlyRuns * avgRevenueBrl;
  const projectedRevenueUsd = projectedRevenueBrl / usdToBrl;
  const projectedServerlessCostBrl = projectedMonthlyRuns * avgGpuCostBrl;
  const projectedServerlessCostUsd = projectedMonthlyRuns * avgGpuCostUsd;
  const projectedGrossProfitBrl = projectedRevenueBrl - projectedServerlessCostBrl;
  const projectedGrossMarginPct =
    projectedRevenueBrl > 0 ? (projectedGrossProfitBrl / projectedRevenueBrl) * 100 : 0;

  // Análise de Crossover: Custo Fixo vs Serverless
  // Consideramos a GPU padrão 48GB ($800) ou ponderada
  const dedicatedMonthlyCostUsd = settings?.fixedGpu48gbMonthlyUsd || 800;
  const dedicatedMonthlyCostBrl = dedicatedMonthlyCostUsd * usdToBrl;

  // Ponto exato de crossover em requisições
  const crossoverRunsThreshold =
    avgGpuCostUsd > 0 ? Math.ceil(dedicatedMonthlyCostUsd / avgGpuCostUsd) : 47000;

  const isServerlessCheaper = projectedServerlessCostUsd < dedicatedMonthlyCostUsd;
  const diffUsd = Math.abs(projectedServerlessCostUsd - dedicatedMonthlyCostUsd);
  const diffBrl = diffUsd * usdToBrl;
  const pctThreshold = (projectedMonthlyRuns / crossoverRunsThreshold) * 100;

  return (
    <div className="space-y-6">
      {/* Sub-navegação interna de Administrador */}
      <AdminNavBar currentTab="pricing" />

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

      {/* Top Banner de Custos & Parâmetros Base */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-lg">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">GPU 80GB (A100/H100)</span>
              <Cpu className="size-4 text-[#FF5500]" />
            </div>
            <p className="text-xl font-heading font-black text-white">
              $0.000756 <span className="text-xs font-mono font-normal text-neutral-400">/ seg</span>
            </p>
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>~$2.72 / hora</span>
              <Badge className="bg-[#FF5500]/10 text-[#FF5500] border-none text-[9px] px-1.5">
                Alta Fidelidade
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-lg">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">GPU 48GB (L40S/A6000)</span>
              <Zap className="size-4 text-[#00E5FF]" />
            </div>
            <p className="text-xl font-heading font-black text-white">
              $0.000486 <span className="text-xs font-mono font-normal text-neutral-400">/ seg</span>
            </p>
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>~$1.75 / hora</span>
              <Badge className="bg-[#00E5FF]/10 text-[#00E5FF] border-none text-[9px] px-1.5">
                Alta Eficiência
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-lg">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Câmbio & Valor Médio</span>
              <DollarSign className="size-4 text-emerald-400" />
            </div>
            <p className="text-xl font-heading font-black text-white">
              1 USD = R$ {usdToBrl.toFixed(2)}
            </p>
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>Crédito médio: ~R$ {avgCreditBrl.toFixed(2)}</span>
              <button
                type="button"
                onClick={handleOpenSettings}
                className="text-[#FF5500] hover:underline cursor-pointer"
              >
                Ajustar
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-lg flex flex-col justify-between">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Ações de Precificação</span>
              <Sliders className="size-4 text-purple-400" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                onClick={handleOpenCreateWorkflow}
                className="flex-1 bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase h-8 rounded-xl cursor-pointer"
              >
                <Plus className="size-3.5 mr-1" />
                Novo Workflow
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenSettings}
                className="border-white/15 text-white hover:bg-white/10 text-xs h-8 px-2.5 rounded-xl cursor-pointer"
                title="Configurações de Câmbio e Servidor Fixo"
              >
                <Sliders className="size-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 1: TABELA DE UNIT ECONOMICS POR REQUISIÇÃO (Sem novo deploy) */}
      <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
        <CardHeader className="p-5 pb-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-heading font-bold uppercase tracking-tight text-white">
                Unit Economics dos Workflows ComfyUI
              </CardTitle>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                MARGEM MÉDIA ~96%
              </Badge>
            </div>
            <CardDescription className="text-xs text-neutral-400 font-sans mt-0.5">
              Custo de GPU por segundo, créditos cobrados, receita e lucro líquido calculado em tempo real para cada renderização.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            className="border-white/15 text-neutral-300 hover:text-white text-xs h-8 rounded-xl self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="size-3 mr-1.5" />
            Recarregar Padrões
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#08090C] text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Workflow / Modelo</th>
                <th className="py-3 px-3">GPU & Duração</th>
                <th className="py-3 px-3">Custo GPU (Serverless)</th>
                <th className="py-3 px-3">Créditos</th>
                <th className="py-3 px-3">Receita Bruta</th>
                <th className="py-3 px-3 text-emerald-400">Lucro Líquido</th>
                <th className="py-3 px-3">Margem %</th>
                <th className="py-3 px-3">Crossover Fixo</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {workflows.map((wf) => {
                const is80gb = wf.gpuType === "80gb";
                return (
                  <tr key={wf.slug} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${wf.isActive ? "bg-emerald-400" : "bg-neutral-600"}`} />
                        <div>
                          <p className="font-heading font-bold text-white text-xs">
                            {wf.name}
                          </p>
                          <p className="text-[10px] font-mono text-neutral-500">
                            slug: {wf.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 ${
                            is80gb
                              ? "border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10"
                              : "border-[#00E5FF]/40 text-[#00E5FF] bg-[#00E5FF]/10"
                          }`}
                        >
                          {wf.gpuType.toUpperCase()}
                        </Badge>
                        <span className="text-neutral-300">~{wf.estimatedSeconds}s</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        ${wf.gpuRatePerSecond}/s
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <p className="text-white font-medium">
                        ${wf.economics.gpuCostUsd.toFixed(4)}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        R$ {wf.economics.gpuCostBrl.toFixed(3)}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <div className="flex items-center gap-1 text-[#FF5500] font-bold">
                        <Coins className="size-3" />
                        <span>{wf.creditsCharged} cr</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <p className="text-white font-medium">
                        R$ {wf.economics.revenueBrl.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        ~${wf.economics.revenueUsd.toFixed(2)}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold">
                      <p>+ R$ {wf.economics.netProfitBrl.toFixed(2)}</p>
                      <p className="text-[10px] text-emerald-500/80">
                        + ${wf.economics.netProfitUsd.toFixed(2)}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
                        {wf.economics.grossMarginPct}%
                      </Badge>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-neutral-400 text-[11px]">
                      <span className="text-white font-medium">
                        {wf.economics.crossoverRunsPerMonth.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">
                        req/mês (~{wf.economics.crossoverRunsPerDay}/dia)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditWorkflow(wf)}
                          className="size-7 p-0 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                          title="Editar precificação deste workflow"
                        >
                          <Edit3 className="size-3.5" />
                        </Button>
                        {!wf._id.startsWith("fallback") && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWorkflow(wf._id, wf.name)}
                            className="size-7 p-0 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                            title="Remover workflow"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* SEÇÃO 2: CALCULADORA DE PROJEÇÃO & DIRECIONAMENTO SERVERLESS VS FIXO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controle da Calculadora (Slider e Seletor) */}
        <Card className="lg:col-span-5 bg-[#0C0D12]/90 border border-white/10 shadow-xl backdrop-blur-xl">
          <CardHeader className="p-5 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calculator className="size-4 text-[#FF5500]" />
              <CardTitle className="text-sm font-heading font-bold uppercase tracking-tight text-white">
                Simulador de Volume & Projeção
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-neutral-400 font-sans">
              Ajuste o volume mensal estimado para calcular margem, faturamento e saber quando migrar de Serverless para GPU Fixa.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-6">
            {/* Seletor de Modelo */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300">
                Modelo / Workflow Avaliado
              </label>
              <select
                value={selectedWorkflowSlug}
                onChange={(e) => setSelectedWorkflowSlug(e.target.value)}
                className="w-full bg-[#050506] border border-white/15 text-white text-xs rounded-xl h-10 px-3 cursor-pointer outline-none focus:border-[#FF5500]"
              >
                <option value="all">Média Ponderada de Todos os Modelos</option>
                {workflows.map((w) => (
                  <option key={w.slug} value={w.slug}>
                    {w.name} ({w.gpuType.toUpperCase()} • ~{w.estimatedSeconds}s • {w.creditsCharged} cr)
                  </option>
                ))}
              </select>
            </div>

            {/* Slider de Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-300">
                  Volume de Requisições / Mês
                </span>
                <span className="text-sm font-mono font-bold text-[#FF5500] bg-[#FF5500]/10 px-2 py-0.5 rounded-lg border border-[#FF5500]/20">
                  {projectedMonthlyRuns.toLocaleString()} renders
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="120000"
                step="500"
                value={projectedMonthlyRuns}
                onChange={(e) => setProjectedMonthlyRuns(Number(e.target.value))}
                className="w-full accent-[#FF5500] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                <span>500 renders</span>
                <span>30.000</span>
                <span>60.000</span>
                <span>120.000+</span>
              </div>
            </div>

            {/* Resumo Rápido em Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400">Faturamento Bruto</span>
                <p className="text-lg font-heading font-bold text-white">
                  R$ {projectedRevenueBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono">
                  ~${projectedRevenueUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400">Custo GPU (Serverless)</span>
                <p className="text-lg font-heading font-bold text-rose-400">
                  R$ {projectedServerlessCostBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono">
                  ~${projectedServerlessCostUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    Lucro Bruto Projetado
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                    {projectedGrossMarginPct.toFixed(1)}% Margem
                  </Badge>
                </div>
                <p className="text-2xl font-heading font-black text-emerald-400">
                  R$ {projectedGrossProfitBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-neutral-400 font-mono">
                  A cada R$ 100 vendidos, ~R$ {projectedGrossMarginPct.toFixed(0)} ficam líquidos para a operação após os custos de GPU ComfyUI.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crossover Analyzer: Serverless vs. Servidor Dedicado Fixo */}
        <Card className="lg:col-span-7 bg-[#0C0D12]/90 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <CardHeader className="p-5 pb-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-[#00E5FF]" />
                <CardTitle className="text-sm font-heading font-bold uppercase tracking-tight text-white">
                  Indicador de Crossover: Serverless vs. Servidor Fixo Dedicado
                </CardTitle>
              </div>
              <Badge
                className={`text-[10px] font-mono uppercase tracking-wider ${
                  isServerlessCheaper
                    ? "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}
              >
                {isServerlessCheaper ? "Fase 1: Serverless Recomendado" : "Fase 2: Migrar para Fixo!"}
              </Badge>
            </div>
            <CardDescription className="text-xs text-neutral-400 font-sans">
              Algoritmo de decisão financeira que monitora o momento exato em que alugar uma GPU dedicada 24/7 se torna mais barato do que pagar por segundo.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-6">
            {/* Visual Gauge / Barra de Progresso em direção ao Crossover */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">
                  Progresso até o Ponto de Crossover ({crossoverRunsThreshold.toLocaleString()} req/mês):
                </span>
                <span className={`font-bold ${pctThreshold > 100 ? "text-amber-400" : "text-[#00E5FF]"}`}>
                  {pctThreshold.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-[#050506] border border-white/10 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    pctThreshold < 75
                      ? "bg-gradient-to-r from-[#00E5FF] to-blue-500"
                      : pctThreshold <= 100
                      ? "bg-gradient-to-r from-blue-500 to-amber-500"
                      : "bg-gradient-to-r from-amber-500 to-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, pctThreshold)}%` }}
                />
              </div>
            </div>

            {/* Comparativo de Custos Lado a Lado */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isServerlessCheaper
                  ? "bg-[#00E5FF]/5 border-[#00E5FF]/30"
                  : "bg-white/[0.02] border-white/5 opacity-70"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold text-white uppercase">
                    Opção A: Serverless
                  </span>
                  <Zap className="size-3.5 text-[#00E5FF]" />
                </div>
                <p className="text-xl font-heading font-bold text-white">
                  ${projectedServerlessCostUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  <span className="text-xs font-mono font-normal text-neutral-400"> /mês</span>
                </p>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Paga apenas pelos segundos de execução do ComfyUI. Zero custo com GPU ociosa quando ninguém estiver gerando.
                </p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                !isServerlessCheaper
                  ? "bg-amber-500/10 border-amber-500/40"
                  : "bg-white/[0.02] border-white/5 opacity-70"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold text-white uppercase">
                    Opção B: Servidor Fixo (48GB)
                  </span>
                  <Server className="size-3.5 text-amber-400" />
                </div>
                <p className="text-xl font-heading font-bold text-white">
                  ${dedicatedMonthlyCostUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  <span className="text-xs font-mono font-normal text-neutral-400"> /mês</span>
                </p>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Instância dedicada rodando 24 horas por dia (RunPod/Vast/Lambda). Custo fixo previsível, capacidade ilimitada até o teto da GPU.
                </p>
              </div>
            </div>

            {/* Caixa de Recomendação Inteligente */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              isServerlessCheaper
                ? "bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}>
              <div className="flex items-center gap-2 font-heading font-bold text-xs uppercase tracking-wider">
                <Sparkles className="size-4 shrink-0" />
                <span>
                  {isServerlessCheaper
                    ? "Diagnóstico: Permaneça em Arquitetura Serverless"
                    : "Diagnóstico: Momento de Migrar para Servidor Fixo!"}
                </span>
              </div>
              <p className="text-xs font-sans text-neutral-300 leading-relaxed">
                {isServerlessCheaper ? (
                  <>
                    No volume atual de <strong>{projectedMonthlyRuns.toLocaleString()} renders/mês</strong>, o modelo Serverless é a melhor escolha. Você economiza aproximadamente <strong>${diffUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD (R$ {diffBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })})</strong> em relação a uma máquina dedicada ociosa.
                  </>
                ) : (
                  <>
                    Com o volume atual de <strong>{projectedMonthlyRuns.toLocaleString()} renders/mês</strong>, o servidor fixo dedicado é <strong>${diffUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD (R$ {diffBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}) mais barato</strong> por mês que o Serverless, permitindo economizar escala e aumentar a margem operacional líquida.
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CRIAR / EDITAR WORKFLOW DE COMFYUI                                  */}
      {/* ========================================================================= */}
      {isWorkflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0C0D12] p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="size-4 text-[#FF5500]" />
                <h3 className="font-heading font-bold text-white uppercase text-sm">
                  {editingWorkflowId ? "Editar Precificação do Workflow" : "Cadastrar Novo Workflow ComfyUI"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWorkflowModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkflow} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Slug Único (API)</label>
                  <Input
                    required
                    value={workflowForm.slug}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, slug: e.target.value })}
                    placeholder="ex: wan-2-1-720p"
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Nome de Exibição</label>
                  <Input
                    required
                    value={workflowForm.name}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                    placeholder="ex: Wan 2.1 (720p Cinematic)"
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">Descrição Técnica / Saída</label>
                <Input
                  required
                  value={workflowForm.description}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                  placeholder="ex: Geração 720p 24fps via ComfyUI com alta coerência visual"
                  className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Tipo de GPU</label>
                  <select
                    value={workflowForm.gpuType}
                    onChange={(e) => {
                      const type = e.target.value as "80gb" | "48gb";
                      setWorkflowForm({
                        ...workflowForm,
                        gpuType: type,
                        gpuRatePerSecond: type === "80gb" ? 0.000756 : 0.000486,
                      });
                    }}
                    className="w-full bg-[#050506] border border-white/15 text-white text-xs rounded-xl h-9 px-3 cursor-pointer outline-none focus:border-[#FF5500]"
                  >
                    <option value="48gb">GPU 48GB ($0.000486 / s)</option>
                    <option value="80gb">GPU 80GB ($0.000756 / s)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Taxa GPU / Seg ($)</label>
                  <Input
                    type="number"
                    step="0.000001"
                    required
                    value={workflowForm.gpuRatePerSecond}
                    onChange={(e) =>
                      setWorkflowForm({ ...workflowForm, gpuRatePerSecond: Number(e.target.value) })
                    }
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Tempo Médio (Segundos)</label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={workflowForm.estimatedSeconds}
                    onChange={(e) =>
                      setWorkflowForm({ ...workflowForm, estimatedSeconds: Number(e.target.value) })
                    }
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-[#FF5500] uppercase font-bold">
                    Créditos Cobrados (por render)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={workflowForm.creditsCharged}
                    onChange={(e) =>
                      setWorkflowForm({ ...workflowForm, creditsCharged: Number(e.target.value) })
                    }
                    className="bg-[#050506] border-[#FF5500]/40 text-[#FF5500] font-bold rounded-xl h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="text-xs font-sans text-neutral-300">Disponível para usuários (Ativo)</span>
                <input
                  type="checkbox"
                  checked={workflowForm.isActive}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, isActive: e.target.checked })}
                  className="size-4 accent-[#FF5500] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWorkflowModalOpen(false)}
                  className="border-white/15 text-neutral-400 hover:text-white text-xs h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingWorkflow}
                  className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase h-9 rounded-xl cursor-pointer"
                >
                  {isSubmittingWorkflow ? <Loader2 className="size-4 animate-spin" /> : "Salvar Workflow"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURAÇÃO DE CÂMBIO & CUSTOS DE SERVIDOR FIXO DEDICADO          */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0C0D12] p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-[#FF5500]" />
                <h3 className="font-heading font-bold text-white uppercase text-sm">
                  Configurações Globais de Custo & Câmbio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">Cotação USD / BRL (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={settingsForm.usdToBrlRate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, usdToBrlRate: Number(e.target.value) })}
                  className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">
                  Custo Mensal Estimado de GPU 48GB Dedicada ($ USD)
                </label>
                <Input
                  type="number"
                  step="10"
                  required
                  value={settingsForm.fixedGpu48gbMonthlyUsd}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, fixedGpu48gbMonthlyUsd: Number(e.target.value) })
                  }
                  className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                />
                <span className="text-[10px] text-neutral-500 font-mono">
                  Base RunPod / Vast / Lambda (~$1.10/h = ~$800/mês)
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">
                  Custo Mensal Estimado de GPU 80GB Dedicada ($ USD)
                </label>
                <Input
                  type="number"
                  step="10"
                  required
                  value={settingsForm.fixedGpu80gbMonthlyUsd}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, fixedGpu80gbMonthlyUsd: Number(e.target.value) })
                  }
                  className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                />
                <span className="text-[10px] text-neutral-500 font-mono">
                  Base A100 / H100 (~$2.50/h = ~$1.800/mês)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">
                    Saldo Mínimo Bônus Diário
                  </label>
                  <Input
                    type="number"
                    required
                    value={settingsForm.minBalanceForDailyBonus}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, minBalanceForDailyBonus: Number(e.target.value) })
                    }
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">
                    Bônus Diário Concedido
                  </label>
                  <Input
                    type="number"
                    required
                    value={settingsForm.dailyBonusCredits}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, dailyBonusCredits: Number(e.target.value) })
                    }
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Recarga em Valor Livre (Mínimo de R$ 5,00) */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold uppercase text-white">
                    Recarga em Valor Livre (Custom Amount)
                  </span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">
                    ATIVO
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase">
                      Depósito Mínimo (R$)
                    </label>
                    <Input
                      type="number"
                      step="0.50"
                      min="1"
                      required
                      value={settingsForm.minCustomDepositBrl}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, minCustomDepositBrl: Number(e.target.value) })
                      }
                      className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                    />
                    <span className="text-[9px] text-neutral-500 font-mono">
                      Ex: R$ 5,00
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase">
                      Preço / Crédito Base (R$)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={settingsForm.customCreditPriceBrl}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, customCreditPriceBrl: Number(e.target.value) })
                      }
                      className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                    />
                    <span className="text-[9px] text-neutral-500 font-mono">
                      Ex: R$ 0,25 (4 cr / R$ 1)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="border-white/15 text-neutral-400 hover:text-white text-xs h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingSettings}
                  className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase h-9 rounded-xl cursor-pointer"
                >
                  {isSubmittingSettings ? <Loader2 className="size-4 animate-spin" /> : "Salvar Configurações"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
