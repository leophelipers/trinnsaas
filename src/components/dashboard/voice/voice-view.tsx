"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Mic,
  Volume2,
  FileAudio,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Upload,
  CheckCircle2,
  Clock,
  Radio,
  Sliders,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const VOICES = [
  {
    id: "narrator_cinema",
    name: "Voz Narrador Cinema",
    tier: "pro",
    badge: "Cinema Master",
    desc: "Grave, impactante e cinematográfico. Ideal para trailers, aberturas e épicos.",
  },
  {
    id: "doc_male",
    name: "Voz Documentário",
    tier: "pro",
    badge: "Sóbrio",
    desc: "Tom sóbrio, analítico e confiável. Para conteúdos educativos e tutoriais técnicos.",
  },
  {
    id: "creator_female",
    name: "Voz Jovem Criadora",
    tier: "swift",
    badge: "Dinâmica",
    desc: "Dinâmica, expressiva e moderna. Perfeita para Reels, TikTok e anúncios.",
  },
  {
    id: "news_anchor",
    name: "Voz Noticiário & Negócios",
    tier: "swift",
    badge: "Articulada",
    desc: "Clara, articulada e formal. Recomendada para resumos executivos e releases.",
  },
  {
    id: "young_male",
    name: "Voz Criador Ágil",
    tier: "swift",
    badge: "Descontraída",
    desc: "Natural, rápida e conversacional. Ideal para vlogs e demonstrações de produto.",
  },
];

