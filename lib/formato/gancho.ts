/**
 * El gancho: lo que se ve de un post en el feed antes del «…más».
 *
 * LinkedIn corta por caracteres o por líneas, lo que llegue antes, y el corte cambia con el
 * dispositivo, el ancho de la ventana y la versión de la app. Los valores de aquí son los que
 * se repiten en las guías y en los contadores de otras herramientas; son una aproximación, no
 * una promesa.
 */

import { descomponer } from "./glifos";

export type Dispositivo = "escritorio" | "movil";

export const CORTES: Record<Dispositivo, { caracteres: number; lineas: number }> = {
  escritorio: { caracteres: 210, lineas: 5 },
  movil: { caracteres: 140, lineas: 3 },
};

export type Gancho = {
  /** Lo que queda a la vista, sin los espacios del final. */
  visible: string;
  /** Si hay texto detrás del «…más». */
  recortado: boolean;
};

export function gancho(texto: string, dispositivo: Dispositivo): Gancho {
  const { caracteres, lineas } = CORTES[dispositivo];
  // Se cuenta en unidades UTF-16, como el tope del post, pero el corte no parte ninguna letra:
  // ni un carácter de dos unidades ni una letra de su tilde.
  let corte = 0;
  let saltos = 0;
  for (const glifo of descomponer(texto)) {
    if (glifo.base === "\n") saltos++;
    if (glifo.fin > caracteres || saltos >= lineas) break;
    corte = glifo.fin;
  }
  const visible = texto.slice(0, corte).trimEnd();
  return { visible, recortado: texto.slice(corte).trim() !== "" };
}
