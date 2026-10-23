import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      eventName,
      eventId,
      eventSourceUrl,
      customData,
      userData: clientUserData,
    } = body as {
      eventName?: string;
      eventId?: string;
      eventSourceUrl?: string;
      customData?: Record<string, unknown>;
      userData?: {
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
        name?: string;
        fbc?: string;
        fbp?: string;
      };
    };

    if (!eventName || !eventId) {
      return NextResponse.json(
        { error: "eventName e eventId são obrigatórios." },
        { status: 400 }
      );
    }

    // Extrai IP e User-Agent reais da requisição para máxima correspondência no Meta CAPI
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIpAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : realIp || undefined;
    const clientUserAgent = req.headers.get("user-agent") || undefined;

    // Extrai cookies _fbp e _fbc se presentes
    const fbpCookie = req.cookies.get("_fbp")?.value || clientUserData?.fbp;
    const fbcCookie = req.cookies.get("_fbc")?.value || clientUserData?.fbc;

    // Enriquece com dados autenticados do Clerk se o usuário estiver logado
    let clerkUserId: string | undefined;
    let clerkEmail: string | undefined;
    let clerkFirstName: string | undefined;
    let clerkLastName: string | undefined;

    try {
      const authState = await auth();
      clerkUserId = authState.userId || undefined;
      if (clerkUserId) {
        const u = await currentUser();
        if (u) {
          clerkEmail = u.primaryEmailAddress?.emailAddress || undefined;
          clerkFirstName = u.firstName || undefined;
          clerkLastName = u.lastName || undefined;
        }
      }
    } catch {
      // Usuário não autenticado (ex: PageView ou Lead inicial na Home)
    }

    // Separa nome completo caso firstName/lastName não tenham vindo separados
    let resolvedFirstName = clientUserData?.firstName || clerkFirstName;
    let resolvedLastName = clientUserData?.lastName || clerkLastName;
    if (!resolvedFirstName && clientUserData?.name) {
      const parts = clientUserData.name.trim().split(/\s+/);
      resolvedFirstName = parts[0];
      if (parts.length > 1) {
        resolvedLastName = parts.slice(1).join(" ");
      }
    }

    const result = await sendMetaCapiEvent({
      eventName,
      eventId,
      eventSourceUrl: eventSourceUrl || req.headers.get("referer") || undefined,
      userData: {
        email: clientUserData?.email || clerkEmail,
        phone: clientUserData?.phone,
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        externalId: clerkUserId,
        clientIpAddress,
        clientUserAgent,
        fbp: fbpCookie,
        fbc: fbcCookie,
      },
      customData,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("Erro no endpoint /api/meta/capi:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Erro interno CAPI" },
      { status: 200 }
    );
  }
}
