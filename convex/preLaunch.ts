import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./admin";
import { assertFeatureFlag } from "./featureFlags";

export const DEFAULT_WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/Hl24R2NuhRh7Iq4qU9ce4Y?s=cl&p=i&mlu=4&ilr=4&iam=0";

export const DEFAULT_PRELAUNCH_SETTINGS = {
  key: "global_prelaunch_config",
  whatsappGroupUrl: DEFAULT_WHATSAPP_GROUP_URL,
  whatsappGroupTitle: "Grupo Oficial do Pré-Lançamento no WhatsApp",
  whatsappGroupDescription:
    "Entre no grupo oficial do pré-lançamento para acompanhar as novidades, sua posição na lista e o comunicado oficial de abertura das 50 primeiras vagas de R$ 50/mês.",
  skipQueue5Title: "Comprar um Lugar na Fila (R$ 5,00 no Cartão)",
  skipQueue5Subtitle:
    "Os R$ 5,00 compram apenas um lugar prioritário na fila para a condição do primeiro mês de R$ 50,00 (Os Primeiros 50). Pagamento exclusivo via cartão de crédito (o mesmo cartão será utilizado para a assinatura). Não é convertido em créditos e não dá acesso imediato.",
  skipQueue5CreditsBase: 0,
  skipQueue5CreditsBonus: 0,
  skipQueue10Title: "Lugar na Fila + Selo Fundador (R$ 10,00)",
  skipQueue10Subtitle:
    "Prioridade na fila para o lote de abertura + selo fundador na conta. Não é convertido em créditos e não dá acesso imediato.",
  skipQueue10CreditsBase: 0,
  skipQueue10CreditsBonus: 0,
  extraInfoBlocks: [
    {
      id: "primeiros_50",
      badge: "OS PRIMEIROS 50",
      title: "R$ 50/mês Enquanto Mantiver a Assinatura Ativa",
      description:
        "O plano de IA ilimitada terá preço cheio de R$ 500/mês, mas os primeiros 50 participantes que garantirem a condição pagarão apenas R$ 50/mês enquanto mantiverem a assinatura ativa.",
    },
    {
      id: "quatro_tipos_ia",
      badge: "UMA EXPERIÊNCIA INTEGRADA",
      title: "Kriativa Vision · Motion · Voice · Mind",
      description:
        "Kriativa Vision (Imagens), Kriativa Motion (Vídeos), Kriativa Voice (Áudio) e Kriativa Mind (Texto) reunidos em uma única assinatura sem contador de créditos.",
    },
    {
      id: "regra_transparente",
      badge: "TRANSPARÊNCIA TOTAL",
      title: "O que são os R$ 5,00 no Cartão?",
      description:
        "Os R$ 5,00 compram exclusivamente um lugar prioritário na fila para o primeiro mês de R$ 50,00. O pagamento é feito apenas por cartão de crédito pois usaremos o mesmo cartão para as assinaturas. Não é convertido em créditos e não concede acesso imediato.",
    },
  ],
};

function resolveWhatsappUrl(rawUrl?: string): string {
  if (
    !rawUrl ||
    rawUrl.trim() === "" ||
    rawUrl === "https://chat.whatsapp.com/kriativa-pre-lancamento-vip"
  ) {
    return DEFAULT_WHATSAPP_GROUP_URL;
  }
  return rawUrl;
}

/**
 * Consulta pública das configurações da Sala VIP de Pré-Lançamento
 */
export const getPublicPreLaunchSettings = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("preLaunchSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_prelaunch_config"))
      .first();

    if (!doc) {
      return DEFAULT_PRELAUNCH_SETTINGS;
    }

    return {
      key: doc.key,
      whatsappGroupUrl: resolveWhatsappUrl(doc.whatsappGroupUrl),
      whatsappGroupTitle: doc.whatsappGroupTitle,
      whatsappGroupDescription: doc.whatsappGroupDescription,
      skipQueue5Title: DEFAULT_PRELAUNCH_SETTINGS.skipQueue5Title,
      skipQueue5Subtitle: DEFAULT_PRELAUNCH_SETTINGS.skipQueue5Subtitle,
      skipQueue5CreditsBase: 0,
      skipQueue5CreditsBonus: 0,
      skipQueue10Title: DEFAULT_PRELAUNCH_SETTINGS.skipQueue10Title,
      skipQueue10Subtitle: DEFAULT_PRELAUNCH_SETTINGS.skipQueue10Subtitle,
      skipQueue10CreditsBase: 0,
      skipQueue10CreditsBonus: 0,
      extraInfoBlocks: DEFAULT_PRELAUNCH_SETTINGS.extraInfoBlocks,
      metaPixelId: doc.metaPixelId || "1126197216455519",
      metaCapiConfigured: true,
      metaTestEventCode: doc.metaTestEventCode,
    };
  },
});

