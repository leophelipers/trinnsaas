"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  FileCode,
  FileText,
  Save,
  Copy,
  Check,
  X,
  Sparkles,
  Clapperboard,
  Maximize2,
  Minimize2,
  Eye,
  Code,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "./markdown-renderer";

interface ChatCanvasProps {
  conversationId: Id<"aiConversations">;
  isOpen: boolean;
  onClose: () => void;
  onSendToChatPrompt?: (promptText: string) => void;
  activeArtifact?: { title: string; content: string; language?: string } | null;
}

export function ChatCanvas({
  conversationId,
  isOpen,
  onClose,
  onSendToChatPrompt,
  activeArtifact,
}: ChatCanvasProps) {
  const dbArtifact = useQuery(api.chat.getCanvasArtifact, { conversationId });
  const saveArtifact = useMutation(api.chat.saveCanvasArtifact);
  const createTask = useMutation(api.tasks.add);

  const [title, setTitle] = useState("Artefato Criativo");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("preview");
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [taskCreatedMessage, setTaskCreatedMessage] = useState<string | null>(null);

  // Sincroniza dados com o artefato recebido (clique na mensagem) ou com o banco de dados
  useEffect(() => {
    if (activeArtifact) {
      setTitle(activeArtifact.title);
      setContent(activeArtifact.content);
      setActiveTab("preview");
    } else if (dbArtifact) {
      setTitle(dbArtifact.title);
      setContent(dbArtifact.content);
    }
  }, [activeArtifact, dbArtifact]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveArtifact({
        conversationId,
        title: title || "Documento Criativo",
        type: "screenplay",
        content,
      });
    } catch (err) {
      console.error("Erro ao salvar artefato no Canvas:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Direct-to-Studio: quebra o roteiro em tarefas de cena no estúdio
  const handleExportToStudioScenes = async () => {
    try {
      const sceneLines = content
        .split("\n")
        .filter((l) => l.startsWith("# CENA") || l.startsWith("SCENE") || l.startsWith("EXT.") || l.startsWith("INT."));

      const scenesToCreate =
        sceneLines.length > 0 ? sceneLines : [title || "Cena Criativa do Roteiro"];

      for (const sc of scenesToCreate) {
        await createTask({
          text: `[Cena Estúdio] ${sc.replace(/^[#\s]+/, "").trim()}`,
        });
      }

      setTaskCreatedMessage(`${scenesToCreate.length} cena(s) exportada(s) para o Studio!`);
      setTimeout(() => setTaskCreatedMessage(null), 4000);
    } catch (err) {
      console.error("Erro ao exportar cenas para tarefas do Studio:", err);
    }
  };

  const isHtml = content.trim().startsWith("<") && (content.includes("</html>") || content.includes("</div>") || content.includes("</svg>"));

  return (
    <div
      className={`flex flex-col border-l border-zinc-800 bg-[#090A0F] text-zinc-100 transition-all duration-300 z-20 ${
        isFullScreen ? "fixed inset-0 z-50 w-full" : "w-1/2 min-w-[380px] max-w-[750px]"
      }`}
    >
      {/* Barra Superior do Canvas estilo Claude Artifacts */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-800/80 px-4 bg-[#07080D]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF5500]/15 text-[#FF5500]">
            <FileCode className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-semibold text-xs text-white outline-none border-b border-transparent focus:border-zinc-700 truncate max-w-[180px]"
          />
        </div>

        {/* Seletor de Aba: Preview vs Código */}
        <div className="flex items-center rounded-lg bg-[#14151E] border border-zinc-800 p-0.5 text-xs">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === "preview"
                ? "bg-[#FF5500] text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>Visualizar</span>
          </button>

          <button
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === "editor"
                ? "bg-[#FF5500] text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Code className="h-3 w-3" />
            <span>Código</span>
          </button>
        </div>

        {/* Ações da Barra */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
            title="Copiar conteúdo"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
            title="Baixar arquivo"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
            title={isFullScreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-7 px-2.5 text-xs bg-[#FF5500] hover:bg-[#E04000] text-white gap-1 ml-1"
          >
            <Save className="h-3 w-3" />
            <span className="hidden sm:inline">{isSaving ? "Salvando..." : "Salvar"}</span>
          </Button>

          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white ml-1"
            title="Fechar Artefato"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notificação de Exportação para o Estúdio */}
      {taskCreatedMessage && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs text-emerald-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clapperboard className="h-3.5 w-3.5 text-emerald-400" />
            {taskCreatedMessage}
          </span>
          <button onClick={() => setTaskCreatedMessage(null)} className="text-zinc-500 hover:text-white">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Conteúdo do Canvas (Preview vs Editor) */}
      <div className="flex-1 p-5 overflow-y-auto bg-[#07080C]">
        {activeTab === "preview" ? (
          isHtml ? (
            <iframe
              srcDoc={content}
              title="Preview do Artefato"
              sandbox="allow-scripts"
              className="w-full h-full min-h-[400px] rounded-lg border border-zinc-800 bg-white text-black"
            />
          ) : (
            <div className="rounded-xl border border-zinc-800/80 bg-[#0B0C12] p-5 shadow-inner">
              <MarkdownRenderer content={content} />
            </div>
          )
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full min-h-[350px] resize-none bg-transparent font-mono text-xs sm:text-sm text-zinc-200 leading-relaxed outline-none border-none placeholder:text-zinc-700 selection:bg-[#FF5500]/30"
            placeholder="Edite o código ou texto do artefato aqui..."
            spellCheck={false}
          />
        )}
      </div>

      {/* Barra Inferior com Atalhos de Refinamento por IA */}
      <div className="border-t border-zinc-800/80 bg-[#07080D] p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5 font-medium text-zinc-300">
            <Sparkles className="h-3 w-3 text-[#FF5500]" />
            Ações Rápidas de Artefato:
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportToStudioScenes}
            className="h-6 text-[10px] border-zinc-700 hover:border-[#FF5500] text-zinc-200 hover:text-white gap-1"
          >
            <Clapperboard className="h-3 w-3 text-[#FF5500]" />
            Exportar como Cenas do Estúdio
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() =>
              onSendToChatPrompt?.(
                `Por favor, analise o seguinte artefato e melhore o código/texto adicionando mais detalhes e refinamento:\n\n\`\`\`\n${content.substring(0, 1500)}\n\`\`\``
              )
            }
            className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
          >
            ✨ Refinar Artefato
          </button>

          <button
            onClick={() =>
              onSendToChatPrompt?.(
                `Explique detalhadamente como este artefato funciona passo a passo:\n\n\`\`\`\n${content.substring(0, 1500)}\n\`\`\``
              )
            }
            className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
          >
            💡 Explicar Linha por Linha
          </button>

          <button
            onClick={() =>
              onSendToChatPrompt?.(
                `Converta este artefato para a formatação/linguagem solicitada:\n\n\`\`\`\n${content.substring(0, 1500)}\n\`\`\``
              )
            }
            className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
          >
            🔄 Converter Formato
          </button>
        </div>
      </div>
    </div>
  );
}
