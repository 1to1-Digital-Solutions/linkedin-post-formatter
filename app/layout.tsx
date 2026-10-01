import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Formato para LinkedIn · 1to1 Digital Solutions",
  description: "Negrita, cursiva y tachado para un post de LinkedIn, desde Markdown o a mano.",
  robots: { index: false, follow: false, nocache: true },
};

/** `viewport-fit=cover` para que el iPhone pinte bajo la muesca; los márgenes los pone `safe-area`. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
    { media: "(prefers-color-scheme: dark)", color: "#27272a" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-fondo text-texto antialiased">{children}</body>
    </html>
  );
}
