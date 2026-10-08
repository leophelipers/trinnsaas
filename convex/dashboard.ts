import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

/**
 * Consulta consolidada e reativa para o Visão Geral do /dashboard
 */
export const getDashboardOverview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    // 1. Saldo & Créditos Disponíveis
    let balanceDoc = await ctx.db
      .query("creditBalances")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const userDoc = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .first();

    const paidCredits = balanceDoc?.paidCredits ?? 0;
    const bonusCredits = balanceDoc?.bonusCredits ?? (userDoc?.customCredits ?? 50);
    const totalCredits = balanceDoc?.totalCredits ?? (paidCredits + bonusCredits);

    // 2. Transações para cálculo de % do último Top-up
    const userTransactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);

    const lastPurchase = userTransactions.find((tx) => tx.type === "purchase");
    let lastTopUpAmount = lastPurchase ? Math.abs(lastPurchase.amount) : 50; // Fallback cota inicial
    let spentSinceLastTopUp = 0;

    const purchaseTime = lastPurchase ? lastPurchase.timestamp : 0;
    for (const tx of userTransactions) {
      if (tx.timestamp >= purchaseTime && tx.amount < 0) {
        spentSinceLastTopUp += Math.abs(tx.amount);
      }
    }

    const percentSpent = lastTopUpAmount > 0
      ? Math.min(100, Math.round((spentSinceLastTopUp / lastTopUpAmount) * 100))
      : 0;

    // 3. Últimas 3 a 5 Gerações de Mídia
    const rawGenerations = await ctx.db
      .query("studioGenerations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

    const recentGenerations = await Promise.all(
      rawGenerations.map(async (gen) => {
        let url = gen.outputUrl;
        if (gen.outputStorageId) {
          const fresh = await ctx.storage.getUrl(gen.outputStorageId);
          if (fresh) url = fresh;
        }
        return {
          _id: gen._id,
          type: gen.type,
          engine: gen.engine,
          provider: gen.provider,
          status: gen.status,
          prompt: gen.prompt,
          outputUrl: url,
          aspectRatio: gen.aspectRatio,
          durationSeconds: gen.durationSeconds,
          creditsCharged: gen.creditsCharged,
          createdAt: gen.createdAt,
        };
      })
    );

    // 4. Últimos 5 Modelos Utilizados (Studio + Chat)
    const usedModelSlugs = new Set<string>();
    const recentModels: Array<{ slug: string; name: string; type: "video" | "image" | "chat"; provider: string }> = [];

    // Dos renders visuais
    for (const gen of rawGenerations) {
      if (gen.engine && !usedModelSlugs.has(gen.engine)) {
        usedModelSlugs.add(gen.engine);
        let displayName: string = gen.engine;
        let provider: string = gen.provider || "runpod";
        let type: "video" | "image" = gen.type;

        if (gen.engine === "seedance25_t2v") {
          displayName = "Seedance 2.5 Cinema";
          provider = "higgsfield";
        } else if (gen.engine === "krea2_turbo") {
          displayName = "Krea-2 Turbo 8K";
          provider = "runpod";
        } else if (gen.engine === "fasth3_i2v") {
          displayName = "FastH3 Image-to-Video";
          provider = "runpod";
        } else if (gen.engine === "fasth3_t2v_720p") {
          displayName = "FastVideo H3 720p";
          provider = "runpod";
        } else if (gen.engine === "ltx25_i2v") {
          displayName = "LTX-2.5 CinemaScope";
          provider = "runpod";
        }

        recentModels.push({
          slug: gen.engine,
          name: displayName,
          type,
          provider,
        });
      }
      if (recentModels.length >= 5) break;
    }

    // Do Chat IA se faltar para 5
    if (recentModels.length < 5) {
      const chatMessages = await ctx.db
        .query("aiMessages")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .order("desc")
        .take(20);

      for (const msg of chatMessages) {
        if (msg.modelUsed && !usedModelSlugs.has(msg.modelUsed)) {
          usedModelSlugs.add(msg.modelUsed);
          let displayName = msg.modelUsed.split("/").pop() || msg.modelUsed;
          if (msg.modelUsed.includes("claude-3.7")) displayName = "Claude 3.7 Sonnet";
          else if (msg.modelUsed.includes("deepseek-r1")) displayName = "DeepSeek R1 Distill";
          else if (msg.modelUsed.includes("gemini-2.5")) displayName = "Gemini 2.5 Flash";

          recentModels.push({
            slug: msg.modelUsed,
            name: displayName,
            type: "chat",
            provider: msg.modelUsed.startsWith("runpod") ? "runpod" : "openrouter",
          });
        }
        if (recentModels.length >= 5) break;
      }
    }

    // 5. Número de Projetos Ativos
    const allProjects = await ctx.db
      .query("studioProjects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const activeProjectsCount = allProjects.filter((p) => p.status === "active").length;

    // 6. Speed Dial Shortcuts do Usuário
    const userPref = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const DEFAULT_SHORTCUTS = [
      "new_video",
      "new_image",
      "chat_muse",
      "credits_topup",
      "production_bible",
      "studio_vault",
    ];

    const speedDialShortcuts = userPref?.speedDialShortcuts || DEFAULT_SHORTCUTS;

    // 7. Banners de Destaque Cadastrados no Admin
    const rawBanners = await ctx.db
      .query("announcementBanners")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    const banners = rawBanners.sort((a, b) => a.sortOrder - b.sortOrder);

    // 8. Promoções do Site Ativas
    const isAutoTopUpActive = Boolean(balanceDoc?.autoTopUpEnabled);

    const promotions = [
      {
        id: "promo_autotopup",
        title: "Bônus VIP Dobrado (+10 Cr/Dia)",
        subtitle: isAutoTopUpActive ? "Ativo no seu estúdio!" : "Ative a recarga inteligente e dobre o bônus diário",
        badge: "VIP +100%",
        linkUrl: "/dashboard/credits",
        actionText: isAutoTopUpActive ? "Gerenciar" : "Ativar Bônus",
        highlight: true,
      },
      {
        id: "promo_seedance",
        title: "Seedance 2.5 Multimodal Disponível",
        subtitle: "Crie cenas até 30s com áudio nativo sincronizado em 720p/1080p",
        badge: "NOVO MOTOR",
        linkUrl: "/dashboard/studio",
        actionText: "Criar Vídeo",
        highlight: false,
      },
      {
        id: "promo_lifetime",
        title: "Créditos Sem Expiração",
        subtitle: "Seus créditos nunca vencem e acumulam indefinidamente",
        badge: "VITALÍCIO",
        linkUrl: "/dashboard/credits",
        actionText: "Recarregar",
        highlight: false,
      },
    ];

    return {
      tokenStats: {
        totalCredits,
        paidCredits,
        bonusCredits,
        lastTopUpAmount,
        spentSinceLastTopUp,
        percentSpent,
      },
      recentGenerations,
      recentModels,
      activeProjectsCount,
      totalProjectsCount: allProjects.length,
      speedDialShortcuts,
      banners,
      promotions,
    };
  },
});

