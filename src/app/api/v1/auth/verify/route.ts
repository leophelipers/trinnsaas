import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Title, HTTP-Referer, User-Agent",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

async function handleAuthVerification(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    let apiKey = "";

    if (authHeader.startsWith("Bearer ")) {
      apiKey = authHeader.replace(/^Bearer\s+/i, "").trim();
    } else if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          valid: false,
          error: {
            message:
              "Chave de API não informada. Forneça o cabeçalho 'Authorization: Bearer krt_live_...'",
            code: "invalid_api_key",
          },
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const internalSecret =
      process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";

    const authCheck = await convex.mutation(
      api.apiKeys.validateApiKeyInternal,
      {
        key: apiKey,
        secret: internalSecret,
      }
    );

    if (!authCheck.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: {
            message: authCheck.error || "Chave de API inválida, expirada ou revogada.",
            code: "invalid_api_key",
          },
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        user: {
          id: authCheck.userId,
          name: authCheck.userName || "Criador Kriativa",
          email: authCheck.userEmail || "",
          role: authCheck.role || "user",
          isUnlimited: Boolean(authCheck.isUnlimited),
          credits: {
            total: authCheck.totalCredits ?? 0,
            paid: authCheck.paidCredits ?? 0,
            bonus: authCheck.bonusCredits ?? 0,
          },
        },
        key: {
          name: authCheck.keyName,
        },
      },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        valid: false,
        error: {
          message:
            err instanceof Error ? err.message : "Erro interno ao validar autenticação.",
          code: "server_error",
        },
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleAuthVerification(req);
}

export async function POST(req: NextRequest) {
  return handleAuthVerification(req);
}
