import { VoiceView } from "@/components/dashboard/voice/voice-view";

export const metadata = {
  title: "Kriativa Voice — Síntese Neural & Transcrição | kriativa.app",
  description:
    "Crie vozes neurais e narrações cinematográficas com expressividade e realize transcrições de áudio.",
};

export default function VoicePage() {
  return (
    <div className="space-y-6">
      <VoiceView />
    </div>
  );
}
