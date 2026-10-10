"use client";

import React from "react";
import { LpCtaButton } from "./lp-cta-button";
import { Badge } from "@/components/ui/badge";
import { Image, Video, Mic, FileText, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export function LpTools() {
  const tools = [
    {
      id: "vision",
      name: "Kriativa Vision",
      tag: "🖼️ IMAGENS",
      headline: "Transforme suas ideias em imagens.",
      desc: "Crie imagens a partir de descrições, explore estilos visuais, desenvolva personagens e produza materiais para redes sociais, campanhas e projetos criativos.",
      badgeColor: "border-amber-500/40 text-amber-400 bg-amber-500/10",
      accentBg: "from-amber-950/20 via-[#0E0C09] to-[#08080A]",
      borderColor: "border-amber-500/30 hover:border-amber-500/50",
      icon: Image,
      bullets: [
        "Criação de imagens a partir de descrições textuais",
        "Exploração de estilos visuais fotorrealistas e conceituais",
        "Desenvolvimento de personagens e identidades consistentes",
        "Materiais para redes sociais, campanhas e anúncios",
      ],
    },
    {
      id: "motion",
      name: "Kriativa Motion",
      tag: "🎬 VÍDEOS",
      headline: "Dê vida às suas ideias.",
      desc: "Transforme prompts e imagens em vídeos para anúncios, conteúdo social e projetos audiovisuais. Explore novas formas de contar histórias com inteligência artificial.",
      badgeColor: "border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10",
      accentBg: "from-[#FF5500]/15 via-[#120B07] to-[#08080A]",
      borderColor: "border-[#FF5500]/40 hover:border-[#FF5500]/60",
      icon: Video,
      bullets: [
        "Transformação de prompts e imagens em vídeos em movimento",
        "Conteúdo em formato Reels, Shorts, TikTok e widescreen",
        "Controles cinemáticos e física fluida de câmera",
        "Novas formas de contar histórias audiovisuais com IA",
      ],
    },
    {
      id: "voice",
      name: "Kriativa Voice",
      tag: "🔊 ÁUDIOS",
      headline: "Dê voz às suas criações.",
      desc: "Gere narrações e trabalhe com recursos de áudio e transcrição para complementar seus vídeos, conteúdos e projetos.",
      badgeColor: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      accentBg: "from-purple-950/20 via-[#0F0B14] to-[#08080A]",
      borderColor: "border-purple-500/30 hover:border-purple-500/50",
      icon: Mic,
      bullets: [
        "Geração de narrações neurais naturais e expressivas",
        "Locução para vídeos institucionais, comerciais e redes",
        "Recursos de áudio e transcrição sincronizada",
        "Complementação sonora para conteúdos e produções",
      ],
    },
    {
      id: "mind",
      name: "Kriativa Mind",
      tag: "✍️ TEXTOS",
      headline: "Transforme pensamentos em conteúdo.",
      desc: "Desenvolva ideias, copies, legendas, roteiros, prompts e textos para diferentes objetivos criativos.",
      badgeColor: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
      accentBg: "from-cyan-950/20 via-[#080E14] to-[#08080A]",
      borderColor: "border-cyan-500/30 hover:border-cyan-500/50",
      icon: FileText,
      bullets: [
        "Desenvolvimento de ideias e conceitos estratégicos",
        "Copies persuasivas e legendas de engajamento",
        "Roteiros estruturados para vídeos e campanhas",
        "Prompts otimizados para maximizar a qualidade das gerações",
      ],
    },
  ];

  return (
    <section id="ferramentas" className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
          <Sparkles className="size-3.5 text-[#FF5500]" />
          Ferramentas
        </div>

        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Tudo o que você precisa para transformar ideias em conteúdo.
        </h2>

        <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
          Explore diferentes possibilidades de criação, de acordo com o que você quer produzir.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.id}
              className={`rounded-3xl border ${t.borderColor} bg-gradient-to-b ${t.accentBg} p-7 sm:p-9 flex flex-col justify-between transition-all space-y-6 shadow-xl`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-heading font-black text-lg sm:text-xl text-white">
                      {t.name}
                    </span>
                  </div>
                  <Badge variant="outline" className={`text-xs font-mono font-bold ${t.badgeColor}`}>
                    {t.tag}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                    {t.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
                    {t.desc}
                  </p>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-white/10 text-xs sm:text-sm text-neutral-300">
                  {t.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 text-[#FF5500] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <span className="text-xs font-mono text-neutral-400">
                  Integrado ao seu fluxo na plataforma
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Punchline from copy2.md */}
      <div className="mt-12 text-center space-y-5">
        <p className="font-heading font-black text-base sm:text-xl text-white uppercase tracking-tight">
          Quatro áreas de criação.{" "}
          <span className="text-[#FF5500]">Uma experiência integrada.</span>
        </p>

        <div className="flex justify-center">
          <LpCtaButton label="COMEÇAR GRÁTIS →" size="default" />
        </div>
      </div>
    </section>
  );
}
