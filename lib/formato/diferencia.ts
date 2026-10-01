/**
 * El trozo mínimo que hay que reemplazar para pasar de un texto a otro.
 *
 * El editor aplica los cambios «tecleándolos» sobre ese trozo, que es lo que mantiene vivo el
 * deshacer del navegador (⌘Z); reemplazar el texto entero lo borraría.
 */

export type Reemplazo = { inicio: number; fin: number; texto: string };

const esAlto = (codigo: number) => codigo >= 0xd800 && codigo <= 0xdbff;
const esBajo = (codigo: number) => codigo >= 0xdc00 && codigo <= 0xdfff;

export function diferencia(antes: string, despues: string): Reemplazo {
  const tope = Math.min(antes.length, despues.length);
  let prefijo = 0;
  while (prefijo < tope && antes[prefijo] === despues[prefijo]) prefijo++;
  // Las letras con estilo ocupan dos unidades UTF-16 y las de un mismo alfabeto comparten la
  // primera: el corte no puede caer entre las dos, o se teclearía medio carácter.
  if (prefijo > 0 && esAlto(antes.charCodeAt(prefijo - 1))) prefijo--;

  let sufijo = 0;
  while (sufijo < tope - prefijo && antes[antes.length - 1 - sufijo] === despues[despues.length - 1 - sufijo]) sufijo++;
  if (sufijo > 0 && esBajo(antes.charCodeAt(antes.length - sufijo))) sufijo--;

  return { inicio: prefijo, fin: antes.length - sufijo, texto: despues.slice(prefijo, despues.length - sufijo) };
}
