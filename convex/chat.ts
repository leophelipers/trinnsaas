import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { assertFeatureFlag, isFeatureFlagActive } from "./featureFlags";
import { requireAdmin } from "./admin";

const DEFAULT_AI_SETTINGS = {
  key: "global_ai_config",
  activeProvider: "openrouter" as const,
  defaultModelText: "anthropic/claude-3.7-sonnet",
  defaultModelReasoning: "deepseek/deepseek-r1",
  defaultModelVision: "google/gemini-2.5-flash",
  runpodEndpointUrl: "",
  runpodModelName: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
  runpodDisplayName: "Instância de Processamento RunPod (vLLM Node)",
  openRouterApiKeyConfigured: true,
  runpodApiKeyConfigured: false,
  tokensPerCreditStandard: 10000,
  tokensPerCreditReasoning: 2500,
  imageCreditCost: 5,
  videoCreditCost: 25,
  audioCreditCost: 3,
  maxContextTokens: 128000,
};

export const INITIAL_MODELS = [
  // CLAUDE (Anthropic)
  {
    modelId: "anthropic/claude-3.7-sonnet",
    displayName: "Claude 3.7 Sonnet (Raciocínio & Direção Híbrida)",
    provider: "openrouter" as const,
    category: "reasoning",
    badge: "Principal",
    supportsReasoning: true,
    isEnabled: true,
    sortOrder: 1,
    inputPricePerMillionUsd: 3.0,
    outputPricePerMillionUsd: 15.0,
    cachedPricePerMillionUsd: 0.75,
    creditsPerMillionInput: 69.6,
    creditsPerMillionOutput: 348.0,
    creditsPerMillionCached: 17.4,
  },
  {
    modelId: "anthropic/claude-3.5-haiku",
    displayName: "Claude 3.5 Haiku (Velocidade & Diálogos Ágeis)",
    provider: "openrouter" as const,
    category: "speed",
    badge: "Ágil",
    supportsReasoning: false,
    isEnabled: true,
    sortOrder: 2,
    inputPricePerMillionUsd: 0.8,
    outputPricePerMillionUsd: 4.0,
    creditsPerMillionInput: 18.56,
    creditsPerMillionOutput: 92.8,
  },

  // CHATGPT / OPENAI
  {
    modelId: "openai/gpt-4o",
    displayName: "GPT-4o (Versátil & Multimodal de Elite)",
    provider: "openrouter" as const,
    category: "general",
    badge: "Versátil",
    supportsReasoning: false,
    isEnabled: true,
    sortOrder: 3,
    inputPricePerMillionUsd: 2.5,
    outputPricePerMillionUsd: 10.0,
    cachedPricePerMillionUsd: 1.25,
    creditsPerMillionInput: 58.0,
    creditsPerMillionOutput: 232.0,
    creditsPerMillionCached: 29.0,
  },
  {
    modelId: "openai/gpt-4o-mini",
    displayName: "GPT-4o Mini (Ultrarrápido & Econômico)",
    provider: "openrouter" as const,
    category: "speed",
    badge: "Econômico",
    supportsReasoning: false,
    isEnabled: true,
    sortOrder: 4,
    inputPricePerMillionUsd: 0.15,
    outputPricePerMillionUsd: 0.6,
    creditsPerMillionInput: 3.48,
    creditsPerMillionOutput: 13.92,
  },
  {
    modelId: "openai/o3-mini",
    displayName: "o3-mini (Raciocínio Lógico & Engenharia)",
    provider: "openrouter" as const,
    category: "reasoning",
    badge: "Raciocínio",
    supportsReasoning: true,
    isEnabled: true,
    sortOrder: 5,
    inputPricePerMillionUsd: 1.1,
    outputPricePerMillionUsd: 4.4,
    creditsPerMillionInput: 25.52,
    creditsPerMillionOutput: 102.08,
  },

  // GEMINI (Google DeepMind)
  {
    modelId: "google/gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash (Ultrarrápido & Multimodal)",
    provider: "openrouter" as const,
    category: "speed",
    badge: "Velocidade",
    supportsReasoning: false,
    isEnabled: true,
    sortOrder: 6,
    inputPricePerMillionUsd: 0.075,
    outputPricePerMillionUsd: 0.3,
    creditsPerMillionInput: 1.74,
    creditsPerMillionOutput: 6.96,
  },
  {
    modelId: "google/gemini-2.5-pro",
    displayName: "Gemini 2.5 Pro (Análise Profunda & Longo Contexto)",
    provider: "openrouter" as const,
    category: "reasoning",
    badge: "Profundo",
    supportsReasoning: true,
    isEnabled: true,
    sortOrder: 7,
    inputPricePerMillionUsd: 1.25,
    outputPricePerMillionUsd: 5.0,
    creditsPerMillionInput: 29.0,
    creditsPerMillionOutput: 116.0,
  },

  // QWEN (Alibaba Cloud / Qwen Team)
  {
    modelId: "qwen/qwen-2.5-72b-instruct",
    displayName: "Qwen 2.5 72B (Roteiros, Diálogos & Narrativa)",
    provider: "openrouter" as const,
    category: "creative",
    badge: "Narrativa",
    supportsReasoning: false,
    isEnabled: true,
    sortOrder: 8,
    inputPricePerMillionUsd: 0.35,
    outputPricePerMillionUsd: 0.4,
    creditsPerMillionInput: 8.12,
    creditsPerMillionOutput: 9.28,
  },
  {
    modelId: "qwen/qwen-2.5-coder-32b-instruct",
    displayName: "Qwen 2.5 Coder 32B (Código, Shaders & Pipeline)",
    provider: "openrouter" as const,
    category: "creative",
    badge: "Código",
    supportsReasoning: false,
    isEnabled: true,
    sortOrder: 9,
    inputPricePerMillionUsd: 0.2,
    outputPricePerMillionUsd: 0.2,
    creditsPerMillionInput: 4.64,
    creditsPerMillionOutput: 4.64,
  },
  {
    modelId: "qwen/qwq-32b",
    displayName: "QwQ 32B (Raciocínio Aberto & Pensamento Profundo)",
    provider: "openrouter" as const,
    category: "reasoning",
    badge: "Raciocínio",
    supportsReasoning: true,
    isEnabled: true,
    sortOrder: 10,
    inputPricePerMillionUsd: 0.15,
    outputPricePerMillionUsd: 0.6,
    creditsPerMillionInput: 3.48,
    creditsPerMillionOutput: 13.92,
  },

  // GEMMA (Google DeepMind)
  {
    modelId: "google/gemma-2-27b-it",
    displayName: "Gemma 2 27B (Lógica Refinada & Texto Preciso)",
    provider: "openrouter" as const,
    category: "general",
    badge: "Gemma 2",
    supportsReasoning: false,
    isEnabled: true,
    sortOrder: 11,
    inputPricePerMillionUsd: 0.27,
    outputPricePerMillionUsd: 0.27,
    creditsPerMillionInput: 6.26,
    creditsPerMillionOutput: 6.26,
  },
  {
    modelId: "google/gemma-2-9b-it",
    displayName: "Gemma 2 9B (Respostas Instantâneas & Leve)",
    provider: "openrouter" as const,
    category: "speed",
    badge: "Ultraleve",
    supportsReasoning: false,
    isEnabled: true,
    sortOrder: 12,
    inputPricePerMillionUsd: 0.06,
    outputPricePerMillionUsd: 0.06,
    creditsPerMillionInput: 1.39,
    creditsPerMillionOutput: 1.39,
  },

  // DEEPSEEK (Open Source SOTA)
  {
    modelId: "deepseek/deepseek-r1",
    displayName: "DeepSeek R1 (Cinema Mind Profundo & CoT)",
    provider: "openrouter" as const,
    category: "reasoning",
    badge: "Raciocínio",
    supportsReasoning: true,
    isEnabled: true,
    sortOrder: 13,
    inputPricePerMillionUsd: 0.55,
    outputPricePerMillionUsd: 2.19,
    creditsPerMillionInput: 12.76,
    creditsPerMillionOutput: 50.81,
  },

  // RUNPOD (Instância de Inferência Dedicada)
  {
    modelId: "runpod/dedicated-vllm",
    displayName: "Instância de Processamento RunPod (vLLM Node)",
    provider: "runpod" as const,
    category: "dedicated",
    badge: "Nó Dedicado",
    supportsReasoning: true,
    isEnabled: true,
    sortOrder: 14,
    inputPricePerMillionUsd: 0.2,
    outputPricePerMillionUsd: 0.8,
    cachedPricePerMillionUsd: 0.05,
    creditsPerMillionInput: 4.64,
    creditsPerMillionOutput: 18.56,
    creditsPerMillionCached: 1.16,
  },
];

