import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

export interface DefaultDeveloperRoute {
  modelSlug: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  provider: "openrouter" | "runpod";
  openRouterModel: string;
  runpodModel: string;
  runpodEndpointUrl?: string;
  supportsReasoning: boolean;
  sortOrder: number;
}

export const DEFAULT_DEVELOPER_ROUTES: DefaultDeveloperRoute[] = [
  {
    modelSlug: "kriativa-code",
    displayName: "Kriativa Code (Engenharia & Shaders)",
    description: "Motor especializado em programação, shaders GLSL, pipelines e engenharia de software no OpenCode.",
    isEnabled: true,
    provider: "openrouter",
    openRouterModel: "qwen/qwen-2.5-coder-32b-instruct",
    runpodModel: "Qwen/Qwen2.5-Coder-32B-Instruct",
    supportsReasoning: false,
    sortOrder: 1,
  },
  {
    modelSlug: "kriativa-mind",
    displayName: "Kriativa Mind (Direção & Raciocínio Híbrido)",
    description: "Motor principal multipropósito para arquitetura de software, decupagem técnica e raciocínio avançado.",
    isEnabled: true,
    provider: "openrouter",
    openRouterModel: "anthropic/claude-3.7-sonnet",
    runpodModel: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    supportsReasoning: true,
    sortOrder: 2,
  },
  {
    modelSlug: "kriativa-reasoning",
    displayName: "Kriativa Reasoning (Instância Dedicada)",
    description: "Motor de inferência profunda com cadeia de pensamento (CoT) para problemas complexos e tensores.",
    isEnabled: true,
    provider: "runpod",
    openRouterModel: "deepseek/deepseek-r1",
    runpodModel: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    supportsReasoning: true,
    sortOrder: 3,
  },
  {
    modelSlug: "kriativa-fast",
    displayName: "Kriativa Fast (Iterações Ultrarrápidas)",
    description: "Motor de altíssima velocidade e baixo consumo de créditos para tarefas ágeis e autocomplete.",
    isEnabled: true,
    provider: "openrouter",
    openRouterModel: "google/gemini-2.5-flash",
    runpodModel: "meta-llama/Llama-3.2-3B-Instruct",
    supportsReasoning: false,
    sortOrder: 4,
  },
];

/**
 * Consulta de rotas de modelos para o PAINEL ADMINISTRATIVO.
 * Permite ao admin ver e alterar o mapeamento de OpenRouter vs RunPod para cada modelo.
 */
export const listAdminModelRoutes = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const dbRoutes = await ctx.db
      .query("developerModelRoutes")
      .withIndex("by_sortOrder")
      .collect();

    if (dbRoutes.length === 0) {
      return DEFAULT_DEVELOPER_ROUTES.map((d) => ({
        ...d,
        _id: null,
        updatedAt: Date.now(),
        updatedBy: "Padrão do Sistema",
      }));
    }

    // Mescla com os padrões caso algum novo slug tenha sido adicionado
    const dbMap = new Map(dbRoutes.map((r) => [r.modelSlug, r]));
    const result = DEFAULT_DEVELOPER_ROUTES.map((def) => {
      const existing = dbMap.get(def.modelSlug);
      if (existing) {
        return {
          _id: existing._id,
          modelSlug: existing.modelSlug,
          displayName: existing.displayName,
          description: existing.description,
          isEnabled: existing.isEnabled,
          provider: existing.provider,
          openRouterModel: existing.openRouterModel,
          runpodModel: existing.runpodModel,
          runpodEndpointUrl: existing.runpodEndpointUrl,
          supportsReasoning: existing.supportsReasoning,
          sortOrder: existing.sortOrder,
          updatedAt: existing.updatedAt,
          updatedBy: existing.updatedBy,
        };
      }
      return {
        ...def,
        _id: null,
        updatedAt: Date.now(),
        updatedBy: "Padrão do Sistema",
      };
    });

    return result;
  },
});

/**
 * Atualiza ou insere a rota de um modelo proprietário da Kriativa (Exclusivo Administrador)
 */
