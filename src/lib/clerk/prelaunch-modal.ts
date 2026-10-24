import { dark } from "@clerk/ui/themes";
import { createTheme } from "@clerk/ui/themes/experimental";
import { ptBR } from "@clerk/localizations/pt-BR";
import type { LocalizationResource } from "@clerk/shared/types";

/**
 * Tema do modal de autenticação do pré-lançamento: estética Liquid Glass Dark
 * com Solar Orange (#FF5500) como cor primária.
 */
export const KRIATIVA_CLERK_THEME = createTheme({
  name: "kriativa-pre-launch",
  theme: dark,
  variables: {
    colorPrimary: "#FF5500",
    colorPrimaryForeground: "#FFFFFF",
    colorNeutral: "#FFFFFF",
    colorForeground: "#FAFAFA",
    colorMutedForeground: "#A1A1AA",
    colorBackground: "#0A0A0E",
    colorInput: "#14141A",
    colorInputForeground: "#FAFAFA",
    colorRing: "#FF5500",
    colorModalBackdrop: "rgba(5, 5, 8, 0.82)",
    borderRadius: "0.875rem",
  },
  options: {
    showOptionalFields: false,
    socialButtonsVariant: "blockButton",
  },
});

export const PRE_LAUNCH_CLERK_APPEARANCE = {
  theme: [KRIATIVA_CLERK_THEME],
};

export const PRE_LAUNCH_CLERK_LOCALIZATION: LocalizationResource = {
  ...ptBR,
  signUp: {
    ...ptBR.signUp,
    start: {
      ...ptBR.signUp?.start,
      title: "Garanta seu lugar",
      titleCombined: "Garanta seu lugar",
      subtitle: "Cadastro gratuito. Sem cartão de crédito.",
      subtitleCombined: "Cadastro gratuito. Sem cartão de crédito.",
    },
  },
};
