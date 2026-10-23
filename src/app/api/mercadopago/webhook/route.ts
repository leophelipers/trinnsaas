import { NextResponse } from "next/server";
import { mpPayment } from "@/lib/mercadopago";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") || searchParams.get("type");
    const id = searchParams.get("id") || searchParams.get("data.id");

    let bodyData: any = {};
    try {
      bodyData = await req.json();
    } catch {
      // Body pode estar vazio em algumas chamadas GET/HEAD de teste do Mercado Pago
    }

    const paymentId = id || bodyData?.data?.id;

    if (paymentId) {
      try {
        const payment = await mpPayment.get({ id: paymentId });

        if (payment && payment.status === "approved") {
          // Fulfill order in Convex com segredo interno de servidor
          await convex.mutation(api.credits.fulfillOrder, {
            mpPaymentId: payment.id?.toString(),
            status: "approved",
            secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
          });

          const pkgSlug = String(payment.metadata?.package_slug || "");
          if (pkgSlug.startsWith("fura_fila")) {
            const payIdStr = payment.id?.toString() || String(paymentId);
            const amountVal = Number(payment.transaction_amount || 5);
            await sendMetaCapiEvent({
              eventName: "AddPaymentInfo",
              eventId: `add_payment_info_${payIdStr}`,
              userData: {
                email: payment.payer?.email || undefined,
                externalId: payment.metadata?.user_id || undefined,
              },
              customData: {
                value: amountVal,
                currency: "BRL",
                content_name: `Passaporte Fura-Fila (R$ ${amountVal})`,
                content_category: "fura_fila_pre_lancamento",
                content_ids: [pkgSlug],
                content_type: "product",
                payment_method: payment.payment_method_id || "pix",
              },
            });
          }
        }
      } catch (err) {
        console.error("Erro ao processar pagamento do webhook MP:", err);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err: any) {
    console.error("Erro no webhook do Mercado Pago:", err);
    return new Response("OK", { status: 200 }); // Retornar 200 para evitar retentativas infinitas
  }
}
