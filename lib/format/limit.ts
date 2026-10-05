/**
 * A LinkedIn post's limit. It is counted in UTF-16 code units, not in characters on screen: every
 * styled letter and almost every emoji counts two, so a post with a lot of bold fills up sooner
 * than it looks.
 */
export const POST_LIMIT = 3000;

export function charactersUsed(text: string): number {
  return text.length;
}
