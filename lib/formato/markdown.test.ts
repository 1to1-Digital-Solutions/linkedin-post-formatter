import { describe, expect, it } from "vitest";

import { cursiva, mono, negrita, negritaCursiva, tachado } from "@/test/alfabetos";

import { markdownAUnicode } from "./markdown";

const convertir = (markdown: string) => markdownAUnicode(markdown, { tildes: true });

describe("markdownAUnicode: formato dentro de la línea", () => {
  it("convierte la negrita, con asteriscos o con guiones bajos", () => {
    expect(convertir("esto es **muy importante** hoy")).toBe(`esto es ${negrita("muy importante")} hoy`);
    expect(convertir("esto es __importante__ hoy")).toBe(`esto es ${negrita("importante")} hoy`);
  });

  it("convierte la cursiva, con asterisco o con guion bajo", () => {
    expect(convertir("una *idea* y _otra idea_")).toBe(`una ${cursiva("idea")} y ${cursiva("otra idea")}`);
  });

  it("convierte la negrita cursiva y los estilos anidados", () => {
    expect(convertir("***todo***")).toBe(negritaCursiva("todo"));
    expect(convertir("**fuerte *y fino* a la vez**")).toBe(`${negrita("fuerte")} ${negritaCursiva("y fino")} ${negrita("a la vez")}`);
    expect(convertir("*fino **y fuerte** a la vez*")).toBe(`${cursiva("fino")} ${negritaCursiva("y fuerte")} ${cursiva("a la vez")}`);
    expect(convertir("**fuerte *y fino***")).toBe(`${negrita("fuerte")} ${negritaCursiva("y fino")}`);
  });

  it("convierte el tachado, también combinado", () => {
    expect(convertir("~~antes~~ ahora")).toBe(`${tachado("antes")} ahora`);
    expect(convertir("~~**ya no**~~")).toBe(tachado(negrita("ya no")));
  });

  it("convierte el código a monoespaciado sin leer formato dentro", () => {
    expect(convertir("usa `/help` y `a*b*c`")).toBe(`usa /${mono("help")} y ${mono("a")}*${mono("b")}*${mono("c")}`);
    expect(convertir("**el comando `npm`**")).toBe(`${negrita("el comando")} ${mono("npm")}`);
  });

  it("varias marcas en la misma línea, cada una con lo suyo", () => {
    expect(convertir("**a** y **b**, *c* y *d*")).toBe(`${negrita("a")} y ${negrita("b")}, ${cursiva("c")} y ${cursiva("d")}`);
  });

  it("escribe las tildes y la ñ con estilo", () => {
    expect(convertir("**año**")).toBe(`${negrita("a")}${negrita("n")}̃${negrita("o")}`);
    expect(markdownAUnicode("**año**", { tildes: false })).toBe(`${negrita("a")}ñ${negrita("o")}`);
  });

  it("no confunde con formato los asteriscos y guiones bajos sueltos", () => {
    expect(convertir("2 * 3 * 4 = 24")).toBe("2 * 3 * 4 = 24");
    expect(convertir("la variable mi_nombre_largo y otra__con__dos")).toBe("la variable mi_nombre_largo y otra__con__dos");
    expect(convertir("un * suelto y ** otro")).toBe("un * suelto y ** otro");
  });

  it("una barra invertida deja el signo literal", () => {
    expect(convertir("\\*sin cursiva\\* y \\_tampoco\\_")).toBe("*sin cursiva* y _tampoco_");
    expect(convertir("**2 \\* 3**")).toBe(`${negrita("2")} * ${negrita("3")}`);
  });

  it("escribe los enlaces como texto y dirección, porque LinkedIn solo enlaza la dirección", () => {
    expect(convertir("mira [mi web](https://1to1digital.solutions) hoy")).toBe("mira mi web (https://1to1digital.solutions) hoy");
    expect(convertir("[**mi web**](https://x.com/a_b_c)")).toBe(`${negrita("mi web")} (https://x.com/a_b_c)`);
    expect(convertir("[https://x.com](https://x.com)")).toBe("https://x.com");
  });

  it("no toca las direcciones sueltas, las imágenes, ni los hashtags aunque vayan en negrita", () => {
    expect(convertir("ver https://x.com/_perfil_/*a* y www.x.com/_b_")).toBe("ver https://x.com/_perfil_/*a* y www.x.com/_b_");
    expect(convertir("![captura](https://x.com/a.png)")).toBe("![captura](https://x.com/a.png)");
    expect(convertir("**sobre #claude y https://x.com**")).toBe(`${negrita("sobre")} #claude ${negrita("y")} https://x.com`);
  });
});

describe("markdownAUnicode: líneas", () => {
  it("pone los títulos en negrita, sin las almohadillas", () => {
    expect(convertir("# Lo que aprendí")).toBe(`${negrita("Lo que aprend")}${negrita("i")}́`);
    expect(convertir("### Con *cursiva* dentro ##")).toBe(`${negrita("Con")} ${negritaCursiva("cursiva")} ${negrita("dentro")}`);
  });

  it("un hashtag al principio de la línea no es un título", () => {
    expect(convertir("#claude es un hashtag")).toBe("#claude es un hashtag");
  });

  it("cambia las viñetas por puntos, con su sangría y su formato", () => {
    expect(convertir("- uno\n* dos\n+ **tres**\n  - anidado")).toBe(`• uno\n• dos\n• ${negrita("tres")}\n  • anidado`);
  });

  it("deja como están las listas numeradas, las citas y las reglas", () => {
    expect(convertir("1. primero\n2. segundo\n> una cita\n---")).toBe("1. primero\n2. segundo\n> una cita\n---");
  });

  it("respeta todos los saltos de línea y unifica los de Windows", () => {
    expect(convertir("uno\n\n\ndos\r\ntres\rcuatro")).toBe("uno\n\n\ndos\ntres\ncuatro");
  });

  it("un bloque de código va literal y sin las vallas", () => {
    expect(convertir("antes\n```ts\nconst a = **b**;\n```\n**después**")).toBe(`antes\nconst a = **b**;\n${negrita("despu")}${negrita("e")}́${negrita("s")}`);
    expect(convertir("~~~\n- no es viñeta\n~~~")).toBe("- no es viñeta");
  });

  it("el formato no salta de una línea a otra", () => {
    expect(convertir("**abre\ncierra**")).toBe("**abre\ncierra**");
  });

  it("un texto sin Markdown sale igual, y uno vacío también", () => {
    expect(convertir("Hola, ¿qué tal? Todo bien.")).toBe("Hola, ¿qué tal? Todo bien.");
    expect(convertir("")).toBe("");
  });
});
