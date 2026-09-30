"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  ToggleLeft,
  ToggleRight,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Layers,
  CreditCard,
  Coins,
  Video,
  Terminal,
  Zap,
  Lock,
} from "lucide-react";
import { AdminNavBar } from "./admin-nav-bar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function FeatureFlagsView() {
  const flags = useQuery(api.featureFlags.getAllFeatureFlags);
  const toggleFlag = useMutation(api.featureFlags.toggleFeatureFlag);
  const seedDefaults = useMutation(api.featureFlags.seedDefaultFeatureFlags);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isUpdatingKey, setIsUpdatingKey] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    try {
      setIsUpdatingKey(key);
      const nextEnabled = !currentEnabled;
      await toggleFlag({ key, enabled: nextEnabled });
      setFeedbackMessage(
        `Feature Flag "${key}" foi ${nextEnabled ? "ATIVADA" : "DESATIVADA"} com sucesso.`
      );
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      alert(`Erro ao alterar feature flag: ${err.message || "Erro desconhecido"}`);
    } finally {
      setIsUpdatingKey(null);
    }
  };

  const handleRestoreDefaults = async () => {
    if (
      !confirm(
        "Deseja restaurar as Feature Flags padrão do sistema? Flags existentes não serão sobrescritas se já estiverem gravadas."
      )
    ) {
      return;
    }
    try {
      await seedDefaults({});
      setFeedbackMessage("Feature Flags padrão sincronizadas com sucesso.");
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      alert(`Erro ao sincronizar: ${err.message || "Erro"}`);
    }
  };

  // Filtragem
  const filteredFlags = (flags || []).filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || f.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalCount = flags?.length || 0;
  const activeCount = flags?.filter((f) => f.enabled).length || 0;
  const inactiveCount = totalCount - activeCount;
  const isMaintenanceActive = Boolean(
    flags?.find((f) => f.key === "maintenance_mode")?.enabled
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Admin Navigation Bar */}
      <AdminNavBar currentTab="flags" />

      {/* Header & Master Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500]">
              <Sliders className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-white">
                Feature Flags & Governança
              </h1>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                Controle em tempo real de ativação de recursos, gateways e módulos do estúdio.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestoreDefaults}
            className="border-white/10 hover:border-white/20 hover:bg-white/5 text-xs text-neutral-300 font-mono"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Sincronizar Padrões
          </Button>
        </div>
      </div>

      {/* Alerta de Feedback Rápido */}
      {feedbackMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Alerta de Modo Manutenção Geral Ativo */}
      {isMaintenanceActive && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_30px_rgba(244,63,94,0.15)] animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-6 text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-heading font-bold uppercase tracking-wider text-white">
                Atenção: Modo Manutenção Geral Ativado
              </p>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Todas as operações financeiras e de criação estão pausadas para os usuários regulares. Apenas administradores têm permissão de acesso.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => handleToggle("maintenance_mode", true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-heading text-xs uppercase tracking-wider shrink-0"
          >
            Desativar Manutenção
          </Button>
        </div>
      )}

      {/* Métricas e Resumo Rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#0C0D12] border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Total de Flags
          </span>
          <p className="text-2xl font-heading font-bold text-white">
            {totalCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0D12] border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
            Recursos Ativos
          </span>
          <p className="text-2xl font-heading font-bold text-emerald-400">
            {activeCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0D12] border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Recursos Desativados
          </span>
          <p className="text-2xl font-heading font-bold text-neutral-300">
            {inactiveCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0D12] border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Status Geral
          </span>
          <div className="flex items-center gap-2 pt-1">
            <span
              className={`size-2 rounded-full ${
                isMaintenanceActive ? "bg-rose-500 animate-ping" : "bg-emerald-400"
              }`}
            />
            <span
              className={`text-xs font-mono font-bold uppercase ${
                isMaintenanceActive ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {isMaintenanceActive ? "Manutenção" : "100% Operacional"}
            </span>
          </div>
        </div>
      </div>

      {/* Controles de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0C0D12] border border-white/10 p-3 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar por chave ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.03] border-white/10 text-xs h-9 text-white placeholder:text-neutral-500 focus-visible:ring-[#FF5500]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "Todas", icon: Layers },
            { id: "payments", label: "Pagamentos", icon: CreditCard },
            { id: "credits", label: "Créditos", icon: Coins },
            { id: "studio", label: "Estúdio", icon: Video },
            { id: "system", label: "Sistema", icon: Terminal },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FF5500] text-white font-bold shadow-md shadow-[#FF5500]/20"
                    : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards de Feature Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredFlags.map((flag) => {
          const isPending = isUpdatingKey === flag.key;
          const isMaintenance = flag.key === "maintenance_mode";

          return (
            <div
              key={flag.key}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isMaintenance && flag.enabled
                  ? "bg-rose-950/20 border-rose-500/40 shadow-lg"
                  : flag.enabled
                  ? "bg-[#0C0D12] border-white/10 hover:border-white/20"
                  : "bg-[#08090C] border-white/5 opacity-80"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-white">
                        {flag.name}
                      </span>
                      <Badge
                        className={`text-[9px] uppercase font-mono px-2 py-0 border ${
                          flag.category === "payments"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : flag.category === "credits"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : flag.category === "studio"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-neutral-500/10 text-neutral-400 border-white/10"
                        }`}
                      >
                        {flag.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-mono text-[#FF5500] bg-[#FF5500]/10 px-2 py-0.5 rounded-lg border border-[#FF5500]/20">
                        {flag.key}
                      </code>
                    </div>
                  </div>

                  {/* Switch de Ativação em Tempo Real */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase ${
                        flag.enabled ? "text-emerald-400" : "text-neutral-500"
                      }`}
                    >
                      {flag.enabled ? "Ativo" : "Inativo"}
                    </span>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggle(flag.key, flag.enabled)}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  {flag.description}
                </p>
              </div>

              {/* Rodapé com Informações de Auditoria */}
              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>
                  Modificado por:{" "}
                  <strong className="text-neutral-400">
                    {flag.updatedBy || "Sistema"}
                  </strong>
                </span>
                <span>
                  {new Date(flag.updatedAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFlags.length === 0 && (
        <div className="p-8 text-center rounded-2xl bg-[#0C0D12] border border-white/10 text-neutral-400 text-xs">
          Nenhuma feature flag encontrada com os filtros atuais.
        </div>
      )}

      {/* Manual de Padronização para Próximas Features */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0C0D12] to-[#08090C] border border-white/10 space-y-4">
        <div className="flex items-center gap-2.5 text-white font-heading font-bold text-sm">
          <Zap className="size-4 text-[#FF5500]" />
          <span>Padrão Arquitetural do kriativa.app para Novas Features</span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed font-sans">
          Para garantir confiabilidade e controle contínuo, toda nova funcionalidade criada no sistema deve seguir obrigatoriamente estes 4 passos padronizados:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <span className="text-[#FF5500] font-bold">Passo 1: Registrar Flag</span>
            <p className="text-[11px] text-neutral-400">
              Adicione a chave e descrição em <code className="text-white">DEFAULT_FEATURE_FLAGS</code> no arquivo <code className="text-white">convex/featureFlags.ts</code>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <span className="text-[#FF5500] font-bold">Passo 2: Blindar no Backend</span>
            <p className="text-[11px] text-neutral-400">
              Nas mutations e actions Convex, execute <code className="text-white">await assertFeatureFlag(ctx, "sua_chave")</code> antes de processar.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <span className="text-[#FF5500] font-bold">Passo 3: Blindar na UI</span>
            <p className="text-[11px] text-neutral-400">
              Envolva componentes com <code className="text-white">&lt;FeatureGate flag="sua_chave"&gt;</code> ou utilize o hook <code className="text-white">useFeatureFlag()</code>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <span className="text-[#FF5500] font-bold">Passo 4: Telemetria</span>
            <p className="text-[11px] text-neutral-400">
              Emita eventos e erros em <code className="text-white">systemLogs</code> para visualização instantânea na página de Observabilidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
