import { Metadata } from "next";
import { InfoprodutorLanding } from "@/components/infoprodutor/infoprodutor-landing";

export const metadata: Metadata = {
  title: "Kriativa para Infoprodutores — Coprodução e Tecnologia de IA para seu Produto",
  description:
    "Transforme a inteligência artificial em parte do seu produto. Use a Kriativa para criar conteúdos e ofereça uma infraestrutura completa de IA para seus alunos sem mensalidade. Parceria de coprodução.",
  openGraph: {
    title: "Kriativa para Infoprodutores — Coprodução e Tecnologia de IA",
    description:
      "Crie mais. Entregue mais. Sem criar uma plataforma do zero. Ofereça uma infraestrutura completa de IA para seus alunos em um modelo de coprodução.",
    type: "website",
  },
};

export default function InfoprodutorPage() {
  return <InfoprodutorLanding />;
}
