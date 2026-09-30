import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { normalizeEmail } from "./utils/antiAbuseUtils";
import { assertFeatureFlag } from "./featureFlags";

/**
 * Ativa ou verifica a cota do plano gratuito para o usuário atual,
 * aplicando as validações antifraude (E-mail Canônico, E-mail Descartável e Device Fingerprint).
 */
export const claimFreePlan = mutation({
  args: {
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    // Verificação de Feature Flag
    await assertFeatureFlag(ctx, "welcome_bonus", "A concessão de cotas de boas-vindas está temporariamente pausada pela administração.");

    const email = identity.email ?? "";
    const norm = normalizeEmail(email);

    // 1. Barreira: E-mail temporário / descartável
    if (norm.isDisposable) {
      await ctx.db.insert("abuseLogs", {
        userId: identity.subject,
        email,
        canonicalEmail: norm.canonicalEmail,
        deviceId: args.deviceId,
        type: "disposable_email",
        details: `Domínio descartável barrado: ${norm.domain}`,
        timestamp: Date.now(),
      });

      const existingUserClaim = await ctx.db
        .query("freePlanClaims")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .unique();

      if (!existingUserClaim) {
        await ctx.db.insert("freePlanClaims", {
          userId: identity.subject,
          email,
          canonicalEmail: norm.canonicalEmail,
          deviceId: args.deviceId,
          status: "blocked",
          reason:
            "E-mails temporários ou descartáveis não são permitidos para ativação do plano gratuito.",
          claimedAt: Date.now(),
          tier: "free",
          creditsRemaining: 0,
          creditsTotal: 0,
        });
      }

      return {
        success: false,
        status: "blocked" as const,
        reason:
          "E-mails temporários ou descartáveis não são permitidos para ativação do plano gratuito. Por favor, utilize um e-mail válido.",
      };
    }

    // 2. Se o usuário já possui um claim registrado
    const userClaim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (userClaim) {
      if (userClaim.status === "active") {
        return {
          success: true,
          status: "active" as const,
          creditsRemaining: userClaim.creditsRemaining,
          creditsTotal: userClaim.creditsTotal,
          canonicalEmail: userClaim.canonicalEmail,
          claimedAt: userClaim.claimedAt,
        };
      } else {
        return {
          success: false,
          status: userClaim.status,
          reason: userClaim.reason || "Acesso ao plano gratuito restrito.",
        };
      }
    }

    // 3. Barreira: E-mail Canônico duplicado (truque de +tag ou pontos no Gmail)
    const existingCanonicalClaim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_canonicalEmail", (q) =>
        q.eq("canonicalEmail", norm.canonicalEmail)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (
      existingCanonicalClaim &&
      existingCanonicalClaim.userId !== identity.subject
    ) {
      await ctx.db.insert("abuseLogs", {
        userId: identity.subject,
        email,
        canonicalEmail: norm.canonicalEmail,
        deviceId: args.deviceId,
        type: "duplicate_canonical_email",
        details: `Tentativa de duplicar cota com alias de e-mail (${email}). Conta original: ${existingCanonicalClaim.email}`,
        timestamp: Date.now(),
      });

      await ctx.db.insert("freePlanClaims", {
        userId: identity.subject,
        email,
        canonicalEmail: norm.canonicalEmail,
        deviceId: args.deviceId,
        status: "blocked",
        reason:
          "Este e-mail ou uma variação com alias (+ ou pontos) já utilizou a cota gratuita nesta plataforma.",
        claimedAt: Date.now(),
        tier: "free",
        creditsRemaining: 0,
        creditsTotal: 0,
      });

      return {
        success: false,
        status: "blocked" as const,
        reason:
          "Este e-mail ou uma variação com alias (+ ou pontos) já utilizou a cota gratuita nesta plataforma.",
      };
    }

    // 4. Barreira: Device Fingerprint (mesmo hardware/navegador já usou o plano free)
    if (args.deviceId && args.deviceId !== "ssr_device") {
      const existingDeviceClaim = await ctx.db
        .query("freePlanClaims")
        .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();

      if (
        existingDeviceClaim &&
        existingDeviceClaim.userId !== identity.subject
      ) {
        await ctx.db.insert("abuseLogs", {
          userId: identity.subject,
          email,
          canonicalEmail: norm.canonicalEmail,
          deviceId: args.deviceId,
          type: "duplicate_device",
          details: `Dispositivo já associado à conta: ${existingDeviceClaim.email}`,
          timestamp: Date.now(),
        });

        await ctx.db.insert("freePlanClaims", {
          userId: identity.subject,
          email,
          canonicalEmail: norm.canonicalEmail,
          deviceId: args.deviceId,
          status: "blocked",
          reason:
            "Este dispositivo já ativou a cota do plano gratuito em outra conta.",
          claimedAt: Date.now(),
          tier: "free",
          creditsRemaining: 0,
          creditsTotal: 0,
        });

        return {
          success: false,
          status: "blocked" as const,
          reason:
            "Este dispositivo já ativou a cota do plano gratuito em outra conta.",
        };
      }
    }

    // 5. Sucesso: Todas as barreiras passaram! Concede a cota do plano gratuito.
    const initialCredits = 50;

    await ctx.db.insert("freePlanClaims", {
      userId: identity.subject,
      email,
      canonicalEmail: norm.canonicalEmail,
      deviceId: args.deviceId,
      status: "active",
      claimedAt: Date.now(),
      tier: "free",
      creditsRemaining: initialCredits,
      creditsTotal: initialCredits,
    });

    // Atualiza o canonicalEmail no registro do usuário em `users`
    const userDoc = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (userDoc) {
      await ctx.db.patch(userDoc._id, {
        canonicalEmail: norm.canonicalEmail,
      });
    }

    return {
      success: true,
      status: "active" as const,
      creditsRemaining: initialCredits,
      creditsTotal: initialCredits,
      canonicalEmail: norm.canonicalEmail,
      claimedAt: Date.now(),
    };
  },
});

