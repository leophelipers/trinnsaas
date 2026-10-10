import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Bot } from "lucide-react";

export function LpFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#040405] text-xs text-neutral-400">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
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
            </div>

            <p className="font-heading font-bold text-sm text-neutral-300">
              Inteligência artificial para criar mais.
            </p>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-md font-sans">
              Uma plataforma brasileira desenvolvida para simplificar a criação com inteligência artificial, reunindo ferramentas de imagem, vídeo, voz e texto em uma só interface integrada.
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#inicio" className="hover:text-white transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#ferramentas" className="hover:text-white transition-colors">
                  Ferramentas
                </a>
              </li>
              <li>
                <a href="#precos" className="hover:text-white transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Perguntas frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
              Legal & Contato
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/sobre" className="hover:text-white transition-colors">
                  Sobre Nós & Manifesto
                </Link>
              </li>
              <li>
                <Link href="/comparativo" className="hover:text-white transition-colors">
                  Comparativo de IAs
                </Link>
              </li>
              <li>
                <a href="mailto:suporte@kriativa.app" className="hover:text-white transition-colors">
                  Contato de Suporte
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* DISCLAIMERS OFICIAIS DO META & ANÚNCIOS (Exigidos pelo usuário) */}
        <div className="pt-8 border-t border-white/5 space-y-4 text-[11px] text-neutral-400 font-sans leading-relaxed">
          <div>
            <span className="font-mono text-neutral-300 font-bold uppercase block text-[10px] tracking-wider mb-1">
              Aviso Legal de Publicidade (Meta Platforms, Inc. & Google LLC)
            </span>
            <p>
              Este site não é afiliado, patrocinado ou endossado pelo Facebook, Meta Platforms, Inc., Instagram ou Google LLC. Facebook, Instagram, Google e demais marcas mencionadas pertencem aos seus respectivos proprietários. A Kriativa não possui vínculo, parceria ou endosso dessas empresas, salvo quando expressamente indicado.
            </p>
          </div>

          <div>
            <span className="font-mono text-neutral-300 font-bold uppercase block text-[10px] tracking-wider mb-1">
              Tecnologia, Modelos e Resultados
            </span>
            <p>
              A Kriativa utiliza diferentes modelos e tecnologias de inteligência artificial, incluindo modelos open source e tecnologias desenvolvidas por terceiros, sujeitos às respectivas licenças e condições de uso. A disponibilidade, capacidade, desempenho e características dos modelos podem mudar ao longo do tempo. Conteúdos gerados por inteligência artificial podem conter inconsistências e devem ser revisados pelo usuário antes de sua utilização. A utilização da plataforma não garante resultados financeiros, comerciais, profissionais ou de audiência.
            </p>
          </div>

          <div>
            <span className="font-mono text-neutral-300 font-bold uppercase block text-[10px] tracking-wider mb-1">
              Plano Mensal, Limites & Uso Comercial
            </span>
            <p>
              O acesso aos recursos incluídos no plano mensal está sujeito às políticas de uso justo, aos limites operacionais e às condições da plataforma. Determinados modelos podem possuir limites específicos de disponibilidade. Quando aplicável, a plataforma poderá direcionar solicitações para modelos alternativos disponíveis. O uso comercial dos conteúdos gerados está sujeito aos termos da Kriativa, às licenças aplicáveis aos modelos utilizados e aos direitos de terceiros. O usuário é o único responsável pela utilização e veiculação dos materiais produzidos.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400 font-mono">
          <div>
            © {new Date().getFullYear()} Kriativa. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4">
            <span>Plataforma Brasileira de IA</span>
            <span>•</span>
            <span>Créditos vitalícios que não expiram</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
