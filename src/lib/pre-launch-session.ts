import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export const DEFAULT_WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/Hl24R2NuhRh7Iq4qU9ce4Y?s=cl&p=i&mlu=4&ilr=4&iam=0";

export const FALLBACK_PRELAUNCH_SETTINGS = {
  key: "global_prelaunch_config",
  whatsappGroupUrl: DEFAULT_WHATSAPP_GROUP_URL,
  whatsappGroupTitle: "Grupo Oficial do Pré-Lançamento no WhatsApp",
  whatsappGroupDescription:
    "Entre no grupo oficial do pré-lançamento para acompanhar as novidades, sua posição na lista e o comunicado oficial de abertura das 50 primeiras vagas de R$ 50/mês.",
  skipQueue5Title: "Comprar um Lugar na Fila (R$ 5,00 no Cartão)",
  skipQueue5Subtitle:
    "Os R$ 5,00 compram apenas um lugar prioritário na fila para a condição do primeiro mês de R$ 50,00 (Os Primeiros 50). Pagamento exclusivo via cartão de crédito (o mesmo cartão será utilizado para a assinatura). Não é convertido em créditos e não dá acesso imediato.",
  skipQueue5CreditsBase: 0,
  skipQueue5CreditsBonus: 0,
  skipQueue10Title: "Lugar na Fila + Selo Fundador (R$ 10,00)",
  skipQueue10Subtitle:
    "Prioridade na fila para o lote de abertura + selo fundador na conta. Não é convertido em créditos e não dá acesso imediato.",
  skipQueue10CreditsBase: 0,
  skipQueue10CreditsBonus: 0,
  extraInfoBlocks: [
    {
      id: "primeiros_50",
      badge: "OS PRIMEIROS 50",
      title: "R$ 50/mês Enquanto Mantiver a Assinatura Ativa",
      description:
        "O plano de IA ilimitada terá preço cheio de R$ 500/mês, mas os primeiros 50 participantes que garantirem a condição pagarão apenas R$ 50/mês enquanto mantiverem a assinatura ativa.",
    },
    {
      id: "quatro_tipos_ia",
      badge: "UMA EXPERIÊNCIA INTEGRADA",
      title: "Kriativa Vision · Motion · Voice · Mind",
      description:
        "Kriativa Vision (Imagens), Kriativa Motion (Vídeos), Kriativa Voice (Áudio) e Kriativa Mind (Texto) reunidos em uma única assinatura sem contador de créditos.",
    },
    {
      id: "regra_transparente",
      badge: "TRANSPARÊNCIA TOTAL",
      title: "O que são os R$ 5,00 no Cartão?",
      description:
        "Os R$ 5,00 compram exclusivamente um lugar prioritário na fila para o primeiro mês de R$ 50,00. O pagamento é feito apenas por cartão de crédito pois usaremos o mesmo cartão para as assinaturas. Não é convertido em créditos e não concede acesso imediato.",
    },
  ],
};

export type PreLaunchStatusData = {
  userId: string;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  tags: string[];
  hasPreLaunchTag: boolean;
  emailConfirmed: boolean;
  emailConfirmedAt?: number;
  verificationCodeSent: boolean;
  emailVerificationSentAt?: number;
  welcomeEmailSent: boolean;
  whatsappGroupJoined: boolean;
  whatsappGroupJoinedAt?: number;
  skipQueuePaid: boolean;
  skipQueueAmountBrl: number;
  skipQueuePaidAt?: number;
  subscriptionCardLast4?: string;
  subscriptionCardBrand?: string;
  paidCredits: number;
  bonusCredits: number;
  totalCredits: number;
  settings: typeof FALLBACK_PRELAUNCH_SETTINGS & {
    resendConfigured?: boolean;
  };
};

const INTERNAL_SECRET =
  process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";

const ADMIN_EMAILS = new Set(["leo.phe.rod@gmail.com"]);

function getConvexClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url || url.includes("placeholder.convex.cloud")) {
    return null;
  }
  return new ConvexHttpClient(url);
}

