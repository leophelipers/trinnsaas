import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { assertFeatureFlag } from "./featureFlags";

/**
 * Consulta o balanço de créditos do usuário autenticado
 */
export const getMyCredits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkId = identity.subject;

    // Buscar configurações de saldo mínimo
    const settingsDoc = await ctx.db
      .query("systemPricingSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
      .first();

    const minBalance = settingsDoc?.minBalanceForDailyBonus ?? 20;
    const baseDailyBonus = settingsDoc?.dailyBonusCredits ?? 5;
    const minCustomDeposit = settingsDoc?.minCustomDepositBrl ?? 5.0;
    const customCreditPrice = settingsDoc?.customCreditPriceBrl ?? 0.25;

    // Buscar balanço estruturado
    let balanceDoc = await ctx.db
      .query("creditBalances")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .first();

    const isAutoTopUp = balanceDoc?.autoTopUpEnabled ?? false;
    const dailyBonusAmount = isAutoTopUp ? 10 : baseDailyBonus;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    const claim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .first();

    const paidCredits = balanceDoc?.paidCredits ?? 0;
    const bonusCredits =
      balanceDoc?.bonusCredits ??
      (user?.customCredits ?? claim?.creditsRemaining ?? 0);
    const totalCredits =
      balanceDoc?.totalCredits ?? paidCredits + bonusCredits;

    const isEligible = totalCredits >= minBalance;

    // Verificar se pode resgatar bônus diário (24h de cooldown)
    const now = Date.now();
    const lastBonus = balanceDoc?.lastDailyBonusAt ?? 0;
    const canClaimDailyBonus =
      isEligible && now - lastBonus >= 24 * 60 * 60 * 1000;

    return {
      userId: clerkId,
      paidCredits,
      bonusCredits,
      totalCredits,
      minBalanceEligible: isEligible,
      minBalanceRequired: minBalance,
      dailyBonusAmount,
      baseDailyBonus,
      vipDailyBonus: 10,
      canClaimDailyBonus,
      lastDailyBonusAt: balanceDoc?.lastDailyBonusAt,
      minCustomDepositBrl: minCustomDeposit,
      customCreditPriceBrl: customCreditPrice,
      autoTopUpEnabled: isAutoTopUp,
      autoTopUpThreshold: balanceDoc?.autoTopUpThreshold ?? 20,
      autoTopUpAmountBrl: balanceDoc?.autoTopUpAmountBrl ?? 50,
      autoTopUpCardLast4: balanceDoc?.autoTopUpCardLast4,
      autoTopUpCardBrand: balanceDoc?.autoTopUpCardBrand,
    };
  },
});

/**
 * Consulta o extrato de movimentações (histórico de gastos e recargas) do usuário autenticado
 */
export const getMyTransactions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const limit = Math.min(args.limit ?? 50, 100);
    return await ctx.db
      .query("creditTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(limit);
  },
});

/**
 * Consulta paginada das movimentações e gastos de créditos do usuário autenticado
 */
export const getMyTransactionsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    return await ctx.db
      .query("creditTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/**
 * Consulta os pedidos de recarga do usuário autenticado
 */
export const getMyOrders = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const limit = Math.min(args.limit ?? 20, 50);
    return await ctx.db
      .query("creditOrders")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(limit);
  },
});

/**
 * Registra um pedido pendente de recarga (Mercado Pago PIX ou Cartão)
 */
