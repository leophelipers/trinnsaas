"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUser, useSession, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  ShieldCheck,
  User,
  Mail,
  Calendar,
  CheckCircle2,
  Cpu,
  Coins,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Globe,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Sliders,
  Sparkles,
  UploadCloud,
  Loader2,
} from "lucide-react";

type UserSessionItem = Awaited<
  ReturnType<NonNullable<ReturnType<typeof useUser>["user"]>["getSessions"]>
>[number];

// Sanitização estrita de strings no cliente para prevenir injeções e tags maliciosas
function sanitizeClientName(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function ProfileView() {
  const { user, isLoaded } = useUser();
  const { session: currentSession } = useSession();
  const clerk = useClerk();

  const planStatus = useQuery(api.antiAbuse.getPlanStatus);
  const updateConvexName = useMutation(api.users.updateName);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateAvatarConvex = useMutation(api.users.updateAvatar);
  const removeAvatarConvex = useMutation(api.users.removeAvatar);
  const deleteAccountCascade = useMutation(api.users.deleteAccountCascade);

  // Profile editing state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [signOutOfOthers, setSignOutOfOthers] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isRevokingAllOthers, setIsRevokingAllOthers] = useState(false);

  // Danger zone state
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Initialize fields when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  // Fetch active sessions
  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setIsLoadingSessions(true);
    try {
      const list = await user.getSessions();
      setSessions(list);
    } catch (err: any) {
      console.error("Erro ao buscar sessões:", err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  // Handle Save Profile com sanitização completa
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cleanFirst = sanitizeClientName(firstName);
    const cleanLast = sanitizeClientName(lastName);

    if (!cleanFirst) {
      setProfileFeedback({
        type: "error",
        message: "O primeiro nome é obrigatório.",
      });
      return;
    }

    if (cleanFirst.length > 50 || cleanLast.length > 50) {
      setProfileFeedback({
        type: "error",
        message: "O nome não pode ultrapassar 50 caracteres.",
      });
      return;
    }

    setIsSavingProfile(true);
    setProfileFeedback(null);

    try {
      // 1. Atualizar nome do usuário no Clerk
      await user.update({
        firstName: cleanFirst,
        lastName: cleanLast,
      });

      // 2. Sincronizar nome sanitizado no Convex
      const fullName = `${cleanFirst} ${cleanLast}`.trim() || "Criador";
      try {
        await updateConvexName({ name: fullName });
      } catch (err) {
        console.warn("Aviso ao salvar nome:", err);
      }

      setFirstName(cleanFirst);
      setLastName(cleanLast);
      setProfileFeedback({
        type: "success",
        message: "Nome e perfil atualizados com sucesso!",
      });
    } catch (err: any) {
      const errorMsg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Não foi possível salvar as alterações.";
      setProfileFeedback({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Avatar Upload: SALVA NO CONVEX STORAGE E NO PERFIL COM VALIDAÇÃO ESTREITA
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // 1. Validação estrita de tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileFeedback({
        type: "error",
        message: "O arquivo é muito grande. Escolha uma imagem de até 5MB.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Validação estrita de extensão (bloqueia .svg com XSS, .html, .exe, etc)
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
    if (!allowedExtensions.includes(fileExt)) {
      setProfileFeedback({
        type: "error",
        message: "Extensão inválida. Permitido apenas arquivos JPG, PNG, WebP e GIF.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 3. Validação do tipo MIME declarado
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
      setProfileFeedback({
        type: "error",
        message: "Formato de imagem não aceito. Apenas JPG, PNG, WebP e GIF são suportados.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploadingAvatar(true);
    setProfileFeedback(null);

    try {
      // 1. Gera URL de upload segura no Convex Storage
      const uploadUrl = await generateUploadUrl();

      // 2. Envia o binário do arquivo diretamente para o armazenamento do Convex
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Falha na transmissão do arquivo para o servidor de armazenamento.");
      }

      const { storageId } = await uploadResponse.json();

      // 3. Registra e valida o storageId no Convex (com checagem de integridade e MIME server-side)
      await updateAvatarConvex({ storageId });

      // 4. Atualiza também a foto de perfil na sessão
      await user.setProfileImage({ file });
      await user.reload();

      setProfileFeedback({
        type: "success",
        message: "Foto de perfil armazenada e atualizada com sucesso!",
      });
    } catch (err: any) {
      setProfileFeedback({
        type: "error",
        message: err?.message || "Erro ao salvar foto de perfil.",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setIsUploadingAvatar(true);
    setProfileFeedback(null);
    try {
      // 1. Remove do armazenamento do Convex
      await removeAvatarConvex();

      // 2. Remove do perfil
      await user.setProfileImage({ file: null });
      await user.reload();

      setProfileFeedback({
        type: "success",
        message: "Foto de perfil removida. Usando avatar padrão.",
      });
    } catch (err: any) {
      setProfileFeedback({
        type: "error",
        message: err?.message || "Erro ao remover avatar.",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Password Update com proteção contra força bruta e DoS de hashing
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "A nova senha e a confirmação não coincidem.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: "A nova senha deve ter no mínimo 8 caracteres.",
      });
      return;
    }

    if (newPassword.length > 128) {
      setPasswordFeedback({
        type: "error",
        message: "A nova senha não pode ultrapassar 128 caracteres.",
      });
      return;
    }

    if (user.passwordEnabled && currentPassword && currentPassword === newPassword) {
      setPasswordFeedback({
        type: "error",
        message: "A nova senha deve ser diferente da sua senha atual.",
      });
      return;
    }

    setIsSavingPassword(true);
    setPasswordFeedback(null);

    try {
      if (user.passwordEnabled) {
        if (!currentPassword) {
          setPasswordFeedback({
            type: "error",
            message: "Por favor, digite sua senha atual.",
          });
          setIsSavingPassword(false);
          return;
        }

        await user.updatePassword({
          currentPassword,
          newPassword,
          signOutOfOtherSessions: signOutOfOthers,
        });
      } else {
        await user.updatePassword({
          newPassword,
          signOutOfOtherSessions: signOutOfOthers,
        });
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordFeedback({
        type: "success",
        message: "Senha atualizada com sucesso! Seus acessos estão seguros.",
      });
      await user.reload();
      fetchSessions();
    } catch (err: any) {
      const errorMsg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Erro ao atualizar senha. Verifique se a senha atual está correta.";
      setPasswordFeedback({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle Revoke Single Session
  const handleRevokeSession = async (sess: UserSessionItem) => {
    setRevokingSessionId(sess.id);
    setSessionFeedback(null);
    try {
      await sess.revoke();
      setSessionFeedback({
        type: "success",
        message: "Sessão desconectada com sucesso.",
      });
      await fetchSessions();
    } catch (err: any) {
      setSessionFeedback({
        type: "error",
        message: err?.message || "Não foi possível revogar esta sessão.",
      });
    } finally {
      setRevokingSessionId(null);
    }
  };

  // Handle Revoke All Other Sessions
  const handleRevokeAllOtherSessions = async () => {
    if (!currentSession) return;
    setIsRevokingAllOthers(true);
    setSessionFeedback(null);
    try {
      const others = sessions.filter((s) => s.id !== currentSession.id);
      for (const s of others) {
        await s.revoke();
      }
      setSessionFeedback({
        type: "success",
        message: `${others.length} outro(s) dispositivo(s) desconectado(s) com sucesso!`,
      });
      await fetchSessions();
    } catch (err: any) {
      setSessionFeedback({
        type: "error",
        message: err?.message || "Erro ao encerrar outras sessões.",
      });
    } finally {
      setIsRevokingAllOthers(false);
    }
  };

  // Handle Cascading Account Deletion: EXCLUI TUDO EM CASCATA
  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== "EXCLUIR") return;
    setIsDeletingAccount(true);
    try {
      // 1. Exclusão em cascata de todos os dados do usuário (tarefas, cotas, arquivos de avatar e registro)
      await deleteAccountCascade();

      // 2. Exclusão da conta no provedor de autenticação
      await user.delete();

      window.location.href = "/";
    } catch (err: any) {
      alert("Erro ao excluir conta: " + (err?.message || "Tente novamente."));
      setIsDeletingAccount(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-2xl bg-[#0C0D12]" />
        <Skeleton className="h-96 w-full rounded-2xl bg-[#0C0D12]" />
      </div>
    );
  }

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") || "K";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner com identidade do Estúdio */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0C0D12] via-[#090A0E] to-[#050506] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FF5500]/10 blur-[90px] pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[#00E5FF]/10 blur-[90px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Avatar com ação de troca */}
          <div className="relative group shrink-0">
            <div className="relative size-24 sm:size-28 rounded-2xl overflow-hidden border-2 border-white/15 bg-black/60 shadow-[0_0_30px_rgba(255,85,0,0.2)]">
              <Avatar className="size-full rounded-none">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Avatar"} />
                <AvatarFallback className="text-3xl font-heading font-black bg-gradient-to-br from-[#FF5500] to-[#E04B00] text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-[#FF5500]" />
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#FF5500] hover:bg-[#FF5500]/90 text-white shadow-lg shadow-[#FF5500]/40 transition-transform active:scale-95 cursor-pointer"
              title="Trocar foto de perfil"
            >
              <UploadCloud className="size-4" />
            </button>
          </div>

          {/* User Info Overview */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white uppercase">
                {user?.fullName || "Criador"}
              </h2>
              <Badge className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] gap-1 px-2.5 py-0.5">
                <ShieldCheck className="size-3.5" />
                CONTA ATIVA
              </Badge>
            </div>

            <p className="text-sm text-neutral-400 flex items-center justify-center md:justify-start gap-2 font-mono">
              <Mail className="size-4 text-[#00E5FF]" />
              {user?.primaryEmailAddress?.emailAddress}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <Coins className="size-3.5 text-[#FF5500]" />
                <span className="text-white font-bold">{planStatus?.creditsRemaining ?? 50}</span> Créditos de Renderização
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <Monitor className="size-3.5 text-[#00E5FF]" />
                <span className="text-white font-bold">{sessions.length}</span> {sessions.length === 1 ? "Dispositivo Ativo" : "Dispositivos Ativos"}
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <Calendar className="size-3.5 text-neutral-400" />
                Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "2026"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-[#0C0D12] border border-white/10 p-1.5 rounded-2xl w-full flex flex-wrap gap-1.5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="size-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="size-4" />
            Segurança & Senha
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Smartphone className="size-4" />
            Dispositivos ({sessions.length})
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Cpu className="size-4" />
            Plano & Cotas
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2 text-rose-400 hover:text-rose-300">
            <Trash2 className="size-4" />
            Zona Crítica
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: PERFIL                                                            */}
        {/* ========================================================================= */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-2 text-[#FF5500]">
                  <Sliders className="size-5" />
                  <CardTitle className="font-heading text-lg tracking-wide uppercase text-white">
                    Informações Pessoais
                  </CardTitle>
                </div>
                <CardDescription className="text-neutral-400 text-xs">
                  Atualize seu nome de exibição associado à sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {profileFeedback && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-mono border flex items-center gap-2.5 animate-in fade-in ${
                        profileFeedback.type === "success"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {profileFeedback.type === "success" ? (
                        <CheckCircle2 className="size-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="size-4 shrink-0" />
                      )}
                      <span>{profileFeedback.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-heading uppercase tracking-wider text-neutral-300">
                        Primeiro Nome
                      </label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ex: Leonardo"
                        required
                        maxLength={50}
                        className="bg-[#050506] border-white/15 text-white focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] rounded-xl h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-heading uppercase tracking-wider text-neutral-300">
                        Sobrenome
                      </label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ex: da Vinci"
                        maxLength={50}
                        className="bg-[#050506] border-white/15 text-white focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] rounded-xl h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-heading uppercase tracking-wider text-neutral-300">
                      E-mail do Titular
                    </label>
                    <div className="relative">
                      <Input
                        value={user?.primaryEmailAddress?.emailAddress || ""}
                        readOnly
                        disabled
                        className="bg-[#050506]/50 border-white/10 text-neutral-400 font-mono text-xs rounded-xl h-10 pr-24 cursor-not-allowed"
                      />
                      <Badge className="absolute right-2 top-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-mono">
                        Validado
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                    <Button
                      type="submit"
                      disabled={isSavingProfile}
                      className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase tracking-wider px-6 h-10 rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.3)] cursor-pointer"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Alterações"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Foto de Perfil */}
            <div>
              <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="font-heading text-base uppercase text-white">
                    Foto de Perfil
                  </CardTitle>
                  <CardDescription className="text-neutral-400 text-xs">
                    Formatos suportados: JPG, PNG ou WebP até 5MB.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16 rounded-xl border border-white/20">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Avatar"} />
                      <AvatarFallback className="font-heading font-bold bg-[#FF5500] text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1.5 flex-1">
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="w-full bg-white/10 hover:bg-white/15 text-white text-xs h-9 rounded-xl border border-white/15 cursor-pointer font-sans"
                      >
                        <UploadCloud className="size-3.5" />
                        Substituir Foto
                      </Button>
                      {user?.hasImage && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={isUploadingAvatar}
                          className="w-full text-center text-[11px] text-rose-400 hover:text-rose-300 py-1 cursor-pointer transition-colors"
                        >
                          Remover foto atual
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: SEGURANÇA & SENHA                                                 */}
        {/* ========================================================================= */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-2 text-[#FF5500]">
                  <Lock className="size-5" />
                  <CardTitle className="font-heading text-lg tracking-wide uppercase text-white">
                    {user?.passwordEnabled ? "Alterar Senha de Acesso" : "Definir Senha de Acesso"}
                  </CardTitle>
                </div>
                <CardDescription className="text-neutral-400 text-xs">
                  {user?.passwordEnabled
                    ? "Altere sua senha de segurança. Recomendamos no mínimo 8 caracteres combinando letras e números."
                    : "Sua conta foi criada através de autenticação social (Google). Você pode criar uma senha para acessar diretamente via e-mail e senha."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {passwordFeedback && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-mono border flex items-center gap-2.5 animate-in fade-in ${
                        passwordFeedback.type === "success"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {passwordFeedback.type === "success" ? (
                        <CheckCircle2 className="size-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="size-4 shrink-0" />
                      )}
                      <span>{passwordFeedback.message}</span>
                    </div>
                  )}

                  {/* If user has password, require current password */}
                  {user?.passwordEnabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-heading uppercase tracking-wider text-neutral-300">
                          Senha Atual
                        </label>
                        <button
                          type="button"
                          onClick={() => clerk.openUserProfile()}
                          className="text-[11px] text-[#00E5FF] hover:underline cursor-pointer"
                        >
                          Esqueceu a senha atual?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Digite sua senha atual"
                          required
                          maxLength={128}
                          className="bg-[#050506] border-white/15 text-white focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] rounded-xl h-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3 top-2.5 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          {showCurrentPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* New password */}
                  <div className="space-y-2">
                    <label className="text-xs font-heading uppercase tracking-wider text-neutral-300">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        required
                        maxLength={128}
                        className="bg-[#050506] border-white/15 text-white focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] rounded-xl h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-2.5 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <label className="text-xs font-heading uppercase tracking-wider text-neutral-300">
                      Confirmar Nova Senha
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      required
                      maxLength={128}
                      className="bg-[#050506] border-white/15 text-white focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] rounded-xl h-10"
                    />
                  </div>

                  {/* Sign out of others option */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={signOutOfOthers}
                        onChange={(e) => setSignOutOfOthers(e.target.checked)}
                        className="rounded bg-[#050506] border-white/20 text-[#FF5500] focus:ring-[#FF5500] size-4 cursor-pointer accent-[#FF5500]"
                      />
                      <span>Desconectar todos os outros dispositivos ao atualizar a senha</span>
                    </label>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSavingPassword}
                      className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase tracking-wider px-6 h-10 rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.3)] cursor-pointer"
                    >
                      {isSavingPassword ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Atualizando...
                        </>
                      ) : user?.passwordEnabled ? (
                        "Atualizar Senha"
                      ) : (
                        "Cadastrar Senha"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 2FA Card */}
            <div className="space-y-6">
              <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="size-5" />
                    <CardTitle className="font-heading text-base uppercase text-white">
                      Verificação em 2 Etapas (2FA)
                    </CardTitle>
                  </div>
                  <CardDescription className="text-neutral-400 text-xs">
                    Proteja sua conta contra acessos indevidos com autenticação por aplicativo ou biometria.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-xs font-mono text-neutral-400">Status da Proteção:</span>
                    <Badge
                      className={
                        user?.twoFactorEnabled
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]"
                      }
                    >
                      {user?.twoFactorEnabled ? "ATIVADO" : "DESATIVADO"}
                    </Badge>
                  </div>

                  <Button
                    type="button"
                    onClick={() => clerk.openUserProfile()}
                    className="w-full bg-white/10 hover:bg-white/15 text-white text-xs h-9 rounded-xl border border-white/15 cursor-pointer font-sans"
                  >
                    Gerenciar Chaves de Segurança
                  </Button>
                </CardContent>
              </Card>

              {/* Recovery Assistance */}
              <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center gap-2 text-[#00E5FF]">
                    <Sparkles className="size-4" />
                    <CardTitle className="font-heading text-base uppercase text-white">
                      Recuperação de Acesso
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-neutral-400 font-sans leading-relaxed">
                  <p>
                    Em caso de esquecimento de senha, links de recuperação são enviados diretamente para:
                  </p>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-white">
                    {user?.primaryEmailAddress?.emailAddress}
                  </div>
                  <Button
                    type="button"
                    onClick={() => clerk.openUserProfile()}
                    className="w-full bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 text-xs h-8 rounded-xl cursor-pointer"
                  >
                    Opções de Recuperação
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: DISPOSITIVOS & SESSÕES                                            */}
        {/* ========================================================================= */}
        <TabsContent value="sessions">
          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#00E5FF]">
                  <Smartphone className="size-5" />
                  <CardTitle className="font-heading text-lg tracking-wide uppercase text-white">
                    Dispositivos Conectados & Histórico de Sessões
                  </CardTitle>
                </div>
                <CardDescription className="text-neutral-400 text-xs mt-1">
                  Gerencie todos os computadores e aparelhos com acesso à sua conta. Desconecte acessos remotos a qualquer momento.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchSessions}
                  disabled={isLoadingSessions}
                  className="bg-white/5 border-white/10 text-white text-xs h-9 rounded-xl cursor-pointer"
                >
                  <RefreshCw className={`size-3.5 ${isLoadingSessions ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
                {sessions.length > 1 && (
                  <Button
                    type="button"
                    onClick={handleRevokeAllOtherSessions}
                    disabled={isRevokingAllOthers}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs h-9 rounded-xl cursor-pointer"
                  >
                    {isRevokingAllOthers ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    Desconectar Outros Dispositivos
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-mono border flex items-center gap-2.5 animate-in fade-in ${
                    sessionFeedback.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  }`}
                >
                  {sessionFeedback.type === "success" ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="size-4 shrink-0" />
                  )}
                  <span>{sessionFeedback.message}</span>
                </div>
              )}

              {isLoadingSessions && sessions.length === 0 ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-xl bg-white/5" />
                  <Skeleton className="h-20 w-full rounded-xl bg-white/5" />
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((sess) => {
                    const isCurrent = sess.id === currentSession?.id;
                    const activity = sess.latestActivity;
                    const isMobile = activity?.isMobile || activity?.deviceType?.toLowerCase().includes("mobile");

                    return (
                      <div
                        key={sess.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isCurrent
                            ? "bg-gradient-to-r from-[#FF5500]/10 via-[#0C0D12] to-black/60 border-[#FF5500]/40 shadow-[0_0_20px_rgba(255,85,0,0.15)]"
                            : "bg-black/40 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div
                            className={`p-3 rounded-xl border shrink-0 ${
                              isCurrent
                                ? "bg-[#FF5500]/20 border-[#FF5500]/40 text-[#FF5500]"
                                : "bg-white/5 border-white/10 text-neutral-400"
                            }`}
                          >
                            {isMobile ? (
                              <Smartphone className="size-5" />
                            ) : (
                              <Monitor className="size-5" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-heading font-bold text-sm text-white">
                                {activity?.browserName || "Navegador Web"}{" "}
                                {activity?.browserVersion ? `v${activity.browserVersion}` : ""}
                              </span>
                              {isCurrent ? (
                                <Badge className="bg-[#FF5500] text-white font-mono text-[9px] uppercase px-2 py-0">
                                  ESTE DISPOSITIVO (ATIVO AGORA)
                                </Badge>
                              ) : (
                                <Badge className="bg-white/10 text-neutral-300 font-mono text-[9px] uppercase px-2 py-0">
                                  SESSÃO REMOTA
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400">
                              <span className="flex items-center gap-1">
                                <Globe className="size-3 text-neutral-500" />
                                {activity?.ipAddress || "Rede Segura"}
                                {activity?.city ? ` (${activity.city}, ${activity.country})` : ""}
                              </span>
                              <span>•</span>
                              <span>
                                Última atividade:{" "}
                                <span className="text-neutral-300">
                                  {sess.lastActiveAt
                                    ? new Date(sess.lastActiveAt).toLocaleString("pt-BR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "Agora"}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {!isCurrent && (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleRevokeSession(sess)}
                            disabled={revokingSessionId === sess.id}
                            className="sm:self-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs h-8 rounded-xl cursor-pointer"
                          >
                            {revokingSessionId === sess.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Trash2 className="size-3" />
                            )}
                            Desconectar
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: PLANO & COTAS                                                     */}
        {/* ========================================================================= */}
        <TabsContent value="plan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Credit Quota Card */}
            <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#FF5500]">
                    <Coins className="size-5" />
                    <CardTitle className="font-heading text-base uppercase text-white">
                      Cota de Geração de Vídeo
                    </CardTitle>
                  </div>
                  <Badge className="bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30 text-[10px] font-mono">
                    PLANO FREE STUDIO
                  </Badge>
                </div>
                <CardDescription className="text-neutral-400 text-xs">
                  Créditos disponíveis para renderizações cinematográficas no kriativa.app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">Saldo de Créditos</span>
                      <div className="text-3xl font-heading font-black text-white">
                        {planStatus?.creditsRemaining ?? 50}{" "}
                        <span className="text-sm font-sans font-normal text-neutral-500">
                          / {planStatus?.creditsTotal ?? 50} créditos
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
                      DISPONÍVEL
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF5500] to-[#E04B00] rounded-full transition-all duration-500"
                      style={{
                        width: `${((planStatus?.creditsRemaining ?? 50) / (planStatus?.creditsTotal ?? 50)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-xs text-neutral-400 space-y-1.5 font-sans">
                  <p>• Tomadas 720p 24fps: 5 créditos por cena gerada.</p>
                  <p>• Tomadas 1080p Anamorphic: 10 créditos por cena gerada.</p>
                </div>
              </CardContent>
            </Card>

            {/* Studio Environment Tier Card */}
            <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="size-5" />
                    <CardTitle className="font-heading text-base uppercase text-white">
                      Condição da Conta
                    </CardTitle>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                    REGULAR
                  </Badge>
                </div>
                <CardDescription className="text-neutral-400 text-xs">
                  Status de permissões e cota ativa para criação de vídeos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-neutral-500 text-[10px] uppercase font-mono block">
                    Nível de Acesso
                  </span>
                  <span className="text-white font-heading font-bold text-sm">
                    Creator Free (Comunidade Aberta)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-neutral-500 text-[10px] uppercase font-mono block">
                    Fila de Renderização
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="size-3.5" />
                    Fila Prioritária de Inicialização
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 5: ZONA CRÍTICA (EXCLUSÃO EM CASCATA)                                */}
        {/* ========================================================================= */}
        <TabsContent value="danger">
          <Card className="bg-[#0C0D12]/90 border border-rose-500/30 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="size-5" />
                <CardTitle className="font-heading text-lg tracking-wide uppercase text-white">
                  Zona Crítica da Conta
                </CardTitle>
              </div>
              <CardDescription className="text-neutral-400 text-xs">
                Ações irreversíveis que excluem permanentemente sua conta e todos os dados associados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-heading uppercase font-bold text-rose-400">
                    Excluir Permanentemente Conta e Histórico
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    Ao confirmar a exclusão, todos os seus dados, tarefas, fotos de perfil, histórico e saldo de créditos serão <strong>removidos em cascata e de forma definitiva</strong>. Esta ação não poderá ser desfeita.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-mono text-neutral-400 block">
                    Para confirmar, digite <span className="text-white font-bold">EXCLUIR</span> abaixo:
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="EXCLUIR"
                      maxLength={10}
                      className="bg-[#050506] border-rose-500/30 text-white rounded-xl h-10 sm:max-w-xs focus:border-rose-500 font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "EXCLUIR" || isDeletingAccount}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-heading font-bold text-xs uppercase tracking-wider h-10 px-5 rounded-xl cursor-pointer disabled:opacity-40"
                    >
                      {isDeletingAccount ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Excluindo Dados em Cascata...
                        </>
                      ) : (
                        "Excluir Minha Conta Agora"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