export async function getAuthenticatedClerkIdentity() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return null;
  }

  let user = null;
  try {
    user = await currentUser();
  } catch {
    try {
      const client = await clerkClient();
      user = await client.users.getUser(userId);
    } catch {
      // fallback to sessionClaims if Clerk API rate-limits
    }
  }

  const claimsRecord = (sessionClaims ?? {}) as Record<string, unknown>;
  const claimsEmail =
    (typeof claimsRecord.email === "string" ? claimsRecord.email : "") ||
    (typeof claimsRecord.primary_email_address === "string"
      ? claimsRecord.primary_email_address
      : "");
  const claimsName =
    (typeof claimsRecord.name === "string" ? claimsRecord.name : "") ||
    (typeof claimsRecord.full_name === "string" ? claimsRecord.full_name : "");

  const externalAcc = user?.externalAccounts?.[0];
  const email = (
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    externalAcc?.emailAddress ||
    claimsEmail ||
    ""
  ).trim();

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    [externalAcc?.firstName, externalAcc?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    user?.username ||
    claimsName.trim() ||
    (email ? email.split("@")[0] : "Criador");

  const whatsapp =
    (typeof user?.publicMetadata?.whatsapp === "string"
      ? user.publicMetadata.whatsapp
      : "") ||
    user?.primaryPhoneNumber?.phoneNumber ||
    "";
  const imageUrl = user?.imageUrl || externalAcc?.imageUrl || undefined;

  return {
    userId,
    email,
    name,
    whatsapp,
    imageUrl,
    publicMetadata: (user?.publicMetadata ?? {}) as Record<string, unknown>,
    privateMetadata: (user?.privateMetadata ?? {}) as Record<string, unknown>,
  };
}

async function fetchPublicSettingsSafe(convex: ConvexHttpClient | null) {
  if (!convex) {
    return FALLBACK_PRELAUNCH_SETTINGS;
  }
  try {
    const publicSettings = await convex.query(
      api.preLaunch.getPublicPreLaunchSettings,
      {}
    );
    if (publicSettings) {
      return {
        ...FALLBACK_PRELAUNCH_SETTINGS,
        ...publicSettings,
        whatsappGroupUrl:
          publicSettings.whatsappGroupUrl || DEFAULT_WHATSAPP_GROUP_URL,
      };
    }
  } catch {
    // ignore
  }
  return FALLBACK_PRELAUNCH_SETTINGS;
}

let cachedServerAudienceId: string | undefined;

