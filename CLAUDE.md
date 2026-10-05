# CLAUDE.md — LinkedIn Post Formatter

**What it is:** a single-page tool that formats the text of a LinkedIn post (bold, italic,
strikethrough, underline, code). LinkedIn stores plain text only, so the "formatting" is Unicode
characters that look like letters. Paste the draft (Markdown included), tweak with double-click
and a button or a shortcut, copy. See `README.md` for the feature list and `docs/how-it-works.md`
for the mechanics and the decisions.

**Stack:** Next.js 16 (App Router), React 19, strict TypeScript, Tailwind 4, pnpm, Node 24,
Vitest. No server of its own, no database, no environment variables: the page is static and the
text never leaves the browser (the draft lives in `localStorage`).

**How the code is split:**
- `lib/format/` is the logic, pure and DOM-free: `glyphs.ts` (read and write styled letters),
  `apply.ts` (toggle styles on a selection), `markdown.ts` (Markdown to Unicode), `protected.ts`
  (links, hashtags and mentions, which never get styled), `hook.ts` (the "…more" cut), `diff.ts`
  and `limit.ts`. Tested at 100 %.
- `app/` is the wrapper: `_ui/editor.tsx` connects `lib/` to the `<textarea>`, the clipboard and
  the draft. No logic goes there.

**Run and check:** `pnpm dev` (http://127.0.0.1:3400). Gates: `pnpm typecheck && pnpm lint &&
pnpm coverage && pnpm build`, all green before finishing. Kill the dev server by port
(`lsof -ti :3400 | xargs kill`), never by name.

**Handle with care:**
- **The alphabets in `glyphs.ts`** are sans-serif on purpose (no holes, readable in the feed).
  Changing them changes what gets published.
- **Changes to the `<textarea>` go through `app/_ui/type-into.ts`**: that is what keeps the
  browser's undo. Assigning the value directly breaks it.
- **Nothing remote at runtime** (fonts, analytics, calls): the CSP in `lib/headers.ts` forbids it
  and the page's promise is that the text never leaves it.

**Conventions:** everything in English (code, comments, UI, docs, commits). Conventional Commits
(`feat:`, `fix:`, `docs:`…), one logical change per commit, no temporal references in comments.
Keep functions short, no dead code, no speculative abstractions. Tests check behaviour, not
implementation, and new logic ships with tests that would fail without it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
