import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertFeatureFlag } from "./featureFlags";

/**
 * Lista elementos e atores virtuais do criador autenticado
 */
export const listElements = query({
  args: {
    projectId: v.optional(v.id("studioProjects")),
    type: v.optional(
      v.union(
        v.literal("character"),
        v.literal("prop"),
        v.literal("location"),
        v.literal("style")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let elements = [];
    if (args.projectId) {
      elements = await ctx.db
        .query("studioElements")
        .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
        .collect();
    } else {
      elements = await ctx.db
        .query("studioElements")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .collect();
    }

    if (args.type) {
      elements = elements.filter((el) => el.type === args.type);
    }

    // Ordena mais recentes primeiro
    elements.sort((a, b) => b.createdAt - a.createdAt);

    // Resolve URLs do Convex File Storage para referências visuais
    return await Promise.all(
      elements.map(async (el) => {
        let referenceImageUrl = el.referenceImageUrl;
        if (el.referenceImageStorageId) {
          const fresh = await ctx.storage.getUrl(el.referenceImageStorageId);
          if (fresh) referenceImageUrl = fresh;
        }

        let turnaroundUrls: string[] = [];
        if (el.turnaroundStorageIds && el.turnaroundStorageIds.length > 0) {
          turnaroundUrls = (
            await Promise.all(
              el.turnaroundStorageIds.map((id) => ctx.storage.getUrl(id))
            )
          ).filter((url): url is string => Boolean(url));
        }

        return {
          ...el,
          referenceImageUrl,
          turnaroundUrls,
        };
      })
    );
  },
});

/**
 * Consulta um elemento específico pelo ID
 */
export const getElementById = query({
  args: {
    id: v.id("studioElements"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const el = await ctx.db.get(args.id);
    if (!el || el.userId !== identity.subject) {
      return null;
    }

    let referenceImageUrl = el.referenceImageUrl;
    if (el.referenceImageStorageId) {
      const fresh = await ctx.storage.getUrl(el.referenceImageStorageId);
      if (fresh) referenceImageUrl = fresh;
    }

    return {
      ...el,
      referenceImageUrl,
    };
  },
});

/**
 * Cria uma nova ficha de elemento/ator virtual consistente (@mention)
 */
export const createElement = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    await assertFeatureFlag(
      ctx,
      "studio_elements_consistency",
      "O sistema de consistência de elementos está temporariamente desativado."
    );

    const name = args.name.trim();
    if (!name) {
      throw new Error("O nome do elemento é obrigatório.");
    }

    // Sanitiza a tag: remove '@', espaços e caracteres especiais para formato seguro
    const cleanTag = args.tag
      .replace(/^@/, "")
      .replace(/[^a-zA-Z0-9_\u00C0-\u017F]/g, "")
      .trim();

    if (!cleanTag) {
      throw new Error("A menção (@tag) deve conter ao menos um caractere alfanumérico.");
    }

    // Verifica se já existe um elemento com essa mesma tag para esse usuário
    const existing = await ctx.db
      .query("studioElements")
      .withIndex("by_userId_tag", (q) =>
        q.eq("userId", identity.subject).eq("tag", cleanTag)
      )
      .first();

    if (existing) {
      throw new Error(`A menção @${cleanTag} já existe na sua biblioteca. Use outra tag ou edite o elemento existente.`);
    }

    const now = Date.now();
    const elementId = await ctx.db.insert("studioElements", {
      userId: identity.subject,
      projectId: args.projectId,
      name,
      tag: cleanTag,
      type: args.type,
      anchorPrompt: args.anchorPrompt.trim(),
      negativePrompt: args.negativePrompt?.trim(),
      referenceImageUrl: args.referenceImageUrl,
      referenceImageStorageId: args.referenceImageStorageId,
      turnaroundStorageIds: args.turnaroundStorageIds,
      seed: args.seed,
      createdAt: now,
      updatedAt: now,
    });

    return elementId;
  },
});

/**
 * Atualiza propriedades de um elemento consistente
 */