export async function syncContactToResendAudienceServer(params: {
  email: string;
  name?: string;
  resendApiKey?: string;
  resendAudienceId?: string;
}): Promise<{ synced: boolean; contactId?: string; audienceId?: string }> {
  const resendKey = params.resendApiKey || process.env.RESEND_API_KEY;
  const cleanEmail = (params.email || "").trim().toLowerCase();
  if (!resendKey || !cleanEmail || !cleanEmail.includes("@")) {
    return { synced: false };
  }

  const nameParts = (params.name || cleanEmail.split("@")[0] || "Criador")
    .trim()
    .split(/\s+/);
  const firstName = nameParts[0] || "Criador";
  const lastName = nameParts.slice(1).join(" ").trim() || undefined;

  let audienceId =
    params.resendAudienceId ||
    process.env.RESEND_AUDIENCE_ID ||
    cachedServerAudienceId;

  if (!audienceId) {
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
          data?: Array<{ id: string }>;
        };
        if (Array.isArray(listJson.data) && listJson.data.length > 0) {
          audienceId = listJson.data[0].id;
          cachedServerAudienceId = audienceId;
        } else {
          const createRes = await fetch("https://api.resend.com/audiences", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: "Kriativa" }),
          });
          if (createRes.ok) {
            const created = (await createRes.json()) as { id?: string };
            if (created.id) {
              audienceId = created.id;
              cachedServerAudienceId = audienceId;
            }
          }
        }
      }
    } catch {
      // ignore discovery error
    }
  }

  if (audienceId) {
    try {
      const res = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
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
      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        return { synced: true, contactId: data.id || cleanEmail, audienceId };
      }

      const patchRes = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts/${encodeURIComponent(cleanEmail)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${resendKey}`,
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
        return {
          synced: true,
          contactId: patchData.id || cleanEmail,
          audienceId,
        };
      }
    } catch {
      // ignore and try global /contacts fallback
    }
  }

  try {
    const globalRes = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: cleanEmail,
        first_name: firstName,
        ...(lastName ? { last_name: lastName } : {}),
        ...(audienceId ? { audience_id: audienceId } : {}),
        unsubscribed: false,
      }),
    });
    if (globalRes.ok) {
      const data = (await globalRes.json()) as { id?: string };
      return { synced: true, contactId: data.id || cleanEmail, audienceId };
    }
  } catch {
    // ignore
  }

  return { synced: false, audienceId };
}

async function resolveServerResendSenderCandidates(
  resendKey: string
): Promise<string[]> {
  const candidates: string[] = [];
  const configured = process.env.RESEND_FROM_EMAIL?.trim();
  if (configured && !configured.includes("onboarding@resend.dev")) {
    candidates.push(configured);
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
    // ignore
  }

  candidates.push("Kriativa <nao-responda@kriativa.app>");
  candidates.push("Kriativa <onboarding@resend.dev>");
  return Array.from(new Set(candidates));
}

export async function sendFallbackPreLaunchEmail(params: {
  email: string;
  name: string;
  code?: string;
  eventType: "verification_code" | "email_confirmed";
  resendApiKey?: string;
  resendAudienceId?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resendKey = params.resendApiKey || process.env.RESEND_API_KEY;
  const firstName = params.name ? params.name.split(" ")[0] : "Criador";
  const cleanEmail = (params.email || "").trim();

  if (!resendKey || !cleanEmail) {
    return {
      sent: false,
      error: !resendKey
        ? "RESEND_API_KEY não configurada"
        : "E-mail do destinatário vazio",
    };
  }

  try {
    await syncContactToResendAudienceServer({
      email: cleanEmail,
      name: params.name,
      resendApiKey: resendKey,
      resendAudienceId: params.resendAudienceId,
    });

    if (params.eventType === "verification_code" && params.code) {
      const senderCandidates =
        await resolveServerResendSenderCandidates(resendKey);
      let lastError = "";
      for (const fromAddress of senderCandidates) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromAddress,
              to: [cleanEmail],
              subject: `${params.code} é o seu código de confirmação — Kriativa`,
              html: `<div style="background:#050507;color:#f4f4f5;padding:32px;font-family:sans-serif;border-radius:16px;"><div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#FF5500;margin-bottom:10px;font-weight:700;">KRIATIVA · BY TRINN</div><h2 style="color:#fff;margin-top:0;">Olá, ${firstName}!</h2><p style="color:#d4d4d8;">Seu código de confirmação de 6 dígitos na Kriativa é:</p><div style="font-size:32px;font-family:monospace;font-weight:bold;letter-spacing:0.25em;color:#FF5500;padding:16px;background:#14141b;border:1px solid rgba(255,85,0,0.4);border-radius:12px;text-align:center;margin:20px 0;">${params.code}</div><p style="font-size:12px;color:#71717a;">Válido por 30 minutos.</p></div>`,
            }),
          });
          if (res.ok) {
            return { sent: true };
          }
          lastError = await res.text();
        } catch (err: unknown) {
          lastError = err instanceof Error ? err.message : String(err);
        }
      }
      return { sent: false, error: lastError };
    }
    return { sent: true };
  } catch (err: unknown) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function stripInternalServerFields(
  raw: Record<string, unknown>
): PreLaunchStatusData {
  const copy = { ...raw };
  delete copy.serverVerificationCode;
  delete copy.serverResendApiKey;
  delete copy.serverResendAudienceId;
  return copy as unknown as PreLaunchStatusData;
}

/**
 * Resolve e sincroniza o status completo do usuário na Sala de Pré-Lançamento via Servidor Next.js
 */
