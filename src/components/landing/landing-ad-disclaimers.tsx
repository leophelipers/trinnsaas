"use client";

import React from "react";
import Link from "next/link";
import { Info } from "lucide-react";

export function LandingAdDisclaimers() {
  return (
    <section className="border-t border-white/5 bg-[#030304] py-12 px-4 sm:px-6 text-[11px] text-neutral-400 font-sans leading-relaxed">
      <div className="container mx-auto max-w-5xl space-y-6">
        
        <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-6 space-y-5">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-neutral-300 font-bold">
            <Info className="size-4 text-[#FF5500]" />
            <span>Disclaimers Legais & Conformidade</span>
          </div>

          <div className="space-y-4 text-neutral-400 font-sans">
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-neutral-300 text-xs uppercase">
                Aviso Legal de Publicidade
              </h4>
              <p>
                Este site não é afiliado, patrocinado ou endossado pelo Facebook, Meta Platforms, Inc., Instagram ou Google LLC. Facebook, Instagram, Google e demais marcas mencionadas pertencem aos seus respectivos proprietários. A Kriativa não possui vínculo, parceria ou endosso dessas empresas, salvo quando expressamente indicado.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-heading font-bold text-neutral-300 text-xs uppercase">
                Tecnologia e Resultados
              </h4>
              <p>
                A Kriativa utiliza diferentes modelos e tecnologias de inteligência artificial, incluindo modelos open source e tecnologias de terceiros. A disponibilidade, capacidade, desempenho e características dos modelos podem mudar ao longo do tempo. Conteúdos gerados por inteligência artificial podem conter erros, inconsistências ou informações incorretas e devem ser revisados pelo usuário antes de sua utilização. A utilização da plataforma não garante resultados financeiros, comerciais, profissionais ou de audiência.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-heading font-bold text-neutral-300 text-xs uppercase">
                Plano Ilimitado
              </h4>
              <p>
                O termo “ilimitado” refere-se ao acesso contínuo aos recursos disponibilizados pela plataforma dentro dos limites técnicos, operacionais e das políticas de uso da Kriativa. Determinados modelos podem possuir limites específicos de utilização ou disponibilidade. Quando aplicável, a plataforma poderá direcionar solicitações para modelos alternativos disponíveis.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-heading font-bold text-neutral-300 text-xs uppercase">
                Uso Comercial
              </h4>
              <p>
                A possibilidade de utilização comercial dos conteúdos gerados está sujeita aos termos da Kriativa, às condições e licenças aplicáveis aos modelos utilizados e aos direitos de terceiros. O usuário é responsável pela utilização e publicação dos conteúdos gerados.
              </p>
            </div>
          </div>
        </div>

        {/* Links do rodapé */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-neutral-500 font-mono text-[10px]">
          <div>
            © {new Date().getFullYear()} Kriativa.app — A nova plataforma brasileira de IA.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sobre" className="hover:text-neutral-300 transition-colors">
              Manifesto
            </Link>
            <span>•</span>
            <Link href="/precos" className="hover:text-neutral-300 transition-colors">
              Planos & Créditos
            </Link>
            <span>•</span>
            <Link href="/comparativo" className="hover:text-neutral-300 transition-colors">
              Comparativo
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