/**
 * Consulta a lista de conversas do usuário autenticado (com pins e ordenação)
 */
export const listConversations = query({
  args: {
    folderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const conversations = await ctx.db
      .query("aiConversations")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    // Filtra por pasta se especificada
    const filtered = args.folderId
      ? conversations.filter((c) => c.folderId === args.folderId)
      : conversations;

    // Ordena: fixados primeiro, depois por última mensagem descrescente
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt);
    });
  },
});

/**
 * Consulta os detalhes de uma conversa específica
 */
export const getConversation = query({
  args: {
    conversationId: v.id("aiConversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) {
      return null;
    }

    return conv;
  },
});

/**
 * Cria uma nova conversa no chat
 */
export const createConversation = mutation({
  args: {
    title: v.optional(v.string()),
    activeModel: v.optional(v.string()),
    provider: v.optional(v.string()),
    systemPromptPreset: v.optional(v.string()),
    folderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    await assertFeatureFlag(ctx, "chat_enabled", "O estúdio de chat está temporariamente em manutenção.");

    const now = Date.now();
    const title = args.title?.trim() || "Nova Sessão Criativa";

    const convId = await ctx.db.insert("aiConversations", {
      userId: identity.subject,
      title,
      folderId: args.folderId,
      isPinned: false,
      systemPromptPreset: args.systemPromptPreset || "director",
      activeModel: args.activeModel || "anthropic/claude-3.7-sonnet",
      provider: args.provider || "openrouter",
      totalTokensUsed: 0,
      totalCreditsCharged: 0,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return convId;
  },
});

/**
 * Renomeia o título de uma conversa
 */
export const renameConversation = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) {
      throw new Error("Conversa não encontrada ou sem permissão.");
    }

    const cleanTitle = args.title.trim();
    if (!cleanTitle) {
      throw new Error("O título não pode estar vazio.");
    }

    await ctx.db.patch(args.conversationId, {
      title: cleanTitle,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Alterna a fixação (Pin) de uma conversa no topo
 */
export const togglePinConversation = mutation({
  args: {
    conversationId: v.id("aiConversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) {
      throw new Error("Conversa não encontrada ou sem permissão.");
    }

    const newPinned = !conv.isPinned;
    await ctx.db.patch(args.conversationId, {
      isPinned: newPinned,
      updatedAt: Date.now(),
    });

    return { success: true, isPinned: newPinned };
  },
});

/**
 * Duplica uma conversa para branching criativo (Bifurcação de sessão)
 */
export const duplicateConversation = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    upToMessageId: v.optional(v.id("aiMessages")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) {
      throw new Error("Conversa não encontrada.");
    }

    const now = Date.now();
    const newConvId = await ctx.db.insert("aiConversations", {
      userId: identity.subject,
      title: `${conv.title} (Ramificação)`,
      folderId: conv.folderId,
      isPinned: false,
      systemPromptPreset: conv.systemPromptPreset,
      activeModel: conv.activeModel,
      provider: conv.provider,
      totalTokensUsed: conv.totalTokensUsed,
      totalCreditsCharged: conv.totalCreditsCharged,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Clona mensagens
    const messages = await ctx.db
      .query("aiMessages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    for (const msg of messages) {
      await ctx.db.insert("aiMessages", {
        conversationId: newConvId,
        userId: identity.subject,
        role: msg.role,
        content: msg.content,
        thoughtProcess: msg.thoughtProcess,
        attachments: msg.attachments,
        generatedMedia: msg.generatedMedia,
        tokensPrompt: msg.tokensPrompt,
        tokensCompletion: msg.tokensCompletion,
        creditsDeducted: msg.creditsDeducted,
        isStreaming: false,
        modelUsed: msg.modelUsed,
        providerUsed: msg.providerUsed,
        createdAt: msg.createdAt,
      });

      if (args.upToMessageId && msg._id === args.upToMessageId) {
        break;
      }
    }

    return newConvId;
  },
});

/**
 * Remove uma conversa e todas as mensagens associadas
 */
export const deleteConversation = mutation({
  args: {
    conversationId: v.id("aiConversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) {
      throw new Error("Conversa não encontrada ou sem permissão.");
    }

    // 1. Exclui mensagens
    const messages = await ctx.db
      .query("aiMessages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    // 2. Exclui artefatos de canvas vinculados
    const artifacts = await ctx.db
      .query("canvasArtifacts")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    for (const art of artifacts) {
      await ctx.db.delete(art._id);
    }

    // 3. Exclui conversa
    await ctx.db.delete(args.conversationId);

    return { success: true };
  },
});

/**
 * Consulta as mensagens de uma conversa específica (ordenadas por data)
 */
export const getMessages = query({
  args: {
    conversationId: v.id("aiConversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) {
      return [];
    }

    const messages = await ctx.db
      .query("aiMessages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    return messages;
  },
});

/**
 * Salva mensagem do usuário de forma otimista no banco de dados
 */
export const saveUserMessage = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    content: v.string(),
    attachments: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal("image"), v.literal("document"), v.literal("audio"), v.literal("code")),
          storageId: v.optional(v.id("_storage")),
          url: v.string(),
          name: v.string(),
          mimeType: v.string(),
          sizeBytes: v.number(),
          extractedText: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    await assertFeatureFlag(ctx, "chat_enabled", "O estúdio de chat está temporariamente em manutenção.");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) {
      throw new Error("Conversa não encontrada.");
    }

    const now = Date.now();
    const cleanContent = args.content.trim();

    // Resolver URLs a partir de storageId se fornecido
    let resolvedAttachments = args.attachments;
    if (args.attachments && args.attachments.length > 0) {
      resolvedAttachments = await Promise.all(
        args.attachments.map(async (att) => {
          let finalUrl = att.url;
          if (att.storageId) {
            const storageUrl = await ctx.storage.getUrl(att.storageId);
            if (storageUrl) {
              finalUrl = storageUrl;
            }
          }
          return {
            ...att,
            url: finalUrl,
          };
        })
      );
    }

    const msgId = await ctx.db.insert("aiMessages", {
      conversationId: args.conversationId,
      userId: identity.subject,
      role: "user",
      content: cleanContent,
      attachments: resolvedAttachments,
      creditsDeducted: 0,
      isStreaming: false,
      modelUsed: conv.activeModel,
      providerUsed: conv.provider,
      createdAt: now,
    });

    // Auto-renomear a conversa se for o primeiro prompt e ainda estiver com título genérico
    if (conv.title === "Nova Sessão Criativa" && cleanContent.length > 0) {
      const generatedTitle =
        cleanContent.length > 36
          ? `${cleanContent.substring(0, 36).trim()}...`
          : cleanContent;

      await ctx.db.patch(args.conversationId, {
        title: generatedTitle,
        lastMessageAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(args.conversationId, {
        lastMessageAt: now,
        updatedAt: now,
      });
    }

    return msgId;
  },
});

/**
 * Salva a resposta completa gerada pelo assistente (com raciocínio, mídia e tokens)
 */
export const saveAssistantMessage = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    userId: v.optional(v.string()),
    secret: v.optional(v.string()),
    content: v.string(),
    thoughtProcess: v.optional(v.string()),
    generatedMedia: v.optional(
      v.array(
        v.object({
          mediaType: v.union(v.literal("image"), v.literal("video"), v.literal("audio"), v.literal("artifact")),
          url: v.string(),
          storageId: v.optional(v.id("_storage")),
          prompt: v.optional(v.string()),
          seed: v.optional(v.number()),
          durationSeconds: v.optional(v.number()),
          resolution: v.optional(v.string()),
          codeLanguage: v.optional(v.string()),
        })
      )
    ),
    tokensPrompt: v.optional(v.number()),
    tokensCompletion: v.optional(v.number()),
    creditsDeducted: v.number(),
    modelUsed: v.string(),
    providerUsed: v.string(),
  },
  handler: async (ctx, args) => {
    const internalSecret = process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";
    const identity = await ctx.auth.getUserIdentity();

    let targetUserId = identity?.subject;
    if (args.secret && args.secret === internalSecret && args.userId) {
      targetUserId = args.userId;
    }

    if (!targetUserId) {
      throw new Error("Não autenticado.");
    }

    await assertFeatureFlag(ctx, "chat_enabled", "O estúdio de chat está temporariamente em manutenção.");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== targetUserId) {
      throw new Error("Conversa não encontrada ou sem permissão.");
    }

    const now = Date.now();
    const totalTokens = (args.tokensPrompt || 0) + (args.tokensCompletion || 0);

    const msgId = await ctx.db.insert("aiMessages", {
      conversationId: args.conversationId,
      userId: targetUserId,
      role: "assistant",
      content: args.content,
      thoughtProcess: args.thoughtProcess,
      generatedMedia: args.generatedMedia,
      tokensPrompt: args.tokensPrompt,
      tokensCompletion: args.tokensCompletion,
      creditsDeducted: args.creditsDeducted,
      isStreaming: false,
      modelUsed: args.modelUsed,
      providerUsed: args.providerUsed,
      createdAt: now,
    });

    await ctx.db.patch(args.conversationId, {
      totalTokensUsed: (conv.totalTokensUsed || 0) + totalTokens,
      totalCreditsCharged: (conv.totalCreditsCharged || 0) + args.creditsDeducted,
      lastMessageAt: now,
      updatedAt: now,
    });

    return msgId;
  },
});

