"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  Search,
  ListTodo,
} from "lucide-react";

interface DashboardTaskListProps {
  maxItems?: number;
  showFilters?: boolean;
}

export function DashboardTaskList({
  maxItems,
  showFilters = false,
}: DashboardTaskListProps) {
  const tasks = useQuery(api.tasks.get);
  const planStatus = useQuery(api.antiAbuse.getPlanStatus);
  const addTask = useMutation(api.tasks.add);
  const toggleTask = useMutation(api.tasks.toggle);
  const removeTask = useMutation(api.tasks.remove);

  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isBlocked = planStatus?.status === "blocked";
  const isOutOfCredits =
    planStatus?.status === "active" && planStatus.creditsRemaining <= 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await addTask({ text: text.trim() });
      setText("");
    } catch (err: unknown) {
      console.error("Erro ao adicionar tarefa:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Falha ao criar tarefa."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: Id<"tasks">, currentStatus: boolean) => {
    try {
      await toggleTask({ id, isCompleted: !currentStatus });
    } catch (err) {
      console.error("Erro ao alternar status:", err);
    }
  };

  const handleDelete = async (id: Id<"tasks">) => {
    try {
      await removeTask({ id });
    } catch (err) {
      console.error("Erro ao excluir tarefa:", err);
    }
  };

  if (tasks === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  // Filter tasks
  let filtered = tasks.filter((t) =>
    t.text.toLowerCase().includes(search.toLowerCase())
  );

  if (filter === "pending") {
    filtered = filtered.filter((t) => !t.isCompleted);
  } else if (filter === "completed") {
    filtered = filtered.filter((t) => t.isCompleted);
  }

  const displayedTasks = maxItems ? filtered.slice(0, maxItems) : filtered;

  return (
    <div className="space-y-4">
      {/* Create Task Form */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            isBlocked
              ? "Criação suspensa: cota bloqueada por política antifraude."
              : isOutOfCredits
              ? "Créditos esgotados: faça upgrade para continuar."
              : "O que você precisa fazer hoje?"
          }
          className="flex-1"
          disabled={isSubmitting || isBlocked || isOutOfCredits}
        />
        <Button
          type="submit"
          disabled={isSubmitting || !text.trim() || isBlocked || isOutOfCredits}
          className="gap-1.5 shrink-0"
        >
          <Plus className="size-4" />
          <span>{isSubmitting ? "Criando..." : "Adicionar"}</span>
        </Button>
      </form>

      {errorMessage && (
        <div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {errorMessage}
        </div>
      )}

      {/* Optional Filters and Search */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-2 pt-1 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarefas..."
              className="pl-9 h-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="xs"
              onClick={() => setFilter("all")}
            >
              Todas ({tasks.length})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="xs"
              onClick={() => setFilter("pending")}
            >
              Pendentes ({tasks.filter((t) => !t.isCompleted).length})
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="xs"
              onClick={() => setFilter("completed")}
            >
              Concluídas ({tasks.filter((t) => t.isCompleted).length})
            </Button>
          </div>
        </div>
      )}

      {/* Task Items */}
      {displayedTasks.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-muted/20">
          <ListTodo className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-foreground">
            {tasks.length === 0
              ? "Nenhuma tarefa criada ainda"
              : "Nenhuma tarefa corresponde ao filtro"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            {tasks.length === 0
              ? "Adicione uma tarefa no campo acima para testar a persistência em tempo real com o Convex."
              : "Tente mudar a busca ou selecionar outro filtro."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {displayedTasks.map((task) => (
            <li
              key={task._id}
              className={`group flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                task.isCompleted
                  ? "bg-muted/30 border-border/50 text-muted-foreground"
                  : "bg-card border-border hover:border-primary/40 shadow-xs"
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggle(task._id, task.isCompleted)}
                className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
              >
                {task.isCompleted ? (
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="size-5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                )}
                <span
                  className={`text-sm break-words select-none ${
                    task.isCompleted ? "line-through opacity-70" : "font-medium"
                  }`}
                >
                  {task.text}
                </span>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                {task.isCompleted && (
                  <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
                    Concluída
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(task._id)}
                  className="opacity-70 hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                  aria-label="Excluir tarefa"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Convex realtime footer notice */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Conexão WebSocket Convex Ativa
        </span>
        {maxItems && tasks.length > maxItems && (
          <span>
            Mostrando {displayedTasks.length} de {tasks.length}
          </span>
        )}
      </div>
    </div>
  );
}
