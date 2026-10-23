import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { assertFeatureFlag, isFeatureFlagActive } from "./featureFlags";

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    }

    const isPreLaunchActive = await isFeatureFlagActive(ctx, "pre_launch_mode");
    const tags = isPreLaunchActive ? ["pre_lancamento"] : undefined;

    const newUserId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role: "user",
      status: "active",
      tags,
      isPreLaunch: isPreLaunchActive ? true : undefined,
      adminNotifiedAt: Date.now(),
    });

    if (isPreLaunchActive) {
      await ctx.db.insert("systemLogs", {
        level: "info",
        category: "users",
        message: `Novo cadastro de Pré-Lançamento (Webhook Clerk): ${args.email}`,
        details: JSON.stringify({
          clerkId: args.clerkId,
          email: args.email,
          tags: ["pre_lancamento"],
        }),
        userId: args.clerkId,
        timestamp: Date.now(),
      });
    }

    // Dispara e-mail de boas-vindas ao usuário + aviso para leo.phe.rod@gmail.com
    await ctx.scheduler.runAfter(0, internal.emails.sendPreLaunchEmails, {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      eventType: "new_signup",
    });

    return newUserId;
  },
});

export const deleteFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.delete(existingUser._id);
    }
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const syncUser = mutation({
  args: {
    tag: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    nameOverride: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado no Convex");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const email = identity.email ?? "";
    const cleanNameOverride = args.nameOverride ? sanitizeNameString(args.nameOverride) : undefined;
    const name = cleanNameOverride || (identity.name ?? undefined);
    const imageUrl = identity.pictureUrl ?? undefined;
    const tokenIdentifier = identity.tokenIdentifier;
    const isPreLaunchActive = await isFeatureFlagActive(ctx, "pre_launch_mode");

    if (existingUser) {
      const currentTags = existingUser.tags ?? [];
      const shouldAddPreLaunchTag =
        args.tag === "pre_lancamento" && !currentTags.includes("pre_lancamento");

      const updatedTags = shouldAddPreLaunchTag
        ? Array.from(new Set([...currentTags, "pre_lancamento"]))
        : existingUser.tags;

      await ctx.db.patch(existingUser._id, {
        email: email || existingUser.email,
        name: existingUser.name || name,
        imageUrl: imageUrl !== undefined ? imageUrl : existingUser.imageUrl,
        tokenIdentifier,
        whatsapp: existingUser.whatsapp || (args.whatsapp ? args.whatsapp.trim() : undefined),
        tags: updatedTags,
        isPreLaunch: shouldAddPreLaunchTag ? true : existingUser.isPreLaunch,
      });

      if (shouldAddPreLaunchTag || !existingUser.adminNotifiedAt) {
        await ctx.db.patch(existingUser._id, {
          adminNotifiedAt: Date.now(),
        });
        await ctx.scheduler.runAfter(0, internal.emails.sendPreLaunchEmails, {
          clerkId: identity.subject,
          email: email || existingUser.email,
          name: existingUser.name || name,
          whatsapp: args.whatsapp || existingUser.whatsapp,
          eventType: "new_signup",
        });
      }

      if (shouldAddPreLaunchTag) {
        await ctx.db.insert("systemLogs", {
          level: "info",
          category: "users",
          message: `Tag 'pre_lancamento' vinculada ao usuário: ${email || existingUser.email}`,
          details: JSON.stringify({
            clerkId: identity.subject,
            tags: updatedTags,
            whatsapp: args.whatsapp || existingUser.whatsapp,
          }),
          userId: identity.subject,
          timestamp: Date.now(),
        });
      }

      return existingUser._id;
    }

    const assignPreLaunch = isPreLaunchActive || args.tag === "pre_lancamento";
    const initialTags = assignPreLaunch ? ["pre_lancamento"] : undefined;

    const newUserId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email,
      name,
      imageUrl,
      tokenIdentifier,
      whatsapp: args.whatsapp ? args.whatsapp.trim() : undefined,
      role: "user",
      status: "active",
      tags: initialTags,
      isPreLaunch: assignPreLaunch ? true : undefined,
      adminNotifiedAt: Date.now(),
    });

    if (assignPreLaunch) {
      await ctx.db.insert("systemLogs", {
        level: "info",
        category: "users",
        message: `Novo usuário cadastrado com tag 'pre_lancamento': ${email || identity.subject}`,
        details: JSON.stringify({
          clerkId: identity.subject,
          email,
          name,
          whatsapp: args.whatsapp,
          tags: ["pre_lancamento"],
        }),
        userId: identity.subject,
        timestamp: Date.now(),
      });
    }

    // Dispara e-mail de boas-vindas ao usuário + aviso para leo.phe.rod@gmail.com
    await ctx.scheduler.runAfter(0, internal.emails.sendPreLaunchEmails, {
      clerkId: identity.subject,
      email,
      name,
      whatsapp: args.whatsapp ? args.whatsapp.trim() : undefined,
      eventType: "new_signup",
    });

    return newUserId;
  },
});

