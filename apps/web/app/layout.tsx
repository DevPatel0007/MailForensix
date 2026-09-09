import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";
import { cn } from "~/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "MailForensix — AI Email Forensics & Threat Intelligence",
  description:
    "MailForensix turns suspicious emails into forensic intelligence. Header analysis, sender identity, domain and IP intelligence, geolocation, threat correlation and evidence-based verdicts.",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("bg-background dark", inter.variable, geistMono.variable)}
    >
      <body className="antialiased font-sans bg-background text-foreground">
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
