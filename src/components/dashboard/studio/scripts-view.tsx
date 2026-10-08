"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  FileText,
  Sparkles,
  Plus,
  Play,
  Film,
  Clock,
  Trash2,
  Copy,
  Check,
  Save,
  CloudCheck,
  Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SceneItem {
  id: string;
  sceneNumber: number;
  header: string;
  visualPrompt: string;
  audioCues: string;
  cameraMovement: string;
}

interface ScriptsViewProps {
  selectedProjectId?: string | null;
  onSendToStudio?: (prompt: string, camera?: string) => void;
}

const DEFAULT_FALLBACK_SCENES: SceneItem[] = [
  {
    id: "sc-1",
    sceneNumber: 1,
    header: "EXT. NEO-TÓQUIO - BECO CIBERNÉTICO - NOITE",
    visualPrompt:
      "Chuva torrencial reflete letreiros em neon ciano e magenta sobre o asfalto molhado. @Elena caminha com passo firme segurando um guarda-chuva holográfico.",
    audioCues:
      "Pingos pesados de chuva no asfalto, buzinas abafadas ao longe, zumbido elétrico de néon.",
    cameraMovement: "Tracking Shot (Acompanhamento)",
  },
  {
    id: "sc-2",
    sceneNumber: 2,
    header: "INT. SEDE CORPORATIVA ARASAKA - ANDAR 80 - MADRUGADA",
    visualPrompt:
      "Plano amplo contemplativo através de janelas do chão ao teto revelando uma metrópole futurista infinita. Silhueta misteriosa observa a cidade com copo de uísque.",
    audioCues:
      "Ar condicionado suave, som de gelo tilintando no copo de vidro, silêncio tenso de suspense.",
    cameraMovement: "Push-in (Aproximação)",
  },
];

