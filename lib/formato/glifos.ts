/**
 * El texto «con formato» de LinkedIn no lleva formato: LinkedIn solo guarda texto plano. Lo que
 * se ve en negrita son otras letras, las del bloque Unicode de símbolos alfanuméricos matemáticos
 * (U+1D400–U+1D7FF), y el tachado y el subrayado son una marca combinante detrás de cada carácter.
 *
 * Aquí se lee un texto como una lista de glifos —la letra de base y los estilos que lleva— y se
 * vuelve a escribir. Dar o quitar un estilo es cambiar una bandera entre una cosa y la otra.
 *
 * Las tildes y la ñ no tienen gemela en ese bloque. Se escriben como la letra con estilo seguida
 * de la marca combinante de la tilde (`á` → `𝗮` + U+0301), que es lo que hace que una palabra
 * acentuada no se quede a medias.
 */

export type Estilo = "negrita" | "cursiva" | "mono" | "tachado" | "subrayado";

export type Opciones = {
  /** Dar estilo también a las letras con tilde, diéresis o virgulilla (con la marca combinante). */
  tildes: boolean;
};

export type Glifo = {
  /** El carácter sin estilo: `a` para `𝗮`, y también para `á` (la tilde va en `marcas`). */
  base: string;
  /** Las marcas combinantes que no son ni el tachado ni el subrayado: tildes, selectores de emoji. */
  marcas: string;
  negrita: boolean;
  cursiva: boolean;
  mono: boolean;
  tachado: boolean;
  subrayado: boolean;
  /** Dónde está en el texto de origen, en unidades UTF-16 (las de `selectionStart`). */
  inicio: number;
  fin: number;
};

const TACHADO = "̶";
const SUBRAYADO = "̲";

/**
 * Los tramos del bloque matemático que se usan, todos de palo seco: son los que mejor se leen en
 * el feed y no tienen huecos (en los de serifa faltan letras, como la `h` cursiva). No hay cifras
 * en cursiva, así que las cifras solo pueden ir en negrita o monoespaciadas.
 */
const ALFABETOS = [
  { negrita: true, cursiva: false, mono: false, mayusculas: 0x1d5d4, minusculas: 0x1d5ee, cifras: 0x1d7ec },
  { negrita: false, cursiva: true, mono: false, mayusculas: 0x1d608, minusculas: 0x1d622, cifras: null },
  { negrita: true, cursiva: true, mono: false, mayusculas: 0x1d63c, minusculas: 0x1d656, cifras: null },
  { negrita: false, cursiva: false, mono: true, mayusculas: 0x1d670, minusculas: 0x1d68a, cifras: 0x1d7f6 },
];

type Tramo = { negrita: boolean; cursiva: boolean; mono: boolean; desde: number; largo: number; ascii: number };

const TRAMOS: Tramo[] = ALFABETOS.flatMap(({ mayusculas, minusculas, cifras, ...estilos }) => [
  { ...estilos, desde: mayusculas, largo: 26, ascii: 0x41 },
  { ...estilos, desde: minusculas, largo: 26, ascii: 0x61 },
  ...(cifras === null ? [] : [{ ...estilos, desde: cifras, largo: 10, ascii: 0x30 }]),
]);

const MARCA = /^\p{M}$/u;
const LETRA = /^[A-Za-z]$/;
const LETRA_O_CIFRA = /^[A-Za-z0-9]$/;
/** Con estas marcas el glifo es un emoji (`1️⃣`, `❤️`): cambiarle la base lo rompería. */
const MARCA_DE_EMOJI = /[️⃣]/;
/** Lo que una raya combinante estropea: los saltos de línea y las piezas de un emoji. */
const SIN_RAYA = /[\n\r‍\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}]/u;

const SIN_ESTILO = { negrita: false, cursiva: false, mono: false, tachado: false, subrayado: false };

