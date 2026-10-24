"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type PreLaunchErrorBoundaryProps = {
  children: React.ReactNode;
};

type PreLaunchErrorBoundaryState = {
  error: Error | null;
};

/**
 * Error Boundary da Sala VIP: evita que um erro de rede/renovação de query
 * derrube a página inteira (tela preta). Exibe fallback com reload.
 */
export class PreLaunchErrorBoundary extends React.Component<
  PreLaunchErrorBoundaryProps,
  PreLaunchErrorBoundaryState
> {
  state: PreLaunchErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): PreLaunchErrorBoundaryState {
    return {
      error:
        error instanceof Error
          ? error
          : new Error("Erro inesperado na Sala VIP de Pré-Lançamento."),
    };
  }

  componentDidCatch(error: unknown): void {
    console.error("Erro na Sala VIP de Pré-Lançamento:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#040406] flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="size-12 rounded-2xl bg-white/[0.04] border border-white/[0.12] flex items-center justify-center text-[#FF5500] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)]">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-2 max-w-md">
            <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
              Algo deu errado
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Não conseguimos carregar seus 3 passos de pré-lançamento. Verifique
              sua conexão e recarregue a página.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto min-h-[46px] px-5 py-3 rounded-2xl font-semibold text-xs uppercase tracking-[0.11em] bg-gradient-to-b from-[#FF6214] to-[#E64800] hover:from-[#FF712B] hover:to-[#FF5500] text-white border border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className="size-4" />
            <span>Recarregar Página</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
