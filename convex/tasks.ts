import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertFeatureFlag } from "./featureFlags";

// Retorna apenas as tarefas do usuário autenticado
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(100);
  },
});

// Adiciona uma tarefa vinculada obrigatoriamente ao usuário logado e validada pelo antifraude
export const add = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autorizado");
    }

    // Verificação de Feature Flag e Manutenção
    await assertFeatureFlag(ctx, "video_generation", "O estúdio de tarefas e criação está temporariamente em manutenção.");

    // Verificação Antifraude: Se a conta estiver bloqueada
    const claim = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (claim && claim.status === "blocked") {
      throw new Error(
        claim.reason || "Cota do plano gratuito bloqueada por política antifraude."
      );
    }

    const trimmed = args.text.trim();
    if (!trimmed) {
      throw new Error("O texto da tarefa não pode estar vazio");
    }

    // Se o usuário possui plano ativo com créditos limitados, consome 1 crédito
    if (claim && claim.status === "active") {
      if (claim.creditsRemaining <= 0) {
        throw new Error(
          "Você atingiu o limite de créditos do plano gratuito. Faça upgrade para o plano Pro para continuar."
        );
      }
      await ctx.db.patch(claim._id, {
        creditsRemaining: claim.creditsRemaining - 1,
      });
    }

    return await ctx.db.insert("tasks", {
      text: trimmed,
      isCompleted: false,
      userId: identity.subject,
    });
  },
});

// Alterna o status da tarefa apenas se pertencer ao usuário logado
export const toggle = mutation({
  args: { id: v.id("tasks"), isCompleted: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autorizado");
    }
    const task = await ctx.db.get("tasks", args.id);
    if (!task) {
      throw new Error("Tarefa não encontrada");
    }
    if (task.userId !== identity.subject) {
      throw new Error("Você não tem permissão para alterar esta tarefa");
    }
    await ctx.db.patch(args.id, { isCompleted: args.isCompleted });
  },
});

// Remove uma tarefa apenas se pertencer ao usuário logado
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autorizado");
    }
    const task = await ctx.db.get("tasks", args.id);
    if (!task) {
      throw new Error("Tarefa não encontrada");
    }
    if (task.userId !== identity.subject) {
      throw new Error("Você não tem permissão para excluir esta tarefa");
    }
    await ctx.db.delete(args.id);
  },
});
