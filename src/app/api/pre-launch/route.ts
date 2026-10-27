import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { api } from "../../../../convex/_generated/api";
import {
  getAuthenticatedClerkIdentity,
  getConvexClient,
  INTERNAL_SECRET,
  resolveServerPreLaunchStatus,
  sendFallbackPreLaunchEmail,
  syncContactToResendAudienceServer,
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
      emailOverride?: string;
      whatsappGroupUrl?: string;
      resendApiKey?: string;
      resendAudienceId?: string;
      metaTestEventCode?: string;
    };

    const action = body.action || "sync";
    const convex = getConvexClient();
    const effectiveEmail =
      (body.emailOverride || clerkIdentity.email || "").trim();
    const effectiveName =
      (body.nameOverride || clerkIdentity.name || "Criador").trim();

    if (action === "sync") {
      const status = await resolveServerPreLaunchStatus({
        whatsapp: body.whatsapp,
        nameOverride: effectiveName,
        emailOverride: effectiveEmail,
      });
      return NextResponse.json({ success: true, status });
    }

    if (action === "request_code") {
      if (!effectiveEmail) {
        return NextResponse.json(
          {
            error:
              "Não encontramos um endereço de e-mail vinculado à sua sessão. Recarregue a página e tente novamente.",
          },
          { status: 400 }
        );
      }

      if (convex) {
        try {
          await convex.mutation(api.preLaunch.requestPreLaunchEmailCode, {
            secret: INTERNAL_SECRET,
            clerkId: clerkIdentity.userId,
            email: effectiveEmail,
            name: effectiveName,
            resendApiKey: process.env.RESEND_API_KEY || undefined,
            resendAudienceId: process.env.RESEND_AUDIENCE_ID || undefined,
          });
          const status = await resolveServerPreLaunchStatus({
            emailOverride: effectiveEmail,
            nameOverride: effectiveName,
          });
          return NextResponse.json({ success: true, status });
        } catch {
          // Fallback to Clerk metadata + email below
        }
      }

      const existingMetaCode =
        typeof clerkIdentity.privateMetadata.emailVerificationCode === "string"
          ? clerkIdentity.privateMetadata.emailVerificationCode
          : undefined;
      const existingMetaExpires =
        typeof clerkIdentity.privateMetadata.emailVerificationExpiresAt ===
        "number"
          ? clerkIdentity.privateMetadata.emailVerificationExpiresAt
          : 0;
      const now = Date.now();
      const code =
        existingMetaCode && existingMetaExpires > now
          ? existingMetaCode
          : String(Math.floor(100000 + Math.random() * 900000));

      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(clerkIdentity.userId, {
          privateMetadata: {
            ...clerkIdentity.privateMetadata,
            emailVerificationCode: code,
            emailVerificationSentAt: now,
            emailVerificationExpiresAt: now + 30 * 60 * 1000,
          },
        });
      } catch {
        // ignore Clerk metadata rate limit
      }

      await sendFallbackPreLaunchEmail({
        email: effectiveEmail,
        name: effectiveName,
        code,
        eventType: "verification_code",
      });
      const status = await resolveServerPreLaunchStatus({
        emailOverride: effectiveEmail,
        nameOverride: effectiveName,
      });
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

      const savedMetaCode =
        typeof clerkIdentity.privateMetadata.emailVerificationCode === "string"
          ? clerkIdentity.privateMetadata.emailVerificationCode
          : undefined;

      if (convex) {
        try {
          await convex.mutation(api.preLaunch.verifyPreLaunchEmailCode, {
            code: cleanCode,
            secret: INTERNAL_SECRET,
            clerkId: clerkIdentity.userId,
            email: effectiveEmail,
            name: effectiveName,
          });
          const status = await resolveServerPreLaunchStatus({
            emailOverride: effectiveEmail,
            nameOverride: effectiveName,
          });
          return NextResponse.json({ success: true, status });
        } catch (convexErr: unknown) {
          // Se o código veio do fallback do Clerk privateMetadata, aceita e confirma no Convex
          if (savedMetaCode && savedMetaCode === cleanCode) {
            try {
              await convex.mutation(api.preLaunch.confirmPreLaunchEmail, {
                secret: INTERNAL_SECRET,
                clerkId: clerkIdentity.userId,
                email: effectiveEmail,
                name: effectiveName,
              });
              const status = await resolveServerPreLaunchStatus({
                emailOverride: effectiveEmail,
                nameOverride: effectiveName,
              });
              return NextResponse.json({ success: true, status });
            } catch {
              // continua para o fallback do Clerk abaixo
            }
          }

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

      if (savedMetaCode && savedMetaCode !== cleanCode) {
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
      const status = await resolveServerPreLaunchStatus({
        emailOverride: effectiveEmail,
        nameOverride: effectiveName,
      });
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

    if (action === "save_whatsapp") {
      const cleanPhone = (body.whatsapp || "").trim();
      if (cleanPhone.replace(/\D/g, "").length < 10) {
        return NextResponse.json(
          { error: "Informe um número de WhatsApp válido com DDD." },
          { status: 400 }
        );
      }

      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(clerkIdentity.userId, {
          publicMetadata: {
            ...clerkIdentity.publicMetadata,
            whatsapp: cleanPhone,
            whatsappSavedAt: Date.now(),
          },
        });
      } catch {
        // ignore
      }

      const status = await resolveServerPreLaunchStatus({
        whatsapp: cleanPhone,
      });
      return NextResponse.json({ success: true, status });
    }

    if (action === "update_settings") {
      if (convex) {
        await convex.mutation(api.preLaunch.updatePreLaunchSettings, {
          whatsappGroupUrl: body.whatsappGroupUrl || "",
          resendApiKey: body.resendApiKey,
          resendAudienceId: body.resendAudienceId,
          metaTestEventCode: body.metaTestEventCode,
          secret: INTERNAL_SECRET,
          clerkId: clerkIdentity.userId,
        });
      }
      const status = await resolveServerPreLaunchStatus();
      return NextResponse.json({ success: true, status });
    }

    if (action === "sync_resend_contacts") {
      if (convex) {
        try {
          await convex.mutation(api.preLaunch.syncExistingContactsToResend, {
            onlyUnsynced: false,
            secret: INTERNAL_SECRET,
            clerkId: clerkIdentity.userId,
          });
        } catch {
          // ignore if Convex mutation not yet deployed
        }
      }

      // Sincroniza também os usuários registrados no Clerk diretamente se houver chave Resend disponível
      const effectiveResendKey = body.resendApiKey || process.env.RESEND_API_KEY;
      let clerkSyncedCount = 0;
      if (effectiveResendKey) {
        try {
          const client = await clerkClient();
          const clerkUsers = await client.users.getUserList({ limit: 100 });
          for (const u of clerkUsers.data) {
            const email =
              u.primaryEmailAddress?.emailAddress ||
              u.emailAddresses?.[0]?.emailAddress ||
              "";
            const name =
              [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
              u.username ||
              undefined;
            if (email) {
              const res = await syncContactToResendAudienceServer({
                email,
                name,
                resendApiKey: effectiveResendKey,
                resendAudienceId: body.resendAudienceId,
              });
              if (res.synced) {
                clerkSyncedCount++;
              }
            }
          }
        } catch {
          // ignore
        }
      }

      const status = await resolveServerPreLaunchStatus();
      return NextResponse.json({
        success: true,
        clerkSyncedCount,
        status,
      });
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
