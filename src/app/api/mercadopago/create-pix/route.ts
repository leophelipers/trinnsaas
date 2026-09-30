import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mpPayment } from "@/lib/mercadopago";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { error: "Acesso não autorizado. Por favor faça login." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amountBrl, creditsBase, creditsBonus, packageSlug } = body;

    const amount = Number(amountBrl);
    if (!amount || amount < 5.0) {
      return NextResponse.json(
        { error: "O valor mínimo para recarga é de R$ 5,00." },
        { status: 400 }
      );
    }

    const primaryEmail =
      user.primaryEmailAddress?.emailAddress || "usuario@kriativa.app";
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      "Criador";

    const creditsTotal = Math.round(Number(creditsBase || 0) + Number(creditsBonus || 0));

    // Notificação webhook URL configurada
    const rawNotificationUrl = process.env.MERCADOPAGO_NOTIFICATION_URL?.trim();
    const notificationUrl = rawNotificationUrl
      ? rawNotificationUrl.includes("/api/mercadopago/webhook")
        ? rawNotificationUrl
        : `${rawNotificationUrl.replace(/\/$/, "")}/api/mercadopago/webhook`
      : undefined;

    // Criar pagamento via PIX no Mercado Pago
    const paymentResponse = await mpPayment.create({
      body: {
        transaction_amount: Number(amount.toFixed(2)),
        description: `Recarga de ${creditsTotal} créditos - kriativa.app`,
        payment_method_id: "pix",
        payer: {
          email: primaryEmail,
          first_name: user.firstName || fullName.split(" ")[0] || "Criador",
          last_name: user.lastName || fullName.split(" ").slice(1).join(" ") || "kriativa",
        },
        notification_url: notificationUrl,
        metadata: {
          user_id: userId,
          credits_base: creditsBase,
          credits_bonus: creditsBonus,
          credits_total: creditsTotal,
          package_slug: packageSlug || "custom_deposit",
        },
      },
    });

    const qrCode = paymentResponse.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64;
    const ticketUrl = paymentResponse.point_of_interaction?.transaction_data?.ticket_url;

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.id?.toString(),
      status: paymentResponse.status,
      statusDetail: paymentResponse.status_detail,
      qrCode,
      qrCodeBase64,
      ticketUrl,
      amountBrl: amount,
      creditsTotal,
    });
  } catch (error: any) {
    console.error("Erro ao criar pagamento PIX no Mercado Pago:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Não foi possível gerar a cobrança PIX no Mercado Pago. Verifique suas credenciais.",
      },
      { status: 500 }
    );
  }
}
