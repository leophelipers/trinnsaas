"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Film,
  FolderKanban,
  FolderArchive,
  Users,
  Clapperboard,
  Sparkles,
  ChevronDown,
  Plus,
  Coins,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudioSidebarProps {
  selectedProjectId?: string | null;
  onSelectProject: (projectId: string | null) => void;
  onOpenCreateProjectModal: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function StudioSidebar({
  selectedProjectId,
  onSelectProject,
  onOpenCreateProjectModal,
  isCollapsed = false,
  onToggleCollapse,
}: StudioSidebarProps) {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const projects = useQuery(api.studioProjects.listProjects, { status: "active" }) || [];
  const creditBalance = useQuery(api.credits.getMyCredits);

  const currentProject = projects.find((p) => p._id === selectedProjectId);
  const totalCredits = creditBalance?.totalCredits ?? 0;

  return (
    <aside
      className={`bg-[#08090C] border-r border-white/10 flex flex-col shrink-0 h-screen sticky top-0 select-none z-30 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* 1. Header do Estúdio Cinematográfico */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors group"
              title="Voltar ao Painel Geral"
            >
              <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#FF5500]/10 group-hover:border-[#FF5500]/30 transition-all">
                <ArrowLeft className="size-4 text-zinc-400 group-hover:text-[#FF5500]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white tracking-wide">
                  kriativa<span className="text-[#FF5500]">.studio</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">CINEMA IDE</span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="border-[#FF5500]/30 bg-[#FF5500]/10 text-[#FF5500] text-[10px] font-mono px-1.5 py-0.5 uppercase tracking-wider"
              >
                PRO
              </Badge>
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  title="Recolher sidebar"
                >
                  <ChevronLeft className="size-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <Link
              href="/dashboard"
              className="size-8 rounded-lg bg-gradient-to-br from-[#FF5500] to-[#CC3700] text-white flex items-center justify-center font-bold text-xs shadow-md"
              title="Voltar ao Painel Geral"
            >
              K
            </Link>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Expandir sidebar"
              >
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Seletor de Projetos Ativos */}
      {!isCollapsed ? (
        <div className="p-3 border-b border-white/5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold mb-1.5 px-1">
            Projeto Ativo
          </div>
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-7 rounded-lg bg-gradient-to-br from-[#FF5500]/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                  <FolderKanban className="size-3.5 text-[#FF5500]" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-white truncate">
                    {currentProject ? currentProject.name : "Projeto Global (Geral)"}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {currentProject
                      ? `${currentProject.generationCount} mídias salvas`
                      : "Todas as gerações"}
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`size-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-1 ${
                  isProjectDropdownOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu de Projetos */}
            {isProjectDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F1015] border border-white/10 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  <button
                    onClick={() => {
                      onSelectProject(null);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      selectedProjectId === null
                        ? "bg-[#FF5500]/15 text-[#FF5500] font-medium"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <span>Projeto Global</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Geral</span>
                  </button>

                  {projects.map((proj) => (
                    <button
                      key={proj._id}
                      onClick={() => {
                        onSelectProject(proj._id);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        selectedProjectId === proj._id
                          ? "bg-[#FF5500]/15 text-[#FF5500] font-medium"
                          : "text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate mr-2">{proj.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {proj.generationCount}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      onOpenCreateProjectModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-[#FF5500] hover:bg-[#FF5500]/10 font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Novo Projeto Cinematográfico</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-2 border-b border-white/5 flex justify-center">
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="size-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#FF5500] cursor-pointer"
            title={currentProject ? `Projeto: ${currentProject.name}` : "Projeto Global"}
          >
            <FolderKanban className="size-4" />
          </button>
        </div>
      )}

      {/* 3. Navegação do Estúdio & Links do Painel */}
      <div className="flex-1 p-2 sm:p-3 space-y-3 overflow-y-auto">
        {/* Workspace Principal Ativo */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold mb-1 px-1">
              Workspace Ativo
            </div>
          )}

          <div
            className={`w-full flex items-center rounded-xl bg-[#FF5500] text-white shadow-[0_0_20px_rgba(255,85,0,0.3)] font-semibold ${
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
            } text-xs`}
            title="Estúdio & Linha do Tempo"
          >
            <Film className="size-4 shrink-0" />
            {!isCollapsed && <span>Estúdio de Renderização</span>}
          </div>
        </div>

        {/* Links rápidos para módulos do Dashboard */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          {!isCollapsed && (
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold mb-1.5 px-1">
              Módulos de Produção
            </div>
          )}

          <Link
            href={selectedProjectId ? `/dashboard/vault?projectId=${selectedProjectId}` : "/dashboard/vault"}
            className={`w-full flex items-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all ${
              isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2.5"
            } text-xs font-medium`}
            title="Cofre de Mídias (Vault)"
          >
            <div className="flex items-center gap-3">
              <FolderArchive className="size-4 shrink-0 text-[#00E5FF]" />
              {!isCollapsed && <span>Cofre de Mídias</span>}
            </div>
            {!isCollapsed && currentProject && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-400">
                {currentProject.generationCount}
              </span>
            )}
          </Link>

          <Link
            href={selectedProjectId ? `/dashboard/elements?projectId=${selectedProjectId}` : "/dashboard/elements"}
            className={`w-full flex items-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all ${
              isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2.5"
            } text-xs font-medium`}
            title="Atores & Elementos (@mentions)"
          >
            <div className="flex items-center gap-3">
              <Users className="size-4 shrink-0 text-purple-400" />
              {!isCollapsed && <span>Atores & Elementos (@)</span>}
            </div>
            {!isCollapsed && (
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-1.5 py-0 border-purple-500/30 text-purple-400 bg-purple-500/10"
              >
                Consistência
              </Badge>
            )}
          </Link>

          <Link
            href={selectedProjectId ? `/dashboard/scripts?projectId=${selectedProjectId}` : "/dashboard/scripts"}
            className={`w-full flex items-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all ${
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
            } text-xs font-medium`}
            title="Roteiro & Decupagem"
          >
            <Clapperboard className="size-4 shrink-0 text-amber-400" />
            {!isCollapsed && <span>Roteiro & Decupagem</span>}
          </Link>

          <Link
            href="/chat"
            className={`w-full flex items-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all ${
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
            } text-xs font-medium`}
            title="Kriativa Muse (Chat)"
          >
            <Sparkles className="size-4 shrink-0 text-[#00E5FF]" />
            {!isCollapsed && <span>Kriativa Muse (Chat)</span>}
          </Link>
        </div>
      </div>

      {/* 4. Rodapé com Saldo de Créditos e Retorno ao Dashboard */}
      <div className="p-3 border-t border-white/10 space-y-3 bg-[#050608]">
        {!isCollapsed ? (
          <>
            {/* Card de Créditos */}
            <div className="p-3 rounded-xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Coins className="size-3.5 text-amber-400" />
                  <span className="font-mono text-[11px]">Saldo Ativo</span>
                </div>
                <span className="font-mono font-bold text-white text-xs">
                  {totalCredits} <span className="text-[10px] text-zinc-500 font-normal">créditos</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-white/5">
                <span>Pagos: {creditBalance?.paidCredits ?? 0}</span>
                <span>Bônus: {creditBalance?.bonusCredits ?? 0}</span>
              </div>

              <Link href="/dashboard/credits" className="block w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-[11px] font-medium border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-white transition-colors"
                >
                  Recarregar Créditos
                </Button>
              </Link>
            </div>

            {/* Link de saída limpo */}
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-white py-1 transition-colors"
            >
              <span>Retornar à Visão Geral</span>
            </Link>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/dashboard/credits"
              className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400"
              title={`Saldo: ${totalCredits} créditos`}
            >
              <Coins className="size-4" />
            </Link>
            <Link
              href="/dashboard"
              className="size-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
              title="Retornar ao Dashboard"
            >
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
