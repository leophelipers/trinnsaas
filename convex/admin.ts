import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export type Role = "admin" | "moderator" | "user";
export type UserStatus = "active" | "suspended" | "pending";

/**
 * Utilitário interno para obter o usuário autenticado na base de dados
 */
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Não autenticado.");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return { identity, user };
}

/**
 * Verificação estrita de RBAC - Exclusivo para Administradores
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const { identity, user } = await getAuthenticatedUser(ctx);
  if (!user) {
    throw new Error("Usuário não registrado no sistema.");
  }

  const role = (user.role as Role) || "user";
  if (role !== "admin") {
    throw new Error("Acesso negado: esta operação é restrita exclusivamente a Administradores.");
  }

  return { identity, user, role };
}

/**
 * Consulta pública/segura do status de administrador do usuário atual
 */
export const getCurrentAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isAuthenticated: false,
        role: "user" as Role,
        isAdmin: false,
        user: null,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const role = (user?.role as Role) || "user";
    const isAdmin = role === "admin";

    return {
      isAuthenticated: true,
      role,
      isAdmin,
      user: user
        ? {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "user",
            status: user.status || "active",
          }
        : null,
    };
  },
});

/**
 * Lista usuários para o painel administrativo (Apenas Admin)
 */
export const listUsers = query({
  args: {
    search: v.optional(v.string()),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const maxLimit = Math.min(args.limit ?? 100, 200);
    const users = await ctx.db.query("users").order("desc").take(maxLimit);

    // Enriquecer usuários com dados de cota e tarefas
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const claim = await ctx.db
          .query("freePlanClaims")
          .withIndex("by_userId", (q) => q.eq("userId", u.clerkId))
          .first();

        const taskCount = (
          await ctx.db
            .query("tasks")
            .withIndex("by_userId", (q) => q.eq("userId", u.clerkId))
            .collect()
        ).length;

        return {
          _id: u._id,
          _creationTime: u._creationTime,
          clerkId: u.clerkId,
          name: u.name || "Criador",
          email: u.email,
          imageUrl: u.imageUrl,
          role: (u.role as Role) || "user",
          status: (u.status as UserStatus) || "active",
          customCredits: u.customCredits,
          notes: u.notes,
          creditsRemaining: claim?.creditsRemaining ?? 50,
          creditsTotal: claim?.creditsTotal ?? 50,
          claimStatus: claim?.status ?? "active",
          taskCount,
        };
      })
    );

    // Filtros em memória
    return enrichedUsers.filter((u) => {
      if (args.role && args.role !== "all" && u.role !== args.role) {
        return false;
      }
      if (args.status && args.status !== "all" && u.status !== args.status) {
        return false;
      }
      if (args.search) {
        const s = args.search.toLowerCase().trim();
        const matchName = u.name?.toLowerCase().includes(s) ?? false;
        const matchEmail = u.email.toLowerCase().includes(s);
        return matchName || matchEmail;
      }
      return true;
    });
  },
});

/**
 * Obtém detalhes completos de um usuário (Apenas Admin)
 */
export const getUserDetails = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Usuário não encontrado.");
    }

    const claim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", targetUser.clerkId))
      .first();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", targetUser.clerkId))
      .order("desc")
      .take(20);

    const abuseLogs = await ctx.db
      .query("abuseLogs")
      .withIndex("by_userId", (q) => q.eq("userId", targetUser.clerkId))
      .order("desc")
      .take(10);

    return {
      user: {
        _id: targetUser._id,
        _creationTime: targetUser._creationTime,
        clerkId: targetUser.clerkId,
        name: targetUser.name || "Criador",
        email: targetUser.email,
        imageUrl: targetUser.imageUrl,
        role: (targetUser.role as Role) || "user",
        status: (targetUser.status as UserStatus) || "active",
        notes: targetUser.notes,
        customCredits: targetUser.customCredits,
      },
      claim,
      tasks,
      abuseLogs,
    };
  },
});

