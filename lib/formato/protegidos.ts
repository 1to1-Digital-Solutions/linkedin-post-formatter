/**
 * Lo que nunca lleva formato: enlaces, correos, #hashtags y @menciones. Con letras de otro
 * alfabeto, LinkedIn deja de reconocerlos y se quedan en texto muerto.
 */

export type Rango = { inicio: number; fin: number };

const PROTEGIDO = /https?:\/\/\S+|www\.\S+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|(?<![\p{L}\p{N}_])[#@][\p{L}\p{N}_]+/gu;

export function protegidos(texto: string): Rango[] {
  return Array.from(texto.matchAll(PROTEGIDO), (hallazgo) => ({
    inicio: hallazgo.index,
    fin: hallazgo.index + hallazgo[0].length,
  }));
}

export function seSolapan(a: Rango, b: Rango): boolean {
  return a.inicio < b.fin && a.fin > b.inicio;
}
