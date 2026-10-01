/**
 * De Markdown (el de un borrador de Obsidian) al texto que se pega en LinkedIn.
 *
 * Se convierte lo que tiene equivalente: negrita, cursiva, tachado, código, títulos (en negrita),
 * viñetas (`•`) y enlaces (`texto (url)`, porque LinkedIn solo enlaza la dirección a la vista).
 * Lo demás —citas, tablas, imágenes, listas numeradas— se queda como está escrito. Los saltos de
 * línea se respetan todos: en un post, cada uno es intencionado.
 */

import { estilizar } from "./aplicar";
import type { Estilo, Opciones } from "./glifos";

type Regla = {
  patron: RegExp;
  convertir: (hallazgo: RegExpExecArray, estilos: Estilo[], opciones: Opciones) => string;
};

const grupo = (hallazgo: RegExpExecArray, n: number) => hallazgo[n] as string;

/** Una marca que envuelve texto (`**así**`): lo de dentro se sigue leyendo, con un estilo más. */
function envoltorio(patron: RegExp, estilo: Estilo): Regla {
  return { patron, convertir: (h, estilos, opciones) => enLinea(grupo(h, 1), [...estilos, estilo], opciones) };
}

/**
 * En cada punto de la línea gana la regla que empieza antes y, a igualdad, la que está antes
 * aquí. Los delimitadores exigen texto pegado por dentro (`2 * 3 * 4` no es cursiva) y el guion
 * bajo, además, no estar dentro de una palabra (`snake_case_así` tampoco).
 */
const REGLAS: Regla[] = [
  // Una dirección suelta va tal cual: sus guiones bajos y asteriscos no son formato.
  { patron: /https?:\/\/\S+|www\.\S+/g, convertir: (h) => h[0] },
  { patron: /`([^`\n]+)`/g, convertir: (h, estilos, opciones) => estilizar(grupo(h, 1), [...estilos, "mono"], opciones) },
  { patron: /\\([\\`*_~[\]()#>+\-.!|])/g, convertir: (h, estilos, opciones) => estilizar(grupo(h, 1), estilos, opciones) },
  {
    // Las imágenes (`![alt](url)`) no son un enlace que se pueda escribir: se dejan.
    patron: /(?<!!)\[([^\]\n]+)\]\(([^)\s]+)\)/g,
    convertir: (h, estilos, opciones) => {
      const [texto, url] = [grupo(h, 1), grupo(h, 2)];
      return texto === url ? url : `${enLinea(texto, estilos, opciones)} (${url})`;
    },
  },
  envoltorio(/\*\*(?=\S)(.+?)(?<=\S)\*\*(?!\*)/g, "negrita"),
  envoltorio(/(?<![\p{L}\p{N}_])__(?=\S)(.+?)(?<=\S)__(?![\p{L}\p{N}_])/gu, "negrita"),
  envoltorio(/(?<!\*)\*(?![*\s])(.+?)(?<![\s*])\*(?!\*)/g, "cursiva"),
  envoltorio(/(?<![\p{L}\p{N}_])_(?![_\s])(.+?)(?<![\s_])_(?![\p{L}\p{N}_])/gu, "cursiva"),
  envoltorio(/~~(?=\S)(.+?)(?<=\S)~~/g, "tachado"),
];

type Hallazgo = { regla: Regla; hallazgo: RegExpExecArray };

function primerHallazgo(texto: string, desde: number): Hallazgo | null {
  let primero: Hallazgo | null = null;
  for (const regla of REGLAS) {
    regla.patron.lastIndex = desde;
    const hallazgo = regla.patron.exec(texto);
    if (hallazgo && (primero === null || hallazgo.index < primero.hallazgo.index)) primero = { regla, hallazgo };
  }
  return primero;
}

function enLinea(texto: string, estilos: Estilo[], opciones: Opciones): string {
  let salida = "";
  let posicion = 0;
  for (;;) {
    const primero = primerHallazgo(texto, posicion);
    if (primero === null) return salida + estilizar(texto.slice(posicion), estilos, opciones);
    const { regla, hallazgo } = primero;
    salida += estilizar(texto.slice(posicion, hallazgo.index), estilos, opciones);
    salida += regla.convertir(hallazgo, estilos, opciones);
    posicion = hallazgo.index + hallazgo[0].length;
  }
}

const TITULO = /^#{1,6}\s+(.*?)(?:\s+#+)?\s*$/;
const VINETA = /^(\s*)[-*+]\s+(.*)$/;
const VALLA = /^\s*(?:```|~~~)/;

function convertirLinea(linea: string, opciones: Opciones): string {
  const titulo = TITULO.exec(linea);
  if (titulo) return enLinea(grupo(titulo, 1), ["negrita"], opciones);
  const vineta = VINETA.exec(linea);
  if (vineta) return `${grupo(vineta, 1)}• ${enLinea(grupo(vineta, 2), [], opciones)}`;
  return enLinea(linea, [], opciones);
}

export function markdownAUnicode(markdown: string, opciones: Opciones): string {
  const lineas: string[] = [];
  let enBloqueDeCodigo = false;
  for (const linea of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    if (VALLA.test(linea)) enBloqueDeCodigo = !enBloqueDeCodigo;
    // Dentro de un bloque de código nada es formato: va literal, sin las vallas.
    else lineas.push(enBloqueDeCodigo ? linea : convertirLinea(linea, opciones));
  }
  return lineas.join("\n");
}
