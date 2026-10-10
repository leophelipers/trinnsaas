"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems: FaqItem[] = [
    {
      q: "Preciso pagar para criar minha conta?",
      a: "Não. O cadastro é gratuito e você não precisa inserir cartão de crédito para começar.",
    },
    {
      q: "Quanto custa usar a Kriativa?",
      a: "Você pode comprar créditos a partir de R$ 5,00 (recebendo 20 créditos imediatos que nunca expiram) ou assinar o plano Kriativa Ilimitada por R$ 200,00/mês.",
    },
    {
      q: "Os créditos expiram?",
      a: "Não. Os créditos comprados não expiram.",
    },
    {
      q: "Posso cancelar a assinatura?",
      a: "Sim. Você pode cancelar quando quiser, diretamente pelo painel.",
    },
    {
      q: "O que significa “ilimitado”?",
      a: "Significa uso contínuo dos recursos incluídos na assinatura dentro dos limites técnicos, operacionais e de uso justo da plataforma. Alguns modelos podem ter limites específicos. Caso um modelo atinja seu limite, a plataforma direciona para uma alternativa disponível para que você continue criando.",
    },
    {
      q: "Quais modelos vocês utilizam?",
      a: "A Kriativa reúne diferentes modelos de inteligência artificial, incluindo modelos open source de ponta (como Vision para imagens, Motion para vídeos, Voice para áudio e Mind para textos). Os modelos disponíveis evoluem continuamente junto com a comunidade global.",
    },
    {
      q: "Posso usar comercialmente?",
      a: "Sim, para usos permitidos pela plataforma e respeitando os termos, licenças aplicáveis, direitos de terceiros e políticas das plataformas onde o conteúdo será utilizado.",
    },
    {
      q: "A Kriativa é brasileira?",
      a: "Sim. A Kriativa é uma plataforma brasileira criada para reunir diferentes tecnologias de inteligência artificial em um único lugar, com pagamento direto em Real (PIX e Cartão) e suporte em português.",
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="container mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider">
          <HelpCircle className="size-3.5 text-[#FF5500]" />
          FAQ de Conversão
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Ainda ficou com alguma dúvida?
        </h2>
      </div>

      <div className="space-y-3">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-[#FF5500]/50 bg-[#0E1017] shadow-lg shadow-[#FF5500]/5"
                  : "border-white/10 bg-[#0A0B0E] hover:border-white/20"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="font-heading font-bold text-sm sm:text-base text-white tracking-tight">
                  {item.q}
                </span>
                <div
                  className={`size-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#FF5500]" : "text-neutral-400"
                  }`}
                >
                  <ChevronDown className="size-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans border-t border-white/5 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
