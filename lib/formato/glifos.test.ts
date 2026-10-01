import { describe, expect, it } from "vitest";

import { cursiva, mono, negrita, negritaCursiva, SUBRAYADO, TACHADO } from "@/test/alfabetos";

import { admite, componer, descomponer, limpiar, poner, type Estilo, type Glifo } from "./glifos";

const CON_TILDES = { tildes: true };
const SIN_TILDES = { tildes: false };

const ABECEDARIO = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Da los estilos a todo lo que los admite y lo vuelve a escribir. */
function conEstilos(texto: string, estilos: Estilo[], opciones = CON_TILDES): string {
  const glifos = descomponer(texto);
  for (const estilo of estilos) {
    for (const glifo of glifos) if (admite(glifo, estilo, opciones)) poner(glifo, estilo, true);
  }
  return componer(glifos);
}

const primero = (texto: string) => descomponer(texto)[0] as Glifo;

describe("los alfabetos", () => {
  it("la negrita es la de palo seco, con sus cifras", () => {
    expect(conEstilos("Hola 2026", ["negrita"])).toBe("𝗛𝗼𝗹𝗮 𝟮𝟬𝟮𝟲");
    expect(conEstilos(ABECEDARIO + "0123456789", ["negrita"])).toBe(negrita(ABECEDARIO + "0123456789"));
  });

  it("la cursiva es la de palo seco y deja las cifras como están, porque no hay cifras cursivas", () => {
    expect(conEstilos("Hola 2026", ["cursiva"])).toBe("𝘏𝘰𝘭𝘢 2026");
    expect(conEstilos(ABECEDARIO, ["cursiva"])).toBe(cursiva(ABECEDARIO));
  });

  it("negrita y cursiva a la vez dan la negrita cursiva, con las cifras solo en negrita", () => {
    expect(conEstilos("Hola 26", ["negrita", "cursiva"])).toBe("𝙃𝙤𝙡𝙖 𝟮𝟲");
    expect(conEstilos(ABECEDARIO, ["cursiva", "negrita"])).toBe(negritaCursiva(ABECEDARIO));
  });

  it("el monoespaciado tiene letras y cifras", () => {
    expect(conEstilos("/help 42", ["mono"])).toBe("/𝚑𝚎𝚕𝚙 𝟺𝟸");
    expect(conEstilos(ABECEDARIO + "0123456789", ["mono"])).toBe(mono(ABECEDARIO + "0123456789"));
  });

  it("toda letra con estilo es, para Unicode, una variante de su letra corriente", () => {
    for (const estilos of [["negrita"], ["cursiva"], ["negrita", "cursiva"], ["mono"]] as Estilo[][]) {
      expect(conEstilos(ABECEDARIO, estilos).normalize("NFKC")).toBe(ABECEDARIO);
    }
  });
});

describe("descomponer", () => {
  it("lee una letra con estilo como su letra de base y sus banderas", () => {
    expect(primero(negrita("a"))).toMatchObject({ base: "a", negrita: true, cursiva: false, mono: false });
    expect(primero(cursiva("Z"))).toMatchObject({ base: "Z", negrita: false, cursiva: true });
    expect(primero(negritaCursiva("q"))).toMatchObject({ base: "q", negrita: true, cursiva: true });
    expect(primero(mono("7"))).toMatchObject({ base: "7", mono: true, negrita: false });
  });

  it("guarda la posición de cada glifo en unidades UTF-16", () => {
    const glifos = descomponer(`a${negrita("b")}c`);
    expect(glifos.map((g) => [g.inicio, g.fin])).toEqual([
      [0, 1],
      [1, 3],
      [3, 4],
    ]);
  });

  it("separa la tilde de su letra, y la ñ de su virgulilla", () => {
    expect(primero("á")).toMatchObject({ base: "a", marcas: "́", inicio: 0, fin: 1 });
    expect(primero("Ñ")).toMatchObject({ base: "N", marcas: "̃" });
    expect(primero("ü")).toMatchObject({ base: "u", marcas: "̈" });
  });

  it("lee el tachado y el subrayado como banderas del carácter al que siguen", () => {
    const [a, b] = descomponer(`a${TACHADO}${SUBRAYADO}b`);
    expect(a).toMatchObject({ base: "a", tachado: true, subrayado: true, marcas: "", fin: 3 });
    expect(b).toMatchObject({ base: "b", tachado: false, subrayado: false, inicio: 3 });
  });

  it("deja como están los caracteres que no se descomponen en una letra latina", () => {
    expect(primero("¿")).toMatchObject({ base: "¿", marcas: "" });
    expect(primero("한")).toMatchObject({ base: "한", marcas: "" });
    expect(primero("ß")).toMatchObject({ base: "ß", marcas: "" });
  });

  it("una marca suelta al principio del texto es un glifo más", () => {
    expect(descomponer(TACHADO)).toHaveLength(1);
    expect(componer(descomponer(TACHADO))).toBe(TACHADO);
  });

  it("de un texto vacío no sale nada", () => {
    expect(descomponer("")).toEqual([]);
  });
});

