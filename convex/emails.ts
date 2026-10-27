import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { isFeatureFlagActive } from "./featureFlags";

export const DEFAULT_ADMIN_NOTIFICATION_EMAIL = "leo.phe.rod@gmail.com";
export const DEFAULT_WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/Hl24R2NuhRh7Iq4qU9ce4Y?s=cl&p=i&mlu=4&ilr=4&iam=0";

export const getEmailConfigInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("preLaunchSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_prelaunch_config"))
      .first();

    const audienceSyncEnabled = await isFeatureFlagActive(
      ctx,
      "resend_audience_sync"
    );

    const rawUrl = doc?.whatsappGroupUrl;
    const whatsappGroupUrl =
      !rawUrl || rawUrl === "https://chat.whatsapp.com/kriativa-pre-lancamento-vip"
        ? DEFAULT_WHATSAPP_GROUP_URL
        : rawUrl;

    return {
      resendApiKey: doc?.resendApiKey || process.env.RESEND_API_KEY || undefined,
      resendAudienceId:
        doc?.resendAudienceId || process.env.RESEND_AUDIENCE_ID || undefined,
      adminNotificationEmail:
        doc?.adminNotificationEmail ||
        process.env.ADMIN_NOTIFICATION_EMAIL ||
        DEFAULT_ADMIN_NOTIFICATION_EMAIL,
      whatsappGroupUrl,
      audienceSyncEnabled,
    };
  },
});

export const saveDiscoveredAudienceIdInternal = internalMutation({
  args: {
    resendAudienceId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("preLaunchSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_prelaunch_config"))
      .first();

    if (existing && !existing.resendAudienceId) {
      await ctx.db.patch(existing._id, {
        resendAudienceId: args.resendAudienceId,
      });
    }
  },
});

export const listUsersForResendSyncInternal = internalQuery({
  args: {
    onlyUnsynced: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").take(500);
    return users
      .filter((u) => {
        if (!u.email || !u.email.includes("@")) return false;
        if (args.onlyUnsynced && u.resendContactId) return false;
        return true;
      })
      .map((u) => ({
        clerkId: u.clerkId,
        email: u.email,
        name: u.name,
        firstName: u.firstName,
        lastName: u.lastName,
        resendContactId: u.resendContactId,
      }));
  },
});

export const markUserEmailFlagsInternal = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    eventType: v.optional(v.string()),
    codeSent: v.optional(v.boolean()),
    welcomeEmailSent: v.optional(v.boolean()),
    adminNotifiedAt: v.optional(v.number()),
    resendContactId: v.optional(v.string()),
    resendAudienceId: v.optional(v.string()),
    resendSyncedAt: v.optional(v.number()),
    logMessage: v.string(),
    logDetails: v.string(),
  },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user && args.email) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email!))
        .first();
    }

    if (user) {
      const patch: Record<string, unknown> = {};
      if (args.eventType === "verification_code") {
        if (args.codeSent === true) {
          patch.emailVerificationSentAt = Date.now();
        } else if (args.codeSent === false) {
          patch.emailVerificationSentAt = undefined;
        }
      }
      if (args.welcomeEmailSent !== undefined) {
        patch.welcomeEmailSent = args.welcomeEmailSent;
      }
      if (args.adminNotifiedAt !== undefined) {
        patch.adminNotifiedAt = args.adminNotifiedAt;
      }
      if (args.resendContactId !== undefined) {
        patch.resendContactId = args.resendContactId;
      }
      if (args.resendAudienceId !== undefined) {
        patch.resendAudienceId = args.resendAudienceId;
      }
      if (args.resendSyncedAt !== undefined) {
        patch.resendSyncedAt = args.resendSyncedAt;
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(user._id, patch);
      }
    }

    await ctx.db.insert("systemLogs", {
      level: args.codeSent === false && args.eventType === "verification_code" ? "warn" : "info",
      category: "system",
      message: args.logMessage,
      details: args.logDetails,
      userId: args.clerkId,
      timestamp: Date.now(),
    });
  },
});

