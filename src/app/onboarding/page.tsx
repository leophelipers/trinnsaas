import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserSyncTrigger } from "@/components/dashboard/user-sync-trigger";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Boas-vindas ao Estúdio | kriativa.app",
  description: "Configure sua conta, selecione seu nível com Inteligência Artificial e escolha como prefere criar.",
};

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#FF5500] selection:text-white relative overflow-x-hidden">
      {/* Sincronizador reativo com Convex */}
      <UserSyncTrigger />

      {/* Glow de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.15),transparent_70%)] pointer-events-none" />

      {/* Top Header Simplificado */}
      <header className="w-full border-b border-white/10 bg-[#050507]/80 backdrop-blur-xl py-4 px-4 sm:px-8 relative z-20">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-xl bg-gradient-to-br from-[#FF5500] via-[#FF4500] to-[#CC3700] text-white flex items-center justify-center font-heading font-black text-xs shadow-[0_0_15px_rgba(255,85,0,0.4)] border border-white/20">
              K
            </div>
            <div className="flex items-baseline">
              <span className="font-heading font-extrabold text-lg tracking-tight text-white uppercase">
                kriativa
              </span>
              <span className="font-mono text-xs text-[#FF5500] font-bold">
                .app
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Conta Ativa • 50 Créditos Grátis</span>
          </div>
        </div>
      </header>

      {/* Main Wizard Area */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8 sm:py-12 flex items-center justify-center relative z-10">
        <OnboardingWizard />
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-white/5 py-4 px-4 text-center text-[11px] font-mono text-neutral-500">
        © {new Date().getFullYear()} Kriativa.app — Plataforma Brasileira de Inteligência Artificial.
      </footer>
    </div>
  );
}
