"use client";

import React from "react";
import { Star, Quote, Sparkles, CheckCircle2 } from "lucide-react";

export function LandingTestimonials() {
  const testimonials = [
    {
      name: "Rafael Vasconcelos",
      role: "Diretor de Criação & Publicidade",
      avatarBg: "from-orange-500 to-amber-600",
      initials: "RV",
      quote:
        "O plano ilimitado de R$ 200/mês mudou o jogo na nossa agência. Antes gastávamos mais de R$ 1.500 por mês em ferramentas gringas que travavam e cobravam em dólar. No Kriativa, geramos storyboards vivos e tomadas finais com consistência de atores fantástica.",
      tag: "Assinante Ilimitado Pro",
      rating: 5,
    },
    {
      name: "Mariana Siqueira",
      role: "Criadora de Conteúdo & Canal no YouTube",
      avatarBg: "from-purple-500 to-pink-600",
      initials: "MS",
      quote:
        "Comecei colocando só R$ 5 para testar o drone FPV e acabei me apaixonando. A física de câmera 3D é real, não deforma o cenário como o Runway costuma fazer. Hoje produzo todos os meus vídeos verticais pelo celular e computador.",
      tag: "Entrada sob Demanda",
      rating: 5,
    },
    {
      name: "Lucas Mendonça",
      role: "Editor Audiovisual & Videomaker Freelancer",
      avatarBg: "from-cyan-500 to-blue-600",
      initials: "LM",
      quote:
        "A liberação no PIX em 3 segundos é um alívio enorme para quem produz no Brasil. O motor FastH3 com áudio sincronizado já entrega o take pronto para a timeline do Premiere. Custo-benefício incomparável.",
      tag: "Assinante Ilimitado Pro",
      rating: 5,
    },
  ];

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          Depoimentos de Criadores Reais
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Aprovado por Quem Vive de Vídeo
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-2xl mx-auto leading-relaxed">
          Mais de 2.800 diretores, videomakers e canais confiam no Kriativa para produzir conteúdo audiovisual de alta fidelidade diariamente.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-white/10 bg-[#0C0D12] p-6 sm:p-8 space-y-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
          >
            <div className="space-y-4">
              {/* Stars */}
              <div className="flex items-center gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed italic">
                "{t.quote}"
              </p>
            </div>

            {/* Author */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`size-10 rounded-full bg-gradient-to-br ${t.avatarBg} text-white font-heading font-black text-xs flex items-center justify-center shrink-0 shadow-md`}
                >
                  {t.initials}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-white leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    {t.role}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 text-[#FF5500] border border-[#FF5500]/20 shrink-0">
                {t.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
