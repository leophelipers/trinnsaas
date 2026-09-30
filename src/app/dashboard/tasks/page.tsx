import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardTaskList } from "@/components/dashboard/dashboard-task-list";
import { CheckSquare, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Fila de Render & Projetos | kriativa.app",
  description: "Gerencie seus projetos cinematográficos e renders em tempo real",
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="size-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Minhas Tarefas</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Tarefas sincronizadas em tempo real com o banco de dados reativo Convex.
          </p>
        </div>

        <Badge variant="outline" className="text-xs gap-1.5 self-start sm:self-auto border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
          <ShieldCheck className="size-3.5" />
          Isolado por Usuário
        </Badge>
      </div>

      {/* Main Tasks Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Lista de Atividades
          </CardTitle>
          <CardDescription>
            Todas as alterações são enviadas através de mutations autenticadas no Convex com WebSocket.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardTaskList showFilters={true} />
        </CardContent>
      </Card>
    </div>
  );
}
