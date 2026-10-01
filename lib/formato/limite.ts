/**
 * El tope de un post de LinkedIn. Se cuenta en unidades UTF-16, no en caracteres a la vista: cada
 * letra con estilo y casi todos los emojis valen dos, así que un post con mucha negrita se llena
 * antes de lo que parece.
 */
export const LIMITE_DEL_POST = 3000;

export function caracteresUsados(texto: string): number {
  return texto.length;
}
