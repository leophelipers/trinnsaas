import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  internalAction,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { assertFeatureFlag } from "./featureFlags";
import {
  DEFAULT_ADMIN_NOTIFICATION_EMAIL,
  resolveResendSenderCandidates,
  sendResendEmailWithFallback,
} from "./emails";

/**
 * Salva o progresso parcial ou a submissão completa do formulário de parceria
 */
export const saveLeadStep = mutation({
  args: {
    leadId: v.optional(v.id("infoprodutorLeads")),
    clientSessionId: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    revenueLast30Days: v.optional(v.string()),
    aiUsagePrimary: v.optional(v.string()),
    salesPlatform: v.optional(v.string()),
    additionalNotes: v.optional(v.string()),
    currentStep: v.number(),
    isComplete: v.optional(v.boolean()),
    userAgent: v.optional(v.string()),
    referer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Guarda de Feature Flag
    await assertFeatureFlag(
      ctx,
      "infoprodutor_partnership_page",
      "A recepção de aplicações de parceria está temporariamente pausada para manutenção."
    );

    const now = Date.now();
    let targetId: Id<"infoprodutorLeads"> | null = args.leadId || null;

    // 2. Busca por ID ou clientSessionId ou e-mail
    if (!targetId && args.clientSessionId) {
      const bySession = await ctx.db
        .query("infoprodutorLeads")
        .withIndex("by_clientSessionId", (q) =>
          q.eq("clientSessionId", args.clientSessionId)
        )
        .first();
      if (bySession) {
        targetId = bySession._id;
      }
    }

    if (!targetId && args.email) {
      const cleanEmail = args.email.trim().toLowerCase();
      const byEmail = await ctx.db
        .query("infoprodutorLeads")
        .withIndex("by_email", (q) => q.eq("email", cleanEmail))
        .first();
      if (byEmail) {
        targetId = byEmail._id;
      }
    }

    const isComplete = Boolean(args.isComplete);

    if (targetId) {
      const existing = await ctx.db.get(targetId);
      if (existing) {
        const patch: Record<string, unknown> = {
          currentStep: Math.max(existing.currentStep, args.currentStep),
          lastUpdatedAt: now,
        };

        if (args.name !== undefined && args.name.trim()) patch.name = args.name.trim();
        if (args.email !== undefined && args.email.trim()) patch.email = args.email.trim().toLowerCase();
        if (args.whatsapp !== undefined && args.whatsapp.trim()) patch.whatsapp = args.whatsapp.trim();
        if (args.revenueLast30Days !== undefined) patch.revenueLast30Days = args.revenueLast30Days;
        if (args.aiUsagePrimary !== undefined) patch.aiUsagePrimary = args.aiUsagePrimary;
        if (args.salesPlatform !== undefined) patch.salesPlatform = args.salesPlatform;
        if (args.additionalNotes !== undefined) patch.additionalNotes = args.additionalNotes;
        if (args.userAgent !== undefined) patch.userAgent = args.userAgent;
        if (args.referer !== undefined) patch.referer = args.referer;

        if (isComplete) {
          patch.status = "completed";
          if (!existing.submittedAt) {
            patch.submittedAt = now;
          }
        }

        await ctx.db.patch(targetId, patch);
      }
    } else {
      // Inserção de novo registro
      targetId = await ctx.db.insert("infoprodutorLeads", {
        name: args.name?.trim(),
        email: args.email?.trim().toLowerCase(),
        whatsapp: args.whatsapp?.trim(),
        revenueLast30Days: args.revenueLast30Days,
        aiUsagePrimary: args.aiUsagePrimary,
        salesPlatform: args.salesPlatform,
        additionalNotes: args.additionalNotes,
        status: isComplete ? "completed" : "partial",
        currentStep: args.currentStep,
        lastUpdatedAt: now,
        submittedAt: isComplete ? now : undefined,
        clientSessionId: args.clientSessionId,
        userAgent: args.userAgent,
        referer: args.referer,
      });
    }

    // 3. Se concluído, registrar no log do sistema e agendar despacho de e-mail para o administrador
    if (isComplete && targetId) {
      await ctx.db.insert("systemLogs", {
        level: "info",
        category: "system",
        message: `Aplicação de Infoprodutor Concluída: ${args.name || args.email || "Criador"}`,
        details: JSON.stringify({
          leadId: targetId,
          name: args.name,
          email: args.email,
          whatsapp: args.whatsapp,
          revenueLast30Days: args.revenueLast30Days,
          aiUsagePrimary: args.aiUsagePrimary,
          salesPlatform: args.salesPlatform,
        }),
        timestamp: now,
      });

      // Dispara envio do e-mail em background via action
      await ctx.scheduler.runAfter(
        0,
        internal.infoprodutor.notifyAdminCompletedLead,
        {
          leadId: targetId,
        }
      );
    }

    return {
      leadId: targetId,
      status: isComplete ? ("completed" as const) : ("partial" as const),
    };
  },
});

