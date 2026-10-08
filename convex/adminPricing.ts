import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

// Workflows padrões com taxas de GPU estipuladas e margem de lucro alvo
export const DEFAULT_WORKFLOWS = [
  {
    slug: "krea2_turbo",
    name: "Krea-2 Turbo (Text-to-Image)",
    description: "Síntese ultrarrápida de imagens 1024x1024 (~7.5s a ~18s) com UNET Turbo FP8 e CLIP Qwen3-VL",
    gpuType: "48gb" as const,
    provider: "runpod" as const,
    gpuRatePerSecond: 0.000486,
    estimatedSeconds: 18,
    creditsCharged: 2,
    targetMarginPct: 85,
    category: "image_generation",
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: "fasth3_i2v",
    name: "FastH3 (Image-to-Video com Áudio)",
    description: "Animação de quadros com trilha de áudio nativa sincronizada (2s a 5s de vídeo)",
    gpuType: "48gb" as const,
    provider: "runpod" as const,
    gpuRatePerSecond: 0.000486,
    estimatedSeconds: 45,
    creditsCharged: 6,
    targetMarginPct: 85,
    category: "image_to_video",
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: "fasth3_t2v_480p",
    name: "FastH3 Text-to-Video (480p Preview)",
    description: "Geração rápida de vídeo 848x480 com sonoplastia a partir de texto",
    gpuType: "48gb" as const,
    provider: "runpod" as const,
    gpuRatePerSecond: 0.000486,
    estimatedSeconds: 45,
    creditsCharged: 6,
    targetMarginPct: 85,
    category: "video_generation",
    isActive: true,
    sortOrder: 3,
  },
  {
    slug: "fasth3_t2v_720p",
    name: "FastH3 Text-to-Video (720p HD)",
    description: "Geração em alta definição 1344x768 com trilha sonora e efeitos atmosféricos",
    gpuType: "48gb" as const,
    provider: "runpod" as const,
    gpuRatePerSecond: 0.000486,
    estimatedSeconds: 108,
    creditsCharged: 14,
    targetMarginPct: 85,
    category: "video_generation",
    isActive: true,
    sortOrder: 4,
  },
  {
    slug: "seedance25_t2v",
    name: "Seedance 2.5 Cinema Master (Higgsfield API)",
    description: "Modelo multimodal ByteDance via Higgsfield API com áudio nativo sincronizado, 720p/1080p e até 30s",
    gpuType: "cloud_api" as const,
    provider: "higgsfield" as const,
    gpuRatePerSecond: 0.00065,
    estimatedSeconds: 50,
    creditsCharged: 20,
    targetMarginPct: 85,
    category: "video_generation",
    isActive: true,
    sortOrder: 5,
  },
  {
    slug: "ltx25_i2v",
    name: "LTX-2.5 Distilled HD (Image-to-Video)",
    description: "Transformer de 22B com Gemma-4 12B, upscale espacial duplo e física refinada 1280x704 @ 24fps",
    gpuType: "48gb" as const,
    provider: "runpod" as const,
    gpuRatePerSecond: 0.000486,
    estimatedSeconds: 218,
    creditsCharged: 30,
    targetMarginPct: 85,
    category: "video_generation",
    isActive: true,
    sortOrder: 6,
  },
  {
    slug: "upscale-4k-rife",
    name: "Super-Resolution 4K & RIFE",
    description: "Upscaling espacial 4K HDR e interpolação de frames para 60fps cinemático",
    gpuType: "48gb" as const,
    provider: "runpod" as const,
    gpuRatePerSecond: 0.000486,
    estimatedSeconds: 30,
    creditsCharged: 15,
    targetMarginPct: 85,
    category: "upscaling",
    isActive: true,
    sortOrder: 7,
  },
];

