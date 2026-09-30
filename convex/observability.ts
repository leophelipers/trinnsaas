import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./admin";
import { isFeatureFlagActive, DEFAULT_FEATURE_FLAGS } from "./featureFlags";

/**
 * Consulta agregada para o Dashboard de Observabilidade do Sistema (Exclusivo Admin)
 */
export const getObservabilityOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // 1. Feature flags status
    const isMaintenance = await isFeatureFlagActive(ctx, "maintenance_mode");
    const dbFlags = await ctx.db.query("featureFlags").take(100);
    const activeDbFlagsCount = dbFlags.filter((f) => f.enabled).length;

    // 2. Transações e Saúde Financeira (Orders)
    const recentOrders = await ctx.db
      .query("creditOrders")
      .order("desc")
      .take(100);

    let totalGrossBrl = 0;
    let approvedOrdersCount = 0;
    let pendingOrdersCount = 0;
    let rejectedOrdersCount = 0;
    let pixOrdersCount = 0;
    let pixGrossBrl = 0;
    let cardOrdersCount = 0;
    let cardGrossBrl = 0;

    for (const order of recentOrders) {
      if (order.status === "approved") {
        approvedOrdersCount++;
        totalGrossBrl += order.amountBrl;
        if (order.paymentMethod === "pix") {
          pixOrdersCount++;
          pixGrossBrl += order.amountBrl;
        } else {
          cardOrdersCount++;
          cardGrossBrl += order.amountBrl;
        }
      } else if (order.status === "pending") {
        pendingOrdersCount++;
      } else if (order.status === "rejected" || order.status === "cancelled") {
        rejectedOrdersCount++;
      }
    }

    const totalResolvedOrders = approvedOrdersCount + rejectedOrdersCount;
    const approvalRatePct =
      totalResolvedOrders > 0
        ? Number(((approvedOrdersCount / totalResolvedOrders) * 100).toFixed(1))
        : 100;

    // 3. Economia de Créditos (Balances)
    const allBalances = await ctx.db.query("creditBalances").take(150);
    let totalCreditsCirculating = 0;
    let totalPaidCredits = 0;
    let totalBonusCredits = 0;
    let totalAutoTopUpUsers = 0;
    let totalEligibleUsers = 0;

    for (const bal of allBalances) {
      totalCreditsCirculating += bal.totalCredits;
      totalPaidCredits += bal.paidCredits;
      totalBonusCredits += bal.bonusCredits;
      if (bal.autoTopUpEnabled) totalAutoTopUpUsers++;
      if (bal.minBalanceEligible) totalEligibleUsers++;
    }

    // 4. Livro-razão recente (Ledger)
    const recentTransactions = await ctx.db
      .query("creditTransactions")
      .order("desc")
      .take(15);

    // 5. Logs e Incidentes do Sistema
    const recentLogs = await ctx.db
      .query("systemLogs")
      .order("desc")
      .take(30);

    let errors24h = 0;
    let warnings24h = 0;
    for (const log of recentLogs) {
      if (log.timestamp >= oneDayAgo) {
        if (log.level === "error") errors24h++;
        if (log.level === "warn") warnings24h++;
      }
    }

    // Status geral de saúde
    let overallStatus: "operational" | "degraded" | "maintenance" = "operational";
    if (isMaintenance) {
      overallStatus = "maintenance";
    } else if (errors24h >= 5 || (totalResolvedOrders >= 5 && approvalRatePct < 60)) {
      overallStatus = "degraded";
    }

    return {
      health: {
        overallStatus,
        isMaintenance,
        errors24h,
        warnings24h,
        activeFlagsCount: activeDbFlagsCount || DEFAULT_FEATURE_FLAGS.filter((f) => f.enabled).length,
        totalFlagsCount: Math.max(dbFlags.length, DEFAULT_FEATURE_FLAGS.length),
        databaseConnected: true,
        lastCheckedAt: now,
      },
      financial: {
        totalGrossBrl: Number(totalGrossBrl.toFixed(2)),
        totalOrdersCount: recentOrders.length,
        approvedOrdersCount,
        pendingOrdersCount,
        rejectedOrdersCount,
        approvalRatePct,
        pix: {
          count: pixOrdersCount,
          grossBrl: Number(pixGrossBrl.toFixed(2)),
        },
        card: {
          count: cardOrdersCount,
          grossBrl: Number(cardGrossBrl.toFixed(2)),
        },
        sampleOrders: recentOrders.slice(0, 8),
      },
      creditsEconomy: {
        totalCreditsCirculating,
        totalPaidCredits,
        totalBonusCredits,
        totalAutoTopUpUsers,
        totalEligibleUsers,
        sampleTransactions: recentTransactions,
      },
      recentLogs,
    };
  },
});

/**
 * Consulta paginada dos logs do sistema para auditoria contínua
 */
export const getSystemLogsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    level: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.level && (args.level === "info" || args.level === "warn" || args.level === "error")) {
      return await ctx.db
        .query("systemLogs")
        .withIndex("by_level", (q) => q.eq("level", args.level as "info" | "warn" | "error"))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    if (args.category) {
      return await ctx.db
        .query("systemLogs")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("systemLogs")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/**
 * Grava um log do sistema para observabilidade e rastreamento de erros
 */
export const recordSystemLog = mutation({
  args: {
    level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
    category: v.string(),
    message: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const now = Date.now();

    const logId = await ctx.db.insert("systemLogs", {
      level: args.level,
      category: args.category,
      message: args.message,
      details: args.details,
      userId: identity?.subject,
      timestamp: now,
    });

    return logId;
  },
});