export const createPendingOrder = mutation({
  args: {
    amountBrl: v.number(),
    creditsBase: v.number(),
    creditsBonus: v.number(),
    creditsTotal: v.number(),
    packageSlug: v.optional(v.string()),
    paymentMethod: v.union(v.literal("pix"), v.literal("credit_card")),
    mpPaymentId: v.optional(v.string()),
    qrCode: v.optional(v.string()),
    qrCodeBase64: v.optional(v.string()),
    ticketUrl: v.optional(v.string()),
    cardLast4: v.optional(v.string()),
    cardBrand: v.optional(v.string()),
    installments: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const clerkId = identity.subject;
    const now = Date.now();

    // Verificação de Feature Flags do sistema
    if (args.paymentMethod === "pix") {
      await assertFeatureFlag(ctx, "payments_pix", "Recargas via PIX estão temporariamente em manutenção.");
    } else if (args.paymentMethod === "credit_card") {
      await assertFeatureFlag(ctx, "payments_card", "Recargas via Cartão de Crédito estão temporariamente em manutenção.");
    }
    if (!args.packageSlug || args.packageSlug === "custom_deposit") {
      await assertFeatureFlag(ctx, "custom_recharge", "Recargas com valores personalizados estão temporariamente desativadas.");
    }

    const amount = Number(args.amountBrl);
    if (!amount || isNaN(amount) || amount < 5.0 || amount > 50000.0) {
      throw new Error("O valor da recarga deve estar entre R$ 5,00 e R$ 50.000,00.");
    }
    if (!args.creditsTotal || isNaN(args.creditsTotal) || args.creditsTotal <= 0) {
      throw new Error("Quantidade de créditos inválida.");
    }

    const orderId = await ctx.db.insert("creditOrders", {
      userId: clerkId,
      userEmail: identity.email || "usuario@kriativa.app",
      userName: identity.name || undefined,
      amountBrl: Number(amount.toFixed(2)),
      creditsBase: Math.max(0, Math.floor(args.creditsBase)),
      creditsBonus: Math.max(0, Math.floor(args.creditsBonus)),
      creditsTotal: Math.max(1, Math.floor(args.creditsTotal)),
      packageSlug: args.packageSlug,
      paymentMethod: args.paymentMethod,
      status: "pending",
      mpPaymentId: args.mpPaymentId,
      qrCode: args.qrCode,
      qrCodeBase64: args.qrCodeBase64,
      ticketUrl: args.ticketUrl,
      cardLast4: args.cardLast4,
      cardBrand: args.cardBrand,
      installments: args.installments ? Math.min(Math.max(1, args.installments), 12) : 1,
      updatedAt: now,
    });

    return orderId;
  },
});

/**
 * Fulfills an order when payment is confirmed (idempotente e protegido)
 */