export const DEFAULT_SETTINGS = {
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
 * Normaliza slugs de workflows para interoperabilidade entre backend e engines
 */
export function normalizeWorkflowSlug(slug: string): string {
  const s = slug.toLowerCase().trim().replace(/-/g, "_");
  if (s === "krea_2_turbo") return "krea2_turbo";
  if (s === "ltx_2_5_720p" || s === "ltx_2_5" || s === "ltx25") return "ltx25_i2v";
  return s;
}

export interface WorkflowPricingCalculation {
  gpuCostUsd: number;
  gpuCostBrl: number;
  targetMarginPct: number;
  targetRevenueBrl: number;
  targetRevenueUsd: number;
  creditsCharged: number;
  revenueBrl: number;
  revenueUsd: number;
  netProfitBrl: number;
  netProfitUsd: number;
  grossMarginPct: number;
}

/**
 * Motor Matemático Contábil de Precificação por Tempo de Execução & Margem de Lucro:
 * 
 * Custo GPU = estimatedSeconds * gpuRatePerSecond
 * Receita Alvo = Custo GPU / (1 - targetMarginPct / 100)
 * Créditos Cobrados = ceil(Receita Alvo BRL / creditValueBrl)
 * 
 * O arredondamento para cima (ceil) garante matematicamente que a margem real de lucro
 * NUNCA será inferior à margem alvo estipulada pelo administrador.
 */
export function calculateWorkflowPricing(params: {
  estimatedSeconds: number;
  gpuRatePerSecond: number;
  usdToBrlRate: number;
  creditValueBrl: number;
  targetMarginPct?: number;
  creditsCharged?: number;
}): WorkflowPricingCalculation {
  const {
    estimatedSeconds,
    gpuRatePerSecond,
    usdToBrlRate,
    creditValueBrl,
  } = params;

  const validCreditValue = Math.max(0.01, creditValueBrl || 0.25);
  const validUsdToBrl = Math.max(1, usdToBrlRate || 5.8);
  const validSeconds = Math.max(1, estimatedSeconds);
  const validRate = Math.max(0.000001, gpuRatePerSecond);

  const gpuCostUsd = validSeconds * validRate;
  const gpuCostBrl = gpuCostUsd * validUsdToBrl;

  let targetMarginPct = params.targetMarginPct;
  let credits = params.creditsCharged;

  if (targetMarginPct !== undefined && targetMarginPct !== null && targetMarginPct >= 0 && targetMarginPct < 100) {
    const marginFraction = targetMarginPct / 100;
    const targetRevenueBrl = gpuCostBrl / Math.max(0.01, 1 - marginFraction);
    if (credits === undefined || credits === null) {
      credits = Math.max(1, Math.ceil(targetRevenueBrl / validCreditValue));
    }
  } else if (credits !== undefined && credits > 0) {
    const revenueBrl = credits * validCreditValue;
    const profitBrl = revenueBrl - gpuCostBrl;
    targetMarginPct = revenueBrl > 0 ? Number(((profitBrl / revenueBrl) * 100).toFixed(1)) : 85;
  } else {
    targetMarginPct = 85;
    const marginFraction = 0.85;
    const targetRevenueBrl = gpuCostBrl / (1 - marginFraction);
    credits = Math.max(1, Math.ceil(targetRevenueBrl / validCreditValue));
  }

  const finalCredits = Math.max(1, Math.round(credits || 1));
  const targetRevenueBrl = gpuCostBrl / Math.max(0.01, 1 - (targetMarginPct / 100));
  const targetRevenueUsd = targetRevenueBrl / validUsdToBrl;

  const revenueBrl = finalCredits * validCreditValue;
  const revenueUsd = revenueBrl / validUsdToBrl;
  const netProfitBrl = revenueBrl - gpuCostBrl;
  const netProfitUsd = revenueUsd - gpuCostUsd;
  const grossMarginPct = revenueBrl > 0 ? (netProfitBrl / revenueBrl) * 100 : 0;

  return {
    gpuCostUsd: Number(gpuCostUsd.toFixed(6)),
    gpuCostBrl: Number(gpuCostBrl.toFixed(4)),
    targetMarginPct: Number(targetMarginPct.toFixed(1)),
    targetRevenueBrl: Number(targetRevenueBrl.toFixed(4)),
    targetRevenueUsd: Number(targetRevenueUsd.toFixed(4)),
    creditsCharged: finalCredits,
    revenueBrl: Number(revenueBrl.toFixed(4)),
    revenueUsd: Number(revenueUsd.toFixed(4)),
    netProfitBrl: Number(netProfitBrl.toFixed(4)),
    netProfitUsd: Number(netProfitUsd.toFixed(4)),
    grossMarginPct: Number(grossMarginPct.toFixed(1)),
  };
}

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

    let averageCreditValueBrl = settings.customCreditPriceBrl || 0.25;
    if (packages.length > 0) {
      const totalR = packages.reduce((acc, p) => acc + p.priceBrl, 0);
      const totalC = packages.reduce((acc, p) => acc + (p.creditsBase + p.creditsBonus), 0);
      if (totalC > 0) {
        averageCreditValueBrl = totalR / totalC;
      }
    }

    const usdToBrl = settings.usdToBrlRate || 5.8;

    // 4. Calcular Unit Economics para cada workflow com garantia de margem
    const workflowsEconomics = workflows.map((wf) => {
      const targetMargin = wf.targetMarginPct ?? 85;
      const calc = calculateWorkflowPricing({
        estimatedSeconds: wf.estimatedSeconds,
        gpuRatePerSecond: wf.gpuRatePerSecond,
        usdToBrlRate: usdToBrl,
        creditValueBrl: averageCreditValueBrl,
        targetMarginPct: targetMargin,
        creditsCharged: wf.creditsCharged,
      });

      // Cálculo de Break-Even para Servidor Fixo (quando mudar para dedicado)
      const dedicatedCostMonthly =
        wf.gpuType === "80gb"
          ? settings.fixedGpu80gbMonthlyUsd
          : settings.fixedGpu48gbMonthlyUsd;

      const crossoverRunsPerMonth = calc.gpuCostUsd > 0 ? Math.ceil(dedicatedCostMonthly / calc.gpuCostUsd) : 0;
      const crossoverRunsPerDay = Math.ceil(crossoverRunsPerMonth / 30);

      return {
        ...wf,
        targetMarginPct: wf.targetMarginPct ?? calc.targetMarginPct,
        economics: {
          ...calc,
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
 * Cria ou atualiza um workflow de ComfyUI com tempo de execução e margem de lucro
 */
export const upsertWorkflow = mutation({
  args: {
    id: v.optional(v.id("workflowPricing")),
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    gpuType: v.union(v.literal("80gb"), v.literal("48gb"), v.literal("cloud_api")),
    gpuRatePerSecond: v.number(),
    estimatedSeconds: v.number(),
    creditsCharged: v.number(),
    targetMarginPct: v.optional(v.number()),
    provider: v.optional(v.union(v.literal("runpod"), v.literal("higgsfield"))),
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
    if (args.estimatedSeconds <= 0) throw new Error("O tempo estimado de execução deve ser maior que zero.");
    if (args.creditsCharged <= 0) throw new Error("A cobrança em créditos deve ser maior que zero.");

    const now = Date.now();
    const targetMarginPct = args.targetMarginPct !== undefined ? Math.max(0, Math.min(99.9, args.targetMarginPct)) : undefined;

    const dataToSave = {
      slug: cleanSlug,
      name: cleanName,
      description: args.description.trim(),
      gpuType: args.gpuType,
      gpuRatePerSecond: args.gpuRatePerSecond,
      estimatedSeconds: Math.round(args.estimatedSeconds),
      creditsCharged: Math.round(args.creditsCharged),
      targetMarginPct,
      provider: args.provider || (cleanSlug.includes("seedance") ? "higgsfield" : "runpod"),
      category: args.category.trim(),
      isActive: args.isActive,
      sortOrder: args.sortOrder,
      updatedAt: now,
    };

    if (args.id) {
      await ctx.db.patch(args.id, dataToSave);

      await ctx.db.insert("systemLogs", {
        level: "info",
        category: "pricing",
        message: `Workflow "${cleanName}" (${cleanSlug}) atualizado: ${dataToSave.estimatedSeconds}s, ${dataToSave.creditsCharged} créditos, margem ${targetMarginPct ?? "N/A"}%`,
        details: JSON.stringify(dataToSave),
        timestamp: now,
      });

      return { success: true, action: "updated" };
    }

    // Verificar se já existe com mesmo slug
    const existing = await ctx.db
      .query("workflowPricing")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, dataToSave);

      await ctx.db.insert("systemLogs", {
        level: "info",
        category: "pricing",
        message: `Workflow "${cleanName}" (${cleanSlug}) atualizado via slug existente`,
        details: JSON.stringify(dataToSave),
        timestamp: now,
      });

      return { success: true, action: "updated_existing" };
    }

    const newId = await ctx.db.insert("workflowPricing", dataToSave);

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "pricing",
      message: `Novo workflow criado: "${cleanName}" (${cleanSlug}) com ${dataToSave.creditsCharged} créditos e ${dataToSave.estimatedSeconds}s de execução`,
      details: JSON.stringify(dataToSave),
      timestamp: now,
    });

    return { success: true, action: "created", id: newId };
  },
});

/**
 * Ajusta exclusivamente a margem de lucro de um workflow e recalcula o preço em créditos automaticamente
 */
export const updateWorkflowMargin = mutation({
  args: {
    id: v.id("workflowPricing"),
    targetMarginPct: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.targetMarginPct < 0 || args.targetMarginPct >= 100) {
      throw new Error("A margem de lucro deve estar entre 0% e 99.9%.");
    }

    const wf = await ctx.db.get(args.id);
    if (!wf) throw new Error("Workflow não encontrado.");

    const settingsDoc = await ctx.db
      .query("systemPricingSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
      .first();

    const usdToBrl = settingsDoc?.usdToBrlRate || 5.8;
    const creditPrice = settingsDoc?.customCreditPriceBrl || 0.25;

    const calc = calculateWorkflowPricing({
      estimatedSeconds: wf.estimatedSeconds,
      gpuRatePerSecond: wf.gpuRatePerSecond,
      usdToBrlRate: usdToBrl,
      creditValueBrl: creditPrice,
      targetMarginPct: args.targetMarginPct,
    });

    const now = Date.now();
    await ctx.db.patch(args.id, {
      targetMarginPct: args.targetMarginPct,
      creditsCharged: calc.creditsCharged,
      updatedAt: now,
    });

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "pricing",
      message: `Margem do workflow "${wf.name}" alterada para ${args.targetMarginPct}% (preço ajustado para ${calc.creditsCharged} créditos)`,
      details: JSON.stringify({
        workflowId: wf._id,
        slug: wf.slug,
        targetMarginPct: args.targetMarginPct,
        newCreditsCharged: calc.creditsCharged,
        effectiveMarginPct: calc.grossMarginPct,
        estimatedSeconds: wf.estimatedSeconds,
        gpuCostBrl: calc.gpuCostBrl,
      }),
      timestamp: now,
    });

    return {
      success: true,
      newCreditsCharged: calc.creditsCharged,
      effectiveMarginPct: calc.grossMarginPct,
      gpuCostBrl: calc.gpuCostBrl,
    };
  },
});

