"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FaqItem {
  q: string;
  a: string;
}

export function LpFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems: FaqItem[] = [
    {
      q: "A Kriativa é gratuita?",
      a: "Criar uma conta é gratuito e não exige cartão de crédito. O acesso às gerações e aos recursos de cada ferramenta depende das condições disponíveis na plataforma.",
    },
    {
      q: "Preciso cadastrar um cartão de crédito?",
      a: "Não. Você pode criar sua conta sem informar cartão de crédito.",
    },
    {
      q: "Como funcionam os créditos?",
      a: "Você pode comprar pacotes a partir de R$ 5. Os créditos comprados não expiram. O consumo depende da ferramenta e do tipo de geração.",
    },
    {
      q: "Como funciona o plano mensal de R$ 200?",
      a: "O plano oferece acesso aos recursos incluídos na assinatura, sujeito às condições de uso justo e aos limites técnicos de cada ferramenta. Alguns modelos podem ter limites específicos e, quando aplicável, a plataforma pode oferecer uma alternativa.",
    },
    {
      q: "Posso gerar imagens, vídeos, áudios e textos?",
      a: "A Kriativa reúne ferramentas dessas categorias. Os recursos específicos disponíveis podem variar conforme os modelos e as funcionalidades habilitadas na plataforma.",
    },
    {
      q: "Preciso saber programar?",
      a: "Não. Você pode utilizar as ferramentas disponíveis pela interface da Kriativa, sem precisar configurar os modelos ou montar a infraestrutura de execução por conta própria.",
    },
    {
      q: "Posso utilizar o conteúdo comercialmente?",
      a: "O uso comercial depende das condições aplicáveis ao modelo utilizado, dos termos da plataforma e dos direitos envolvidos no conteúdo gerado. Consulte essas condições antes de utilizar os resultados em projetos comerciais.",
    },
    {
      q: "Todos os modelos são ilimitados?",
      a: "Não necessariamente. A disponibilidade e os limites podem variar por modelo, ferramenta e plano. A plataforma pode oferecer alternativas quando determinados limites forem atingidos.",
    },
    {
      q: "Os créditos comprados expiram?",
      a: "Não. Os créditos comprados não expiram, conforme as condições da plataforma.",
    },
    {
      q: "Como posso enviar sugestões ou pedir ajuda?",
      a: "Entre em contato pelos canais oficiais de suporte da Kriativa. Seu feedback é importante para identificar problemas e orientar melhorias.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="container mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
          <HelpCircle className="size-3.5 text-[#FF5500]" />
          Perguntas Frequentes
        </div>

        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white uppercase leading-tight">
          Perguntas Frequentes
        </h2>

        <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
          Tire suas dúvidas sobre o funcionamento, créditos e planos da Kriativa.
        </p>
      </div>

      <div className="space-y-3">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-[#FF5500]/50 bg-[#0F1017] shadow-lg"
                  : "border-white/10 bg-[#0A0B0F] hover:border-white/20"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <span className="font-heading font-bold text-sm sm:text-base text-white">
                  {item.q}
                </span>
                <ChevronDown
                  className={`size-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#FF5500]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans border-t border-white/5 pt-3 animate-in fade-in-50 duration-150">
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
