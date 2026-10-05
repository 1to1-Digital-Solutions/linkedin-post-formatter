import type { Metadata, Viewport } from "next";

import { THEME_KEY } from "./_ui/storage-keys";
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

/**
 * Applies the remembered theme before the first paint, so the page does not flash the browser's
 * theme and then switch. A fixed string with no user data: the only inline script of the page.
 */
const APPLY_THEME = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPLY_THEME }} />
      </head>
      <body className="min-h-dvh bg-background text-text antialiased">{children}</body>
    </html>
  );
}
