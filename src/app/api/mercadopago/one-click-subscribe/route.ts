import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { mpPreApproval, mpPayment, mpCardToken } from "@/lib/mercadopago";

const INTERNAL_SECRET =
  process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { error: "Sessão não autorizada. Faça login para ativar sua assinatura 1-Click." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const securityCode = body?.securityCode ? String(body.securityCode) : undefined;

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json(
        { error: "Configuração do servidor ausente." },
        { status: 500 }
      );
    }

    const convex = new ConvexHttpClient(convexUrl);
    const vault = await convex.query(api.preLaunch.getServerUserVaultCredentials, {
      clerkId: userId,
      secret: INTERNAL_SECRET,
    });

    const privMeta = (user.privateMetadata ?? {}) as Record<string, unknown>;
    const pubMeta = (user.publicMetadata ?? {}) as Record<string, unknown>;

    const mpCustomerId =
      vault?.mpCustomerId ||
      (typeof privMeta.mpCustomerId === "string" ? privMeta.mpCustomerId : undefined) ||
      (typeof pubMeta.mpCustomerId === "string" ? pubMeta.mpCustomerId : undefined);

    const mpCardId =
      vault?.mpCardId ||
      (typeof privMeta.mpCardId === "string" ? privMeta.mpCardId : undefined) ||
      (typeof pubMeta.mpCardId === "string" ? pubMeta.mpCardId : undefined);

    let mpCardTokenId =
      vault?.mpCardTokenId ||
      (typeof privMeta.mpCardTokenId === "string" ? privMeta.mpCardTokenId : undefined);

    const cardBrand =
      vault?.subscriptionCardBrand ||
      (typeof pubMeta.subscriptionCardBrand === "string" ? pubMeta.subscriptionCardBrand : "visa");

    const cardLast4 =
      vault?.subscriptionCardLast4 ||
      (typeof pubMeta.subscriptionCardLast4 === "string" ? pubMeta.subscriptionCardLast4 : "0000");

    const cardCpf =
      vault?.subscriptionCardCpf ||
      (typeof privMeta.subscriptionCardCpf === "string" ? privMeta.subscriptionCardCpf : "");

    const primaryEmail =
      vault?.email ||
      user.primaryEmailAddress?.emailAddress ||
      "usuario@kriativa.app";

    if (!mpCustomerId && !mpCardTokenId) {
      return NextResponse.json(
        {
          error:
            "Nenhum cartão salvo encontrado para assinatura 1-Click. Realize primeiro a reserva de R$ 5,00 com cartão de crédito.",
        },
        { status: 400 }
      );
    }

    // Se temos mpCustomerId + mpCardId e precisamos renovar ou gerar token 1-Click
    if (mpCustomerId && mpCardId && (!mpCardTokenId || securityCode)) {
      try {
        const tokenPayload: Record<string, unknown> = {
          card_id: mpCardId,
          customer_id: mpCustomerId,
        };
        if (securityCode) {
          tokenPayload.security_code = securityCode;
        }
        const freshToken: any = await mpCardToken.create({
          body: tokenPayload as any,
        });
        if (freshToken?.id) {
          mpCardTokenId = String(freshToken.id);
        }
      } catch (err) {
        console.warn("Aviso ao renovar token a partir do cofre:", err);
      }
    }

    if (!mpCardTokenId) {
      return NextResponse.json(
        {
          error:
            "Token de 1-Click indisponível para este cartão. Confirme o código de segurança (CVV) para autenticar.",
          requiresCvv: true,
          cardLast4,
          cardBrand,
        },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kriativa.app";
    let preApprovalId: string | undefined;
    let subscriptionStatus = "authorized";

    try {
      // 1. Tenta criar a assinatura recorrente (PreApproval) no Mercado Pago com o card_token_id salvo
      const preApprovalRes: any = await mpPreApproval.create({
        body: {
          reason: "Assinatura Mensal Lote Fundador (R$ 50/mês) - Kriativa",
          external_reference: `sub_1click_${userId}`,
          payer_email: primaryEmail,
          card_token_id: mpCardTokenId,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 50,
            currency_id: "BRL",
          },
          back_url: `${appUrl}/pre-lancamento`,
          status: "authorized",
        },
      });

      preApprovalId = preApprovalRes?.id ? String(preApprovalRes.id) : undefined;
      subscriptionStatus = String(preApprovalRes?.status || "authorized");
    } catch (preApprovalErr: any) {
      // 2. Fallback 1-Click direto via Customer Vault do Mercado Pago
      if (!mpCustomerId) {
        throw preApprovalErr;
      }

      const paymentRes: any = await mpPayment.create({
        body: {
          transaction_amount: 50,
          token: mpCardTokenId,
          description: "Assinatura Mensal Lote Fundador (R$ 50/mês) - Kriativa",
          installments: 1,
          payment_method_id: cardBrand,
          payer: {
            type: "customer",
            id: mpCustomerId,
            email: primaryEmail,
            ...(cardCpf
              ? {
                  identification: {
                    type: "CPF",
                    number: cardCpf,
                  },
                }
              : {}),
          } as any,
          metadata: {
            user_id: userId,
            package_slug: "assinatura_fundador_50",
            one_click: true,
            card_last4: cardLast4,
            card_brand: cardBrand,
          },
        },
      });

      preApprovalId = paymentRes?.id ? `pay_${paymentRes.id}` : undefined;
      subscriptionStatus = String(paymentRes?.status || "approved");
    }

    if (preApprovalId) {
      await convex.mutation(api.preLaunch.saveUserOneClickSubscription, {
        clerkId: userId,
        secret: INTERNAL_SECRET,
        mpPreApprovalId: preApprovalId,
        mpCustomerId,
        mpCardId,
      });

      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...pubMeta,
            mpPreApprovalId: preApprovalId,
            oneClickSubscribedAt: Date.now(),
          },
        });
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      preApprovalId,
      status: subscriptionStatus,
      cardLast4,
      cardBrand,
    });
  } catch (error: any) {
    console.error("Erro ao processar assinatura 1-Click no Mercado Pago:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Não foi possível ativar a assinatura 1-Click com o cartão salvo.",
      },
      { status: 500 }
    );
  }
}
