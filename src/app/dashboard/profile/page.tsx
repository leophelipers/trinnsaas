import { ProfileView } from "@/components/dashboard/profile-view";
import { User, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Perfil do Diretor & Segurança | kriativa.app",
  description:
    "Gerenciamento de perfil criativo, alteração de nome, controle de senhas, histórico de dispositivos conectados e cota de renderização.",
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
              <User className="size-4" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold uppercase tracking-tight text-white">
              Perfil & Central de Segurança
            </h2>
          </div>
          <p className="text-xs text-neutral-400 font-sans">
            Gerencie sua identidade no estúdio, credenciais de acesso, dispositivos conectados e cota de geração.
          </p>
        </div>

        <Badge
          variant="outline"
          className="text-xs gap-1.5 self-start sm:self-auto border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono"
        >
          <ShieldCheck className="size-3.5" />
          ESTÚDIO AUTENTICADO
        </Badge>
      </div>

      <ProfileView />
    </div>
  );
}
