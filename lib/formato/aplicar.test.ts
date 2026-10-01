import { describe, expect, it } from "vitest";

import { cursiva, mono, negrita, negritaCursiva, subrayado, tachado } from "@/test/alfabetos";

import { alternar, estilizar, estilosActivos, quitarFormato } from "./aplicar";

const OPCIONES = { tildes: true };

/** La selección de un trozo del texto, como la daría el `<textarea>`. */
function seleccionDe(texto: string, trozo: string) {
  const inicio = texto.indexOf(trozo);
  return { inicio, fin: inicio + trozo.length };
}

const cursorEn = (posicion: number) => ({ inicio: posicion, fin: posicion });

describe("alternar", () => {
  it("pone en negrita la palabra seleccionada y la deja seleccionada", () => {
    const texto = "hola mundo cruel";
    const cambio = alternar(texto, seleccionDe(texto, "mundo"), "negrita", OPCIONES);
    expect(cambio.texto).toBe(`hola ${negrita("mundo")} cruel`);
    expect(cambio.texto.slice(cambio.seleccion.inicio, cambio.seleccion.fin)).toBe(negrita("mundo"));
    expect(cambio.cambiado).toBe(true);
  });

  it("la segunda vez sobre lo mismo, lo quita", () => {
    const texto = "hola mundo";
    const ida = alternar(texto, seleccionDe(texto, "mundo"), "negrita", OPCIONES);
    const vuelta = alternar(ida.texto, ida.seleccion, "negrita", OPCIONES);
    expect(vuelta.texto).toBe(texto);
    expect(vuelta.seleccion).toEqual(seleccionDe(texto, "mundo"));
  });

  it("si solo parte de la selección lleva el estilo, se lo da a toda", () => {
    const texto = `${negrita("hola")} mundo`;
    const cambio = alternar(texto, { inicio: 0, fin: texto.length }, "negrita", OPCIONES);
    expect(cambio.texto).toBe(`${negrita("hola")} ${negrita("mundo")}`);
  });

  it("suma estilos: cursiva sobre negrita es negrita cursiva, y quitar una deja la otra", () => {
    const texto = negrita("hola");
    const todo = { inicio: 0, fin: texto.length };
    const sumado = alternar(texto, todo, "cursiva", OPCIONES);
    expect(sumado.texto).toBe(negritaCursiva("hola"));
    expect(alternar(sumado.texto, sumado.seleccion, "negrita", OPCIONES).texto).toBe(cursiva("hola"));
  });

  it("al decidir si quita la cursiva no cuentan las cifras, que no pueden llevarla", () => {
    const texto = `${cursiva("post")} 2026`;
    const cambio = alternar(texto, { inicio: 0, fin: texto.length }, "cursiva", OPCIONES);
    expect(cambio.texto).toBe("post 2026");
  });

  it("tacha y subraya carácter a carácter, espacios incluidos, y lo deshace", () => {
    const texto = "ya no vale";
    const todo = { inicio: 0, fin: texto.length };
    const tachadoEntero = alternar(texto, todo, "tachado", OPCIONES);
    expect(tachadoEntero.texto).toBe(tachado("ya no vale"));
    expect(alternar(tachadoEntero.texto, tachadoEntero.seleccion, "tachado", OPCIONES).texto).toBe(texto);
    expect(alternar(texto, todo, "subrayado", OPCIONES).texto).toBe(subrayado("ya no vale"));
  });

  it("no tacha los espacios de los bordes de la selección", () => {
    const texto = "hola mundo cruel";
    const cambio = alternar(texto, seleccionDe(texto, " mundo "), "tachado", OPCIONES);
    expect(cambio.texto).toBe(`hola ${tachado("mundo")} cruel`);
    expect(cambio.texto.slice(cambio.seleccion.inicio, cambio.seleccion.fin)).toBe(tachado("mundo"));
  });

  it("con el cursor suelto actúa sobre la palabra que toca y deja el cursor detrás", () => {
    const texto = "hola mundo cruel";
    for (const posicion of [5, 7, 10]) {
      const cambio = alternar(texto, cursorEn(posicion), "negrita", OPCIONES);
      expect(cambio.texto).toBe(`hola ${negrita("mundo")} cruel`);
      expect(cambio.seleccion).toEqual(cursorEn(5 + negrita("mundo").length));
    }
  });

  it("con el cursor suelto al final del texto toma la última palabra", () => {
    expect(alternar("hola", cursorEn(4), "negrita", OPCIONES).texto).toBe(negrita("hola"));
  });

  it("con el cursor suelto en una palabra con tilde y estilo, la reconoce entera", () => {
    const texto = alternar("un camión", seleccionDe("un camión", "camión"), "negrita", OPCIONES).texto;
    const cambio = alternar(texto, cursorEn(texto.length - 1), "negrita", OPCIONES);
    expect(cambio.texto).toBe("un camión");
  });

  it("no cambia nada si el cursor no toca ninguna palabra", () => {
    const texto = "hola ,  mundo";
    const cambio = alternar(texto, cursorEn(7), "negrita", OPCIONES);
    expect(cambio).toEqual({ texto, seleccion: cursorEn(7), cambiado: false });
  });

  it("no cambia nada si en la selección no hay a qué darle ese estilo", () => {
    const texto = "¿¡ 2026 !?";
    const todo = { inicio: 0, fin: texto.length };
    expect(alternar(texto, todo, "cursiva", OPCIONES)).toEqual({ texto, seleccion: todo, cambiado: false });
    expect(alternar("", cursorEn(0), "negrita", OPCIONES).cambiado).toBe(false);
  });

  it("no cambia nada con una selección que cae fuera del texto", () => {
    expect(alternar("ab", { inicio: 5, fin: 9 }, "negrita", OPCIONES).cambiado).toBe(false);
  });

  it("deja sin formato los enlaces, correos, hashtags y menciones", () => {
    const texto = "mira https://1to1digital.solutions/a_b y www.x.com #claude @Cesar o cesar@x.com ya";
    const cambio = alternar(texto, { inicio: 0, fin: texto.length }, "negrita", OPCIONES);
    expect(cambio.texto).toBe(
      `${negrita("mira")} https://1to1digital.solutions/a_b ${negrita("y")} www.x.com #claude @Cesar ${negrita("o")} cesar@x.com ${negrita("ya")}`,
    );
  });

  it("tampoco los tacha, y avisa de que no ha cambiado nada si solo había eso", () => {
    const texto = "#claude";
    const todo = { inicio: 0, fin: texto.length };
    expect(alternar(texto, todo, "tachado", OPCIONES)).toEqual({ texto, seleccion: todo, cambiado: false });
  });

  it("una almohadilla en medio de una palabra no es un hashtag", () => {
    expect(alternar("C#sharp", { inicio: 0, fin: 7 }, "negrita", OPCIONES).texto).toBe(`${negrita("C")}#${negrita("sharp")}`);
  });

  it("respeta la opción de dejar las tildes sin estilo", () => {
    const cambio = alternar("camión", { inicio: 0, fin: 6 }, "negrita", { tildes: false });
    expect(cambio.texto).toBe(`${negrita("cami")}ó${negrita("n")}`);
    // Y aun así entiende que la palabra ya está en negrita: la segunda vez la quita.
    expect(alternar(cambio.texto, cambio.seleccion, "negrita", { tildes: false }).texto).toBe("camión");
  });

  it("una selección que parte un carácter con estilo lo toma entero", () => {
    const texto = negrita("ab");
    // Cada letra ocupa dos unidades: de 1 a 3 corta las dos por la mitad.
    expect(alternar(texto, { inicio: 1, fin: 3 }, "negrita", OPCIONES).texto).toBe("ab");
  });
});

