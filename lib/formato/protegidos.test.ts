import { describe, expect, it } from "vitest";

import { protegidos, seSolapan } from "./protegidos";

const trozos = (texto: string) => protegidos(texto).map((r) => texto.slice(r.inicio, r.fin));

describe("protegidos", () => {
  it("encuentra enlaces, con y sin protocolo", () => {
    expect(trozos("ve a https://x.com/a?b=1 o a http://y.es y www.z.org/ruta ya")).toEqual([
      "https://x.com/a?b=1",
      "http://y.es",
      "www.z.org/ruta",
    ]);
  });

  it("encuentra hashtags y menciones, también con tildes y cifras", () => {
    expect(trozos("#automatización con @César_Peón y #ia2026")).toEqual(["#automatización", "@César_Peón", "#ia2026"]);
  });

  it("encuentra los correos enteros", () => {
    expect(trozos("escribe a cesar.pl+post@1to1digital.solutions hoy")).toEqual(["cesar.pl+post@1to1digital.solutions"]);
  });

  it("no toma por hashtag una almohadilla suelta ni una dentro de una palabra", () => {
    expect(trozos("el # suelto, C#sharp y a@b sin dominio")).toEqual([]);
  });

  it("de un texto sin nada de eso no sale nada", () => {
    expect(protegidos("texto corriente")).toEqual([]);
  });
});

describe("seSolapan", () => {
  it("dos rangos se solapan si comparten algún carácter; tocarse por el borde no cuenta", () => {
    expect(seSolapan({ inicio: 0, fin: 3 }, { inicio: 2, fin: 5 })).toBe(true);
    expect(seSolapan({ inicio: 2, fin: 5 }, { inicio: 0, fin: 3 })).toBe(true);
    expect(seSolapan({ inicio: 0, fin: 3 }, { inicio: 3, fin: 5 })).toBe(false);
    expect(seSolapan({ inicio: 3, fin: 5 }, { inicio: 0, fin: 3 })).toBe(false);
  });
});
