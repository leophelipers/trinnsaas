import { UserCreditsView } from "@/components/dashboard/credits/user-credits-view";
import { Coins, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Saldo & Créditos do Estúdio | kriativa.app",
  description: "Recarregue seus créditos para criação cinematográfica sob demanda, ative o Auto Top-up para bônus diários dobrados e acompanhe seu consumo em tempo real.",
};

export default function CreditsPage() {
  return (
    <div className="space-y-6">
      {/* Header com Iluminação Ambiente e Status do Estúdio */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0C0D12] via-[#12141F] to-[#0C0D12] border border-white/10 p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Glows de Fundo */}
        <div className="absolute top-0 right-1/4 w-80 h-36 bg-[#FF5500]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#FF5500]/25 to-[#FF5500]/5 text-[#FF5500] border border-[#FF5500]/30 shadow-md">
                <Coins className="size-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black uppercase tracking-tight text-white">
                Saldo & Créditos do Estúdio
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-2xl leading-relaxed">
              Recarregue seus créditos para criar vídeos cinematográficos e imagens a partir de R$ 5,00. Ative o Auto Top-up para 
              garantir criações contínuas e dobrar sua recompensa diária para 10 créditos grátis.
            </p>
          </div>

          {/* Badges de Garantia e Estúdio */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <Badge
              variant="outline"
              className="text-[11px] gap-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono py-1.5 px-3"
            >
              <Sparkles className="size-3.5" />
              MERCADO PAGO OFICIAL
            </Badge>
            <Badge
              variant="outline"
              className="text-[11px] gap-1.5 border-cyan-500/30 text-cyan-400 bg-cyan-500/10 font-mono py-1.5 px-3"
            >
              CRÉDITOS SEM EXPIRAÇÃO
            </Badge>
          </div>
        </div>
      </div>

      <UserCreditsView />
    </div>
  );
}
