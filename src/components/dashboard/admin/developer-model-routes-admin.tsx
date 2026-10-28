"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Code2,
  Server,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface ModelRouteState {
  modelSlug: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  provider: "openrouter" | "runpod";
  openRouterModel: string;
  runpodModel: string;
  runpodEndpointUrl?: string;
  supportsReasoning: boolean;
}

export function DeveloperModelRoutesAdmin() {
  const adminRoutes = useQuery(api.developerApi.listAdminModelRoutes);
  const updateRoute = useMutation(api.developerApi.updateModelRoute);

  const [routesState, setRoutesState] = useState<Record<string, ModelRouteState>>({});
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicializa o estado local quando os dados do Convex chegarem
  useEffect(() => {
    if (adminRoutes && adminRoutes.length > 0) {
      const stateMap: Record<string, ModelRouteState> = {};
      for (const r of adminRoutes) {
        stateMap[r.modelSlug] = {
          modelSlug: r.modelSlug,
          displayName: r.displayName,
          description: r.description,
          isEnabled: r.isEnabled,
          provider: r.provider,
          openRouterModel: r.openRouterModel,
          runpodModel: r.runpodModel,
          runpodEndpointUrl: r.runpodEndpointUrl || "",
          supportsReasoning: r.supportsReasoning,
        };
      }
      setRoutesState(stateMap);
    }
  }, [adminRoutes]);

  const handleFieldChange = (
    modelSlug: string,
    field: keyof ModelRouteState,
    value: any
  ) => {
    setRoutesState((prev) => ({
      ...prev,
      [modelSlug]: {
        ...prev[modelSlug],
        [field]: value,
      },
    }));
  };

  const handleSaveRoute = async (modelSlug: string) => {
    const route = routesState[modelSlug];
    if (!route) return;

    setSavingSlug(modelSlug);
    setErrorMessage(null);

    try {
      await updateRoute({
        modelSlug: route.modelSlug,
        displayName: route.displayName,
        description: route.description,
        isEnabled: route.isEnabled,
        provider: route.provider,
        openRouterModel: route.openRouterModel,
        runpodModel: route.runpodModel,
        runpodEndpointUrl: route.runpodEndpointUrl || undefined,
        supportsReasoning: route.supportsReasoning,
      });

      setSuccessSlug(modelSlug);
      setTimeout(() => setSuccessSlug(null), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao salvar rota do modelo.");
    } finally {
      setSavingSlug(null);
    }
  };

  return (
    <Card className="border-[#FF5500]/30 bg-[#0C0D14] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,rgba(255,85,0,0.1),transparent_70%)] pointer-events-none" />

      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
                <Code2 className="size-4" />
              </span>
              <CardTitle className="text-base font-heading font-extrabold text-white uppercase tracking-tight">
                Roteamento de Modelos da API Externa (OpenCode / Cursor)
              </CardTitle>
              <Badge className="bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30 font-mono text-[10px]">
                White-Label
              </Badge>
            </div>
            <CardDescription className="text-xs text-zinc-400">
              Controle para onde cada modelo proprietário é despachado (OpenRouter vs RunPod). O usuário final e o OpenCode enxergam <strong>exclusivamente</strong> os identificadores da Kriativa.
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono text-xs gap-1.5 self-start sm:self-auto"
          >
            <ShieldCheck className="size-3.5" />
            PROTEÇÃO DE MARCA ATIVA
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {adminRoutes === undefined ? (
          <div className="space-y-4 py-6">
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {adminRoutes.map((baseDef) => {
              const current = routesState[baseDef.modelSlug] || baseDef;
              const isSaving = savingSlug === baseDef.modelSlug;
              const isSuccess = successSlug === baseDef.modelSlug;

              return (
                <div
                  key={baseDef.modelSlug}
                  className={`p-5 rounded-2xl border transition-all ${
                    current.isEnabled
                      ? "bg-[#10121A] border-zinc-800 hover:border-zinc-700"
                      : "bg-[#090A0E] border-zinc-900 opacity-60"
                  }`}
                >
                  {/* Top Bar do Modelo */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-sm text-white">
                          {current.displayName}
                        </h4>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] bg-black/60 text-zinc-300 border-zinc-700"
                        >
                          {current.modelSlug}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400">
                        {current.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Switch Liga/Desliga Modelo */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-zinc-400">
                          {current.isEnabled ? "Ativo" : "Inativo"}
                        </span>
                        <Switch
                          checked={current.isEnabled}
                          onCheckedChange={(checked) =>
                            handleFieldChange(baseDef.modelSlug, "isEnabled", checked)
                          }
                        />
                      </div>

                      {/* Botão Salvar do Card */}
                      <Button
                        size="sm"
                        onClick={() => handleSaveRoute(baseDef.modelSlug)}
                        disabled={isSaving}
                        className="bg-[#FF5500] hover:bg-[#E04B00] text-white font-heading font-bold text-xs gap-1.5 h-8 shrink-0"
                      >
                        {isSaving ? (
                          "Salvando..."
                        ) : isSuccess ? (
                          <>
                            <Check className="size-3.5 text-emerald-300" />
                            Salvo!
                          </>
                        ) : (
                          <>
                            <Save className="size-3.5" />
                            Salvar Rota
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Configuração do Provedor (OpenRouter vs RunPod) */}
                  <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Seletor ON/OFF de Provedor */}
                    <div className="lg:col-span-4 space-y-2">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Server className="size-3.5 text-[#FF5500]" />
                        Provedor de Processamento:
                      </label>

                      <div className="grid grid-cols-2 gap-2 bg-black/50 p-1 rounded-xl border border-zinc-800">
                        <button
                          type="button"
                          onClick={() =>
                            handleFieldChange(baseDef.modelSlug, "provider", "openrouter")
                          }
                          className={`py-2 px-3 rounded-lg text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            current.provider === "openrouter"
                              ? "bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/20"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Globe className="size-3.5" />
                          OpenRouter
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleFieldChange(baseDef.modelSlug, "provider", "runpod")
                          }
                          className={`py-2 px-3 rounded-lg text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            current.provider === "runpod"
                              ? "bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/20"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <Cpu className="size-3.5" />
                          RunPod (vLLM)
                        </button>
                      </div>

                      <p className="text-[11px] text-zinc-500 font-sans">
                        {current.provider === "openrouter"
                          ? "Tráfego direcionado pelo Gateway OpenRouter para o modelo configurado ao lado."
                          : "Tráfego direcionado diretamente para nós dedicados vLLM no RunPod."}
                      </p>
                    </div>

                    {/* Campos Específicos do Provedor Selecionado */}
                    <div className="lg:col-span-8 bg-black/40 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                      {current.provider === "openrouter" ? (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                            <span>Identificador do Modelo no OpenRouter</span>
                            <span className="text-[10px] text-zinc-400 font-normal">
                              Qualquer modelo do catálogo OpenRouter
                            </span>
                          </label>

                          <Input
                            value={current.openRouterModel}
                            onChange={(e) =>
                              handleFieldChange(
                                baseDef.modelSlug,
                                "openRouterModel",
                                e.target.value
                              )
                            }
                            placeholder="ex: qwen/qwen-2.5-coder-32b-instruct"
                            className="bg-black/70 border-zinc-700 text-xs font-mono text-zinc-200 focus:border-[#FF5500]"
                          />

                          {/* Sugestões rápidas de preenchimento */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-zinc-500">Atalhos rápidos:</span>
                            {[
                              "qwen/qwen-2.5-coder-32b-instruct",
                              "anthropic/claude-3.7-sonnet",
                              "deepseek/deepseek-r1",
                              "openai/gpt-4o",
                              "google/gemini-2.5-flash",
                            ].map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() =>
                                  handleFieldChange(
                                    baseDef.modelSlug,
                                    "openRouterModel",
                                    suggestion
                                  )
                                }
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              >
                                {suggestion.split("/")[1]}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                              <span>Identificador do Modelo no RunPod (vLLM)</span>
                              <span className="text-[10px] text-zinc-400 font-normal">
                                Nome do modelo carregado nos tensores
                              </span>
                            </label>

                            <Input
                              value={current.runpodModel}
                              onChange={(e) =>
                                handleFieldChange(
                                  baseDef.modelSlug,
                                  "runpodModel",
                                  e.target.value
                                )
                              }
                              placeholder="ex: deepseek-ai/DeepSeek-R1-Distill-Qwen-32B ou Qwen/Qwen2.5-Coder-32B-Instruct"
                              className="bg-black/70 border-zinc-700 text-xs font-mono text-zinc-200 focus:border-[#FF5500]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                              <span>Endpoint RunPod Customizado (Opcional)</span>
                              <span className="text-[10px] text-zinc-400 font-normal">
                                Deixe vazio para usar a URL padrão do painel
                              </span>
                            </label>

                            <Input
                              value={current.runpodEndpointUrl || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  baseDef.modelSlug,
                                  "runpodEndpointUrl",
                                  e.target.value
                                )
                              }
                              placeholder="https://api.runpod.ai/v2/<SEU_POD_ID>/openai/v1"
                              className="bg-black/70 border-zinc-700 text-xs font-mono text-zinc-200 focus:border-[#FF5500]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
