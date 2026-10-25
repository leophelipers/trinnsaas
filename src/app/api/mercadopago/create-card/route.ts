import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mpPayment, mpCardToken } from "@/lib/mercadopago";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

function detectCardBrand(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, "");
  if (/^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|650|6516|6550)/.test(clean)) return "elo";
  if (/^(606282|3841)/.test(clean)) return "hipercard";
  if (/^3[47]/.test(clean)) return "amex";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "master";
  if (/^4/.test(clean)) return "visa";
  return "visa";
}

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
    const {
      orderId,
      amountBrl,
      creditsBase,
      creditsBonus,
      packageSlug,
      cardNumber,
      cardholderName,
      expirationMonth,
      expirationYear,
      securityCode,
      cpf,
      installments = 1,
      token,
    } = body;

    const amount = Number(amountBrl);
    if (!amount || amount < 5.0) {
      return NextResponse.json(
        { error: "O valor mínimo para recarga é de R$ 5,00." },
        { status: 400 }
      );
    }

    const cpfClean = (cpf || "").replace(/\D/g, "");
    if (!cpfClean || cpfClean.length !== 11) {
      return NextResponse.json(
        { error: "Informe um CPF válido com 11 dígitos para aprovação antifraude bancária." },
        { status: 400 }
      );
    }

    const primaryEmail =
      user.primaryEmailAddress?.emailAddress || "usuario@kriativa.app";
    const nameToUse = (cardholderName || [user.firstName, user.lastName].filter(Boolean).join(" ") || "Cliente").trim();
    const [firstName, ...restName] = nameToUse.split(" ");
    const lastName = restName.join(" ") || "Kriativa";

    const creditsTotal = Math.round(Number(creditsBase || 0) + Number(creditsBonus || 0));

    // Notificação webhook URL configurada
    const rawNotificationUrl = process.env.MERCADOPAGO_NOTIFICATION_URL?.trim();
    const notificationUrl = rawNotificationUrl
      ? rawNotificationUrl.includes("/api/mercadopago/webhook")
        ? rawNotificationUrl
        : `${rawNotificationUrl.replace(/\/$/, "")}/api/mercadopago/webhook`
      : undefined;

    let cardTokenId = token;
    let cardBrand = detectCardBrand(cardNumber || "");
    const cardLast4 = (cardNumber || "").replace(/\D/g, "").slice(-4) || "0000";

    // Se o token ainda não foi gerado pelo frontend, gera com mpCardToken
    if (!cardTokenId) {
      const cleanCard = (cardNumber || "").replace(/\D/g, "");
      if (cleanCard.length < 13) {
        return NextResponse.json(
          { error: "Número de cartão de crédito inválido." },
          { status: 400 }
        );
      }

      let expMonthStr = String(expirationMonth || "").padStart(2, "0");
      let expYearStr = String(expirationYear || "");
      if (expYearStr.length === 2) {
        expYearStr = `20${expYearStr}`;
      }

      try {
        const tokenRes: any = await mpCardToken.create({
          body: {
            card_number: cleanCard,
            expiration_month: expMonthStr,
            expiration_year: expYearStr,
            security_code: String(securityCode || ""),
            cardholder: {
              name: nameToUse,
              identification: {
                type: "CPF",
                number: cpfClean,
              },
            },
          } as any,
        });

        cardTokenId = tokenRes.id;
      } catch (tokenErr: any) {
        console.error("Erro ao gerar token do cartão no Mercado Pago:", tokenErr);
        return NextResponse.json(
          {
            error:
              tokenErr.message ||
              "Não foi possível validar os dados do cartão. Verifique o número, validade e CVV.",
          },
          { status: 400 }
        );
      }
    }

    if (!cardTokenId) {
      return NextResponse.json(
        { error: "Falha ao gerar credencial criptografada do cartão." },
        { status: 400 }
      );
    }

    const isSkipQueue = typeof packageSlug === "string" && packageSlug.startsWith("fura_fila");
    const description = isSkipQueue
      ? "Reserva de Lugar na Fila (Lote R$50/mes) - Kriativa"
      : `Recarga de ${creditsTotal} créditos - kriativa.app`;

    // Criar o pagamento no Mercado Pago
    const paymentResponse = await mpPayment.create({
      body: {
        transaction_amount: Number(amount.toFixed(2)),
        token: cardTokenId,
        description,
        installments: Number(installments) || 1,
        payment_method_id: cardBrand,
        payer: {
          email: primaryEmail,
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: "CPF",
            number: cpfClean,
          },
        },
        notification_url: notificationUrl,
        metadata: {
          user_id: userId,
          credits_base: creditsBase,
          credits_bonus: creditsBonus,
          credits_total: creditsTotal,
          package_slug: packageSlug || "custom_deposit",
          card_last4: cardLast4,
          card_brand: cardBrand,
          installments: Number(installments) || 1,
        },
      },
    });

    const status = paymentResponse.status;
    const isApproved = status === "approved";

    // Se aprovado imediatamente, efetiva o pedido no Convex pelo servidor seguro
    if (isApproved) {
      const pkgSlug = String(packageSlug || "");
      if (pkgSlug.startsWith("fura_fila")) {
        try {
          const client = await clerkClient();
          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              ...(user.publicMetadata ?? {}),
              isPreLaunch: true,
              skipQueuePaid: true,
              skipQueueAmountBrl: amount,
              skipQueuePaidAt: Date.now(),
              subscriptionCardLast4: cardLast4,
              subscriptionCardBrand: cardBrand,
            },
          });
        } catch {
          // ignore
        }
      }

      try {
        const { ConvexHttpClient } = await import("convex/browser");
        const { api } = await import("../../../../../convex/_generated/api");
        const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
        const internalSecret =
          process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";

        let resolvedOrderId = orderId || undefined;
        if (!resolvedOrderId) {
          resolvedOrderId = await convex.mutation(api.credits.createPendingOrder, {
            amountBrl: amount,
            creditsBase: Number(creditsBase || 0),
            creditsBonus: Number(creditsBonus || 0),
            creditsTotal,
            packageSlug: packageSlug || "custom_deposit",
            paymentMethod: "credit_card",
            mpPaymentId: paymentResponse.id?.toString(),
            cardLast4,
            cardBrand,
            installments: Number(installments) || 1,
            secret: internalSecret,
            clerkId: userId,
            userEmail: primaryEmail,
            userName: nameToUse,
          });
        }

        await convex.mutation(api.credits.fulfillOrder, {
          orderId: resolvedOrderId,
          mpPaymentId: paymentResponse.id?.toString(),
          status: "approved",
          secret: internalSecret,
        });

        if (pkgSlug.startsWith("fura_fila")) {
          const payIdStr = paymentResponse.id?.toString() || String(resolvedOrderId || Date.now());
          await sendMetaCapiEvent({
            eventName: "AddPaymentInfo",
            eventId: `add_payment_info_${payIdStr}`,
            userData: {
              email: primaryEmail,
              firstName,
              lastName,
              externalId: userId,
            },
            customData: {
              value: amount,
              currency: "BRL",
              content_name: `Passaporte Fura-Fila (R$ ${amount})`,
              content_category: "fura_fila_pre_lancamento",
              content_ids: [pkgSlug],
              content_type: "product",
              payment_method: "credit_card",
            },
          });
        }
      } catch (fulfillErr) {
        console.error("Erro ao efetivar pedido de cartão aprovado:", fulfillErr);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.id?.toString(),
      status,
      statusDetail: paymentResponse.status_detail,
      isApproved,
      cardLast4,
      cardBrand,
      installments: Number(installments) || 1,
      amountBrl: amount,
      creditsTotal,
    });
  } catch (error: any) {
    console.error("Erro ao processar pagamento por Cartão no Mercado Pago:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Não foi possível processar o cartão de crédito. Verifique o número, validade, CVV e CPF do titular.",
      },
      { status: 500 }
    );
  }
}