describe("quitarFormato", () => {
  it("deja la selección en texto corriente, con cualquier mezcla de estilos", () => {
    const texto = `${negritaCursiva("uno")} ${tachado(mono("dos"))} ${subrayado("tres")} cuatro`;
    const cambio = quitarFormato(texto, { inicio: 0, fin: texto.length });
    expect(cambio.texto).toBe("uno dos tres cuatro");
    expect(cambio.seleccion).toEqual({ inicio: 0, fin: "uno dos tres cuatro".length });
    expect(cambio.cambiado).toBe(true);
  });

  it("solo toca lo seleccionado", () => {
    const texto = `${negrita("uno")} ${negrita("dos")}`;
    const cambio = quitarFormato(texto, seleccionDe(texto, negrita("dos")));
    expect(cambio.texto).toBe(`${negrita("uno")} dos`);
  });

  it("también limpia hashtags y enlaces que llegaron con formato", () => {
    const texto = `#${negrita("claude")}`;
    expect(quitarFormato(texto, { inicio: 0, fin: texto.length }).texto).toBe("#claude");
  });

  it("con el cursor suelto limpia la palabra que toca", () => {
    const texto = `${negrita("uno")} ${negrita("dos")}`;
    expect(quitarFormato(texto, cursorEn(2)).texto).toBe(`uno ${negrita("dos")}`);
  });

  it("avisa de que no ha cambiado nada si ya era texto corriente", () => {
    const todo = { inicio: 0, fin: 10 };
    expect(quitarFormato("hola mundo", todo)).toEqual({ texto: "hola mundo", seleccion: todo, cambiado: false });
  });
});

