"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  ExternalLink,
  Eye,
  CheckCircle2,
  X,
  Layers,
  Layout,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminNavBar } from "./admin-nav-bar";

export function BannersView() {
  const banners = useQuery(api.dashboard.listAdminBanners) || [];
  const upsertBanner = useMutation(api.dashboard.upsertAdminBanner);
  const deleteBanner = useMutation(api.dashboard.deleteAdminBanner);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"announcementBanners"> | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    badgeText: "",
    linkUrl: "",
    linkText: "",
    sortOrder: 1,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      badgeText: "NOVIDADE",
      linkUrl: "",
      linkText: "Acessar Agora",
      sortOrder: banners.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: (typeof banners)[0]) => {
    setEditingId(b._id);
    setForm({
      title: b.title,
      description: b.description,
      badgeText: b.badgeText || "",
      linkUrl: b.linkUrl || "",
      linkText: b.linkText || "",
      sortOrder: b.sortOrder,
      isActive: b.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      setIsSubmitting(true);
      await upsertBanner({
        id: editingId || undefined,
        title: form.title.trim(),
        description: form.description.trim(),
        badgeText: form.badgeText.trim() || undefined,
        linkUrl: form.linkUrl.trim() || undefined,
        linkText: form.linkText.trim() || undefined,
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
      });

      setIsModalOpen(false);
      setFeedback("Banner salvo com sucesso!");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Erro ao salvar banner: ${err.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"announcementBanners">) => {
    if (!confirm("Deseja realmente remover este banner de destaque?")) return;
    try {
      await deleteBanner({ id });
      setFeedback("Banner removido.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const handleToggleActive = async (b: (typeof banners)[0]) => {
    try {
      await upsertBanner({
        id: b._id,
        title: b.title,
        description: b.description,
        badgeText: b.badgeText,
        linkUrl: b.linkUrl,
        linkText: b.linkText,
        sortOrder: b.sortOrder,
        isActive: !b.isActive,
      });
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <AdminNavBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0C0D12] border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-[#FF5500]" />
            <h1 className="font-heading font-black text-xl text-white uppercase tracking-tight">
              Banners de Destaque do Estúdio
            </h1>
          </div>
          <p className="text-xs text-neutral-400 font-sans">
            Gerencie avisos, novidades e promoções exibidos no topo do Visão Geral (/dashboard). Suporte a banners únicos ou múltiplos, com ou sem link.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreate}
          className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-heading font-bold text-xs uppercase h-9 rounded-xl shadow-lg shrink-0 gap-1.5 cursor-pointer"
        >
          <Plus className="size-4" />
          Novo Banner
        </Button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Lista de Banners */}
      <div className="space-y-4">
        {banners.length === 0 ? (
          <Card className="bg-[#0C0D12]/90 border border-white/10 p-12 text-center space-y-3">
            <Megaphone className="size-8 text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-400">
              Nenhum banner cadastrado. Clique no botão acima para adicionar um banner de destaque.
            </p>
          </Card>
        ) : (
          banners.map((b) => (
            <Card
              key={b._id}
              className={`bg-[#0C0D12]/90 border transition-all ${
                b.isActive ? "border-white/15" : "border-white/5 opacity-60"
              }`}
            >
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Visualização Prévia do Banner */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={
                        b.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px] font-mono"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700 text-[9px] font-mono"
                      }
                    >
                      {b.isActive ? "ATIVO NO DASHBOARD" : "PAUSADO"}
                    </Badge>

                    {b.badgeText && (
                      <Badge className="bg-[#FF5500] text-white text-[9px] font-mono uppercase font-bold">
                        {b.badgeText}
                      </Badge>
                    )}

                    <span className="text-[10px] font-mono text-neutral-500">
                      Ordem: #{b.sortOrder}
                    </span>

                    {b.linkUrl ? (
                      <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                        <ExternalLink className="size-3" />
                        Com Link: {b.linkUrl}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-500">
                        Sem Link (Apenas Texto)
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-black text-white text-base tracking-tight uppercase">
                    {b.title}
                  </h3>

                  <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                    {b.description}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(b)}
                    className="border-white/10 text-neutral-300 hover:text-white text-xs h-8 rounded-xl cursor-pointer"
                  >
                    {b.isActive ? "Pausar" : "Ativar"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(b)}
                    className="border-white/10 text-neutral-300 hover:text-white text-xs h-8 rounded-xl cursor-pointer"
                  >
                    <Edit2 className="size-3.5 mr-1" />
                    Editar
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(b._id)}
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs h-8 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Criar / Editar Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0C0D12] p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="size-4 text-[#FF5500]" />
                <h3 className="font-heading font-bold text-white uppercase text-sm">
                  {editingId ? "Editar Banner de Destaque" : "Criar Banner de Destaque"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">Título Principal</label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ex: Lançamento do Motor Seedance 2.5 Cinema"
                  className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">Descrição / Subtítulo</label>
                <Input
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="ex: Crie tomadas de até 30 segundos com áudio nativo sincronizado em 720p e 1080p."
                  className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Tag / Badge (Opcional)</label>
                  <Input
                    value={form.badgeText}
                    onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                    placeholder="ex: NOVIDADE, PROMOÇÃO, VIP"
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Ordem de Exibição</label>
                  <Input
                    type="number"
                    min="1"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">
                  Link de Ação (Opcional - Deixe vazio para banner sem link)
                </label>
                <Input
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="ex: /dashboard/studio ou https://..."
                  className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs font-mono"
                />
              </div>

              {form.linkUrl && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Texto do Botão / Link</label>
                  <Input
                    value={form.linkText}
                    onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                    placeholder="ex: Experimentar Agora, Ver Detalhes"
                    className="bg-[#050506] border-white/10 text-white rounded-xl h-9 text-xs"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-white/20 bg-black/40 text-[#FF5500] focus:ring-[#FF5500] cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs text-neutral-300 font-sans cursor-pointer">
                  Publicar banner imediatamente no Visão Geral (/dashboard)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-white/15 text-neutral-300 hover:text-white text-xs h-8"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white text-xs font-bold h-8 cursor-pointer"
                >
                  {isSubmitting ? "Salvando..." : "Salvar Banner"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