/**
 * Consulta o status do plano e antifraude do usuário atual.
 */
export const getPlanStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const claim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!claim) {
      const norm = normalizeEmail(identity.email ?? "");
      return {
        hasClaim: false,
        status: "not_claimed" as const,
        email: identity.email ?? "",
        canonicalEmail: norm.canonicalEmail,
        isDisposable: norm.isDisposable,
        creditsRemaining: 0,
        creditsTotal: 0,
        reason: null,
      };
    }

    return {
      hasClaim: true,
      status: claim.status,
      email: claim.email,
      canonicalEmail: claim.canonicalEmail,
      deviceId: claim.deviceId,
      tier: claim.tier,
      creditsRemaining: claim.creditsRemaining,
      creditsTotal: claim.creditsTotal,
      claimedAt: claim.claimedAt,
      reason: claim.reason ?? null,
    };
  },
});

/**
 * Consome crédito de uso do plano gratuito de forma segura.
 */
export const consumeCredit = mutation({
  args: {
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const claim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!claim || claim.status !== "active") {
      throw new Error(
        claim?.reason || "Você não possui um plano gratuito ativo e verificado."
      );
    }

    const amount = args.amount ?? 1;
    if (claim.creditsRemaining < amount) {
      throw new Error(
        "Seus créditos do plano gratuito acabaram. Faça upgrade para continuar utilizando."
      );
    }

    const newCredits = claim.creditsRemaining - amount;
    await ctx.db.patch(claim._id, {
      creditsRemaining: newCredits,
    });

    return {
      creditsRemaining: newCredits,
      creditsTotal: claim.creditsTotal,
    };
  },
});

/**
 * Estatísticas globais do sistema antifraude (para monitoramento no dashboard).
 */
export const getAbuseStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const logs = await ctx.db
      .query("abuseLogs")
      .order("desc")
      .take(20);

    const totalBlocked = logs.length;
    const disposableCount = logs.filter(
      (l) => l.type === "disposable_email"
    ).length;
    const aliasCount = logs.filter(
      (l) => l.type === "duplicate_canonical_email"
    ).length;
    const deviceCount = logs.filter(
      (l) => l.type === "duplicate_device"
    ).length;

    return {
      totalBlocked,
      disposableCount,
      aliasCount,
      deviceCount,
      recentLogs: logs,
    };
  },
});
