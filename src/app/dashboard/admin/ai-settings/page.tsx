import { AiSettingsView } from "@/components/dashboard/admin/ai-settings-view";
import { Sparkles, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Configurações de Motores de IA | kriativa.app",
  description:
    "Gestão em tempo real de provedores de IA, roteamento OpenRouter vs RunPod, endpoints vLLM e custos em créditos.",
};

export default function AiSettingsPage() {
  return (
    <div className="space-y-6">
      <AiSettingsView />
    </div>
  );
}
