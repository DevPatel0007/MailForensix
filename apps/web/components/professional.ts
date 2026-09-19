import type { PdfcnTheme } from "~/components/pdf-themes";

export const professionalTheme: PdfcnTheme = {
  colors: {
    foreground: "#111827",
    background: "#ffffff",
    muted: "#f3f4f6",
    mutedForeground: "#6b7280",
    primary: "#0f766e",
    primaryForeground: "#ffffff",
    border: "#d1d5db",
    accent: "#ccfbf1",
    destructive: "#dc2626",
    success: "#059669",
    warning: "#d97706",
    info: "#2563eb",
  },
  typography: {
    body: {
      fontFamily: "Helvetica, Arial, sans-serif",
      fontSize: 11,
      lineHeight: 1.45,
    },
  },
  spacing: {
    paragraphGap: 8,
  },
  primitives: {
    typography: {
      xs: 8,
      sm: 9,
      base: 11,
      lg: 14,
      xl: 18,
      "2xl": 24,
      "3xl": 32,
    },
    fontWeights: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    letterSpacing: {
      wider: 0.08,
    },
  },
};
