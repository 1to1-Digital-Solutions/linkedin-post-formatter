import { Editor } from "./_ui/editor";
import { muted } from "./_ui/styles";

const LINKS = [
  { name: "GitHub", href: "https://github.com/cpl121" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/c%C3%A9sar-pe%C3%B3n-lamparero/" },
  { name: "Source", href: "https://github.com/1to1-Digital-Solutions/formato-linkedin" },
];

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <main className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
        <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-xl font-semibold tracking-tight">LinkedIn Post Formatter</h1>
          <p className={`text-sm ${muted}`}>
            Paste your post, style what matters and copy it into LinkedIn. Nothing leaves your browser.
          </p>
        </header>
        <Editor />
      </main>
      <footer className="border-t border-border">
        <div
          className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 text-sm ${muted} pb-[max(0.5rem,env(safe-area-inset-bottom))]`}
        >
          <p>Made by César Peón · 1to1 Digital Solutions</p>
          <nav aria-label="Author links" className="flex gap-x-4">
            {LINKS.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-accent pointer-fine:min-h-0"
              >
                {name}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