/**
 * Ajusta a margem de lucro em lote para todos os workflows ativos
 */
export const bulkUpdateWorkflowsMargin = mutation({
  args: {
    targetMarginPct: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.targetMarginPct < 0 || args.targetMarginPct >= 100) {
      throw new Error("A margem de lucro deve estar entre 0% e 99.9%.");
    }

    const workflows = await ctx.db.query("workflowPricing").collect();
    const settingsDoc = await ctx.db
      .query("systemPricingSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_pricing_config"))
      .first();

    const usdToBrl = settingsDoc?.usdToBrlRate || 5.8;
    const creditPrice = settingsDoc?.customCreditPriceBrl || 0.25;
    const now = Date.now();

    let count = 0;
    for (const wf of workflows) {
      const calc = calculateWorkflowPricing({
        estimatedSeconds: wf.estimatedSeconds,
        gpuRatePerSecond: wf.gpuRatePerSecond,
        usdToBrlRate: usdToBrl,
        creditValueBrl: creditPrice,
        targetMarginPct: args.targetMarginPct,
      });

      await ctx.db.patch(wf._id, {
        targetMarginPct: args.targetMarginPct,
        creditsCharged: calc.creditsCharged,
        updatedAt: now,
      });
      count++;
    }

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "pricing",
      message: `Margem global de todos os workflows ajustada para ${args.targetMarginPct}% (${count} workflows)`,
      details: JSON.stringify({ targetMarginPct: args.targetMarginPct, count }),
      timestamp: now,
    });

    return { success: true, count };
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
 * Inicialização (Seed) automática ou ressincronização de workflows com margem e tempos padrão
 */
