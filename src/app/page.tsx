import { AuthNavControls, AuthHeroActions } from "@/components/auth-showcase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Layers,
  Database,
  Lock,
  Palette,
  Sparkles,
  Terminal,
  ExternalLink,
} from "lucide-react";

export default function Home() {
  const stackItems = [
    {
      title: "Next.js 16 (App Router)",
      description: "Turbopack, Server Components e o novo padrão Proxy para middleware.",
      icon: Layers,
      tag: "Framework",
    },
    {
      title: "Tailwind CSS v4",
      description: "Nova engine de alto desempenho com importação moderna baseada em CSS.",
      icon: Palette,
      tag: "Styling",
    },
    {
      title: "shadcn/ui",
      description: "Componentes acessíveis, personalizáveis e prontos para uso instalados.",
      icon: Sparkles,
      tag: "UI Library",
    },
    {
      title: "Convex",
      description: "Banco de dados e backend reativo com TypeScript end-to-end em tempo real.",
      icon: Database,
      tag: "Backend & DB",
    },
    {
      title: "Clerk Auth",
      description: "Autenticação completa, gerenciamento de perfil e proteção de rotas.",
      icon: Lock,
      tag: "Authentication",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Configurar chaves no .env.local",
      desc: "Copie as variáveis de .env.example para .env.local e adicione as chaves do Clerk e Convex.",
      command: "cp .env.example .env.local",
    },
    {
      step: "2",
      title: "Conectar o backend Convex",
      desc: "Inicie o Convex para gerar as tipagens reais e conectar ao banco na nuvem.",
      command: "npx convex dev",
    },
    {
      step: "3",
      title: "Configurar JWT do Clerk para o Convex",
      desc: "No dashboard do Clerk, vá em JWT Templates, crie um template Convex e adicione CLERK_JWT_ISSUER_DOMAIN.",
    },
    {
      step: "4",
      title: "Rodar o ambiente de desenvolvimento",
      desc: "Inicie o servidor Next.js com Turbopack integrado.",
      command: "npm run dev",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">trinnsaas</span>
            <Badge variant="secondary" className="text-xs">
              Template Ready
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <AuthNavControls />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/40 text-xs mb-6">
            <Sparkles className="size-3.5 text-primary" />
            <span>Next.js + Tailwind v4 + shadcn/ui + Convex + Clerk</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto">
            Stack Fullstack moderna configurada e pronta para produção
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa para criar seu SaaS: UI polida com shadcn,
            estilização rápida com Tailwind, autenticação com Clerk e dados em
            tempo real com Convex.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <AuthHeroActions />
            <a
              href="https://docs.convex.dev"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Docs do Convex
              <ExternalLink className="size-4" />
            </a>
          </div>
        </section>

        {/* Stack Cards Grid */}
        <section className="container mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Tecnologias Integradas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stackItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                        <Icon className="size-5" />
                      </div>
                      <Badge variant="outline">{item.tag}</Badge>
                    </div>
                    <CardTitle className="mt-3 text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator className="my-8 max-w-6xl mx-auto" />

        {/* Quickstart Guide */}
        <section className="container mx-auto max-w-6xl px-4 sm:px-6 pb-16">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Terminal className="size-5 text-primary" />
                <CardTitle className="text-xl">Próximos passos para rodar</CardTitle>
              </div>
              <CardDescription>
                Siga este roteiro rápido para conectar suas contas e iniciar o
                desenvolvimento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {steps.map((s) => (
                  <div key={s.step} className="flex gap-4 items-start">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {s.step}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-sm">{s.title}</h4>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                      {s.command && (
                        <pre className="mt-2 rounded-md bg-muted p-2 font-mono text-xs text-foreground overflow-x-auto">
                          <code>{s.command}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>Projeto trinnsaas configurado com Next.js, Tailwind v4, shadcn/ui, Convex e Clerk.</p>
      </footer>
    </div>
  );
}
