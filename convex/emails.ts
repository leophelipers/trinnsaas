import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const DEFAULT_ADMIN_NOTIFICATION_EMAIL = "leo.phe.rod@gmail.com";
export const DEFAULT_WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/Hl24R2NuhRh7Iq4qU9ce4Y?s=cl&p=i&mlu=4&ilr=4&iam=0";

export const getEmailConfigInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("preLaunchSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_prelaunch_config"))
      .first();

    const rawUrl = doc?.whatsappGroupUrl;
    const whatsappGroupUrl =
      !rawUrl || rawUrl === "https://chat.whatsapp.com/kriativa-pre-lancamento-vip"
        ? DEFAULT_WHATSAPP_GROUP_URL
        : rawUrl;

    return {
      resendApiKey: doc?.resendApiKey || process.env.RESEND_API_KEY || undefined,
      adminNotificationEmail:
        doc?.adminNotificationEmail ||
        process.env.ADMIN_NOTIFICATION_EMAIL ||
        DEFAULT_ADMIN_NOTIFICATION_EMAIL,
      whatsappGroupUrl,
    };
  },
});

export const markUserEmailFlagsInternal = internalMutation({
  args: {
    clerkId: v.string(),
    welcomeEmailSent: v.optional(v.boolean()),
    adminNotifiedAt: v.optional(v.number()),
    logMessage: v.string(),
    logDetails: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      const patch: Record<string, unknown> = {};
      if (args.welcomeEmailSent !== undefined) {
        patch.welcomeEmailSent = args.welcomeEmailSent;
      }
      if (args.adminNotifiedAt !== undefined) {
        patch.adminNotifiedAt = args.adminNotifiedAt;
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(user._id, patch);
      }
    }

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "system",
      message: args.logMessage,
      details: args.logDetails,
      userId: args.clerkId,
      timestamp: Date.now(),
    });
  },
});

