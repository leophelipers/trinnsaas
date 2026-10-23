"use client";

export const META_PIXEL_ID = "1126197216455519";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export interface MetaUserDataClient {
  email?: string;
  phone?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

/**
 * Captura fbclid da URL e persiste em cookie _fbc caso ainda não exista
 */
export function syncFbclidCookie(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid");
    if (fbclid && !getCookieValue("_fbc")) {
      const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
      document.cookie = `_fbc=${fbcValue}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
    }
  } catch {
    // ignore
  }
}

export function generateMetaEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Dispara evento simultaneamente no Meta Pixel (Browser) e na API de Conversões (/api/meta/capi)
 * com o mesmo eventID para deduplicação oficial da Meta.
 */
export function trackMetaEvent(options: {
  eventName: "PageView" | "Lead" | "AddPaymentInfo" | "InitiateCheckout" | "Purchase";
  eventId?: string;
  customData?: Record<string, unknown>;
  userData?: MetaUserDataClient;
}): string {
  const eventId =
    options.eventId || generateMetaEventId(options.eventName.toLowerCase());

  if (typeof window === "undefined") {
    return eventId;
  }

  // 1. Disparo Browser Pixel (fbq) com eventID para deduplicação
  try {
    if (typeof window.fbq === "function") {
      window.fbq(
        "track",
        options.eventName,
        options.customData || {},
        { eventID: eventId }
      );
    }
  } catch (err) {
    console.error("Erro ao disparar fbq:", err);
  }

  // 2. Disparo Server-Side Conversions API (CAPI) com o mesmo eventId
  try {
    const fbp = getCookieValue("_fbp");
    const fbc = getCookieValue("_fbc");

    fetch("/api/meta/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName: options.eventName,
        eventId,
        eventSourceUrl: window.location.href,
        customData: options.customData,
        userData: {
          ...options.userData,
          fbp,
          fbc,
        },
      }),
    }).catch(() => {
      // Silencioso para não impactar a UX
    });
  } catch {
    // ignore
  }

  return eventId;
}

/**
 * 1. Evento PageView (Visualização de Página)
 */
export function trackMetaPageView(): string {
  return trackMetaEvent({
    eventName: "PageView",
  });
}

/**
 * 2. Evento Lead (Quando o usuário se cadastra no Pré-Lançamento)
 */
export function trackMetaLead(params?: {
  eventId?: string;
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
}): string {
  return trackMetaEvent({
    eventName: "Lead",
    eventId: params?.eventId,
    customData: {
      content_name: "Cadastro Pré-Lançamento Kriativa",
      content_category: "pre_lancamento",
      lead_source: params?.source || "pre_launch_landing",
      currency: "BRL",
      value: 0,
    },
    userData: {
      name: params?.name,
      email: params?.email,
      phone: params?.phone,
    },
  });
}

/**
 * 3. Evento AddPaymentInfo (Quando o usuário compra / inicia ou confirma o Fura-Fila de R$ 5 ou R$ 10)
 */
export function trackMetaAddPaymentInfo(params: {
  eventId?: string;
  amountBrl: number;
  packageSlug: string;
  title: string;
  paymentMethod: "pix" | "credit_card";
  name?: string;
  email?: string;
  phone?: string;
}): string {
  return trackMetaEvent({
    eventName: "AddPaymentInfo",
    eventId: params.eventId,
    customData: {
      value: Number(params.amountBrl.toFixed(2)),
      currency: "BRL",
      content_name: params.title,
      content_category: "fura_fila_pre_lancamento",
      content_ids: [params.packageSlug],
      content_type: "product",
      payment_method: params.paymentMethod,
    },
    userData: {
      name: params.name,
      email: params.email,
      phone: params.phone,
    },
  });
}

/**
 * 4. Evento Purchase (Confirmação de compra do Fura-Fila)
 */
export function trackMetaPurchase(params: {
  eventId?: string;
  amountBrl: number;
  packageSlug: string;
  title: string;
  paymentMethod: "pix" | "credit_card";
  name?: string;
  email?: string;
  phone?: string;
}): string {
  return trackMetaEvent({
    eventName: "Purchase",
    eventId: params.eventId,
    customData: {
      value: Number(params.amountBrl.toFixed(2)),
      currency: "BRL",
      content_name: params.title,
      content_category: "fura_fila_pre_lancamento",
      content_ids: [params.packageSlug],
      content_type: "product",
      payment_method: params.paymentMethod,
    },
    userData: {
      name: params.name,
      email: params.email,
      phone: params.phone,
    },
  });
}
