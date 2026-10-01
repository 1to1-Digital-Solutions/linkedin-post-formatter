/**
 * Dar y quitar formato sobre una selección del texto, que es lo que hacen los botones y los
 * atajos. Las posiciones son las del `<textarea>` (`selectionStart`/`selectionEnd`).
 *
 * Sin nada seleccionado, se actúa sobre la palabra en la que está el cursor.
 */

import { admite, componer, descomponer, limpiar, poner, type Estilo, type Glifo, type Opciones } from "./glifos";
import { protegidos, seSolapan, type Rango } from "./protegidos";

export type Cambio = {
  texto: string;
  seleccion: Rango;
  /** `false` si no había nada a lo que dar ese estilo: el texto y la selección vuelven igual. */
  cambiado: boolean;
};

export const ESTILOS: Estilo[] = ["negrita", "cursiva", "tachado", "subrayado", "mono"];

const DE_PALABRA = /[\p{L}\p{N}]/u;
const ESPACIO = /\s/;

/** Los glifos de la palabra que toca el cursor, como tramo `[desde, hasta)` de la lista. */
function palabraEn(glifos: Glifo[], cursor: number): [number, number] {
  const siguiente = glifos.findIndex((g) => g.fin > cursor);
  let hasta = siguiente === -1 ? glifos.length : siguiente;
  let desde = hasta;
  while (desde > 0 && DE_PALABRA.test((glifos[desde - 1] as Glifo).base)) desde--;
  while (hasta < glifos.length && DE_PALABRA.test((glifos[hasta] as Glifo).base)) hasta++;
  return [desde, hasta];
}

/**
 * Los glifos que cubre la selección, sin los espacios de los bordes: el doble clic de algunos
 * sistemas se lleva el espacio de detrás de la palabra, y tachado se nota.
 */
function tramoElegido(glifos: Glifo[], seleccion: Rango): [number, number] {
  if (seleccion.inicio === seleccion.fin) return palabraEn(glifos, seleccion.inicio);
  let desde = glifos.findIndex((g) => g.fin > seleccion.inicio);
  let hasta = glifos.findLastIndex((g) => g.inicio < seleccion.fin) + 1;
  if (desde === -1) desde = hasta;
  while (desde < hasta && ESPACIO.test((glifos[desde] as Glifo).base)) desde++;
  while (hasta > desde && ESPACIO.test((glifos[hasta - 1] as Glifo).base)) hasta--;
  return [desde, hasta];
}

function candidatos(glifos: Glifo[], texto: string, estilo: Estilo, opciones: Opciones): Glifo[] {
  const rangos = protegidos(texto);
  return glifos.filter((g) => admite(g, estilo, opciones) && !rangos.some((r) => seSolapan(g, r)));
}

function recomponer(glifos: Glifo[], [desde, hasta]: [number, number], seleccion: Rango): Cambio {
  const inicio = componer(glifos.slice(0, desde)).length;
  const fin = inicio + componer(glifos.slice(desde, hasta)).length;
  // Con el cursor suelto en una palabra, se queda detrás de ella en vez de seleccionarla: lo
  // siguiente que se teclee no debe borrarla.
  const suelto = seleccion.inicio === seleccion.fin;
  return { texto: componer(glifos), seleccion: { inicio: suelto ? fin : inicio, fin }, cambiado: true };
}

/** Da el estilo a la selección o, si ya lo lleva entera, se lo quita. */
export function alternar(texto: string, seleccion: Rango, estilo: Estilo, opciones: Opciones): Cambio {
  const glifos = descomponer(texto);
  const tramo = tramoElegido(glifos, seleccion);
  const elegidos = candidatos(glifos.slice(...tramo), texto, estilo, opciones);
  if (elegidos.length === 0) return { texto, seleccion, cambiado: false };
  const activar = !elegidos.every((g) => g[estilo]);
  for (const glifo of elegidos) poner(glifo, estilo, activar);
  return recomponer(glifos, tramo, seleccion);
}

/** Devuelve la selección a texto corriente, también el que venía con formato de otra herramienta. */
export function quitarFormato(texto: string, seleccion: Rango): Cambio {
  const glifos = descomponer(texto);
  const tramo = tramoElegido(glifos, seleccion);
  glifos.slice(...tramo).forEach(limpiar);
  const cambio = recomponer(glifos, tramo, seleccion);
  return cambio.texto === texto ? { texto, seleccion, cambiado: false } : cambio;
}

/** Qué estilos lleva ya la selección entera: es lo que marca los botones como pulsados. */
export function estilosActivos(texto: string, seleccion: Rango, opciones: Opciones): Record<Estilo, boolean> {
  const glifos = descomponer(texto);
  const elegidos = glifos.slice(...tramoElegido(glifos, seleccion));
  const activo = (estilo: Estilo) => {
    const posibles = candidatos(elegidos, texto, estilo, opciones);
    return posibles.length > 0 && posibles.every((g) => g[estilo]);
  };
  return {
    negrita: activo("negrita"),
    cursiva: activo("cursiva"),
    mono: activo("mono"),
    tachado: activo("tachado"),
    subrayado: activo("subrayado"),
  };
}

/** Da esos estilos a todo el texto, sin alternar: lo usa la conversión desde Markdown. */
export function estilizar(texto: string, estilos: Estilo[], opciones: Opciones): string {
  if (estilos.length === 0) return texto;
  const glifos = descomponer(texto);
  // En el orden de `ESTILOS`, con el monoespaciado al final: `**`código`**` se queda en código.
  for (const estilo of ESTILOS.filter((e) => estilos.includes(e))) {
    for (const glifo of candidatos(glifos, texto, estilo, opciones)) poner(glifo, estilo, true);
  }
  return componer(glifos);
}
