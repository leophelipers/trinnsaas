import { BannersView } from "@/components/dashboard/admin/banners-view";

export const metadata = {
  title: "Banners de Destaque | Painel Administrativo",
  description: "Gerencie banners de destaque e avisos exibidos no topo do Visão Geral.",
};

export default function AdminBannersPage() {
  return <BannersView />;
}
