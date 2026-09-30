import { PricingView } from "@/components/dashboard/admin/pricing-view";
import { Calculator, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Precificação Dinâmica & Custos de GPU | kriativa.app",
  description: "Gestão em tempo real de custos de GPU ComfyUI, unit economics por requisição, calculadora de projeção e análise de crossover para servidor dedicado.",
};

export default function PricingPage() {
  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
              <Calculator className="size-4" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold uppercase tracking-tight text-white">
              Precificação de Workflows & Custos de GPU
            </h2>
          </div>
          <p className="text-xs text-neutral-400 font-sans">
            Ajuste dinâmico de preços sem novo deploy, margens de lucro por render ComfyUI e recomendador de infraestrutura (Serverless vs. Instância Fixa).
          </p>
        </div>

        <Badge
          variant="outline"
          className="text-xs gap-1.5 self-start sm:self-auto border-[#FF5500]/30 text-[#FF5500] bg-[#FF5500]/10 font-mono"
        >
          <Cpu className="size-3.5" />
          UNIT ECONOMICS LIVE
        </Badge>
      </div>

      <PricingView />
    </div>
  );
}
