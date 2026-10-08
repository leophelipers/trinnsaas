"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  LayoutDashboard,
  CheckSquare,
  User,
  Settings,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  LogOut,
  ChevronDown,
  Shield,
  Coins,
  Calculator,
  Sliders,
  Activity,
  Film,
  FolderArchive,
  Users,
  Clapperboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFeatureFlag } from "@/hooks/use-feature-flags";

// Menus principais da sidebar (Perfil fica no rodapé do usuário)
const navItems = [
  {
    name: "Visão Geral",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Kriativa Studio",
    href: "/dashboard/studio",
    icon: Film,
    badge: "Novo",
  },
  {
    name: "Cofre de Mídias",
    href: "/dashboard/vault",
    icon: FolderArchive,
  },
  {
    name: "Atores & Elementos",
    href: "/dashboard/elements",
    icon: Users,
  },
  {
    name: "Roteiro & Decupagem",
    href: "/dashboard/scripts",
    icon: Clapperboard,
  },
  {
    name: "Kriativa Muse (Chat)",
    href: "/chat",
    icon: Sparkles,
  },
  {
    name: "Créditos & Recargas",
    href: "/dashboard/credits",
    icon: Coins,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const adminStatus = useQuery(api.admin.getCurrentAdminStatus);
  const isChatEnabled = useFeatureFlag("chat_enabled");
  const showAdminNav = Boolean(adminStatus?.isAdmin);
  const isProfileActive = pathname === "/dashboard/profile";
  const isAdminUsersActive = pathname === "/dashboard/admin";
  const isAdminPricingActive = pathname.startsWith("/dashboard/admin/pricing");
  const isAdminCreditsActive = pathname.startsWith("/dashboard/admin/credits");
  const isAdminFlagsActive = pathname.startsWith("/dashboard/admin/flags");
  const isAdminObservabilityActive = pathname.startsWith("/dashboard/admin/observability");
  const isAdminAiSettingsActive = pathname.startsWith("/dashboard/admin/ai-settings");

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") || "K";

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-[#08090C] shrink-0 h-screen sticky top-0 p-4 justify-between select-none overflow-y-auto">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 shadow-xl relative overflow-hidden group">
          {/* Ambient glow behind logo */}
          <div className="absolute -top-6 -left-6 size-24 rounded-full bg-[#FF5500]/20 blur-xl pointer-events-none group-hover:bg-[#FF5500]/30 transition-all duration-500" />

          <div className="relative z-10 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group/link">
              <div className="size-10 rounded-xl bg-gradient-to-br from-[#FF5500] via-[#FF4500] to-[#CC3700] text-white flex items-center justify-center font-heading font-black text-base shadow-[0_0_20px_rgba(255,85,0,0.4)] border border-white/20 transition-transform group-hover/link:scale-105">
                K
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="font-heading font-black text-base tracking-tight text-white">
                    kriativa
                  </span>
                  <span className="font-mono text-xs text-[#FF5500] font-bold ml-0.5">
                    .app
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono font-medium">
                    Motion Studio
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <p className="px-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
            Navegação do Estúdio
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const isItemDisabled = item.href === "/chat" && !isChatEnabled;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-heading tracking-wide transition-all ${
                  isActive
                    ? "bg-[#FF5500] text-white font-bold shadow-[0_0_20px_rgba(255,85,0,0.25)]"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.name}</span>
                {isItemDisabled && (
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-medium">
                    Pausa
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Gestão Administrativa RBAC & Finanças */}
        {showAdminNav && (
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
              Administração
            </p>
            <Link
              href="/dashboard/admin"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-heading tracking-wide transition-all ${
                isAdminUsersActive
                  ? "bg-[#FF5500] text-white font-bold shadow-[0_0_20px_rgba(255,85,0,0.25)]"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="size-4 shrink-0 text-[#FF5500]" />
                <span>Membros & RBAC</span>
              </div>
              <Badge className="bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 text-[9px] px-1.5 py-0 font-mono">
                ADMIN
              </Badge>
            </Link>

            <Link
              href="/dashboard/admin/pricing"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-heading tracking-wide transition-all ${
                isAdminPricingActive
                  ? "bg-[#FF5500] text-white font-bold shadow-[0_0_20px_rgba(255,85,0,0.25)]"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calculator className="size-4 shrink-0 text-[#FF5500]" />
                <span>Precificação & Custos</span>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/credits"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-heading tracking-wide transition-all ${
                isAdminCreditsActive
                  ? "bg-[#FF5500] text-white font-bold shadow-[0_0_20px_rgba(255,85,0,0.25)]"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Coins className="size-4 shrink-0 text-[#FF5500]" />
                <span>Pacotes & Créditos</span>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/flags"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-heading tracking-wide transition-all ${
                isAdminFlagsActive
                  ? "bg-[#FF5500] text-white font-bold shadow-[0_0_20px_rgba(255,85,0,0.25)]"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="size-4 shrink-0 text-[#FF5500]" />
                <span>Feature Flags</span>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/observability"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-heading tracking-wide transition-all ${
                isAdminObservabilityActive
                  ? "bg-[#FF5500] text-white font-bold shadow-[0_0_20px_rgba(255,85,0,0.25)]"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Activity className="size-4 shrink-0 text-cyan-400" />
                <span>Observabilidade</span>
              </div>
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </Link>

            <Link
              href="/dashboard/admin/ai-settings"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-heading tracking-wide transition-all ${
                isAdminAiSettingsActive
                  ? "bg-[#FF5500] text-white font-bold shadow-[0_0_20px_rgba(255,85,0,0.25)]"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="size-4 shrink-0 text-[#FF5500]" />
                <span>Configurações de IA</span>
              </div>
            </Link>
          </div>
        )}

        {/* Quick Links */}
        <div className="space-y-1">
          <p className="px-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
            Atalhos
          </p>
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#00E5FF]" />
              Página Inicial
            </span>
            <ExternalLink className="size-3.5 opacity-60" />
          </Link>
        </div>
      </div>

      {/* Botão de Perfil & Conta no fim da Sidebar */}
      <div className="pt-4 border-t border-white/10">
        <Link
          href="/dashboard/profile"
          className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all group ${
            isProfileActive
              ? "bg-[#FF5500]/15 border-[#FF5500]/50 shadow-[0_0_20px_rgba(255,85,0,0.2)]"
              : "bg-[#0C0D12] border-white/10 hover:border-white/20 hover:bg-white/5"
          }`}
          title="Acessar Perfil & Configurações da Conta"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="size-9 rounded-xl border border-white/15 shrink-0">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Avatar"} />
              <AvatarFallback className="text-xs font-heading font-black bg-[#FF5500] text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className={`text-xs font-heading truncate ${isProfileActive ? "text-white font-bold" : "text-neutral-200 group-hover:text-white"}`}>
                {user?.fullName || user?.firstName || "Criador"}
              </span>
              <span className="text-[10px] text-neutral-400 truncate font-mono">
                Perfil & Segurança
              </span>
            </div>
          </div>

          <div
            className={`p-1.5 rounded-lg transition-colors ${
              isProfileActive
                ? "bg-[#FF5500] text-white"
                : "text-neutral-400 group-hover:text-white group-hover:bg-white/10"
            }`}
          >
            <Settings className="size-3.5" />
          </div>
        </Link>
      </div>
    </aside>
  );
}

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { user } = useUser();
  const clerk = useClerk();
  const adminStatus = useQuery(api.admin.getCurrentAdminStatus);
  const creditsInfo = useQuery(api.credits.getMyCredits);
  const isChatEnabled = useFeatureFlag("chat_enabled");
  const showAdminNav = Boolean(adminStatus?.isAdmin);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentTitle =
    pathname === "/dashboard/profile"
      ? "Perfil & Segurança"
      : pathname === "/dashboard/credits"
      ? "Créditos & Recargas"
      : pathname.startsWith("/dashboard/vault")
      ? "Cofre de Mídias Salvas"
      : pathname.startsWith("/dashboard/elements")
      ? "Atores & Elementos de Cena"
      : pathname.startsWith("/dashboard/scripts")
      ? "Roteiro & Decupagem Técnica"
      : pathname === "/dashboard/admin"
      ? "Console Admin & RBAC"
      : pathname.startsWith("/dashboard/admin/pricing")
      ? "Precificação & Custos"
      : pathname.startsWith("/dashboard/admin/credits")
      ? "Pacotes & Créditos"
      : pathname.startsWith("/dashboard/admin/flags")
      ? "Feature Flags & Governança"
      : pathname.startsWith("/dashboard/admin/observability")
      ? "Observabilidade & Telemetria"
      : navItems.find((item) =>
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)
        )?.name || "Estúdio";

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") || "K";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050506]/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Mobile menu trigger (Navicon) & Title */}
        <div className="flex items-center gap-3">
          {/* Custom Animated Navicon (Mobile Menu Trigger) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            className="lg:hidden relative size-9 rounded-xl bg-[#0C0D12] border border-white/15 hover:border-[#FF5500]/50 hover:bg-[#FF5500]/10 text-white flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer shadow-md active:scale-95 group shrink-0"
          >
            <span
              className={`h-0.5 w-4 rounded-full bg-white transition-all duration-300 origin-center ${
                mobileMenuOpen ? "rotate-45 translate-y-1.5 bg-[#FF5500]" : "group-hover:bg-[#FF5500]"
              }`}
            />
            <span
              className={`h-0.5 w-4 rounded-full bg-white transition-all duration-200 ${
                mobileMenuOpen ? "opacity-0 scale-x-0" : "group-hover:bg-[#FF5500]"
              }`}
            />
            <span
              className={`h-0.5 w-4 rounded-full bg-white transition-all duration-300 origin-center ${
                mobileMenuOpen ? "-rotate-45 -translate-y-1.5 bg-[#FF5500]" : "group-hover:bg-[#FF5500]"
              }`}
            />
          </button>

          {/* Mini Brand Icon for Mobile Viewports */}
          <Link href="/dashboard" className="flex lg:hidden items-center gap-2 group/mini shrink-0">
            <div className="size-7 rounded-lg bg-gradient-to-br from-[#FF5500] via-[#FF4500] to-[#CC3700] text-white flex items-center justify-center font-heading font-black text-xs shadow-[0_0_12px_rgba(255,85,0,0.35)] border border-white/20">
              K
            </div>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base sm:text-lg font-heading font-bold uppercase tracking-tight text-white truncate">
              {currentTitle}
            </h1>
          </div>
        </div>

        {/* Right side controls com botão customizado do usuário */}
        <div className="flex items-center gap-3">
          {/* Botão Superior Direito do Usuário (Design System kriativa.app) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-[#0C0D12] border border-white/10 hover:border-[#FF5500]/50 transition-all cursor-pointer shadow-lg active:scale-98 group"
            >
              <div className="relative">
                <Avatar className="size-8 rounded-xl border border-white/20 transition-transform group-hover:scale-105">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Avatar"} />
                  <AvatarFallback className="text-xs font-heading font-black bg-[#FF5500] text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Active indicator dot */}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-[#050506]" />
              </div>

              <span className="text-xs font-heading font-bold text-white hidden sm:inline max-w-[120px] truncate">
                {user?.firstName || "Criador"}
              </span>

              <ChevronDown
                className={`size-3.5 text-neutral-400 transition-transform duration-200 ${
                  userDropdownOpen ? "rotate-180 text-[#FF5500]" : "group-hover:text-white"
                }`}
              />
            </button>

            {/* Dropdown Menu com visual cinematográfico */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/15 bg-[#0C0D12]/95 backdrop-blur-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header do Menu */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 mb-1">
                  <p className="text-xs font-heading font-bold text-white truncate">
                    {user?.fullName || "Criador kriativa.app"}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate font-mono">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                  <Link
                    href="/dashboard/credits"
                    onClick={() => setUserDropdownOpen(false)}
                    className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#FF5500] hover:underline"
                  >
                    <div className="flex items-center gap-1.5">
                      <Coins className="size-3" />
                      <span>{creditsInfo?.totalCredits ?? 50} Créditos</span>
                    </div>
                    <span className="text-[9px] text-neutral-400">Recarregar &rarr;</span>
                  </Link>
                </div>

                <div className="space-y-0.5">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/15 transition-colors font-sans"
                  >
                    <User className="size-4 text-[#FF5500]" />
                    <span>Perfil & Configurações</span>
                  </Link>

                  {showAdminNav && (
                    <>
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-[#FF5500]/10 transition-colors font-sans"
                      >
                        <div className="flex items-center gap-2.5">
                          <Shield className="size-4 text-[#FF5500]" />
                          <span>Membros & RBAC</span>
                        </div>
                        <Badge className="bg-[#FF5500]/20 text-[#FF5500] text-[9px] px-1.5 py-0 font-mono">
                          ADMIN
                        </Badge>
                      </Link>

                      <Link
                        href="/dashboard/admin/pricing"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-[#FF5500]/10 transition-colors font-sans"
                      >
                        <Calculator className="size-4 text-[#FF5500]" />
                        <span>Precificação & Custos</span>
                      </Link>

                      <Link
                        href="/dashboard/admin/credits"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-[#FF5500]/10 transition-colors font-sans"
                      >
                        <Coins className="size-4 text-[#FF5500]" />
                        <span>Pacotes & Créditos</span>
                      </Link>

                      <Link
                        href="/dashboard/admin/flags"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-[#FF5500]/10 transition-colors font-sans"
                      >
                        <Sliders className="size-4 text-[#FF5500]" />
                        <span>Feature Flags</span>
                      </Link>

                      <Link
                        href="/dashboard/admin/observability"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-[#FF5500]/10 transition-colors font-sans"
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="size-4 text-cyan-400" />
                          <span>Observabilidade</span>
                        </div>
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </Link>

                      <Link
                        href="/dashboard/admin/ai-settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-[#FF5500]/10 transition-colors font-sans"
                      >
                        <Sparkles className="size-4 text-[#FF5500]" />
                        <span>Configurações de IA</span>
                      </Link>
                    </>
                  )}


                  <Link
                    href="/"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/15 transition-colors font-sans"
                  >
                    <ExternalLink className="size-4 text-neutral-400" />
                    <span>Página Inicial</span>
                  </Link>
                </div>

                <Separator className="my-1.5 bg-white/10" />

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    clerk.signOut({ redirectUrl: "/" });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-sans cursor-pointer"
                >
                  <LogOut className="size-4" />
                  <span>Sair do Estúdio</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#08090C] p-4 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const isItemDisabled = item.href === "/chat" && !isChatEnabled;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-heading ${
                    isActive
                      ? "bg-[#FF5500] text-white font-bold"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{item.name}</span>
                  {isItemDisabled && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-medium">
                      Pausa
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              href="/dashboard/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-heading text-neutral-300 hover:bg-white/5 hover:text-white"
            >
              <User className="size-4 text-[#FF5500]" />
              <span>Perfil & Conta</span>
            </Link>

            {showAdminNav && (
              <>
                <Link
                  href="/dashboard/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-heading ${
                    pathname === "/dashboard/admin"
                      ? "bg-[#FF5500] text-white font-bold"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="size-4 text-[#FF5500]" />
                    <span>Membros & RBAC</span>
                  </div>
                  <Badge className="bg-[#FF5500]/15 text-[#FF5500] text-[9px] px-1.5 py-0 font-mono">
                    ADMIN
                  </Badge>
                </Link>

                <Link
                  href="/dashboard/admin/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-heading ${
                    pathname === "/dashboard/admin/pricing"
                      ? "bg-[#FF5500] text-white font-bold"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Calculator className="size-4 text-[#FF5500]" />
                  <span>Precificação & Custos</span>
                </Link>

                <Link
                  href="/dashboard/admin/credits"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-heading ${
                    pathname === "/dashboard/admin/credits"
                      ? "bg-[#FF5500] text-white font-bold"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Coins className="size-4 text-[#FF5500]" />
                  <span>Pacotes & Créditos</span>
                </Link>

                <Link
                  href="/dashboard/admin/flags"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-heading ${
                    pathname === "/dashboard/admin/flags"
                      ? "bg-[#FF5500] text-white font-bold"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Sliders className="size-4 text-[#FF5500]" />
                  <span>Feature Flags</span>
                </Link>

                <Link
                  href="/dashboard/admin/observability"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-heading ${
                    pathname === "/dashboard/admin/observability"
                      ? "bg-[#FF5500] text-white font-bold"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Activity className="size-4 text-cyan-400" />
                    <span>Observabilidade</span>
                  </div>
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </Link>
              </>
            )}

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-400 hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="size-4" />
              <span>Página Inicial</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
