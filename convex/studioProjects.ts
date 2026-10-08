import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertFeatureFlag } from "./featureFlags";

/**
 * Lista todos os projetos cinematográficos do criador autenticado
 */
export const listProjects = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const projects = await ctx.db
      .query("studioProjects")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    const filtered = args.status
      ? projects.filter((p) => p.status === args.status)
      : projects;

    // Resoluções de coverUrl e contadores de ativos por projeto
    return await Promise.all(
      filtered.map(async (project) => {
        let coverUrl = project.coverUrl;
        if (project.coverStorageId) {
          const fresh = await ctx.storage.getUrl(project.coverStorageId);
          if (fresh) coverUrl = fresh;
        }

        // Contagem de gerações vinculadas
        const genCount = await ctx.db
          .query("studioGenerations")
          .withIndex("by_userId_project", (q) =>
            q.eq("userId", identity.subject).eq("projectId", String(project._id))
          )
          .collect();

        // Contagem de elementos (@) vinculados
        const elementCount = await ctx.db
          .query("studioElements")
          .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
          .collect();

        return {
          ...project,
          coverUrl,
          generationCount: genCount.length,
          elementCount: elementCount.length,
        };
      })
    );
  },
});

/**
 * Obtém detalhes completos de um projeto pelo ID
 */
export const getProject = query({
  args: {
    id: v.id("studioProjects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== identity.subject) {
      return null;
    }

    let coverUrl = project.coverUrl;
    if (project.coverStorageId) {
      const fresh = await ctx.storage.getUrl(project.coverStorageId);
      if (fresh) coverUrl = fresh;
    }

    return {
      ...project,
      coverUrl,
    };
  },
});

/**
 * Cria um novo projeto cinematográfico multimodal
 */
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    aspectRatio: v.optional(v.string()),
    styleLook: v.optional(v.string()),
    coverStorageId: v.optional(v.id("_storage")),
    coverUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    await assertFeatureFlag(
      ctx,
      "studio_projects_management",
      "A gestão de projetos do estúdio está temporariamente em manutenção."
    );

    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("O nome do projeto não pode ser vazio.");
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("studioProjects", {
      userId: identity.subject,
      name: trimmedName,
      description: args.description?.trim(),
      aspectRatio: args.aspectRatio || "16:9",
      styleLook: args.styleLook || "Cinematográfico 35mm",
      coverStorageId: args.coverStorageId,
      coverUrl: args.coverUrl,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return projectId;
  },
});

/**
 * Atualiza propriedades de um projeto existente
 */
export const updateProject = mutation({
  args: {
    id: v.id("studioProjects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    aspectRatio: v.optional(v.string()),
    styleLook: v.optional(v.string()),
    coverStorageId: v.optional(v.id("_storage")),
    coverUrl: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Projeto não encontrado ou acesso não autorizado.");
    }

    const updates: Partial<typeof project> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.description !== undefined) updates.description = args.description.trim();
    if (args.aspectRatio !== undefined) updates.aspectRatio = args.aspectRatio;
    if (args.styleLook !== undefined) updates.styleLook = args.styleLook;
    if (args.coverStorageId !== undefined) updates.coverStorageId = args.coverStorageId;
    if (args.coverUrl !== undefined) updates.coverUrl = args.coverUrl;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Exclui ou arquiva um projeto
 */
export const deleteProject = mutation({
  args: {
    id: v.id("studioProjects"),
    permanent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Projeto não encontrado ou acesso não autorizado.");
    }

    if (args.permanent) {
      await ctx.db.delete(args.id);
    } else {
      await ctx.db.patch(args.id, {
        status: "archived",
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Consulta unificada do Cofre Multimodal (Media Vault) do projeto
 */
export const getProjectVault = query({
  args: {
    projectId: v.optional(v.id("studioProjects")),
    mediaType: v.optional(v.union(v.literal("all"), v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { generations: [], elements: [] };
    }

    let rawGenerations = [];
    if (args.projectId) {
      rawGenerations = await ctx.db
        .query("studioGenerations")
        .withIndex("by_userId_project", (q) =>
          q.eq("userId", identity.subject).eq("projectId", String(args.projectId))
        )
        .order("desc")
        .take(100);
    } else {
      rawGenerations = await ctx.db
        .query("studioGenerations")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .order("desc")
        .take(100);
    }

    if (args.mediaType && args.mediaType !== "all") {
      rawGenerations = rawGenerations.filter((g) => g.type === args.mediaType);
    }

    const generations = await Promise.all(
      rawGenerations.map(async (gen) => {
        let url = gen.outputUrl;
        if (gen.outputStorageId) {
          const fresh = await ctx.storage.getUrl(gen.outputStorageId);
          if (fresh) url = fresh;
        }
        return {
          ...gen,
          outputUrl: url,
        };
      })
    );

    let rawElements = [];
    if (args.projectId) {
      rawElements = await ctx.db
        .query("studioElements")
        .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
        .collect();
    } else {
      rawElements = await ctx.db
        .query("studioElements")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .collect();
    }

    const elements = await Promise.all(
      rawElements.map(async (el) => {
        let referenceImageUrl = el.referenceImageUrl;
        if (el.referenceImageStorageId) {
          const fresh = await ctx.storage.getUrl(el.referenceImageStorageId);
          if (fresh) referenceImageUrl = fresh;
        }
        return {
          ...el,
          referenceImageUrl,
        };
      })
    );

    return {
      generations,
      elements,
    };
  },
});
