/**
 * Las letras con estilo, escritas aquí a partir de la tabla de Unicode y no de `lib/`: si el
 * código se equivoca de alfabeto, estos tests no se equivocan con él.
 */

type Alfabeto = { mayusculas: number; minusculas: number; cifras?: number };

const ALFABETOS = {
  negrita: { mayusculas: 0x1d5d4, minusculas: 0x1d5ee, cifras: 0x1d7ec }, // SANS-SERIF BOLD
  cursiva: { mayusculas: 0x1d608, minusculas: 0x1d622 }, // SANS-SERIF ITALIC
  negritaCursiva: { mayusculas: 0x1d63c, minusculas: 0x1d656 }, // SANS-SERIF BOLD ITALIC
  mono: { mayusculas: 0x1d670, minusculas: 0x1d68a, cifras: 0x1d7f6 }, // MONOSPACE
} satisfies Record<string, Alfabeto>;

function con(alfabeto: Alfabeto, texto: string): string {
  return texto
    .replace(/[A-Z]/g, (l) => String.fromCodePoint(alfabeto.mayusculas + l.charCodeAt(0) - 65))
    .replace(/[a-z]/g, (l) => String.fromCodePoint(alfabeto.minusculas + l.charCodeAt(0) - 97))
    .replace(/[0-9]/g, (c) => (alfabeto.cifras ? String.fromCodePoint(alfabeto.cifras + Number(c)) : c));
}

export const negrita = (texto: string) => con(ALFABETOS.negrita, texto);
export const cursiva = (texto: string) => con(ALFABETOS.cursiva, texto);
export const negritaCursiva = (texto: string) => con(ALFABETOS.negritaCursiva, texto);
export const mono = (texto: string) => con(ALFABETOS.mono, texto);

export const TACHADO = "̶";
export const SUBRAYADO = "̲";
export const tachado = (texto: string) => Array.from(texto, (c) => c + TACHADO).join("");
export const subrayado = (texto: string) => Array.from(texto, (c) => c + SUBRAYADO).join("");
