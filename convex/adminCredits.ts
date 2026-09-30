import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

// Pacotes padrões de créditos
const DEFAULT_PACKAGES = [
  {
    slug: "starter",
    name: "Starter Studio",
    creditsBase: 100,
    creditsBonus: 0,
    priceBrl: 29.0,
    priceUsd: 5.9,
    badge: undefined,
    isPopular: false,
    isActive: true,
    sortOrder: 1,
    features: [
      "~4 vídeos cinematográficos Wan 2.1 (720p)",
      "Acesso completo a todos os workflows ComfyUI",
      "Créditos nunca expiram",
      "Ativa o Estúdio com Saldo Mínimo de Bônus",
    ],
  },
  {
    slug: "creator",
    name: "Creator Pro",
    creditsBase: 250,
    creditsBonus: 25,
    priceBrl: 69.0,
    priceUsd: 13.9,
    badge: "Mais Popular",
    isPopular: true,
    isActive: true,
    sortOrder: 2,
    features: [
      "275 Créditos Totais (+10% de Bônus Grátis)",
      "~11 vídeos Wan 2.1 ou 4 vídeos Hunyuan 1080p HD",
      "Fila com prioridade no processamento de vídeo",
      "Qualificado para recargas automáticas diárias",
    ],
  },
  {
    slug: "director",
    name: "Director Suite",
    creditsBase: 600,
    creditsBonus: 100,
    priceBrl: 149.0,
    priceUsd: 29.9,
    badge: "+16% de Bônus",
    isPopular: false,
    isActive: true,
    sortOrder: 3,
    features: [
      "700 Créditos Totais (+100 Créditos de Bônus)",
      "~28 vídeos Wan 2.1 ou 11 vídeos Hunyuan 1080p",
      "Renderização 4K Upscale & RIFE 60fps inclusa",
      "Acesso antecipado a novos workflows ComfyUI",
    ],
  },
  {
    slug: "cinema-master",
    name: "Cinema Master",
    creditsBase: 1500,
    creditsBonus: 350,
    priceBrl: 349.0,
    priceUsd: 69.9,
    badge: "Melhor Custo-Benefício",
    isPopular: false,
    isActive: true,
    sortOrder: 4,
    features: [
      "1.850 Créditos Totais (+23% de Bônus Máximo)",
      "Custo mais baixo por crédito: ~R$ 0,18 / crédito",
      "Ideal para produtoras, agências e criadores frequentes",
      "Suporte prioritário e limites ampliados de render",
    ],
  },
];

/**
 * Consulta a lista de pacotes de créditos
 */
export const listPackages = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const packages = await ctx.db
      .query("creditPackages")
      .withIndex("by_sortOrder")
      .collect();

    if (packages.length === 0) {
      return DEFAULT_PACKAGES.map((p, idx) => ({
        ...p,
        _id: `fallback_pkg_${idx}` as any,
        _creationTime: Date.now(),
        updatedAt: Date.now(),
      }));
    }

    return packages;
  },
});

/**
 * Criação ou Atualização de Pacote de Créditos
 */
