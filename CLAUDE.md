# CLAUDE.md — formato-linkedin

**Qué es:** una herramienta de una sola pantalla para dar formato (negrita, cursiva, tachado,
subrayado, código) al texto de un post de LinkedIn. LinkedIn solo guarda texto plano, así que el
«formato» son caracteres Unicode que se parecen a las letras. Se pega el borrador (con su
Markdown, si viene de Obsidian), se retoca con doble clic y botón o atajo, y se copia.

**Estado y siguiente paso:** **`ESTADO.md`** (≤ 8 KB, vigilado por `test/handoff.test.ts`). El
porqué de las decisiones y el research de partida, en `docs/historial.md`, que **solo se lee si
la pregunta es «por qué está esto así»**.

**Stack:** Next.js 16 (App Router), React 19, TypeScript estricto, Tailwind 4, pnpm, Node 24,
Vitest. Sin servidor propio, sin base de datos y sin variables de entorno: la página es estática
y el texto no sale del navegador (el borrador vive en `localStorage`).

**Cómo se reparte el código:**
- `lib/formato/` es la lógica, pura y sin DOM: `glifos.ts` (leer y escribir letras con estilo),
  `aplicar.ts` (dar y quitar formato a una selección), `markdown.ts` (de Markdown a Unicode),
  `protegidos.ts` (enlaces, hashtags y menciones, que nunca llevan formato), `diferencia.ts` y
  `limite.ts`. Se prueba al 100 %.
- `app/` es el envoltorio: `_ui/editor.tsx` conecta `lib/` con el `<textarea>`, el portapapeles
  y el borrador. No metas lógica ahí.

**Arrancar y probar:** `pnpm dev` (http://127.0.0.1:3400). Gates: `pnpm typecheck && pnpm lint
&& pnpm coverage && pnpm build`. Mata el servidor por puerto (`lsof -ti :3400 | xargs kill`),
nunca con `pkill`.

**No tocar sin pensarlo dos veces:**
- **Los alfabetos de `glifos.ts`** son los de palo seco a propósito (no tienen huecos y se leen
  bien en el feed). Cambiarlos cambia lo que se publica.
- **Los cambios al `<textarea>` pasan por `app/_ui/escribir.ts`**: es lo que mantiene el
  deshacer del navegador. Asignar el valor a mano lo rompe.
- **Nada de fuera en tiempo de ejecución** (fuentes, analítica, llamadas): la CSP de
  `lib/cabeceras.ts` lo impide y la promesa de la página es que el texto no sale de ahí.

**Reglas:** las de la suite de Organízate, en `.claude/rules/`. Commits en inglés
(Conventional Commits), a mano y solo cuando se pidan; comentarios sin referencias temporales;
interfaz en español.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
