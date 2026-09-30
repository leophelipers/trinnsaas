import { NextResponse } from "next/server";
import { mpPayment } from "@/lib/mercadopago";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

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
