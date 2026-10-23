import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mpPayment } from "@/lib/mercadopago";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId é obrigatório." }, { status: 400 });
    }

    const payment = await mpPayment.get({ id: paymentId });

    // Verificação de isolamento: o pagamento deve pertencer ao usuário autenticado
    if (payment.metadata?.user_id && payment.metadata.user_id !== userId) {
      return NextResponse.json({ error: "Acesso não autorizado a esta transação." }, { status: 403 });
    }

    const isApproved = payment.status === "approved";

    // Se estiver aprovado, efetiva diretamente no Convex com autenticação segura de servidor
    if (isApproved) {
      try {
        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("../../../../../convex/_generated/api");
        const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
        await convex.mutation(api.credits.fulfillOrder, {
          mpPaymentId: payment.id?.toString(),
          status: "approved",
          secret: process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938",
        });

        // Se for compra do Passaporte Fura-Fila, envia também pela API de Conversões (CAPI) com deduplicação
        const pkgSlug = String(payment.metadata?.package_slug || "");
        if (pkgSlug.startsWith("fura_fila")) {
          const payIdStr = payment.id?.toString() || paymentId;
          const amountVal = Number(payment.transaction_amount || 5);
          const payerEmail = payment.payer?.email || undefined;
          await sendMetaCapiEvent({
            eventName: "AddPaymentInfo",
            eventId: `add_payment_info_${payIdStr}`,
            userData: {
              email: payerEmail,
              externalId: userId,
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
      } catch (fulfillErr) {
        console.error("Erro ao efetivar pedido aprovado via check-status:", fulfillErr);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id?.toString(),
      status: payment.status,
      statusDetail: payment.status_detail,
      amountBrl: payment.transaction_amount,
      paymentMethod: payment.payment_method_id,
      dateApproved: payment.date_approved,
      isApproved,
    });
  } catch (error: any) {
    console.error("Erro ao consultar status no Mercado Pago:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao consultar status do pagamento." },
      { status: 500 }
    );
  }
}
