import { CreditsView } from "@/components/dashboard/admin/credits-view";
import { Coins, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Gestão de Créditos & Pacotes | kriativa.app",
  description: "Painel de tesouraria, CRUD de pacotes comerciais de créditos e gestão de saldo por criador com auditoria imutável.",
};

export default function CreditsPage() {
  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
              <Coins className="size-4" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold uppercase tracking-tight text-white">
              Tesouraria, Pacotes & Créditos por Usuário
            </h2>
          </div>
          <p className="text-xs text-neutral-400 font-sans">
            CRUD de pacotes de venda, controle de saldos individuais (pagos vs bônus), recargas com justificativa e histórico no livro-razão.
          </p>
        </div>

        <Badge
          variant="outline"
          className="text-xs gap-1.5 self-start sm:self-auto border-[#FF5500]/30 text-[#FF5500] bg-[#FF5500]/10 font-mono"
        >
          <Package className="size-3.5" />
          TESOURARIA & CRÉDITOS
        </Badge>
      </div>

      <CreditsView />
    </div>
  );
}