function nuevoGlifo(caracter: string, inicio: number, fin: number): Glifo {
  const codigo = caracter.codePointAt(0) as number;
  const tramo = TRAMOS.find((t) => codigo >= t.desde && codigo < t.desde + t.largo);
  if (tramo) {
    const { negrita, cursiva, mono } = tramo;
    const base = String.fromCharCode(tramo.ascii + codigo - tramo.desde);
    return { ...SIN_ESTILO, base, marcas: "", negrita, cursiva, mono, inicio, fin };
  }
  // `á` es `a` más su tilde: se separan para que la letra pueda cambiar de alfabeto.
  const descompuesto = caracter.normalize("NFD");
  const letra = descompuesto.charAt(0);
  if (descompuesto.length > 1 && LETRA.test(letra)) {
    return { ...SIN_ESTILO, base: letra, marcas: descompuesto.slice(1), inicio, fin };
  }
  return { ...SIN_ESTILO, base: caracter, marcas: "", inicio, fin };
}

function anexarMarca(glifo: Glifo, marca: string, fin: number): void {
  if (marca === TACHADO) glifo.tachado = true;
  else if (marca === SUBRAYADO) glifo.subrayado = true;
  else glifo.marcas += marca;
  glifo.fin = fin;
}

export function descomponer(texto: string): Glifo[] {
  const glifos: Glifo[] = [];
  let posicion = 0;
  for (const caracter of texto) {
    const fin = posicion + caracter.length;
    const anterior = glifos.at(-1);
    if (anterior && MARCA.test(caracter)) anexarMarca(anterior, caracter, fin);
    else glifos.push(nuevoGlifo(caracter, posicion, fin));
    posicion = fin;
  }
  return glifos;
}

function letraConEstilo(glifo: Glifo): string {
  const codigo = glifo.base.charCodeAt(0);
  const tramo = TRAMOS.find(
    (t) =>
      t.negrita === glifo.negrita &&
      t.cursiva === glifo.cursiva &&
      t.mono === glifo.mono &&
      codigo >= t.ascii &&
      codigo < t.ascii + t.largo,
  );
  return tramo ? String.fromCodePoint(tramo.desde + codigo - tramo.ascii) : glifo.base;
}

function escribir(glifo: Glifo): string {
  const letra = letraConEstilo(glifo);
  // Sin estilo, la letra y su tilde vuelven a ser un solo carácter (`á`), como se teclea.
  const cuerpo = letra === glifo.base && LETRA.test(glifo.base) ? (glifo.base + glifo.marcas).normalize("NFC") : letra + glifo.marcas;
  return cuerpo + (glifo.subrayado ? SUBRAYADO : "") + (glifo.tachado ? TACHADO : "");
}

export function componer(glifos: Glifo[]): string {
  return glifos.map(escribir).join("");
}

/** Si a ese glifo se le puede dar ese estilo sin estropearlo. */
export function admite(glifo: Glifo, estilo: Estilo, opciones: Opciones): boolean {
  if (MARCA_DE_EMOJI.test(glifo.marcas)) return false;
  if (estilo === "tachado" || estilo === "subrayado") return !SIN_RAYA.test(glifo.base);
  if (glifo.marcas !== "" && !opciones.tildes) return false;
  return (estilo === "cursiva" ? LETRA : LETRA_O_CIFRA).test(glifo.base);
}

/** Pone o quita un estilo. El monoespaciado no tiene negrita ni cursiva: uno desplaza a los otros. */
export function poner(glifo: Glifo, estilo: Estilo, activo: boolean): void {
  glifo[estilo] = activo;
  if (!activo) return;
  if (estilo === "mono") {
    glifo.negrita = false;
    glifo.cursiva = false;
  }
  if (estilo === "negrita" || estilo === "cursiva") glifo.mono = false;
}

const MATEMATICO = /[\u{1D400}-\u{1D7FF}]/u;

/**
 * Deja el glifo sin ningún estilo. Las letras de los alfabetos que aquí no se usan (serifa,
 * caligráfica, gótica…, que llegan al pegar texto de otras herramientas) vuelven a la letra
 * corriente con la normalización de compatibilidad de Unicode.
 */
export function limpiar(glifo: Glifo): void {
  Object.assign(glifo, SIN_ESTILO);
  if (MATEMATICO.test(glifo.base)) glifo.base = glifo.base.normalize("NFKC");
}
