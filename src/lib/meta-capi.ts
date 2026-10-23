import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// ============================================================================
// CONFIGURAÇÃO HARDCODED DO META PIXEL & CONVERSIONS API (CAPI)
// ============================================================================
export const HARDCODED_META_PIXEL_ID = "1126197216455519";

/**
 * Token de Acesso da API de Conversões (CAPI) da Meta hardcoded
 */
export const HARDCODED_META_CAPI_ACCESS_TOKEN =
  "EAAYjf10CtbcBS6I3tZAtbQnTX515KspnkC9GsHiBuCWHssN5M5kgZAWavaNBZAVBRHx78HZCkyf9xxcMSctPeNa7dpS11OlE5wbcnEllRMGYVZAemZAXpjB58o28ZCydyT9KIEUJVC4ZB9pAlJiEVAmvezbtzjmIC96OabCmVacI6ybhDt4jtjUsR2z2Txtq7wZDZD";

export const DEFAULT_META_PIXEL_ID = HARDCODED_META_PIXEL_ID;

export interface MetaCapiUserDataInput {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

export interface MetaCapiCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  payment_method?: string;
  status?: string;
  [key: string]: unknown;
}

export interface SendMetaCapiEventParams {
  eventName: "PageView" | "Lead" | "AddPaymentInfo" | "InitiateCheckout" | "Purchase" | string;
  eventId: string;
  eventSourceUrl?: string;
  userData?: MetaCapiUserDataInput;
  customData?: MetaCapiCustomData;
}

function sha256Hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeAndHashEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  if (!clean) return undefined;
  return sha256Hash(clean);
}

function normalizeAndHashPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  // Se tiver 10 ou 11 dígitos (padrão Brasil com DDD), prefixa DDI 55
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }
  return sha256Hash(digits);
}

function normalizeAndHashName(name?: string): string | undefined {
  if (!name) return undefined;
  const clean = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!clean) return undefined;
  return sha256Hash(clean);
}

async function resolveMetaCredentials(): Promise<{
  pixelId: string;
  accessToken?: string;
  testEventCode?: string;
}> {
  const hardcodedToken = HARDCODED_META_CAPI_ACCESS_TOKEN.trim();
  const envToken = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  const pixelId = HARDCODED_META_PIXEL_ID;
  const envTestCode = process.env.META_TEST_EVENT_CODE?.trim();

  if (hardcodedToken) {
    return {
      pixelId,
      accessToken: hardcodedToken,
      testEventCode: envTestCode,
    };
  }

  if (envToken) {
    return {
      pixelId,
      accessToken: envToken,
      testEventCode: envTestCode,
    };
  }

  // Fallback: consulta token configurado no painel administrativo Convex
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      const convex = new ConvexHttpClient(convexUrl);
      const cfg = await convex.query(api.preLaunch.getServerMetaConfig, {
        secret:
          process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
      });
      return {
        pixelId,
        accessToken: cfg.metaCapiAccessToken,
        testEventCode: cfg.metaTestEventCode || envTestCode,
      };
    }
  } catch {
    // ignore fallback error
  }

  return {
    pixelId,
    accessToken: undefined,
    testEventCode: envTestCode,
  };
}

/**
 * Envia evento para a API de Conversões da Meta (Graph API v21.0) com deduplicação por event_id
 */
export async function sendMetaCapiEvent(params: SendMetaCapiEventParams) {
  try {
    const { pixelId, accessToken, testEventCode } = await resolveMetaCredentials();

    if (!accessToken) {
      // Sem token CAPI configurado ainda: retorna silenciosamente (o Pixel browser já disparou)
      return {
        sent: false,
        reason: "META_CAPI_ACCESS_TOKEN not configured",
        pixelId,
      };
    }

    const u = params.userData || {};
    const hashedEmail = normalizeAndHashEmail(u.email);
    const hashedPhone = normalizeAndHashPhone(u.phone);
    const hashedFn = normalizeAndHashName(u.firstName);
    const hashedLn = normalizeAndHashName(u.lastName);
    const hashedExtId = u.externalId
      ? sha256Hash(u.externalId.trim())
      : undefined;
    const hashedCountry = sha256Hash("br");

    const userDataPayload: Record<string, unknown> = {
      country: [hashedCountry],
    };

    if (hashedEmail) userDataPayload.em = [hashedEmail];
    if (hashedPhone) userDataPayload.ph = [hashedPhone];
    if (hashedFn) userDataPayload.fn = [hashedFn];
    if (hashedLn) userDataPayload.ln = [hashedLn];
    if (hashedExtId) userDataPayload.external_id = [hashedExtId];
    if (u.clientIpAddress) userDataPayload.client_ip_address = u.clientIpAddress;
    if (u.clientUserAgent) userDataPayload.client_user_agent = u.clientUserAgent;
    if (u.fbc) userDataPayload.fbc = u.fbc;
    if (u.fbp) userDataPayload.fbp = u.fbp;

    const eventPayload: Record<string, unknown> = {
      event_name: params.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.eventId,
      action_source: "website",
      user_data: userDataPayload,
    };

    if (params.eventSourceUrl) {
      eventPayload.event_source_url = params.eventSourceUrl;
    }

    if (params.customData && Object.keys(params.customData).length > 0) {
      eventPayload.custom_data = params.customData;
    }

    const bodyPayload: Record<string, unknown> = {
      data: [eventPayload],
    };

    if (testEventCode) {
      bodyPayload.test_event_code = testEventCode;
    }

    const endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(
      pixelId
    )}/events?access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    const result = await response.json().catch(() => ({}));

    return {
      sent: response.ok,
      status: response.status,
      pixelId,
      eventId: params.eventId,
      result,
    };
  } catch (error) {
    console.error("Erro ao enviar evento para Meta Conversions API:", error);
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Unknown CAPI error",
    };
  }
}