export const upsertPackage = mutation({
  args: {
    id: v.optional(v.id("creditPackages")),
    slug: v.string(),
    name: v.string(),
    creditsBase: v.number(),
    creditsBonus: v.number(),
    priceBrl: v.number(),
    priceUsd: v.number(),
    badge: v.optional(v.string()),
    isPopular: v.boolean(),
    isActive: v.boolean(),
    sortOrder: v.number(),
    features: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const cleanSlug = args.slug.trim().toLowerCase();
    const cleanName = args.name.trim();

    if (!cleanSlug) throw new Error("Slug do pacote é obrigatório.");
    if (!cleanName) throw new Error("Nome do pacote é obrigatório.");
    if (args.creditsBase <= 0) throw new Error("Os créditos base devem ser maiores que zero.");
    if (args.priceBrl <= 0) throw new Error("O preço em BRL deve ser maior que zero.");

    const now = Date.now();
    const cleanFeatures = args.features.map((f) => f.trim()).filter(Boolean);

    if (args.id) {
      await ctx.db.patch(args.id, {
        slug: cleanSlug,
        name: cleanName,
        creditsBase: Math.round(args.creditsBase),
        creditsBonus: Math.max(0, Math.round(args.creditsBonus)),
        priceBrl: Number(args.priceBrl.toFixed(2)),
        priceUsd: Number(args.priceUsd.toFixed(2)),
        badge: args.badge?.trim() || undefined,
        isPopular: args.isPopular,
        isActive: args.isActive,
        sortOrder: args.sortOrder,
        features: cleanFeatures,
        updatedAt: now,
      });
      return { success: true, action: "updated" };
    }

    // Verificar slug duplicado
    const existing = await ctx.db
      .query("creditPackages")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: cleanName,
        creditsBase: Math.round(args.creditsBase),
        creditsBonus: Math.max(0, Math.round(args.creditsBonus)),
        priceBrl: Number(args.priceBrl.toFixed(2)),
        priceUsd: Number(args.priceUsd.toFixed(2)),
        badge: args.badge?.trim() || undefined,
        isPopular: args.isPopular,
        isActive: args.isActive,
        sortOrder: args.sortOrder,
        features: cleanFeatures,
        updatedAt: now,
      });
      return { success: true, action: "updated_existing" };
    }

    const newId = await ctx.db.insert("creditPackages", {
      slug: cleanSlug,
      name: cleanName,
      creditsBase: Math.round(args.creditsBase),
      creditsBonus: Math.max(0, Math.round(args.creditsBonus)),
      priceBrl: Number(args.priceBrl.toFixed(2)),
      priceUsd: Number(args.priceUsd.toFixed(2)),
      badge: args.badge?.trim() || undefined,
      isPopular: args.isPopular,
      isActive: args.isActive,
      sortOrder: args.sortOrder,
      features: cleanFeatures,
      updatedAt: now,
    });

    return { success: true, action: "created", id: newId };
  },
});

/**
 * Remove um pacote de créditos
 */
export const deletePackage = mutation({
  args: {
    id: v.id("creditPackages"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Ativa / Desativa um pacote
 */
export const togglePackageActive = mutation({
  args: {
    id: v.id("creditPackages"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

/**
 * Seed automático de pacotes se a tabela estiver vazia
 */
export const seedDefaultPackages = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.query("creditPackages").collect();
    if (existing.length > 0) {
      return { seeded: false, count: existing.length };
    }

    const now = Date.now();
    for (const p of DEFAULT_PACKAGES) {
      await ctx.db.insert("creditPackages", {
        ...p,
        updatedAt: now,
      });
    }

    return { seeded: true, count: DEFAULT_PACKAGES.length };
  },
});

/**
 * Lista usuários e seus saldos de créditos (pagos, bônus, elegibilidade a bônus diário)
 */
export const listUserCredits = query({
  args: {
    search: v.optional(v.string()),
    filterEligible: v.optional(v.string()), // "all", "eligible", "below_min"
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const maxLimit = Math.min(args.limit ?? 100, 200);
    const users = await ctx.db.query("users").order("desc").take(maxLimit);

    // Obter configuração de saldo mínimo
    const settings = await ctx.db
      .query("systemPricingSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
      .first();

    const minBalance = settings?.minBalanceForDailyBonus ?? 20;

    const enriched = await Promise.all(
      users.map(async (u) => {
        // Buscar ou derivar saldo estruturado
        let balanceDoc = await ctx.db
          .query("creditBalances")
          .withIndex("by_userId", (q) => q.eq("userId", u.clerkId))
          .first();

        const claim = await ctx.db
          .query("freePlanClaims")
          .withIndex("by_userId", (q) => q.eq("userId", u.clerkId))
          .first();

        // Se ainda não existir registro em creditBalances, derivar do claim/customCredits existente
        const paidCredits = balanceDoc?.paidCredits ?? 0;
        const bonusCredits =
          balanceDoc?.bonusCredits ??
          (u.customCredits ?? claim?.creditsRemaining ?? 50);
        const totalCredits =
          balanceDoc?.totalCredits ?? paidCredits + bonusCredits;
        const isEligible = totalCredits >= minBalance;

        return {
          userId: u._id,
          clerkId: u.clerkId,
          name: u.name || "Criador",
          email: u.email,
          imageUrl: u.imageUrl,
          role: u.role || "user",
          status: u.status || "active",
          paidCredits,
          bonusCredits,
          totalCredits,
          minBalanceEligible: isEligible,
          minBalanceRequired: minBalance,
          lastDailyBonusAt: balanceDoc?.lastDailyBonusAt,
          createdAt: u._creationTime,
        };
      })
    );

    return enriched.filter((item) => {
      if (args.filterEligible === "eligible" && !item.minBalanceEligible) {
        return false;
      }
      if (args.filterEligible === "below_min" && item.minBalanceEligible) {
        return false;
      }
      if (args.search) {
        const s = args.search.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(s);
        const matchEmail = item.email.toLowerCase().includes(s);
        return matchName || matchEmail;
      }
      return true;
    });
  },
});

/**
 * Consulta o histórico de transações de crédito de um usuário específico
 */
export const getUserTransactions = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 50, 100);
    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.clerkId))
      .order("desc")
      .take(limit);

    return transactions;
  },
});

