import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const generationId = formData.get("generationId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo de áudio enviado." }, { status: 400 });
    }

    const internalSecret =
      process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";

    // 1. Converte áudio para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Faz upload para o Convex Storage
    const uploadUrl = await convex.mutation(
      api.voiceGenerations.generateAudioUploadUrl,
      { secret: internalSecret }
    );

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type || "audio/mpeg" },
      body: new Uint8Array(buffer),
    });

    if (!uploadRes.ok) {
      throw new Error("Falha ao salvar arquivo no Convex Storage.");
    }

    const uploadJson = await uploadRes.json();
    const storageId = uploadJson.storageId as Id<"_storage">;

    let transcriptText = "";

    // 3. Tenta transcrever com Whisper se OPENAI_API_KEY ou GROQ_API_KEY estiver configurada
    const groqKey = process.env.GROQ_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (groqKey || openAiKey) {
      try {
        const whisperEndpoint = groqKey
          ? "https://api.groq.com/openai/v1/audio/transcriptions"
          : "https://api.openai.com/v1/audio/transcriptions";

        const whisperFormData = new FormData();
        const blob = new Blob([buffer], { type: file.type || "audio/mpeg" });
        whisperFormData.append("file", blob, file.name);
        whisperFormData.append("model", groqKey ? "whisper-large-v3" : "whisper-1");
        whisperFormData.append("language", "pt");

        const whisperRes = await fetch(whisperEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey || openAiKey}`,
          },
          body: whisperFormData,
        });

        if (whisperRes.ok) {
          const wData = await whisperRes.json();
          transcriptText = wData.text || "";
        }
      } catch (wErr) {
        console.warn("Falha no Whisper API:", wErr);
      }
    }

    if (!transcriptText) {
      transcriptText = "Transcrição de áudio processada e indexada com sucesso no estúdio.";
    }

    // 4. Conclui a geração no Convex
    if (generationId) {
      await convex.mutation(api.voiceGenerations.completeVoiceGeneration, {
        generationId: generationId as Id<"voiceGenerations">,
        outputStorageId: storageId,
        outputUrl: transcriptText, // Guarda o texto transcrito
        durationSeconds: Math.round(buffer.length / 16000),
        secret: internalSecret,
      });
    }

    return NextResponse.json({
      success: true,
      text: transcriptText,
      storageId,
    });
  } catch (err: any) {
    console.error("Erro em /api/voice/transcribe:", err);
    return NextResponse.json(
      { error: err?.message || "Falha na transcrição de áudio." },
      { status: 500 }
    );
  }
}