describe("componer", () => {
  it("devuelve el mismo texto si no se toca nada", () => {
    const texto = `Camión ${negrita("fuerte")} y ${cursiva("fino")}, ¿verdad? 👩‍💻 1️⃣ ❤️ 🇪🇸\nOtra línea${TACHADO}`;
    expect(componer(descomponer(texto))).toBe(texto);
  });

  it("escribe la tilde detrás de la letra con estilo", () => {
    expect(conEstilos("camión", ["negrita"])).toBe(`${negrita("cami")}${negrita("o")}́${negrita("n")}`);
    expect(conEstilos("año", ["cursiva"])).toBe(`${cursiva("a")}${cursiva("n")}̃${cursiva("o")}`);
  });

  it("al quitar el estilo, la letra y su tilde vuelven a ser un solo carácter", () => {
    const glifos = descomponer(conEstilos("camión", ["negrita"]));
    for (const glifo of glifos) poner(glifo, "negrita", false);
    expect(componer(glifos)).toBe("camión");
    expect(componer(glifos)).toHaveLength(6);
  });

  it("pone el subrayado y el tachado detrás de la tilde", () => {
    expect(conEstilos("á", ["negrita", "tachado", "subrayado"])).toBe(`${negrita("a")}́${SUBRAYADO}${TACHADO}`);
  });
});

describe("admite", () => {
  it("la negrita y el monoespaciado valen para letras y cifras; la cursiva, solo para letras", () => {
    expect(admite(primero("a"), "negrita", CON_TILDES)).toBe(true);
    expect(admite(primero("7"), "negrita", CON_TILDES)).toBe(true);
    expect(admite(primero("7"), "mono", CON_TILDES)).toBe(true);
    expect(admite(primero("7"), "cursiva", CON_TILDES)).toBe(false);
    expect(admite(primero("¿"), "negrita", CON_TILDES)).toBe(false);
    expect(admite(primero(" "), "cursiva", CON_TILDES)).toBe(false);
  });

  it("con las tildes desactivadas, las letras acentuadas no cambian de alfabeto", () => {
    expect(admite(primero("ó"), "negrita", CON_TILDES)).toBe(true);
    expect(admite(primero("ó"), "negrita", SIN_TILDES)).toBe(false);
    expect(admite(primero("o"), "negrita", SIN_TILDES)).toBe(true);
    expect(conEstilos("camión", ["negrita"], SIN_TILDES)).toBe(`${negrita("cami")}ó${negrita("n")}`);
  });

  it("el tachado y el subrayado valen para casi todo, también espacios, signos y tildes", () => {
    expect(admite(primero(" "), "tachado", SIN_TILDES)).toBe(true);
    expect(admite(primero("¿"), "subrayado", SIN_TILDES)).toBe(true);
    expect(admite(primero("ó"), "tachado", SIN_TILDES)).toBe(true);
  });

  it("no raya los saltos de línea ni las piezas de un emoji", () => {
    expect(admite(primero("\n"), "tachado", CON_TILDES)).toBe(false);
    expect(conEstilos("a\n👩‍💻🇪🇸👍🏽b", ["tachado"])).toBe(`a${TACHADO}\n👩‍💻🇪🇸👍🏽b${TACHADO}`);
  });

  it("no toca un emoji hecho con una cifra o un símbolo y sus selectores", () => {
    expect(conEstilos("1️⃣ ❤️", ["negrita", "tachado"])).toBe(`1️⃣ ${TACHADO}❤️`);
  });
});

describe("poner", () => {
  it("el monoespaciado quita la negrita y la cursiva, y al revés", () => {
    expect(conEstilos(negritaCursiva("a"), ["mono"])).toBe(mono("a"));
    expect(conEstilos(mono("a"), ["negrita"])).toBe(negrita("a"));
    expect(conEstilos(mono("a"), ["cursiva"])).toBe(cursiva("a"));
  });

  it("quitar un estilo no toca los demás", () => {
    const glifo = primero(`${negritaCursiva("a")}${TACHADO}`);
    poner(glifo, "cursiva", false);
    expect(componer([glifo])).toBe(`${negrita("a")}${TACHADO}`);
    poner(glifo, "tachado", false);
    expect(componer([glifo])).toBe(negrita("a"));
  });
});

describe("limpiar", () => {
  it("quita todos los estilos y conserva la tilde", () => {
    const glifos = descomponer(conEstilos("ó", ["negrita", "cursiva", "tachado", "subrayado"]));
    glifos.forEach(limpiar);
    expect(componer(glifos)).toBe("ó");
  });

  it("devuelve a letra corriente los alfabetos de otras herramientas", () => {
    // «Hola» en negrita con serifa (MATHEMATICAL BOLD), que aquí no se escribe nunca.
    const serifa = "\u{1D407}\u{1D428}\u{1D425}\u{1D41A}";
    expect(componer(descomponer(serifa))).toBe(serifa);
    const glifos = descomponer(serifa);
    glifos.forEach(limpiar);
    expect(componer(glifos)).toBe("Hola");
  });

  it("no cambia lo que no tiene estilo", () => {
    const glifos = descomponer("¿Qué? 👍 Ω");
    glifos.forEach(limpiar);
    expect(componer(glifos)).toBe("¿Qué? 👍 Ω");
  });
});