/**
 * Consulta interna/servidor para obter as credenciais da Meta CAPI configuradas no banco
 */
export const getServerMetaConfig = query({
  args: {
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const internalSecret =
      process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";
    if (args.secret !== internalSecret) {
      return {
        metaPixelId: "1126197216455519",
        metaCapiAccessToken: undefined,
        metaTestEventCode: undefined,
      };
    }

    const doc = await ctx.db
      .query("preLaunchSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_prelaunch_config"))
      .first();

    return {
      metaPixelId: doc?.metaPixelId || "1126197216455519",
      metaCapiAccessToken: doc?.metaCapiAccessToken,
      metaTestEventCode: doc?.metaTestEventCode,
    };
  },
});

/**
 * Consulta o status completo do usuário logado na Sala de Pré-Lançamento
 */
export const getMyPreLaunchStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    const balance = await ctx.db
      .query("creditBalances")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    const settingsDoc = await ctx.db
      .query("preLaunchSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_prelaunch_config"))
      .first();

    const rawSettings = settingsDoc ?? DEFAULT_PRELAUNCH_SETTINGS;
    const settings = {
      ...rawSettings,
      whatsappGroupUrl: resolveWhatsappUrl(rawSettings.whatsappGroupUrl),
      skipQueue5Title: DEFAULT_PRELAUNCH_SETTINGS.skipQueue5Title,
      skipQueue5Subtitle: DEFAULT_PRELAUNCH_SETTINGS.skipQueue5Subtitle,
      skipQueue5CreditsBase: 0,
      skipQueue5CreditsBonus: 0,
      extraInfoBlocks: DEFAULT_PRELAUNCH_SETTINGS.extraInfoBlocks,
    };

    const tags = user?.tags ?? [];
    const hasPreLaunchTag =
      tags.includes("pre_lancamento") ||
      tags.includes("pré-lançamento") ||
      user?.isPreLaunch === true;

    const skipQueuePaid = Boolean(
      user?.skipQueuePaid || tags.includes("fura_fila_vip")
    );

    const paidCredits = balance?.paidCredits ?? 0;
    const bonusCredits = balance?.bonusCredits ?? (user?.customCredits ?? 0);
    const totalCredits = balance?.totalCredits ?? paidCredits + bonusCredits;

    return {
      userId: identity.subject,
      name: user?.name || identity.name || "",
      email: user?.email || identity.email || "",
      whatsapp: user?.whatsapp || "",
      role: user?.role || "user",
      tags,
      hasPreLaunchTag,
      emailConfirmed: Boolean(user?.emailConfirmed),
      emailConfirmedAt: user?.emailConfirmedAt,
      verificationCodeSent: Boolean(user?.emailVerificationSentAt),
      emailVerificationSentAt: user?.emailVerificationSentAt,
      welcomeEmailSent: Boolean(user?.welcomeEmailSent),
      whatsappGroupJoined: Boolean(user?.whatsappGroupJoined),
      whatsappGroupJoinedAt: user?.whatsappGroupJoinedAt,
      skipQueuePaid,
      skipQueueAmountBrl: user?.skipQueueAmountBrl ?? 0,
      skipQueuePaidAt: user?.skipQueuePaidAt,
      subscriptionCardLast4:
        user?.subscriptionCardLast4 || balance?.autoTopUpCardLast4 || undefined,
      subscriptionCardBrand:
        user?.subscriptionCardBrand || balance?.autoTopUpCardBrand || undefined,
      paidCredits,
      bonusCredits,
      totalCredits,
      settings,
    };
  },
});

/**
 * PASSO 1 (ETAPA A): Gera e envia um código numérico de 6 dígitos para o e-mail do usuário
 */
