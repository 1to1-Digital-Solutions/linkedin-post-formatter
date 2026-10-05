import { useSyncExternalStore } from "react";

/**
 * El borrador, guardado en el `localStorage` de este navegador para que no se pierda al recargar.
 * No sale de aquí: la herramienta no tiene servidor al que enviarlo.
 */

const CLAVE = "formato-linkedin:borrador";

/** `null` mientras no se ha leído el almacenamiento. */
let borrador: string | null = null;
const oyentes = new Set<() => void>();

function leer(): string {
  if (borrador === null) {
    try {
      borrador = window.localStorage.getItem(CLAVE) ?? "";
    } catch {
      // Con el almacenamiento bloqueado (navegación privada estricta) se trabaja igual, en memoria.
      console.warn("No se puede guardar el borrador en este navegador: se perderá al cerrar la pestaña.");
      borrador = "";
    }
  }
  return borrador;
}

function suscribir(avisar: () => void): () => void {
  oyentes.add(avisar);
  return () => {
    oyentes.delete(avisar);
  };
}

export function guardarBorrador(texto: string): void {
  borrador = texto;
  try {
    window.localStorage.setItem(CLAVE, texto);
  } catch {
    // Mismo caso que al leer, del que ya se avisó: el borrador sigue en memoria.
  }
  for (const avisar of oyentes) avisar();
}

/** El borrador actual. En el servidor y durante la hidratación está vacío. */
export function useBorrador(): string {
  return useSyncExternalStore(suscribir, leer, () => "");
}
