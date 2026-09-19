export type ColorTokens = {
  foreground: string;
  background: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  border: string;
  accent: string;
  destructive: string;
  success: string;
  warning: string;
  info: string;
};

export type PdfcnTheme = {
  colors: ColorTokens;
  typography: {
    body: {
      fontFamily: string;
      fontSize: number;
      lineHeight: number;
    };
  };
  spacing: {
    paragraphGap: number;
  };
  primitives: {
    typography: Record<"xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl", number>;
    fontWeights: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    letterSpacing: {
      wider: number;
    };
  };
};
