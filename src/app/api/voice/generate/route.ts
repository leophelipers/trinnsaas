import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Catálogo de Vozes Neurais da Kriativa
export const KRIATIVA_VOICE_CATALOG: Record<
  string,
  { name: string; edgeVoice: string; openAiVoice: string; description: string }
> = {
  narrator_cinema: {
    name: "Voz Narrador Cinema (Grave & Dramático)",
    edgeVoice: "pt-BR-AntonioNeural",
    openAiVoice: "onyx",
    description: "Ideal para trailers, introduções épicas e documentários cinematográficos.",
  },
  doc_male: {
    name: "Voz Documentário (Sóbrio & Confiável)",
    edgeVoice: "pt-BR-NicolauNeural",
    openAiVoice: "echo",
    description: "Perfeito para tutoriais técnicos, análises e narrações institucionais.",
  },
  creator_female: {
    name: "Voz Jovem Criadora (Dinâmica & Conectada)",
    edgeVoice: "pt-BR-FranciscaNeural",
    openAiVoice: "nova",
    description: "Excelente para Reels, TikTok, anúncios modernos e storytelling pessoal.",
  },
  news_anchor: {
    name: "Voz Noticiário & Negócios (Articulada & Clara)",
    edgeVoice: "pt-BR-ThalitaNeural",
    openAiVoice: "shimmer",
    description: "Recomendada para podcasts, resumos executivos e releases de mercado.",
  },
  young_male: {
    name: "Voz Criador Ágil (Natural & Descontraída)",
    edgeVoice: "pt-BR-FabioNeural",
    openAiVoice: "alloy",
    description: "Indicada para conversas rápidas, demonstrações de produto e vlogs.",
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { generationId, text, voiceId = "narrator_cinema", speed = 1.0 } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "O texto da locução é obrigatório." }, { status: 400 });
    }

    const internalSecret =
      process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";

    const voiceMeta = KRIATIVA_VOICE_CATALOG[voiceId] || KRIATIVA_VOICE_CATALOG.narrator_cinema;

    let audioBuffer: Buffer | null = null;

    // 1. Tenta gerar via OpenAI TTS se chave estiver configurada
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
      try {
        const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1-hd",
            input: text.trim(),
            voice: voiceMeta.openAiVoice,
            speed: Math.max(0.75, Math.min(speed, 1.5)),
          }),
        });

        if (ttsRes.ok) {
          const arrayBuf = await ttsRes.arrayBuffer();
          audioBuffer = Buffer.from(arrayBuf);
        }
      } catch (openAiErr) {
        console.warn("OpenAI TTS falhou, acionando fallback Edge Neural:", openAiErr);
      }
    }

    // 2. Fallback Neural de Alta Fidelidade (Microsoft Speech TTS em pt-BR)
    if (!audioBuffer) {
      try {
        const edgeUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4`;
        const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='pt-BR'><voice name='${voiceMeta.edgeVoice}'><prosody rate='${speed > 1 ? `+${Math.round((speed - 1) * 50)}%` : `${Math.round((speed - 1) * 50)}%`}' pitch='+0Hz'>${text.trim()}</prosody></voice></speak>`;

        const edgeRes = await fetch(edgeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/ssml+xml",
            "X-Timestamp": new Date().toISOString(),
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
          },
          body: ssml,
        });

        if (edgeRes.ok) {
          const arrayBuf = await edgeRes.arrayBuffer();
          audioBuffer = Buffer.from(arrayBuf);
        }
      } catch (edgeErr) {
        console.warn("Fallback Edge Neural TTS falhou:", edgeErr);
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      if (generationId) {
        await convex.mutation(api.voiceGenerations.failVoiceGeneration, {
          generationId: generationId as Id<"voiceGenerations">,
          errorMessage: "Falha ao sintetizar áudio nos motores de voz neurais.",
          secret: internalSecret,
        });
      }
      return NextResponse.json({ error: "Falha ao sintetizar áudio." }, { status: 500 });
    }

    // 3. Salva o binário gerado diretamente no Convex Storage
    const uploadUrl = await convex.mutation(
      api.voiceGenerations.generateAudioUploadUrl,
      { secret: internalSecret }
    );

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "audio/mpeg" },
      body: new Uint8Array(audioBuffer),
    });

    if (!uploadRes.ok) {
      throw new Error("Falha ao salvar áudio no Convex Storage.");
    }

    const uploadJson = await uploadRes.json();
    const storageId = uploadJson.storageId as Id<"_storage">;

    // Estima duração com base no tamanho do buffer (mp3 ~ 16KB/s)
    const durationSeconds = Math.max(1, Math.round(audioBuffer.length / 16000));

    // 4. Conclui a geração no banco Convex
    if (generationId) {
      await convex.mutation(api.voiceGenerations.completeVoiceGeneration, {
        generationId: generationId as Id<"voiceGenerations">,
        outputStorageId: storageId,
        durationSeconds,
        secret: internalSecret,
      });
    }

    return NextResponse.json({
      success: true,
      storageId,
      durationSeconds,
      voiceName: voiceMeta.name,
    });
  } catch (err: any) {
    console.error("Erro em /api/voice/generate:", err);
    return NextResponse.json({ error: err.message || "Erro interno ao gerar voz." }, { status: 500 });
  }
}