describe("estilosActivos", () => {
  const NINGUNO = { negrita: false, cursiva: false, mono: false, tachado: false, subrayado: false };

  it("dice qué estilos lleva la selección entera", () => {
    const texto = `${tachado(negritaCursiva("hola"))} mundo`;
    expect(estilosActivos(texto, seleccionDe(texto, tachado(negritaCursiva("hola"))), OPCIONES)).toEqual({
      ...NINGUNO,
      negrita: true,
      cursiva: true,
      tachado: true,
    });
    expect(estilosActivos(mono("hola"), { inicio: 0, fin: 8 }, OPCIONES)).toEqual({ ...NINGUNO, mono: true });
    expect(estilosActivos(subrayado("hola"), { inicio: 0, fin: 8 }, OPCIONES)).toEqual({ ...NINGUNO, subrayado: true });
  });

  it("un estilo a medias no cuenta como activo", () => {
    const texto = `${negrita("hola")} mundo`;
    expect(estilosActivos(texto, { inicio: 0, fin: texto.length }, OPCIONES)).toEqual(NINGUNO);
  });

  it("con el cursor suelto mira la palabra que toca", () => {
    const texto = `hola ${negrita("mundo")}`;
    expect(estilosActivos(texto, cursorEn(texto.length), OPCIONES).negrita).toBe(true);
    expect(estilosActivos(texto, cursorEn(2), OPCIONES).negrita).toBe(false);
  });

  it("sin nada a lo que dar estilo, ninguno está activo", () => {
    expect(estilosActivos("", cursorEn(0), OPCIONES)).toEqual(NINGUNO);
    expect(estilosActivos("#claude", { inicio: 0, fin: 7 }, OPCIONES)).toEqual(NINGUNO);
  });
});

describe("estilizar", () => {
  it("da los estilos a todo el texto, sin alternar", () => {
    expect(estilizar(`${negrita("ya")} está`, ["negrita"], OPCIONES)).toBe(`${negrita("ya")} ${negrita("est")}${negrita("a")}́`);
    expect(estilizar("hola", ["cursiva", "negrita", "tachado"], OPCIONES)).toBe(tachado(negritaCursiva("hola")));
  });

  it("si entre los estilos está el monoespaciado, gana a la negrita y la cursiva", () => {
    expect(estilizar("npm", ["mono", "negrita", "cursiva"], OPCIONES)).toBe(mono("npm"));
  });

  it("sin estilos devuelve el texto tal cual", () => {
    expect(estilizar("hola", [], OPCIONES)).toBe("hola");
  });

  it("tampoco da formato a enlaces ni hashtags", () => {
    expect(estilizar("ver #claude", ["negrita"], OPCIONES)).toBe(`${negrita("ver")} #claude`);
  });
});
