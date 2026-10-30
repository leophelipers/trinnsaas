"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser, SignIn } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Laptop,
  Smartphone,
  Terminal,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRE_LAUNCH_CLERK_APPEARANCE } from "@/lib/clerk/prelaunch-modal";

function ConnectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const balance = useQuery(api.credits.getMyCredits);
  const createApiKey = useMutation(api.apiKeys.createApiKey);

  const rawAppName = searchParams.get("app") || "Kriativa App";
  const callbackUrl = searchParams.get("callback") || "kriativa://auth";
  const appType = searchParams.get("type") || "desktop"; // desktop | mobile | cli

  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorizedKey, setAuthorizedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAppIcon = () => {
    if (appType === "mobile" || rawAppName.toLowerCase().includes("mobile")) {
      return <Smartphone className="size-6 text-[#FF5500]" />;
    }
    if (appType === "cli" || rawAppName.toLowerCase().includes("cli") || rawAppName.toLowerCase().includes("opencode")) {
      return <Terminal className="size-6 text-[#FF5500]" />;
    }
    return <Laptop className="size-6 text-[#FF5500]" />;
  };

  const handleAuthorize = async () => {
    if (!isSignedIn) return;
    setIsAuthorizing(true);
    setError(null);

    try {
      const dateStr = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      const keyName = `${rawAppName} (${dateStr})`;

      const res = await createApiKey({ name: keyName });
      const generatedKey = res.key;
      setAuthorizedKey(generatedKey);

      // Constrói a URL do Deep Link de retorno
      const hasQuery = callbackUrl.includes("?");
      const separator = hasQuery ? "&" : "?";
      const userName = user?.fullName || user?.firstName || "Criador";
      const userEmail = user?.primaryEmailAddress?.emailAddress || "";
      const userId = user?.id || "";

      const redirectTarget = `${callbackUrl}${separator}key=${encodeURIComponent(
        generatedKey
      )}&userId=${encodeURIComponent(userId)}&name=${encodeURIComponent(
        userName
      )}&email=${encodeURIComponent(userEmail)}`;

      // Redireciona o navegador para o Deep Link do aplicativo
      window.location.href = redirectTarget;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Falha ao autorizar o aplicativo."
      );
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleCopyKey = () => {
    if (!authorizedKey) return;
    navigator.clipboard.writeText(authorizedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center text-zinc-400">
        <Loader2 className="size-6 animate-spin text-[#FF5500]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#FF5500] selection:text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.15),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header com os Logos Conectados */}
        <div className="flex items-center justify-center gap-4 py-2">
          {/* Logo Kriativa */}
          <div className="size-14 rounded-2xl bg-gradient-to-br from-[#FF5500] via-[#FF4500] to-[#CC3700] text-white flex items-center justify-center font-heading font-black text-xl shadow-[0_0_25px_rgba(255,85,0,0.4)] border border-white/20">
            K
          </div>

          {/* Linha de Conexão com Pulso */}
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-white/20" />
            <div className="w-10 h-0.5 bg-gradient-to-r from-[#FF5500] to-white/40 animate-pulse" />
            <span className="size-1.5 rounded-full bg-white/40" />
          </div>

          {/* Logo do App Cliente */}
          <div className="size-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-inner">
            {getAppIcon()}
          </div>
        </div>

        {/* Card Principal */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {!isSignedIn ? (
            <div className="space-y-6 text-center">
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-white uppercase">
                  Conectar ao {rawAppName}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1.5">
                  Faça login na sua conta Kriativa para autorizar a conexão instantânea.
                </p>
              </div>

              <div className="flex justify-center">
                <SignIn
                  routing="hash"
                  appearance={PRE_LAUNCH_CLERK_APPEARANCE}
                  signUpFallbackRedirectUrl={`/connect?${searchParams.toString()}`}
                  fallbackRedirectUrl={`/connect?${searchParams.toString()}`}
                />
              </div>
            </div>
          ) : authorizedKey ? (
            /* Tela de Sucesso após autorização */
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="size-6" />
              </div>

              <div>
                <h2 className="text-xl font-heading font-black text-white uppercase tracking-tight">
                  Aplicativo Conectado!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Abrindo o <span className="text-white font-medium">{rawAppName}</span> automaticamente...
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-left">
                <p className="text-[11px] text-neutral-400 font-mono flex items-center justify-between">
                  <span>TOKEN DE ACESSO DO APP</span>
                  <span className="text-emerald-400 font-bold">ATIVO</span>
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={authorizedKey}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopyKey}
                    className="shrink-0 border-white/10 bg-white/5 hover:bg-white/10 text-xs gap-1.5"
                  >
                    {copiedKey ? (
                      <Check className="size-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copiedKey ? "Copiado" : "Copiar"}
                  </Button>
                </div>
                <p className="text-[10px] text-neutral-500">
                  Caso o app não tenha aberto sozinho no seu dispositivo, copie a chave acima e cole em Configurações.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => {
                    const hasQuery = callbackUrl.includes("?");
                    const separator = hasQuery ? "&" : "?";
                    window.location.href = `${callbackUrl}${separator}key=${encodeURIComponent(
                      authorizedKey
                    )}`;
                  }}
                  className="w-full h-11 bg-gradient-to-r from-[#FF5500] to-[#E64D00] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.3)] hover:brightness-110"
                >
                  Abrir {rawAppName} Novamente
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="w-full text-xs text-neutral-400 hover:text-white"
                >
                  Ir para o Dashboard Web
                </Button>
              </div>
            </div>
          ) : (
            /* Tela Principal de Autorização */
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] text-[11px] font-mono uppercase tracking-wider font-bold mb-2">
                  <Zap className="size-3" />
                  Conexão em 1-Clique
                </div>
                <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-white uppercase">
                  Autorizar {rawAppName}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Conectando com sua conta{" "}
                  <span className="text-white font-medium">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                  </span>
                </p>
              </div>

              {/* Informações de Permissões */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                  O {rawAppName} poderá:
                </p>
                <ul className="space-y-2 text-xs text-neutral-300">
                  <li className="flex items-start gap-2">
                    <Sparkles className="size-4 text-[#FF5500] shrink-0 mt-0.5" />
                    <span>
                      Executar gerações com os modelos proprietários da Kriativa (Vision, Motion, Voice e Mind).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Utilizar o saldo de créditos ({balance?.totalCredits ?? 0} disponíveis) ou cota da sua assinatura.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="size-4 text-neutral-400 shrink-0 mt-0.5" />
                    <span>
                      Conectar-se via API OpenAI-Compatible de altíssima velocidade. Você pode revogar o acesso a qualquer momento pelo painel web.
                    </span>
                  </li>
                </ul>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              {/* Ações */}
              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={handleAuthorize}
                  disabled={isAuthorizing}
                  className="w-full h-12 bg-gradient-to-r from-[#FF5500] to-[#E64D00] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.3)] hover:brightness-110 flex items-center justify-center gap-2"
                >
                  {isAuthorizing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Autorizando...
                    </>
                  ) : (
                    <>
                      Autorizar e Conectar
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="w-full text-xs text-neutral-400 hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Minimalista */}
        <p className="text-center text-[11px] font-mono text-neutral-500 flex items-center justify-center gap-1.5">
          <Lock className="size-3" />
          Kriativa.app • Autenticação Criptografada Padrão Indústria
        </p>
      </div>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050507] flex items-center justify-center text-zinc-400">
          <Loader2 className="size-6 animate-spin text-[#FF5500]" />
        </div>
      }
    >
      <ConnectContent />
    </Suspense>
  );
}
