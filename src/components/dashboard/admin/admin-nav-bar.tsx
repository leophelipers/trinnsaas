"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Calculator, Coins, Shield, Sliders, Activity, Megaphone } from "lucide-react";

interface AdminNavBarProps {
  currentTab?: "users" | "pricing" | "credits" | "flags" | "observability" | "banners";
}

export function AdminNavBar({ currentTab }: AdminNavBarProps) {
  const pathname = usePathname();

  const links = [
    {
      name: "Membros & RBAC",
      href: "/dashboard/admin",
      icon: Users,
      badge: "Governança",
      isActive: pathname === "/dashboard/admin",
    },
    {
      name: "Banners & Destaques",
      href: "/dashboard/admin/banners",
      icon: Megaphone,
      badge: "Destaques",
      isActive: pathname.startsWith("/dashboard/admin/banners"),
    },
    {
      name: "Precificação & Custos",
      href: "/dashboard/admin/pricing",
      icon: Calculator,
      badge: "Unit Economics",
      isActive: pathname.startsWith("/dashboard/admin/pricing"),
    },
    {
      name: "Pacotes & Créditos",
      href: "/dashboard/admin/credits",
      icon: Coins,
      badge: "Tesouraria",
      isActive: pathname.startsWith("/dashboard/admin/credits"),
    },
    {
      name: "Feature Flags",
      href: "/dashboard/admin/flags",
      icon: Sliders,
      badge: "Controle",
      isActive: pathname.startsWith("/dashboard/admin/flags"),
    },
    {
      name: "Observabilidade",
      href: "/dashboard/admin/observability",
      icon: Activity,
      badge: "Telemetria",
      isActive: pathname.startsWith("/dashboard/admin/observability"),
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0C0D12] border border-white/10 p-2.5 rounded-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-heading font-medium tracking-wide transition-all ${
                link.isActive
                  ? "bg-[#FF5500] text-white font-bold shadow-[0_0_20px_rgba(255,85,0,0.3)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="size-3.5 sm:size-4 shrink-0" />
              <span>{link.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider hidden md:inline-block ${
                  link.isActive
                    ? "bg-black/30 text-white"
                    : "bg-white/5 text-neutral-500 group-hover:text-neutral-300"
                }`}
              >
                {link.badge}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-xl">
        <Shield className="size-3.5 text-[#FF5500]" />
        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
          Acesso Restrito: Administrador
        </span>
      </div>
    </div>
  );
}
