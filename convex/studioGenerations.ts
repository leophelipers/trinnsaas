import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { assertFeatureFlag, isFeatureFlagActive } from "./featureFlags";

/**
 * Consulta a lista reativa de gerações do criador autenticado
 */
export const listMyGenerations = query({
  args: {
    type: v.optional(v.union(v.literal("image"), v.literal("video"))),
    projectId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const maxItems = args.limit || 50;

    let rawItems = [];
    if (args.projectId) {
      rawItems = await ctx.db
        .query("studioGenerations")
        .withIndex("by_userId_project", (q) =>
          q.eq("userId", identity.subject).eq("projectId", args.projectId)
        )
        .order("desc")
        .take(maxItems);
      if (args.type) {
        rawItems = rawItems.filter((g) => g.type === args.type);
      }
    } else if (args.type) {
      rawItems = await ctx.db
        .query("studioGenerations")
        .withIndex("by_userId_type", (q) =>
          q.eq("userId", identity.subject).eq("type", args.type!)
        )
        .order("desc")
        .take(maxItems);
    } else {
      rawItems = await ctx.db
        .query("studioGenerations")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .order("desc")
        .take(maxItems);
    }

    // Resolve URLs do Convex Storage dinamicamente para garantir que nunca expirem
    return await Promise.all(
      rawItems.map(async (gen) => {
        let url = gen.outputUrl;
        if (gen.outputStorageId) {
          const freshUrl = await ctx.storage.getUrl(gen.outputStorageId);
          if (freshUrl) {
            url = freshUrl;
          }
        }
        return {
          ...gen,
          outputUrl: url,
        };
      })
    );
  },
});

/**
 * Consulta o estado em tempo real de uma geração específica (para streaming reativo)
 */
