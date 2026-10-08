"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { X, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = useMutation(api.studioProjects.createProject);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor, informe o nome do projeto.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const projectId = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setName("");
      setDescription("");
      onCreated(projectId);
      onClose();
    } catch (err: any) {
      console.error("Erro ao criar projeto:", err);
      setError(err.message || "Falha ao criar o projeto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0D0E12] border border-white/15 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-16 -right-16 size-48 bg-[#FF5500]/15 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#FF5500]/20 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500]">
              <FolderPlus className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Novo Projeto
              </h2>
              <p className="text-xs text-zinc-400">
                Guarde e organize suas gerações de imagens e vídeos em uma pasta dedicada.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 relative z-10">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Nome do Projeto *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Comercial Neo-Tokyo 2026"
              className="bg-black/40 border-white/15 text-white placeholder:text-zinc-600 focus:border-[#FF5500]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Descrição (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Coletânea de cenas com chuva neon, personagens e tomadas aéreas..."
              rows={3}
              className="w-full rounded-xl p-2.5 bg-black/40 border border-white/15 text-white placeholder:text-zinc-600 focus:border-[#FF5500] focus:outline-none resize-none text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/10 text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="bg-[#FF5500] hover:bg-[#FF4500] text-white font-medium"
            >
              {isSubmitting ? "Criando..." : "Criar Projeto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
