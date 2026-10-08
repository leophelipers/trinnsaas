import Link from "next/link";
import { Sparkles, Shield, Film, Bot, ArrowRight } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#040405] text-xs text-muted-foreground">
      {/* Pre-footer Callout Banner */}
      <div className="border-b border-white/5 bg-gradient-to-r from-transparent via-[#FF5500]/5 to-transparent py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500]">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="font-heading font-bold text-white text-sm tracking-tight">
                Experimente o motor de cinema generativo gratuitamente
              </p>
              <p className="text-xs text-muted-foreground">
                Receba 50 créditos imediatos de boas-vindas sem necessidade de cartão de crédito.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-[#FF5500] text-white hover:bg-[#ff681a] transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,85,0,0.3)] whitespace-nowrap"
          >
            <span>Iniciar no Studio</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
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
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm font-sans">
              O primeiro estúdio web de cinema generativo com controle tridimensional de câmera, lentes anamórficas virtuais e consistência temporal de atores. Projetado para diretores, agências e criadores visuais.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Instâncias de Renderização Operacionais (4K Ready)</span>
            </div>
          </div>

          {/* Col 1: Recursos */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
              Recursos de Estúdio
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/recursos#camera" className="hover:text-white transition-colors">
                  Câmera 3D & FPV Drone
                </Link>
              </li>
              <li>
                <Link href="/recursos#consistencia" className="hover:text-white transition-colors">
                  Cofre de Consistência
                </Link>
              </li>
              <li>
                <Link href="/recursos#lentes" className="hover:text-white transition-colors">
                  Óptica Anamórfica
                </Link>
              </li>
              <li>
                <Link href="/recursos#split-canvas" className="hover:text-white transition-colors">
                  Assistente de Decupagem
                </Link>
              </li>
              <li>
                <Link href="/recursos#formatos" className="hover:text-white transition-colors">
                  Exportação Master 4K
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Comparativos & IAs */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
              Comparativos & IAs
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/comparativo" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Guia Comparativo 2026</span>
                </Link>
              </li>
              <li>
                <Link href="/comparativo#runway" className="hover:text-white transition-colors">
                  Kriativa vs Runway
                </Link>
              </li>
              <li>
                <Link href="/comparativo#pika" className="hover:text-white transition-colors">
                  Kriativa vs Pika
                </Link>
              </li>
              <li>
                <Link href="/comparativo#sora" className="hover:text-white transition-colors">
                  Kriativa vs Sora
                </Link>
              </li>
              <li>
                <Link href="/llms.txt" target="_blank" className="hover:text-[#FF5500] transition-colors flex items-center gap-1 font-mono text-[11px]">
                  <Bot className="size-3 text-[#FF5500]" />
                  <span>Índice llms.txt</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Planos & Institucional */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
              Planos & Estúdio
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/precos" className="hover:text-white transition-colors">
                  Tabela de Créditos
                </Link>
              </li>
              <li>
                <Link href="/precos#pix" className="hover:text-white transition-colors">
                  Pagamento Instantâneo via PIX
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-white transition-colors">
                  Manifesto do Diretor
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Acessar Studio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground font-mono">
          <div>
            © {new Date().getFullYear()} Kriativa.app — The Next-Gen AI Cinema & Generative Motion Studio.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-white/60">100% dos direitos comerciais pertencem ao criador</span>
            <span className="text-white/20">•</span>
            <Link href="/precos" className="hover:text-white transition-colors">
              Sem assinaturas forçadas
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