export const getGeneration = query({
  args: {
    id: v.id("studioGenerations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const gen = await ctx.db.get(args.id);
    if (!gen || gen.userId !== identity.subject) {
      return null;
    }

    let url = gen.outputUrl;
    if (gen.outputStorageId) {
      const freshUrl = await ctx.storage.getUrl(gen.outputStorageId);
      if (freshUrl) {
        url = freshUrl;
      }
    }

    return {
      ...gen,
      outputUrl: url,
    };
  },
});

/**
 * Consulta a tabela dinâmica de precificação dos motores de estúdio
 */
export const getStudioPricing = query({
  args: {},
  handler: async (ctx) => {
    const workflows = await ctx.db
      .query("workflowPricing")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    return workflows;
  },
});

/**
 * Resolve a URL pública de um arquivo armazenado no Convex Storage
 */
export const getStorageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Gera URL assinada para upload de imagens de referência (I2V) no Convex Storage
 */
export const generateUploadUrl = mutation({
  args: {
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const internalSecret = process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";
    const identity = await ctx.auth.getUserIdentity();
    const isAuthorized = Boolean(identity || (args.secret && args.secret === internalSecret));
    if (!isAuthorized) {
      throw new Error("Não autenticado.");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Tabela de custos em créditos baseada no tempo médio real de Cold Start do RunPod
 * para proteger o caixa e a margem de contribuição da plataforma.
 */
export function calculateRequiredCredits(
  engine: string,
  durationSeconds?: number,
  batchCount: number = 1
): number {
  let base = 2; // Imagem Krea-2 Turbo padrão (cobre cold start médio de ~15-20s)

  if (engine === "krea2_turbo") {
    base = 2;
  } else if (engine === "fasth3_i2v" || engine === "fasth3_t2v_480p") {
    // FastH3 i2v / 480p (Cold start médio de ~45s: 6 créditos base)
    const dur = durationSeconds || 3;
    if (dur <= 3) base = 6;
    else if (dur <= 5) base = 8;
    else if (dur <= 10) base = 14;
    else base = 20;
  } else if (engine === "fasth3_t2v_720p") {
    // FastH3 720p HD (Cold start médio de ~108s: 14 créditos base)
    const dur = durationSeconds || 3;
    if (dur <= 3) base = 14;
    else if (dur <= 5) base = 18;
    else if (dur <= 10) base = 26;
    else base = 34;
  } else if (engine === "ltx25_i2v") {
    // LTX-2.5 Distilled HD 22B Transformer (Cold start médio de ~218s: 30 créditos base)
    const dur = durationSeconds || 5;
    if (dur <= 5) base = 30;
    else if (dur <= 10) base = 42;
    else base = 55;
  } else if (engine === "seedance25_t2v") {
    // Seedance 2.5 Cinema Master via Higgsfield API (20 créditos para 5s)
    const dur = durationSeconds || 5;
    if (dur <= 5) base = 20;
    else if (dur <= 10) base = 35;
    else base = 50;
  }

  return base * Math.max(1, batchCount);
}

/**
 * Cria o registro inicial da geração no Convex com retenção de créditos em escrow
 */
export const createGeneration = mutation({
  args: {
    projectId: v.optional(v.string()),
    type: v.union(v.literal("image"), v.literal("video")),
    mode: v.union(
      v.literal("text_to_image"),
      v.literal("image_to_video"),
      v.literal("text_to_video"),
      v.literal("image_to_video_morph")
    ),
    uiModeUsed: v.union(v.literal("express"), v.literal("pro")),
    engine: v.union(
      v.literal("krea2_turbo"),
      v.literal("fasth3_i2v"),
      v.literal("fasth3_t2v_480p"),
      v.literal("fasth3_t2v_720p"),
      v.literal("ltx25_i2v"),
      v.literal("seedance25_t2v")
    ),
    provider: v.optional(v.union(v.literal("runpod"), v.literal("higgsfield"))),
    endpointId: v.string(),
    prompt: v.string(),
    negativePrompt: v.optional(v.string()),
    audioPrompt: v.optional(v.string()),
    seed: v.number(),
    aspectRatio: v.string(),
    width: v.number(),
    height: v.number(),
    durationSeconds: v.optional(v.number()),
    fps: v.optional(v.number()),
    steps: v.optional(v.number()),
    cfgScale: v.optional(v.number()),
    loraConfig: v.optional(
      v.object({
        name: v.string(),
        strengthModel: v.number(),
        strengthClip: v.number(),
      })
    ),
    inputImageStorageId: v.optional(v.id("_storage")),
    inputImageUrl: v.optional(v.string()),
    lastFrameStorageId: v.optional(v.id("_storage")),
    lastFrameUrl: v.optional(v.string()),
    elementTagsUsed: v.optional(v.array(v.string())),
    cameraMotion: v.optional(v.string()),
    lens: v.optional(v.string()),
    lighting: v.optional(v.string()),
    framing: v.optional(v.string()),
    batchCount: v.optional(v.number()),
    quality: v.optional(v.string()),
    creditsCharged: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    const clerkId = identity.subject;

    // 1. Verificação de Feature Flags
    await assertFeatureFlag(
      ctx,
      "studio_generation_hub",
      "O console de geração visual está temporariamente em manutenção."
    );

    if (args.engine === "krea2_turbo") {
      await assertFeatureFlag(ctx, "studio_engine_krea2", "O motor Krea-2 Turbo está temporariamente pausado.");
    } else if (args.engine === "fasth3_i2v") {
      await assertFeatureFlag(ctx, "studio_engine_fasth3_i2v", "A animação de imagem com áudio está temporariamente desativada.");
    } else if (args.engine === "fasth3_t2v_480p" || args.engine === "fasth3_t2v_720p") {
      await assertFeatureFlag(ctx, "studio_engine_fasth3_t2v", "A síntese de vídeo a partir de texto está temporariamente desativada.");
    } else if (args.engine === "ltx25_i2v") {
      await assertFeatureFlag(ctx, "studio_engine_ltx25", "O motor cinemático LTX-2.5 está temporariamente pausado para manutenção.");
    } else if (args.engine === "seedance25_t2v") {
      await assertFeatureFlag(ctx, "studio_engine_seedance25", "O motor Seedance 2.5 está temporariamente desativado.");
    }

    // 2. Trava de Proteção de Caixa (Paid Credit Gate / Anti-Drain Shield)
    const allowBonusCredits = await isFeatureFlagActive(ctx, "studio_allow_bonus_credits_video");
    const isHeavyEngine = args.engine === "ltx25_i2v" || (args.durationSeconds && args.durationSeconds > 3.0);

    const userDoc = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    const isAdmin = userDoc?.role === "admin";
    const isUnlimited = Boolean(userDoc?.unlimitedAiChat);

    let balanceDoc = await ctx.db
      .query("creditBalances")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .first();

    const claim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .first();

    const paidCredits = balanceDoc?.paidCredits ?? 0;
    const bonusCredits = balanceDoc?.bonusCredits ?? (userDoc?.customCredits ?? claim?.creditsRemaining ?? 50);
    const totalCredits = balanceDoc?.totalCredits ?? (paidCredits + bonusCredits);

    if (!allowBonusCredits && isHeavyEngine && !isAdmin && !isUnlimited) {
      if (paidCredits <= 0) {
        throw new Error(
          "Este motor cinematográfico de alta fidelidade requer a ativação do seu Estúdio com saldo de créditos pagos (ao menos 1 crédito pago ativo)."
        );
      }
    }

    // 3. Verificação de Saldo Suficiente com Garantia de Cobrança Baseada em WorkflowPricing
    let workflowPricingDoc = await ctx.db
      .query("workflowPricing")
      .withIndex("by_slug", (q) => q.eq("slug", args.engine))
      .first();

    if (!workflowPricingDoc) {
      const altSlug = args.engine.replace(/_/g, "-");
      workflowPricingDoc = await ctx.db
        .query("workflowPricing")
        .withIndex("by_slug", (q) => q.eq("slug", altSlug))
        .first();
    }

    let requiredCredits = args.creditsCharged;
    if (workflowPricingDoc && workflowPricingDoc.isActive) {
      let base = workflowPricingDoc.creditsCharged;
      if (args.type === "video" && args.durationSeconds) {
        const baseSeconds = args.engine === "ltx25_i2v" ? 5 : 3;
        if (args.durationSeconds > baseSeconds) {
          const durationRatio = args.durationSeconds / baseSeconds;
          base = Math.ceil(base * durationRatio);
        }
      }
      const batch = Math.max(1, args.batchCount || 1);
      requiredCredits = Math.max(args.creditsCharged, base * batch);
    } else {
      const minimumSafeCredits = calculateRequiredCredits(
        args.engine,
        args.durationSeconds,
        args.batchCount || 1
      );
      requiredCredits = Math.max(args.creditsCharged, minimumSafeCredits);
    }

    if (totalCredits < requiredCredits) {
      throw new Error(`Saldo insuficiente. Você possui ${totalCredits} créditos e esta geração requer ${requiredCredits} créditos.`);
    }

    // 4. Retenção Atômica de Créditos (Escrow) - Sempre debita para garantir integridade contábil
    let newPaid = paidCredits;
    let newBonus = bonusCredits;
    let deductedAmount = 0;

    if (requiredCredits > 0) {
      let remaining = requiredCredits;
      if (newBonus >= remaining) {
        newBonus -= remaining;
        remaining = 0;
      } else {
        remaining -= newBonus;
        newBonus = 0;
        newPaid = Math.max(0, newPaid - remaining);
      }
      deductedAmount = requiredCredits;
      const newTotal = newPaid + newBonus;

      const now = Date.now();
      if (balanceDoc) {
        await ctx.db.patch(balanceDoc._id, {
          paidCredits: newPaid,
          bonusCredits: newBonus,
          totalCredits: newTotal,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("creditBalances", {
          userId: clerkId,
          paidCredits: newPaid,
          bonusCredits: newBonus,
          totalCredits: newTotal,
          minBalanceEligible: newTotal >= 20,
          updatedAt: now,
        });
      }

      if (userDoc) {
        await ctx.db.patch(userDoc._id, { customCredits: newTotal });
      }

      // Registro no livro-razão (Ledger)
      await ctx.db.insert("creditTransactions", {
        userId: clerkId,
        amount: -deductedAmount,
        balanceAfter: newTotal,
        creditType: newBonus < bonusCredits && newPaid < paidCredits ? "mixed" : newPaid < paidCredits ? "paid" : "bonus",
        type: "generation_spend",
        description: `Renderização ${args.type === "video" ? "de Vídeo" : "de Imagem"} (${args.engine})`,
        workflowSlug: args.engine,
        timestamp: now,
      });
    }

    // Resolução segura de URLs de imagens de entrada (NUNCA armazena base64 no documento Convex)
    let finalInputImageUrl: string | undefined = undefined;
    if (args.inputImageStorageId) {
      const storageUrl = await ctx.storage.getUrl(args.inputImageStorageId);
      finalInputImageUrl = storageUrl ?? undefined;
    } else if (args.inputImageUrl && !args.inputImageUrl.startsWith("data:")) {
      finalInputImageUrl = args.inputImageUrl;
    }

    let finalLastFrameUrl: string | undefined = undefined;
    if (args.lastFrameStorageId) {
      const storageUrl = await ctx.storage.getUrl(args.lastFrameStorageId);
      finalLastFrameUrl = storageUrl ?? undefined;
    } else if (args.lastFrameUrl && !args.lastFrameUrl.startsWith("data:")) {
      finalLastFrameUrl = args.lastFrameUrl;
    }

    // 5. Inserção do Registro de Geração com status "queued"
    const now = Date.now();
    const generationId = await ctx.db.insert("studioGenerations", {
      userId: clerkId,
      projectId: args.projectId,
      type: args.type,
      mode: args.mode,
      uiModeUsed: args.uiModeUsed,
      engine: args.engine,
      provider: args.provider || (args.engine === "seedance25_t2v" ? "higgsfield" : "runpod"),
      endpointId: args.endpointId,
      status: "queued",
      progressMessage: "Alocando instância no estúdio de renderização...",
      prompt: args.prompt,
      negativePrompt: args.negativePrompt,
      audioPrompt: args.audioPrompt,
      seed: args.seed,
      aspectRatio: args.aspectRatio,
      width: args.width,
      height: args.height,
      durationSeconds: args.durationSeconds,
      fps: args.fps,
      steps: args.steps,
      cfgScale: args.cfgScale,
      loraConfig: args.loraConfig,
      inputImageStorageId: args.inputImageStorageId,
      inputImageUrl: finalInputImageUrl,
      lastFrameStorageId: args.lastFrameStorageId,
      lastFrameUrl: finalLastFrameUrl,
      hasAudioTrack: args.type === "video",
      creditsCharged: deductedAmount,
      elementTagsUsed: args.elementTagsUsed,
      cameraMotion: args.cameraMotion,
      lens: args.lens,
      lighting: args.lighting,
      framing: args.framing,
      batchCount: args.batchCount,
      quality: args.quality,
      createdAt: now,
    });

    // 6. Log de Observabilidade
    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "studio",
      message: `Geração ${args.type} iniciada: ${args.engine} (${deductedAmount} créditos)`,
      details: JSON.stringify({ generationId, engine: args.engine, seed: args.seed, width: args.width, height: args.height }),
      userId: clerkId,
      timestamp: now,
    });

    return { generationId, creditsCharged: deductedAmount };
  },
});

/**
 * Atualiza o progresso e o ID do job do RunPod
 */
export const updateJobProgress = mutation({
  args: {
    generationId: v.id("studioGenerations"),
    runpodJobId: v.optional(v.string()),
    status: v.union(v.literal("queued"), v.literal("processing"), v.literal("completed"), v.literal("failed"), v.literal("cancelled")),
    progressMessage: v.optional(v.string()),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const internalSecret = process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";
    const identity = await ctx.auth.getUserIdentity();

    let isAuthorized = Boolean(args.secret && args.secret === internalSecret);
    const gen = await ctx.db.get(args.generationId);
    if (!gen) throw new Error("Geração não encontrada.");

    if (!isAuthorized && identity && identity.subject === gen.userId) {
      isAuthorized = true;
    }

    if (!isAuthorized) throw new Error("Acesso não autorizado.");

    await ctx.db.patch(args.generationId, {
      status: args.status,
      runpodJobId: args.runpodJobId ?? gen.runpodJobId,
      progressMessage: args.progressMessage ?? gen.progressMessage,
    });

    return { success: true };
  },
});

/**
 * Conclui a geração com sucesso, persistindo a mídia gerada e métricas financeiras
 */
export const completeGeneration = mutation({
  args: {
    generationId: v.id("studioGenerations"),
    outputStorageId: v.optional(v.id("_storage")),
    outputUrl: v.string(),
    outputFilename: v.optional(v.string()),
    executionTimeMs: v.optional(v.number()),
    costUsd: v.optional(v.number()),
    costBrl: v.optional(v.number()),
    hasAudioTrack: v.optional(v.boolean()),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const internalSecret = process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";
    const identity = await ctx.auth.getUserIdentity();

    const gen = await ctx.db.get(args.generationId);
    if (!gen) throw new Error("Geração não encontrada.");

    let isAuthorized = Boolean(args.secret && args.secret === internalSecret);
    if (!isAuthorized && identity && identity.subject === gen.userId) {
      isAuthorized = true;
    }
    if (!isAuthorized) throw new Error("Acesso não autorizado.");

    let finalUrl = args.outputUrl;
    if (args.outputStorageId) {
      const storageUrl = await ctx.storage.getUrl(args.outputStorageId);
      if (storageUrl) {
        finalUrl = storageUrl;
      }
    } else if (finalUrl && finalUrl.startsWith("data:")) {
      finalUrl = "";
    }

    // Obter workflow e configurações para contabilidade precisa de custos
    let finalCostUsd = args.costUsd;
    let finalCostBrl = args.costBrl;

    if (args.executionTimeMs) {
      const canonicalSlug = gen.engine;
      const wf = await ctx.db
        .query("workflowPricing")
        .withIndex("by_slug", (q) => q.eq("slug", canonicalSlug))
        .first() || await ctx.db
        .query("workflowPricing")
        .withIndex("by_slug", (q) => q.eq("slug", canonicalSlug.replace(/_/g, "-")))
        .first();

      const settingsDoc = await ctx.db
        .query("systemPricingSettings")
        .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
        .first();

      const usdToBrl = settingsDoc?.usdToBrlRate || 5.8;
      const ratePerSecond = wf?.gpuRatePerSecond || (wf?.gpuType === "80gb" ? 0.000756 : 0.000486);
      const executionSeconds = args.executionTimeMs / 1000;
      finalCostUsd = Number((executionSeconds * ratePerSecond).toFixed(6));
      finalCostBrl = Number((finalCostUsd * usdToBrl).toFixed(4));
    }

    const now = Date.now();
    await ctx.db.patch(args.generationId, {
      status: "completed",
      progressMessage: "Renderização cinemática concluída com sucesso!",
      outputStorageId: args.outputStorageId,
      outputUrl: finalUrl,
      outputFilename: args.outputFilename || `kriativa_${gen.engine}_${gen._id}`,
      hasAudioTrack: args.hasAudioTrack ?? gen.hasAudioTrack,
      executionTimeMs: args.executionTimeMs,
      costUsd: finalCostUsd,
      costBrl: finalCostBrl,
      completedAt: now,
    });

    // Log de auditoria
    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "studio",
      message: `Renderização concluída: ${gen.engine} em ${(args.executionTimeMs ? (args.executionTimeMs / 1000).toFixed(1) : 0)}s`,
      details: JSON.stringify({ generationId: gen._id, costUsd: args.costUsd, costBrl: args.costBrl }),
      userId: gen.userId,
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Estorno atômico de créditos em caso de falha ou cancelamento do RunPod
 */
export const refundGeneration = mutation({
  args: {
    generationId: v.id("studioGenerations"),
    errorMessage: v.string(),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const internalSecret = process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";
    const identity = await ctx.auth.getUserIdentity();

    const gen = await ctx.db.get(args.generationId);
    if (!gen) throw new Error("Geração não encontrada.");

    let isAuthorized = Boolean(args.secret && args.secret === internalSecret);
    if (!isAuthorized && identity && identity.subject === gen.userId) {
      isAuthorized = true;
    }
    if (!isAuthorized) throw new Error("Acesso não autorizado.");

    // Evita estorno duplo
    if (gen.status === "failed" || gen.status === "cancelled") {
      return { refunded: false, reason: "already_refunded" };
    }

    const refundAmount = gen.creditsCharged;
    const now = Date.now();

    if (refundAmount > 0) {
      let balanceDoc = await ctx.db
        .query("creditBalances")
        .withIndex("by_userId", (q) => q.eq("userId", gen.userId))
        .first();

      const userDoc = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", gen.userId))
        .first();

      if (balanceDoc) {
        const newBonus = balanceDoc.bonusCredits + refundAmount;
        const newTotal = balanceDoc.paidCredits + newBonus;
        await ctx.db.patch(balanceDoc._id, {
          bonusCredits: newBonus,
          totalCredits: newTotal,
          updatedAt: now,
        });

        if (userDoc) {
          await ctx.db.patch(userDoc._id, { customCredits: newTotal });
        }

        // Registro de estorno no livro-razão
        await ctx.db.insert("creditTransactions", {
          userId: gen.userId,
          amount: refundAmount,
          balanceAfter: newTotal,
          creditType: "bonus",
          type: "refund",
          description: `Estorno por falha na renderização (${gen.engine})`,
          workflowSlug: gen.engine,
          adminNotes: args.errorMessage,
          timestamp: now,
        });
      }
    }

    await ctx.db.patch(args.generationId, {
      status: "failed",
      errorMessage: args.errorMessage,
      progressMessage: "Falha na renderização. Seus créditos foram estornados.",
      completedAt: now,
    });

    await ctx.db.insert("systemLogs", {
      level: "warn",
      category: "studio",
      message: `Renderização falhou e créditos estornados: ${gen.engine} (${refundAmount} créditos estornados)`,
      details: JSON.stringify({ generationId: gen._id, error: args.errorMessage }),
      userId: gen.userId,
      timestamp: now,
    });

    return { refunded: true, amount: refundAmount };
  },
});

/**
 * Cancela uma geração em andamento
 */
export const cancelGeneration = mutation({
  args: {
    generationId: v.id("studioGenerations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    const gen = await ctx.db.get(args.generationId);
    if (!gen || gen.userId !== identity.subject) {
      throw new Error("Geração não encontrada ou sem permissão.");
    }

    if (gen.status === "completed" || gen.status === "failed") {
      throw new Error("Esta geração já foi finalizada.");
    }

    const now = Date.now();
    const refundAmount = gen.creditsCharged;

    if (refundAmount > 0) {
      let balanceDoc = await ctx.db
        .query("creditBalances")
        .withIndex("by_userId", (q) => q.eq("userId", gen.userId))
        .first();

      const userDoc = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", gen.userId))
        .first();

      if (balanceDoc) {
        const newBonus = balanceDoc.bonusCredits + refundAmount;
        const newTotal = balanceDoc.paidCredits + newBonus;
        await ctx.db.patch(balanceDoc._id, {
          bonusCredits: newBonus,
          totalCredits: newTotal,
          updatedAt: now,
        });

        if (userDoc) {
          await ctx.db.patch(userDoc._id, { customCredits: newTotal });
        }

        await ctx.db.insert("creditTransactions", {
          userId: gen.userId,
          amount: refundAmount,
          balanceAfter: newTotal,
          creditType: "bonus",
          type: "refund",
          description: `Cancelamento de renderização pelo usuário (${gen.engine})`,
          workflowSlug: gen.engine,
          timestamp: now,
        });
      }
    }

    await ctx.db.patch(args.generationId, {
      status: "cancelled",
      errorMessage: "Cancelado pelo usuário.",
      progressMessage: "Geração cancelada. Créditos devolvidos.",
      completedAt: now,
    });

    return { success: true, refunded: refundAmount };
  },
});

/**
 * Exclui uma geração da galeria e expurga os arquivos do Convex Storage
 */
export const deleteGeneration = mutation({
  args: {
    generationId: v.id("studioGenerations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    const gen = await ctx.db.get(args.generationId);
    if (!gen || gen.userId !== identity.subject) {
      throw new Error("Geração não encontrada ou sem permissão.");
    }

    // Expurga arquivos do Convex Storage permanentemente se existirem
    if (gen.outputStorageId) {
      try {
        await ctx.storage.delete(gen.outputStorageId);
      } catch (e) {
        console.error("Falha ao deletar outputStorageId:", e);
      }
    }
    if (gen.inputImageStorageId) {
      try {
        await ctx.storage.delete(gen.inputImageStorageId);
      } catch (e) {
        console.error("Falha ao deletar inputImageStorageId:", e);
      }
    }
    if (gen.lastFrameStorageId) {
      try {
        await ctx.storage.delete(gen.lastFrameStorageId);
      } catch (e) {
        console.error("Falha ao deletar lastFrameStorageId:", e);
      }
    }

    await ctx.db.delete(args.generationId);
    return { success: true };
  },
});