export const fulfillOrder = mutation({
  args: {
    orderId: v.optional(v.id("creditOrders")),
    mpPaymentId: v.optional(v.string()),
    status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("cancelled")),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const internalSecret = process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";

    let isAuthorized = false;
    if (args.secret && args.secret === internalSecret) {
      isAuthorized = true;
    } else if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();
      if (user?.role === "admin") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new Error("Acesso não autorizado: apenas o servidor seguro ou administradores podem validar pedidos.");
    }
    let order: any = null;

    if (args.orderId) {
      order = await ctx.db.get(args.orderId);
    } else if (args.mpPaymentId) {
      order = await ctx.db
        .query("creditOrders")
        .withIndex("by_mpPaymentId", (q) => q.eq("mpPaymentId", args.mpPaymentId))
        .first();
    }

    if (!order) {
      throw new Error("Pedido não encontrado.");
    }

    // Se já estiver aprovado, não duplicar créditos
    if (order.status === "approved") {
      return { success: true, alreadyApproved: true, creditsTotal: order.creditsTotal };
    }

    const now = Date.now();

    if (args.status !== "approved") {
      await ctx.db.patch(order._id, {
        status: args.status,
        updatedAt: now,
      });
      await ctx.db.insert("systemLogs", {
        level: args.status === "rejected" ? "warn" : "info",
        category: "payments",
        message: `Pedido ${order._id} marcado como ${args.status}`,
        details: JSON.stringify({ orderId: order._id, userId: order.userId, status: args.status }),
        userId: order.userId,
        timestamp: now,
      });
      return { success: true, status: args.status };
    }

    // 1. Atualizar status do pedido para approved
    const patchData: any = {
      status: "approved",
      paidAt: now,
      updatedAt: now,
    };
    if (args.mpPaymentId && !order.mpPaymentId) {
      patchData.mpPaymentId = args.mpPaymentId;
    }
    await ctx.db.patch(order._id, patchData);

    // 2. Incrementar saldo do usuário
    const clerkId = order.userId;
    let balanceDoc = await ctx.db
      .query("creditBalances")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .first();

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    const claim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .first();

    const settings = await ctx.db
      .query("systemPricingSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
      .first();
    const minThreshold = settings?.minBalanceForDailyBonus ?? 20;

    let currentPaid = balanceDoc?.paidCredits ?? 0;
    let currentBonus =
      balanceDoc?.bonusCredits ??
      (targetUser?.customCredits ?? claim?.creditsRemaining ?? 0);

    const newPaid = currentPaid + order.creditsBase;
    const newBonus = currentBonus + order.creditsBonus;
    const newTotal = newPaid + newBonus;
    const isEligible = newTotal >= minThreshold;

    if (balanceDoc) {
      await ctx.db.patch(balanceDoc._id, {
        paidCredits: newPaid,
        bonusCredits: newBonus,
        totalCredits: newTotal,
        minBalanceEligible: isEligible,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("creditBalances", {
        userId: clerkId,
        paidCredits: newPaid,
        bonusCredits: newBonus,
        totalCredits: newTotal,
        minBalanceEligible: isEligible,
        updatedAt: now,
      });
    }

    // Sincronizar users e claims
    if (targetUser) {
      await ctx.db.patch(targetUser._id, {
        customCredits: newTotal,
      });
    }

    if (claim) {
      await ctx.db.patch(claim._id, {
        creditsRemaining: newTotal,
      });
    }

    // 3. Gravar no livro-razão (creditTransactions)
    await ctx.db.insert("creditTransactions", {
      userId: clerkId,
      amount: order.creditsTotal,
      balanceAfter: newTotal,
      creditType: order.creditsBonus > 0 ? "mixed" : "paid",
      type: "purchase",
      description: `Recarga via Mercado Pago (${order.paymentMethod === "pix" ? "PIX Instantâneo" : "Cartão de Crédito"}): R$ ${order.amountBrl.toFixed(2)} (+${order.creditsTotal} créditos)`,
      adminNotes: `Pedido ID: ${order._id} | MP Ref: ${order.mpPaymentId || "N/A"}`,
      timestamp: now,
    });

    // 4. Gravar log do sistema para observabilidade
    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "payments",
      message: `Recarga aprovada com sucesso: ${order.paymentMethod === "pix" ? "PIX" : "Cartão"} R$ ${order.amountBrl.toFixed(2)} (+${order.creditsTotal} créditos)`,
      details: JSON.stringify({ orderId: order._id, userId: clerkId, mpPaymentId: order.mpPaymentId || args.mpPaymentId }),
      userId: clerkId,
      timestamp: now,
    });

    return {
      success: true,
      newTotal,
      creditsAdded: order.creditsTotal,
    };
  },
});

/**
 * Resgate de Bônus Diário (Mecânica estilo OpenRouter para quem tem saldo ativo)
 */