/**
 * Remove uma mensagem individual de uma conversa
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("aiMessages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.userId !== identity.subject) {
      throw new Error("Mensagem não encontrada ou sem permissão.");
    }

    await ctx.db.delete(args.messageId);
    return { success: true };
  },
});

/**
 * Dedução atômica de créditos com suporte a modo ilimitado para Admins e VIPs
 */
export const fulfillOrDeductCredits = mutation({
  args: {
    userId: v.string(),
    conversationId: v.optional(v.id("aiConversations")),
    tokensPrompt: v.optional(v.number()),
    tokensCompletion: v.optional(v.number()),
    tokensCached: v.optional(v.number()),
    fixedMediaCost: v.optional(v.number()),
    modelUsed: v.optional(v.string()),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const internalSecret = process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";
    const identity = await ctx.auth.getUserIdentity();

    let isAuthorized = false;
    if (args.secret && args.secret === internalSecret) {
      isAuthorized = true;
    } else if (identity && identity.subject === args.userId) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      throw new Error("Acesso não autorizado para dedução de créditos.");
    }

    await assertFeatureFlag(ctx, "chat_enabled", "O estúdio de chat está temporariamente em manutenção.");

    // 1. Verificar se o usuário tem direito a USO ILIMITADO
    const userDoc = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    const isAdminUnlimitedEnabled = await isFeatureFlagActive(ctx, "chat_unlimited_admins");
    const isAdmin = userDoc?.role === "admin" && isAdminUnlimitedEnabled;
    const isUnlimitedVip = Boolean(userDoc?.unlimitedAiChat);

    if (isAdmin || isUnlimitedVip) {
      // Registra transação no ledger com valor 0 para auditoria sem cobrar
      await ctx.db.insert("creditTransactions", {
        userId: args.userId,
        amount: 0,
        balanceAfter: userDoc?.customCredits ?? 0,
        creditType: "bonus",
        type: "generation_spend",
        description: `Geração via Kriativa Muse [Uso Ilimitado ${isAdmin ? "Admin" : "VIP"}]`,
        timestamp: Date.now(),
      });

      return {
        deducted: 0,
        isUnlimited: true,
        reason: isAdmin ? "admin" : "vip",
      };
    }

    // 2. Calcular custo em créditos para usuário padrão
    const promptTokens = args.tokensPrompt || 0;
    const completionTokens = args.tokensCompletion || 0;
    const cachedTokens = args.tokensCached || 0;
    const totalTokens = promptTokens + completionTokens;
    let creditCost = args.fixedMediaCost || 0;

    if (totalTokens > 0) {
      let customPricingApplied = false;

      if (args.modelUsed) {
        const cleanModelId = args.modelUsed.replace(/^runpod\//, "");
        const modelDoc = await ctx.db
          .query("customAiModels")
          .withIndex("by_modelId", (q) => q.eq("modelId", cleanModelId))
          .first();

        if (
          modelDoc &&
          (modelDoc.creditsPerMillionInput !== undefined ||
            modelDoc.creditsPerMillionOutput !== undefined)
        ) {
          const rateInput = modelDoc.creditsPerMillionInput || 0;
          const rateOutput = modelDoc.creditsPerMillionOutput || 0;
          const rateCached = modelDoc.creditsPerMillionCached ?? rateInput * 0.5;

          const promptCost = (promptTokens * rateInput) / 1_000_000;
          const completionCost = (completionTokens * rateOutput) / 1_000_000;
          const cachedCost = (cachedTokens * rateCached) / 1_000_000;

          const calculated = promptCost + completionCost + cachedCost;
          creditCost += Math.max(0.01, calculated);
          customPricingApplied = true;
        }
      }

      if (!customPricingApplied) {
        // 1 crédito por 10.000 tokens standard, arredondado para cima com mínimo de 0.1 cr
        const tokenCost = Number((totalTokens / 10000).toFixed(2));
        creditCost += Math.max(0.1, tokenCost);
      }
    }

    creditCost = Math.round(creditCost * 100) / 100; // Arredonda para 2 casas decimais

    const now = Date.now();
    let balanceDoc = await ctx.db
      .query("creditBalances")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const currentTotal = balanceDoc?.totalCredits ?? userDoc?.customCredits ?? 50;
    const currentPaid = balanceDoc?.paidCredits ?? 0;
    const currentBonus = balanceDoc?.bonusCredits ?? Math.max(0, currentTotal - currentPaid);

    // Deduz primeiro dos bônus, depois dos créditos pagos
    let newBonus = currentBonus;
    let newPaid = currentPaid;
    let remainingToDeduct = creditCost;

    if (newBonus >= remainingToDeduct) {
      newBonus -= remainingToDeduct;
      remainingToDeduct = 0;
    } else {
      remainingToDeduct -= newBonus;
      newBonus = 0;
      newPaid = Math.max(0, newPaid - remainingToDeduct);
    }

    const newTotal = newPaid + newBonus;

    if (balanceDoc) {
      await ctx.db.patch(balanceDoc._id, {
        paidCredits: newPaid,
        bonusCredits: newBonus,
        totalCredits: newTotal,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("creditBalances", {
        userId: args.userId,
        paidCredits: newPaid,
        bonusCredits: newBonus,
        totalCredits: newTotal,
        minBalanceEligible: newTotal >= 20,
        updatedAt: now,
      });
    }

    // Sincroniza users
    if (userDoc) {
      await ctx.db.patch(userDoc._id, { customCredits: newTotal });
    }

    // Grava no livro-razão imutável
    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      amount: -creditCost,
      balanceAfter: newTotal,
      creditType: newBonus > 0 ? "mixed" : "paid",
      type: "generation_spend",
      description: `Geração via Kriativa Muse (${totalTokens} tokens consumidos)`,
      timestamp: now,
    });

    return {
      deducted: creditCost,
      isUnlimited: false,
      balanceAfter: newTotal,
    };
  },
});

