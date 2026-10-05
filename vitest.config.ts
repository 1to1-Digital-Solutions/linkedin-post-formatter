import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * **What is measured and the floor.** The logic lives in `lib/` and is what is measured, at
 * 100 %. `app/` stays out: the page and the editor are the wrapper that connects `lib/` to the
 * `<textarea>`, the clipboard and `localStorage`, which cannot run without a browser. It is
 * checked by hand with `pnpm dev`.
 *
 * A threshold below what is measured prevents nothing: if it ever has to go down, let it be
 * with the reason written here.
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
