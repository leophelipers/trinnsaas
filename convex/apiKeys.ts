import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { assertFeatureFlag } from "./featureFlags";

/**
 * Gera uma chave secreta de API criptograficamente segura com prefixo do estúdio
 */
function generateSecureKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const randomHex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `krt_live_${randomHex}`;
}

/**
 * Cria uma nova Chave de API para o criador autenticado
 */
export const createApiKey = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado. Faça login para gerenciar chaves de API.");
    }

    await assertFeatureFlag(
      ctx,
      "developer_api_enabled",
      "O acesso à API para Desenvolvedores está temporariamente em manutenção."
    );

    const cleanName = args.name.trim();
    if (!cleanName || cleanName.length > 50) {
      throw new Error("O nome da chave deve conter entre 1 e 50 caracteres.");
    }

    const userId = identity.subject;
    const now = Date.now();

    // Limite de segurança: máximo de 10 chaves ativas por criador
    const activeKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .collect();

    if (activeKeys.length >= 10) {
      throw new Error(
        "Limite de 10 chaves de API ativas atingido. Revogue uma chave antiga para criar uma nova."
      );
    }

    const fullKey = generateSecureKey();
    const keyPrefix = `${fullKey.slice(0, 16)}...`;

    const keyId = await ctx.db.insert("apiKeys", {
      userId,
      name: cleanName,
      key: fullKey,
      keyPrefix,
      status: "active",
      createdAt: now,
    });

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "developer_api",
      message: `Nova Chave de API criada: "${cleanName}" (${keyPrefix})`,
      details: JSON.stringify({
        keyId,
        userId,
        name: cleanName,
        keyPrefix,
      }),
      userId,
      timestamp: now,
    });

    return {
      success: true,
      id: keyId,
      key: fullKey,
      keyPrefix,
      name: cleanName,
      createdAt: now,
    };
  },
});

/**
 * Lista as chaves de API do usuário autenticado (ocultando a chave secreta completa)
 */
export const listMyApiKeys = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return keys.map((k) => ({
      _id: k._id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      status: k.status,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));
  },
});

/**
 * Revoga uma Chave de API pertencente ao criador
 */
export const revokeApiKey = mutation({
  args: {
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const apiKey = await ctx.db.get(args.keyId);
    if (!apiKey || apiKey.userId !== identity.subject) {
      throw new Error("Chave de API não encontrada ou sem permissão de acesso.");
    }

    if (apiKey.status === "revoked") {
      return { success: true };
    }

    const now = Date.now();
    await ctx.db.patch(apiKey._id, {
      status: "revoked",
    });

    await ctx.db.insert("systemLogs", {
      level: "warn",
      category: "developer_api",
      message: `Chave de API revogada: "${apiKey.name}" (${apiKey.keyPrefix})`,
      details: JSON.stringify({
        keyId: apiKey._id,
        userId: identity.subject,
        keyPrefix: apiKey.keyPrefix,
      }),
      userId: identity.subject,
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Validação interna de chave de API pelo Gateway HTTP (/api/v1/*)
 * Retorna dados de autenticação e saldo disponível para o consumo de tokens.
 */
export const validateApiKeyInternal = mutation({
  args: {
    key: v.string(),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const internalSecret =
      process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";

    if (args.secret && args.secret !== internalSecret) {
      return { valid: false, error: "Acesso de servidor não autorizado." };
    }

    const apiKeyDoc = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (!apiKeyDoc) {
      return { valid: false, error: "Chave de API inexistente ou incorreta." };
    }

    if (apiKeyDoc.status !== "active") {
      return { valid: false, error: "Esta Chave de API foi revogada." };
    }

    if (apiKeyDoc.expiresAt && apiKeyDoc.expiresAt < Date.now()) {
      await ctx.db.patch(apiKeyDoc._id, { status: "revoked" });
      return { valid: false, error: "Esta Chave de API expirou." };
    }

    const now = Date.now();
    // Atualiza data de último uso sem bloquear a requisição
    await ctx.db.patch(apiKeyDoc._id, {
      lastUsedAt: now,
    });

    // Busca usuário e saldos
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", apiKeyDoc.userId))
      .first();

    const balanceDoc = await ctx.db
      .query("creditBalances")
      .withIndex("by_userId", (q) => q.eq("userId", apiKeyDoc.userId))
      .first();

    const isUnlimited = Boolean(
      user?.role === "admin" || user?.unlimitedAiChat
    );

    const paidCredits = balanceDoc?.paidCredits ?? 0;
    const bonusCredits =
      balanceDoc?.bonusCredits ?? (user?.customCredits ?? 0);
    const totalCredits =
      balanceDoc?.totalCredits ?? paidCredits + bonusCredits;

    return {
      valid: true,
      userId: apiKeyDoc.userId,
      keyName: apiKeyDoc.name,
      userEmail: user?.email,
      userName: user?.name,
      role: user?.role || "user",
      isUnlimited,
      totalCredits,
      paidCredits,
      bonusCredits,
    };
  },
});
