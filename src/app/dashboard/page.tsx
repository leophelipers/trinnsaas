import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { DashboardTaskList } from "@/components/dashboard/dashboard-task-list";
import { SessionInfoCard } from "@/components/dashboard/session-info-card";
import { AntiAbuseBanner } from "@/components/dashboard/anti-abuse-banner";
import {
  ArrowRight,
  Sparkles,
  Camera,
  Film,
  Video,
  Clapperboard,
  Sliders,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await currentUser();
  const displayName = user?.firstName || user?.fullName || "Criador";

  return (
    <div className="space-y-6">
      {/* Welcome Banner Cinematográfico */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0C0D12] via-[#090A0E] to-[#050506] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 size-60 rounded-full bg-[#FF5500]/10 blur-[80px] pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-neutral-400">Estúdio de Produção</span>
              <Badge variant="outline" className="text-[10px] gap-1 border-[#FF5500]/30 text-[#FF5500] bg-[#FF5500]/10 font-mono">
                <Sparkles className="size-3" />
                Sessão Ativa
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white uppercase">
              Bem-vindo ao Estúdio, {displayName}! 🎬
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
              Seu espaço criativo para dirigir cenas cinematográficas com controle preciso de câmera, movimentos fluidos e iluminação realista.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/profile"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Sliders className="size-3.5 text-[#FF5500]" />
              Configurar Perfil
            </Link>
            <Link
              href="/dashboard/tasks"
              className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase px-4 h-8 rounded-xl shadow-[0_0_15px_rgba(255,85,0,0.3)] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              Ver Tarefas & Cenas
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Banner de Créditos & Cota do Estúdio */}
      <AntiAbuseBanner />

      {/* Linha de Métricas Criativas */}
      <DashboardMetrics />

      {/* Grid Principal: Tarefas / Cenas e Guia do Diretor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Tarefas & Projetos */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <div className="flex items-center gap-2 text-white">
                  <Clapperboard className="size-4 text-[#FF5500]" />
                  <CardTitle className="font-heading text-base uppercase">
                    Seus Projetos & Tarefas de Produção
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-neutral-400 mt-0.5">
                  Organize suas etapas de storyboard, renderização de tomadas e pós-produção.
                </CardDescription>
              </div>
              <Link
                href="/dashboard/tasks"
                className="text-xs text-[#FF5500] hover:underline flex items-center gap-1 font-heading font-bold uppercase tracking-wider"
              >
                Ver tudo
                <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <DashboardTaskList maxItems={4} />
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Ambiente e Guia de Câmera */}
        <div className="space-y-6">
          <SessionInfoCard />

          {/* Guia do Diretor de Cinema (Substitui termos de stack técnica) */}
          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-[#00E5FF]">
                <Camera className="size-4" />
                <CardTitle className="font-heading text-base uppercase text-white">
                  Dicas de Direção de Câmera
                </CardTitle>
              </div>
              <CardDescription className="text-neutral-400 text-xs">
                Como extrair a máxima fidelidade visual em suas tomadas:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-neutral-400 font-sans">
              <div className="flex gap-3 items-start p-2.5 rounded-xl bg-black/40 border border-white/10">
                <div className="size-7 rounded-lg bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center shrink-0 mt-0.5">
                  <Film className="size-3.5" />
                </div>
                <div className="space-y-0.5">
                  <strong className="text-white font-heading text-xs block">
                    Movimento de Câmera Dinâmico
                  </strong>
                  <p className="text-[11px] leading-relaxed">
                    Experimente usar termos como <code>orbit camera 360°</code> ou <code>slow push-in</code> para criar imersão e profundidade dramática.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-2.5 rounded-xl bg-black/40 border border-white/10">
                <div className="size-7 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] flex items-center justify-center shrink-0 mt-0.5">
                  <Video className="size-3.5" />
                </div>
                <div className="space-y-0.5">
                  <strong className="text-white font-heading text-xs block">
                    Lentes & Estilo de Iluminação
                  </strong>
                  <p className="text-[11px] leading-relaxed">
                    Palavras-chave como <code>anamorphic flare</code>, <code>golden hour backlight</code> e <code>shallow depth of field</code> transformam prompts simples em cinema.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
