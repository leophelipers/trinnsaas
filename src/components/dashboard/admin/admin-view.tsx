"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  UserCheck,
  UserX,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Coins,
  CheckSquare,
  Lock,
  Crown,
  Eye,
  X,
  Filter,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  User,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { AdminNavBar } from "./admin-nav-bar";

type Role = "admin" | "moderator" | "user";
type UserStatus = "active" | "suspended" | "pending";

interface EnrichedUser {
  _id: Id<"users">;
  _creationTime: number;
  clerkId: string;
  name: string;
  email: string;
  imageUrl?: string;
  role: Role;
  status: UserStatus;
  customCredits?: number;
  notes?: string;
  creditsRemaining: number;
  creditsTotal: number;
  claimStatus: string;
  taskCount: number;
}

export function AdminView() {
  const adminStatus = useQuery(api.admin.getCurrentAdminStatus);

  // Queries para dados da área administrativa (só executam se for admin)
  const isAuthorized = Boolean(adminStatus?.isAdmin);
  const stats = useQuery(api.admin.getAdminStats, isAuthorized ? {} : "skip");

  // Filtros de listagem
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const usersList = useQuery(
    api.admin.listUsers,
    isAuthorized
      ? {
          search: searchTerm || undefined,
          role: roleFilter,
          status: statusFilter,
        }
      : "skip"
  );

  const abuseLogs = useQuery(api.admin.listAbuseLogs, isAuthorized ? { limit: 40 } : "skip");

  // Mutations
  const createUserMutation = useMutation(api.admin.createUser);
  const updateUserMutation = useMutation(api.admin.updateUser);
  const deleteUserMutation = useMutation(api.admin.deleteUser);

  // Modais e estados de formulário
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal Criar Usuário
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    role: "user" as Role,
    credits: 50,
    notes: "",
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Modal Editar Usuário
  const [editingUser, setEditingUser] = useState<EnrichedUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "user" as Role,
    status: "active" as UserStatus,
    creditsRemaining: 50,
    notes: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Modal Excluir Usuário
  const [deletingUser, setDeletingUser] = useState<EnrichedUser | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  // Modal Detalhes do Usuário
  const [viewingUserId, setViewingUserId] = useState<Id<"users"> | null>(null);
  const viewingUserDetails = useQuery(
    api.admin.getUserDetails,
    viewingUserId ? { userId: viewingUserId } : "skip"
  );


  // Manipulador de Criação de Usuário
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmittingCreate(true);
    try {
      await createUserMutation({
        name: createForm.name,
        email: createForm.email,
        role: createForm.role,
        credits: Number(createForm.credits),
        notes: createForm.notes || undefined,
      });
      setIsCreateOpen(false);
      setCreateForm({ name: "", email: "", role: "user", credits: 50, notes: "" });
      setFeedback({ type: "success", message: "Usuário criado com sucesso!" });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao cadastrar novo usuário.",
      });
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Abrir Modal de Edição
  const openEditModal = (u: EnrichedUser) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      role: u.role,
      status: u.status,
      creditsRemaining: u.creditsRemaining,
      notes: u.notes || "",
    });
  };

  // Salvar Edição
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFeedback(null);
    setIsSubmittingEdit(true);
    try {
      await updateUserMutation({
        userId: editingUser._id,
        name: editForm.name,
        role: adminStatus?.isAdmin ? editForm.role : undefined,
        status: editForm.status,
        creditsRemaining: Number(editForm.creditsRemaining),
        notes: editForm.notes || undefined,
      });
      setEditingUser(null);
      setFeedback({ type: "success", message: `Usuário ${editForm.name} atualizado!` });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao atualizar dados do usuário.",
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Ação Rápida: Alternar Status (Suspender / Reativar)
  const handleToggleStatus = async (u: EnrichedUser) => {
    const newStatus: UserStatus = u.status === "active" ? "suspended" : "active";
    try {
      await updateUserMutation({
        userId: u._id,
        status: newStatus,
      });
      setFeedback({
        type: "success",
        message: `Status do usuário alterado para ${newStatus === "active" ? "Ativo" : "Suspenso"}.`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Não foi possível alterar o status do usuário.",
      });
    }
  };

  // Excluir Usuário em Cascata
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setFeedback(null);
    setIsSubmittingDelete(true);
    try {
      await deleteUserMutation({
        userId: deletingUser._id,
      });
      setDeletingUser(null);
      setFeedback({
        type: "success",
        message: `Usuário ${deletingUser.name} e seus registros foram excluídos em cascata.`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Falha ao excluir usuário.",
      });
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // 1. Estado de Carregamento
  if (adminStatus === undefined) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="size-8 animate-spin text-[#FF5500]" />
        <p className="text-xs font-mono text-neutral-400">Verificando credenciais e nível de acesso...</p>
      </div>
    );
  }

  // 2. Não Autenticado ou Sem Papel de Administrador
  if (!adminStatus.isAdmin) {
    return (
      <Card className="bg-[#0C0D12]/90 border border-rose-500/30 shadow-2xl backdrop-blur-xl max-w-xl mx-auto my-12 text-center p-8 space-y-4">
        <div className="size-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="size-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-xl uppercase font-bold text-white">
            Acesso Restrito
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Esta área é restrita e acessível exclusivamente a <strong>Administradores</strong> da plataforma.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="outline" className="border-white/15 text-white hover:bg-white/10 text-xs">
              Voltar ao Meu Estúdio
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // 3. Usuário Autorizado (Admin)
  return (
    <div className="space-y-6">
      {/* Sub-navegação interna de Administrador */}
      <AdminNavBar currentTab="users" />

      {/* Notificação / Feedback global */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-mono border flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertTriangle className="size-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner & Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0C0D12] border border-white/10 p-5 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
            <Shield className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading font-extrabold uppercase tracking-tight text-white">
                Console Administrativo & RBAC
              </h2>
              <Badge className="bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5">
                ADMINISTRADOR MASTER
              </Badge>
            </div>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Gestão de usuários, controle de permissões, cotas de renderização e logs de segurança.
            </p>
          </div>
        </div>

        {adminStatus.isAdmin && (
          <Button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase tracking-wider px-4 h-9 rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.3)] cursor-pointer self-start sm:self-auto"
          >
            <Plus className="size-4" />
            Novo Usuário
          </Button>
        )}
      </div>

      {/* Métricas do Sistema */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-lg">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[11px] font-mono uppercase tracking-wider">Total Usuários</span>
                <Users className="size-4 text-[#FF5500]" />
              </div>
              <p className="text-2xl font-heading font-extrabold text-white">
                {stats.totalUsers}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                {stats.activeUsers} ativos • {stats.suspendedUsers} suspensos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-lg">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[11px] font-mono uppercase tracking-wider">Equipe de Gestão</span>
                <Crown className="size-4 text-amber-400" />
              </div>
              <p className="text-2xl font-heading font-extrabold text-white">
                {stats.adminCount + stats.moderatorCount}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                {stats.adminCount} admins • {stats.moderatorCount} moderadores
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-lg">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[11px] font-mono uppercase tracking-wider">Tarefas no Sistema</span>
                <CheckSquare className="size-4 text-[#00E5FF]" />
              </div>
              <p className="text-2xl font-heading font-extrabold text-white">
                {stats.totalTasks}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                {stats.totalCreditsInCirculation} créditos em saldo
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-lg">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[11px] font-mono uppercase tracking-wider">Alertas de Fraude</span>
                <ShieldAlert className="size-4 text-rose-400" />
              </div>
              <p className="text-2xl font-heading font-extrabold text-white">
                {stats.totalAbuseLogs}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                Tentativas bloqueadas registradas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs Principais: Usuários vs Auditoria */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-[#0C0D12] border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="users" className="flex items-center gap-2 text-xs">
            <Users className="size-3.5" />
            Gestão de Usuários (CRUD)
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2 text-xs">
            <ShieldAlert className="size-3.5" />
            Logs de Auditoria ({abuseLogs?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: CRUD DE USUÁRIOS                                                  */}
        {/* ========================================================================= */}
        <TabsContent value="users" className="space-y-4">
          {/* Barra de Filtro e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0C0D12]/90 border border-white/10 p-3.5 rounded-xl">
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-3 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                maxLength={80}
                className="pl-9 bg-[#050506] border-white/10 text-white rounded-xl h-10 text-xs focus:border-[#FF5500]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#050506] border border-white/15 text-white text-xs rounded-xl h-10 px-3 cursor-pointer outline-none focus:border-[#FF5500]"
              >
                <option value="all">Todos os Cargos</option>
                <option value="admin">Administrador</option>
                <option value="moderator">Moderador</option>
                <option value="user">Criador (User)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#050506] border border-white/15 text-white text-xs rounded-xl h-10 px-3 cursor-pointer outline-none focus:border-[#FF5500]"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
              </select>
            </div>
          </div>

          {/* Tabela de Usuários */}
          <div className="rounded-2xl border border-white/10 bg-[#0C0D12]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
            {usersList === undefined ? (
              <div className="p-8 text-center space-y-2">
                <Loader2 className="size-6 animate-spin text-[#FF5500] mx-auto" />
                <p className="text-xs text-neutral-400 font-mono">Carregando lista de criadores...</p>
              </div>
            ) : usersList.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users className="size-8 text-neutral-600 mx-auto" />
                <p className="text-sm font-heading uppercase text-neutral-300">Nenhum usuário encontrado</p>
                <p className="text-xs text-neutral-500 font-sans">
                  Ajuste seus termos de busca ou filtros selecionados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-neutral-400 font-mono uppercase text-[11px]">
                      <th className="py-3 px-4 font-semibold">Usuário</th>
                      <th className="py-3 px-4 font-semibold">Cargo (RBAC)</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Saldo de Créditos</th>
                      <th className="py-3 px-4 font-semibold">Tarefas</th>
                      <th className="py-3 px-4 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {usersList.map((u) => {
                      const userInitials =
                        u.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || "K";

                      const isSelf = adminStatus.user?.id === u._id;

                      return (
                        <tr
                          key={u._id}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          {/* Coluna Usuário */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9 rounded-xl border border-white/10">
                                <AvatarImage src={u.imageUrl} alt={u.name} />
                                <AvatarFallback className="text-xs font-heading font-black bg-[#FF5500] text-white">
                                  {userInitials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-heading font-bold text-white text-xs truncate">
                                    {u.name}
                                  </span>
                                  {isSelf && (
                                    <Badge className="bg-white/10 text-neutral-300 text-[9px] px-1.5 py-0 font-mono">
                                      VOCÊ
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[11px] text-neutral-400 font-mono truncate">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Coluna Cargo */}
                          <td className="py-3 px-4">
                            {u.role === "admin" ? (
                              <Badge className="bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 font-mono text-[10px] gap-1">
                                <Crown className="size-3" />
                                ADMIN
                              </Badge>
                            ) : u.role === "moderator" ? (
                              <Badge className="bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 font-mono text-[10px] gap-1">
                                <Shield className="size-3" />
                                MODERADOR
                              </Badge>
                            ) : (
                              <Badge className="bg-white/5 text-neutral-300 border border-white/10 font-mono text-[10px]">
                                CRIADOR
                              </Badge>
                            )}
                          </td>

                          {/* Coluna Status */}
                          <td className="py-3 px-4">
                            {u.status === "active" ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-rose-400 font-mono text-[11px]">
                                <span className="size-1.5 rounded-full bg-rose-500" />
                                Suspenso
                              </span>
                            )}
                          </td>

                          {/* Coluna Créditos */}
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-300">
                            <span className="text-white font-bold">{u.creditsRemaining}</span> / {u.creditsTotal}
                          </td>

                          {/* Coluna Tarefas */}
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                            {u.taskCount} criadas
                          </td>

                          {/* Coluna Ações */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Ver detalhes */}
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={() => setViewingUserId(u._id)}
                                title="Ver detalhes do usuário"
                                className="bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 size-8"
                              >
                                <Eye className="size-3.5" />
                              </Button>

                              {/* Editar */}
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={() => openEditModal(u)}
                                title="Editar usuário"
                                className="bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 size-8"
                              >
                                <Edit2 className="size-3.5" />
                              </Button>

                              {/* Suspender / Ativar */}
                              {!isSelf && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-sm"
                                  onClick={() => handleToggleStatus(u)}
                                  title={u.status === "active" ? "Suspender conta" : "Reativar conta"}
                                  className={`size-8 ${
                                    u.status === "active"
                                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                  }`}
                                >
                                  {u.status === "active" ? (
                                    <UserX className="size-3.5" />
                                  ) : (
                                    <UserCheck className="size-3.5" />
                                  )}
                                </Button>
                              )}

                              {/* Excluir (somente admin e não pode excluir a si mesmo) */}
                              {adminStatus.isAdmin && !isSelf && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon-sm"
                                  onClick={() => setDeletingUser(u)}
                                  title="Excluir usuário permanentemente"
                                  className="bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 size-8 cursor-pointer"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: AUDITORIA & SEGURANÇA                                             */}
        {/* ========================================================================= */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="bg-[#0C0D12]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="size-5" />
                <CardTitle className="font-heading text-base uppercase text-white">
                  Registro de Incidentes de Segurança & Antifraude
                </CardTitle>
              </div>
              <CardDescription className="text-neutral-400 text-xs">
                Tentativas de evasão de limites, uso de e-mails descartáveis ou abusos bloqueados pela política da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {abuseLogs === undefined ? (
                <div className="p-8 text-center">
                  <Loader2 className="size-6 animate-spin text-[#FF5500] mx-auto" />
                </div>
              ) : abuseLogs.length === 0 ? (
                <p className="text-xs text-neutral-400 font-mono text-center py-6">
                  Nenhum registro de incidente ou abuso registrado no momento.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-neutral-400 font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Data / Hora</th>
                        <th className="py-2.5 px-3">Tipo de Incidente</th>
                        <th className="py-2.5 px-3">E-mail Detectado</th>
                        <th className="py-2.5 px-3">Dispositivo / Fingerprint</th>
                        <th className="py-2.5 px-3">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      {abuseLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-neutral-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString("pt-BR")}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px]">
                              {log.type}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-white">{log.email}</td>
                          <td className="py-2.5 px-3 text-neutral-400 truncate max-w-[120px]">
                            {log.deviceId}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-300 font-sans text-xs">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* MODAL 1: CRIAR NOVO USUÁRIO                                              */}
      {/* ========================================================================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#0C0D12] border border-white/15 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#FF5500]">
                <Plus className="size-5" />
                <h3 className="font-heading text-lg uppercase font-bold text-white">
                  Cadastrar Novo Usuário
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-heading uppercase text-neutral-300">
                  Nome Completo
                </label>
                <Input
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Ex: Clara Mendes"
                  maxLength={80}
                  className="bg-[#050506] border-white/15 text-white rounded-xl h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-heading uppercase text-neutral-300">
                  E-mail do Usuário
                </label>
                <Input
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="exemplo@kriativa.app"
                  className="bg-[#050506] border-white/15 text-white rounded-xl h-10 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-heading uppercase text-neutral-300">
                    Papel no Sistema (RBAC)
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })}
                    className="w-full bg-[#050506] border border-white/15 text-white text-xs rounded-xl h-10 px-3 cursor-pointer outline-none focus:border-[#FF5500]"
                  >
                    <option value="user">Criador (User)</option>
                    <option value="moderator">Moderador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-heading uppercase text-neutral-300">
                    Cota Inicial de Créditos
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={10000}
                    value={createForm.credits}
                    onChange={(e) => setCreateForm({ ...createForm, credits: Number(e.target.value) })}
                    className="bg-[#050506] border-white/15 text-white rounded-xl h-10 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-heading uppercase text-neutral-300">
                  Notas Administrativas (Opcional)
                </label>
                <Input
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Observação interna sobre a conta..."
                  maxLength={150}
                  className="bg-[#050506] border-white/15 text-white rounded-xl h-10 text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="border-white/15 text-neutral-300 hover:text-white text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase tracking-wider px-5 h-10 rounded-xl cursor-pointer"
                >
                  {isSubmittingCreate ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Cadastrar Usuário"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR USUÁRIO                                                  */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#0C0D12] border border-white/15 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00E5FF]">
                <Edit2 className="size-5" />
                <h3 className="font-heading text-lg uppercase font-bold text-white">
                  Editar Usuário
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-heading uppercase text-neutral-300">
                  Nome
                </label>
                <Input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  maxLength={80}
                  className="bg-[#050506] border-white/15 text-white rounded-xl h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-heading uppercase text-neutral-300">
                  E-mail (Identificador)
                </label>
                <Input
                  value={editingUser.email}
                  disabled
                  readOnly
                  className="bg-[#050506]/50 border-white/10 text-neutral-500 rounded-xl h-10 text-xs font-mono cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-heading uppercase text-neutral-300">
                    Cargo (RBAC)
                  </label>
                  <select
                    disabled={!adminStatus.isAdmin || editingUser._id === adminStatus.user?.id}
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                    className="w-full bg-[#050506] border border-white/15 text-white text-xs rounded-xl h-10 px-3 cursor-pointer outline-none focus:border-[#FF5500] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="user">Criador (User)</option>
                    <option value="moderator">Moderador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-heading uppercase text-neutral-300">
                    Status da Conta
                  </label>
                  <select
                    disabled={editingUser._id === adminStatus.user?.id}
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as UserStatus })}
                    className="w-full bg-[#050506] border border-white/15 text-white text-xs rounded-xl h-10 px-3 cursor-pointer outline-none focus:border-[#FF5500] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-heading uppercase text-neutral-300">
                  Ajuste de Saldo de Créditos
                </label>
                <Input
                  type="number"
                  min={0}
                  max={50000}
                  value={editForm.creditsRemaining}
                  onChange={(e) => setEditForm({ ...editForm, creditsRemaining: Number(e.target.value) })}
                  className="bg-[#050506] border-white/15 text-white rounded-xl h-10 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-heading uppercase text-neutral-300">
                  Notas da Administração
                </label>
                <Input
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Anotações internas sobre esta conta..."
                  maxLength={150}
                  className="bg-[#050506] border-white/15 text-white rounded-xl h-10 text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  className="border-white/15 text-neutral-300 hover:text-white text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase tracking-wider px-5 h-10 rounded-xl cursor-pointer"
                >
                  {isSubmittingEdit ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EXCLUIR USUÁRIO EM CASCATA                                      */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#0C0D12] border border-rose-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="size-6" />
              <h3 className="font-heading text-lg uppercase font-bold text-white">
                Excluir Usuário em Cascata?
              </h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Você está prestes a excluir permanentemente o usuário{" "}
              <strong className="text-white">{deletingUser.name}</strong> ({deletingUser.email}).
            </p>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1 text-[11px] text-rose-300 font-mono">
              <p>• Todas as {deletingUser.taskCount} tarefas serão eliminadas.</p>
              <p>• Todas as cotas e créditos vinculados serão apagados.</p>
              <p>• O histórico de auditoria e foto de perfil serão expurgados.</p>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingUser(null)}
                className="border-white/15 text-neutral-300 hover:text-white text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isSubmittingDelete}
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-heading font-bold text-xs uppercase tracking-wider h-10 px-5 rounded-xl cursor-pointer"
              >
                {isSubmittingDelete ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Confirmar Exclusão"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DETALHES DO USUÁRIO                                             */}
      {/* ========================================================================= */}
      {viewingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-[#0C0D12] border border-white/15 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00E5FF]">
                <User className="size-5" />
                <h3 className="font-heading text-lg uppercase font-bold text-white">
                  Detalhes da Conta
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingUserId(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {viewingUserDetails === undefined ? (
              <div className="p-8 text-center">
                <Loader2 className="size-6 animate-spin text-[#FF5500] mx-auto" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header do usuário */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <Avatar className="size-14 rounded-xl border border-white/15">
                    <AvatarImage src={viewingUserDetails.user.imageUrl} />
                    <AvatarFallback className="text-base font-heading font-black bg-[#FF5500] text-white">
                      {viewingUserDetails.user.name?.[0] || "K"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-heading font-bold text-white">
                        {viewingUserDetails.user.name}
                      </h4>
                      <Badge className="font-mono text-[10px] uppercase">
                        {viewingUserDetails.user.role}
                      </Badge>
                      <Badge
                        className={`font-mono text-[10px] ${
                          viewingUserDetails.user.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {viewingUserDetails.user.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono">
                      {viewingUserDetails.user.email}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      Cadastrado em {new Date(viewingUserDetails.user._creationTime).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {/* Notas e Cota */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Cota de Renderização
                    </span>
                    <p className="text-lg font-heading font-extrabold text-white">
                      {viewingUserDetails.claim?.creditsRemaining ?? 50} / {viewingUserDetails.claim?.creditsTotal ?? 50}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      Status da Cota: {viewingUserDetails.claim?.status ?? "active"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Notas Internas
                    </span>
                    <p className="text-xs text-neutral-300 font-sans italic">
                      {viewingUserDetails.user.notes || "Nenhuma anotação registrada."}
                    </p>
                  </div>
                </div>

                {/* Tarefas recentes */}
                <div className="space-y-2">
                  <span className="text-xs font-heading uppercase text-neutral-300">
                    Tarefas Recentes ({viewingUserDetails.tasks.length})
                  </span>
                  {viewingUserDetails.tasks.length === 0 ? (
                    <p className="text-xs text-neutral-500 font-mono py-2">
                      Nenhuma tarefa criada por este usuário.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {viewingUserDetails.tasks.map((task) => (
                        <div
                          key={task._id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-neutral-300"
                        >
                          <span className="truncate">{task.text}</span>
                          <span className="text-[10px] font-mono text-neutral-500 shrink-0 ml-2">
                            {task.isCompleted ? "Concluída" : "Pendente"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setViewingUserId(null)}
                    className="border-white/15 text-white hover:bg-white/10 text-xs"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
