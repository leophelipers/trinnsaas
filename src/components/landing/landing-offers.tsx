"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Flame,
  Clock,
  Infinity as InfinityIcon,
  HelpCircle,
  QrCode,
  CreditCard,
  Crown,
  Film,
  Lock,
} from "lucide-react";

export function LandingOffers() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="ofertas" className="relative container mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
      {/* Background Solar Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.1),transparent_70%)] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF5500]/30 bg-[#FF5500]/10 text-xs font-mono font-bold text-[#FF5500] uppercase tracking-wider">
          <Sparkles className="size-3.5 fill-[#FF5500]" />
          Preços Simples & Transparentes
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Duas Ofertas.{" "}
          <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF8800] bg-clip-text text-transparent">
            Poder Ilimitado de Criação.
          </span>
        </h2>
        <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed font-sans">
          Acesso direto à plataforma multimídia completa: geração de imagens fotorrealistas, vídeos cinemáticos com áudio, roteirização profissional e agentes de produção. Comece por R$ 5 ou crie ilimitado por R$ 200/mês.
        </p>
      </div>

      {/* The 2 Core Offers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        
        {/* ======================================================== */}
        {/* OFERTA 1: RECARGA MÍNIMA / ENTRADA FLEXÍVEL - R$ 5,00 */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0C0D12] p-6 sm:p-9 flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl">
          <div className="space-y-6">
            {/* Top Badges */}
            <div className="flex items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">
                Acesso Flexível
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                <CheckCircle2 className="size-3.5" />
                Sem Mensalidade
              </span>
            </div>

            {/* Title & Headline */}
            <div>
              <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tight">
                Entrada sob Demanda
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                Ideal para cineastas iniciantes, testes rápidos e para quem quer experimentar a ferramenta pelo menor valor do mercado.
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-neutral-400 uppercase">Apenas</span>
                <span className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight">
                  R$ 5,00
                </span>
                <span className="text-xs font-mono text-neutral-400">/ recarga mínima</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <span>⚡ 20 Créditos no Estúdio (R$ 0,25 por crédito)</span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400">
                Gera até 10 imagens em alta definição ou 3 vídeos cinematográficos com áudio
              </p>
            </div>

            {/* Features Checklist */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                Tudo o que está incluso:
              </span>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Créditos que NUNCA expiram:</strong> use no seu próprio ritmo, sem perder saldo no fim do mês.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Geração de Imagens & Vídeos:</strong> crie concepts fotorrealistas e tomadas com física de câmera 3D.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Roteiros & Decupagem com IA:</strong> formate cenas profissionais e copy para anúncios com o assistente.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Câmera 3D & Multi-Formatos:</strong> Drone FPV, Órbita 360°, Widescreen 16:9, Vertical 9:16 e Anamórfico.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Direitos Comerciais 100% Seus:</strong> lucre com materiais para clientes sem pagar royalties.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero compromisso:</strong> sem contrato, sem mensalidade compulsória oculta.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Action */}
          <div className="pt-8 space-y-3">
            <Unauthenticated>
              <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding" signInFallbackRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="w-full py-4 px-6 rounded-2xl font-heading font-black text-sm uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-lg active:scale-[0.99]"
                >
                  <span>Começar por R$ 5,00</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
            </Unauthenticated>

            <Authenticated>
              <Link
                href="/dashboard/credits"
                className="w-full py-4 px-6 rounded-2xl font-heading font-black text-sm uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center justify-center gap-2 group shadow-lg active:scale-[0.99]"
              >
                <span>Recarregar a Partir de R$ 5,00</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Authenticated>

            <p className="text-[11px] text-center text-neutral-400 font-mono">
              Pagamento seguro • Liberação de saldo em até 3 segundos
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* OFERTA 2: ASSINATURA PRO ILIMITADA - R$ 200,00 / MÊS */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl border-2 border-[#FF5500] bg-gradient-to-b from-[#141210] via-[#0D0E14] to-[#0A0B0E] p-6 sm:p-9 flex flex-col justify-between shadow-[0_0_50px_rgba(255,85,0,0.25)] hover:shadow-[0_0_70px_rgba(255,85,0,0.35)] transition-all duration-300 relative overflow-hidden">
          
          {/* Most Popular Floating Ribbon */}
          <div className="absolute top-0 right-0 bg-gradient-to-l from-[#FF5500] to-[#FF7700] text-white font-mono text-[11px] font-black uppercase tracking-wider px-5 py-1.5 rounded-bl-2xl shadow-md flex items-center gap-1.5">
            <Crown className="size-3.5 fill-white" />
            MAIS ESCOLHIDO POR PRODUTORAS
          </div>

          <div className="space-y-6">
            {/* Top Badges */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full border border-[#FF5500]/40 bg-[#FF5500]/15 font-mono text-[11px] font-bold text-[#FF5500] uppercase tracking-wider flex items-center gap-1">
                <Flame className="size-3.5 fill-[#FF5500]" />
                Assinatura Ilimitada
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Melhor Custo-Benefício
              </span>
            </div>

            {/* Title & Headline */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight">
                Plano Ilimitado Pro
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
                Produção sem limites para criadores frequentes, videomakers, agências e canais do YouTube. Crie o dia todo sem medo de créditos acabarem.
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FF5500]/10 to-transparent border border-[#FF5500]/30 space-y-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight">
                  R$ 200,00
                </span>
                <span className="text-xs font-mono text-neutral-300 font-medium">/ mês</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#FF8800] font-bold">
                <InfinityIcon className="size-3.5" />
                <span>IA Ilimitada dos Nossos Modelos Proprietários</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Sem fidelidade • Cancele quando quiser com 1 clique
              </p>
            </div>

            {/* Features Checklist */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold block">
                O que torna esta oferta imbatível:
              </span>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-200">
                <li className="flex items-start gap-2.5">
                  <div className="p-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] shrink-0 mt-0.5">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <span><strong className="text-white">Gerações Ilimitadas de Vídeo:</strong> crie tomadas ilimitadas com nossos motores FastH3 (Text-to-Video e Image-to-Video).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="p-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] shrink-0 mt-0.5">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <span><strong className="text-white">Gerações Ilimitadas de Imagens:</strong> motor Krea-2 Turbo de altíssima resolução gerando em apenas ~7 segundos.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="p-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] shrink-0 mt-0.5">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <span><strong className="text-white">Áudio Nativo Sincronizado:</strong> vídeos renderizados já com sonoplastia e efeitos atmosféricos integrados.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="p-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] shrink-0 mt-0.5">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <span><strong className="text-white">Cofre de Consistência de Atores:</strong> mantenha exatamente o mesmo personagem e figurino em todos os cortes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="p-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] shrink-0 mt-0.5">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <span><strong className="text-white">Kriativa Muse & Agentes de IA:</strong> assistente de roteiro, diretor de cena e agentes de produção ilimitados.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="p-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] shrink-0 mt-0.5">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <span><strong className="text-white">Fila de Renderização Prioritária:</strong> suas gerações são processadas na frente, sem tempo de espera.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="p-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] shrink-0 mt-0.5">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <span><strong className="text-white">Exportação Master 4K UHD:</strong> máxima fidelidade visual com lentes anamórficas virtuais 35mm e 85mm.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Action */}
          <div className="pt-8 space-y-3">
            <Unauthenticated>
              <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding" signInFallbackRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="w-full py-4 px-6 rounded-2xl font-heading font-black text-sm uppercase tracking-wider bg-gradient-to-r from-[#FF5500] via-[#FF6600] to-[#FF7700] hover:from-[#ff6600] hover:to-[#ff8800] text-white transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_35px_rgba(255,85,0,0.5)] active:scale-[0.99]"
                >
                  <span>Assinar Ilimitado — R$ 200/mês</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
            </Unauthenticated>

            <Authenticated>
              <Link
                href="/dashboard/credits?plan=unlimited"
                className="w-full py-4 px-6 rounded-2xl font-heading font-black text-sm uppercase tracking-wider bg-gradient-to-r from-[#FF5500] via-[#FF6600] to-[#FF7700] hover:from-[#ff6600] hover:to-[#ff8800] text-white transition-all flex items-center justify-center gap-2 group shadow-[0_0_35px_rgba(255,85,0,0.5)] active:scale-[0.99]"
              >
                <span>Ativar Assinatura Ilimitada (R$ 200/mês)</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Authenticated>

            <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                100% Criptografado
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5 text-[#FF5500]" />
                Ativação Imediata
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Trust & Guarantees Strip */}
      <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="space-y-1">
          <span className="text-xs font-mono text-[#FF5500] font-bold block">⚡ Liberação em 3s</span>
          <p className="text-[11px] text-neutral-400">Pix com confirmação instantânea de saldo</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-mono text-emerald-400 font-bold block">✓ Direitos Comerciais</span>
          <p className="text-[11px] text-neutral-400">100% livre de royalties para monetizar</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-mono text-cyan-400 font-bold block">🔒 Sem Fidelidade</span>
          <p className="text-[11px] text-neutral-400">Cancele a assinatura quando quiser</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-mono text-amber-400 font-bold block">⭐️ Suporte VIP</span>
          <p className="text-[11px] text-neutral-400">Atendimento humanizado em português</p>
        </div>
      </div>
    </section>
  );
}
