import { describe, expect, it } from "vitest";

import { negrita } from "@/test/alfabetos";

import { diferencia } from "./diferencia";

/** Aplica el reemplazo como lo haría el editor al teclearlo sobre ese trozo. */
function aplicar(antes: string, despues: string): string {
  const { inicio, fin, texto } = diferencia(antes, despues);
  return antes.slice(0, inicio) + texto + antes.slice(fin);
}

describe("diferencia", () => {
  it("da solo el trozo que cambia", () => {
    expect(diferencia("hola mundo cruel", "hola MUNDO cruel")).toEqual({ inicio: 5, fin: 10, texto: "MUNDO" });
  });

  it("si no cambia nada, el reemplazo es vacío", () => {
    expect(diferencia("igual", "igual")).toEqual({ inicio: 5, fin: 5, texto: "" });
  });

  it("sirve para insertar y para borrar", () => {
    expect(diferencia("ac", "abc")).toEqual({ inicio: 1, fin: 1, texto: "b" });
    expect(diferencia("abc", "ac")).toEqual({ inicio: 1, fin: 2, texto: "" });
    expect(diferencia("", "abc")).toEqual({ inicio: 0, fin: 0, texto: "abc" });
    expect(diferencia("abc", "")).toEqual({ inicio: 0, fin: 3, texto: "" });
  });

  it("con texto repetido no cuenta dos veces el mismo carácter", () => {
    expect(aplicar("aaa", "aa")).toBe("aa");
    expect(aplicar("aa", "aaa")).toBe("aaa");
  });

  it("no corta por la mitad una letra con estilo al principio del cambio", () => {
    // 𝗮 y 𝗯 comparten la primera de sus dos unidades UTF-16.
    const { inicio, texto } = diferencia(`x${negrita("a")}`, `x${negrita("b")}`);
    expect(inicio).toBe(1);
    expect(texto).toBe(negrita("b"));
  });

  it("no corta por la mitad un carácter de dos unidades al final del cambio", () => {
    // U+1F600 (😀) y U+1FA00 comparten la segunda de sus dos unidades UTF-16 y no la primera.
    const antes = "\u{1F600}x";
    const despues = "\u{1FA00}x";
    expect(diferencia(antes, despues)).toEqual({ inicio: 0, fin: 2, texto: "\u{1FA00}" });
  });

  it("los caracteres de una sola unidad por encima de los sustitutos no mueven el corte", () => {
    // «！» es U+FF01: mayor que cualquier mitad de un par, pero entero.
    expect(diferencia("！a！", "！b！")).toEqual({ inicio: 1, fin: 2, texto: "b" });
  });

  it("aplicar el reemplazo da siempre el texto de destino", () => {
    const casos: [string, string][] = [
      ["hola mundo", `hola ${negrita("mundo")}`],
      [`hola ${negrita("mundo")}`, "hola mundo"],
      [negrita("abc"), negrita("abd")],
      ["camión", `${negrita("cami")}${negrita("o")}́${negrita("n")}`],
      ["👍 vale", "👎 vale"],
    ];
    for (const [antes, despues] of casos) expect(aplicar(antes, despues)).toBe(despues);
  });
});
