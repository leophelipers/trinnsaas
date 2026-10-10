import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

export type FeatureFlagCategory = "payments" | "credits" | "studio" | "system";

export interface DefaultFeatureFlag {
  key: string;
  name: string;
  description: string;
  category: FeatureFlagCategory;
  enabled: boolean;
}

export const DEFAULT_FEATURE_FLAGS: DefaultFeatureFlag[] = [
  {
    key: "payments_pix",
    name: "Pagamentos via PIX",
    description: "Habilita recargas instantâneas via QR Code PIX com confirmação em tempo real.",
    category: "payments",
    enabled: true,
  },
  {
    key: "payments_card",
    name: "Pagamentos via Cartão de Crédito",
    description: "Habilita recargas no cartão de crédito via Mercado Pago com parcelamento em até 12x.",
    category: "payments",
    enabled: true,
  },
  {
    key: "auto_topup",
    name: "Auto Top-up (Recarga Automática)",
    description: "Permite aos criadores configurar recarga automática inteligente com bônus VIP de 10 créditos.",
    category: "credits",
    enabled: true,
  },
  {
    key: "daily_bonus",
    name: "Bônus Diário (Estúdio Ativo)",
    description: "Permite o resgate diário a cada 24 horas para usuários com saldo ativo no Estúdio.",
    category: "credits",
    enabled: true,
  },
  {
    key: "custom_recharge",
    name: "Recarga de Valor Personalizado",
    description: "Permite ao usuário definir livremente o valor da recarga a partir de R$ 5,00.",
    category: "payments",
    enabled: true,
  },
  {
    key: "welcome_bonus",
    name: "Cota de Boas-Vindas",
    description: "Ativação de cota gratuita para novas contas com proteção anti-abuso de dispositivo e e-mail.",
    category: "credits",
    enabled: false,
  },
  {
    key: "video_generation",
    name: "Renderização de Vídeos IA",
    description: "Execução de workflows de geração, interpolação e efeitos de vídeo no Estúdio.",
    category: "studio",
    enabled: true,
  },
  {
    key: "chat_enabled",
    name: "Chat Multimodal Kriativa Muse",
    description: "Ativação global da rota do estúdio conversacional e assistente criativo multimodal.",
    category: "studio",
    enabled: true,
  },
  {
    key: "chat_provider_openrouter",
    name: "Integração OpenRouter",
    description: "Habilita tráfego via OpenRouter API Gateway para modelos multimodais de ponta.",
    category: "system",
    enabled: true,
  },
  {
    key: "chat_provider_runpod",
    name: "Integração RunPod Auto-Hospedado",
    description: "Habilita tráfego via instâncias dedicadas vLLM auto-hospedadas no RunPod.",
    category: "system",
    enabled: true,
  },
  {
    key: "chat_file_upload",
    name: "Ingestão de Documentos & Livros",
    description: "Permite envio e análise semântica de PDFs, livros e documentos volumosos no chat.",
    category: "studio",
    enabled: true,
  },
  {
    key: "chat_image_generation",
    name: "Geração Inline de Imagens",
    description: "Ativa ferramentas de geração de arte conceitual e iluminação no chat.",
    category: "studio",
    enabled: true,
  },
  {
    key: "chat_video_generation",
    name: "Geração Inline de Vídeo",
    description: "Permite disparar renders e animações de cena pelo console do chat.",
    category: "studio",
    enabled: true,
  },
  {
    key: "chat_audio_generation",
    name: "Geração de Voz e Efeitos de Áudio",
    description: "Ativa síntese neural de vozes cinematográficas e efeitos sonoros no chat.",
    category: "studio",
    enabled: true,
  },
  {
    key: "chat_canvas_artifacts",
    name: "Split Canvas Mode & Edição de Roteiro",
    description: "Ativa painel lateral de edição de roteiros e artefatos de código lado a lado.",
    category: "studio",
    enabled: true,
  },
  {
    key: "chat_lorebook_memory",
    name: "Bíblia de Produção & Lorebook",
    description: "Ativa injeção automática de memória de personagens e consistência estética.",
    category: "studio",
    enabled: true,
  },
  {
    key: "chat_unlimited_admins",
    name: "Uso Ilimitado para Administradores",
    description: "Isenção total de cobrança de créditos no chat para a equipe administrativa.",
    category: "credits",
    enabled: true,
  },
  {
    key: "studio_generation_hub",
    name: "Kriativa Studio Hub",
    description: "Ativação global do console unificado de criação visual e renderização (/dashboard/studio).",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_engine_krea2",
    name: "Motor Krea-2 Turbo (T2I)",
    description: "Habilita a geração ultrarrápida de imagens em alta resolução (~7.5s).",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_engine_fasth3_i2v",
    name: "Motor FastH3 Image-to-Video",
    description: "Habilita animação de imagens com áudio nativo sincronizado.",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_engine_fasth3_t2v",
    name: "Motor FastH3 Text-to-Video",
    description: "Habilita geração direta de vídeo com áudio a partir de texto (480p e 720p).",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_engine_ltx25",
    name: "Motor LTX-2.5 Distilled HD",
    description: "Habilita o transformer de 22B para renderização cinemática de alta fidelidade 720p 24fps.",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_engine_seedance25",
    name: "Motor Seedance 2.5 (Higgsfield API)",
    description: "Habilita o modelo multimodal ByteDance Seedance 2.5 com áudio nativo e tomadas de até 30s.",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_provider_runpod",
    name: "Provedor RunPod (ComfyUI)",
    description: "Permite roteamento de renderizações para nós ComfyUI no RunPod.",
    category: "system",
    enabled: true,
  },
  {
    key: "studio_provider_higgsfield",
    name: "Provedor Higgsfield API",
    description: "Permite roteamento de renderizações para a API oficial Higgsfield.",
    category: "system",
    enabled: true,
  },
  {
    key: "studio_prefer_higgsfield",
    name: "Priorizar Higgsfield para Vídeo no Modo Auto",
    description: "Quando ativo, o modo Auto do Studio direciona pedidos Text-to-Video para o Seedance 2.5 em vez do FastVideo H3.",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_pro_mode",
    name: "Modo Estúdio Pro",
    description: "Permite alternar para a mesa técnica de controle (seeds, steps, CFG, samplers e nós).",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_morph_transitions",
    name: "Transições de Morphing (2 Quadros)",
    description: "Habilita interpolação orientada entre Primeiro e Último Quadro no motor FastH3.",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_allow_bonus_credits_video",
    name: "Permitir Créditos Bônus em Vídeos Pesados",
    description: "Se desativado, exige ao menos 1 crédito pago para disparar motores pesados (LTX-2.5 ou vídeos > 4s), blindando a tesouraria contra abusos.",
    category: "credits",
    enabled: false,
  },
  {
    key: "dynamic_workflow_pricing",
    name: "Precificação e Margem Dinâmica de Workflows",
    description: "Habilita a cobrança ajustada automaticamente pelas margens de lucro e tempos de execução dos workflows.",
    category: "credits",
    enabled: true,
  },
  {
    key: "studio_projects_management",
    name: "Gestão de Projetos do Estúdio",
    description: "Habilita contêineres de projetos cinematográficos para organizar mídias e roteiros.",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_elements_consistency",
    name: "Sistema de Consistência & Menções (@)",
    description: "Habilita criação de personagens, props e cenários consistentes com injeção de @menções.",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_prompt_enhancer",
    name: "Melhorador de Prompt por IA (Diretor)",
    description: "Ativa enriquecimento de prompts por inteligência artificial calibrado para o motor específico.",
    category: "studio",
    enabled: true,
  },
  {
    key: "studio_batch_generation",
    name: "Geração em Lote & Grid de Variações",
    description: "Habilita síntese simultânea de 1x2 ou 2x2 tomadas para seleção da melhor tomada.",
    category: "studio",
    enabled: true,
  },
  {
    key: "maintenance_mode",
    name: "Modo de Manutenção Geral",
    description: "Bloqueio temporário global para manutenções programadas de infraestrutura e atualizações.",
    category: "system",
    enabled: false,
  },
  {
    key: "landing_page_offers_v2",
    name: "Landing Page de Alta Conversão & Ofertas V2",
    description: "Habilita a nova landing page focada na venda da plataforma com ofertas de R$ 5 (crédito mínimo) e R$ 200/mês (assinatura ilimitada dos nossos modelos).",
    category: "system",
    enabled: true,
  },
  {
    key: "user_onboarding_wizard",
    name: "Onboarding Obrigatório do Criador",
    description: "Conduz novos usuários pelo fluxo de cadastro de WhatsApp, nível de conhecimento de IA e escolha do plano ideal.",
    category: "system",
    enabled: true,
  },
];

