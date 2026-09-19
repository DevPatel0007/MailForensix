import type { ReactNode } from "react";
import type { Style } from "~/lib/pdf-primitives";

export interface PDFComponentProps {
  children?: ReactNode;
  style?: Style | Style[];
  className?: string;
}
