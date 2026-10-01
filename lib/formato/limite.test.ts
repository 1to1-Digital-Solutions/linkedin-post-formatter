import { describe, expect, it } from "vitest";

import { negrita } from "@/test/alfabetos";

import { caracteresUsados, LIMITE_DEL_POST } from "./limite";

describe("caracteresUsados", () => {
  it("cuenta uno por cada carácter corriente, tildes y saltos de línea incluidos", () => {
    expect(caracteresUsados("camión\nñu")).toBe(9);
    expect(caracteresUsados("")).toBe(0);
  });

  it("cuenta dos por cada letra con estilo y por cada emoji sencillo, como LinkedIn", () => {
    expect(caracteresUsados(negrita("hola"))).toBe(8);
    expect(caracteresUsados("👍")).toBe(2);
  });

  it("el tope de un post son 3.000", () => {
    expect(LIMITE_DEL_POST).toBe(3000);
  });
});
