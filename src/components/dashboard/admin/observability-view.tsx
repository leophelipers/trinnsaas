"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CreditCard,
  QrCode,
  Coins,
  TrendingUp,
  Server,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  User,
  Sliders,
  AlertCircle,
  Zap,
} from "lucide-react";
import { AdminNavBar } from "./admin-nav-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function ObservabilityView() {
  const overview = useQuery(api.observability.getObservabilityOverview);

  const [logFilter, setLogFilter] = useState<"all" | "info" | "warn" | "error">("all");
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>("all");
  const [logSearch, setLogSearch] = useState("");

  const isLoading = overview === undefined;
  const health = overview?.health;
  const financial = overview?.financial;
  const credits = overview?.creditsEconomy;
  const rawLogs = overview?.recentLogs || [];

  // Filtragem dos logs recentes
  const filteredLogs = rawLogs.filter((log) => {
    const matchesLevel = logFilter === "all" || log.level === logFilter;
    const matchesCategory =
      logCategoryFilter === "all" || log.category === logCategoryFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase())) ||
      log.category.toLowerCase().includes(logSearch.toLowerCase());

    return matchesLevel && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Admin Navigation Bar */}
      <AdminNavBar currentTab="observability" />

      {/* Header com Telemetria em Tempo Real */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-white">
                  Observabilidade & Telemetria
                </h1>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>LIVE CONVEX SYNC</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                Saúde das transações bancárias, liquidez de créditos e trilhas de auditoria em tempo real.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <Clock className="size-3.5 text-neutral-500" />
          <span>
            Última checagem:{" "}
            {health?.lastCheckedAt
              ? new Date(health.lastCheckedAt).toLocaleTimeString("pt-BR")
              : "Conectando..."}
          </span>
        </div>
      </div>

      {/* Indicadores Principais de Saúde Operacional */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Status Geral */}
        <div className="p-4 rounded-2xl bg-[#0C0D12] border border-white/10 space-y-1.5 relative overflow-hidden">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Status do Estúdio
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`size-2.5 rounded-full ${
                health?.overallStatus === "operational"
                  ? "bg-emerald-400 animate-pulse"
                  : health?.overallStatus === "degraded"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-rose-500 animate-ping"
              }`}
            />
            <p className="text-xl font-heading font-black text-white uppercase tracking-tight">
              {health?.overallStatus === "operational"
                ? "Operacional"
                : health?.overallStatus === "degraded"
                ? "Degradado"
                : "Manutenção"}
            </p>
          </div>
          <p className="text-[11px] text-neutral-400 font-mono">
            {health?.activeFlagsCount} de {health?.totalFlagsCount} recursos ativos
          </p>
        </div>

        {/* Taxa de Aprovação Bancária */}
        <div className="p-4 rounded-2xl bg-[#0C0D12] border border-white/10 space-y-1.5">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Aprovação Bancária
          </span>
          <p className="text-xl font-heading font-black text-emerald-400">
            {financial?.approvalRatePct ?? 100}%
          </p>
          <p className="text-[11px] text-neutral-400 font-mono">
            {financial?.approvedOrdersCount ?? 0} aprovados /{" "}
            {financial?.rejectedOrdersCount ?? 0} recusados
          </p>
        </div>

        {/* Volume Total Faturado */}
        <div className="p-4 rounded-2xl bg-[#0C0D12] border border-white/10 space-y-1.5">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Volume Faturado Bruto
          </span>
          <p className="text-xl font-heading font-black text-white">
            R$ {(financial?.totalGrossBrl ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-neutral-400 font-mono">
            {financial?.totalOrdersCount ?? 0} pedidos registrados
          </p>
        </div>

        {/* Incidentes & Erros 24h */}
        <div className="p-4 rounded-2xl bg-[#0C0D12] border border-white/10 space-y-1.5">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            Incidentes (24h)
          </span>
          <div className="flex items-center gap-3">
            <p
              className={`text-xl font-heading font-black ${
                (health?.errors24h || 0) > 0 ? "text-rose-400" : "text-white"
              }`}
            >
              {health?.errors24h ?? 0} erros
            </p>
            <span className="text-xs text-neutral-500 font-mono">
              / {health?.warnings24h ?? 0} alertas
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 font-mono">
            {(health?.errors24h || 0) === 0 ? "Nenhum erro crítico registrado" : "Requer atenção no log"}
          </p>
        </div>
      </div>

      {/* Grid de Seções: Gateway Financeiro e Liquidez de Créditos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Painel do Gateway Mercado Pago (PIX vs Cartão) */}
        <div className="p-5 rounded-2xl bg-[#0C0D12] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-[#FF5500]" />
              <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-white">
                Desempenho de Checkout & Gateways
              </h2>
            </div>
            <Badge className="bg-white/5 text-neutral-400 text-[10px] font-mono">
              MERCADO PAGO
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* PIX */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold text-emerald-400 flex items-center gap-1.5">
                  <QrCode className="size-3.5" />
                  PIX Instantâneo
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  {financial?.pix?.count ?? 0} pedidos
                </span>
              </div>
              <p className="text-lg font-heading font-black text-white">
                R$ {(financial?.pix?.grossBrl ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all"
                  style={{
                    width: `${
                      financial?.totalGrossBrl
                        ? ((financial.pix.grossBrl / financial.totalGrossBrl) * 100).toFixed(0)
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Cartão de Crédito */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold text-cyan-400 flex items-center gap-1.5">
                  <CreditCard className="size-3.5" />
                  Cartão de Crédito
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  {financial?.card?.count ?? 0} pedidos
                </span>
              </div>
              <p className="text-lg font-heading font-black text-white">
                R$ {(financial?.card?.grossBrl ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all"
                  style={{
                    width: `${
                      financial?.totalGrossBrl
                        ? ((financial.card.grossBrl / financial.totalGrossBrl) * 100).toFixed(0)
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Últimos Pedidos Amostrados */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
              Últimas Transações Bancárias
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {(financial?.sampleOrders || []).map((order: any) => (
                <div
                  key={order._id}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {order.paymentMethod === "pix" ? (
                      <QrCode className="size-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <CreditCard className="size-3.5 text-cyan-400 shrink-0" />
                    )}
                    <span className="text-neutral-300 truncate max-w-[140px] sm:max-w-[180px]">
                      {order.userEmail}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-white font-bold">
                      R$ {order.amountBrl.toFixed(2)}
                    </span>
                    <Badge
                      className={`text-[9px] uppercase px-1.5 py-0 border ${
                        order.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : order.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel da Economia de Créditos */}
        <div className="p-5 rounded-2xl bg-[#0C0D12] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="size-4 text-[#FF5500]" />
              <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-white">
                Economia de Créditos & Liquidez
              </h2>
            </div>
            <Badge className="bg-white/5 text-neutral-400 text-[10px] font-mono">
              LEDGER AUDITADO
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                Créditos em Circulação
              </span>
              <p className="text-xl font-heading font-black text-white">
                {(credits?.totalCreditsCirculating ?? 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                {credits?.totalPaidCredits ?? 0} pagos / {credits?.totalBonusCredits ?? 0} bônus
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                Adesão ao Auto Top-up
              </span>
              <p className="text-xl font-heading font-black text-[#FF5500]">
                {credits?.totalAutoTopUpUsers ?? 0} usuários
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                {credits?.totalEligibleUsers ?? 0} com Estúdio Ativo
              </p>
            </div>
          </div>

          {/* Livro-Razão Recente */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
              Últimas Movimentações no Livro-Razão
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {(credits?.sampleTransactions || []).map((tx: any) => (
                <div
                  key={tx._id}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-0.5 overflow-hidden pr-2">
                    <p className="text-neutral-200 truncate font-sans text-[11px]">
                      {tx.description}
                    </p>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(tx.timestamp).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <span
                    className={`font-heading font-bold text-xs shrink-0 ${
                      tx.amount > 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stream de Auditoria & Event Logs em Tempo Real */}
      <div className="p-5 rounded-2xl bg-[#0C0D12] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Server className="size-4 text-[#00E5FF]" />
            <div>
              <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-white">
                Trilha de Auditoria & Event Logs
              </h2>
              <p className="text-xs text-neutral-400 font-sans">
                Fluxo contínuo de eventos do sistema, alterações de flags e registros de segurança.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="size-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Filtrar mensagens..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="pl-8 bg-white/[0.03] border-white/10 text-xs h-8 text-white placeholder:text-neutral-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-xl">
              {(["all", "info", "warn", "error"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase transition-all cursor-pointer ${
                    logFilter === lvl
                      ? "bg-[#FF5500] text-white font-bold"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela de Logs */}
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {filteredLogs.map((log: any) => (
            <div
              key={log._id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono transition-colors ${
                log.level === "error"
                  ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                  : log.level === "warn"
                  ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                  : "bg-white/[0.02] border-white/5 text-neutral-300"
              }`}
            >
              <div className="flex items-start sm:items-center gap-2.5 overflow-hidden">
                <Badge
                  className={`text-[9px] uppercase px-1.5 py-0 border shrink-0 ${
                    log.level === "error"
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      : log.level === "warn"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  }`}
                >
                  {log.level}
                </Badge>

                <Badge className="bg-white/5 text-neutral-400 text-[9px] uppercase px-1.5 py-0 border border-white/5 shrink-0">
                  {log.category}
                </Badge>

                <span className="font-sans text-xs truncate max-w-xl text-neutral-200">
                  {log.message}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[10px] text-neutral-500">
                {log.userId && (
                  <span className="flex items-center gap-1 font-mono text-neutral-400">
                    <User className="size-3" />
                    {log.userId.slice(-6)}
                  </span>
                )}
                <span>
                  {new Date(log.timestamp).toLocaleString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="p-6 text-center text-xs text-neutral-500 font-mono">
              Nenhum log encontrado para os critérios selecionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
