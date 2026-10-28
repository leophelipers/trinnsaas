"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Terminal,
  ShieldAlert,
  Code2,
  Sparkles,
  ExternalLink,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function ApiKeysManager() {
  const keys = useQuery(api.apiKeys.listMyApiKeys);
  const createApiKey = useMutation(api.apiKeys.createApiKey);
  const revokeApiKey = useMutation(api.apiKeys.revokeApiKey);

  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    setErrorMessage(null);

    try {
      const res = await createApiKey({ name: newKeyName.trim() });
      setNewlyCreatedKey(res.key);
      setNewKeyName("");
    } catch (err: any) {
      setErrorMessage(err?.message || "Falha ao gerar chave de API.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (keyId: Id<"apiKeys">) => {
    if (
      !confirm(
        "Tem certeza que deseja revogar esta chave de API? Qualquer integração conectada a ela (como o OpenCode) deixará de funcionar imediatamente."
      )
    ) {
      return;
    }

    try {
      await revokeApiKey({ keyId });
    } catch (err: any) {
      alert(err?.message || "Falha ao revogar chave.");
    }
  };

  const copyToClipboard = (text: string, isKey = true) => {
    navigator.clipboard.writeText(text);
    if (isKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    } else {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2500);
    }
  };

  const opencodeConfigSnippet = `{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "kriativa": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Kriativa AI Studio",
      "options": {
        "baseURL": "${typeof window !== "undefined" ? window.location.origin : "https://kriativa.app"}/api/v1",
        "apiKey": "${newlyCreatedKey || "krt_live_SUA_CHAVE_AQUI"}"
      },
      "models": {
        "kriativa-code": {
          "name": "Kriativa Code (Engenharia de Software)",
          "tool_call": true
        },
        "kriativa-mind": {
          "name": "Kriativa Mind (Direção & Raciocínio Híbrido)",
          "tool_call": true,
          "reasoning": true
        },
        "kriativa-reasoning": {
          "name": "Kriativa Reasoning (Instância Dedicada)",
          "tool_call": true,
          "reasoning": true
        },
        "kriativa-fast": {
          "name": "Kriativa Fast (Iterações Ultrarrápidas)",
          "tool_call": true
        }
      }
    }
  }
}`;

  return (
    <div className="space-y-6">
      {/* Header com destaque */}
      <div className="bg-[#0C0D12] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-[radial-gradient(ellipse_at_top_right,rgba(255,85,0,0.12),transparent_70%)] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
                <Code2 className="size-4" />
              </span>
              <h3 className="font-heading font-extrabold text-lg text-white tracking-tight uppercase">
                Acesso para Desenvolvedores & OpenCode
              </h3>
              <Badge className="bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30 font-mono text-[10px]">
                API v1
              </Badge>
            </div>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              Conecte ferramentas de desenvolvimento como <strong>OpenCode</strong>, <strong>Cursor</strong> ou <strong>Aider</strong> ao motor de inteligência e instâncias dedicadas do Kriativa com suporte nativo a <em>streaming</em> e <em>chamada de ferramentas (tool calling)</em>. O consumo de tokens é debitado automaticamente do seu saldo de créditos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono text-[11px] py-1 px-2.5"
            >
              <CheckCircle2 className="size-3 mr-1" />
              OPENAI-COMPATIBLE
            </Badge>
          </div>
        </div>
      </div>

      {/* Caixa de Chave Recém-Criada (Aparece apenas uma vez) */}
      {newlyCreatedKey && (
        <div className="p-5 rounded-2xl bg-[#0E1511] border border-emerald-500/40 relative animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
              <Key className="size-4" />
            </span>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-heading font-bold text-emerald-300">
                  Sua Chave de API foi gerada com sucesso!
                </h4>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                  Cópia Única
                </Badge>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Por motivos de segurança, esta chave <strong>não será exibida novamente</strong>. Copie e armazene em local seguro.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 bg-black/60 border border-emerald-500/30 rounded-xl px-3 py-2 font-mono text-xs text-emerald-200 select-all overflow-x-auto whitespace-nowrap">
                  {newlyCreatedKey}
                </div>
                <Button
                  onClick={() => copyToClipboard(newlyCreatedKey, true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs gap-1.5 shrink-0"
                >
                  {copiedKey ? (
                    <>
                      <Check className="size-3.5" />
                      Copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      Copiar Chave
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Criação de Chave */}
      <div className="bg-[#0C0D12] border border-white/10 rounded-2xl p-5">
        <h4 className="text-sm font-heading font-bold text-white mb-3 flex items-center gap-2">
          <Plus className="size-4 text-[#FF5500]" />
          Gerar Nova Chave de Acesso
        </h4>

        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Ex: OpenCode MacBook Pro, Cursor Dev, Agente de Pipeline"
              className="bg-black/50 border-white/10 text-xs text-white placeholder:text-neutral-500 focus:border-[#FF5500]"
              maxLength={50}
              disabled={isCreating}
            />
          </div>
          <Button
            type="submit"
            disabled={isCreating || !newKeyName.trim()}
            className="bg-[#FF5500] hover:bg-[#E04B00] text-white font-heading text-xs font-bold gap-1.5 shrink-0"
          >
            {isCreating ? (
              "Gerando..."
            ) : (
              <>
                <Key className="size-3.5" />
                Criar Chave
              </>
            )}
          </Button>
        </form>

        {errorMessage && (
          <p className="text-xs text-rose-400 mt-2 flex items-center gap-1.5">
            <AlertCircle className="size-3.5" />
            {errorMessage}
          </p>
        )}
      </div>

      {/* Lista de Chaves Ativas */}
      <div className="bg-[#0C0D12] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-heading font-bold text-white flex items-center gap-2">
            <Layers className="size-4 text-neutral-400" />
            Chaves Configuradas ({keys?.length ?? 0})
          </h4>
          <span className="text-[11px] text-neutral-500 font-mono">
            Máximo de 10 chaves ativas
          </span>
        </div>

        {keys === undefined ? (
          <div className="space-y-2 py-4">
            <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
            <Key className="size-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-400">
              Você ainda não possui chaves de API geradas.
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Crie uma chave acima para conectar seu ambiente OpenCode ao estúdio.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-black/40">
            {keys.map((k) => (
              <div
                key={k._id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-xs text-white">
                      {k.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        k.status === "active"
                          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                          : "border-neutral-500/30 text-neutral-400 bg-neutral-500/10 line-through"
                      }`}
                    >
                      {k.status === "active" ? "ATIVA" : "REVOGADA"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
                    <span className="text-neutral-300">{k.keyPrefix}</span>
                    <span>•</span>
                    <span>
                      Criada em {new Date(k.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    {k.lastUsedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Clock className="size-3" />
                          Último uso {new Date(k.lastUsedAt).toLocaleDateString("pt-BR")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {k.status === "active" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(k._id)}
                    className="text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs self-start sm:self-auto gap-1.5 h-8"
                  >
                    <Trash2 className="size-3.5" />
                    Revogar
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instruções de Configuração no OpenCode */}
      <div className="bg-[#0C0D12] border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-[#FF5500]" />
            <h4 className="text-sm font-heading font-bold text-white">
              Como configurar no OpenCode (`opencode.json`)
            </h4>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(opencodeConfigSnippet, false)}
            className="border-white/10 text-xs gap-1.5 text-neutral-300 hover:text-white"
          >
            {copiedConfig ? (
              <>
                <Check className="size-3.5 text-emerald-400" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copiar JSON
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-neutral-400">
          Adicione o bloco abaixo ao seu arquivo de configuração <code>opencode.json</code> para habilitar o Kriativa Studio como provedor nativo:
        </p>

        <pre className="p-4 rounded-xl bg-black/80 border border-white/10 text-[11px] font-mono text-neutral-300 overflow-x-auto leading-relaxed select-all">
          {opencodeConfigSnippet}
        </pre>

        <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
          <span className="font-semibold text-neutral-300">Dica:</span>
          <span>
            O endpoint também funciona diretamente com o <strong>Cursor</strong>, <strong>Continue.dev</strong> e qualquer cliente compatível com a API da OpenAI apontando a Base URL para <code>/api/v1</code>.
          </span>
        </div>
      </div>
    </div>
  );
}
