import { Metadata } from "next";
import { InfoprodutorLandingV2 } from "@/components/infoprodutor/infoprodutor-landing-v2";

export const metadata: Metadata = {
  title: "Transforme sua Ideia em um Produto Digital — Kriativa Coprodução & Tech",
  description:
    "Você entra com a ideia. A Kriativa entra com a tecnologia. Criamos, desenvolvemos e colocamos no mercado produtos digitais, SaaS, aplicativos e IA em parceria de coprodução.",
  openGraph: {
    title: "Transforme sua Ideia em um Produto Digital — Kriativa Coprodução & Tech",
    description:
      "Você entra com a ideia. A Kriativa entra com a tecnologia. Construímos juntos produtos digitais, SaaS, aplicativos mobile e IA através de um modelo de parceria e coprodução.",
    type: "website",
  },
};

export default function Infoprodutor2Page() {
  return <InfoprodutorLandingV2 />;
}
