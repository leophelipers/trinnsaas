import { FeatureFlagsView } from "@/components/dashboard/admin/feature-flags-view";
import { Sliders, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Feature Flags & Governança | kriativa.app",
  description: "Controle em tempo real de ativação de recursos, gateways e módulos do estúdio.",
};

export default function FeatureFlagsPage() {
  return (
    <div className="space-y-6">
      <FeatureFlagsView />
    </div>
  );
}
