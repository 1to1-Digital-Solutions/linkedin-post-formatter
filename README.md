# Formato para LinkedIn · 1to1 Digital Solutions

Herramienta de una sola pantalla para dar formato al texto de un post de LinkedIn: negrita,
cursiva, tachado, subrayado y código. Se pega el borrador, se marca lo que se quiere destacar y
se copia tal cual a LinkedIn.

**Producción:** https://formato-linkedin.vercel.app

## Qué hace

- **Convierte Markdown al pegar**: `**negrita**`, `*cursiva*`, `~~tachado~~`, `` `código` ``,
  títulos (`# …`, en negrita), viñetas (`- …` → `•`) y enlaces (`[texto](url)` → `texto (url)`).
- **Formato a mano**: doble clic en una palabra (o una selección, o el cursor sobre la palabra) y
  botón o atajo: `Ctrl/⌘ + B`, `I`, `U` y `Mayús + X`. Repetirlo lo quita. `Ctrl/⌘ + Z` deshace.
- **Tildes y ñ con formato**: se escriben como la letra con formato más la tilde combinante.
- **Enlaces, correos, #hashtags y @menciones** se quedan siempre sin formato, para que LinkedIn
  los siga reconociendo.
- **Contador** contra el tope de 3000 (cada letra con formato cuenta dos) y **borrador** guardado
  en el navegador.

El texto no sale del navegador: no hay servidor, base de datos ni analítica.

## Cómo funciona

LinkedIn solo guarda texto plano. La «negrita» son las letras del bloque Unicode de símbolos
alfanuméricos matemáticos (U+1D400–U+1D7FF), y el tachado y el subrayado son una marca combinante
detrás de cada carácter. El detalle, lo que hacen otras herramientas y sus pegas (lectores de
pantalla, buscador), en [docs/historial.md](docs/historial.md).

## Arrancar

```sh
nvm use        # Node 24
pnpm install
pnpm dev       # http://127.0.0.1:3400
```

## Scripts

| | |
|---|---|
| `pnpm dev` / `build` / `start` | Next en el puerto 3400 |
| `pnpm typecheck` / `lint` | TypeScript y ESLint |
| `pnpm test` / `coverage` | Vitest; la cobertura de `lib/` se exige al 100 % |

## Desplegar

Proyecto `formato-linkedin` del equipo `1to1-digital-solutions` en Vercel:

```sh
npx vercel deploy --prod --yes --scope 1to1-digital-solutions
```