// Whitelist de tipos MIME estritamente seguros para avatares (bloqueia SVG com XSS, scripts, HTML, etc)
const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function sanitizeNameString(raw: string): string {
  // 1. Normaliza unicode e remove caracteres de controle invisíveis ou nulos
  return raw
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "")
    // 2. Remove tags HTML para prevenir injeções de marcação
    .replace(/<[^>]*>/g, "")
    // 3. Colapsa espaços em branco múltiplos
    .replace(/\s+/g, " ")
    .trim();
}

export const updateName = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const sanitized = sanitizeNameString(args.name);

    if (sanitized.length < 1) {
      throw new Error("O nome não pode estar vazio.");
    }

    if (sanitized.length > 80) {
      throw new Error("O nome deve ter no máximo 80 caracteres.");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: sanitized,
      });
      return existingUser._id;
    }

    return null;
  },
});

export const savePreLaunchProfile = mutation({
  args: {
    name: v.string(),
    whatsapp: v.string(),
  },
  handler: async (ctx, args) => {
    await assertFeatureFlag(ctx, "pre_launch_mode");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado no Convex");
    }

    const sanitizedName = sanitizeNameString(args.name);
    if (sanitizedName.length < 2) {
      throw new Error("Por favor, informe seu nome completo.");
    }

    const digitsOnly = args.whatsapp.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 13) {
      throw new Error("Por favor, informe um WhatsApp válido com DDD.");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const now = Date.now();
    const nameParts = sanitizedName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || undefined;

    if (existingUser) {
      const updatedTags = Array.from(
        new Set([...(existingUser.tags ?? []), "pre_lancamento"])
      );
      await ctx.db.patch(existingUser._id, {
        name: sanitizedName,
        firstName,
        lastName,
        whatsapp: args.whatsapp.trim(),
        tags: updatedTags,
        isPreLaunch: true,
        onboardingCompleted: true,
        onboardingCompletedAt: existingUser.onboardingCompletedAt ?? now,
      });

      await ctx.db.insert("systemLogs", {
        level: "info",
        category: "users",
        message: `Perfil de Pré-Lançamento atualizado: ${existingUser.email} (${sanitizedName})`,
        details: JSON.stringify({
          clerkId: identity.subject,
          whatsapp: args.whatsapp.trim(),
          tags: updatedTags,
        }),
        userId: identity.subject,
        timestamp: now,
      });

      return { success: true, userId: existingUser._id };
    }

    const newUserId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      name: sanitizedName,
      firstName,
      lastName,
      whatsapp: args.whatsapp.trim(),
      tags: ["pre_lancamento"],
      isPreLaunch: true,
      onboardingCompleted: true,
      onboardingCompletedAt: now,
      role: "user",
      status: "active",
      tokenIdentifier: identity.tokenIdentifier,
    });

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "users",
      message: `Novo perfil de Pré-Lançamento salvo: ${identity.email ?? identity.subject} (${sanitizedName})`,
      details: JSON.stringify({
        clerkId: identity.subject,
        whatsapp: args.whatsapp.trim(),
        tags: ["pre_lancamento"],
      }),
      userId: identity.subject,
      timestamp: now,
    });

    return { success: true, userId: newUserId };
  },
});

