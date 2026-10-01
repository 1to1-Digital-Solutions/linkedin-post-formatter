import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * El tamaño de `ESTADO.md`, vigilado.
 *
 * `ESTADO.md` se lee al empezar casi cada sesión, así que sus bytes se pagan una y otra vez. Sin
 * nada que avise, engorda con cada tanda hasta que lo que hace falta hoy queda enterrado entre
 * decisiones ya cerradas. Esto avisa: no juzga lo que pone, solo que quepa en lo que hace falta
 * para trabajar hoy. Lo que responde a «por qué está esto así» va a `docs/historial.md`, que no
 * se lee al empezar.
 */

/** Ocho kilobytes son unos 2.000 tokens. Subirlo tiene que ser una decisión, no un descuido. */
const TOPE_BYTES = 8 * 1024;

const estado = () => readFileSync(path.join(process.cwd(), "ESTADO.md"));

describe("ESTADO.md", () => {
  it("cabe en lo que hace falta para trabajar hoy", () => {
    const bytes = estado().length;
    expect(
      bytes,
      `ESTADO.md ocupa ${bytes} bytes y el tope son ${TOPE_BYTES}. Lo que ya está cerrado va a ` +
        "docs/historial.md; aquí solo el siguiente paso, lo que bloquea y cómo arrancar.",
    ).toBeLessThanOrEqual(TOPE_BYTES);
  });

  it("dice cómo continuar y dónde está lo demás", () => {
    const texto = estado().toString("utf8");
    expect(texto).toMatch(/Siguiente paso/i);
    expect(texto).toMatch(/docs\/historial\.md/);
  });
});