export function VoiceView() {
  const voiceGenerations = useQuery(api.voiceGenerations.listMyVoiceGenerations, {});
  const studioAccess = useQuery(api.studioGenerations.getStudioAccessStatus);
  const isUnlimited = Boolean(studioAccess?.isUnlimited);

  const createVoice = useMutation(api.voiceGenerations.createVoiceGeneration);

  // Estados da Síntese de Voz
  const [text, setText] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("narrator_cinema");
  const [speed, setSpeed] = useState<number>(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de Transcrição
  const [transcribeFile, setTranscribeFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);

  // Áudio Player Local
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedVoice = VOICES.find((v) => v.id === selectedVoiceId) || VOICES[0];
  const creditCost = isUnlimited ? 0 : selectedVoice.tier === "pro" ? 2 : 1;

  const handleGenerateVoice = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // 1. Cria o registro no Convex
      const genRes = await createVoice({
        type: "tts",
        tier: selectedVoice.tier as "swift" | "pro",
        text: text.trim(),
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
      });

      // 2. Dispara o motor de síntese neural
      const res = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: genRes.generationId,
          text: text.trim(),
          voiceId: selectedVoice.id,
          speed,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Falha na síntese do áudio neural.");
      }

      setText("");
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao gerar voz neural.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranscribeAudio = async () => {
    if (!transcribeFile) return;

    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      const genRes = await createVoice({
        type: "transcribe",
        tier: "transcribe",
        text: `Arquivo: ${transcribeFile.name}`,
        voiceId: "transcribe",
        voiceName: "Kriativa Voice Transcribe",
      });

      const formData = new FormData();
      formData.append("file", transcribeFile);
      formData.append("generationId", genRes.generationId);

      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Falha na transcrição de áudio.");
      }

      const data = await res.json();
      setTranscribedText(data.text);
      setTranscribeFile(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao transcrever arquivo de áudio.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handlePlayToggle = (id: string, url: string) => {
    if (playingId === id) {
      setPlayingId(null);
      const audioEl = document.getElementById(`audio-${id}`) as HTMLAudioElement;
      if (audioEl) audioEl.pause();
    } else {
      setPlayingId(id);
      const audioEl = document.getElementById(`audio-${id}`) as HTMLAudioElement;
      if (audioEl) {
        audioEl.play();
        audioEl.onended = () => setPlayingId(null);
      }
    }
  };

  const copyToClipboard = (textToCopy: string, id: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header com estilo Solar Cinema */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0C0D12] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-[radial-gradient(ellipse_at_top_right,rgba(255,85,0,0.12),transparent_70%)] pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
              <Mic className="size-5" />
            </span>
            <h2 className="text-2xl font-heading font-extrabold uppercase tracking-tight text-white">
              Kriativa Voice
            </h2>
            <Badge className="bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30 font-mono text-[10px]">
              Pilar 03
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Síntese neural de vozes expressivas para roteiros cinematográficos, comerciais e redes, além de transcrição automatizada de arquivos de áudio.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {isUnlimited ? (
            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-mono text-xs py-1 px-3">
              ✨ PLANO ILIMITADO ATIVO
            </Badge>
          ) : (
            <Badge variant="outline" className="border-white/15 text-neutral-300 font-mono text-xs py-1 px-3">
              Saldo: {studioAccess?.totalCredits ?? 0} créditos
            </Badge>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs Principais: Síntese de Voz vs Transcrição */}
      <Tabs defaultValue="tts" className="space-y-6">
        <TabsList className="bg-[#0C0D12] border border-white/10 p-1.5 rounded-2xl w-full flex flex-wrap gap-1.5">
          <TabsTrigger value="tts" className="flex items-center gap-2">
            <Volume2 className="size-4" />
            Síntese de Voz & Locução (Voice Swift & Pro)
          </TabsTrigger>
          <TabsTrigger value="transcribe" className="flex items-center gap-2">
            <FileAudio className="size-4" />
            Transcrição de Áudio (Voice Transcribe)
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* ABA 1: SÍNTESE DE VOZ (TTS)                                              */}
        {/* ========================================================================= */}
        <TabsContent value="tts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor de Texto & Disparo */}
            <Card className="lg:col-span-7 bg-[#0C0D12] border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading font-bold text-white flex items-center justify-between">
                  <span>Roteiro / Texto da Locução</span>
                  <span className="text-[11px] font-mono text-neutral-500 font-normal">
                    {text.length} caracteres
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-neutral-400">
                  Insira o diálogo, monólogo ou roteiro para geração da locução neural.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ex: Em um futuro onde a gravidade é apenas uma lembrança distante, uma nova geração de exploradores decide reconstruir o horizonte..."
                  rows={6}
                  className="w-full rounded-xl bg-black/60 border border-white/10 p-4 text-xs text-white placeholder:text-neutral-500 focus:border-[#FF5500] focus:outline-none transition-colors leading-relaxed resize-none"
                />

                {/* Controles de Velocidade & Ação */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-1.5 border border-white/10 text-xs">
                    <Sliders className="size-3.5 text-[#FF5500]" />
                    <span className="text-neutral-400 text-[11px]">Velocidade:</span>
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      {[0.85, 1.0, 1.15].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSpeed(s)}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            speed === s
                              ? "bg-[#FF5500] text-white font-bold"
                              : "text-neutral-400 hover:text-white"
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateVoice}
                    disabled={isGenerating || !text.trim()}
                    className="bg-gradient-to-r from-[#FF5500] to-[#E03D00] hover:brightness-110 text-white font-heading font-bold text-xs px-6 h-10 rounded-xl gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Sintetizando Locução...
                      </>
                    ) : (
                      <>
                        <Volume2 className="size-3.5" />
                        <span>SINTETIZAR VOZ</span>
                        <span className="font-mono text-[10px] bg-black/40 px-2 py-0.5 rounded-full border border-white/20">
                          {isUnlimited ? "✨ ILIMITADO" : `✨ ${creditCost} cr`}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seletor de Vozes Neurais */}
            <Card className="lg:col-span-5 bg-[#0C0D12] border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading font-bold text-white flex items-center gap-2">
                  <Radio className="size-4 text-[#FF5500]" />
                  Banco de Vozes Cinematográficas
                </CardTitle>
                <CardDescription className="text-xs text-neutral-400">
                  Selecione a voz neural ideal para o tom da sua produção.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2.5">
                {VOICES.map((v) => {
                  const isSelected = selectedVoiceId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVoiceId(v.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#FF5500]/10 border-[#FF5500] shadow-sm shadow-[#FF5500]/10"
                          : "bg-black/30 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-heading font-bold text-xs text-white">
                          {v.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono ${
                            v.tier === "pro"
                              ? "border-[#FF5500]/40 text-[#FF5500] bg-[#FF5500]/10"
                              : "border-sky-500/40 text-sky-400 bg-sky-500/10"
                          }`}
                        >
                          {v.badge}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug">
                        {v.desc}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* ABA 2: TRANSCRIÇÃO DE ÁUDIO                                              */}
        {/* ========================================================================= */}
        <TabsContent value="transcribe" className="space-y-6">
          <Card className="bg-[#0C0D12] border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading font-bold text-white flex items-center gap-2">
                <FileAudio className="size-4 text-[#FF5500]" />
                Kriativa Voice Transcribe
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Faça upload de áudios (.mp3, .wav, .m4a) ou vídeos para extrair transcrições em texto de alta precisão.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center space-y-3 bg-black/40 hover:border-[#FF5500]/40 transition-colors">
                <Upload className="size-8 text-[#FF5500] mx-auto opacity-80" />
                <div>
                  <label className="cursor-pointer">
                    <span className="text-xs text-[#FF5500] hover:underline font-heading font-bold">
                      Clique para selecionar um arquivo
                    </span>
                    <span className="text-xs text-neutral-400"> ou arraste para cá</span>
                    <input
                      type="file"
                      accept="audio/*,video/*"
                      onChange={(e) => setTranscribeFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Formatos suportados: MP3, WAV, M4A, MP4 (até 25MB)
                  </p>
                </div>

                {transcribeFile && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white">
                    <FileAudio className="size-3.5 text-emerald-400" />
                    <span>{transcribeFile.name}</span>
                    <span className="text-[10px] text-neutral-400">
                      ({(transcribeFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleTranscribeAudio}
                  disabled={isTranscribing || !transcribeFile}
                  className="bg-[#FF5500] hover:bg-[#E03D00] text-white font-heading font-bold text-xs px-6 h-10 rounded-xl gap-2 disabled:opacity-50"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Transcrevendo Áudio...
                    </>
                  ) : (
                    <>
                      <FileText className="size-3.5" />
                      Iniciar Transcrição
                    </>
                  )}
                </Button>
              </div>

              {transcribedText && (
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold text-emerald-400">
                      Resultado da Transcrição
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(transcribedText, "transcription")}
                      className="text-xs text-neutral-300 hover:text-white h-7 gap-1"
                    >
                      {copiedId === "transcription" ? (
                        <>
                          <Check className="size-3 text-emerald-400" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          Copiar Texto
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-neutral-300 font-mono leading-relaxed select-all whitespace-pre-wrap">
                    {transcribedText}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Histórico Reativo de Áudios & Locuções */}
      <Card className="bg-[#0C0D12] border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-neutral-400" />
              Histórico de Vozes & Transcrições ({voiceGenerations?.length ?? 0})
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {voiceGenerations === undefined ? (
            <div className="space-y-3 py-4">
              <div className="h-14 bg-white/5 rounded-xl animate-pulse" />
              <div className="h-14 bg-white/5 rounded-xl animate-pulse" />
            </div>
          ) : voiceGenerations.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
              <Mic className="size-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400">
                Você ainda não gerou nenhuma locução ou transcrição.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-black/40">
              {voiceGenerations.map((item) => (
                <div
                  key={item._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold text-xs text-white">
                        {item.voiceName}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono ${
                          item.status === "completed"
                            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                            : item.status === "processing"
                              ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                              : "border-rose-500/30 text-rose-400 bg-rose-500/10"
                        }`}
                      >
                        {item.status === "completed"
                          ? "CONCLUÍDO"
                          : item.status === "processing"
                            ? "PROCESSANDO"
                            : "FALHOU"}
                      </Badge>
                      {item.durationSeconds && (
                        <span className="text-[10px] font-mono text-neutral-500">
                          {item.durationSeconds}s
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 line-clamp-2 font-mono">
                      {item.text}
                    </p>
                  </div>

                  {item.outputUrl && item.status === "completed" && (
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Hidden HTML5 Audio Element */}
                      <audio id={`audio-${item._id}`} src={item.outputUrl} preload="none" />

                      <Button
                        size="sm"
                        onClick={() => handlePlayToggle(item._id, item.outputUrl!)}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs h-8 px-3 rounded-lg gap-1.5"
                      >
                        {playingId === item._id ? (
                          <>
                            <Pause className="size-3.5 text-[#FF5500]" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="size-3.5 text-emerald-400" />
                            Ouvir
                          </>
                        )}
                      </Button>

                      <a
                        href={item.outputUrl}
                        download={`kriativa-voice-${item._id}.mp3`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors"
                      >
                        <Download className="size-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
