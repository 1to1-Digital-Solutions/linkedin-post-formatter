import { diferencia } from "@/lib/formato/diferencia";

/**
 * Deja el `<textarea>` con ese texto «tecleando» solo el trozo que cambia.
 *
 * `execCommand("insertText")` está marcado como obsoleto, pero es la única forma de editar un
 * campo desde código sin perder el deshacer del navegador: dar formato y arrepentirse con ⌘Z es
 * parte de la herramienta. Si el navegador no lo admite, se escribe directamente y se pierde solo
 * eso, el deshacer de ese cambio.
 */
export function escribir(area: HTMLTextAreaElement, nuevo: string): void {
  const { inicio, fin, texto } = diferencia(area.value, nuevo);
  if (inicio === fin && texto === "") return;
  area.focus();
  area.setSelectionRange(inicio, fin);
  const tecleado = texto === "" ? document.execCommand("delete") : document.execCommand("insertText", false, texto);
  if (tecleado) return;
  area.setRangeText(texto, inicio, fin, "end");
  area.dispatchEvent(new Event("input", { bubbles: true }));
}
