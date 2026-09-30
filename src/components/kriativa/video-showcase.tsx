"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Play,
  Film,
  Camera,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

interface ShowcaseItem {
  id: string;
  title: string;
  category: string;
  camera: string;
  aspect: string;
  fps: string;
  prompt: string;
  gradient: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "1",
    title: "Neon Rain Cyber Runner",
    category: "Sci-Fi / Action",
    camera: "FPV Chase Cam 45°",
    aspect: "2.39:1",
    fps: "60 FPS",
    prompt:
      "Mulher cibernética correndo em alta velocidade sob chuva torrencial em Neo-Tóquio, reflexos volumétricos de neon ciano e âmbar, motion blur nos membros mecânicos, iluminação anamórfica de cinema.",
    gradient: "from-orange-950 via-neutral-900 to-black",
  },
  {
    id: "2",
    title: "Haute Couture Silk Motion",
    category: "High Fashion",
    camera: "Slow Orbit 360°",
    aspect: "9:16",
    fps: "120 FPS",
    prompt:
      "Close editorial de moda, tecido de cetim flutuando no vácuo com física fluida e micro-partículas douradas, iluminação de estúdio suave, lente 85mm f/1.2.",
    gradient: "from-amber-950 via-stone-900 to-black",
  },
  {
    id: "3",
    title: "Quantum Hyperspace Warp",
    category: "VFX / Concept",
    camera: "Dolly Zoom (Vertigo)",
    aspect: "16:9",
    fps: "60 FPS",
    prompt:
      "Nave interestelar entrando em dobra espacial, distorção gravitacional de lentes esféricas, partículas quânticas azuis e alaranjadas, estrelas esticadas em raios de luz hiper-realistas.",
    gradient: "from-red-950 via-neutral-950 to-black",
  },
  {
    id: "4",
    title: "Apex Predator Macro Nature",
    category: "Cinematic Wildlife",
    camera: "Tracking Shot Lento",
    aspect: "16:9",
    fps: "60 FPS",
    prompt:
      "Close extremo nos olhos de uma pantera negra sob névoa matinal na floresta tropical, gotas de orvalho nos pelos com fidelidade 8K, profundidade de campo cinematográfica.",
    gradient: "from-emerald-950 via-neutral-900 to-black",
  },
];

export function VideoShowcase() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Film className="size-4 text-[#FF5500]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF5500] font-bold">
              Galeria da Comunidade
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
            Produzido com o Kriativa Motion Engine
          </h2>
        </div>

        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-[#FF5500] flex items-center gap-1.5 font-mono transition-colors self-start sm:self-auto"
        >
          <span>Abrir Studio e Remixar</span>
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {/* Grid of cinematic cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SHOWCASE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group rounded-3xl border border-white/10 bg-[#0C0D12] overflow-hidden hover:border-[#FF5500]/60 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            {/* Mock Video Canvas with Aspect Ratio */}
            <div
              className={`w-full aspect-video bg-gradient-to-br ${item.gradient} p-4 flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Radial flare glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,85,0,0.15),transparent_70%)] pointer-events-none" />

              {/* Top HUD Badges */}
              <div className="flex items-center justify-between z-10 text-[10px] font-mono">
                <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/90">
                  {item.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[#FF5500] font-bold">
                    {item.aspect}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/80">
                    {item.fps}
                  </span>
                </div>
              </div>

              {/* Center Play Button Overlay */}
              <div className="self-center my-auto z-10">
                <div className="size-16 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-[#FF5500] group-hover:text-white group-hover:border-[#FF5500] transition-all shadow-[0_0_25px_rgba(255,85,0,0.3)] cursor-pointer">
                  <Play className="size-7 fill-current ml-0.5" />
                </div>
              </div>

              {/* Bottom Camera Metadata */}
              <div className="flex items-center justify-between z-10 text-[11px] font-mono text-white/90 bg-black/60 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                <span className="flex items-center gap-1.5">
                  <Camera className="size-3.5 text-[#00E5FF]" />
                  {item.camera}
                </span>
                <span className="text-[10px] text-white/50">4K PRORES</span>
              </div>
            </div>

            {/* Prompt Description & Actions */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-white group-hover:text-[#FF5500] transition-colors">
                  {item.title}
                </h3>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleCopy(item.id, item.prompt)}
                  className="text-[11px] gap-1 font-mono text-muted-foreground hover:text-foreground"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copiar Prompt</span>
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                "{item.prompt}"
              </p>

              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-mono">
                  Engine: Kriativa Cinema v2.4
                </span>
                <Link
                  href="/dashboard"
                  className="text-xs text-[#FF5500] hover:underline flex items-center gap-1 font-semibold font-mono"
                >
                  Remixar no Studio →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
