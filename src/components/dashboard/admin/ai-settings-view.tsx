"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Sparkles,
  Server,
  Cpu,
  Save,
  Check,
  ShieldAlert,
  Coins,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Bot,
  Calculator,
  DollarSign,
  ArrowRight,
  X,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AiSettingsView() {
  const settings = useQuery(api.chat.getAiSettings);
  const adminModels = useQuery(api.chat.listAllAdminModels) || [];
  const pricingOverview = useQuery(api.adminPricing.getPricingOverview);

  const updateSettings = useMutation(api.chat.updateAiSettings);
  const upsertModel = useMutation(api.chat.upsertModel);
  const toggleModel = useMutation(api.chat.toggleModelEnabled);
  const deleteModel = useMutation(api.chat.deleteModel);
  const syncModels = useMutation(api.chat.syncDefaultModels);
  const [isSyncing, setIsSyncing] = useState(false);

  // Cotação e taxa de conversão do sistema
  const usdToBrlRate = pricingOverview?.settings?.usdToBrlRate ?? 5.8;
  const customCreditPriceBrl = pricingOverview?.settings?.customCreditPriceBrl ?? 0.25;

  // Estados locais do provedor e custos globais
  const [activeProvider, setActiveProvider] = useState<"openrouter" | "runpod" | "hybrid_fallback">("openrouter");
  const [defaultModelText, setDefaultModelText] = useState("anthropic/claude-3.7-sonnet");
  const [defaultModelReasoning, setDefaultModelReasoning] = useState("deepseek/deepseek-r1");
  const [defaultModelVision, setDefaultModelVision] = useState("google/gemini-2.5-flash");
  const [runpodEndpointUrl, setRunpodEndpointUrl] = useState("");
  const [runpodModelName, setRunpodModelName] = useState("deepseek-ai/DeepSeek-R1-Distill-Qwen-32B");
  const [runpodDisplayName, setRunpodDisplayName] = useState("Instância de Processamento RunPod (vLLM Node)");
  const [tokensPerCreditStandard, setTokensPerCreditStandard] = useState(10000);
  const [tokensPerCreditReasoning, setTokensPerCreditReasoning] = useState(2500);
  const [imageCreditCost, setImageCreditCost] = useState(5);
  const [videoCreditCost, setVideoCreditCost] = useState(25);
  const [audioCreditCost, setAudioCreditCost] = useState(3);

  // Estados do cadastro rápido de Modelo RunPod
  const [runpodSlug, setRunpodSlug] = useState("");
  const [runpodInputUsd, setRunpodInputUsd] = useState<number | "">("");
  const [runpodOutputUsd, setRunpodOutputUsd] = useState<number | "">("");
  const [runpodCachedUsd, setRunpodCachedUsd] = useState<number | "">("");
  const [runpodCustomName, setRunpodCustomName] = useState("");
  const [runpodBadge, setRunpodBadge] = useState("RunPod");
  const [runpodReasoning, setRunpodReasoning] = useState(false);
  const [runpodShowAdvanced, setRunpodShowAdvanced] = useState(false);

  // Estados do formulário genérico de novo modelo (OpenRouter)
  const [isAddingGeneralModel, setIsAddingGeneralModel] = useState(false);
  const [newModelId, setNewModelId] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newProvider, setNewProvider] = useState<"openrouter" | "runpod">("openrouter");
  const [newCategory, setNewCategory] = useState("general");
  const [newBadge, setNewBadge] = useState("");
  const [newSupportsReasoning, setNewSupportsReasoning] = useState(false);

  // Estados de Edição de Modelo
  const [editingModel, setEditingModel] = useState<any | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editInputUsd, setEditInputUsd] = useState<number | "">("");
  const [editOutputUsd, setEditOutputUsd] = useState<number | "">("");
  const [editCachedUsd, setEditCachedUsd] = useState<number | "">("");
  const [editSupportsReasoning, setEditSupportsReasoning] = useState(false);
  const [editBadge, setEditBadge] = useState("");

  // Estados de Deleção (Modal Customizado)
  const [modelToDelete, setModelToDelete] = useState<{ id: Id<"customAiModels">; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback e Notificações
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-detecção de raciocínio profundo ao digitar slug RunPod
  useEffect(() => {
    const lower = runpodSlug.toLowerCase();
    if (
      lower.includes("r1") ||
      lower.includes("reason") ||
      lower.includes("thinking") ||
      lower.includes("cot") ||
      lower.includes("deepseek-r1")
    ) {
      setRunpodReasoning(true);
    }
  }, [runpodSlug]);

  useEffect(() => {
    if (settings) {
      setActiveProvider(settings.activeProvider);
      setDefaultModelText(settings.defaultModelText);
      setDefaultModelReasoning(settings.defaultModelReasoning);
      setDefaultModelVision(settings.defaultModelVision);
      setRunpodEndpointUrl(settings.runpodEndpointUrl || "");
      setRunpodModelName(settings.runpodModelName || "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B");
      setRunpodDisplayName(settings.runpodDisplayName || "Instância de Processamento RunPod (vLLM Node)");
      setTokensPerCreditStandard(settings.tokensPerCreditStandard);
      setTokensPerCreditReasoning(settings.tokensPerCreditReasoning);
      setImageCreditCost(settings.imageCreditCost);
      setVideoCreditCost(settings.videoCreditCost);
      setAudioCreditCost(settings.audioCreditCost);
    }
  }, [settings]);

  // Função utilitária para calcular créditos ao vivo no cliente
  const calculateCredits = (usdValue: number | "" | undefined): number => {
    if (usdValue === "" || usdValue === undefined || usdValue <= 0) return 0;
    return Number(((usdValue * usdToBrlRate) / customCreditPriceBrl).toFixed(2));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      await updateSettings({
        activeProvider,
        defaultModelText,
        defaultModelReasoning,
        defaultModelVision,
        runpodEndpointUrl: runpodEndpointUrl.trim() || undefined,
        runpodModelName: runpodModelName.trim() || undefined,
        runpodDisplayName: runpodDisplayName.trim() || undefined,
        tokensPerCreditStandard,
        tokensPerCreditReasoning,
        imageCreditCost,
        videoCreditCost,
        audioCreditCost,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Erro ao salvar configurações de IA:", err);
      setErrorMessage(err.message || "Falha ao persistir alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleModel = async (modelId: string, currentStatus: boolean) => {
    try {
      await toggleModel({
        modelId,
        isEnabled: !currentStatus,
      });
      setSuccessNotice(`Modelo ${!currentStatus ? "ativado" : "desativado"} com sucesso!`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      console.error("Erro ao alternar modelo:", err);
      setErrorMessage(err.message || "Erro ao alternar modelo");
    }
  };

  // Cadastro Simplificado de Modelo RunPod
  const handleAddRunpodModel = async () => {
    const cleanSlug = runpodSlug.trim();
    if (!cleanSlug) {
      setErrorMessage("Informe o identificador/nome do modelo no RunPod (ex: qwen/qwen3.8-max-prime)");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await upsertModel({
        modelId: cleanSlug,
        displayName: runpodCustomName.trim() || undefined,
        provider: "runpod",
        badge: runpodBadge.trim() || "RunPod",
        supportsReasoning: runpodReasoning,
        isEnabled: true,
        inputPricePerMillionUsd: typeof runpodInputUsd === "number" ? runpodInputUsd : undefined,
        outputPricePerMillionUsd: typeof runpodOutputUsd === "number" ? runpodOutputUsd : undefined,
        cachedPricePerMillionUsd: typeof runpodCachedUsd === "number" ? runpodCachedUsd : undefined,
      });

      setRunpodSlug("");
      setRunpodInputUsd("");
      setRunpodOutputUsd("");
      setRunpodCachedUsd("");
      setRunpodCustomName("");
      setRunpodReasoning(false);
      setRunpodShowAdvanced(false);

      setSuccessNotice("Modelo RunPod adicionado e ativado no estúdio com sucesso!");
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      console.error("Erro ao cadastrar modelo RunPod:", err);
      setErrorMessage(err.message || "Erro ao salvar modelo RunPod");
    } finally {
      setIsSaving(false);
    }
  };

  // Cadastro de Modelo Genérico / OpenRouter
  const handleAddGeneralModel = async () => {
    if (!newModelId.trim() || !newDisplayName.trim()) {
      setErrorMessage("Informe o ID do modelo e o Nome de Exibição.");
      return;
    }

    try {
      await upsertModel({
        modelId: newModelId.trim(),
        displayName: newDisplayName.trim(),
        provider: newProvider,
        category: newCategory,
        badge: newBadge.trim() || undefined,
        supportsReasoning: newSupportsReasoning,
        isEnabled: true,
      });

      setNewModelId("");
      setNewDisplayName("");
      setNewBadge("");
      setIsAddingGeneralModel(false);
      setSuccessNotice("Modelo adicionado ao catálogo com sucesso!");
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      console.error("Erro ao cadastrar modelo:", err);
      setErrorMessage(err.message || "Erro ao salvar modelo");
    }
  };

  // Sincronizar catálogo padrão de modelos (Qwen, Gemma, Gemini, ChatGPT, Claude)
  const handleSyncDefaultModels = async () => {
    setIsSyncing(true);
    setErrorMessage(null);
    try {
      const res = await syncModels();
      setSuccessNotice(`Catálogo atualizado com sucesso! ${res.total} modelos sincronizados (Claude 3.7, GPT-4o, Gemini 2.5, Qwen 2.5, Gemma 2, DeepSeek R1).`);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      console.error("Erro ao sincronizar modelos padrão:", err);
      setErrorMessage(err.message || "Erro ao sincronizar modelos padrão");
    } finally {
      setIsSyncing(false);
    }
  };

  // Abrir modal de edição
  const handleOpenEdit = (m: any) => {
    setEditingModel(m);
    setEditDisplayName(m.displayName || "");
    setEditInputUsd(m.inputPricePerMillionUsd ?? "");
    setEditOutputUsd(m.outputPricePerMillionUsd ?? "");
    setEditCachedUsd(m.cachedPricePerMillionUsd ?? "");
    setEditSupportsReasoning(Boolean(m.supportsReasoning));
    setEditBadge(m.badge || "");
  };

  // Salvar alterações de modelo editado
  const handleSaveEdit = async () => {
    if (!editingModel) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await upsertModel({
        id: String(editingModel._id).startsWith("temp_") ? undefined : editingModel._id,
        modelId: editingModel.modelId,
        displayName: editDisplayName.trim() || undefined,
        provider: editingModel.provider,
        category: editingModel.category,
        badge: editBadge.trim() || undefined,
        supportsReasoning: editSupportsReasoning,
        isEnabled: editingModel.isEnabled,
        inputPricePerMillionUsd: typeof editInputUsd === "number" ? editInputUsd : undefined,
        outputPricePerMillionUsd: typeof editOutputUsd === "number" ? editOutputUsd : undefined,
        cachedPricePerMillionUsd: typeof editCachedUsd === "number" ? editCachedUsd : undefined,
      });

      setEditingModel(null);
      setSuccessNotice("Modelo atualizado com sucesso!");
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      console.error("Erro ao salvar edição:", err);
      setErrorMessage(err.message || "Erro ao atualizar modelo");
    } finally {
      setIsSaving(false);
    }
  };

  // Confirmar exclusão de modelo
  const handleConfirmDelete = async () => {
    if (!modelToDelete) return;
    setIsDeleting(true);

    try {
      await deleteModel({ id: modelToDelete.id });
      setModelToDelete(null);
      setSuccessNotice("Modelo removido do catálogo com sucesso!");
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      console.error("Erro ao remover modelo:", err);
      setErrorMessage(err.message || "Erro ao remover modelo");
    } finally {
      setIsDeleting(false);
    }
  };

  if (settings === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[#FF5500]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#FF5500]" />
            Orquestrador de IA & Motores de Renderização
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Configure instâncias RunPod vLLM por nome e preço em USD com conversão automática para créditos, ou gerencie modelos OpenRouter.
          </p>
        </div>

        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-gradient-to-r from-[#FF5500] to-[#E04000] text-white hover:opacity-95 shadow-md shadow-[#FF5500]/20 font-medium text-xs sm:text-sm gap-2 cursor-pointer"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : saveSuccess ? (
            <Check className="h-4 w-4 text-white" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? "Salvando..." : saveSuccess ? "Salvo com Sucesso!" : "Salvar Configurações"}</span>
        </Button>
      </div>

      {/* Alertas e Notificações de Sucesso */}
      {successNotice && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs text-emerald-400 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="font-medium">{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-zinc-500 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-400 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-zinc-500 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* SEÇÃO 1: CADASTRO RÁPIDO RUNPOD COM CONVERSOR AUTOMÁTICO EM CRÉDITOS */}
      <Card className="border-[#FF5500]/40 bg-[#0C0D14] shadow-xl shadow-[#FF5500]/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5500]/5 rounded-full blur-3xl pointer-events-none" />
        
        <CardHeader className="pb-3 border-b border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#FF5500]" />
                Registrar Novo Modelo RunPod (vLLM)
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-0.5">
                Informe o nome/slug do modelo e as tarifas em USD por 1M tokens. O sistema calcula os créditos automaticamente e o disponibiliza para os criadores de imediato.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#14151E] border border-zinc-800 text-[11px] font-mono text-zinc-300">
              <Coins className="h-3 w-3 text-[#FF5500]" />
              <span>Base: US$ 1.00 = R$ {usdToBrlRate.toFixed(2)} | 1 cr = R$ {customCreditPriceBrl.toFixed(2)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Campos de Entrada Principais */}
            <div className="lg:col-span-7 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-white mb-1.5 flex items-center justify-between">
                  <span>Identificador / Nome do Modelo no RunPod (Obrigatório)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Ex: qwen/qwen3.8-max-prime</span>
                </label>
                <Input
                  placeholder="ex: qwen/qwen3.8-max-prime ou Qwen/Qwen2.5-72B-Instruct"
                  value={runpodSlug}
                  onChange={(e) => setRunpodSlug(e.target.value)}
                  className="bg-black/70 border-zinc-700 text-xs font-mono h-9 focus:border-[#FF5500]"
                />
              </div>

              {/* Grid de Preços em USD */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-300 mb-1 flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-emerald-400" />
                    <span>Preço Input (USD / 1M)</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="ex: 0.20"
                    value={runpodInputUsd}
                    onChange={(e) => setRunpodInputUsd(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-black/70 border-zinc-700 text-xs h-8 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 mb-1 flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-cyan-400" />
                    <span>Preço Output (USD / 1M)</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="ex: 0.80"
                    value={runpodOutputUsd}
                    onChange={(e) => setRunpodOutputUsd(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-black/70 border-zinc-700 text-xs h-8 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 mb-1 flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-amber-400" />
                    <span>Preço Cached (USD / 1M)</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="ex: 0.05"
                    value={runpodCachedUsd}
                    onChange={(e) => setRunpodCachedUsd(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-black/70 border-zinc-700 text-xs h-8 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Botão de Toggle para Opções Avançadas */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setRunpodShowAdvanced(!runpodShowAdvanced)}
                  className="text-[11px] text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{runpodShowAdvanced ? "− Ocultar opções avançadas" : "+ Configurar nome personalizado, badge ou categoria"}</span>
                </button>
              </div>

              {/* Campos Avançados Expansíveis */}
              {runpodShowAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-black/40 border border-zinc-800 animate-in fade-in duration-150">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                      Nome Amigável no Chat (Opcional)
                    </label>
                    <Input
                      placeholder="Deixe em branco para auto-formatar"
                      value={runpodCustomName}
                      onChange={(e) => setRunpodCustomName(e.target.value)}
                      className="bg-black/70 border-zinc-700 text-xs h-8"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                      Badge de Destaque
                    </label>
                    <Input
                      placeholder="Padrão: RunPod"
                      value={runpodBadge}
                      onChange={(e) => setRunpodBadge(e.target.value)}
                      className="bg-black/70 border-zinc-700 text-xs h-8"
                    />
                  </div>
                </div>
              )}

              {/* Checkbox Raciocínio & Ativação Imediata */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={runpodReasoning}
                    onChange={(e) => setRunpodReasoning(e.target.checked)}
                    className="rounded border-zinc-700 bg-black text-[#FF5500] focus:ring-0 cursor-pointer"
                  />
                  <span>Suporta Raciocínio Profundo (Thinking Chain)</span>
                </label>

                <Button
                  onClick={handleAddRunpodModel}
                  disabled={isSaving || !runpodSlug.trim()}
                  className="bg-[#FF5500] hover:bg-[#E04000] text-white text-xs h-9 px-4 gap-2 font-semibold shadow-md shadow-[#FF5500]/20 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Cadastrar e Ativar no Estúdio</span>
                </Button>
              </div>
            </div>

            {/* Painel Lateral: Calculadora em Tempo Real de Créditos */}
            <div className="lg:col-span-5 rounded-xl border border-zinc-800/90 bg-[#08090D] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                  <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Calculator className="h-3.5 w-3.5 text-[#FF5500]" />
                    Conversor Automático de Créditos
                  </h4>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                    Tempo Real
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Linha Input */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0F1017] border border-zinc-800">
                    <span className="text-zinc-400">Tokens de Entrada (Input):</span>
                    <div className="text-right">
                      <span className="font-semibold text-white font-mono">
                        {calculateCredits(runpodInputUsd)} créditos
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        por 1 milhão (~{(calculateCredits(runpodInputUsd) / 100).toFixed(3)} cr / 10k)
                      </span>
                    </div>
                  </div>

                  {/* Linha Output */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0F1017] border border-zinc-800">
                    <span className="text-zinc-400">Tokens de Saída (Output):</span>
                    <div className="text-right">
                      <span className="font-semibold text-white font-mono">
                        {calculateCredits(runpodOutputUsd)} créditos
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        por 1 milhão (~{(calculateCredits(runpodOutputUsd) / 100).toFixed(3)} cr / 10k)
                      </span>
                    </div>
                  </div>

                  {/* Linha Cached */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#0F1017] border border-zinc-800">
                    <span className="text-zinc-400">Tokens em Cache (Prompt Caching):</span>
                    <div className="text-right">
                      <span className="font-semibold text-white font-mono">
                        {calculateCredits(runpodCachedUsd)} créditos
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        por 1 milhão
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Zap className="h-3 w-3" />
                  Disponibilidade imediata no chat
                </span>
                <span className="font-mono text-[10px] text-zinc-500">
                  Fórmula: (USD × {usdToBrlRate.toFixed(2)}) ÷ {customCreditPriceBrl.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 2: ROTA ATIVA & PARÂMETROS DA INSTÂNCIA RUNPOD */}
      <Card className="border-zinc-800 bg-[#0A0B10]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Server className="h-4 w-4 text-[#FF5500]" />
            Seleção do Motor de Processamento Ativo
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Define a rota prioritária para onde as requisições de texto e raciocínio do Kriativa Muse são despachadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Opção OpenRouter */}
            <div
              onClick={() => setActiveProvider("openrouter")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeProvider === "openrouter"
                  ? "bg-[#14151B] border-[#FF5500] shadow-sm shadow-[#FF5500]/10"
                  : "bg-[#0E0F14] border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-white">OpenRouter Gateway</span>
                {activeProvider === "openrouter" && (
                  <Badge className="bg-[#FF5500] text-white text-[10px]">Ativo</Badge>
                )}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Catálogo global de modelos (Claude, Gemini, Llama, GPT). Cobrança estrita por token.
              </p>
            </div>

            {/* Opção RunPod Auto-Hospedado */}
            <div
              onClick={() => setActiveProvider("runpod")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeProvider === "runpod"
                  ? "bg-[#14151B] border-[#FF5500] shadow-sm shadow-[#FF5500]/10"
                  : "bg-[#0E0F14] border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-white">Instância Dedicada RunPod</span>
                {activeProvider === "runpod" && (
                  <Badge className="bg-[#FF5500] text-white text-[10px]">Ativo</Badge>
                )}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Nó vLLM dedicado com inferência local contínua e latência ultra-baixa.
              </p>
            </div>

            {/* Opção Híbrida Fallback */}
            <div
              onClick={() => setActiveProvider("hybrid_fallback")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeProvider === "hybrid_fallback"
                  ? "bg-[#14151B] border-[#FF5500] shadow-sm shadow-[#FF5500]/10"
                  : "bg-[#0E0F14] border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-white">Roteamento Híbrido</span>
                {activeProvider === "hybrid_fallback" && (
                  <Badge className="bg-[#FF5500] text-white text-[10px]">Ativo</Badge>
                )}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Prioriza RunPod; em caso de sobrecarga ou timeout (&gt;10s), chaveia automaticamente para OpenRouter.
              </p>
            </div>
          </div>

          {/* Configuração RunPod Endpoint */}
          <div className="mt-4 p-4 rounded-xl border border-zinc-800 bg-[#0E0F14] space-y-4">
            <h4 className="text-xs font-semibold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#FF5500]" />
              Parâmetros da Instância de Inferência no RunPod
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1 block">
                  Nome de Exibição da Instância Padrão
                </label>
                <Input
                  placeholder="Instância de Processamento RunPod (vLLM Node)"
                  value={runpodDisplayName}
                  onChange={(e) => setRunpodDisplayName(e.target.value)}
                  className="bg-black/60 border-zinc-700 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1 block">
                  URL do Endpoint de Inferência (OpenAI-compatible)
                </label>
                <Input
                  placeholder="https://api.runpod.ai/v2/YOUR-POD-ID/openai/v1"
                  value={runpodEndpointUrl}
                  onChange={(e) => setRunpodEndpointUrl(e.target.value)}
                  className="bg-black/60 border-zinc-700 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1 block">
                  Nome do Modelo Fallback no Endpoint
                </label>
                <Input
                  placeholder="deepseek-ai/DeepSeek-R1-Distill-Qwen-32B"
                  value={runpodModelName}
                  onChange={(e) => setRunpodModelName(e.target.value)}
                  className="bg-black/60 border-zinc-700 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 3: CATÁLOGO UNIFICADO DE MODELOS (TABELA & CONTROLES) */}
      <Card className="border-zinc-800 bg-[#0A0B10]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#FF5500]" />
              Catálogo Unificado de Modelos do Estúdio
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Ligue ou desligue modelos disponíveis para os criadores, edite tarifas em USD e acompanhe a conversão em créditos da plataforma.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSyncDefaultModels}
              disabled={isSyncing}
              variant="outline"
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-emerald-500 text-xs h-8 gap-1.5 font-medium cursor-pointer"
              title="Ressincroniza as tarifas oficiais e nomes dos modelos Claude, ChatGPT, Gemini, Qwen e Gemma"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Sincronizando..." : "Sincronizar Modelos Padrão"}</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setIsAddingGeneralModel(!isAddingGeneralModel)}
              variant="outline"
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-[#FF5500] text-xs h-8 gap-1.5 font-medium cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Adicionar Modelo OpenRouter</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Formulário Secundário: Adicionar Modelo OpenRouter */}
          {isAddingGeneralModel && (
            <div className="rounded-xl border border-[#FF5500]/40 bg-[#12131C] p-4 space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#FF5500]" />
                Conectar Novo Modelo OpenRouter Gateway
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                    ID do Modelo (ex: google/gemini-2.5-pro)
                  </label>
                  <Input
                    placeholder="openai/gpt-4o ou deepseek/..."
                    value={newModelId}
                    onChange={(e) => setNewModelId(e.target.value)}
                    className="bg-black/60 border-zinc-700 text-xs h-8 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                    Nome de Exibição
                  </label>
                  <Input
                    placeholder="GPT-4o (Multimodal de Elite)"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="bg-black/60 border-zinc-700 text-xs h-8"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                    Provedor
                  </label>
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value as any)}
                    className="w-full h-8 rounded-md bg-black/60 border border-zinc-700 px-2 text-xs text-zinc-200 outline-none"
                  >
                    <option value="openrouter">OpenRouter Gateway</option>
                    <option value="runpod">RunPod Auto-Hospedado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                    Badge / Destaque (Opcional)
                  </label>
                  <Input
                    placeholder="ex: Novo, Código, Rápido"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="bg-black/60 border-zinc-700 text-xs h-8"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSupportsReasoning}
                    onChange={(e) => setNewSupportsReasoning(e.target.checked)}
                    className="rounded border-zinc-700 bg-black text-[#FF5500] focus:ring-0 cursor-pointer"
                  />
                  <span>Suporta Raciocínio Profundo (Thinking Process)</span>
                </label>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAddingGeneralModel(false)}
                    className="text-xs h-7 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddGeneralModel}
                    className="text-xs h-7 bg-[#FF5500] hover:bg-[#E04000] text-white cursor-pointer"
                  >
                    Salvar Modelo
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Modelos Cadastrados */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0E0F14] text-zinc-400">
                  <th className="p-3">Status</th>
                  <th className="p-3">Nome de Exibição</th>
                  <th className="p-3">ID do Modelo (Slug)</th>
                  <th className="p-3">Provedor</th>
                  <th className="p-3">Preço USD (1M)</th>
                  <th className="p-3">Taxa em Créditos</th>
                  <th className="p-3">Raciocínio</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {adminModels.map((m: any) => (
                  <tr key={m.modelId} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Toggle Status */}
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleModel(m.modelId, m.isEnabled)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                          m.isEnabled
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        }`}
                        title={m.isEnabled ? "Clique para desativar do estúdio" : "Clique para ativar no estúdio"}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            m.isEnabled ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                          }`}
                        />
                        <span>{m.isEnabled ? "Ativo" : "Inativo"}</span>
                      </button>
                    </td>

                    {/* Nome & Badge */}
                    <td className="p-3 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[200px]">{m.displayName}</span>
                        {m.badge && (
                          <Badge className="bg-[#FF5500]/15 text-[#FF5500] border-none text-[9px] shrink-0">
                            {m.badge}
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* ID do Modelo */}
                    <td className="p-3 font-mono text-zinc-400 text-[11px]">
                      {m.modelId}
                    </td>

                    {/* Provedor */}
                    <td className="p-3 text-zinc-300">
                      <Badge
                        className={`text-[10px] border-none uppercase ${
                          m.provider === "runpod"
                            ? "bg-[#FF5500]/20 text-[#FF5500]"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {m.provider}
                      </Badge>
                    </td>

                    {/* Preço USD */}
                    <td className="p-3 font-mono text-[11px] text-zinc-300">
                      {m.inputPricePerMillionUsd !== undefined || m.outputPricePerMillionUsd !== undefined ? (
                        <div className="space-y-0.5">
                          <span className="text-emerald-400 block">${m.inputPricePerMillionUsd ?? 0} in</span>
                          <span className="text-cyan-400 block">${m.outputPricePerMillionUsd ?? 0} out</span>
                          {m.cachedPricePerMillionUsd !== undefined && (
                            <span className="text-amber-400 block">${m.cachedPricePerMillionUsd} cch</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-[10px]">Tabela Global</span>
                      )}
                    </td>

                    {/* Preço em Créditos */}
                    <td className="p-3 font-mono text-[11px] text-zinc-200">
                      {m.creditsPerMillionInput !== undefined || m.creditsPerMillionOutput !== undefined ? (
                        <div className="space-y-0.5">
                          <span className="text-white font-medium block">
                            {m.creditsPerMillionInput ?? 0} cr in
                          </span>
                          <span className="text-zinc-400 block">
                            {m.creditsPerMillionOutput ?? 0} cr out
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-[10px]">Padrão da Plataforma</span>
                      )}
                    </td>

                    {/* Suporte a Raciocínio */}
                    <td className="p-3 text-zinc-400">
                      {m.supportsReasoning ? (
                        <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                          🧠 Ativo
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-[11px]">Padrão</span>
                      )}
                    </td>

                    {/* Ações: Editar e Deletar */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Editar preços e metadados do modelo"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {!String(m._id).startsWith("temp_") && (
                          <button
                            onClick={() => setModelToDelete({ id: m._id, name: m.displayName || m.modelId })}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Remover modelo do catálogo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 4: MECÂNICA GLOBAL DE CRÉDITOS DO CHAT */}
      <Card className="border-zinc-800 bg-[#0A0B10]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#FF5500]" />
            Mecânica Global de Créditos e Geração Multimodal
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Tokens consumidos por crédito quando o modelo não possui precificação USD específica. Administradores e criadores VIP possuem isenção automática.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1 block">
                Tokens Standard por Crédito (Modelos sem tabela USD)
              </label>
              <Input
                type="number"
                value={tokensPerCreditStandard}
                onChange={(e) => setTokensPerCreditStandard(Number(e.target.value))}
                className="bg-black/60 border-zinc-700 text-xs"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Ex: Gemini 2.5 Flash / Llama 3.3 (Padrão: 10.000)
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1 block">
                Tokens Raciocínio por Crédito
              </label>
              <Input
                type="number"
                value={tokensPerCreditReasoning}
                onChange={(e) => setTokensPerCreditReasoning(Number(e.target.value))}
                className="bg-black/60 border-zinc-700 text-xs"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Ex: Claude 3.7 / DeepSeek R1 (Padrão: 2.500)
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1 block">
                Custo de Geração de Imagem (créditos)
              </label>
              <Input
                type="number"
                value={imageCreditCost}
                onChange={(e) => setImageCreditCost(Number(e.target.value))}
                className="bg-black/60 border-zinc-700 text-xs"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Renderização de conceito visual (Padrão: 5 cr)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL CUSTOMIZADO: EDITAR MODELO */}
      {editingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#0D0E15] border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-[#FF5500]" />
                <h3 className="font-semibold text-white text-sm">
                  Editar Modelo: {editingModel.modelId}
                </h3>
              </div>
              <button
                onClick={() => setEditingModel(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 mb-1 block font-medium">Nome de Exibição</label>
                <Input
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="bg-black/60 border-zinc-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-zinc-400 mb-1 block font-medium">Input USD / 1M</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editInputUsd}
                    onChange={(e) => setEditInputUsd(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-black/60 border-zinc-700 text-xs"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    ≈ {calculateCredits(editInputUsd)} cr
                  </span>
                </div>

                <div>
                  <label className="text-zinc-400 mb-1 block font-medium">Output USD / 1M</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editOutputUsd}
                    onChange={(e) => setEditOutputUsd(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-black/60 border-zinc-700 text-xs"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    ≈ {calculateCredits(editOutputUsd)} cr
                  </span>
                </div>

                <div>
                  <label className="text-zinc-400 mb-1 block font-medium">Cached USD / 1M</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editCachedUsd}
                    onChange={(e) => setEditCachedUsd(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-black/60 border-zinc-700 text-xs"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    ≈ {calculateCredits(editCachedUsd)} cr
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 mb-1 block font-medium">Badge de Destaque</label>
                  <Input
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    placeholder="ex: RunPod, Rápido"
                    className="bg-black/60 border-zinc-700 text-xs"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editSupportsReasoning}
                      onChange={(e) => setEditSupportsReasoning(e.target.checked)}
                      className="rounded border-zinc-700 bg-black text-[#FF5500] focus:ring-0 cursor-pointer"
                    />
                    <span>Raciocínio Profundo</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingModel(null)}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-[#FF5500] hover:bg-[#E04000] text-white text-xs gap-1.5 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Salvar Alterações</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CUSTOMIZADO: CONFIRMAÇÃO DE DELEÇÃO */}
      {modelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#0C0D14] border border-red-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm">Remover Modelo</h3>
                <p className="text-xs text-zinc-400 truncate">{modelToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Tem certeza que deseja remover este modelo do catálogo do estúdio? Criadores não poderão mais selecioná-lo no chat.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModelToDelete(null)}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? "Removendo..." : "Confirmar Exclusão"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
