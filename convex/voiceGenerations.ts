import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { assertFeatureFlag, isFeatureFlagActive } from "./featureFlags";

/**
 * Consulta a lista de gerações de voz e transcrições do usuário autenticado
 */
export const listMyVoiceGenerations = query({
  args: {
    type: v.optional(v.union(v.literal("tts"), v.literal("transcribe"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const clerkId = identity.subject;

    let items = await ctx.db
      .query("voiceGenerations")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .order("desc")
      .take(50);

    if (args.type) {
      items = items.filter((i) => i.type === args.type);
    }

    // Resolve URLs do Convex Storage dinamicamente
    return await Promise.all(
      items.map(async (item) => {
        let url = item.outputUrl;
        if (item.outputStorageId) {
          const freshUrl = await ctx.storage.getUrl(item.outputStorageId);
          if (freshUrl) {
            url = freshUrl;
          }
        }
        return {
          ...item,
          outputUrl: url,
        };
      })
    );
  },
});

/**
 * Cria um novo pedido de geração de voz ou transcrição
 */
export const createVoiceGeneration = mutation({
  args: {
    type: v.union(v.literal("tts"), v.literal("transcribe")),
    tier: v.union(v.literal("swift"), v.literal("pro"), v.literal("transcribe")),
    text: v.string(),
    voiceId: v.string(),
    voiceName: v.string(),
    audioLanguage: v.optional(v.string()),
    projectId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado. Faça login para gerar áudio.");
    }

    await assertFeatureFlag(
      ctx,
      "voice_generation_enabled",
      "O motor Kriativa Voice está temporariamente em manutenção pela administração."
    );

    const clerkId = identity.subject;
    const userDoc = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    const isStudioUnlimitedFeatureActive = await isFeatureFlagActive(
      ctx,
      "studio_unlimited_mode"
    );

    const isAdmin = userDoc?.role === "admin";
    const isUnlimited = Boolean(
      (userDoc?.unlimitedStudio ||
        userDoc?.unlimitedPlanActive ||
        userDoc?.unlimitedAiChat ||
        isAdmin) &&
      isStudioUnlimitedFeatureActive
    );

    const baseCost = args.tier === "pro" ? 2 : 1;
    let requiredCredits = isUnlimited ? 0 : baseCost;

    if (!isUnlimited) {
      const balanceDoc = await ctx.db
        .query("creditBalances")
        .withIndex("by_userId", (q) => q.eq("userId", clerkId))
        .first();

      const totalCredits = balanceDoc?.totalCredits ?? (userDoc?.customCredits ?? 0);
      if (totalCredits < requiredCredits) {
        throw new Error(
          `Saldo insuficiente. Você possui ${totalCredits} créditos e esta geração requer ${requiredCredits} crédito(s).`
        );
      }

      // Debita créditos
      const now = Date.now();
      const newTotal = Math.max(0, totalCredits - requiredCredits);

      if (balanceDoc) {
        await ctx.db.patch(balanceDoc._id, {
          totalCredits: newTotal,
          paidCredits: Math.max(0, (balanceDoc.paidCredits || 0) - requiredCredits),
          updatedAt: now,
        });
      }

      if (userDoc) {
        await ctx.db.patch(userDoc._id, { customCredits: newTotal });
      }

      await ctx.db.insert("creditTransactions", {
        userId: clerkId,
        amount: -requiredCredits,
        balanceAfter: newTotal,
        creditType: "mixed",
        type: "generation_spend",
        description: `Locução Kriativa Voice (${args.voiceName})`,
        timestamp: now,
      });
    }

    const now = Date.now();
    const generationId = await ctx.db.insert("voiceGenerations", {
      userId: clerkId,
      projectId: args.projectId,
      type: args.type,
      tier: args.tier,
      text: args.text,
      voiceId: args.voiceId,
      voiceName: args.voiceName,
      audioLanguage: args.audioLanguage || "pt-BR",
      creditsCharged: requiredCredits,
      status: "processing",
      createdAt: now,
    });

    return {
      success: true,
      generationId,
      creditsCharged: requiredCredits,
      isUnlimited,
    };
  },
});

/**
 * Conclui uma geração de voz ou transcrição (Server-side)
 */
export const completeVoiceGeneration = mutation({
  args: {
    generationId: v.id("voiceGenerations"),
    outputStorageId: v.optional(v.id("_storage")),
    outputUrl: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const internalSecret =
      process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";

    if (args.secret && args.secret !== internalSecret) {
      throw new Error("Acesso de servidor não autorizado.");
    }

    const gen = await ctx.db.get(args.generationId);
    if (!gen) {
      throw new Error("Geração de áudio não encontrada.");
    }

    await ctx.db.patch(gen._id, {
      outputStorageId: args.outputStorageId,
      outputUrl: args.outputUrl,
      durationSeconds: args.durationSeconds,
      status: "completed",
    });

    return { success: true };
  },
});

/**
 * Registra falha na geração de voz e estorna créditos se aplicável
 */
export const failVoiceGeneration = mutation({
  args: {
    generationId: v.id("voiceGenerations"),
    errorMessage: v.string(),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const internalSecret =
      process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";

    if (args.secret && args.secret !== internalSecret) {
      throw new Error("Acesso de servidor não autorizado.");
    }

    const gen = await ctx.db.get(args.generationId);
    if (!gen) return { success: false };

    await ctx.db.patch(gen._id, {
      status: "failed",
      errorMessage: args.errorMessage,
    });

    // Se houve cobrança de créditos, estorna
    if (gen.creditsCharged > 0) {
      const balanceDoc = await ctx.db
        .query("creditBalances")
        .withIndex("by_userId", (q) => q.eq("userId", gen.userId))
        .first();

      if (balanceDoc) {
        const newTotal = balanceDoc.totalCredits + gen.creditsCharged;
        await ctx.db.patch(balanceDoc._id, {
          totalCredits: newTotal,
          bonusCredits: balanceDoc.bonusCredits + gen.creditsCharged,
          updatedAt: Date.now(),
        });

        await ctx.db.insert("creditTransactions", {
          userId: gen.userId,
          amount: gen.creditsCharged,
          balanceAfter: newTotal,
          creditType: "bonus",
          type: "refund",
          description: `Estorno automático por falha no Kriativa Voice: ${args.errorMessage}`,
          timestamp: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

/**
 * Gera URL de upload para envio de arquivos de áudio para o Convex Storage
 */
export const generateAudioUploadUrl = mutation({
  args: {
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const internalSecret =
      process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";
    const identity = await ctx.auth.getUserIdentity();

    if (!identity && args.secret !== internalSecret) {
      throw new Error("Acesso não autorizado.");
    }

    return await ctx.storage.generateUploadUrl();
  },
});
