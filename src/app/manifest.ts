import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kriativa.app — AI Motion & Generative Cinema Studio",
    short_name: "Kriativa",
    description: "Estúdio de cinema generativo com IA de alta precisão, motores de renderização e consistência cinematográfica.",
    start_url: "/chat",
    display: "standalone",
    background_color: "#050507",
    theme_color: "#050507",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    categories: ["entertainment", "productivity", "utilities"],
  };
}
