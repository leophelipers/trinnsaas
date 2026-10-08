import { NextRequest, NextResponse } from "next/server";
import { extractMediaFromOutput, calculateExecutionCost } from "@/lib/studio/workflow-builder";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const endpointId = searchParams.get("endpointId");
    const jobId = searchParams.get("jobId");
    const generationId = searchParams.get("generationId");

    if (!endpointId || !jobId) {
      return NextResponse.json({ error: "endpointId e jobId são obrigatórios." }, { status: 400 });
    }

    const provider =
      searchParams.get("provider") ||
      (endpointId.includes("seedance") || endpointId.includes("bytedance") || endpointId.includes("higgsfield")
        ? "higgsfield"
        : "runpod");

    // ==========================================
    // STATUS CONSULTA HIGGSFIELD API
    // ==========================================
    if (provider === "higgsfield") {
      const hfCredentials = process.env.HF_CREDENTIALS || process.env.HF_KEY;
      if (!hfCredentials) {
        return NextResponse.json({ error: "HF_CREDENTIALS não configurada." }, { status: 500 });
      }

      const statusUrl = `https://api.higgsfield.ai/requests/${jobId}/status`;
      const res = await fetch(statusUrl, {
        headers: {
          Authorization: `Key ${hfCredentials}`,
        },
      });

      if (!res.ok) {
        return NextResponse.json({ error: `Erro na consulta Higgsfield: ${res.statusText}` }, { status: res.status });
      }

      const hfData = await res.json();
      const hfStatus = (hfData.status || "").toLowerCase();

      if (hfStatus === "completed") {
        const videoUrl = hfData.video?.url;
        let outputStorageId: Id<"_storage"> | undefined;

        if (videoUrl && generationId) {
          try {
            const videoRes = await fetch(videoUrl);
            const arrayBuffer = await videoRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadUrl = await convex.mutation(
              api.studioGenerations.generateUploadUrl,
              {
                secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
              }
            );

            const uploadRes = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": "video/mp4" },
              body: buffer,
            });

            if (uploadRes.ok) {
              const uploadJson = await uploadRes.json();
              outputStorageId = uploadJson.storageId as Id<"_storage">;
            }
          } catch (uploadErr) {
            console.error("Falha ao salvar vídeo Higgsfield no Convex Storage:", uploadErr);
          }

          // Conclui a geração no Convex
          await convex.mutation(api.studioGenerations.completeGeneration, {
            generationId: generationId as Id<"studioGenerations">,
            outputStorageId,
            outputUrl: outputStorageId ? "" : videoUrl,
            outputFilename: `seedance-${jobId}.mp4`,
            executionTimeMs: 45000,
            costUsd: 0.035,
            costBrl: 0.20,
            hasAudioTrack: true,
            secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
          });
        }

        return NextResponse.json({
          status: "COMPLETED",
          output: {
            url: videoUrl,
            isVideo: true,
            filename: `seedance-${jobId}.mp4`,
          },
          storageId: outputStorageId,
          executionTimeMs: 45000,
          executionSeconds: 45,
        });
      }

      if (hfStatus === "failed" || hfStatus === "nsfw") {
        const errorMsg =
          hfStatus === "nsfw"
            ? "A geração foi moderada pelo filtro de segurança de conteúdo."
            : "A geração falhou no motor Seedance 2.5.";

        if (generationId) {
          await convex.mutation(api.studioGenerations.refundGeneration, {
            generationId: generationId as Id<"studioGenerations">,
            errorMessage: errorMsg,
            secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
          });
        }

        return NextResponse.json({ status: "FAILED", error: errorMsg });
      }

      // Ainda em fila ou processamento
      return NextResponse.json({
        status: "IN_PROGRESS",
        jobId,
        provider: "higgsfield",
      });
    }

    // ==========================================
    // STATUS CONSULTA RUNPOD SERVERLESS
    // ==========================================
    const apiKey = process.env.RUNPOD_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "RUNPOD_API_KEY não configurada." }, { status: 500 });
    }

    const statusUrl = `https://api.runpod.ai/v2/${endpointId}/status/${jobId}`;
    const res = await fetch(statusUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Erro na consulta RunPod: ${res.statusText}` }, { status: res.status });
    }

    const data = await res.json();
    const status = data.status;

    // Se o job concluiu com sucesso
    if (status === "COMPLETED") {
      const extracted = extractMediaFromOutput(data.output);
      const executionTimeMs = data.executionTime || 0;
      const { costUsd, costBrl, seconds } = calculateExecutionCost(executionTimeMs);

      let outputStorageId: Id<"_storage"> | undefined;

      if (extracted && generationId) {
        // Upload do arquivo para o Convex File Storage para acesso permanente e download
        try {
          const rawBase64 = extracted.url.replace(
            /^data:(image\/png|video\/mp4|application\/octet-stream);base64,/,
            ""
          );
          const buffer = Buffer.from(rawBase64, "base64");
          const mimeType = extracted.isVideo ? "video/mp4" : "image/png";

          const uploadUrl = await convex.mutation(
            api.studioGenerations.generateUploadUrl,
            {
              secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
            }
          );

          const uploadRes = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": mimeType },
            body: buffer,
          });

          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            outputStorageId = uploadJson.storageId as Id<"_storage">;
          }
        } catch (uploadErr) {
          console.error("Falha ao salvar mídia no Convex Storage:", uploadErr);
        }

        // Conclui no Convex com o storageId
        await convex.mutation(api.studioGenerations.completeGeneration, {
          generationId: generationId as Id<"studioGenerations">,
          outputStorageId,
          outputUrl: outputStorageId ? "" : (extracted.url.startsWith("data:") ? "" : extracted.url),
          outputFilename: extracted.filename,
          executionTimeMs,
          costUsd,
          costBrl,
          hasAudioTrack: extracted.isVideo,
          secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
        });
      }

      return NextResponse.json({
        status: "COMPLETED",
        output: extracted,
        storageId: outputStorageId,
        executionTimeMs,
        executionSeconds: seconds,
        costUsd,
        costBrl,
      });
    }

    // Se o job falhou
    if (status === "FAILED") {
      const errorMsg = data.error || "Erro durante o processamento de tensores no ComfyUI.";
      if (generationId) {
        await convex.mutation(api.studioGenerations.refundGeneration, {
          generationId: generationId as Id<"studioGenerations">,
          errorMessage: errorMsg,
          secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
        });
      }
      return NextResponse.json({ status: "FAILED", error: errorMsg });
    }

    // Status intermediários: IN_QUEUE ou IN_PROGRESS
    return NextResponse.json({
      status,
      progressMessage:
        status === "IN_QUEUE"
          ? "Aguardando alocação de nó no cluster de renderização..."
          : "Sintetizando tensores e decodificando mídia com áudio...",
    });
  } catch (err: any) {
    console.error("Erro em /api/studio/status:", err);
    return NextResponse.json({ error: err.message || "Erro interno do servidor." }, { status: 500 });
  }
}