/**
 * Criação manual de usuário (Apenas Admin)
 */
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("moderator"), v.literal("user")),
    credits: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const cleanEmail = args.email.trim().toLowerCase();
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      throw new Error("Formato de e-mail inválido.");
    }

    const cleanName = args.name.trim();
    if (!cleanName) {
      throw new Error("O nome do usuário é obrigatório.");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", cleanEmail))
      .first();

    if (existing) {
      throw new Error("Já existe um usuário registrado com este e-mail.");
    }

    const syntheticClerkId = `admin_created_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const credits = Math.max(0, args.credits ?? 50);

    const userId = await ctx.db.insert("users", {
      clerkId: syntheticClerkId,
      email: cleanEmail,
      name: cleanName,
      role: args.role,
      status: "active",
      customCredits: credits,
      notes: args.notes?.trim() || undefined,
    });

    // Inicializa cota de créditos
    await ctx.db.insert("freePlanClaims", {
      userId: syntheticClerkId,
      email: cleanEmail,
      canonicalEmail: cleanEmail,
      deviceId: `created_by_admin_${Date.now()}`,
      status: "active",
      claimedAt: Date.now(),
      tier: "free",
      creditsRemaining: credits,
      creditsTotal: credits,
    });

    return userId;
  },
});

/**
 * Atualização de usuário (Apenas Admin)
 */
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("moderator"), v.literal("user"))
    ),
    status: v.optional(
      v.union(v.literal("active"), v.literal("suspended"), v.literal("pending"))
    ),
    creditsRemaining: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user: callerUser } = await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Usuário não encontrado.");
    }

    // Proteção contra auto-bloqueio de administrador
    if (targetUser._id === callerUser._id) {
      if (args.role && args.role !== "admin") {
        throw new Error("Você não pode revogar seu próprio papel de administrador.");
      }
      if (args.status && args.status === "suspended") {
        throw new Error("Você não pode suspender sua própria conta de administrador.");
      }
    }

    const patch: any = {};
    if (args.name !== undefined) {
      const cleanName = args.name.trim();
      if (!cleanName) throw new Error("O nome não pode estar vazio.");
      patch.name = cleanName;
    }
    if (args.role !== undefined) {
      patch.role = args.role;
    }
    if (args.status !== undefined) {
      patch.status = args.status;
    }
    if (args.notes !== undefined) {
      patch.notes = args.notes.trim() || undefined;
    }
    if (args.creditsRemaining !== undefined) {
      patch.customCredits = Math.max(0, args.creditsRemaining);
    }

    await ctx.db.patch(targetUser._id, patch);

    // Sincroniza claims se houver alteração de créditos ou suspensão
    const claim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", targetUser.clerkId))
      .first();

    if (claim) {
      const claimPatch: any = {};
      if (args.creditsRemaining !== undefined) {
        claimPatch.creditsRemaining = Math.max(0, args.creditsRemaining);
      }
      if (args.status === "suspended") {
        claimPatch.status = "blocked";
        claimPatch.reason = "Acesso suspenso pelo Administrador.";
      } else if (args.status === "active" && claim.status === "blocked") {
        claimPatch.status = "active";
        claimPatch.reason = undefined;
      }

      if (Object.keys(claimPatch).length > 0) {
        await ctx.db.patch(claim._id, claimPatch);
      }
    }

    return { success: true };
  },
});

/**
 * Exclusão definitiva de usuário com cascata (Apenas Admin)
 */
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { user: callerUser } = await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Usuário não encontrado.");
    }

    if (targetUser._id === callerUser._id) {
      throw new Error("Você não pode excluir sua própria conta através do painel de administração.");
    }

    const clerkId = targetUser.clerkId;

    // 1. Excluir tarefas
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .collect();
    for (const t of tasks) {
      await ctx.db.delete(t._id);
    }

    // 2. Excluir cotas
    const claims = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .collect();
    for (const c of claims) {
      await ctx.db.delete(c._id);
    }

    // 3. Excluir logs de abuso
    const logs = await ctx.db
      .query("abuseLogs")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .collect();
    for (const l of logs) {
      await ctx.db.delete(l._id);
    }

    // 4. Excluir avatar do storage se houver
    if (targetUser.avatarStorageId) {
      try {
        await ctx.storage.delete(targetUser.avatarStorageId);
      } catch {
        // ignore
      }
    }

    // 5. Excluir usuário
    await ctx.db.delete(targetUser._id);

    return { success: true };
  },
});

/**
 * Estatísticas do painel administrativo (Apenas Admin)
 */
export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allUsers = await ctx.db.query("users").collect();
    const allTasks = await ctx.db.query("tasks").collect();
    const allClaims = await ctx.db.query("freePlanClaims").collect();
    const abuseLogs = await ctx.db.query("abuseLogs").collect();

    let adminCount = 0;
    let moderatorCount = 0;
    let activeCount = 0;
    let suspendedCount = 0;
    let totalCreditsInCirculation = 0;

    for (const u of allUsers) {
      if (u.role === "admin") adminCount++;
      else if (u.role === "moderator") moderatorCount++;

      if (u.status === "suspended") suspendedCount++;
      else activeCount++;
    }

    for (const c of allClaims) {
      totalCreditsInCirculation += c.creditsRemaining;
    }

    return {
      totalUsers: allUsers.length,
      activeUsers: activeCount,
      suspendedUsers: suspendedCount,
      adminCount,
      moderatorCount,
      creatorCount: allUsers.length - adminCount - moderatorCount,
      totalTasks: allTasks.length,
      totalCreditsInCirculation,
      totalAbuseLogs: abuseLogs.length,
      recentUsers: allUsers
        .slice(-6)
        .reverse()
        .map((u) => ({
          id: u._id,
          name: u.name || "Criador",
          email: u.email,
          role: (u.role as Role) || "user",
          status: (u.status as UserStatus) || "active",
          createdAt: u._creationTime,
        })),
    };
  },
});

/**
 * Lista de logs de incidentes e segurança (Apenas Admin)
 */
export const listAbuseLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? 50, 100);
    return await ctx.db.query("abuseLogs").order("desc").take(limit);
  },
});