/**
 * Consulta as configurações globais de IA (OpenRouter vs RunPod)
 */
export const getAiSettings = query({
  args: {},
  handler: async (ctx) => {
    const settingsDoc = await ctx.db
      .query("aiProviderSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_ai_config"))
      .first();

    return settingsDoc || DEFAULT_AI_SETTINGS;
  },
});

/**
 * Atualiza configurações de provedores de IA (Exclusivo Administrador)
 */
export const updateAiSettings = mutation({
  args: {
    activeProvider: v.union(v.literal("openrouter"), v.literal("runpod"), v.literal("hybrid_fallback")),
    defaultModelText: v.string(),
    defaultModelReasoning: v.string(),
    defaultModelVision: v.string(),
    runpodEndpointUrl: v.optional(v.string()),
    runpodModelName: v.optional(v.string()),
    runpodDisplayName: v.optional(v.string()),
    tokensPerCreditStandard: v.number(),
    tokensPerCreditReasoning: v.number(),
    imageCreditCost: v.number(),
    videoCreditCost: v.number(),
    audioCreditCost: v.number(),
  },
  handler: async (ctx, args) => {
    const { user, identity } = await requireAdmin(ctx);
    const now = Date.now();
    const adminIdentifier = user.email || identity.email || "admin";

    const existing = await ctx.db
      .query("aiProviderSettings")
      .withIndex("by_key", (q) => q.eq("key", "global_ai_config"))
      .first();

    const data = {
      key: "global_ai_config",
      activeProvider: args.activeProvider,
      defaultModelText: args.defaultModelText.trim(),
      defaultModelReasoning: args.defaultModelReasoning.trim(),
      defaultModelVision: args.defaultModelVision.trim(),
      runpodEndpointUrl: args.runpodEndpointUrl?.trim() || undefined,
      runpodModelName: args.runpodModelName?.trim() || undefined,
      runpodDisplayName: args.runpodDisplayName?.trim() || "Instância de Processamento RunPod (vLLM Node)",
      openRouterApiKeyConfigured: Boolean(process.env.OPENROUTER_API_KEY),
      runpodApiKeyConfigured: Boolean(process.env.RUNPOD_API_KEY),
      tokensPerCreditStandard: Math.max(100, args.tokensPerCreditStandard),
      tokensPerCreditReasoning: Math.max(100, args.tokensPerCreditReasoning),
      imageCreditCost: Math.max(1, args.imageCreditCost),
      videoCreditCost: Math.max(1, args.videoCreditCost),
      audioCreditCost: Math.max(1, args.audioCreditCost),
      maxContextTokens: 128000,
      updatedAt: now,
      updatedBy: adminIdentifier,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("aiProviderSettings", data);
    }

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "ai_chat",
      message: `Configurações de provedores de IA atualizadas por ${adminIdentifier}`,
      details: JSON.stringify({ activeProvider: args.activeProvider, admin: adminIdentifier }),
      userId: identity.subject,
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Utilitário para converter valor em USD por 1M tokens para créditos da plataforma
 * Utiliza a taxa de câmbio USD/BRL e o preço base de crédito (R$ 0,25) de systemPricingSettings
 */
async function calculateCreditsFromUsd(
  ctx: any,
  usdPerMillion: number | undefined
): Promise<number | undefined> {
  if (usdPerMillion === undefined || usdPerMillion === null) return undefined;
  if (usdPerMillion <= 0) return 0;

  const pricingDoc = await ctx.db
    .query("systemPricingSettings")
    .withIndex("by_key", (q: any) => q.eq("key", "global_pricing_config"))
    .first();

  const usdToBrl = pricingDoc?.usdToBrlRate ?? 5.8;
  const customCreditPriceBrl = pricingDoc?.customCreditPriceBrl ?? 0.25;

  const rawCredits = (usdPerMillion * usdToBrl) / customCreditPriceBrl;
  return Number(rawCredits.toFixed(2));
}

function formatModelDisplayName(modelId: string, provider: "openrouter" | "runpod"): string {
  const clean = modelId.split("/").pop() || modelId;
  const words = clean
    .replace(/[-_.]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => {
      if (/^[0-9]+[a-zA-Z]*$/.test(w) || w.toUpperCase() === w) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");

  const suffix = provider === "runpod" ? " (RunPod)" : "";
  return `${words}${suffix}`;
}

function autoDetectReasoning(modelId: string): boolean {
  const lower = modelId.toLowerCase();
  return (
    lower.includes("r1") ||
    lower.includes("reason") ||
    lower.includes("thinking") ||
    lower.includes("cot") ||
    lower.includes("deepseek-r1")
  );
}

/**
 * Consulta um modelo específico por modelId (customizado ou padrão)
 */
export const getModelByModelId = query({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const cleanId = args.modelId.replace(/^runpod\//, "");
    const custom = await ctx.db
      .query("customAiModels")
      .withIndex("by_modelId", (q) => q.eq("modelId", cleanId))
      .first();

    if (custom) return custom;

    const customWithPrefix = await ctx.db
      .query("customAiModels")
      .withIndex("by_modelId", (q) => q.eq("modelId", args.modelId))
      .first();

    if (customWithPrefix) return customWithPrefix;

    const initial = INITIAL_MODELS.find(
      (m) => m.modelId === args.modelId || m.modelId === cleanId
    );
    if (initial) return { ...initial, _id: undefined };

    return null;
  },
});

/**
 * Consulta a lista de modelos ativos disponíveis para os criadores no chat
 * Unifica os modelos padrão com os novos modelos registrados e ativos
 */
export const listAvailableModels = query({
  args: {},
  handler: async (ctx) => {
    const customModels = await ctx.db.query("customAiModels").collect();
    const customMap = new Map(customModels.map((m) => [m.modelId, m]));

    const result: any[] = [];

    // 1. Processa os modelos iniciais (respeitando desativação ou overrides do banco)
    for (const init of INITIAL_MODELS) {
      const override = customMap.get(init.modelId);
      if (override) {
        if (override.isEnabled) {
          result.push({
            ...init,
            ...override,
          });
        }
      } else {
        result.push(init);
      }
    }

    // 2. Adiciona novos modelos customizados (ex: RunPod) que estejam ativos
    for (const custom of customModels) {
      const isInitial = INITIAL_MODELS.some((init) => init.modelId === custom.modelId);
      if (!isInitial && custom.isEnabled) {
        result.push(custom);
      }
    }

    // 3. Aplica filtragem por Feature Flags de provedor (OpenRouter / RunPod)
    const isOpenRouterActive = await isFeatureFlagActive(ctx, "chat_provider_openrouter");
    const isRunpodActive = await isFeatureFlagActive(ctx, "chat_provider_runpod");

    const filtered = result.filter((m) => {
      if (m.provider === "runpod") {
        return isRunpodActive;
      }
      return isOpenRouterActive;
    });

    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Consulta todos os modelos (ativos e inativos) para o painel administrativo
 * Fornece visão consolidada com precificação em USD e créditos convertidos
 */
export const listAllAdminModels = query({
  args: {},
  handler: async (ctx) => {
    const customModels = await ctx.db.query("customAiModels").collect();
    const customMap = new Map(customModels.map((m) => [m.modelId, m]));

    const result: any[] = [];

    // 1. Inclui modelos iniciais com override se existir no banco
    for (let i = 0; i < INITIAL_MODELS.length; i++) {
      const init = INITIAL_MODELS[i];
      const custom = customMap.get(init.modelId);
      if (custom) {
        result.push({
          ...init,
          ...custom,
        });
      } else {
        result.push({
          ...init,
          _id: `temp_${i}`,
          updatedAt: Date.now(),
        });
      }
    }

    // 2. Inclui novos modelos criados no banco (RunPod ou outros)
    for (const custom of customModels) {
      const isInitial = INITIAL_MODELS.some((init) => init.modelId === custom.modelId);
      if (!isInitial) {
        result.push(custom);
      }
    }

    return result.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Adiciona ou edita um modelo na lista (Exclusivo Administrador)
 * Suporta entrada simplificada para RunPod (apenas slug + preços USD) com conversão automática para créditos
 */
export const upsertModel = mutation({
  args: {
    id: v.optional(v.id("customAiModels")),
    modelId: v.string(),
    displayName: v.optional(v.string()),
    provider: v.optional(v.union(v.literal("openrouter"), v.literal("runpod"))),
    category: v.optional(v.string()),
    badge: v.optional(v.string()),
    supportsReasoning: v.optional(v.boolean()),
    isEnabled: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    inputPricePerMillionUsd: v.optional(v.number()),
    outputPricePerMillionUsd: v.optional(v.number()),
    cachedPricePerMillionUsd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireAdmin(ctx);
    const now = Date.now();
    const cleanModelId = args.modelId.trim();

    if (!cleanModelId) {
      throw new Error("O identificador/nome do modelo é obrigatório.");
    }

    const provider = args.provider || "runpod";
    const displayName =
      args.displayName && args.displayName.trim()
        ? args.displayName.trim()
        : formatModelDisplayName(cleanModelId, provider);

    const supportsReasoning =
      args.supportsReasoning !== undefined
        ? args.supportsReasoning
        : autoDetectReasoning(cleanModelId);

    const category =
      args.category && args.category.trim()
        ? args.category.trim()
        : supportsReasoning
        ? "reasoning"
        : provider === "runpod"
        ? "dedicated"
        : "general";

    const isEnabled = args.isEnabled !== undefined ? args.isEnabled : true;

    // Calcular conversão exata de USD para créditos da plataforma
    const creditsPerMillionInput = await calculateCreditsFromUsd(
      ctx,
      args.inputPricePerMillionUsd
    );
    const creditsPerMillionOutput = await calculateCreditsFromUsd(
      ctx,
      args.outputPricePerMillionUsd
    );
    const creditsPerMillionCached = await calculateCreditsFromUsd(
      ctx,
      args.cachedPricePerMillionUsd
    );

    const modelData = {
      modelId: cleanModelId,
      displayName,
      provider,
      category,
      badge: args.badge?.trim() || (provider === "runpod" ? "RunPod" : undefined),
      supportsReasoning,
      isEnabled,
      sortOrder: args.sortOrder ?? 10,
      inputPricePerMillionUsd: args.inputPricePerMillionUsd,
      outputPricePerMillionUsd: args.outputPricePerMillionUsd,
      cachedPricePerMillionUsd: args.cachedPricePerMillionUsd,
      creditsPerMillionInput,
      creditsPerMillionOutput,
      creditsPerMillionCached,
      updatedAt: now,
    };

    if (args.id) {
      await ctx.db.patch(args.id, modelData);
      return { success: true, id: args.id };
    }

    // Verifica se já existe por modelId
    const existing = await ctx.db
      .query("customAiModels")
      .withIndex("by_modelId", (q) => q.eq("modelId", cleanModelId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, modelData);
      return { success: true, id: existing._id };
    }

    const newId = await ctx.db.insert("customAiModels", modelData);

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "ai_chat",
      message: `Modelo ${cleanModelId} cadastrado/atualizado (${provider})`,
      details: JSON.stringify({
        displayName,
        inputUsd: args.inputPricePerMillionUsd,
        outputUsd: args.outputPricePerMillionUsd,
        creditsInput: creditsPerMillionInput,
        creditsOutput: creditsPerMillionOutput,
      }),
      userId: identity.subject,
      timestamp: now,
    });

    return { success: true, id: newId };
  },
});

/**
 * Alterna ativação de um modelo (Ligar / Desligar)
 */
export const toggleModelEnabled = mutation({
  args: {
    modelId: v.string(),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("customAiModels")
      .withIndex("by_modelId", (q) => q.eq("modelId", args.modelId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isEnabled: args.isEnabled,
        updatedAt: now,
      });
      return { success: true };
    }

    // Se é um modelo inicial ainda não persistido, insere no banco
    const initial = INITIAL_MODELS.find((m) => m.modelId === args.modelId);
    if (initial) {
      await ctx.db.insert("customAiModels", {
        modelId: initial.modelId,
        displayName: initial.displayName,
        provider: initial.provider,
        category: initial.category,
        badge: initial.badge,
        supportsReasoning: initial.supportsReasoning,
        isEnabled: args.isEnabled,
        sortOrder: initial.sortOrder,
        updatedAt: now,
      });
      return { success: true };
    }

    throw new Error("Modelo não encontrado para alternar.");
  },
});

/**
 * Remove um modelo customizado (Exclusivo Administrador)
 */
export const deleteModel = mutation({
  args: {
    id: v.id("customAiModels"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Sincroniza o catálogo padrão no banco de dados (Exclusivo Administrador)
 * Atualiza ou insere todos os modelos de INITIAL_MODELS com as tarifas e metadados mais recentes
 */
export const syncDefaultModels = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const now = Date.now();

    let updatedCount = 0;
    let insertedCount = 0;

    for (const model of INITIAL_MODELS) {
      const existing = await ctx.db
        .query("customAiModels")
        .withIndex("by_modelId", (q) => q.eq("modelId", model.modelId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          displayName: model.displayName,
          provider: model.provider,
          category: model.category,
          badge: model.badge,
          supportsReasoning: model.supportsReasoning,
          isEnabled: true,
          sortOrder: model.sortOrder,
          inputPricePerMillionUsd: model.inputPricePerMillionUsd,
          outputPricePerMillionUsd: model.outputPricePerMillionUsd,
          cachedPricePerMillionUsd: model.cachedPricePerMillionUsd,
          creditsPerMillionInput: model.creditsPerMillionInput,
          creditsPerMillionOutput: model.creditsPerMillionOutput,
          creditsPerMillionCached: model.creditsPerMillionCached,
          updatedAt: now,
        });
        updatedCount++;
      } else {
        await ctx.db.insert("customAiModels", {
          ...model,
          updatedAt: now,
        });
        insertedCount++;
      }
    }

    return {
      success: true,
      updatedCount,
      insertedCount,
      total: INITIAL_MODELS.length,
    };
  },
});

/**
 * Consulta entidades da Bíblia de Produção / Lorebook
 */
export const listLorebookEntries = query({
  args: {
    folderId: v.optional(v.string()),
    conversationId: v.optional(v.id("aiConversations")),
    projectId: v.optional(v.id("studioProjects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let entries = [];
    if (args.projectId) {
      entries = await ctx.db
        .query("lorebookEntries")
        .withIndex("by_userId_projectId", (q) =>
          q.eq("userId", identity.subject).eq("projectId", args.projectId)
        )
        .collect();
    } else {
      entries = await ctx.db
        .query("lorebookEntries")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .collect();
    }

    return entries.filter((e) => {
      if (args.conversationId && e.conversationId && e.conversationId !== args.conversationId) {
        return false;
      }
      return true;
    });
  },
});

/**
 * Cria ou atualiza entrada na Bíblia de Produção (Personagens, Cenários, Regras)
 */
export const upsertLorebookEntry = mutation({
  args: {
    id: v.optional(v.id("lorebookEntries")),
    conversationId: v.optional(v.id("aiConversations")),
    projectId: v.optional(v.id("studioProjects")),
    category: v.union(v.literal("character"), v.literal("location"), v.literal("style_rules"), v.literal("lore")),
    name: v.string(),
    description: v.string(),
    visualPromptAnchor: v.optional(v.string()),
    referenceImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    await assertFeatureFlag(
      ctx,
      "chat_lorebook_memory",
      "A Bíblia de Produção / Lorebook está temporariamente desativada."
    );

    const now = Date.now();
    const cleanName = args.name.trim();
    if (!cleanName) throw new Error("O nome da entidade é obrigatório.");

    if (args.id) {
      await ctx.db.patch(args.id, {
        category: args.category,
        name: cleanName,
        description: args.description.trim(),
        projectId: args.projectId,
        visualPromptAnchor: args.visualPromptAnchor?.trim() || undefined,
        referenceImageUrl: args.referenceImageUrl?.trim() || undefined,
        updatedAt: now,
      });
      return { success: true, id: args.id };
    }

    const newId = await ctx.db.insert("lorebookEntries", {
      userId: identity.subject,
      conversationId: args.conversationId,
      projectId: args.projectId,
      category: args.category,
      name: cleanName,
      description: args.description.trim(),
      visualPromptAnchor: args.visualPromptAnchor?.trim() || undefined,
      referenceImageUrl: args.referenceImageUrl?.trim() || undefined,
      isActive: true,
      updatedAt: now,
    });

    return { success: true, id: newId };
  },
});

/**
 * Remove entrada da Bíblia de Produção
 */
export const deleteLorebookEntry = mutation({
  args: {
    id: v.id("lorebookEntries"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== identity.subject) {
      throw new Error("Entrada não encontrada.");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Consulta artefato de Canvas de uma conversa
 */
export const getCanvasArtifact = query({
  args: {
    conversationId: v.id("aiConversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("canvasArtifacts")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .first();
  },
});

/**
 * Salva ou atualiza artefato de Canvas
 */
export const saveCanvasArtifact = mutation({
  args: {
    conversationId: v.id("aiConversations"),
    title: v.string(),
    type: v.union(v.literal("screenplay"), v.literal("code_shader"), v.literal("storyboard_table"), v.literal("markdown_doc")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    await assertFeatureFlag(
      ctx,
      "chat_canvas_artifacts",
      "O Split Canvas / Editor de Artefatos está temporariamente desativado."
    );

    const existing = await ctx.db
      .query("canvasArtifacts")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title.trim(),
        type: args.type,
        content: args.content,
        version: existing.version + 1,
        updatedAt: now,
      });
      return { success: true, id: existing._id };
    }

    const newId = await ctx.db.insert("canvasArtifacts", {
      conversationId: args.conversationId,
      userId: identity.subject,
      title: args.title.trim(),
      type: args.type,
      content: args.content,
      version: 1,
      isPinned: true,
      updatedAt: now,
    });

    return { success: true, id: newId };
  },
});

/**
 * Gera URL de upload para Convex Storage para arquivos e imagens do chat
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }
    await assertFeatureFlag(
      ctx,
      "chat_file_upload",
      "O upload e ingestão de documentos e arquivos está temporariamente desativado."
    );
    return await ctx.storage.generateUploadUrl();
  },
});

