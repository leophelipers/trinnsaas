import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

// Workflows padrões com taxas de GPU estipuladas
const DEFAULT_WORKFLOWS = [
  {
    slug: "wan-2-1-720p",
    name: "Wan 2.1 (720p Cinematic)",
    description: "Geração cinemática de alta fluidez 720p 24fps via ComfyUI (modelo de ponta)",
    gpuType: "48gb" as const,
    gpuRatePerSecond: 0.000486,
    estimatedSeconds: 35,
    creditsCharged: 25,
    category: "video_generation",
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: "hunyuan-video-1080p",
    name: "Hunyuan Video (1080p HD)",
    description: "Renderização ultra-detalhada 1080p com alta coerência temporal e física",
    gpuType: "80gb" as const,
    gpuRatePerSecond: 0.000756,
    estimatedSeconds: 65,
    creditsCharged: 60,
    category: "video_generation",
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: "ltx-video-preview",
    name: "LTX-Video (Rascunho Rápido)",
    description: "Prévia de movimentos e composições rápidas de cena com latência ultra-baixa",
    gpuType: "48gb" as const,
    gpuRatePerSecond: 0.000486,
    estimatedSeconds: 14,
    creditsCharged: 10,
    category: "video_generation",
    isActive: true,
    sortOrder: 3,
  },
  {
    slug: "upscale-4k-rife",
    name: "Super-Resolution 4K & RIFE",
    description: "Upscaling espacial 4K HDR e interpolação de frames para 60fps cinemático",
    gpuType: "48gb" as const,
    gpuRatePerSecond: 0.000486,
    estimatedSeconds: 18,
    creditsCharged: 15,
    category: "upscaling",
    isActive: true,
    sortOrder: 4,
  },
  {
    slug: "cogvideox-5b-i2v",
    name: "CogVideoX-5B (Image-to-Video)",
    description: "Animação realista a partir de foto/render fixo com movimentação dinâmica de câmera",
    gpuType: "80gb" as const,
    gpuRatePerSecond: 0.000756,
    estimatedSeconds: 48,
    creditsCharged: 40,
    category: "image_to_video",
    isActive: true,
    sortOrder: 5,
  },
];

const DEFAULT_SETTINGS = {
  key: "global_pricing_config",
  usdToBrlRate: 5.8,
  fixedGpu48gbMonthlyUsd: 800, // Custo médio de uma instância dedicada 48GB / mês
  fixedGpu80gbMonthlyUsd: 1800, // Custo médio de uma instância dedicada 80GB (A100/H100) / mês
  minBalanceForDailyBonus: 20, // Saldo mínimo estilo OpenRouter para bônus diário
  dailyBonusCredits: 5, // Créditos gratuitos concedidos diariamente aos estúdios ativos
  minCustomDepositBrl: 5.0, // Valor mínimo escolhido pelo usuário: R$ 5,00
  customCreditPriceBrl: 0.25, // Preço base por crédito em valor livre: R$ 0,25
  allowCustomDeposit: true, // Habilitar recarga em valor livre
};

/**
 * Consulta a visão geral de precificação, workflows cadastrados e unit economics
 */
