import { Metadata } from "next";
import { InfoprodutorLanding } from "@/components/infoprodutor/infoprodutor-landing";

export const metadata: Metadata = {
  title: "Transforme sua Ideia em um Produto Digital — Coprodução e Tecnologia Kriativa",
  description:
    "Você entra com a ideia. A Kriativa entra com a tecnologia. Criamos, desenvolvemos e colocamos no mercado produtos digitais, SaaS, aplicativos, plataformas e IA através de parceria e coprodução.",
  openGraph: {
    title: "Transforme sua Ideia em um Produto Digital — Coprodução Kriativa",
    description:
      "Você entra com a ideia. A Kriativa entra com a tecnologia. Construímos juntos produtos digitais, SaaS, aplicativos mobile e IA através de um modelo de parceria e coprodução.",
    type: "website",
  },
};

export default function InfoprodutorPage() {
  return <InfoprodutorLanding />;
}
