"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ListTodo, Film, Coins } from "lucide-react";

export function DashboardMetrics() {
  const tasks = useQuery(api.tasks.get);
  const planStatus = useQuery(api.antiAbuse.getPlanStatus);

  if (tasks === undefined) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-[#0C0D12]/90 border border-white/10">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-white/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1 bg-white/5" />
              <Skeleton className="h-3 w-32 bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const creditsRemaining = planStatus?.creditsRemaining ?? 50;
  const creditsTotal = planStatus?.creditsTotal ?? 50;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Tasks */}
      <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-heading uppercase text-neutral-400">
            Total de Tarefas
          </CardTitle>
          <ListTodo className="size-4 text-neutral-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-heading font-black text-white">{totalTasks}</div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {pendingTasks} pendente{pendingTasks === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>

      {/* Completed Tasks */}
      <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-heading uppercase text-neutral-400">
            Concluídas
          </CardTitle>
          <CheckCircle2 className="size-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-heading font-black text-emerald-400">
            {completedTasks}
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {completionRate}% de taxa de entrega
          </p>
        </CardContent>
      </Card>

      {/* Cinematic Engine */}
      <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-heading uppercase text-neutral-400">
            Motor de Render
          </CardTitle>
          <Film className="size-4 text-[#00E5FF]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-heading font-black text-white flex items-center gap-2">
            <span>24 FPS</span>
            <span className="size-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Modo Cinema Anamorphic
          </p>
        </CardContent>
      </Card>

      {/* Video Generation Credits */}
      <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-heading uppercase text-neutral-400">
            Saldo de Criação
          </CardTitle>
          <Coins className="size-4 text-[#FF5500]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-heading font-black text-[#FF5500]">
            {creditsRemaining}{" "}
            <span className="text-xs font-mono font-normal text-neutral-400">
              / {creditsTotal}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Plano Free Creator
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
