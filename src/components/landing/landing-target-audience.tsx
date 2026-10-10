"use client";

import React from "react";
import { Users, Palette, Building2, Briefcase, Film, Compass, CheckCircle2 } from "lucide-react";

export function LandingTargetAudience() {
  const audiences = [
    {
      title: "Criadores",
      desc: "Conteúdo para Instagram, TikTok, YouTube e outras plataformas.",
      icon: Film,
    },
    {
      title: "Social Media",
      desc: "Criativos e conteúdos para seus clientes em alta escala.",
      icon: Palette,
    },
    {
      title: "Empresas",
      desc: "Conteúdo comercial e materiais para comunicação corporativa.",
      icon: Building2,
    },
    {
      title: "Empreendedores",
      desc: "Marketing, anúncios e produção de conteúdo para vendas diárias.",
      icon: Briefcase,
    },
    {
      title: "Profissionais criativos",
      desc: "Experimentação de ponta e produção audiovisual cinematográfica.",
      icon: Users,
    },
    {
      title: "Curiosos",
      desc: "Descubra o que a inteligência artificial generativa consegue fazer.",
      icon: Compass,
    },
  ];

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-xs uppercase tracking-wider text-neutral-300 font-bold">
          <Users className="size-3.5 text-[#FF5500]" />
          Casos de Uso
        </span>
        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Se você cria alguma coisa, a Kriativa é para você.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {audiences.map((aud, idx) => {
          const Icon = aud.icon;
          return (
            <div
              key={idx}
              className="rounded-3xl border border-white/10 bg-[#0C0D12] p-6 space-y-3 hover:border-white/20 transition-all shadow-md group"
            >
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[#FF5500] w-fit group-hover:scale-105 transition-transform">
                <Icon className="size-5" />
              </div>
              <h3 className="font-heading font-black text-lg text-white uppercase tracking-tight">
                {aud.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                {aud.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
