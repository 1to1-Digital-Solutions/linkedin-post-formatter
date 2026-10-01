import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * **Qué se mide y con qué suelo.** La lógica vive en `lib/` y es lo que se mide, al 100 %.
 * Queda fuera `app/`: la página y el editor son el envoltorio que conecta `lib/` con el
 * `<textarea>`, el portapapeles y `localStorage`, que sin un navegador no hay cómo ejecutar. Se
 * comprueba a mano con `pnpm dev`.
 *
 * Un umbral por debajo de lo medido no impide nada: si algún día hay que bajarlo, que sea con
 * el porqué escrito aquí.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "test/**/*.test.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
      exclude: ["**/*.test.ts"],
      reporter: ["text", "html"],
      thresholds: { lines: 100, statements: 100, functions: 100, branches: 100 },
    },
  },
});
