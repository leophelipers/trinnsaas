import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const sceneValidator = v.object({
  id: v.string(),
  sceneNumber: v.number(),
  header: v.string(),
  visualPrompt: v.string(),
  audioCues: v.string(),
  cameraMovement: v.string(),
});

const DEFAULT_INITIAL_SCENES = [
  {
    id: "sc-1",
    sceneNumber: 1,
    header: "EXT. NEO-TÓQUIO - BECO CIBERNÉTICO - NOITE",
    visualPrompt:
      "Chuva torrencial reflete letreiros em neon ciano e magenta sobre o asfalto molhado. @Elena caminha com passo firme segurando um guarda-chuva holográfico.",
    audioCues:
      "Pingos pesados de chuva no asfalto, buzinas abafadas ao longe, zumbido elétrico de néon.",
    cameraMovement: "Tracking Shot (Acompanhamento)",
  },
  {
    id: "sc-2",
    sceneNumber: 2,
    header: "INT. SEDE CORPORATIVA ARASAKA - ANDAR 80 - MADRUGADA",
    visualPrompt:
      "Plano amplo contemplativo através de janelas do chão ao teto revelando uma metrópole futurista infinita. Silhueta misteriosa observa a cidade com copo de uísque.",
    audioCues:
      "Ar condicionado suave, som de gelo tilintando no copo de vidro, silêncio tenso de suspense.",
    cameraMovement: "Push-in (Aproximação)",
  },
];

/**
 * Lista todos os roteiros do usuário autenticado, com filtro opcional por projeto
 */
export const listScripts = query({
  args: {
    projectId: v.optional(v.id("studioProjects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    if (args.projectId) {
      return await ctx.db
        .query("studioScripts")
        .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("studioScripts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

/**
 * Obtém ou cria o roteiro ativo para o contexto atual (projeto ou global)
 */
export const getOrCreateActiveScript = mutation({
  args: {
    projectId: v.optional(v.id("studioProjects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    // Busca se já existe um roteiro para este projeto ou usuário
    let existing;
    if (args.projectId) {
      existing = await ctx.db
        .query("studioScripts")
        .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .first();
    } else {
      existing = await ctx.db
        .query("studioScripts")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .filter((q) => q.eq(q.field("projectId"), undefined))
        .first();
    }

    if (existing) {
      return existing;
    }

    // Cria roteiro inicial padrão com cenas mestras
    const now = Date.now();
    const scriptId = await ctx.db.insert("studioScripts", {
      userId: identity.subject,
      projectId: args.projectId,
      title: args.projectId ? "Roteiro da Produção" : "Roteiro Master Principal",
      description: "Decupagem técnica de planos cinematográficos e tomadas sequenciais.",
      scenes: DEFAULT_INITIAL_SCENES,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(scriptId);
  },
});

/**
 * Salva a lista de cenas de um roteiro
 */
export const saveScenes = mutation({
  args: {
    scriptId: v.id("studioScripts"),
    scenes: v.array(sceneValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const script = await ctx.db.get(args.scriptId);
    if (!script || script.userId !== identity.subject) {
      throw new Error("Roteiro não encontrado ou acesso não autorizado.");
    }

    await ctx.db.patch(args.scriptId, {
      scenes: args.scenes,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Cria um novo roteiro
 */
export const createScript = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("studioProjects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const now = Date.now();
    const scriptId = await ctx.db.insert("studioScripts", {
      userId: identity.subject,
      projectId: args.projectId,
      title: args.title.trim(),
      description: args.description?.trim(),
      scenes: DEFAULT_INITIAL_SCENES,
      createdAt: now,
      updatedAt: now,
    });

    return scriptId;
  },
});

/**
 * Remove um roteiro
 */
export const deleteScript = mutation({
  args: {
    scriptId: v.id("studioScripts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const script = await ctx.db.get(args.scriptId);
    if (!script || script.userId !== identity.subject) {
      throw new Error("Roteiro não encontrado ou acesso não autorizado.");
    }

    await ctx.db.delete(args.scriptId);
    return { success: true };
  },
});