function splitFullName(params: {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
}): { firstName: string; lastName?: string } {
  if (params.firstName && params.firstName.trim()) {
    return {
      firstName: params.firstName.trim(),
      lastName: params.lastName?.trim() || undefined,
    };
  }
  const cleanName = (params.name || "").trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/);
    const first = parts[0];
    const rest = parts.slice(1).join(" ").trim();
    return {
      firstName: first,
      lastName: rest || undefined,
    };
  }
  return {
    firstName: params.email.split("@")[0] || "Criador",
    lastName: undefined,
  };
}

async function resolveOrCreateResendAudienceId(
  resendKey: string,
  configuredAudienceId?: string
): Promise<{ audienceId?: string; discoveredNew: boolean; note?: string }> {
  if (configuredAudienceId && configuredAudienceId.trim()) {
    return {
      audienceId: configuredAudienceId.trim(),
      discoveredNew: false,
    };
  }

  try {
    const listRes = await fetch("https://api.resend.com/audiences", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        Accept: "application/json",
      },
    });

    if (listRes.ok) {
      const listJson = (await listRes.json()) as {
        data?: Array<{ id: string; name?: string }>;
      };
      if (Array.isArray(listJson.data) && listJson.data.length > 0) {
        return {
          audienceId: listJson.data[0].id,
          discoveredNew: true,
          note: `Resolved Resend audience "${listJson.data[0].name || listJson.data[0].id}"`,
        };
      }

      // Se nenhuma audiência existir na conta Resend, cria automaticamente a audiência oficial
      const createRes = await fetch("https://api.resend.com/audiences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Kriativa",
        }),
      });

      if (createRes.ok) {
        const createdJson = (await createRes.json()) as { id?: string };
        if (createdJson.id) {
          return {
            audienceId: createdJson.id,
            discoveredNew: true,
            note: `Created new Resend audience "Kriativa" (${createdJson.id})`,
          };
        }
      }
    } else {
      const errTxt = await listRes.text();
      return {
        audienceId: undefined,
        discoveredNew: false,
        note: `Resend list audiences status ${listRes.status}: ${errTxt}`,
      };
    }
  } catch (err: unknown) {
    return {
      audienceId: undefined,
      discoveredNew: false,
      note: `Resend audience discovery exception: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  return { audienceId: undefined, discoveredNew: false };
}

async function upsertContactInResend(params: {
  resendKey: string;
  audienceId?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}): Promise<{
  synced: boolean;
  contactId?: string;
  audienceId?: string;
  discoveredAudience: boolean;
  notes: string[];
}> {
  const notes: string[] = [];
  const cleanEmail = params.email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return {
      synced: false,
      discoveredAudience: false,
      notes: ["Invalid email for Resend contact sync"],
    };
  }

  const { firstName, lastName } = splitFullName({
    name: params.name,
    firstName: params.firstName,
    lastName: params.lastName,
    email: cleanEmail,
  });

  const audienceResolution = await resolveOrCreateResendAudienceId(
    params.resendKey,
    params.audienceId
  );
  if (audienceResolution.note) {
    notes.push(audienceResolution.note);
  }

  const effectiveAudienceId = audienceResolution.audienceId;

  // 1. Registra/Atualiza na Audiência do Resend (/audiences/{audience_id}/contacts)
  if (effectiveAudienceId) {
    try {
      const contactRes = await fetch(
        `https://api.resend.com/audiences/${effectiveAudienceId}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${params.resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            first_name: firstName,
            ...(lastName ? { last_name: lastName } : {}),
            unsubscribed: false,
          }),
        }
      );

      if (contactRes.ok) {
        const contactData = (await contactRes.json()) as { id?: string };
        notes.push(
          `Contact ${cleanEmail} registered in Resend audience ${effectiveAudienceId} (id: ${contactData.id || "ok"})`
        );

        // Garante que first_name e last_name sejam atualizados caso o contato já existisse na audiência
        try {
          await fetch(
            `https://api.resend.com/audiences/${effectiveAudienceId}/contacts/${encodeURIComponent(cleanEmail)}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${params.resendKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                first_name: firstName,
                ...(lastName ? { last_name: lastName } : {}),
                unsubscribed: false,
              }),
            }
          );
        } catch {
          // ignore optional patch error
        }

        return {
          synced: true,
          contactId: contactData.id || cleanEmail,
          audienceId: effectiveAudienceId,
          discoveredAudience: audienceResolution.discoveredNew,
          notes,
        };
      } else {
        const errText = await contactRes.text();
        notes.push(
          `Resend audience contact POST (${contactRes.status}): ${errText}`
        );

        // Se o contato já existe (ex: 409 ou duplicado), atualiza via PATCH pelo email
        const patchRes = await fetch(
          `https://api.resend.com/audiences/${effectiveAudienceId}/contacts/${encodeURIComponent(cleanEmail)}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${params.resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: firstName,
              ...(lastName ? { last_name: lastName } : {}),
              unsubscribed: false,
            }),
          }
        );
        if (patchRes.ok) {
          const patchData = (await patchRes.json()) as { id?: string };
          notes.push(
            `Existing contact ${cleanEmail} updated in Resend audience ${effectiveAudienceId}`
          );
          return {
            synced: true,
            contactId: patchData.id || cleanEmail,
            audienceId: effectiveAudienceId,
            discoveredAudience: audienceResolution.discoveredNew,
            notes,
          };
        }
      }
    } catch (err: unknown) {
      notes.push(
        `Resend audience contact exception: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // 2. Fallback para o endpoint global de Contatos do Resend (/contacts)
  try {
    const globalContactRes = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: cleanEmail,
        first_name: firstName,
        ...(lastName ? { last_name: lastName } : {}),
        ...(effectiveAudienceId ? { audience_id: effectiveAudienceId } : {}),
        unsubscribed: false,
      }),
    });

    if (globalContactRes.ok) {
      const globalData = (await globalContactRes.json()) as { id?: string };
      notes.push(
        `Contact ${cleanEmail} registered via Resend /contacts (id: ${globalData.id || "ok"})`
      );
      return {
        synced: true,
        contactId: globalData.id || cleanEmail,
        audienceId: effectiveAudienceId,
        discoveredAudience: audienceResolution.discoveredNew,
        notes,
      };
    } else {
      const errTxt = await globalContactRes.text();
      notes.push(`Resend /contacts status ${globalContactRes.status}: ${errTxt}`);
    }
  } catch (err: unknown) {
    notes.push(
      `Resend /contacts exception: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return {
    synced: false,
    audienceId: effectiveAudienceId,
    discoveredAudience: audienceResolution.discoveredNew,
    notes,
  };
}

function buildVerificationCodeEmailHtml(params: {
  name: string;
  email: string;
  code: string;
}) {
  const firstName = params.name ? params.name.split(" ")[0] : "Criador";
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seu código de confirmação — Kriativa</title>
</head>
<body style="margin:0;padding:0;background-color:#050507;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050507;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:540px;background-color:#0c0c10;border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px 24px;">
          <tr>
            <td>
              <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#FF5500;margin-bottom:12px;font-weight:700;">
                KRIATIVA · BY TRINN · PASSO 01
              </div>
              <h1 style="font-size:24px;line-height:1.2;color:#ffffff;margin:0 0 14px 0;font-weight:700;">
                Seu código de confirmação de e-mail
              </h1>
              <p style="font-size:15px;line-height:1.6;color:#d4d4d8;margin:0 0 24px 0;">
                Olá, <strong>${firstName}</strong>! Digite o código de 6 dígitos abaixo na página de Pré-Lançamento da Kriativa para confirmar o seu e-mail (<strong>${params.email}</strong>):
              </p>

              <div style="background-color:#14141b;border:1px solid rgba(255,85,0,0.45);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#a1a1aa;margin-bottom:8px;">
                  CÓDIGO DE VERIFICAÇÃO
                </div>
                <div style="font-family:monospace;font-size:36px;font-weight:700;letter-spacing:0.3em;color:#ffffff;">
                  ${params.code}
                </div>
              </div>

              <p style="font-size:13px;line-height:1.5;color:#a1a1aa;margin:0 0 20px 0;">
                Este código é válido por 30 minutos. Assim que preenchê-lo na plataforma, seu Passo 1 será concluído e você desbloqueará a apresentação do Ticket Rápido (passe opcional de R$ 5,00 para acesso antecipado) e o Canal Oficial de Novidades e Bastidores no WhatsApp.
              </p>

              <p style="font-size:12px;line-height:1.5;color:#71717a;text-align:center;margin:24px 0 0 0;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
                by trinn — Feito com amor no Brasil.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buildWelcomeEmailHtml(params: {
  name: string;
  email: string;
  whatsappGroupUrl: string;
}) {
  const firstName = params.name ? params.name.split(" ")[0] : "Criador";
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bem-vindo ao Pré-Lançamento — Kriativa</title>
</head>
<body style="margin:0;padding:0;background-color:#050507;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050507;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background-color:#0c0c10;border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px 24px;">
          <tr>
            <td>
              <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#FF5500;margin-bottom:12px;font-weight:700;">
                KRIATIVA · BY TRINN · PRÉ-LANÇAMENTO OFICIAL
              </div>
              <h1 style="font-size:26px;line-height:1.15;color:#ffffff;margin:0 0 16px 0;font-weight:700;">
                Pare de contar créditos.<br/>Comece a criar.
              </h1>
              <p style="font-size:15px;line-height:1.6;color:#d4d4d8;margin:0 0 24px 0;">
                Olá, <strong>${firstName}</strong>! Seu e-mail (<strong>${params.email}</strong>) está registrado na lista oficial de pré-lançamento da Kriativa (Kriativa Vision, Kriativa Motion, Kriativa Voice e Kriativa Mind).
              </p>

              <div style="background-color:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-bottom:24px;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.15em;color:#ffffff;font-weight:600;margin-bottom:12px;">
                  Seus 3 Passos no Pré-Lançamento:
                </div>
                <p style="font-size:14px;line-height:1.5;color:#e4e4e7;margin:0 0 10px 0;">
                  <strong>1. Confirmar seu e-mail com o código:</strong> Valide os 6 dígitos enviados para ${params.email}.
                </p>
                <p style="font-size:14px;line-height:1.5;color:#e4e4e7;margin:0 0 10px 0;">
                  <strong>2. Ticket Rápido (Opcional — R$ 5,00 no Cartão):</strong> Passe opcional para garantir acesso antecipado e lugar prioritário na fila para o primeiro mês de R$ 50,00 (pagamento exclusivo via cartão de crédito, que será usado para a assinatura; não é convertido em créditos).
                </p>
                <p style="font-size:14px;line-height:1.5;color:#e4e4e7;margin:0;">
                  <strong>3. Acompanhar os Bastidores e Novidades no Canal Oficial (WhatsApp):</strong> Veja em primeira mão demonstrações inéditas dos motores <strong>Kriativa Vision, Motion, Voice e Mind</strong>, spoilers do estúdio ativo e receba o alerta instantâneo de abertura das 50 vagas de R$ 50/mês (plano cheio estimado em R$ 500/mês).
                </p>
              </div>

              <div style="text-align:center;margin:28px 0;">
                <a href="${params.whatsappGroupUrl}" target="_blank" style="display:inline-block;background-color:#FF5500;color:#ffffff;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;padding:14px 24px;border-radius:12px;text-decoration:none;">
                  Acompanhar Novidades no Canal Oficial (WhatsApp) →
                </a>
              </div>

              <p style="font-size:12px;line-height:1.5;color:#71717a;text-align:center;margin:24px 0 0 0;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
                by trinn — Feito com amor no Brasil.<br/>
                Este site não possui qualquer vínculo, afiliação, patrocínio ou endosso da Meta, Instagram, Facebook, Google ou outras plataformas mencionadas.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buildAdminNotificationHtml(params: {
  eventType:
    | "new_signup"
    | "verification_code"
    | "email_confirmed"
    | "queue_spot_paid";
  name: string;
  email: string;
  whatsapp?: string;
  clerkId: string;
  amountBrl?: number;
  verificationCode?: string;
}) {
  const titleMap = {
    new_signup: "Novo Cadastro no Pré-Lançamento Kriativa",
    verification_code: `Código de Verificação Gerado (${params.verificationCode || "------"})`,
    email_confirmed: "Usuário Confirmou E-mail com Código no Pré-Lançamento",
    queue_spot_paid: `Lugar na Fila Comprado via Cartão (R$ ${(params.amountBrl || 5).toFixed(2)})`,
  };
  const dateStr = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#09090b;color:#f4f4f5;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#121216;border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:24px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#FF5500;margin-bottom:8px;font-weight:700;">
      KRIATIVA · ALERTA AUTOMÁTICO DE PRÉ-LANÇAMENTO
    </div>
    <h2 style="margin:0 0 16px 0;color:#ffffff;font-size:20px;">
      ${titleMap[params.eventType]}
    </h2>
    <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#e4e4e7;border-top:1px solid rgba(255,255,255,0.08);">
      <tr>
        <td style="color:#a1a1aa;width:140px;">Nome:</td>
        <td><strong>${params.name || "Não informado"}</strong></td>
      </tr>
      <tr>
        <td style="color:#a1a1aa;">E-mail:</td>
        <td><strong>${params.email}</strong></td>
      </tr>
      ${
        params.verificationCode
          ? `<tr>
        <td style="color:#a1a1aa;">Código 6 Dígitos:</td>
        <td><strong style="font-family:monospace;font-size:18px;color:#FF5500;">${params.verificationCode}</strong></td>
      </tr>`
          : ""
      }
      <tr>
        <td style="color:#a1a1aa;">WhatsApp:</td>
        <td><strong>${params.whatsapp || "Não informado"}</strong></td>
      </tr>
      <tr>
        <td style="color:#a1a1aa;">Tag:</td>
        <td><code>pre_lancamento</code></td>
      </tr>
      <tr>
        <td style="color:#a1a1aa;">Clerk ID:</td>
        <td><code>${params.clerkId}</code></td>
      </tr>
      <tr>
        <td style="color:#a1a1aa;">Data/Hora (BRT):</td>
        <td>${dateStr}</td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}

async function resolveResendSenderCandidates(
  resendKey: string,
  configuredFromEmail?: string
): Promise<string[]> {
  const candidates: string[] = [];
  if (
    configuredFromEmail &&
    configuredFromEmail.trim() &&
    !configuredFromEmail.includes("onboarding@resend.dev")
  ) {
    candidates.push(configuredFromEmail.trim());
  }

  try {
    const domRes = await fetch("https://api.resend.com/domains", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        Accept: "application/json",
      },
    });
    if (domRes.ok) {
      const domJson = (await domRes.json()) as {
        data?: Array<{ name?: string; status?: string }>;
      };
      const domains = Array.isArray(domJson.data) ? domJson.data : [];
      const verified = domains.filter(
        (d) =>
          d.name &&
          (d.status === "verified" ||
            d.status === "partially_verified" ||
            d.status === "pending")
      );
      verified.sort((a, b) => {
        const aScore =
          (a.status === "verified" ? 10 : 0) +
          (a.name?.includes("kriativa") ? 5 : 0);
        const bScore =
          (b.status === "verified" ? 10 : 0) +
          (b.name?.includes("kriativa") ? 5 : 0);
        return bScore - aScore;
      });

      for (const dom of verified) {
        if (dom.name) {
          candidates.push(`Kriativa <nao-responda@${dom.name}>`);
          candidates.push(`Kriativa <contato@${dom.name}>`);
        }
      }
    }
  } catch {
    // ignore domain discovery error
  }

  candidates.push("Kriativa <nao-responda@kriativa.app>");
  candidates.push("Kriativa <onboarding@resend.dev>");

  return Array.from(new Set(candidates));
}

async function sendResendEmailWithFallback(params: {
  resendKey: string;
  senderCandidates: string[];
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; fromUsed?: string; notes: string[] }> {
  const notes: string[] = [];
  for (const fromAddr of params.senderCandidates) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${params.resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddr,
          to: [params.to],
          subject: params.subject,
          html: params.html,
        }),
      });
      if (res.ok) {
        notes.push(`Email sent via Resend (${fromAddr}) to ${params.to}`);
        return { sent: true, fromUsed: fromAddr, notes };
      }
      const errTxt = await res.text();
      notes.push(`Resend (${fromAddr} -> ${params.to}) [${res.status}]: ${errTxt}`);
    } catch (err: unknown) {
      notes.push(
        `Resend exception (${fromAddr}): ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
  return { sent: false, notes };
}

export const sendPreLaunchEmails = internalAction({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    eventType: v.union(
      v.literal("new_signup"),
      v.literal("verification_code"),
      v.literal("email_confirmed"),
      v.literal("queue_spot_paid")
    ),
    amountBrl: v.optional(v.number()),
    verificationCode: v.optional(v.string()),
    resendApiKeyOverride: v.optional(v.string()),
    resendAudienceIdOverride: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const config: {
      resendApiKey?: string;
      resendAudienceId?: string;
      adminNotificationEmail: string;
      whatsappGroupUrl: string;
      audienceSyncEnabled: boolean;
    } = await ctx.runQuery(internal.emails.getEmailConfigInternal, {});

    const adminEmail =
      config.adminNotificationEmail || DEFAULT_ADMIN_NOTIFICATION_EMAIL;
    const userName = args.name || args.email.split("@")[0] || "Criador";
    const resendKey = args.resendApiKeyOverride || config.resendApiKey;
    const effectiveAudienceId =
      args.resendAudienceIdOverride || config.resendAudienceId;

    let welcomeSent = false;
    let codeSent = false;
    let adminSent = false;
    let resendContactId: string | undefined;
    let resendAudienceId: string | undefined;
    const deliveryNotes: string[] = [];

    // 1. Envio via Resend API + Sincronização na Audiência do Resend (se RESEND_API_KEY estiver configurada)
    if (resendKey) {
      const senderCandidates = await resolveResendSenderCandidates(
        resendKey,
        process.env.RESEND_FROM_EMAIL
      );

      // 1.0 Registrar/Atualizar o contato na Audiência do Resend
      if (config.audienceSyncEnabled && args.email) {
        const contactSync = await upsertContactInResend({
          resendKey,
          audienceId: effectiveAudienceId,
          email: args.email,
          name: userName,
        });
        deliveryNotes.push(...contactSync.notes);
        if (contactSync.synced) {
          resendContactId = contactSync.contactId;
          resendAudienceId = contactSync.audienceId;
        }
        if (
          contactSync.discoveredAudience &&
          contactSync.audienceId &&
          !config.resendAudienceId
        ) {
          await ctx.runMutation(
            internal.emails.saveDiscoveredAudienceIdInternal,
            {
              resendAudienceId: contactSync.audienceId,
            }
          );
        }
      }

      // 1A. Enviar Código de Verificação de 6 dígitos para o Usuário
      if (
        args.email &&
        args.eventType === "verification_code" &&
        args.verificationCode
      ) {
        const codeDelivery = await sendResendEmailWithFallback({
          resendKey,
          senderCandidates,
          to: args.email,
          subject: `${args.verificationCode} é o seu código de confirmação — Kriativa`,
          html: buildVerificationCodeEmailHtml({
            name: userName,
            email: args.email,
            code: args.verificationCode,
          }),
        });
        codeSent = codeDelivery.sent;
        deliveryNotes.push(...codeDelivery.notes);
      }

      // 1B. Enviar E-mail de Boas-Vindas para o Usuário (em new_signup ou email_confirmed)
      if (
        args.email &&
        (args.eventType === "new_signup" ||
          args.eventType === "email_confirmed")
      ) {
        const welcomeDelivery = await sendResendEmailWithFallback({
          resendKey,
          senderCandidates,
          to: args.email,
          subject:
            "Bem-vindo ao Pré-Lançamento da Kriativa — Seus próximos passos",
          html: buildWelcomeEmailHtml({
            name: userName,
            email: args.email,
            whatsappGroupUrl: config.whatsappGroupUrl,
          }),
        });
        welcomeSent = welcomeDelivery.sent;
        deliveryNotes.push(...welcomeDelivery.notes);
      }

      // 1C. Enviar Aviso para leo.phe.rod@gmail.com via Resend
      const subjectMap = {
        new_signup: `[Kriativa Pré-Lançamento] Novo cadastro: ${userName} (${args.email})`,
        verification_code: `[Kriativa Código ${args.verificationCode}] Enviado para ${args.email}`,
        email_confirmed: `[Kriativa Pré-Lançamento] E-mail confirmado: ${userName} (${args.email})`,
        queue_spot_paid: `[Kriativa Fila R$5 Cartão] Reserva paga: ${userName} (${args.email})`,
      };

      const adminDelivery = await sendResendEmailWithFallback({
        resendKey,
        senderCandidates,
        to: adminEmail,
        subject: subjectMap[args.eventType],
        html: buildAdminNotificationHtml({
          eventType: args.eventType,
          name: userName,
          email: args.email,
          whatsapp: args.whatsapp,
          clerkId: args.clerkId,
          amountBrl: args.amountBrl,
          verificationCode: args.verificationCode,
        }),
      });
      adminSent = adminDelivery.sent;
      deliveryNotes.push(...adminDelivery.notes);
    } else {
      deliveryNotes.push(
        "RESEND_API_KEY ausente no Convex (configure no Painel Admin ou Variáveis de Ambiente)"
      );
    }

    // 2. Fallback automático para notificar leo.phe.rod@gmail.com
    if (!adminSent) {
      try {
        const formSubmitRes = await fetch(
          `https://formsubmit.co/ajax/${encodeURIComponent(adminEmail)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              _subject: `[Kriativa Pré-Lançamento] ${
                args.eventType === "queue_spot_paid"
                  ? "Reserva R$5 Cartão Paga"
                  : args.eventType === "verification_code"
                    ? `Código ${args.verificationCode} gerado`
                    : "Novo Usuário"
              }: ${args.email}`,
              evento: args.eventType,
              nome: userName,
              email: args.email,
              codigo_verificacao: args.verificationCode || "N/A",
              whatsapp: args.whatsapp || "Não informado",
              tag: "pre_lancamento",
              clerkId: args.clerkId,
              horario_brt: new Date().toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              }),
            }),
          }
        );
        if (formSubmitRes.ok) {
          adminSent = true;
          deliveryNotes.push(
            `Admin alert dispatched via FormSubmit to ${adminEmail}`
          );
        } else {
          deliveryNotes.push(`FormSubmit status: ${formSubmitRes.status}`);
        }
      } catch (err: any) {
        deliveryNotes.push(`FormSubmit fallback note: ${err?.message}`);
      }
    }

    await ctx.runMutation(internal.emails.markUserEmailFlagsInternal, {
      clerkId: args.clerkId,
      email: args.email,
      eventType: args.eventType,
      codeSent: args.eventType === "verification_code" ? codeSent : undefined,
      welcomeEmailSent: welcomeSent ? true : undefined,
      adminNotifiedAt: adminSent ? Date.now() : undefined,
      resendContactId,
      resendAudienceId,
      resendSyncedAt: resendContactId ? Date.now() : undefined,
      logMessage: `Notificação de Pré-Lançamento (${args.eventType}) para ${args.email} e aviso para ${adminEmail}`,
      logDetails: JSON.stringify({
        userEmail: args.email,
        userName,
        whatsapp: args.whatsapp,
        adminEmail,
        eventType: args.eventType,
        welcomeSent,
        codeSent,
        adminSent,
        resendContactId,
        resendAudienceId,
        deliveryNotes,
      }),
    });

    return {
      welcomeSent,
      codeSent,
      adminSent,
      resendContactId,
      resendAudienceId,
      adminEmail,
      deliveryNotes,
    };
  },
});

/**
 * Registra ou atualiza individualmente um usuário/contato na Audiência do Resend
 */
export const syncContactToResendAudience = internalAction({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const config: {
      resendApiKey?: string;
      resendAudienceId?: string;
      adminNotificationEmail: string;
      whatsappGroupUrl: string;
      audienceSyncEnabled: boolean;
    } = await ctx.runQuery(internal.emails.getEmailConfigInternal, {});

    if (!config.audienceSyncEnabled) {
      return {
        synced: false,
        reason: "Feature flag resend_audience_sync desativada",
      };
    }

    const resendKey = config.resendApiKey;
    if (!resendKey) {
      return {
        synced: false,
        reason: "RESEND_API_KEY não configurada",
      };
    }

    const result = await upsertContactInResend({
      resendKey,
      audienceId: config.resendAudienceId,
      email: args.email,
      name: args.name,
      firstName: args.firstName,
      lastName: args.lastName,
    });

    if (
      result.discoveredAudience &&
      result.audienceId &&
      !config.resendAudienceId
    ) {
      await ctx.runMutation(internal.emails.saveDiscoveredAudienceIdInternal, {
        resendAudienceId: result.audienceId,
      });
    }

    await ctx.runMutation(internal.emails.markUserEmailFlagsInternal, {
      clerkId: args.clerkId,
      email: args.email,
      resendContactId: result.contactId,
      resendAudienceId: result.audienceId,
      resendSyncedAt: result.synced ? Date.now() : undefined,
      logMessage: result.synced
        ? `Contato registrado/atualizado na Audiência Resend: ${args.email} (${args.source || "sync"})`
        : `Tentativa de registro na Audiência Resend: ${args.email} (${args.source || "sync"})`,
      logDetails: JSON.stringify({
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        source: args.source,
        synced: result.synced,
        contactId: result.contactId,
        audienceId: result.audienceId,
        notes: result.notes,
      }),
    });

    return {
      synced: result.synced,
      contactId: result.contactId,
      audienceId: result.audienceId,
      notes: result.notes,
    };
  },
});

/**
 * Sincroniza em lote todos os contatos/usuários já existentes no Convex para a Audiência do Resend
 */
export const syncAllUsersToResendAudience = internalAction({
  args: {
    onlyUnsynced: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const config: {
      resendApiKey?: string;
      resendAudienceId?: string;
      adminNotificationEmail: string;
      whatsappGroupUrl: string;
      audienceSyncEnabled: boolean;
    } = await ctx.runQuery(internal.emails.getEmailConfigInternal, {});

    if (!config.audienceSyncEnabled || !config.resendApiKey) {
      return {
        syncedCount: 0,
        totalCandidates: 0,
        reason: "Resend API Key ausente ou flag resend_audience_sync desativada",
      };
    }

    const users: Array<{
      clerkId: string;
      email: string;
      name?: string;
      firstName?: string;
      lastName?: string;
      resendContactId?: string;
    }> = await ctx.runQuery(internal.emails.listUsersForResendSyncInternal, {
      onlyUnsynced: args.onlyUnsynced,
    });

    if (users.length === 0) {
      return {
        syncedCount: 0,
        totalCandidates: 0,
      };
    }

    const audienceResolution = await resolveOrCreateResendAudienceId(
      config.resendApiKey,
      config.resendAudienceId
    );
    const effectiveAudienceId = audienceResolution.audienceId;

    if (
      audienceResolution.discoveredNew &&
      effectiveAudienceId &&
      !config.resendAudienceId
    ) {
      await ctx.runMutation(internal.emails.saveDiscoveredAudienceIdInternal, {
        resendAudienceId: effectiveAudienceId,
      });
    }

    let syncedCount = 0;
    for (const u of users) {
      const res = await upsertContactInResend({
        resendKey: config.resendApiKey,
        audienceId: effectiveAudienceId,
        email: u.email,
        name: u.name,
        firstName: u.firstName,
        lastName: u.lastName,
      });

      if (res.synced) {
        syncedCount++;
        await ctx.runMutation(internal.emails.markUserEmailFlagsInternal, {
          clerkId: u.clerkId,
          email: u.email,
          resendContactId: res.contactId,
          resendAudienceId: res.audienceId || effectiveAudienceId,
          resendSyncedAt: Date.now(),
          logMessage: `Sincronização em lote Resend Audience: ${u.email}`,
          logDetails: JSON.stringify({
            clerkId: u.clerkId,
            email: u.email,
            contactId: res.contactId,
            audienceId: res.audienceId || effectiveAudienceId,
          }),
        });
      }

      // Respeita o limite de taxa da API do Resend (2 req/seg)
      await new Promise((resolve) => setTimeout(resolve, 550));
    }

    return {
      syncedCount,
      totalCandidates: users.length,
      audienceId: effectiveAudienceId,
    };
  },
});
