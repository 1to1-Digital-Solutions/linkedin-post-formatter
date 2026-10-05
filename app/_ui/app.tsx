"use client";

import { useEffect } from "react";

import { Editor } from "./editor";
import { LOCALES, setLocale, useLocale, useMessages, type Locale } from "./i18n/locale";
import { muted } from "./styles";
import { setTheme, useTheme } from "./theme";

const LINKS = [
  { name: "GitHub", href: "https://github.com/cpl121" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/c%C3%A9sar-pe%C3%B3n-lamparero/" },
  { name: "source", href: "https://github.com/1to1-Digital-Solutions/formato-linkedin" },
] as const;

const control =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm font-medium text-muted hover:bg-raised hover:text-text aria-pressed:bg-accent-soft aria-pressed:text-accent pointer-fine:min-h-8 pointer-fine:min-w-8";

/** The page: header with language and theme, the editor, and the footer. */
export function App() {
  const t = useMessages();
  const locale = useLocale();
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  // The server renders `lang="en"`; the remembered language takes over once on the client.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <main className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col gap-5 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 sm:px-6 sm:pt-8">
        <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
            <p className={`mt-1 ${muted}`}>{t.tagline}</p>
          </div>
          <div className="flex items-center gap-1">
            <fieldset className="flex gap-0.5" aria-label={t.language}>
              {(Object.keys(LOCALES) as Locale[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={control}
                  lang={value}
                  aria-pressed={locale === value}
                  aria-label={LOCALES[value]}
                  onClick={() => setLocale(value)}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </fieldset>
            <button
              type="button"
              className={control}
              aria-label={next === "dark" ? t.theme.toDark : t.theme.toLight}
              title={next === "dark" ? t.theme.toDark : t.theme.toLight}
              onClick={() => setTheme(next)}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {theme === "dark" ? "☀" : "☾"}
              </span>
            </button>
          </div>
        </header>
        <Editor />
      </main>
      <footer className="border-t border-border">
        <div
          className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-sm sm:px-6 ${muted}`}
        >
          <p>{t.footer.madeBy}</p>
          <nav aria-label={t.footer.links} className="flex gap-x-5">
            {LINKS.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center underline-offset-4 hover:text-accent hover:underline pointer-fine:min-h-0"
              >
                {name === "source" ? t.footer.source : name}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