/**
 * Utilitário interno para verificar se uma feature flag está ativa
 */
export async function isFeatureFlagActive(
  ctx: QueryCtx | MutationCtx,
  key: string
): Promise<boolean> {
  const flag = await ctx.db
    .query("featureFlags")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();

  if (!flag) {
    // Busca o padrão se ainda não foi gravado no banco
    const defaultFlag = DEFAULT_FEATURE_FLAGS.find((f) => f.key === key);
    return defaultFlag ? defaultFlag.enabled : true;
  }

  return flag.enabled;
}

/**
 * Validação estrita no servidor: lança erro amigável se a feature flag estiver desativada
 */
export async function assertFeatureFlag(
  ctx: QueryCtx | MutationCtx,
  key: string,
  customMessage?: string
): Promise<void> {
  // Verifica modo manutenção (a menos que seja verificação do próprio modo manutenção)
  if (key !== "maintenance_mode") {
    const isMaintenance = await isFeatureFlagActive(ctx, "maintenance_mode");
    if (isMaintenance) {
      // Se for admin, permite passar para testes
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
          .unique();
        if (user?.role === "admin") {
          return;
        }
      }
      throw new Error(
        "O sistema está em manutenção programada para melhorias. Nenhuma nova transação pode ser iniciada no momento."
      );
    }
  }

  const enabled = await isFeatureFlagActive(ctx, key);
  if (!enabled) {
    throw new Error(
      customMessage ||
        `Esta funcionalidade está temporariamente desativada pela administração.`
    );
  }
}

