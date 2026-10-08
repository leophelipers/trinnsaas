import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kriativa.app"),
  title: {
    default: "Kriativa.app — AI Motion & Generative Cinema Studio",
    template: "%s | Kriativa.app",
  },
  description:
    "Estúdio de cinema generativo com controle de câmera 3D em tempo real, consistência temporal de atores e lentes anamórficas virtuais até 4K. Crie vídeos hiper-realistas com IA.",
  keywords: [
    "vídeo com inteligência artificial",
    "cinema generativo",
    "controle de câmera 3D",
    "consistência de personagens IA",
    "gerador de vídeo IA",
    "lentes anamórficas virtuais",
    "produção audiovisual com IA",
    "alternativa runway gen 3",
    "kriativa app",
  ],
  authors: [{ name: "Kriativa Studios" }],
  creator: "Kriativa.app",
  publisher: "Kriativa.app",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://kriativa.app",
    title: "Kriativa.app — AI Motion & Generative Cinema Studio",
    description:
      "O primeiro estúdio de cinema generativo com física de câmera 3D real, lentes anamórficas e cofre de consistência de atores.",
    siteName: "Kriativa.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kriativa.app — AI Motion & Cinema Studio",
    description:
      "Cinema hiper-realista e controle absoluto de câmera 3D para diretores e criadores visuais.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${syne.variable} ${spaceGrotesk.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <ClerkProvider appearance={{ theme: shadcn }}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
