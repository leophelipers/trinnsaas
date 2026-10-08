import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { endpointId, jobId, generationId } = await req.json();

    if (!endpointId || !jobId) {
      return NextResponse.json({ error: "endpointId e jobId são obrigatórios." }, { status: 400 });
    }

    const apiKey = process.env.RUNPOD_API_KEY;
    if (apiKey) {
      const cancelUrl = `https://api.runpod.ai/v2/${endpointId}/cancel/${jobId}`;
      await fetch(cancelUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    }

    if (generationId) {
      await convex.mutation(api.studioGenerations.refundGeneration, {
        generationId: generationId as Id<"studioGenerations">,
        errorMessage: "Cancelado pelo usuário.",
        secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
      });
    }

    return NextResponse.json({ success: true, message: "Geração cancelada com sucesso." });
  } catch (err: any) {
    console.error("Erro em /api/studio/cancel:", err);
    return NextResponse.json({ error: err.message || "Erro interno do servidor." }, { status: 500 });
  }
}