/**
 * Consulta pública das feature flags ativas (retorna objeto chave-valor para consumo instantâneo no frontend)
 */
export const getPublicFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    const dbFlags = await ctx.db.query("featureFlags").take(100);

    const flagsMap: Record<string, boolean> = {};

    // Popula com os padrões
    for (const def of DEFAULT_FEATURE_FLAGS) {
      flagsMap[def.key] = def.enabled;
    }

    // Sobrescreve com o que estiver salvo no banco
    for (const flag of dbFlags) {
      flagsMap[flag.key] = flag.enabled;
    }

    return flagsMap;
  },
});

/**
 * Consulta se uma feature flag específica está ativa
 */
export const checkFeatureFlag = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await isFeatureFlagActive(ctx, args.key);
  },
});

/**
 * Consulta completa de Feature Flags para o Painel Administrativo (Exclusivo Admin)
 */
export const getAllFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const dbFlags = await ctx.db.query("featureFlags").take(100);

    // Mapeia flags do banco
    const dbFlagsMap = new Map(dbFlags.map((f) => [f.key, f]));

    // Garante que todas as default flags apareçam no retorno
    const result = DEFAULT_FEATURE_FLAGS.map((def) => {
      const existing = dbFlagsMap.get(def.key);
      if (existing) {
        return {
          _id: existing._id,
          key: existing.key,
          name: existing.name,
          description: existing.description,
          category: existing.category,
          enabled: existing.enabled,
          updatedAt: existing.updatedAt,
          updatedBy: existing.updatedBy,
          isCustom: false,
        };
      }
      return {
        _id: null,
        key: def.key,
        name: def.name,
        description: def.description,
        category: def.category,
        enabled: def.enabled,
        updatedAt: Date.now(),
        updatedBy: "Sistema (Padrão)",
        isCustom: false,
      };
    });

    // Adiciona flags customizadas criadas dinamicamente se houver
    for (const flag of dbFlags) {
      if (!DEFAULT_FEATURE_FLAGS.some((d) => d.key === flag.key)) {
        result.push({
          _id: flag._id,
          key: flag.key,
          name: flag.name,
          description: flag.description,
          category: flag.category,
          enabled: flag.enabled,
          updatedAt: flag.updatedAt,
          updatedBy: flag.updatedBy,
          isCustom: true,
        });
      }
    }

    return result;
  },
});

