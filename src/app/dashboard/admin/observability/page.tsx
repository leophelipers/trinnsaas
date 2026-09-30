import { ObservabilityView } from "@/components/dashboard/admin/observability-view";

export const metadata = {
  title: "Observabilidade & Telemetria | kriativa.app",
  description: "Monitoramento em tempo real de saúde bancária, fluxos de créditos e logs de auditoria.",
};

export default function ObservabilityPage() {
  return (
    <div className="space-y-6">
      <ObservabilityView />
    </div>
  );
}