/**
 * Atualiza atalhos favoritos do Speed Dial do usuário
 */
export const updateSpeedDialShortcuts = mutation({
  args: {
    shortcuts: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const userId = identity.subject;
    const now = Date.now();

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        speedDialShortcuts: args.shortcuts,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        speedDialShortcuts: args.shortcuts,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Lista todos os banners administrativos
 */
export const listAdminBanners = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("announcementBanners").order("desc").collect();
  },
});

/**
 * Cria ou edita banner de destaque administrativo
 */
export const upsertAdminBanner = mutation({
  args: {
    id: v.optional(v.id("announcementBanners")),
    title: v.string(),
    description: v.string(),
    badgeText: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    linkText: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();

    if (args.id) {
      await ctx.db.patch(args.id, {
        title: args.title.trim(),
        description: args.description.trim(),
        badgeText: args.badgeText?.trim() || undefined,
        linkUrl: args.linkUrl?.trim() || undefined,
        linkText: args.linkText?.trim() || undefined,
        imageUrl: args.imageUrl?.trim() || undefined,
        isActive: args.isActive,
        sortOrder: args.sortOrder,
        updatedAt: now,
      });
      return { success: true, id: args.id };
    }

    const newId = await ctx.db.insert("announcementBanners", {
      title: args.title.trim(),
      description: args.description.trim(),
      badgeText: args.badgeText?.trim() || undefined,
      linkUrl: args.linkUrl?.trim() || undefined,
      linkText: args.linkText?.trim() || undefined,
      imageUrl: args.imageUrl?.trim() || undefined,
      isActive: args.isActive,
      sortOrder: args.sortOrder,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id: newId };
  },
});

/**
 * Exclui banner administrativo
 */
export const deleteAdminBanner = mutation({
  args: {
    id: v.id("announcementBanners"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
