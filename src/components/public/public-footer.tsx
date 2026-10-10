import Link from "next/link";
import { Sparkles, Shield, Film, Bot, ArrowRight, ImageIcon, Mic, PenTool } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#040405] text-xs text-muted-foreground">
      {/* Pre-footer Callout Banner */}
      <div className="border-b border-white/5 bg-gradient-to-r from-transparent via-[#FF5500]/5 to-transparent py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500] shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="font-heading font-bold text-white text-sm sm:text-base tracking-tight">
                Todas as IAs que você precisa. Em um só lugar.
              </p>
              <p className="text-xs text-muted-foreground">
                Cadastro gratuito. Sem cartão de crédito. Comece a criar a partir de R$ 5 ou R$ 200/mês.
              </p>
            </div>
          </div>
          <Link
            href="/sign-up"
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-[#FF5500] text-white hover:bg-[#ff681a] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.35)] whitespace-nowrap active:scale-95"
          >
            <span>COMEÇAR GRÁTIS</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-1 sm:col-span-2 space-y-4">
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
              A nova plataforma brasileira de inteligência artificial. Imagens, vídeos, áudios e textos reunidos em uma única interface intuitiva. Tecnologia aberta com faturamento local via PIX.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Instâncias de Renderização Operacionais</span>
            </div>
          </div>

          {/* Col 1: Suíte de Criação */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
              Suíte de Criação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/recursos#vision" className="hover:text-white transition-colors">
                  Kriativa Vision (Imagens)
                </Link>
              </li>
              <li>
                <Link href="/recursos#motion" className="hover:text-white transition-colors">
                  Kriativa Motion (Vídeos)
                </Link>
              </li>
              <li>
                <Link href="/recursos#voice" className="hover:text-white transition-colors">
                  Kriativa Voice (Áudios)
                </Link>
              </li>
              <li>
                <Link href="/recursos#mind" className="hover:text-white transition-colors">
                  Kriativa Mind (Textos)
                </Link>
              </li>
              <li>
                <Link href="/recursos#camera" className="hover:text-white transition-colors">
                  Câmera 3D & Direção
                </Link>
              </li>
              <li>
                <Link href="/recursos#consistencia" className="hover:text-white transition-colors">
                  Cofre de Consistência
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Ofertas & Preços */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
              Ofertas & Planos
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/precos#ofertas" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Créditos (a partir de R$ 5)</span>
                  <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-mono text-[9px]">PIX</span>
                </Link>
              </li>
              <li>
                <Link href="/precos#ofertas" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Kriativa Ilimitada (R$ 200)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px]">Top</span>
                </Link>
              </li>
              <li>
                <Link href="/precos" className="hover:text-white transition-colors">
                  Pacotes de Volume
                </Link>
              </li>
              <li>
                <Link href="/precos#pix" className="hover:text-white transition-colors">
                  Pagamento Instantâneo via PIX
                </Link>
              </li>
              <li>
                <Link href="/#roadmap" className="hover:text-white transition-colors">
                  Roadmap Interativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Institucional & Comparativos */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
              Institucional
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/comparativo" className="hover:text-white transition-colors">
                  Por que 1 Plataforma?
                </Link>
              </li>
              <li>
                <Link href="/comparativo" className="hover:text-white transition-colors">
                  Kriativa vs Alternativas
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-white transition-colors">
                  Manifesto Brasileiro
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Acessar Plataforma
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
        </div>

        {/* Legal & Compliance Disclaimers from copy.md Section 17 */}
        <div className="mt-12 pt-8 border-t border-white/5 space-y-4 text-[11px] text-neutral-400 font-sans leading-relaxed">
          <div>
            <span className="font-mono text-neutral-400 font-bold uppercase block text-[10px] tracking-wider mb-1">
              Aviso Legal de Publicidade
            </span>
            <p>
              Este site não é afiliado, patrocinado ou endossado pelo Facebook, Meta Platforms, Inc., Instagram ou Google LLC. Facebook, Instagram, Google e demais marcas mencionadas pertencem aos seus respectivos proprietários. A Kriativa não possui vínculo, parceria ou endosso dessas empresas, salvo quando expressamente indicado.
            </p>
          </div>

          <div>
            <span className="font-mono text-neutral-400 font-bold uppercase block text-[10px] tracking-wider mb-1">
              Tecnologia, Modelos e Resultados
            </span>
            <p>
              A Kriativa utiliza diferentes modelos e tecnologias de inteligência artificial, incluindo modelos open source e tecnologias de terceiros. A disponibilidade, capacidade, desempenho e características dos modelos podem mudar ao longo do tempo. Conteúdos gerados por inteligência artificial podem conter inconsistências e devem ser revisados pelo usuário antes de sua utilização. A utilização da plataforma não garante resultados financeiros, comerciais, profissionais ou de audiência.
            </p>
          </div>

          <div>
            <span className="font-mono text-neutral-400 font-bold uppercase block text-[10px] tracking-wider mb-1">
              Plano Ilimitado & Direitos Comerciais
            </span>
            <p>
              O termo &quot;ilimitado&quot; refere-se ao acesso contínuo aos recursos disponibilizados pela plataforma dentro dos limites técnicos, operacionais e das políticas de uso da Kriativa. Determinados modelos podem possuir limites específicos de utilização ou disponibilidade. Quando aplicável, a plataforma poderá direcionar solicitações para modelos alternativos disponíveis. A possibilidade de utilização comercial dos conteúdos gerados está sujeita aos termos da Kriativa, às condições e licenças aplicáveis aos modelos utilizados e aos direitos de terceiros.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground font-mono">
          <div>
            © {new Date().getFullYear()} Kriativa.app — Plataforma Brasileira de Inteligência Artificial.
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