/**
 * Ajuste manual de créditos por usuário (CRUD de créditos pelo Admin)
 * Grava no ledger imutável e sincroniza saldos
 */
export const adjustUserCredits = mutation({
  args: {
    userId: v.string(), // clerkId do usuário
    amount: v.number(), // valor a adicionar ou deduzir
    creditType: v.union(v.literal("paid"), v.literal("bonus")),
    operation: v.union(v.literal("add"), v.literal("deduct")),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const { user: adminUser } = await requireAdmin(ctx);

    if (args.amount <= 0) {
      throw new Error("O valor de créditos a alterar deve ser maior que zero.");
    }
    const cleanNotes = args.notes.trim();
    if (!cleanNotes) {
      throw new Error("A justificativa/motivo do ajuste é obrigatória para fins de auditoria.");
    }

    // Buscar usuário alvo
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!targetUser) {
      throw new Error("Usuário alvo não encontrado.");
    }

    // Configuração de saldo mínimo
    const settings = await ctx.db
      .query("systemPricingSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
      .first();
    const minThreshold = settings?.minBalanceForDailyBonus ?? 20;

    // Buscar ou inicializar saldo
    let balanceDoc = await ctx.db
      .query("creditBalances")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    let currentPaid = balanceDoc?.paidCredits ?? 0;
    let currentBonus =
      balanceDoc?.bonusCredits ?? (targetUser.customCredits ?? 50);

    const delta = args.operation === "add" ? args.amount : -args.amount;

    if (args.creditType === "paid") {
      currentPaid = Math.max(0, currentPaid + delta);
    } else {
      currentBonus = Math.max(0, currentBonus + delta);
    }

    const newTotal = currentPaid + currentBonus;
    const isEligible = newTotal >= minThreshold;
    const now = Date.now();

    // 1. Atualizar ou inserir na tabela creditBalances
    if (balanceDoc) {
      await ctx.db.patch(balanceDoc._id, {
        paidCredits: currentPaid,
        bonusCredits: currentBonus,
        totalCredits: newTotal,
        minBalanceEligible: isEligible,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("creditBalances", {
        userId: args.userId,
        paidCredits: currentPaid,
        bonusCredits: currentBonus,
        totalCredits: newTotal,
        minBalanceEligible: isEligible,
        updatedAt: now,
      });
    }

    // 2. Sincronizar tabela users e freePlanClaims
    await ctx.db.patch(targetUser._id, {
      customCredits: newTotal,
    });

    const claim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (claim) {
      await ctx.db.patch(claim._id, {
        creditsRemaining: newTotal,
      });
    }

    // 3. Gravar no livro-razão imutável (creditTransactions)
    const transactionId = await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      amount: delta,
      balanceAfter: newTotal,
      creditType: args.creditType,
      type:
        args.operation === "add"
          ? args.creditType === "bonus"
            ? "bonus_granted"
            : "admin_adjustment"
          : "admin_adjustment",
      description: `Ajuste manual de créditos: ${args.operation === "add" ? "+" : "-"}${args.amount} (${args.creditType === "paid" ? "Créditos Pagos" : "Créditos Bônus"})`,
      adminNotes: `[Admin: ${adminUser.name || adminUser.email}]: ${cleanNotes}`,
      timestamp: now,
    });

    return {
      success: true,
      newTotal,
      currentPaid,
      currentBonus,
      minBalanceEligible: isEligible,
      transactionId,
    };
  },
});

/**
 * Consulta transações globais recentes de créditos (Auditoria de Tesouraria)
 */
export const listGlobalTransactions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 50, 100);
    const transactions = await ctx.db
      .query("creditTransactions")
      .order("desc")
      .take(limit);

    // Enriquecer com dados de usuários
    const enriched = await Promise.all(
      transactions.map(async (tx) => {
        const u = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", tx.userId))
          .first();

        return {
          ...tx,
          userName: u?.name || "Criador",
          userEmail: u?.email || tx.userId,
          userRole: u?.role || "user",
        };
      })
    );

    return enriched;
  },
});