export const requestPreLaunchEmailCode = mutation({
  args: {},
  handler: async (ctx) => {
    await assertFeatureFlag(ctx, "pre_launch_mode");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    const now = Date.now();
    const email = user?.email || identity.email || "";
    const name = user?.name || identity.name || "Criador";
    const whatsapp = user?.whatsapp || undefined;

    if (!email) {
      throw new Error("Nenhum endereço de e-mail vinculado à sua conta.");
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = now + 30 * 60 * 1000; // 30 minutos

    if (user) {
      const updatedTags = Array.from(
        new Set([...(user.tags ?? []), "pre_lancamento"])
      );
      await ctx.db.patch(user._id, {
        emailVerificationCode: code,
        emailVerificationSentAt: now,
        emailVerificationExpiresAt: expiresAt,
        tags: updatedTags,
        isPreLaunch: true,
      });
    } else {
      await ctx.db.insert("users", {
        clerkId: identity.subject,
        email,
        name,
        whatsapp,
        role: "user",
        status: "active",
        tags: ["pre_lancamento"],
        isPreLaunch: true,
        emailVerificationCode: code,
        emailVerificationSentAt: now,
        emailVerificationExpiresAt: expiresAt,
      });
    }

    await ctx.scheduler.runAfter(0, internal.emails.sendPreLaunchEmails, {
      clerkId: identity.subject,
      email,
      name,
      whatsapp,
      eventType: "verification_code",
      verificationCode: code,
    });

    return {
      success: true,
      email,
      sentAt: now,
    };
  },
});

/**
 * PASSO 1 (ETAPA B): Valida o código de 6 dígitos preenchido pelo usuário na plataforma
 */
export const verifyPreLaunchEmailCode = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    await assertFeatureFlag(ctx, "pre_launch_mode");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("Usuário não encontrado. Solicite o envio do código primeiro.");
    }

    const cleanCode = args.code.replace(/\D/g, "").trim();
    if (cleanCode.length !== 6) {
      throw new Error("Digite o código completo de 6 dígitos enviado para o seu e-mail.");
    }

    if (!user.emailVerificationCode) {
      throw new Error("Nenhum código ativo encontrado. Clique em 'Enviar Código' para receber um novo.");
    }

    const now = Date.now();
    if (
      user.emailVerificationExpiresAt &&
      now > user.emailVerificationExpiresAt
    ) {
      throw new Error(
        "Este código expirou. Clique em 'Reenviar Código' para gerar um novo código de 6 dígitos."
      );
    }

    if (cleanCode !== user.emailVerificationCode) {
      throw new Error(
        "Código incorreto. Confira os 6 dígitos enviados para o seu e-mail e tente novamente."
      );
    }

    const email = user.email || identity.email || "";
    const name = user.name || identity.name || "Criador";
    const whatsapp = user.whatsapp || undefined;

    const updatedTags = Array.from(
      new Set([...(user.tags ?? []), "pre_lancamento"])
    );

    await ctx.db.patch(user._id, {
      emailConfirmed: true,
      emailConfirmedAt: user.emailConfirmedAt ?? now,
      emailVerificationCode: undefined,
      tags: updatedTags,
      isPreLaunch: true,
    });

    await ctx.scheduler.runAfter(0, internal.emails.sendPreLaunchEmails, {
      clerkId: identity.subject,
      email,
      name,
      whatsapp,
      eventType: "email_confirmed",
    });

    return {
      success: true,
      email,
      confirmedAt: now,
    };
  },
});

/**
 * Compatibilidade: Confirma o e-mail do usuário na Sala de Pré-Lançamento
 */
export const confirmPreLaunchEmail = mutation({
  args: {
    name: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertFeatureFlag(ctx, "pre_launch_mode");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    const now = Date.now();
    const email = user?.email || identity.email || "";
    const name = args.name?.trim() || user?.name || identity.name || "Criador";
    const whatsapp = args.whatsapp?.trim() || user?.whatsapp || undefined;

    if (user) {
      const updatedTags = Array.from(
        new Set([...(user.tags ?? []), "pre_lancamento"])
      );
      await ctx.db.patch(user._id, {
        emailConfirmed: true,
        emailConfirmedAt: user.emailConfirmedAt ?? now,
        name,
        whatsapp,
        tags: updatedTags,
        isPreLaunch: true,
      });
    } else {
      await ctx.db.insert("users", {
        clerkId: identity.subject,
        email,
        name,
        whatsapp,
        role: "user",
        status: "active",
        tags: ["pre_lancamento"],
        isPreLaunch: true,
        emailConfirmed: true,
        emailConfirmedAt: now,
        adminNotifiedAt: now,
      });
    }

    await ctx.scheduler.runAfter(0, internal.emails.sendPreLaunchEmails, {
      clerkId: identity.subject,
      email,
      name,
      whatsapp,
      eventType: "email_confirmed",
    });

    return {
      success: true,
      email,
      confirmedAt: now,
    };
  },
});

/**
 * PASSO 2: Registra que o usuário clicou para entrar no Grupo Oficial do WhatsApp
 */
export const markWhatsappGroupJoined = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    const now = Date.now();
    if (user) {
      await ctx.db.patch(user._id, {
        whatsappGroupJoined: true,
        whatsappGroupJoinedAt: user.whatsappGroupJoinedAt ?? now,
      });
    }

    return { success: true };
  },
});

/**
 * Permite ao Administrador atualizar o link do WhatsApp, Resend API Key e configurações do Pré-Lançamento
 */
