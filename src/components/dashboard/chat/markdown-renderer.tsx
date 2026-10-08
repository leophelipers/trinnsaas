"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Columns, FileCode, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkdownRendererProps {
  content: string;
  onOpenArtifact?: (artifact: { title: string; content: string; language: string }) => void;
}

export function MarkdownRenderer({ content, onOpenArtifact }: MarkdownRendererProps) {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed break-words space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Títulos
          h1: ({ node, ...props }) => (
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight mt-4 mb-2 pb-1 border-b border-zinc-800" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight mt-3 mb-1.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-[#FF8844] mt-2 mb-1" {...props} />
          ),

          // Negrito e Itálico
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white tracking-wide" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-zinc-300" {...props} />
          ),

          // Parágrafos
          p: ({ node, ...props }) => (
            <p className="leading-relaxed text-zinc-200 my-1.5" {...props} />
          ),

          // Listas
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 my-2 space-y-1 text-zinc-300" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1 text-zinc-300" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed pl-1" {...props} />
          ),

          // Citações
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-[#FF5500] bg-[#101117] pl-3.5 pr-2 py-1.5 rounded-r my-2.5 text-zinc-400 italic" {...props} />
          ),

          // Tabelas
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-zinc-800">
              <table className="w-full text-left border-collapse text-xs" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#12131A] text-zinc-200 border-b border-zinc-800" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="p-2.5 font-semibold text-white" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="p-2.5 border-b border-zinc-800/60 text-zinc-300" {...props} />
          ),

          // Links
          a: ({ node, ...props }) => (
            <a className="text-[#FF5500] hover:underline inline-flex items-center gap-0.5 font-medium" target="_blank" rel="noopener noreferrer" {...props} />
          ),

          // Blocos de Código e Código Inline
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const rawCode = String(children).replace(/\n$/, "");
            const isMultiline = !inline && (Boolean(language) || rawCode.includes("\n"));
            const codeBlockId = `code_${rawCode.substring(0, 15).replace(/\s/g, "")}`;

            if (!isMultiline) {
              return (
                <code
                  className="rounded bg-[#171822] border border-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-[#FF8844]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="my-3 overflow-hidden rounded-xl border border-zinc-800 bg-[#08090D] shadow-xl group/code">
                {/* Header do Código / Artifact Card */}
                <div className="flex h-9 items-center justify-between border-b border-zinc-800/80 bg-[#0E0F16] px-3 text-xs">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-3.5 w-3.5 text-[#FF5500]" />
                    <span className="font-mono text-[11px] font-semibold text-zinc-300 uppercase">
                      {language || "code"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenArtifact && (
                      <button
                        onClick={() =>
                          onOpenArtifact({
                            title: `Artefato (${language || "Documento"})`,
                            content: rawCode,
                            language: language || "text",
                          })
                        }
                        className="flex items-center gap-1 rounded bg-[#171822] hover:bg-[#FF5500]/20 hover:text-[#FF5500] px-2 py-1 text-[10px] text-zinc-300 transition-colors"
                        title="Abrir e editar no Split Canvas ao lado (estilo Claude Artifacts)"
                      >
                        <Columns className="h-3 w-3" />
                        <span>Abrir no Canvas</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyCode(rawCode, codeBlockId)}
                      className="flex items-center gap-1 rounded bg-[#171822] hover:bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300 transition-colors"
                      title="Copiar código"
                    >
                      {copiedCodeId === codeBlockId ? (
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
                </div>

                {/* Bloco de Código */}
                <pre className="overflow-x-auto p-3.5 font-mono text-[12px] leading-relaxed text-zinc-200">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