export const completeOnboarding = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    whatsapp: v.string(),
    aiExperienceLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    preferredPlan: v.union(
      v.literal("unlimited"),
      v.literal("credits"),
      v.literal("explore_later")
    ),
  },
  handler: async (ctx, args) => {
    await assertFeatureFlag(ctx, "user_onboarding_wizard");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado no Convex");
    }

    const sanitizedFirstName = sanitizeNameString(args.firstName);
    const sanitizedLastName = sanitizeNameString(args.lastName);
    const fullName = `${sanitizedFirstName} ${sanitizedLastName}`.trim();

    if (!sanitizedFirstName || sanitizedFirstName.length < 2) {
      throw new Error("Por favor, preencha seu primeiro nome.");
    }
    if (!sanitizedLastName || sanitizedLastName.length < 2) {
      throw new Error("Por favor, preencha seu sobrenome.");
    }

    // Normalização e validação de WhatsApp (somente dígitos)
    const digitsOnly = args.whatsapp.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 13) {
      throw new Error("Por favor, informe um WhatsApp válido com DDD.");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const now = Date.now();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: fullName,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        whatsapp: args.whatsapp.trim(),
        aiExperienceLevel: args.aiExperienceLevel,
        preferredPlan: args.preferredPlan,
        onboardingCompleted: true,
        onboardingCompletedAt: now,
      });

      // Registro contínuo de observabilidade
      await ctx.db.insert("systemLogs", {
        level: "info",
        category: "users",
        message: `Onboarding de usuário concluído: ${existingUser.email} (${fullName})`,
        details: JSON.stringify({
          clerkId: identity.subject,
          whatsapp: args.whatsapp.trim(),
          aiExperienceLevel: args.aiExperienceLevel,
          preferredPlan: args.preferredPlan,
        }),
        userId: identity.subject,
        timestamp: now,
      });

      return { success: true, userId: existingUser._id };
    }

    // Se o usuário ainda não existia na base Convex, insere o registro completo
    const newUserId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email ?? "",
      name: fullName,
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      whatsapp: args.whatsapp.trim(),
      aiExperienceLevel: args.aiExperienceLevel,
      preferredPlan: args.preferredPlan,
      onboardingCompleted: true,
      onboardingCompletedAt: now,
      role: "user",
      status: "active",
      tokenIdentifier: identity.tokenIdentifier,
    });

    await ctx.db.insert("systemLogs", {
      level: "info",
      category: "users",
      message: `Novo usuário registrado e onboarding concluído: ${identity.email ?? identity.subject} (${fullName})`,
      details: JSON.stringify({
        clerkId: identity.subject,
        whatsapp: args.whatsapp.trim(),
        aiExperienceLevel: args.aiExperienceLevel,
        preferredPlan: args.preferredPlan,
      }),
      userId: identity.subject,
      timestamp: now,
    });

    return { success: true, userId: newUserId };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateAvatar = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    // 1. Inspeciona os metadados do arquivo diretamente no sistema de arquivos do Convex
    const metadata = await ctx.db.system.get("_storage", args.storageId);
    if (!metadata) {
      throw new Error("Arquivo não encontrado no armazenamento.");
    }

    // 2. Validação estrita do tipo MIME (Prevenção contra XSS armazenado via SVG/HTML/Executáveis)
    const contentType = metadata.contentType?.toLowerCase() || "";
    if (!ALLOWED_AVATAR_MIME_TYPES.has(contentType)) {
      try {
        await ctx.storage.delete(args.storageId);
      } catch {
        // ignore
      }
      throw new Error(
        "Tipo de arquivo não permitido. Apenas imagens JPG, PNG, WebP e GIF são aceitas."
      );
    }

    // 3. Validação do tamanho máximo do arquivo (5MB)
    if (metadata.size > MAX_AVATAR_SIZE_BYTES) {
      try {
        await ctx.storage.delete(args.storageId);
      } catch {
        // ignore
      }
      throw new Error("O arquivo ultrapassa o limite máximo permitido de 5MB.");
    }

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) {
      throw new Error("Falha ao resolver URL do arquivo.");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      // Remove o avatar anterior do storage para evitar acúmulo de lixo
      if (existingUser.avatarStorageId && existingUser.avatarStorageId !== args.storageId) {
        try {
          await ctx.storage.delete(existingUser.avatarStorageId);
        } catch {
          // ignore
        }
      }
      await ctx.db.patch(existingUser._id, {
        avatarStorageId: args.storageId,
        imageUrl: imageUrl,
      });
      return imageUrl;
    }

    return null;
  },
});

export const removeAvatar = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser && existingUser.avatarStorageId) {
      try {
        await ctx.storage.delete(existingUser.avatarStorageId);
      } catch {
        // ignore
      }
      await ctx.db.patch(existingUser._id, {
        avatarStorageId: undefined,
        imageUrl: undefined,
      });
    }
  },
});

export const deleteAccountCascade = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const clerkId = identity.subject;

    // 1. Excluir todas as tarefas do usuário com índice
    const userTasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .collect();

    for (const task of userTasks) {
      await ctx.db.delete(task._id);
    }

    // 2. Excluir dados de cota/plano do usuário com índice
    const userClaims = await ctx.db
      .query("freePlanClaims")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .collect();

    for (const claim of userClaims) {
      await ctx.db.delete(claim._id);
    }

    // 3. Excluir logs de auditoria vinculados ao usuário com índice
    const logs = await ctx.db
      .query("abuseLogs")
      .withIndex("by_userId", (q) => q.eq("userId", clerkId))
      .collect();

    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    // 4. Excluir arquivo de avatar no storage e registro de usuário
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      if (existingUser.avatarStorageId) {
        try {
          await ctx.storage.delete(existingUser.avatarStorageId);
        } catch {
          // ignore
        }
      }
      await ctx.db.delete(existingUser._id);
    }

    return { success: true };
  },
});