export const updateModelRoute = mutation({
  args: {
    modelSlug: v.string(),
    displayName: v.string(),
    description: v.string(),
    isEnabled: v.boolean(),
    provider: v.union(v.literal("openrouter"), v.literal("runpod")),
    openRouterModel: v.string(),
    runpodModel: v.string(),
    runpodEndpointUrl: v.optional(v.string()),
    supportsReasoning: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { user, identity } = await requireAdmin(ctx);
    const now = Date.now();
    const adminEmail = user.email || identity.email || "admin";

    const existing = await ctx.db
      .query("developerModelRoutes")
      .withIndex("by_modelSlug", (q) => q.eq("modelSlug", args.modelSlug))
      .first();

    const def = DEFAULT_DEVELOPER_ROUTES.find((d) => d.modelSlug === args.modelSlug);
    const sortOrder = def?.sortOrder ?? 10;

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        description: args.description,
        isEnabled: args.isEnabled,
        provider: args.provider,
        openRouterModel: args.openRouterModel.trim(),
        runpodModel: args.runpodModel.trim(),
        runpodEndpointUrl: args.runpodEndpointUrl?.trim() || undefined,
        supportsReasoning: args.supportsReasoning,
        updatedAt: now,
        updatedBy: adminEmail,
      });
    } else {
      await ctx.db.insert("developerModelRoutes", {
        modelSlug: args.modelSlug,
        displayName: args.displayName,
        description: args.description,
        isEnabled: args.isEnabled,
        provider: args.provider,
        openRouterModel: args.openRouterModel.trim(),
        runpodModel: args.runpodModel.trim(),
        runpodEndpointUrl: args.runpodEndpointUrl?.trim() || undefined,
        supportsReasoning: args.supportsReasoning,
        sortOrder,
        updatedAt: now,
        updatedBy: adminEmail,
      });
    }

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "developer_api",
      message: `Rota do modelo "${args.modelSlug}" atualizada: Provedor ${args.provider.toUpperCase()} (${args.provider === "openrouter" ? args.openRouterModel : args.runpodModel}) por ${adminEmail}`,
      details: JSON.stringify(args),
      userId: identity.subject,
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Consulta PÚBLICA dos modelos disponíveis para o OpenCode (`GET /api/v1/models`).
 * BLINDAGEM COMPLETA: Retorna EXCLUSIVAMENTE nomes, categorias e metadados da KRIATIVA.
 * NUNCA vaza os nomes reais do OpenRouter ou do RunPod.
 */
export const listPublicModels = query({
  args: {},
  handler: async (ctx) => {
    const dbRoutes = await ctx.db
      .query("developerModelRoutes")
      .withIndex("by_sortOrder")
      .collect();

    const routes = dbRoutes.length > 0 ? dbRoutes : DEFAULT_DEVELOPER_ROUTES;

    return routes
      .filter((r) => r.isEnabled)
      .map((r) => ({
        id: r.modelSlug,
        name: r.displayName,
        description: r.description,
        supportsReasoning: r.supportsReasoning,
        owned_by: "kriativa",
      }));
  },
});

/**
 * Resolução dinâmica da rota pelo Gateway HTTP (`POST /api/v1/chat/completions`)
 */
export const getRouteConfigInternal = query({
  args: {
    modelSlug: v.string(),
  },
  handler: async (ctx, args) => {
    // Normaliza variações digitadas (ex: "kriativa/code" -> "kriativa-code")
    let clean = (args.modelSlug || "").toLowerCase().trim().replace(/^kriativa\//, "kriativa-");

    // Aliases práticos
    if (!clean.startsWith("kriativa-")) {
      if (clean.includes("code") || clean.includes("coder") || clean.includes("dev")) {
        clean = "kriativa-code";
      } else if (clean.includes("reasoning") || clean.includes("r1") || clean.includes("deep")) {
        clean = "kriativa-reasoning";
      } else if (clean.includes("fast") || clean.includes("flash") || clean.includes("speed")) {
        clean = "kriativa-fast";
      } else {
        clean = "kriativa-mind";
      }
    }

    const route = await ctx.db
      .query("developerModelRoutes")
      .withIndex("by_modelSlug", (q) => q.eq("modelSlug", clean))
      .first();

    if (route) {
      return {
        found: true,
        canonicalId: route.modelSlug,
        displayName: route.displayName,
        isEnabled: route.isEnabled,
        provider: route.provider,
        targetModel: route.provider === "openrouter" ? route.openRouterModel : route.runpodModel,
        runpodEndpointUrl: route.runpodEndpointUrl,
      };
    }

    // Fallback para lista padrão
    const def = DEFAULT_DEVELOPER_ROUTES.find((d) => d.modelSlug === clean) || DEFAULT_DEVELOPER_ROUTES[1]; // kriativa-mind
    return {
      found: true,
      canonicalId: def.modelSlug,
      displayName: def.displayName,
      isEnabled: def.isEnabled,
      provider: def.provider,
      targetModel: def.provider === "openrouter" ? def.openRouterModel : def.runpodModel,
      runpodEndpointUrl: def.runpodEndpointUrl,
    };
  },
});