export const claimDailyBonus = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const clerkId = identity.subject;
    const now = Date.now();

    // Verificação de Feature Flag
    await assertFeatureFlag(ctx, "daily_bonus", "O bônus diário está temporariamente desativado pela administração.");

    const settings = await ctx.db
      .query("systemPricingSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
      .first();

    const minThreshold = settings?.minBalanceForDailyBonus ?? 20;
    const baseDailyBonus = settings?.dailyBonusCredits ?? 5;

    let balanceDoc = await ctx.db
      .query("creditBalances")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .first();

    const isAutoTopUp = balanceDoc?.autoTopUpEnabled ?? false;
    const dailyBonusAmount = isAutoTopUp ? 10 : baseDailyBonus;

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    const claim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .first();

    let currentPaid = balanceDoc?.paidCredits ?? 0;
    let currentBonus =
      balanceDoc?.bonusCredits ??
      (targetUser?.customCredits ?? claim?.creditsRemaining ?? 0);

    const currentTotal = currentPaid + currentBonus;

    if (currentTotal < minThreshold) {
      throw new Error(
        `Para receber o bônus diário, é necessário manter um saldo mínimo de ${minThreshold} créditos (Estúdio Ativo).`
      );
    }

    const lastBonus = balanceDoc?.lastDailyBonusAt ?? 0;
    if (now - lastBonus < 24 * 60 * 60 * 1000) {
      const remainingHours = Math.ceil((24 * 60 * 60 * 1000 - (now - lastBonus)) / (60 * 60 * 1000));
      throw new Error(`Seu bônus diário já foi resgatado. Próximo resgate disponível em aproximadamente ${remainingHours}h.`);
    }

    const newBonus = currentBonus + dailyBonusAmount;
    const newTotal = currentPaid + newBonus;

    if (balanceDoc) {
      await ctx.db.patch(balanceDoc._id, {
        bonusCredits: newBonus,
        totalCredits: newTotal,
        lastDailyBonusAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("creditBalances", {
        userId: clerkId,
        paidCredits: currentPaid,
        bonusCredits: newBonus,
        totalCredits: newTotal,
        minBalanceEligible: true,
        lastDailyBonusAt: now,
        updatedAt: now,
      });
    }

    if (targetUser) {
      await ctx.db.patch(targetUser._id, { customCredits: newTotal });
    }
    if (claim) {
      await ctx.db.patch(claim._id, { creditsRemaining: newTotal });
    }

    await ctx.db.insert("creditTransactions", {
      userId: clerkId,
      amount: dailyBonusAmount,
      balanceAfter: newTotal,
      creditType: "bonus",
      type: "bonus_granted",
      description: isAutoTopUp
        ? `Bônus Diário VIP (Auto Top-up Ativo): +${dailyBonusAmount} créditos grátis`
        : `Bônus Diário de Fidelidade: +${dailyBonusAmount} créditos grátis`,
      timestamp: now,
    });

    return { success: true, bonusAdded: dailyBonusAmount, newTotal };
  },
});

/**
 * Atualiza configurações de Auto Top-up (Recarga Automática) do usuário
 */
export const updateAutoTopUpSettings = mutation({
  args: {
    enabled: v.boolean(),
    threshold: v.number(),
    amountBrl: v.number(),
    cardLast4: v.optional(v.string()),
    cardBrand: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const clerkId = identity.subject;
    const now = Date.now();

    // Verificação de Feature Flag
    if (args.enabled) {
      await assertFeatureFlag(ctx, "auto_topup", "O sistema de Auto Top-up está temporariamente desativado pela administração.");
    }

    // Validações de limites e sanitização
    if (args.threshold < 1 || args.threshold > 10000 || !Number.isFinite(args.threshold)) {
      throw new Error("Limiar de saldo para Auto Top-up inválido.");
    }
    if (args.amountBrl < 5.0 || args.amountBrl > 50000 || !Number.isFinite(args.amountBrl)) {
      throw new Error("Valor mínimo de recarga para Auto Top-up é de R$ 5,00.");
    }

    const balanceDoc = await ctx.db
      .query("creditBalances")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .first();

    const existingCard = balanceDoc?.autoTopUpCardLast4;
    const incomingCard = args.cardLast4;
    const finalCardLast4 = incomingCard || existingCard;
    const finalCardBrand = args.cardBrand || balanceDoc?.autoTopUpCardBrand;

    // Regra estrita: só permite ligar quando houver cartão cadastrado
    if (args.enabled && !finalCardLast4) {
      throw new Error("Para ativar o Auto Top-up, você precisa vincular um cartão de crédito cadastrado primeiro.");
    }

    if (balanceDoc) {
      await ctx.db.patch(balanceDoc._id, {
        autoTopUpEnabled: args.enabled,
        autoTopUpThreshold: args.threshold,
        autoTopUpAmountBrl: args.amountBrl,
        autoTopUpCardLast4: finalCardLast4,
        autoTopUpCardBrand: finalCardBrand,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("creditBalances", {
        userId: clerkId,
        paidCredits: 0,
        bonusCredits: 0,
        totalCredits: 0,
        minBalanceEligible: false,
        autoTopUpEnabled: args.enabled,
        autoTopUpThreshold: args.threshold,
        autoTopUpAmountBrl: args.amountBrl,
        autoTopUpCardLast4: finalCardLast4,
        autoTopUpCardBrand: finalCardBrand,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});
