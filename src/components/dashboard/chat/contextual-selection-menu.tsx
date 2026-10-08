"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Sparkles, HelpCircle, Copy, Check } from "lucide-react";

interface ContextualSelectionMenuProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onInsertToPrompt: (text: string) => void;
  onRewriteSelection: (text: string) => void;
  onExplainSelection: (text: string) => void;
}

export function ContextualSelectionMenu({
  containerRef,
  onInsertToPrompt,
  onRewriteSelection,
  onExplainSelection,
}: ContextualSelectionMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setPosition(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 3) {
        setPosition(null);
        return;
      }

      // Verifica se a seleção está dentro do container de mensagens
      if (containerRef.current && !containerRef.current.contains(selection.anchorNode)) {
        setPosition(null);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Posiciona a barra flutuante logo acima do trecho selecionado
        setPosition({
          x: Math.max(10, rect.left + rect.width / 2 - 140),
          y: Math.max(10, rect.top - 46),
        });
        setSelectedText(text);
      } catch {
        setPosition(null);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Se clicar dentro do menu, não cancela
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      // Se clicar fora, limpa a seleção
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          setPosition(null);
        }
      }, 50);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [containerRef]);

  if (!position || !selectedText) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
      setPosition(null);
      window.getSelection()?.removeAllRanges();
    }, 1200);
  };

  const handleInsert = () => {
    onInsertToPrompt(`> "${selectedText}"\n\n`);
    setPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleRewrite = () => {
    onRewriteSelection(selectedText);
    setPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleExplain = () => {
    onExplainSelection(selectedText);
    setPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 60,
      }}
      className="flex items-center gap-1 rounded-xl border border-zinc-700/80 bg-[#12131C] p-1 text-xs text-white shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      <button
        onClick={handleInsert}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-200 hover:bg-[#FF5500] hover:text-white transition-colors"
        title="Citar este trecho no prompt"
      >
        <Plus className="h-3 w-3" />
        <span>Citar</span>
      </button>

      <button
        onClick={handleRewrite}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-200 hover:bg-[#FF5500] hover:text-white transition-colors"
        title="Pedir para a IA reescrever este trecho"
      >
        <Sparkles className="h-3 w-3" />
        <span>Reescrever</span>
      </button>

      <button
        onClick={handleExplain}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-200 hover:bg-[#FF5500] hover:text-white transition-colors"
        title="Pedir para a IA explicar este trecho"
      >
        <HelpCircle className="h-3 w-3" />
        <span>Explicar</span>
      </button>

      <div className="h-3 w-px bg-zinc-700 mx-0.5" />

      <button
        onClick={handleCopy}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
        title="Copiar seleção"
      >
        {isCopied ? (
          <>
            <Check className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400">Copiado</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            <span>Copiar</span>
          </>
        )}
      </button>
    </div>
  );
}