export const seedDefaultWorkflows = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.query("workflowPricing").collect();
    const now = Date.now();
    let seededCount = 0;
    let updatedCount = 0;

    for (const w of DEFAULT_WORKFLOWS) {
      const match = existing.find(
        (e) => e.slug === w.slug || e.slug === w.slug.replace(/_/g, "-") || normalizeWorkflowSlug(e.slug) === normalizeWorkflowSlug(w.slug)
      );

      if (!match) {
        await ctx.db.insert("workflowPricing", {
          ...w,
          updatedAt: now,
        });
        seededCount++;
      } else {
        await ctx.db.patch(match._id, {
          slug: w.slug,
          targetMarginPct: match.targetMarginPct ?? w.targetMarginPct,
          estimatedSeconds: match.estimatedSeconds || w.estimatedSeconds,
          gpuRatePerSecond: match.gpuRatePerSecond || w.gpuRatePerSecond,
          updatedAt: now,
        });
        updatedCount++;
      }
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

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "pricing",
      message: `Workflows sincronizados: ${seededCount} novos inseridos, ${updatedCount} atualizados`,
      details: JSON.stringify({ seededCount, updatedCount }),
      timestamp: now,
    });

    return { seeded: seededCount > 0, seededCount, updatedCount, total: existing.length + seededCount };
  },
});
