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
  settings: typeof FALLBACK_PRELAUNCH_SETTINGS;
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
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  let user = null;
  try {
    user = await currentUser();
  } catch {
    // fallback if currentUser rate-limits or fails
  }

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username ||
    (email ? email.split("@")[0] : "Criador");
  const whatsapp =
    (typeof user?.publicMetadata?.whatsapp === "string"
      ? user.publicMetadata.whatsapp
      : "") ||
    user?.primaryPhoneNumber?.phoneNumber ||
    "";
  const imageUrl = user?.imageUrl || undefined;

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

export async function sendFallbackPreLaunchEmail(params: {
  email: string;
  name: string;
  code?: string;
  eventType: "verification_code" | "email_confirmed";
}) {
  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress =
    process.env.RESEND_FROM_EMAIL || "Kriativa <onboarding@resend.dev>";
  const firstName = params.name ? params.name.split(" ")[0] : "Criador";

  if (resendKey && params.email) {
    try {
      await syncContactToResendAudienceServer({
        email: params.email,
        name: params.name,
        resendApiKey: resendKey,
      });

      if (params.eventType === "verification_code" && params.code) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [params.email],
            subject: `${params.code} é o seu código de confirmação — Kriativa`,
            html: `<div style="background:#050507;color:#f4f4f5;padding:32px;font-family:sans-serif;border-radius:16px;"><h2 style="color:#fff;">Olá, ${firstName}!</h2><p>Seu código de confirmação de 6 dígitos na Kriativa é:</p><div style="font-size:32px;font-family:monospace;font-weight:bold;letter-spacing:0.25em;color:#FF5500;padding:16px;background:#14141b;border-radius:12px;text-align:center;">${params.code}</div></div>`,
          }),
        });
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Resolve e sincroniza o status completo do usuário na Sala de Pré-Lançamento via Servidor Next.js
 */
export async function resolveServerPreLaunchStatus(opts?: {
  whatsapp?: string;
  nameOverride?: string;
}): Promise<PreLaunchStatusData | null> {
  const clerkIdentity = await getAuthenticatedClerkIdentity();
  if (!clerkIdentity) {
    return null;
  }

  const convex = getConvexClient();
  const effectiveName = opts?.nameOverride?.trim() || clerkIdentity.name;
  const effectiveWhatsapp = opts?.whatsapp?.trim() || clerkIdentity.whatsapp;

  // 1. Tenta sincronizar e obter diretamente do Convex usando o segredo de servidor
  if (convex) {
    try {
      const synced = await convex.mutation(api.preLaunch.syncPreLaunchSession, {
        secret: INTERNAL_SECRET,
        clerkId: clerkIdentity.userId,
        email: clerkIdentity.email,
        name: effectiveName,
        whatsapp: effectiveWhatsapp || undefined,
        imageUrl: clerkIdentity.imageUrl,
      });
      if (synced) {
        return synced as PreLaunchStatusData;
      }
    } catch (err) {
      console.warn(
        "Fallback de sessão Pré-Lançamento acionado (syncPreLaunchSession):",
        err instanceof Error ? err.message : err
      );
    }

    try {
      const status = await convex.query(api.preLaunch.getMyPreLaunchStatus, {
        secret: INTERNAL_SECRET,
        clerkId: clerkIdentity.userId,
        email: clerkIdentity.email,
        name: effectiveName,
      });
      if (status) {
        return status as PreLaunchStatusData;
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
  const emailConfirmed = Boolean(pubMeta.emailConfirmed);

  if (!emailConfirmed && !verificationCode) {
    verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    emailVerificationSentAt = Date.now();
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(clerkIdentity.userId, {
        publicMetadata: {
          ...pubMeta,
          isPreLaunch: true,
          tags: ["pre_lancamento"],
        },
        privateMetadata: {
          ...privMeta,
          emailVerificationCode: verificationCode,
          emailVerificationSentAt,
          emailVerificationExpiresAt: emailVerificationSentAt + 30 * 60 * 1000,
          resendAudienceSynced: true,
        },
      });
      await sendFallbackPreLaunchEmail({
        email: clerkIdentity.email,
        name: effectiveName,
        code: verificationCode,
        eventType: "verification_code",
      });
    } catch {
      // ignore
    }
  } else if (!privMeta.resendAudienceSynced && clerkIdentity.email) {
    try {
      const synced = await syncContactToResendAudienceServer({
        email: clerkIdentity.email,
        name: effectiveName,
      });
      if (synced.synced) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(clerkIdentity.userId, {
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

  const isAdmin =
    pubMeta.role === "admin" ||
    ADMIN_EMAILS.has(clerkIdentity.email.toLowerCase());

  const skipQueuePaid = Boolean(pubMeta.skipQueuePaid);

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