export const getPricingOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // 1. Obter ou compor configurações globais
    const settingsDoc = await ctx.db
      .query("systemPricingSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
      .first();

    const settings = settingsDoc || {
      ...DEFAULT_SETTINGS,
      _id: "default" as any,
      _creationTime: Date.now(),
      updatedAt: Date.now(),
    };

    // 2. Obter workflows
    let workflows = await ctx.db
      .query("workflowPricing")
      .withIndex("by_sortOrder")
      .collect();

    if (workflows.length === 0) {
      workflows = DEFAULT_WORKFLOWS.map((w, idx) => ({
        ...w,
        _id: `fallback_${idx}` as any,
        _creationTime: Date.now(),
        updatedAt: Date.now(),
      }));
    }

    // 3. Obter pacotes para calcular valor médio real do crédito em BRL
    const packages = await ctx.db
      .query("creditPackages")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    let averageCreditValueBrl = 0.25;
    if (packages.length > 0) {
      const totalR = packages.reduce((acc, p) => acc + p.priceBrl, 0);
      const totalC = packages.reduce((acc, p) => acc + (p.creditsBase + p.creditsBonus), 0);
      if (totalC > 0) {
        averageCreditValueBrl = totalR / totalC;
      }
    }

    const usdToBrl = settings.usdToBrlRate || 5.8;

    // 4. Calcular Unit Economics para cada workflow
    const workflowsEconomics = workflows.map((wf) => {
      const gpuRate = wf.gpuRatePerSecond;
      const gpuCostUsd = wf.estimatedSeconds * gpuRate;
      const gpuCostBrl = gpuCostUsd * usdToBrl;

      // Faturamento gerado cobrando os créditos estipulados
      const revenueBrl = wf.creditsCharged * averageCreditValueBrl;
      const revenueUsd = revenueBrl / usdToBrl;

      const netProfitUsd = revenueUsd - gpuCostUsd;
      const netProfitBrl = revenueBrl - gpuCostBrl;
      const grossMarginPct = revenueUsd > 0 ? (netProfitUsd / revenueUsd) * 100 : 0;

      // Cálculo de Break-Even para Servidor Fixo (quando mudar para dedicado)
      const dedicatedCostMonthly =
        wf.gpuType === "80gb"
          ? settings.fixedGpu80gbMonthlyUsd
          : settings.fixedGpu48gbMonthlyUsd;

      // Quantos renders mensais pagam uma máquina dedicada 24/7 deste tipo de GPU
      const crossoverRunsPerMonth = gpuCostUsd > 0 ? Math.ceil(dedicatedCostMonthly / gpuCostUsd) : 0;
      const crossoverRunsPerDay = Math.ceil(crossoverRunsPerMonth / 30);

      return {
        ...wf,
        economics: {
          gpuCostUsd,
          gpuCostBrl,
          revenueBrl,
          revenueUsd,
          netProfitBrl,
          netProfitUsd,
          grossMarginPct: Number(grossMarginPct.toFixed(1)),
          crossoverRunsPerMonth,
          crossoverRunsPerDay,
          dedicatedCostMonthly,
        },
      };
    });

    return {
      settings,
      averageCreditValueBrl: Number(averageCreditValueBrl.toFixed(4)),
      workflows: workflowsEconomics,
    };
  },
});

/**
 * Cria ou atualiza um workflow de ComfyUI (sem necessidade de novo deploy)
 */
export const upsertWorkflow = mutation({
  args: {
    id: v.optional(v.id("workflowPricing")),
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    gpuType: v.union(v.literal("80gb"), v.literal("48gb")),
    gpuRatePerSecond: v.number(),
    estimatedSeconds: v.number(),
    creditsCharged: v.number(),
    category: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const cleanSlug = args.slug.trim().toLowerCase();
    const cleanName = args.name.trim();

    if (!cleanSlug) throw new Error("Slug do workflow é obrigatório.");
    if (!cleanName) throw new Error("Nome do workflow é obrigatório.");
    if (args.estimatedSeconds <= 0) throw new Error("O tempo estimado deve ser maior que zero.");
    if (args.creditsCharged <= 0) throw new Error("A cobrança em créditos deve ser maior que zero.");

    const now = Date.now();

    if (args.id) {
      await ctx.db.patch(args.id, {
        slug: cleanSlug,
        name: cleanName,
        description: args.description.trim(),
        gpuType: args.gpuType,
        gpuRatePerSecond: args.gpuRatePerSecond,
        estimatedSeconds: Math.round(args.estimatedSeconds),
        creditsCharged: Math.round(args.creditsCharged),
        category: args.category.trim(),
        isActive: args.isActive,
        sortOrder: args.sortOrder,
        updatedAt: now,
      });
      return { success: true, action: "updated" };
    }

    // Verificar se já existe com mesmo slug
    const existing = await ctx.db
      .query("workflowPricing")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: cleanName,
        description: args.description.trim(),
        gpuType: args.gpuType,
        gpuRatePerSecond: args.gpuRatePerSecond,
        estimatedSeconds: Math.round(args.estimatedSeconds),
        creditsCharged: Math.round(args.creditsCharged),
        category: args.category.trim(),
        isActive: args.isActive,
        sortOrder: args.sortOrder,
        updatedAt: now,
      });
      return { success: true, action: "updated_existing" };
    }

    const newId = await ctx.db.insert("workflowPricing", {
      slug: cleanSlug,
      name: cleanName,
      description: args.description.trim(),
      gpuType: args.gpuType,
      gpuRatePerSecond: args.gpuRatePerSecond,
      estimatedSeconds: Math.round(args.estimatedSeconds),
      creditsCharged: Math.round(args.creditsCharged),
      category: args.category.trim(),
      isActive: args.isActive,
      sortOrder: args.sortOrder,
      updatedAt: now,
    });

    return { success: true, action: "created", id: newId };
  },
});

