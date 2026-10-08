import { NextRequest, NextResponse } from "next/server";
import {
  buildWorkflowPayload,
  buildHiggsfieldPayload,
  RUNPOD_ENDPOINTS,
  HIGGSFIELD_MODELS,
  StudioEngine,
  RunPodEngine,
  HiggsfieldEngine,
  getEngineProvider,
} from "@/lib/studio/workflow-builder";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let {
      generationId,
      engine,
      prompt,
      negativePrompt,
      seed,
      width,
      height,
      durationSeconds,
      fps,
      steps,
      cfgScale,
      inputImageStorageId,
      imageUrl,
      imageBase64,
      lastFrameStorageId,
      lastFrameUrl,
      lastFrameBase64,
      loraConfig,
    } = body;

    // Se a imagem estiver no Convex Storage e base64 não tiver sido enviado diretamente
    if (!imageBase64 && inputImageStorageId) {
      try {
        const storageUrl = await convex.query(api.studioGenerations.getStorageUrl, {
          storageId: inputImageStorageId as Id<"_storage">,
        });
        if (storageUrl) {
          const imgRes = await fetch(storageUrl);
          const arrayBuffer = await imgRes.arrayBuffer();
          imageBase64 = Buffer.from(arrayBuffer).toString("base64");
        }
      } catch (err) {
        console.error("Falha ao recuperar inputImageStorageId:", err);
      }
    } else if (!imageBase64 && imageUrl && imageUrl.startsWith("http")) {
      try {
        const imgRes = await fetch(imageUrl);
        const arrayBuffer = await imgRes.arrayBuffer();
        imageBase64 = Buffer.from(arrayBuffer).toString("base64");
      } catch (err) {
        console.error("Falha ao recuperar imageUrl:", err);
      }
    }

    // Se o último quadro estiver no Convex Storage
    if (!lastFrameBase64 && lastFrameStorageId) {
      try {
        const storageUrl = await convex.query(api.studioGenerations.getStorageUrl, {
          storageId: lastFrameStorageId as Id<"_storage">,
        });
        if (storageUrl) {
          const imgRes = await fetch(storageUrl);
          const arrayBuffer = await imgRes.arrayBuffer();
          lastFrameBase64 = Buffer.from(arrayBuffer).toString("base64");
        }
      } catch (err) {
        console.error("Falha ao recuperar lastFrameStorageId:", err);
      }
    } else if (!lastFrameBase64 && lastFrameUrl && lastFrameUrl.startsWith("http")) {
      try {
        const imgRes = await fetch(lastFrameUrl);
        const arrayBuffer = await imgRes.arrayBuffer();
        lastFrameBase64 = Buffer.from(arrayBuffer).toString("base64");
      } catch (err) {
        console.error("Falha ao recuperar lastFrameUrl:", err);
      }
    }

    const aspectRatio = body.aspectRatio || "16:9";
    const quality = body.quality || "720p";

    const provider = getEngineProvider(engine as StudioEngine);

    // ==========================================
    // ROTA PROVEDOR HIGGSFIELD CLOUD API
    // ==========================================
    if (provider === "higgsfield") {
      const hfCredentials = process.env.HF_CREDENTIALS || process.env.HF_KEY;
      if (!hfCredentials) {
        if (generationId) {
          await convex.mutation(api.studioGenerations.refundGeneration, {
            generationId: generationId as Id<"studioGenerations">,
            errorMessage: "Credenciais Higgsfield (HF_CREDENTIALS) não configuradas no servidor.",
            secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
          });
        }
        return NextResponse.json(
          { error: "HF_CREDENTIALS não configurada no servidor." },
          { status: 500 }
        );
      }

      const hfEndpoint = HIGGSFIELD_MODELS[engine as HiggsfieldEngine] || "bytedance/seedance-2.5/text-to-video";
      const hfPayload = buildHiggsfieldPayload({
        engine: engine as StudioEngine,
        prompt,
        durationSeconds,
        aspectRatio,
        quality,
      });

      const hfUrl = `https://api.higgsfield.ai/${hfEndpoint}`;
      const res = await fetch(hfUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${hfCredentials}`,
        },
        body: JSON.stringify(hfPayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (generationId) {
          await convex.mutation(api.studioGenerations.refundGeneration, {
            generationId: generationId as Id<"studioGenerations">,
            errorMessage: `Falha ao conectar com Higgsfield API: ${res.statusText}`,
            secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
          });
        }
        return NextResponse.json({ error: `Falha no Higgsfield: ${errText}` }, { status: res.status });
      }

      const data = await res.json();
      const jobId = data.request_id || data.id;

      if (generationId && jobId) {
        await convex.mutation(api.studioGenerations.updateJobProgress, {
          generationId: generationId as Id<"studioGenerations">,
          runpodJobId: jobId,
          status: "processing",
          progressMessage: "Processando tomada no motor Seedance 2.5 (Higgsfield Cloud)...",
          secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
        });
      }

      return NextResponse.json({
        success: true,
        jobId,
        endpointId: hfEndpoint,
        provider: "higgsfield",
        status: data.status || "IN_QUEUE",
      });
    }

    // ==========================================
    // ROTA PROVEDOR RUNPOD COMFYUI SERVERLESS
    // ==========================================
    if (!engine || !(engine in RUNPOD_ENDPOINTS)) {
      return NextResponse.json({ error: `Motor inválido: ${engine}` }, { status: 400 });
    }

    const endpointId = RUNPOD_ENDPOINTS[engine as keyof typeof RUNPOD_ENDPOINTS];
    const apiKey = process.env.RUNPOD_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "RUNPOD_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    // 1. Constrói o payload com os nós do ComfyUI
    const payload = buildWorkflowPayload({
      engine: engine as StudioEngine,
      prompt,
      negativePrompt,
      seed,
      width,
      height,
      durationSeconds,
      fps,
      steps,
      cfgScale,
      aspectRatio,
      quality,
      imageBase64,
      lastFrameBase64,
      loraConfig,
    });

    // 2. Submete o job ao RunPod Serverless
    const runpodUrl = `https://api.runpod.ai/v2/${endpointId}/run`;
    const res = await fetch(runpodUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      // Em caso de falha imediata, estorna créditos se generationId foi fornecido
      if (generationId) {
        await convex.mutation(api.studioGenerations.refundGeneration, {
          generationId: generationId as Id<"studioGenerations">,
          errorMessage: `Falha ao conectar com o cluster RunPod: ${res.statusText}`,
          secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
        });
      }
      return NextResponse.json({ error: `Falha no RunPod: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    const jobId = data.id;

    // 3. Atualiza o Convex com o Job ID do RunPod
    if (generationId && jobId) {
      await convex.mutation(api.studioGenerations.updateJobProgress, {
        generationId: generationId as Id<"studioGenerations">,
        runpodJobId: jobId,
        status: "processing",
        progressMessage: "Alocando instância no estúdio ativo e processando tensores...",
        secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
      });
    }

    return NextResponse.json({
      success: true,
      jobId,
      endpointId,
      provider: "runpod",
      status: data.status,
    });
  } catch (err: any) {
    console.error("Erro em /api/studio/generate:", err);
    return NextResponse.json({ error: err.message || "Erro interno do servidor." }, { status: 500 });
  }
}
