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

  // Precificação dinâmica de Workflows ComfyUI e Parâmetros de GPU
  workflowPricing: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    gpuType: v.union(v.literal("80gb"), v.literal("48gb")),
    gpuRatePerSecond: v.number(), // $0.000756 (80gb) ou $0.000486 (48gb)
    estimatedSeconds: v.number(),
    creditsCharged: v.number(),
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
});