/**
 * Ativa / Desativa um workflow
 */
export const toggleWorkflowActive = mutation({
  args: {
    id: v.id("workflowPricing"),
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
 * Remove um workflow de precificação
 */
export const deleteWorkflow = mutation({
  args: {
    id: v.id("workflowPricing"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Atualiza configurações de custos de infraestrutura, cotação USD/BRL e recarga livre
 */
export const updatePricingSettings = mutation({
  args: {
    usdToBrlRate: v.number(),
    fixedGpu48gbMonthlyUsd: v.number(),
    fixedGpu80gbMonthlyUsd: v.number(),
    minBalanceForDailyBonus: v.number(),
    dailyBonusCredits: v.number(),
    minCustomDepositBrl: v.optional(v.number()),
    customCreditPriceBrl: v.optional(v.number()),
    allowCustomDeposit: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("systemPricingSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
      .first();

    const now = Date.now();
    const data = {
      key: "global_pricing_config",
      usdToBrlRate: args.usdToBrlRate,
      fixedGpu48gbMonthlyUsd: args.fixedGpu48gbMonthlyUsd,
      fixedGpu80gbMonthlyUsd: args.fixedGpu80gbMonthlyUsd,
      minBalanceForDailyBonus: Math.max(0, args.minBalanceForDailyBonus),
      dailyBonusCredits: Math.max(0, args.dailyBonusCredits),
      minCustomDepositBrl: Math.max(1, args.minCustomDepositBrl ?? 5.0),
      customCreditPriceBrl: Math.max(0.01, args.customCreditPriceBrl ?? 0.25),
      allowCustomDeposit: args.allowCustomDeposit ?? true,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("systemPricingSettings", data);
    }

    return { success: true };
  },
});

/**
 * Calcula quantidade de créditos e bônus progressivo para qualquer valor livre escolhido pelo usuário (mínimo de R$ 5,00)
 */
export const calculateCustomCredits = query({
  args: {
    amountBrl: v.number(),
  },
  handler: async (ctx, args) => {
    const settingsDoc = await ctx.db
      .query("systemPricingSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
      .first();

    const minAmount = settingsDoc?.minCustomDepositBrl ?? 5.0;
    const pricePerCredit = settingsDoc?.customCreditPriceBrl ?? 0.25;

    const amount = Math.max(0, args.amountBrl);
    const isValid = amount >= minAmount;

    // Quantidade de créditos base
    const baseCredits = Math.floor(amount / pricePerCredit);

    // Bônus progressivo por faixas de valor
    let bonusPct = 0;
    if (amount >= 250) {
      bonusPct = 25; // +25% de bônus (Tier Cinema)
    } else if (amount >= 100) {
      bonusPct = 15; // +15% de bônus (Tier Director)
    } else if (amount >= 50) {
      bonusPct = 10; // +10% de bônus (Tier Creator)
    }

    const bonusCredits = Math.round((baseCredits * bonusPct) / 100);
    const totalCredits = baseCredits + bonusCredits;
    const effectiveCostPerCredit = totalCredits > 0 ? amount / totalCredits : pricePerCredit;

    return {
      amountBrl: amount,
      minAmountRequired: minAmount,
      isValid,
      pricePerCredit,
      baseCredits,
      bonusPct,
      bonusCredits,
      totalCredits,
      effectiveCostPerCredit: Number(effectiveCostPerCredit.toFixed(3)),
    };
  },
});

/**
 * Inicialização (Seed) automática de workflows caso a tabela esteja vazia
 */
export const seedDefaultWorkflows = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.query("workflowPricing").collect();
    if (existing.length > 0) {
      return { seeded: false, count: existing.length };
    }

    const now = Date.now();
    for (const w of DEFAULT_WORKFLOWS) {
      await ctx.db.insert("workflowPricing", {
        ...w,
        updatedAt: now,
      });
    }

    const existingSettings = await ctx.db
      .query("systemPricingSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
      .first();

    if (!existingSettings) {
      await ctx.db.insert("systemPricingSettings", {
        ...DEFAULT_SETTINGS,
        updatedAt: now,
      });
    }

    return { seeded: true, count: DEFAULT_WORKFLOWS.length };
  },
});
