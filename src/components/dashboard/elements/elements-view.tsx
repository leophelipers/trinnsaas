"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ElementsManagerView } from "@/components/dashboard/studio/elements-manager-view";
import {
  Users,
  FolderKanban,
  Sparkles,
  ChevronDown,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ElementsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId") || null;

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const projects = useQuery(api.studioProjects.listProjects, { status: "active" }) || [];
  const currentProject = projects.find((p) => p._id === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Top Banner de Atores e Elementos */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0C0D12] via-[#14101F] to-[#0C0D12] border border-white/10 p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Glows de Fundo */}
        <div className="absolute top-0 right-1/4 w-80 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-32 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/25 to-purple-500/5 text-purple-400 border border-purple-500/30 shadow-md">
                <Users className="size-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black uppercase tracking-tight text-white">
                Atores & Elementos (@)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-2xl leading-relaxed">
              Consistência visual para produções cinematográficas. Cadastre personagens com referências faciais,
              objetos de cena (props), locações e estilos visuais para convocá-los em qualquer tomada usando menções <code className="text-[#FF5500] font-mono">@</code>.
            </p>
          </div>

          {/* Controles de Projeto e Ação Rápida */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Seletor de Projeto */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-all font-medium"
              >
                <FolderKanban className="size-3.5 text-purple-400" />
                <span className="max-w-[140px] truncate">
                  {currentProject ? currentProject.name : "Todos os Projetos"}
                </span>
                <ChevronDown
                  className={`size-3.5 text-neutral-400 transition-transform ${
                    isProjectDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProjectDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0C0D12] p-1.5 shadow-2xl z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(null);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedProjectId === null
                        ? "bg-purple-500/15 text-purple-400"
                        : "text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    Todos os Projetos (Geral)
                  </button>
                  {projects.map((proj) => (
                    <button
                      key={proj._id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(proj._id);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedProjectId === proj._id
                          ? "bg-purple-500/15 text-purple-400"
                          : "text-neutral-300 hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate">{proj.name}</span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {proj.elementCount || 0}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => router.push("/dashboard/studio")}
              className="bg-[#FF5500] hover:bg-[#FF4500] text-white gap-2 text-xs font-bold shadow-lg shadow-[#FF5500]/25 rounded-xl h-9"
            >
              <Film className="size-3.5" />
              <span>Abrir Estúdio</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Gerenciador de Elementos */}
      <ElementsManagerView
        selectedProjectId={selectedProjectId}
        onUseElementInPrompt={(tag) => {
          const params = new URLSearchParams();
          params.set("prompt", `@${tag} `);
          if (selectedProjectId) params.set("projectId", selectedProjectId);
          router.push(`/dashboard/studio?${params.toString()}`);
        }}
      />
    </div>
  );
}
