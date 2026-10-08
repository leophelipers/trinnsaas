"use client";

import React, { useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Image as ImageIcon,
  Upload,
  X,
  Check,
  Search,
  Clock,
  Sparkles,
  Loader2,
  HardDrive,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VaultImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, storageId?: Id<"_storage">, prompt?: string) => void;
  onUploadLocalFile: (file: File) => void;
  isUploading?: boolean;
  title?: string;
  subtitle?: string;
}

export function VaultImagePickerModal({
  isOpen,
  onClose,
  onSelectImage,
  onUploadLocalFile,
  isUploading = false,
  title = "Selecionar Imagem de Referência / Quadro Inicial",
  subtitle = "Escolha uma imagem gerada anteriormente no estúdio ou faça upload do seu computador.",
}: VaultImagePickerModalProps) {
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consulta todas as imagens geradas pelo usuário
  const myGenerations = useQuery(api.studioGenerations.listMyGenerations, {
    limit: 60,
  });

  if (!isOpen) return null;

  // Filtra apenas imagens concluídas com outputUrl
  const imageGenerations = (myGenerations || []).filter(
    (g: any) =>
      g.type === "image" &&
      g.status === "completed" &&
      Boolean(g.outputUrl) &&
      (search.trim() === "" || g.prompt?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] bg-[#0C0D12] border border-white/15 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-20 -right-20 size-60 bg-[#FF5500]/10 blur-3xl pointer-events-none" />

        {/* Header do Modal */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500]">
              <ImageIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{title}</h2>
              <p className="text-xs text-zinc-400">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Barra de Ação Superior: Upload do Computador + Campo de Busca */}
        <div className="p-4 border-b border-white/5 bg-black/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="size-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por descrição ou prompt nas suas imagens..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FF5500]/50"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onUploadLocalFile(file);
                  onClose();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="border-[#FF5500]/30 bg-[#FF5500]/10 hover:bg-[#FF5500]/20 text-[#FF5500] text-xs h-9 gap-1.5 font-medium"
            >
              {isUploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              <span>Fazer Upload do Computador</span>
            </Button>
          </div>
        </div>

        {/* Galeria de Imagens Geradas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          {imageGenerations.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 mb-3">
                <ImageIcon className="size-6" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Nenhuma imagem encontrada
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mb-4">
                Você ainda não gerou imagens no estúdio ou o termo de busca não retornou resultados.
              </p>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#FF5500] hover:bg-[#FF4500] text-white text-xs gap-1.5"
              >
                <Upload className="size-3.5" />
                <span>Enviar Imagem do Computador</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imageGenerations.map((item: any) => (
                <div
                  key={item._id}
                  onClick={() => {
                    onSelectImage(item.outputUrl, item.outputStorageId, item.prompt);
                    onClose();
                  }}
                  className="group relative rounded-xl border border-white/10 hover:border-[#FF5500] bg-black/40 overflow-hidden cursor-pointer transition-all aspect-square flex flex-col justify-end"
                >
                  <img
                    src={item.outputUrl}
                    alt={item.prompt}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Conteúdo sobreposto */}
                  <div className="relative p-2.5 z-10">
                    <p className="text-[11px] text-white font-medium line-clamp-2 leading-snug mb-1">
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                      <span>{item.aspectRatio || "16:9"}</span>
                      <span className="text-[#FF5500] font-semibold group-hover:underline">
                        Usar Imagem →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-400">
            {imageGenerations.length} imagens disponíveis no seu cofre
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-white/10 text-zinc-300 hover:text-white text-xs"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
