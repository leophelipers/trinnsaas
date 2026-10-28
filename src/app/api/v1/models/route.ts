import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Title, HTTP-Referer",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  try {
    // Consulta dinâmica em tempo real dos modelos ativos configurados pelo Administrador
    const publicModels = await convex.query(api.developerApi.listPublicModels, {});

    const modelsList = (publicModels || []).map((m: any) => ({
      id: m.id,
      object: "model",
      created: 1740000000,
      owned_by: "kriativa",
      permission: [
        {
          id: `perm-${m.id}`,
          object: "model_permission",
          created: 1740000000,
          allow_create_engine: false,
          allow_sampling: true,
          allow_logprobs: true,
          allow_search_indices: false,
          allow_view: true,
          allow_fine_tuning: false,
          organization: "*",
          group: null,
          is_blocking: false,
        },
      ],
      root: m.id,
      parent: null,
      meta: {
        name: m.name,
        description: m.description,
        supportsReasoning: m.supportsReasoning,
      },
    }));

    return NextResponse.json(
      {
        object: "list",
        data: modelsList,
      },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          message: err?.message || "Erro interno ao listar modelos da Kriativa.",
          type: "server_error",
          code: 500,
        },
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
