import { AdminView } from "@/components/dashboard/admin/admin-view";
import { ShieldCheck, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Console Administrativo & RBAC | kriativa.app",
  description: "Painel de controle interno, governança de acessos (RBAC), auditoria e gestão de criadores.",
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
              <Shield className="size-4" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold uppercase tracking-tight text-white">
              Administração & Controle de Acessos
            </h2>
          </div>
          <p className="text-xs text-neutral-400 font-sans">
            Área restrita para gestão de membros, moderação, papéis RBAC e integridade da plataforma.
          </p>
        </div>

        <Badge
          variant="outline"
          className="text-xs gap-1.5 self-start sm:self-auto border-[#FF5500]/30 text-[#FF5500] bg-[#FF5500]/10 font-mono"
        >
          <ShieldCheck className="size-3.5" />
          GOVERNANÇA & RBAC
        </Badge>
      </div>

      <AdminView />
    </div>
  );
}