function buildVerificationCodeEmailHtml(params: {
  name: string;
  email: string;
  code: string;
}) {
  const firstName = params.name ? params.name.split(" ")[0] : "Criador";
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seu código de confirmação — Kriativa</title>
</head>
<body style="margin:0;padding:0;background-color:#050507;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050507;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:540px;background-color:#0c0c10;border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px 24px;">
          <tr>
            <td>
              <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#FF5500;margin-bottom:12px;font-weight:700;">
                KRIATIVA · BY TRINN · PASSO 01
              </div>
              <h1 style="font-size:24px;line-height:1.2;color:#ffffff;margin:0 0 14px 0;font-weight:700;">
                Seu código de confirmação de e-mail
              </h1>
              <p style="font-size:15px;line-height:1.6;color:#d4d4d8;margin:0 0 24px 0;">
                Olá, <strong>${firstName}</strong>! Digite o código de 6 dígitos abaixo na página de Pré-Lançamento da Kriativa para confirmar o seu e-mail (<strong>${params.email}</strong>):
              </p>

              <div style="background-color:#14141b;border:1px solid rgba(255,85,0,0.45);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#a1a1aa;margin-bottom:8px;">
                  CÓDIGO DE VERIFICAÇÃO
                </div>
                <div style="font-family:monospace;font-size:36px;font-weight:700;letter-spacing:0.3em;color:#ffffff;">
                  ${params.code}
                </div>
              </div>

              <p style="font-size:13px;line-height:1.5;color:#a1a1aa;margin:0 0 20px 0;">
                Este código é válido por 30 minutos. Assim que preenchê-lo na plataforma, seu Passo 1 será concluído e você poderá avançar para o Grupo Oficial do WhatsApp e para a reserva de lugar na fila.
              </p>

              <p style="font-size:12px;line-height:1.5;color:#71717a;text-align:center;margin:24px 0 0 0;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
                by trinn — Feito com amor no Brasil.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buildWelcomeEmailHtml(params: {
  name: string;
  email: string;
  whatsappGroupUrl: string;
}) {
  const firstName = params.name ? params.name.split(" ")[0] : "Criador";
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bem-vindo ao Pré-Lançamento — Kriativa</title>
</head>
<body style="margin:0;padding:0;background-color:#050507;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050507;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background-color:#0c0c10;border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px 24px;">
          <tr>
            <td>
              <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#FF5500;margin-bottom:12px;font-weight:700;">
                KRIATIVA · BY TRINN · PRÉ-LANÇAMENTO OFICIAL
              </div>
              <h1 style="font-size:26px;line-height:1.15;color:#ffffff;margin:0 0 16px 0;font-weight:700;">
                Pare de contar créditos.<br/>Comece a criar.
              </h1>
              <p style="font-size:15px;line-height:1.6;color:#d4d4d8;margin:0 0 24px 0;">
                Olá, <strong>${firstName}</strong>! Seu e-mail (<strong>${params.email}</strong>) está registrado na lista oficial de pré-lançamento da Kriativa (Kriativa Vision, Kriativa Motion, Kriativa Voice e Kriativa Mind).
              </p>

              <div style="background-color:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-bottom:24px;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.15em;color:#ffffff;font-weight:600;margin-bottom:12px;">
                  Seus 3 Passos no Pré-Lançamento:
                </div>
                <p style="font-size:14px;line-height:1.5;color:#e4e4e7;margin:0 0 10px 0;">
                  <strong>1. Confirmar seu e-mail com o código:</strong> Valide os 6 dígitos enviados para ${params.email}.
                </p>
                <p style="font-size:14px;line-height:1.5;color:#e4e4e7;margin:0 0 10px 0;">
                  <strong>2. Entrar no Grupo do WhatsApp:</strong> Acompanhe sua posição e o aviso de abertura das 50 vagas de R$ 50/mês (plano cheio estimado em R$ 500/mês).
                </p>
                <p style="font-size:14px;line-height:1.5;color:#e4e4e7;margin:0;">
                  <strong>3. Comprar um Lugar na Fila (Opcional — R$ 5,00 no Cartão):</strong> Os R$ 5,00 compram apenas um lugar prioritário na fila para o primeiro mês de R$ 50,00 (pagamento exclusivo via cartão de crédito, que será usado para a assinatura; não é convertido em créditos e não concede acesso imediato).
                </p>
              </div>

              <div style="text-align:center;margin:28px 0;">
                <a href="${params.whatsappGroupUrl}" target="_blank" style="display:inline-block;background-color:#FF5500;color:#ffffff;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;padding:14px 24px;border-radius:12px;text-decoration:none;">
                  Entrar no Grupo Oficial do WhatsApp →
                </a>
              </div>

              <p style="font-size:12px;line-height:1.5;color:#71717a;text-align:center;margin:24px 0 0 0;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
                by trinn — Feito com amor no Brasil.<br/>
                Este site não possui qualquer vínculo, afiliação, patrocínio ou endosso da Meta, Instagram, Facebook, Google ou outras plataformas mencionadas.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buildAdminNotificationHtml(params: {
  eventType:
    | "new_signup"
    | "verification_code"
    | "email_confirmed"
    | "queue_spot_paid";
  name: string;
  email: string;
  whatsapp?: string;
  clerkId: string;
  amountBrl?: number;
  verificationCode?: string;
}) {
  const titleMap = {
    new_signup: "Novo Cadastro no Pré-Lançamento Kriativa",
    verification_code: `Código de Verificação Gerado (${params.verificationCode || "------"})`,
    email_confirmed: "Usuário Confirmou E-mail com Código no Pré-Lançamento",
    queue_spot_paid: `Lugar na Fila Comprado via Cartão (R$ ${(params.amountBrl || 5).toFixed(2)})`,
  };
  const dateStr = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#09090b;color:#f4f4f5;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#121216;border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:24px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#FF5500;margin-bottom:8px;font-weight:700;">
      KRIATIVA · ALERTA AUTOMÁTICO DE PRÉ-LANÇAMENTO
    </div>
    <h2 style="margin:0 0 16px 0;color:#ffffff;font-size:20px;">
      ${titleMap[params.eventType]}
    </h2>
    <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#e4e4e7;border-top:1px solid rgba(255,255,255,0.08);">
      <tr>
        <td style="color:#a1a1aa;width:140px;">Nome:</td>
        <td><strong>${params.name || "Não informado"}</strong></td>
      </tr>
      <tr>
        <td style="color:#a1a1aa;">E-mail:</td>
        <td><strong>${params.email}</strong></td>
      </tr>
      ${
        params.verificationCode
          ? `<tr>
        <td style="color:#a1a1aa;">Código 6 Dígitos:</td>
        <td><strong style="font-family:monospace;font-size:18px;color:#FF5500;">${params.verificationCode}</strong></td>
      </tr>`
          : ""
      }
      <tr>
        <td style="color:#a1a1aa;">WhatsApp:</td>
        <td><strong>${params.whatsapp || "Não informado"}</strong></td>
      </tr>
      <tr>
        <td style="color:#a1a1aa;">Tag:</td>
        <td><code>pre_lancamento</code></td>
      </tr>
      <tr>
        <td style="color:#a1a1aa;">Clerk ID:</td>
        <td><code>${params.clerkId}</code></td>
      </tr>
      <tr>
        <td style="color:#a1a1aa;">Data/Hora (BRT):</td>
        <td>${dateStr}</td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}

export const sendPreLaunchEmails = internalAction({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    eventType: v.union(
      v.literal("new_signup"),
      v.literal("verification_code"),
      v.literal("email_confirmed"),
      v.literal("queue_spot_paid")
    ),
    amountBrl: v.optional(v.number()),
    verificationCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const config: {
      resendApiKey?: string;
      adminNotificationEmail: string;
      whatsappGroupUrl: string;
    } = await ctx.runQuery(internal.emails.getEmailConfigInternal, {});

    const adminEmail =
      config.adminNotificationEmail || DEFAULT_ADMIN_NOTIFICATION_EMAIL;
    const userName = args.name || args.email.split("@")[0] || "Criador";
    const resendKey = config.resendApiKey;
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "Kriativa <onboarding@resend.dev>";

    let welcomeSent = false;
    let codeSent = false;
    let adminSent = false;
    const deliveryNotes: string[] = [];

    // 1. Envio via Resend API (se RESEND_API_KEY estiver configurada)
    if (resendKey) {
      // 1A. Enviar Código de Verificação de 6 dígitos para o Usuário
      if (
        args.email &&
        args.eventType === "verification_code" &&
        args.verificationCode
      ) {
        try {
          const codeRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromAddress,
              to: [args.email],
              subject: `${args.verificationCode} é o seu código de confirmação — Kriativa`,
              html: buildVerificationCodeEmailHtml({
                name: userName,
                email: args.email,
                code: args.verificationCode,
              }),
            }),
          });
          if (codeRes.ok) {
            codeSent = true;
            deliveryNotes.push(
              `Verification code sent via Resend to ${args.email}`
            );
          } else {
            const errTxt = await codeRes.text();
            deliveryNotes.push(`Resend verification code error: ${errTxt}`);
          }
        } catch (err: any) {
          deliveryNotes.push(
            `Resend verification code exception: ${err?.message}`
          );
        }
      }

      // 1B. Enviar E-mail de Boas-Vindas para o Usuário (em new_signup ou email_confirmed)
      if (
        args.email &&
        (args.eventType === "new_signup" ||
          args.eventType === "email_confirmed")
      ) {
        try {
          const welcomeRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromAddress,
              to: [args.email],
              subject:
                "Bem-vindo ao Pré-Lançamento da Kriativa — Seus próximos passos",
              html: buildWelcomeEmailHtml({
                name: userName,
                email: args.email,
                whatsappGroupUrl: config.whatsappGroupUrl,
              }),
            }),
          });
          if (welcomeRes.ok) {
            welcomeSent = true;
            deliveryNotes.push(`Welcome email sent via Resend to ${args.email}`);
          } else {
            const errTxt = await welcomeRes.text();
            deliveryNotes.push(`Resend welcome error: ${errTxt}`);
          }
        } catch (err: any) {
          deliveryNotes.push(`Resend welcome exception: ${err?.message}`);
        }
      }

      // 1C. Enviar Aviso para leo.phe.rod@gmail.com via Resend
      try {
        const subjectMap = {
          new_signup: `[Kriativa Pré-Lançamento] Novo cadastro: ${userName} (${args.email})`,
          verification_code: `[Kriativa Código ${args.verificationCode}] Enviado para ${args.email}`,
          email_confirmed: `[Kriativa Pré-Lançamento] E-mail confirmado: ${userName} (${args.email})`,
          queue_spot_paid: `[Kriativa Fila R$5 Cartão] Reserva paga: ${userName} (${args.email})`,
        };

        const adminRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [adminEmail],
            subject: subjectMap[args.eventType],
            html: buildAdminNotificationHtml({
              eventType: args.eventType,
              name: userName,
              email: args.email,
              whatsapp: args.whatsapp,
              clerkId: args.clerkId,
              amountBrl: args.amountBrl,
              verificationCode: args.verificationCode,
            }),
          }),
        });

        if (adminRes.ok) {
          adminSent = true;
          deliveryNotes.push(`Admin alert sent via Resend to ${adminEmail}`);
        } else {
          const errTxt = await adminRes.text();
          deliveryNotes.push(`Resend admin error: ${errTxt}`);
        }
      } catch (err: any) {
        deliveryNotes.push(`Resend admin exception: ${err?.message}`);
      }
    }

    // 2. Fallback automático para envio do código ao usuário caso Resend ainda não esteja configurado
    if (
      args.eventType === "verification_code" &&
      args.verificationCode &&
      !codeSent &&
      args.email
    ) {
      try {
        const userFormSubmitRes = await fetch(
          `https://formsubmit.co/ajax/${encodeURIComponent(args.email)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              _subject: `${args.verificationCode} é seu código de confirmação — Kriativa Pré-Lançamento`,
              codigo_confirmacao: args.verificationCode,
              mensagem: `Olá ${userName}, digite o código ${args.verificationCode} na página de Pré-Lançamento da Kriativa para confirmar o seu e-mail.`,
            }),
          }
        );
        if (userFormSubmitRes.ok) {
          codeSent = true;
          deliveryNotes.push(
            `Verification code dispatched via FormSubmit to ${args.email}`
          );
        }
      } catch (err: any) {
        deliveryNotes.push(`User FormSubmit fallback: ${err?.message}`);
      }
    }

    // 3. Fallback automático para notificar leo.phe.rod@gmail.com
    if (!adminSent) {
      try {
        const formSubmitRes = await fetch(
          `https://formsubmit.co/ajax/${encodeURIComponent(adminEmail)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              _subject: `[Kriativa Pré-Lançamento] ${
                args.eventType === "queue_spot_paid"
                  ? "Reserva R$5 Cartão Paga"
                  : args.eventType === "verification_code"
                    ? `Código ${args.verificationCode} gerado`
                    : "Novo Usuário"
              }: ${args.email}`,
              evento: args.eventType,
              nome: userName,
              email: args.email,
              codigo_verificacao: args.verificationCode || "N/A",
              whatsapp: args.whatsapp || "Não informado",
              tag: "pre_lancamento",
              clerkId: args.clerkId,
              horario_brt: new Date().toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              }),
            }),
          }
        );
        if (formSubmitRes.ok) {
          adminSent = true;
          deliveryNotes.push(
            `Admin alert dispatched via FormSubmit to ${adminEmail}`
          );
        } else {
          deliveryNotes.push(`FormSubmit status: ${formSubmitRes.status}`);
        }
      } catch (err: any) {
        deliveryNotes.push(`FormSubmit fallback note: ${err?.message}`);
      }
    }

    await ctx.runMutation(internal.emails.markUserEmailFlagsInternal, {
      clerkId: args.clerkId,
      welcomeEmailSent: welcomeSent ? true : undefined,
      adminNotifiedAt: adminSent ? Date.now() : undefined,
      logMessage: `Notificação de Pré-Lançamento (${args.eventType}) para ${args.email} e aviso para ${adminEmail}`,
      logDetails: JSON.stringify({
        userEmail: args.email,
        userName,
        whatsapp: args.whatsapp,
        adminEmail,
        eventType: args.eventType,
        welcomeSent,
        codeSent,
        adminSent,
        deliveryNotes,
      }),
    });

    return {
      welcomeSent,
      codeSent,
      adminSent,
      adminEmail,
      deliveryNotes,
    };
  },
});