export function ScriptsView({
  selectedProjectId,
  onSendToStudio,
}: ScriptsViewProps) {
  const [activeScriptId, setActiveScriptId] = useState<Id<"studioScripts"> | null>(null);
  const [scenes, setScenes] = useState<SceneItem[]>(DEFAULT_FALLBACK_SCENES);
  const [scriptTitle, setScriptTitle] = useState("Roteiro Master Principal");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);

  // Convex Queries e Mutações
  const scriptsList = useQuery(api.studioScripts.listScripts, {
    projectId: selectedProjectId ? (selectedProjectId as Id<"studioProjects">) : undefined,
  });

  const getOrCreateScriptMutation = useMutation(api.studioScripts.getOrCreateActiveScript);
  const saveScenesMutation = useMutation(api.studioScripts.saveScenes);

  // Carrega ou inicializa o script ativo na montagem
  useEffect(() => {
    let isMounted = true;

    async function initScript() {
      try {
        const script = await getOrCreateScriptMutation({
          projectId: selectedProjectId ? (selectedProjectId as Id<"studioProjects">) : undefined,
        });
        if (isMounted && script) {
          setActiveScriptId(script._id);
          setScriptTitle(script.title);
          if (script.scenes && script.scenes.length > 0) {
            setScenes(script.scenes);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar roteiro do Convex:", err);
      }
    }

    initScript();

    return () => {
      isMounted = false;
    };
  }, [selectedProjectId, getOrCreateScriptMutation]);

  // Debounce de auto-save no Convex
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSave = (updatedScenes: SceneItem[]) => {
    if (!activeScriptId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveScenesMutation({
          scriptId: activeScriptId,
          scenes: updatedScenes,
        });
        setLastSavedTime(Date.now());
      } catch (err) {
        console.error("Erro ao salvar cenas no Convex:", err);
      } finally {
        setIsSaving(false);
      }
    }, 800);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddScene = () => {
    const nextNum = scenes.length + 1;
    const newScene: SceneItem = {
      id: `sc-${Date.now()}`,
      sceneNumber: nextNum,
      header: `INT./EXT. CENA ${nextNum} - HORÁRIO`,
      visualPrompt: "Descreva os acontecimentos visuais, iluminação e enquadramento desta tomada...",
      audioCues: "Efeitos sonoros e sons ambientes...",
      cameraMovement: "Push-in (Aproximação)",
    };
    const next = [...scenes, newScene];
    setScenes(next);
    triggerSave(next);
  };

  const handleDeleteScene = (id: string) => {
    const next = scenes
      .filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    setScenes(next);
    triggerSave(next);
  };

  const handleUpdateScene = (id: string, field: keyof SceneItem, value: any) => {
    const next = scenes.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    setScenes(next);
    triggerSave(next);
  };

  return (
    <div className="flex-1 flex flex-col p-2 sm:p-4 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header com Status de Sincronização */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {scriptTitle}
            </h2>
            <Badge
              variant="outline"
              className="border-[#FF5500]/30 bg-[#FF5500]/10 text-[#FF5500] font-mono text-[10px]"
            >
              Master Scene
            </Badge>

            {/* Indicador de Nuvem / Auto-save */}
            <div className="flex items-center gap-1.5 ml-2 text-[10px] font-mono text-neutral-400">
              {isSaving ? (
                <>
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400">Salvando no Convex...</span>
                </>
              ) : (
                <>
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400">Sincronizado</span>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-400">
            Estruture suas cenas cinematográficas e envie cada tomada diretamente para o Estúdio de Renderização.
          </p>
        </div>

        <Button
          onClick={handleAddScene}
          className="bg-[#FF5500] hover:bg-[#FF4500] text-white gap-2 text-xs font-semibold shrink-0 shadow-lg shadow-[#FF5500]/20 rounded-xl"
        >
          <Plus className="size-4" />
          <span>Adicionar Cena</span>
        </Button>
      </div>

      {/* Lista de Cenas Decupadas */}
      <div className="space-y-4">
        {scenes.map((sc) => (
          <div
            key={sc.id}
            className="rounded-2xl bg-[#0D0E12] border border-white/10 p-5 space-y-4 shadow-xl hover:border-white/20 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <span className="size-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-[#FF5500]">
                  #{sc.sceneNumber}
                </span>
                <input
                  type="text"
                  value={sc.header}
                  onChange={(e) => handleUpdateScene(sc.id, "header", e.target.value)}
                  className="bg-transparent font-mono font-bold text-xs text-white focus:outline-none focus:border-b border-[#FF5500] max-w-lg w-full"
                  placeholder="EXT./INT. LOCAL - HORÁRIO"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(sc.visualPrompt, sc.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Copiar prompt da cena"
                >
                  {copiedId === sc.id ? (
                    <Check className="size-3.5 text-green-400" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteScene(sc.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remover cena"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Prompt Visual */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">
                Direção Visual / Prompt de Geração
              </label>
              <textarea
                value={sc.visualPrompt}
                onChange={(e) => handleUpdateScene(sc.id, "visualPrompt", e.target.value)}
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FF5500] resize-none"
              />
            </div>

            {/* Sonoplastia e Câmera */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                  Sonoplastia / Pistas de Áudio
                </label>
                <input
                  type="text"
                  value={sc.audioCues}
                  onChange={(e) => handleUpdateScene(sc.id, "audioCues", e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                  Movimento de Câmera Previsto
                </label>
                <input
                  type="text"
                  value={sc.cameraMovement}
                  onChange={(e) => handleUpdateScene(sc.id, "cameraMovement", e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#FF5500]"
                />
              </div>
            </div>

            {/* Botão de Enviar Cena para o Estúdio */}
            {onSendToStudio && (
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => onSendToStudio(sc.visualPrompt, sc.cameraMovement)}
                  className="bg-[#FF5500]/15 hover:bg-[#FF5500]/25 border border-[#FF5500]/30 text-[#FF5500] hover:text-white text-xs h-8 gap-2 font-medium rounded-xl"
                >
                  <Play className="size-3.5 fill-current" />
                  <span>Renderizar Cena no Estúdio</span>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