/**
 * Consulta interna do lead para uso no envio de e-mail
 */
export const getLeadInternal = internalQuery({
  args: {
    leadId: v.id("infoprodutorLeads"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.leadId);
  },
});

/**
 * Atualiza o status do e-mail no lead
 */
export const markLeadEmailNotifiedInternal = internalMutation({
  args: {
    leadId: v.id("infoprodutorLeads"),
    notifiedAt: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.leadId, {
      emailNotifiedAt: args.notifiedAt,
      emailNotificationStatus: args.status,
    });
  },
});

/**
 * Monta o HTML do e-mail administrativo com visual elegante Solar Cinema
 */
function buildInfoprodutorEmailHtml(params: {
  leadId: string;
  name: string;
  email: string;
  whatsapp: string;
  revenueLast30Days: string;
  aiUsagePrimary: string;
  salesPlatform: string;
  additionalNotes?: string;
  dateStr: string;
}) {
  const cleanPhone = params.whatsapp.replace(/\D/g, "");
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`}`
    : "#";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nova Aplicação de Parceria de Infoprodutor — Kriativa</title>
</head>
<body style="margin:0;padding:0;background-color:#050507;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050507;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background-color:#0c0c10;border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:32px 24px;">
          <tr>
            <td>
              <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#FF5500;margin-bottom:8px;font-weight:700;">
                KRIATIVA · COPRODUÇÃO & PARCERIAS DE INFOPRODUTOS
              </div>
              <h1 style="font-size:24px;line-height:1.2;color:#ffffff;margin:0 0 16px 0;font-weight:700;">
                🎯 Nova Aplicação de Parceria Recebida!
              </h1>
              <p style="font-size:15px;line-height:1.6;color:#d4d4d8;margin:0 0 24px 0;">
                Um infoprodutor concluiu o formulário de qualificação em <strong>/infoprodutor</strong> e aguarda o contato do time da Kriativa.
              </p>

              <!-- Card com os dados preenchidos -->
              <table width="100%" cellpadding="10" cellspacing="0" style="background-color:#14141b;border:1px solid rgba(255,85,0,0.3);border-radius:16px;margin-bottom:24px;font-size:14px;color:#f4f4f5;">
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="color:#a1a1aa;width:160px;font-weight:600;">Nome Completo:</td>
                  <td><strong style="color:#ffffff;font-size:15px;">${params.name}</strong></td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="color:#a1a1aa;font-weight:600;">E-mail:</td>
                  <td><a href="mailto:${params.email}" style="color:#00E5FF;text-decoration:none;">${params.email}</a></td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="color:#a1a1aa;font-weight:600;">WhatsApp:</td>
                  <td>
                    <span style="font-family:monospace;font-size:14px;color:#ffffff;font-weight:600;">${params.whatsapp}</span>
                    ${cleanPhone ? `&nbsp; · &nbsp;<a href="${waUrl}" target="_blank" style="color:#22c55e;font-weight:700;text-decoration:none;">Chamar no WhatsApp →</a>` : ""}
                  </td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="color:#a1a1aa;font-weight:600;">Faturamento (30 dias):</td>
                  <td><strong style="color:#22c55e;font-size:15px;">${params.revenueLast30Days}</strong></td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="color:#a1a1aa;font-weight:600;">Uso Principal de IA:</td>
                  <td style="color:#e4e4e7;">${params.aiUsagePrimary}</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="color:#a1a1aa;font-weight:600;">Plataforma de Venda:</td>
                  <td style="color:#e4e4e7;"><strong>${params.salesPlatform}</strong></td>
                </tr>
                ${
                  params.additionalNotes
                    ? `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="color:#a1a1aa;font-weight:600;">Observações / Link:</td>
                  <td style="color:#d4d4d8;">${params.additionalNotes}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="color:#a1a1aa;font-weight:600;">Data/Hora de Envio:</td>
                  <td style="color:#71717a;font-size:12px;">${params.dateStr} (Horário de Brasília)</td>
                </tr>
              </table>

              <!-- Ação Rápida de Resposta -->
              ${
                cleanPhone
                  ? `
              <div style="text-align:center;margin:24px 0;">
                <a href="${waUrl}" target="_blank" style="display:inline-block;background-color:#FF5500;color:#ffffff;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;padding:14px 28px;border-radius:12px;text-decoration:none;">
                  Iniciar Conversa no WhatsApp com ${params.name.split(" ")[0]} →
                </a>
              </div>
              `
                  : ""
              }

              <p style="font-size:12px;line-height:1.5;color:#71717a;text-align:center;margin:24px 0 0 0;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
                Lead ID: <code>${params.leadId}</code><br/>
                Kriativa · Inteligência artificial para quem cria o futuro.
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

/**
 * Action responsável por disparar o e-mail para leo.phe.rod@gmail.com
 */
export const notifyAdminCompletedLead = internalAction({
  args: {
    leadId: v.id("infoprodutorLeads"),
  },
  handler: async (ctx, args) => {
    // 1. Carrega dados do lead
    const lead = await ctx.runQuery(internal.infoprodutor.getLeadInternal, {
      leadId: args.leadId,
    });

    if (!lead) {
      console.warn(`[notifyAdminCompletedLead] Lead não encontrado: ${args.leadId}`);
      return;
    }

    // 2. Carrega configurações do e-mail
    const emailConfig: {
      resendApiKey?: string;
      adminNotificationEmail: string;
      whatsappGroupUrl: string;
      audienceSyncEnabled: boolean;
    } = await ctx.runQuery(internal.emails.getEmailConfigInternal, {});

    const adminEmail =
      emailConfig.adminNotificationEmail || DEFAULT_ADMIN_NOTIFICATION_EMAIL;

    const leadName = lead.name || "Infoprodutor";
    const leadEmail = lead.email || "Não informado";
    const leadWhatsapp = lead.whatsapp || "Não informado";
    const leadRevenue = lead.revenueLast30Days || "Não informado";
    const leadAiUsage = lead.aiUsagePrimary || "Não informado";
    const leadPlatform = lead.salesPlatform || "Não informado";

    const dateStr = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    const subject = `[Kriativa Parceria Infoprodutor] ${leadName} — ${leadRevenue} (${leadPlatform})`;

    const html = buildInfoprodutorEmailHtml({
      leadId: String(lead._id),
      name: leadName,
      email: leadEmail,
      whatsapp: leadWhatsapp,
      revenueLast30Days: leadRevenue,
      aiUsagePrimary: leadAiUsage,
      salesPlatform: leadPlatform,
      additionalNotes: lead.additionalNotes,
      dateStr,
    });

    let sent = false;
    let methodUsed = "none";
    const deliveryNotes: string[] = [];

    // 3. Tenta envio via Resend se a API Key estiver configurada
    if (emailConfig.resendApiKey) {
      const senderCandidates = await resolveResendSenderCandidates(
        emailConfig.resendApiKey,
        process.env.RESEND_FROM_EMAIL
      );

      const resendResult = await sendResendEmailWithFallback({
        resendKey: emailConfig.resendApiKey,
        senderCandidates,
        to: adminEmail,
        subject,
        html,
      });

      sent = resendResult.sent;
      deliveryNotes.push(...resendResult.notes);
      if (sent) {
        methodUsed = `resend (${resendResult.fromUsed || "default"})`;
      }
    } else {
      deliveryNotes.push("RESEND_API_KEY ausente ou não configurada");
    }

    // 4. Fallback com FormSubmit.co para garantir que o admin receba o lead mesmo sem Resend
    if (!sent) {
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
              _subject: subject,
              tipo: "Parceria de Infoprodutor (Coprodução)",
              nome: leadName,
              email: leadEmail,
              whatsapp: leadWhatsapp,
              faturamento_30d: leadRevenue,
              uso_principal_ia: leadAiUsage,
              plataforma_vendas: leadPlatform,
              observacoes: lead.additionalNotes || "N/A",
              lead_id: String(lead._id),
              data_envio: dateStr,
            }),
          }
        );

        if (formSubmitRes.ok) {
          sent = true;
          methodUsed = "formsubmit.co (fallback)";
          deliveryNotes.push(`Notificação enviada com sucesso via FormSubmit para ${adminEmail}`);
        } else {
          const errText = await formSubmitRes.text();
          deliveryNotes.push(`FormSubmit retornou status ${formSubmitRes.status}: ${errText}`);
        }
      } catch (err: unknown) {
        deliveryNotes.push(
          `Erro no fallback FormSubmit: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    // 5. Atualiza o registro do lead
    await ctx.runMutation(internal.infoprodutor.markLeadEmailNotifiedInternal, {
      leadId: lead._id,
      notifiedAt: Date.now(),
      status: sent ? `delivered via ${methodUsed}` : `failed: ${deliveryNotes.join("; ")}`,
    });

    // 6. Log no sistema para observabilidade
    await ctx.runMutation(internal.emails.markUserEmailFlagsInternal, {
      clerkId: "system_infoprodutor_partnership",
      email: lead.email,
      eventType: "infoprodutor_partnership_submitted",
      logMessage: sent
        ? `Notificação de parceria entregue para ${adminEmail} (${methodUsed})`
        : `Falha na notificação de parceria para ${adminEmail}`,
      logDetails: JSON.stringify({
        leadId: lead._id,
        name: leadName,
        email: leadEmail,
        revenue: leadRevenue,
        notes: deliveryNotes,
      }),
    });
  },
});

/**
 * Consulta para listagem administrativa de leads
 */
export const listInfoprodutorLeads = query({
  args: {
    status: v.optional(v.union(v.literal("partial"), v.literal("completed"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    if (args.status) {
      return await ctx.db
        .query("infoprodutorLeads")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("infoprodutorLeads")
      .withIndex("by_lastUpdatedAt")
      .order("desc")
      .take(limit);
  },
});
