# Estado — formato-linkedin

> **Cómo continuar:** «lee `ESTADO.md` y sigue con el siguiente paso».
>
> **Corto a propósito y vigilado** (`test/handoff.test.ts`, 8 KB de tope): solo lo que hace
> falta para trabajar hoy. El porqué de las decisiones va a `docs/historial.md`, que no se lee
> al empezar.

---

## ⏭️ Siguiente paso

**Hecha la primera versión**, desplegada en https://formato-linkedin.vercel.app: pegar (con
conversión de Markdown), dar y quitar negrita, cursiva, tachado, subrayado y código con botón o
atajo, quitar formato, contador contra el tope de 3000, borrador en `localStorage` y copiar.
Probado en Chrome de escritorio contra `pnpm dev` (pegar, doble clic + negrita, atajos, deshacer,
copiar, recargar).

**Pendiente, por orden:**

1. **Probarlo con un post de verdad y publicarlo**: pegar desde Obsidian, copiar y pegar en
   LinkedIn, y mirar el resultado en el móvil. Lo que hay que mirar: que las tildes con formato
   (`𝗰𝗮𝗺𝗶𝗼́𝗻`) se vean bien en la app de LinkedIn de Android y de iOS. Si en alguno se descolocan,
   cambiar el valor por defecto de la opción «Dar formato también a las letras con tilde».
2. **Probar el editor en el móvil** (Safari de iOS y Chrome de Android): seleccionar con el dedo
   y pulsar un botón. Solo está comprobado en escritorio.
3. Posibles mejoras, solo si se echan de menos: vista previa del corte de «…ver más» (unos 210
   caracteres en escritorio y 140 en móvil), recordar las dos opciones entre sesiones, un e2e de
   humo con Playwright.

## 🚧 Lo que bloquea o espera al usuario

- **Despliegue automático**: Vercel no pudo conectar el repo (la app de Vercel en GitHub no
  tiene acceso a `formato-linkedin`, igual que pasa con `crm`). Se arregla dándole acceso en
  GitHub (Settings de la organización → GitHub Apps → Vercel → Repository access) y repitiendo
  `npx vercel git connect --scope 1to1-digital-solutions`. Mientras, se publica desde la CLI:
  `npx vercel deploy --prod --yes --scope 1to1-digital-solutions`.

## ▶️ Cómo arrancar

```sh
pnpm install
pnpm dev                     # http://127.0.0.1:3400
lsof -ti :3400 | xargs kill  # al terminar (nunca pkill)
```

No hay variables de entorno. `next dev` añade al final de `CLAUDE.md` un bloque suyo
(`nextjs-agent-rules`): se deja y se commitea, si no lo vuelve a escribir en cada arranque.

## 📌 Reglas que rigen y no se deducen del repo

- **Cobertura de `lib/` al 100 %** (`vitest.config.ts` explica qué queda fuera y por qué).
- **El texto no sale del navegador**: ni servidor, ni analítica, ni nada remoto.
- La URL de producción es pública (no hay nada que proteger) pero lleva `noindex`.
- Commits en inglés (Conventional Commits), a mano y solo cuando se pidan. Comentarios sin
  referencias temporales. Interfaz en español.

## 🗺️ Dónde está lo demás

| Para… | Mirar |
|---|---|
| Cómo funciona el «formato» y el research de partida | `docs/historial.md` (no se lee al empezar) |
| La lógica de conversión | `lib/formato/` y sus tests |
| Reglas de la suite de Organízate | `.claude/rules/` |
