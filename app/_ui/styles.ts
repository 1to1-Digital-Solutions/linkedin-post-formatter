/**
 * Las clases de los elementos que se repiten, en un solo sitio para que se vean igual. Solo usan
 * los tokens de color de `app/globals.css`.
 *
 * Los objetivos táctiles miden 44 px con el dedo (móvil y tableta) y algo menos con ratón
 * (`pointer-fine`), sea cual sea el ancho.
 */

const botonBase =
  "inline-flex min-h-11 items-center justify-center gap-1 rounded-md px-3.5 text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 pointer-fine:min-h-9";

export const boton = `${botonBase} border border-borde-campo bg-superficie text-texto hover:border-acento hover:bg-elevada`;

export const botonPrimario = `${botonBase} bg-primario font-semibold text-sobre-primario hover:bg-primario-hover`;

/**
 * Un botón de la barra de formato. Pulsado (`aria-pressed`) no cambia solo de color: lleva
 * además una barra por debajo.
 */
export const botonDeFormato = `${boton} aria-pressed:border-acento aria-pressed:bg-acento-suave aria-pressed:shadow-[inset_0_-3px_0_var(--acento)]`;

export const seccion = "rounded-lg border border-borde bg-superficie p-4 sm:p-5";

export const tituloSeccion = "mb-3 text-base font-semibold";

export const tenue = "text-tenue";

/** Una casilla con su texto: toda la fila es el objetivo táctil. */
export const casilla = "flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm pointer-fine:min-h-0 pointer-fine:py-1";