/**
 * Alterna rapidamente uma Feature Flag (Liga / Desliga)
 */
export const toggleFeatureFlag = mutation({
  args: {
    key: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { user, identity } = await requireAdmin(ctx);
    const now = Date.now();
    const adminIdentifier = user.email || identity.email || "admin";

    const existing = await ctx.db
      .query("featureFlags")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    const def = DEFAULT_FEATURE_FLAGS.find((f) => f.key === args.key);

    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: args.enabled,
        updatedAt: now,
        updatedBy: adminIdentifier,
      });
    } else {
      await ctx.db.insert("featureFlags", {
        key: args.key,
        name: def?.name || args.key,
        description: def?.description || "Configuração do sistema",
        category: def?.category || "system",
        enabled: args.enabled,
        updatedAt: now,
        updatedBy: adminIdentifier,
      });
    }

    // Registra auditoria para observabilidade
    await ctx.db.insert("systemLogs", {
      level: args.enabled ? "info" : "warn",
      category: "feature_flags",
      message: `Feature Flag "${args.key}" foi ${args.enabled ? "ATIVADA" : "DESATIVADA"} por ${adminIdentifier}`,
      details: JSON.stringify({ key: args.key, enabled: args.enabled, updatedBy: adminIdentifier }),
      userId: identity.subject,
      timestamp: now,
    });

    return { success: true, key: args.key, enabled: args.enabled };
  },
});

/**
 * Atualiza ou cria uma Feature Flag com novos metadados
 */
export const updateFeatureFlag = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("payments"),
      v.literal("credits"),
      v.literal("studio"),
      v.literal("system")
    ),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { user, identity } = await requireAdmin(ctx);
    const now = Date.now();
    const adminIdentifier = user.email || identity.email || "admin";

    const existing = await ctx.db
      .query("featureFlags")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        description: args.description,
        category: args.category,
        enabled: args.enabled,
        updatedAt: now,
        updatedBy: adminIdentifier,
      });
    } else {
      await ctx.db.insert("featureFlags", {
        key: args.key,
        name: args.name,
        description: args.description,
        category: args.category,
        enabled: args.enabled,
        updatedAt: now,
        updatedBy: adminIdentifier,
      });
    }

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "feature_flags",
      message: `Feature Flag "${args.key}" atualizada por ${adminIdentifier}`,
      details: JSON.stringify(args),
      userId: identity.subject,
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Garante que todas as flags padrão existam fisicamente no banco de dados
 */
export const seedDefaultFeatureFlags = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const now = Date.now();

    for (const def of DEFAULT_FEATURE_FLAGS) {
      const existing = await ctx.db
        .query("featureFlags")
        .withIndex("by_key", (q) => q.eq("key", def.key))
        .first();

      if (!existing) {
        await ctx.db.insert("featureFlags", {
          key: def.key,
          name: def.name,
          description: def.description,
          category: def.category,
          enabled: def.enabled,
          updatedAt: now,
          updatedBy: "Sistema (Auto-seed)",
        });
      }
    }

    return { success: true, seededCount: DEFAULT_FEATURE_FLAGS.length };
  },
});