export const updatePreLaunchSettings = mutation({
  args: {
    whatsappGroupUrl: v.string(),
    whatsappGroupTitle: v.optional(v.string()),
    whatsappGroupDescription: v.optional(v.string()),
    metaPixelId: v.optional(v.string()),
    metaCapiAccessToken: v.optional(v.string()),
    metaTestEventCode: v.optional(v.string()),
    resendApiKey: v.optional(v.string()),
    adminNotificationEmail: v.optional(v.string()),
    extraInfoBlocks: v.optional(
      v.array(
        v.object({
          id: v.string(),
          badge: v.string(),
          title: v.string(),
          description: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { user, identity } = await requireAdmin(ctx);
    const now = Date.now();
    const adminIdentifier = user.email || identity.email || "admin";

    const existing = await ctx.db
      .query("preLaunchSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_prelaunch_config"))
      .first();

    const payload = {
      key: "global_prelaunch_config",
      whatsappGroupUrl: args.whatsappGroupUrl.trim() || DEFAULT_WHATSAPP_GROUP_URL,
      whatsappGroupTitle:
        args.whatsappGroupTitle?.trim() ||
        existing?.whatsappGroupTitle ||
        DEFAULT_PRELAUNCH_SETTINGS.whatsappGroupTitle,
      whatsappGroupDescription:
        args.whatsappGroupDescription?.trim() ||
        existing?.whatsappGroupDescription ||
        DEFAULT_PRELAUNCH_SETTINGS.whatsappGroupDescription,
      skipQueue5Title: DEFAULT_PRELAUNCH_SETTINGS.skipQueue5Title,
      skipQueue5Subtitle: DEFAULT_PRELAUNCH_SETTINGS.skipQueue5Subtitle,
      skipQueue5CreditsBase: 0,
      skipQueue5CreditsBonus: 0,
      skipQueue10Title: DEFAULT_PRELAUNCH_SETTINGS.skipQueue10Title,
      skipQueue10Subtitle: DEFAULT_PRELAUNCH_SETTINGS.skipQueue10Subtitle,
      skipQueue10CreditsBase: 0,
      skipQueue10CreditsBonus: 0,
      extraInfoBlocks:
        args.extraInfoBlocks ??
        DEFAULT_PRELAUNCH_SETTINGS.extraInfoBlocks,
      metaPixelId:
        args.metaPixelId !== undefined
          ? args.metaPixelId.trim() || "1126197216455519"
          : existing?.metaPixelId || "1126197216455519",
      metaCapiAccessToken:
        args.metaCapiAccessToken !== undefined
          ? args.metaCapiAccessToken.trim() || undefined
          : existing?.metaCapiAccessToken,
      metaTestEventCode:
        args.metaTestEventCode !== undefined
          ? args.metaTestEventCode.trim() || undefined
          : existing?.metaTestEventCode,
      resendApiKey:
        args.resendApiKey !== undefined
          ? args.resendApiKey.trim() || undefined
          : existing?.resendApiKey,
      adminNotificationEmail:
        args.adminNotificationEmail !== undefined
          ? args.adminNotificationEmail.trim() || "leo.phe.rod@gmail.com"
          : existing?.adminNotificationEmail || "leo.phe.rod@gmail.com",
      updatedAt: now,
      updatedBy: adminIdentifier,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("preLaunchSettings", payload);
    }

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "system",
      message: `Configurações da Sala de Pré-Lançamento atualizadas por ${adminIdentifier}`,
      details: JSON.stringify({
        whatsappGroupUrl: payload.whatsappGroupUrl,
        adminNotificationEmail: payload.adminNotificationEmail,
      }),
      userId: identity.subject,
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Permite ao Administrador alternar a tag 'pre_lancamento' de um usuário
 */
export const toggleUserPreLaunchTag = mutation({
  args: {
    userId: v.id("users"),
    enablePreLaunch: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { user: adminUser, identity } = await requireAdmin(ctx);
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Usuário não encontrado.");
    }

    const currentTags = (targetUser.tags ?? []).filter(
      (t) => t !== "pre_lancamento" && t !== "pré-lançamento"
    );

    const updatedTags = args.enablePreLaunch
      ? [...currentTags, "pre_lancamento"]
      : currentTags;

    await ctx.db.patch(targetUser._id, {
      tags: updatedTags,
      isPreLaunch: args.enablePreLaunch,
    });

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "users",
      message: `Tag 'pre_lancamento' ${args.enablePreLaunch ? "APLICADA a" : "REMOVIDA de"} ${targetUser.email} por ${adminUser.email}`,
      details: JSON.stringify({
        targetUserId: targetUser._id,
        enablePreLaunch: args.enablePreLaunch,
        updatedTags,
      }),
      userId: identity.subject,
      timestamp: Date.now(),
    });

    return { success: true, tags: updatedTags, isPreLaunch: args.enablePreLaunch };
  },
});
