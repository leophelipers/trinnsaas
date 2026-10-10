"use client";

import React, { useState } from "react";
import { LpCtaButton } from "./lp-cta-button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Image, Video, Mic, FileText, Play, CheckCircle2, Film } from "lucide-react";

export function LpDemos() {
  const [activeTab, setActiveTab] = useState<"image" | "video" | "voice" | "text">("image");

  return (
    <section className="container mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-20">
      <div className="rounded-3xl border border-white/10 bg-[#08090C] p-5 sm:p-14 space-y-8 sm:space-y-10 shadow-2xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
            <Sparkles className="size-3.5 text-[#FF5500]" />
            Demonstrações Reais
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
            Imagine. Crie. Transforme.
          </h2>

          <p className="text-sm sm:text-base text-neutral-200 font-sans leading-relaxed">
            Uma ideia pode ganhar diferentes formas.
          </p>

          <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-2xl mx-auto leading-relaxed">
            Uma imagem para apresentar um conceito. Um vídeo para contar uma história. Uma narração para dar vida à cena. Um roteiro para organizar a próxima produção. Com a Kriativa, você encontra ferramentas para explorar essas possibilidades dentro de uma experiência integrada.
          </p>
        </div>

        {/* Tab switcher: 2x2 on mobile, flex on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 max-w-md mx-auto w-full">
          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`px-3 sm:px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
              activeTab === "image"
                ? "bg-amber-500 text-black shadow-md font-black"
                : "bg-white/5 hover:bg-white/10 text-neutral-300"
            }`}
          >
            <Image className="size-3.5 shrink-0" />
            <span>Imagem</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`px-3 sm:px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
              activeTab === "video"
                ? "bg-[#FF5500] text-white shadow-md font-black"
                : "bg-white/5 hover:bg-white/10 text-neutral-300"
            }`}
          >
            <Video className="size-3.5 shrink-0" />
            <span>Vídeo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("voice")}
            className={`px-3 sm:px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
              activeTab === "voice"
                ? "bg-purple-500 text-white shadow-md font-black"
                : "bg-white/5 hover:bg-white/10 text-neutral-300"
            }`}
          >
            <Mic className="size-3.5 shrink-0" />
            <span>Voz</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`px-3 sm:px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
              activeTab === "text"
                ? "bg-cyan-500 text-black shadow-md font-black"
                : "bg-white/5 hover:bg-white/10 text-neutral-300"
            }`}
          >
            <FileText className="size-3.5 shrink-0" />
            <span>Texto</span>
          </button>
        </div>

        {/* Interactive Showcase Box */}
        <div className="rounded-2xl border border-white/10 bg-[#0C0D12] p-6 sm:p-10 transition-all">
          {activeTab === "image" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
              <div className="space-y-4">
                <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-xs font-mono">
                  🖼️ Kriativa Vision
                </Badge>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                  Conceito Visual & Fotografia de Produto
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  Geração em alta resolução com iluminação volumétrica, sombras consistentes e detalhes de textura prontos para campanhas publicitárias e redes sociais.
                </p>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-neutral-300 space-y-1">
                  <span className="text-amber-400 font-bold block text-[10px] uppercase">Prompt Exemplo:</span>
                  <p>&quot;Fotografia cinematográfica 35mm de um produto de design minimalista sobre concreto molhado sob luz de néon âmbar, atmosfera premium.&quot;</p>
                </div>
              </div>
              <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">
                <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                  <span>Render 4K Ultra-HD</span>
                  <span className="text-amber-400 font-bold">~7s</span>
                </div>
                <div className="text-center space-y-2 my-auto">
                  <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-md">
                    <Image className="size-8" />
                  </div>
                  <span className="text-xs font-mono text-neutral-300 block">
                    Textura Fotorrealista • Proporções 16:9, 9:16, 1:1
                  </span>
                </div>
                <div className="text-[11px] font-mono text-neutral-500 text-center">
                  Pronto para download sem marca d&apos;água
                </div>
              </div>
            </div>
          )}

          {activeTab === "video" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
              <div className="space-y-4">
                <Badge variant="outline" className="border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10 text-xs font-mono">
                  🎬 Kriativa Motion
                </Badge>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                  Tomada Cinemática com Câmera em Movimento
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  Movimentos com inércia física real (Dolly Vertigo, Drone FPV, Órbita 360°) e sonoplastia sincronizada em alta taxa de quadros.
                </p>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-neutral-300 space-y-1">
                  <span className="text-[#FF5500] font-bold block text-[10px] uppercase">Movimento Ativo:</span>
                  <p>&quot;Drone FPV voando rente a uma estrada costeira ao pôr do sol, rotação em 3 eixos e aceleração suave.&quot;</p>
                </div>
              </div>
              <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">
                <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                  <span>FastH3 Cinema (Video + Audio)</span>
                  <span className="text-[#FF5500] font-bold">24fps</span>
                </div>
                <div className="text-center space-y-2 my-auto">
                  <div className="size-16 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] flex items-center justify-center mx-auto shadow-md">
                    <Play className="size-8 fill-[#FF5500]" />
                  </div>
                  <span className="text-xs font-mono text-neutral-300 block">
                    Vídeo Cinemático com Áudio Sincronizado
                  </span>
                </div>
                <div className="text-[11px] font-mono text-neutral-500 text-center">
                  Formatos Widescreen 16:9 & Vertical 9:16
                </div>
              </div>
            </div>
          )}

          {activeTab === "voice" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
              <div className="space-y-4">
                <Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10 text-xs font-mono">
                  🔊 Kriativa Voice
                </Badge>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                  Locução Neural em Português Brasileiro
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  Entonação humana autêntica, pausas dramáticas e dicção impecável sem o aspecto robótico dos geradores convencionais.
                </p>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-neutral-300 space-y-1">
                  <span className="text-purple-400 font-bold block text-[10px] uppercase">Voz Selecionada:</span>
                  <p>&quot;Narrador publicitário jovem, tom inspirador e confiante para comercial de startup.&quot;</p>
                </div>
              </div>
              <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">
                <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                  <span>Síntese Neural 48kHz</span>
                  <span className="text-purple-400 font-bold">PT-BR</span>
                </div>
                <div className="text-center space-y-3 my-auto">
                  <div className="size-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-md">
                    <Mic className="size-8" />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 h-6">
                    <div className="w-1 h-3 bg-purple-400 rounded-full animate-pulse" />
                    <div className="w-1 h-6 bg-purple-400 rounded-full animate-pulse delay-75" />
                    <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse delay-150" />
                    <div className="w-1 h-5 bg-purple-400 rounded-full animate-pulse delay-100" />
                    <div className="w-1 h-2 bg-purple-400 rounded-full animate-pulse" />
                  </div>
                  <span className="text-xs font-mono text-neutral-300 block">
                    Ondas Sonoras & Áudio Master
                  </span>
                </div>
                <div className="text-[11px] font-mono text-neutral-500 text-center">
                  Exportação em formato WAV e MP3 cristalino
                </div>
              </div>
            </div>
          )}

          {activeTab === "text" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
              <div className="space-y-4">
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 bg-cyan-500/10 text-xs font-mono">
                  ✍️ Kriativa Mind
                </Badge>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                  Roteiros Técnicos & Copies de Anúncio
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  Decupagem plano a plano com marcação de câmera, narração sincronizada e copies persuasivas para campanhas de conversão.
                </p>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-neutral-300 space-y-1">
                  <span className="text-cyan-400 font-bold block text-[10px] uppercase">Estrutura Gerada:</span>
                  <p>&quot;Cena 01 (00:00 - 00:04): Close-up dramático com gancho de atenção. Locução: Você ainda perde horas com 5 ferramentas?&quot;</p>
                </div>
              </div>
              <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">
                <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                  <span>Master Scene & Decupagem</span>
                  <span className="text-cyan-400 font-bold">Direção</span>
                </div>
                <div className="text-center space-y-2 my-auto">
                  <div className="size-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-md">
                    <FileText className="size-8" />
                  </div>
                  <span className="text-xs font-mono text-neutral-300 block">
                    Roteiro Estruturado & Copywriting
                  </span>
                </div>
                <div className="text-[11px] font-mono text-neutral-500 text-center">
                  Pronto para exportar e produzir na timeline
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Punchline from copy2.md */}
        <div className="text-center pt-2 space-y-5">
          <p className="font-heading font-black text-sm sm:text-base text-neutral-300 uppercase tracking-wider">
            Veja o que você pode criar com as ferramentas disponíveis.
          </p>

          <div className="flex justify-center">
            <LpCtaButton label="COMEÇAR GRÁTIS →" size="default" />
          </div>
        </div>
      </div>
    </section>
  );
}
