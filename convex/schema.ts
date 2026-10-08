import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    canonicalEmail: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    tokenIdentifier: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("moderator"), v.literal("user"))
    ),
    status: v.optional(
      v.union(v.literal("active"), v.literal("suspended"), v.literal("pending"))
    ),
    customCredits: v.optional(v.number()),
    unlimitedAiChat: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_canonicalEmail", ["canonicalEmail"])
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_role", ["role"])
    .index("by_status", ["status"]),

  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    userId: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // Registro de ativação de cota do plano gratuito por dispositivo e e-mail canônico
  freePlanClaims: defineTable({
    userId: v.string(),
    email: v.string(),
    canonicalEmail: v.string(),
    deviceId: v.string(),
    status: v.union(v.literal("active"), v.literal("blocked"), v.literal("flagged")),
    reason: v.optional(v.string()),
    claimedAt: v.number(),
    tier: v.string(),
    creditsRemaining: v.number(),
    creditsTotal: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_canonicalEmail", ["canonicalEmail"])
    .index("by_deviceId", ["deviceId"])
    .index("by_status", ["status"]),

  // Log de auditoria e tentativas de abuso bloqueadas
  abuseLogs: defineTable({
    userId: v.optional(v.string()),
    email: v.string(),
    canonicalEmail: v.string(),
    deviceId: v.string(),
    type: v.union(
      v.literal("disposable_email"),
      v.literal("duplicate_canonical_email"),
      v.literal("duplicate_device"),
      v.literal("rate_limit_exceeded")
    ),
    details: v.string(),
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_deviceId", ["deviceId"])
    .index("by_canonicalEmail", ["canonicalEmail"])
    .index("by_timestamp", ["timestamp"]),

  // Precificação dinâmica de Workflows ComfyUI / Cloud APIs e Parâmetros de Instância
  workflowPricing: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    gpuType: v.union(v.literal("80gb"), v.literal("48gb"), v.literal("cloud_api")),
    gpuRatePerSecond: v.number(), // $0.000756 (80gb), $0.000486 (48gb) ou taxa equivalente por segundo de API
    estimatedSeconds: v.number(),
    creditsCharged: v.number(),
    targetMarginPct: v.optional(v.number()), // Margem de lucro alvo em % (ex: 85 para 85%)
    provider: v.optional(v.union(v.literal("runpod"), v.literal("higgsfield"))),
    category: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_isActive", ["isActive"])
    .index("by_sortOrder", ["sortOrder"]),

  // Pacotes de Créditos disponíveis para compra
  creditPackages: defineTable({
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
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_isActive", ["isActive"])
    .index("by_sortOrder", ["sortOrder"]),

  // Balanço de Créditos do Usuário (separando pagos e bônus)
  creditBalances: defineTable({
    userId: v.string(), // clerkId
    paidCredits: v.number(),
    bonusCredits: v.number(),
    totalCredits: v.number(),
    minBalanceEligible: v.boolean(), // true se total >= saldo mínimo (estilo OpenRouter)
    lastDailyBonusAt: v.optional(v.number()),
    autoTopUpEnabled: v.optional(v.boolean()),
    autoTopUpThreshold: v.optional(v.number()), // ex: 20 créditos
    autoTopUpAmountBrl: v.optional(v.number()), // ex: R$ 50,00
    autoTopUpCardLast4: v.optional(v.string()),
    autoTopUpCardBrand: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_minBalanceEligible", ["minBalanceEligible"]),

  // Livro-razão (Ledger) imutável de transações de créditos
  creditTransactions: defineTable({
    userId: v.string(), // clerkId
    amount: v.number(), // positivo = crédito, negativo = débito
    balanceAfter: v.number(),
    creditType: v.union(v.literal("paid"), v.literal("bonus"), v.literal("mixed")),
    type: v.union(
      v.literal("purchase"),
      v.literal("bonus_granted"),
      v.literal("generation_spend"),
      v.literal("admin_adjustment"),
      v.literal("refund")
    ),
    description: v.string(),
    adminNotes: v.optional(v.string()),
    workflowSlug: v.optional(v.string()),
    gpuSeconds: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_type", ["type"])
    .index("by_timestamp", ["timestamp"]),

  // Configurações globais de precificação e custos de infraestrutura
  systemPricingSettings: defineTable({
    key: v.string(),
    usdToBrlRate: v.number(),
    fixedGpu48gbMonthlyUsd: v.number(),
    fixedGpu80gbMonthlyUsd: v.number(),
    minBalanceForDailyBonus: v.number(),
    dailyBonusCredits: v.number(),
    minCustomDepositBrl: v.optional(v.number()), // Mínimo de R$ 5,00
    customCreditPriceBrl: v.optional(v.number()), // Preço base por crédito em valor livre (ex: R$ 0.25)
    allowCustomDeposit: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // Pedidos e cobranças via Mercado Pago (PIX e Cartão de Crédito)
  creditOrders: defineTable({
    userId: v.string(), // clerkId
    userEmail: v.string(),
    userName: v.optional(v.string()),
    amountBrl: v.number(),
    creditsBase: v.number(),
    creditsBonus: v.number(),
    creditsTotal: v.number(),
    packageSlug: v.optional(v.string()), // slug do pacote ou "custom_deposit"
    paymentMethod: v.union(v.literal("pix"), v.literal("credit_card")),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    mpPaymentId: v.optional(v.string()),
    qrCode: v.optional(v.string()), // Pix copia e cola
    qrCodeBase64: v.optional(v.string()), // Imagem base64 do QR code
    ticketUrl: v.optional(v.string()),
    cardLast4: v.optional(v.string()),
    cardBrand: v.optional(v.string()),
    installments: v.optional(v.number()),
    paymentResponse: v.optional(v.string()), // JSON detalhado para auditoria
    paidAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_mpPaymentId", ["mpPaymentId"])
    .index("by_status", ["status"]),

  // Feature Flags do Sistema com Controle em Tempo Real
  featureFlags: defineTable({
    key: v.string(), // ex: "payments_pix", "auto_topup", "maintenance_mode"
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("payments"),
      v.literal("credits"),
      v.literal("studio"),
      v.literal("system")
    ),
    enabled: v.boolean(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"]),

  // Logs do Sistema e Auditoria de Eventos para Observabilidade em Tempo Real
  systemLogs: defineTable({
    level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
    category: v.string(), // "payments", "credits", "auth", "security", "system", "feature_flags"
    message: v.string(),
    details: v.optional(v.string()),
    userId: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_level", ["level"])
    .index("by_category", ["category"])
    .index("by_timestamp", ["timestamp"]),

  // Sessões e Conversas do Chat Multimodal (Kriativa Muse)
  aiConversations: defineTable({
    userId: v.string(), // clerkId
    title: v.string(),
    folderId: v.optional(v.string()),
    isPinned: v.boolean(),
    systemPromptPreset: v.optional(v.string()),
    activeModel: v.string(),
    provider: v.string(), // "openrouter" | "runpod" | "hybrid_fallback"
    totalTokensUsed: v.number(),
    totalCreditsCharged: v.number(),
    lastMessageAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_pinned", ["userId", "isPinned"])
    .index("by_userId_lastMessage", ["userId", "lastMessageAt"]),

  // Mensagens individuais com suporte a streaming, raciocínio e mídias geradas
  aiMessages: defineTable({
    conversationId: v.id("aiConversations"),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    thoughtProcess: v.optional(v.string()),
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
    isStreaming: v.boolean(),
    modelUsed: v.string(),
    providerUsed: v.string(),
    createdAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  // Configurações globais dos provedores de IA (OpenRouter vs RunPod)
  aiProviderSettings: defineTable({
    key: v.string(), // "global_ai_config"
    activeProvider: v.union(v.literal("openrouter"), v.literal("runpod"), v.literal("hybrid_fallback")),
    defaultModelText: v.string(),
    defaultModelReasoning: v.string(),
    defaultModelVision: v.string(),
    runpodEndpointUrl: v.optional(v.string()),
    runpodModelName: v.optional(v.string()),
    runpodDisplayName: v.optional(v.string()), // Nome de exibição customizado da instância RunPod
    openRouterApiKeyConfigured: v.boolean(),
    runpodApiKeyConfigured: v.boolean(),
    tokensPerCreditStandard: v.number(),
    tokensPerCreditReasoning: v.number(),
    imageCreditCost: v.number(),
    videoCreditCost: v.number(),
    audioCreditCost: v.number(),
    maxContextTokens: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  }).index("by_key", ["key"]),

  // Catálogo dinâmico de modelos de IA gerenciáveis pelo Administrador
  customAiModels: defineTable({
    modelId: v.string(), // ex: "anthropic/claude-3.7-sonnet", "openai/gpt-4o", "meta-llama/llama-3.3-70b-instruct"
    displayName: v.string(), // Nome amigável de exibição
    provider: v.union(v.literal("openrouter"), v.literal("runpod")),
    category: v.string(), // "general" | "reasoning" | "speed" | "creative" | "dedicated"
    badge: v.optional(v.string()),
    supportsReasoning: v.boolean(),
    isEnabled: v.boolean(),
    sortOrder: v.number(),
    inputPricePerMillionUsd: v.optional(v.number()),
    outputPricePerMillionUsd: v.optional(v.number()),
    cachedPricePerMillionUsd: v.optional(v.number()),
    creditsPerMillionInput: v.optional(v.number()),
    creditsPerMillionOutput: v.optional(v.number()),
    creditsPerMillionCached: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_modelId", ["modelId"])
    .index("by_isEnabled", ["isEnabled"])
    .index("by_provider", ["provider"]),

  // Bíblia de Produção & Lorebook Persistente do Projeto
  lorebookEntries: defineTable({
    userId: v.string(),
    folderId: v.optional(v.string()),
    conversationId: v.optional(v.id("aiConversations")),
    projectId: v.optional(v.id("studioProjects")),
    category: v.union(v.literal("character"), v.literal("location"), v.literal("style_rules"), v.literal("lore")),
    name: v.string(),
    description: v.string(),
    visualPromptAnchor: v.optional(v.string()),
    referenceImageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_conversationId", ["conversationId"])
    .index("by_projectId", ["projectId"])
    .index("by_userId_projectId", ["userId", "projectId"]),

  // Artefatos vivos e roteiros editáveis no Split Canvas
  canvasArtifacts: defineTable({
    conversationId: v.id("aiConversations"),
    userId: v.string(),
    title: v.string(),
    type: v.union(v.literal("screenplay"), v.literal("code_shader"), v.literal("storyboard_table"), v.literal("markdown_doc")),
    content: v.string(),
    version: v.number(),
    isPinned: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"]),

  // Registros de Geração de Imagem e Vídeo (Kriativa Studio Hub)
  studioGenerations: defineTable({
    userId: v.string(), // clerkId
    projectId: v.optional(v.string()), // ID do projeto opcional vinculado
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
    runpodJobId: v.optional(v.string()),
    status: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    progressMessage: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
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
    outputStorageId: v.optional(v.id("_storage")),
    outputUrl: v.optional(v.string()),
    outputFilename: v.optional(v.string()),
    hasAudioTrack: v.boolean(),
    creditsCharged: v.number(),
    elementTagsUsed: v.optional(v.array(v.string())),
    cameraMotion: v.optional(v.string()),
    lens: v.optional(v.string()),
    lighting: v.optional(v.string()),
    framing: v.optional(v.string()),
    batchCount: v.optional(v.number()),
    quality: v.optional(v.string()),
    executionTimeMs: v.optional(v.number()),
    costUsd: v.optional(v.number()),
    costBrl: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_type", ["userId", "type"])
    .index("by_userId_project", ["userId", "projectId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"])
    .index("by_runpodJobId", ["runpodJobId"]),

  // 13. PROJETOS CINEMATOGRÁFICOS DO KRIATIVA STUDIO
  studioProjects: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    coverStorageId: v.optional(v.id("_storage")),
    aspectRatio: v.optional(v.string()),
    styleLook: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  // 14. ELEMENTOS & ATORES VIRTUAIS DO ESTÚDIO (@MENTIONS)
  studioElements: defineTable({
    userId: v.string(),
    projectId: v.optional(v.id("studioProjects")),
    name: v.string(),
    tag: v.string(),
    type: v.union(
      v.literal("character"),
      v.literal("prop"),
      v.literal("location"),
      v.literal("style")
    ),
    anchorPrompt: v.string(),
    negativePrompt: v.optional(v.string()),
    referenceImageUrl: v.optional(v.string()),
    referenceImageStorageId: v.optional(v.id("_storage")),
    turnaroundStorageIds: v.optional(v.array(v.id("_storage"))),
    seed: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_type", ["userId", "type"])
    .index("by_userId_tag", ["userId", "tag"])
    .index("by_projectId", ["projectId"]),

  // 15. BANNERS DE DESTAQUE & PROMOÇÕES DA HOME/DASHBOARD
  announcementBanners: defineTable({
    title: v.string(),
    description: v.string(),
    badgeText: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    linkText: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_isActive", ["isActive"])
    .index("by_sortOrder", ["sortOrder"]),

  // 16. PREFERÊNCIAS DE USUÁRIO & SPEED DIAL DO DASHBOARD
  userPreferences: defineTable({
    userId: v.string(),
    speedDialShortcuts: v.optional(v.array(v.string())),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // 17. ROTEIROS & DECUPAGEM TÉCNICA DE CENAS
  studioScripts: defineTable({
    userId: v.string(),
    projectId: v.optional(v.id("studioProjects")),
    title: v.string(),
    description: v.optional(v.string()),
    scenes: v.array(
      v.object({
        id: v.string(),
        sceneNumber: v.number(),
        header: v.string(),
        visualPrompt: v.string(),
        audioCues: v.string(),
        cameraMovement: v.string(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_projectId", ["projectId"]),
});


