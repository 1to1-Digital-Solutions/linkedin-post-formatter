/**
 * The smallest piece that has to be replaced to go from one text to another.
 *
 * The editor applies changes by "typing" them over that piece, which is what keeps the browser's
 * undo (⌘Z) alive; replacing the whole text would wipe it.
 */

export type Replacement = { start: number; end: number; text: string };

const isHigh = (code: number) => code >= 0xd800 && code <= 0xdbff;
const isLow = (code: number) => code >= 0xdc00 && code <= 0xdfff;

export function diff(before: string, after: string): Replacement {
  const limit = Math.min(before.length, after.length);
  let prefix = 0;
  while (prefix < limit && before[prefix] === after[prefix]) prefix++;
  // Styled letters take two UTF-16 units and those of one alphabet share the first one: the cut
  // cannot fall between the two, or half a character would be typed.
  if (prefix > 0 && isHigh(before.charCodeAt(prefix - 1))) prefix--;

  let suffix = 0;
  while (suffix < limit - prefix && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
  if (suffix > 0 && isLow(before.charCodeAt(before.length - suffix))) suffix--;

  return { start: prefix, end: before.length - suffix, text: after.slice(prefix, after.length - suffix) };
}
