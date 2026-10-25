import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { api } from "../../../../convex/_generated/api";
import {
  getAuthenticatedClerkIdentity,
  getConvexClient,
  INTERNAL_SECRET,
  resolveServerPreLaunchStatus,
  sendFallbackPreLaunchEmail,
} from "@/lib/pre-launch-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await resolveServerPreLaunchStatus();
    if (!status) {
      return NextResponse.json(
        { error: "Não autenticado no Clerk." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Erro ao carregar sessão de pré-lançamento.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const clerkIdentity = await getAuthenticatedClerkIdentity();
    if (!clerkIdentity) {
      return NextResponse.json(
        { error: "Sua sessão expirou. Faça login novamente." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      code?: string;
      whatsapp?: string;
      nameOverride?: string;
      whatsappGroupUrl?: string;
      resendApiKey?: string;
      metaTestEventCode?: string;
    };

    const action = body.action || "sync";
    const convex = getConvexClient();

    if (action === "sync") {
      const status = await resolveServerPreLaunchStatus({
        whatsapp: body.whatsapp,
        nameOverride: body.nameOverride,
      });
      return NextResponse.json({ success: true, status });
    }

    if (action === "request_code") {
      if (convex) {
        try {
          await convex.mutation(api.preLaunch.requestPreLaunchEmailCode, {
            secret: INTERNAL_SECRET,
            clerkId: clerkIdentity.userId,
            email: clerkIdentity.email,
            name: clerkIdentity.name,
          });
          const status = await resolveServerPreLaunchStatus();
          return NextResponse.json({ success: true, status });
        } catch {
          // Fallback to Clerk metadata + email below
        }
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const now = Date.now();
      const client = await clerkClient();
      await client.users.updateUserMetadata(clerkIdentity.userId, {
        privateMetadata: {
          ...clerkIdentity.privateMetadata,
          emailVerificationCode: code,
          emailVerificationSentAt: now,
          emailVerificationExpiresAt: now + 30 * 60 * 1000,
        },
      });
      await sendFallbackPreLaunchEmail({
        email: clerkIdentity.email,
        name: clerkIdentity.name,
        code,
        eventType: "verification_code",
      });
      const status = await resolveServerPreLaunchStatus();
      return NextResponse.json({ success: true, status });
    }

    if (action === "verify_code") {
      const cleanCode = (body.code || "").replace(/\D/g, "").trim();
      if (cleanCode.length !== 6) {
        return NextResponse.json(
          { error: "Digite os 6 números do código enviado para o seu e-mail." },
          { status: 400 }
        );
      }

      if (convex) {
        try {
          await convex.mutation(api.preLaunch.verifyPreLaunchEmailCode, {
            code: cleanCode,
            secret: INTERNAL_SECRET,
            clerkId: clerkIdentity.userId,
            email: clerkIdentity.email,
            name: clerkIdentity.name,
          });
          const status = await resolveServerPreLaunchStatus();
          return NextResponse.json({ success: true, status });
        } catch (convexErr: unknown) {
          const msg =
            convexErr instanceof Error ? convexErr.message : String(convexErr);
          if (
            msg.includes("Código incorreto") ||
            msg.includes("expirou") ||
            msg.includes("Nenhum código ativo")
          ) {
            return NextResponse.json({ error: msg }, { status: 400 });
          }
          // Se falhou por assinatura de função antiga no Convex, valida no fallback
        }
      }

      const savedCode = clerkIdentity.privateMetadata.emailVerificationCode;
      if (typeof savedCode === "string" && savedCode !== cleanCode) {
        return NextResponse.json(
          {
            error:
              "Código incorreto. Confira os 6 dígitos enviados para o seu e-mail e tente novamente.",
          },
          { status: 400 }
        );
      }

      const now = Date.now();
      const client = await clerkClient();
      await client.users.updateUserMetadata(clerkIdentity.userId, {
        publicMetadata: {
          ...clerkIdentity.publicMetadata,
          emailConfirmed: true,
          emailConfirmedAt: now,
        },
      });
      const status = await resolveServerPreLaunchStatus();
      return NextResponse.json({ success: true, status });
    }

    if (action === "join_whatsapp") {
      if (convex) {
        try {
          await convex.mutation(api.preLaunch.markWhatsappGroupJoined, {
            secret: INTERNAL_SECRET,
            clerkId: clerkIdentity.userId,
          });
        } catch {
          // ignore
        }
      }
      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(clerkIdentity.userId, {
          publicMetadata: {
            ...clerkIdentity.publicMetadata,
            whatsappGroupJoined: true,
            whatsappGroupJoinedAt: Date.now(),
          },
        });
      } catch {
        // ignore
      }
      const status = await resolveServerPreLaunchStatus();
      return NextResponse.json({ success: true, status });
    }

    if (action === "update_settings") {
      if (convex) {
        await convex.mutation(api.preLaunch.updatePreLaunchSettings, {
          whatsappGroupUrl: body.whatsappGroupUrl || "",
          resendApiKey: body.resendApiKey,
          metaTestEventCode: body.metaTestEventCode,
          secret: INTERNAL_SECRET,
          clerkId: clerkIdentity.userId,
        });
      }
      const status = await resolveServerPreLaunchStatus();
      return NextResponse.json({ success: true, status });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Erro ao processar ação no pré-lançamento.",
      },
      { status: 500 }
    );
  }
}
