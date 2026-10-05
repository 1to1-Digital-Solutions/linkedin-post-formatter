import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "LinkedIn Post Formatter",
  description:
    "Bold, italic, strikethrough and more for LinkedIn posts, from Markdown or by hand. Runs entirely in your browser.",
};

/** `viewport-fit=cover` so iPhones paint under the notch; the margins come from `safe-area`. */
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
    <html lang="en">
      <body className="min-h-dvh bg-background text-text antialiased">{children}</body>
    </html>
  );
}