export async function resolveServerPreLaunchStatus(opts?: {
  whatsapp?: string;
  nameOverride?: string;
  emailOverride?: string;
}): Promise<PreLaunchStatusData | null> {
  const clerkIdentity = await getAuthenticatedClerkIdentity();
  if (!clerkIdentity) {
    return null;
  }

  const convex = getConvexClient();
  const effectiveEmail =
    opts?.emailOverride?.trim() || clerkIdentity.email || "";
  const effectiveName = opts?.nameOverride?.trim() || clerkIdentity.name;
  const effectiveWhatsapp = opts?.whatsapp?.trim() || clerkIdentity.whatsapp;

  // 1. Tenta sincronizar e obter diretamente do Convex usando o segredo de servidor
  if (convex) {
    try {
      const synced = (await convex.mutation(
        api.preLaunch.syncPreLaunchSession,
        {
          secret: INTERNAL_SECRET,
          clerkId: clerkIdentity.userId,
          email: effectiveEmail,
          name: effectiveName,
          whatsapp: effectiveWhatsapp || undefined,
          imageUrl: clerkIdentity.imageUrl,
          resendApiKey: process.env.RESEND_API_KEY || undefined,
          resendAudienceId: process.env.RESEND_AUDIENCE_ID || undefined,
        }
      )) as Record<string, unknown> | null;
      if (synced) {
        return stripInternalServerFields(synced);
      }
    } catch (err) {
      console.warn(
        "Fallback de sessão Pré-Lançamento acionado (syncPreLaunchSession):",
        err instanceof Error ? err.message : err
      );
    }

    try {
      const status = (await convex.query(api.preLaunch.getMyPreLaunchStatus, {
        secret: INTERNAL_SECRET,
        clerkId: clerkIdentity.userId,
        email: effectiveEmail,
        name: effectiveName,
      })) as Record<string, unknown> | null;
      if (status) {
        return stripInternalServerFields(status);
      }
    } catch {
      // Continua para o fallback resiliente com metadados do Clerk + configurações públicas
    }
  }

  // 2. Fallback 100% garantido caso o deployment Convex ainda não tenha a nova assinatura
  const settings = await fetchPublicSettingsSafe(convex);
  const pubMeta = clerkIdentity.publicMetadata;
  const privMeta = clerkIdentity.privateMetadata;

  let verificationCode =
    typeof privMeta.emailVerificationCode === "string"
      ? privMeta.emailVerificationCode
      : undefined;
  let emailVerificationSentAt =
    typeof privMeta.emailVerificationSentAt === "number"
      ? privMeta.emailVerificationSentAt
      : undefined;
  const isAdmin =
    pubMeta.role === "admin" ||
    ADMIN_EMAILS.has(clerkIdentity.email.toLowerCase());

  const skipQueuePaid = Boolean(pubMeta.skipQueuePaid);
  const emailConfirmed = true;

  if (!privMeta.resendAudienceSynced && clerkIdentity.email) {
    try {
      const synced = await syncContactToResendAudienceServer({
        email: clerkIdentity.email,
        name: effectiveName,
      });
      if (synced.synced) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(clerkIdentity.userId, {
          publicMetadata: {
            ...pubMeta,
            isPreLaunch: true,
            emailConfirmed: true,
            tags: ["pre_lancamento"],
          },
          privateMetadata: {
            ...privMeta,
            resendAudienceSynced: true,
            resendContactId: synced.contactId,
          },
        });
      }
    } catch {
      // ignore
    }
  }

  return {
    userId: clerkIdentity.userId,
    name: effectiveName,
    email: clerkIdentity.email,
    whatsapp: effectiveWhatsapp,
    role: isAdmin ? "admin" : "user",
    tags: skipQueuePaid
      ? ["pre_lancamento", "fura_fila_vip"]
      : ["pre_lancamento"],
    hasPreLaunchTag: true,
    emailConfirmed,
    emailConfirmedAt:
      typeof pubMeta.emailConfirmedAt === "number"
        ? pubMeta.emailConfirmedAt
        : undefined,
    verificationCodeSent: Boolean(emailVerificationSentAt),
    emailVerificationSentAt,
    welcomeEmailSent: Boolean(pubMeta.welcomeEmailSent),
    whatsappGroupJoined: Boolean(pubMeta.whatsappGroupJoined),
    whatsappGroupJoinedAt:
      typeof pubMeta.whatsappGroupJoinedAt === "number"
        ? pubMeta.whatsappGroupJoinedAt
        : undefined,
    skipQueuePaid,
    skipQueueAmountBrl:
      typeof pubMeta.skipQueueAmountBrl === "number"
        ? pubMeta.skipQueueAmountBrl
        : 0,
    skipQueuePaidAt:
      typeof pubMeta.skipQueuePaidAt === "number"
        ? pubMeta.skipQueuePaidAt
        : undefined,
    subscriptionCardLast4:
      typeof pubMeta.subscriptionCardLast4 === "string"
        ? pubMeta.subscriptionCardLast4
        : undefined,
    subscriptionCardBrand:
      typeof pubMeta.subscriptionCardBrand === "string"
        ? pubMeta.subscriptionCardBrand
        : undefined,
    paidCredits: 0,
    bonusCredits: 0,
    totalCredits: 0,
    settings,
  };
}

export { INTERNAL_SECRET, getConvexClient };