export const updateElement = mutation({
  args: {
    id: v.id("studioElements"),
    name: v.optional(v.string()),
    tag: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("character"),
        v.literal("prop"),
        v.literal("location"),
        v.literal("style")
      )
    ),
    anchorPrompt: v.optional(v.string()),
    negativePrompt: v.optional(v.string()),
    referenceImageUrl: v.optional(v.string()),
    referenceImageStorageId: v.optional(v.id("_storage")),
    turnaroundStorageIds: v.optional(v.array(v.id("_storage"))),
    seed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    const el = await ctx.db.get(args.id);
    if (!el || el.userId !== identity.subject) {
      throw new Error("Elemento não encontrado ou acesso não autorizado.");
    }

    const updates: Partial<typeof el> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.tag !== undefined) {
      const cleanTag = args.tag
        .replace(/^@/, "")
        .replace(/[^a-zA-Z0-9_\u00C0-\u017F]/g, "")
        .trim();
      if (!cleanTag) {
        throw new Error("Tag inválida.");
      }
      updates.tag = cleanTag;
    }
    if (args.type !== undefined) updates.type = args.type;
    if (args.anchorPrompt !== undefined) updates.anchorPrompt = args.anchorPrompt.trim();
    if (args.negativePrompt !== undefined) updates.negativePrompt = args.negativePrompt.trim();
    if (args.referenceImageUrl !== undefined) updates.referenceImageUrl = args.referenceImageUrl;
    if (args.referenceImageStorageId !== undefined)
      updates.referenceImageStorageId = args.referenceImageStorageId;
    if (args.turnaroundStorageIds !== undefined)
      updates.turnaroundStorageIds = args.turnaroundStorageIds;
    if (args.seed !== undefined) updates.seed = args.seed;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Remove um elemento consistente
 */
export const deleteElement = mutation({
  args: {
    id: v.id("studioElements"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    const el = await ctx.db.get(args.id);
    if (!el || el.userId !== identity.subject) {
      throw new Error("Elemento não encontrado ou acesso não autorizado.");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Resolução dinâmica de menções (@tags) em um prompt
 * Identifica @tags no texto, consulta as âncoras e retorna o prompt enriquecido com referências
 */
export const resolveMentionsInPrompt = query({
  args: {
    prompt: v.string(),
    projectId: v.optional(v.id("studioProjects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        originalPrompt: args.prompt,
        expandedPrompt: args.prompt,
        matchedElements: [],
        primaryReferenceStorageId: null,
        allReferenceStorageIds: [],
        combinedNegativePrompt: "",
      };
    }

    // Extrai tags com regex: @NomeDaTag
    const tagMatches = args.prompt.match(/@([a-zA-Z0-9_\u00C0-\u017F]+)/g);
    if (!tagMatches || tagMatches.length === 0) {
      return {
        originalPrompt: args.prompt,
        expandedPrompt: args.prompt,
        matchedElements: [],
        primaryReferenceStorageId: null,
        allReferenceStorageIds: [],
        combinedNegativePrompt: "",
      };
    }

    const cleanTags = Array.from(new Set(tagMatches.map((t) => t.replace(/^@/, ""))));

    // Busca todos os elementos correspondentes do usuário
    const allUserElements = await ctx.db
      .query("studioElements")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const matched = allUserElements.filter((el) => cleanTags.includes(el.tag));

    // Constrói o prompt expandido substituindo cada @tag pela descrição âncora canônica
    let expanded = args.prompt;
    const negativeParts: string[] = [];
    const referenceStorageIds: string[] = [];
    let primaryStorageId: string | null = null;

    for (const el of matched) {
      const mentionPattern = new RegExp(`@${el.tag}\\b`, "g");
      // Substitui a tag pela descrição do elemento mantendo legibilidade para o CLIP
      expanded = expanded.replace(mentionPattern, `(${el.name}: ${el.anchorPrompt})`);

      if (el.negativePrompt) {
        negativeParts.push(el.negativePrompt);
      }

      if (el.referenceImageStorageId) {
        referenceStorageIds.push(el.referenceImageStorageId);
        if (!primaryStorageId && (el.type === "character" || el.type === "prop")) {
          primaryStorageId = el.referenceImageStorageId;
        }
      }
    }

    return {
      originalPrompt: args.prompt,
      expandedPrompt: expanded,
      matchedElements: matched,
      primaryReferenceStorageId: primaryStorageId,
      allReferenceStorageIds: referenceStorageIds,
      combinedNegativePrompt: negativeParts.join(", "),
    };
  },
});
