/**
 * Adding and removing styles on a selection of the text, which is what the buttons and the
 * shortcuts do. Positions are the `<textarea>` ones (`selectionStart`/`selectionEnd`).
 *
 * With nothing selected, the word under the caret is used.
 */

import { accepts, compose, decompose, set, type Glyph, type Options, type Style } from "./glyphs";
import { overlap, protectedRanges, type Range } from "./protected";

export type Change = {
  text: string;
  selection: Range;
  /** `false` when there was nothing to give that style to: text and selection come back as they were. */
  changed: boolean;
};

export const STYLES: Style[] = ["bold", "italic", "strike", "underline", "mono"];

const WORD_CHARACTER = /[\p{L}\p{N}]/u;
const WHITESPACE = /\s/;

/** The glyphs of the word touching the caret, as a `[from, to)` span of the list. */
function wordAt(glyphs: Glyph[], caret: number): [number, number] {
  const next = glyphs.findIndex((g) => g.end > caret);
  let to = next === -1 ? glyphs.length : next;
  let from = to;
  while (from > 0 && WORD_CHARACTER.test((glyphs[from - 1] as Glyph).base)) from--;
  while (to < glyphs.length && WORD_CHARACTER.test((glyphs[to] as Glyph).base)) to++;
  return [from, to];
}

/**
 * The glyphs the selection covers, without the whitespace at its edges: double-clicking on some
 * systems grabs the space after the word, and strikethrough shows it.
 */
function selectedSpan(glyphs: Glyph[], selection: Range): [number, number] {
  if (selection.start === selection.end) return wordAt(glyphs, selection.start);
  let from = glyphs.findIndex((g) => g.end > selection.start);
  let to = glyphs.findLastIndex((g) => g.start < selection.end) + 1;
  if (from === -1) from = to;
  while (from < to && WHITESPACE.test((glyphs[from] as Glyph).base)) from++;
  while (to > from && WHITESPACE.test((glyphs[to - 1] as Glyph).base)) to--;
  return [from, to];
}

function candidates(glyphs: Glyph[], text: string, style: Style, options: Options): Glyph[] {
  const ranges = protectedRanges(text);
  return glyphs.filter((g) => accepts(g, style, options) && !ranges.some((r) => overlap(g, r)));
}

function recompose(glyphs: Glyph[], [from, to]: [number, number], selection: Range): Change {
  const start = compose(glyphs.slice(0, from)).length;
  const end = start + compose(glyphs.slice(from, to)).length;
  // With a bare caret inside a word, it stays after the word instead of selecting it: whatever
  // is typed next must not delete it.
  const collapsed = selection.start === selection.end;
  return { text: compose(glyphs), selection: { start: collapsed ? end : start, end }, changed: true };
}

/** Gives the selection the style or, if it already carries it entirely, removes it. */
export function toggle(text: string, selection: Range, style: Style, options: Options): Change {
  const glyphs = decompose(text);
  const span = selectedSpan(glyphs, selection);
  const chosen = candidates(glyphs.slice(...span), text, style, options);
  if (chosen.length === 0) return { text, selection, changed: false };
  const on = !chosen.every((g) => g[style]);
  for (const glyph of chosen) set(glyph, style, on);
  return recompose(glyphs, span, selection);
}

/** Which styles the whole selection already carries: what marks the buttons as pressed. */
export function activeStyles(text: string, selection: Range, options: Options): Record<Style, boolean> {
  const glyphs = decompose(text);
  const chosen = glyphs.slice(...selectedSpan(glyphs, selection));
  const active = (style: Style) => {
    const possible = candidates(chosen, text, style, options);
    return possible.length > 0 && possible.every((g) => g[style]);
  };
  return {
    bold: active("bold"),
    italic: active("italic"),
    mono: active("mono"),
    strike: active("strike"),
    underline: active("underline"),
  };
}

/** Gives those styles to the whole text, without toggling: used by the Markdown conversion. */
export function stylize(text: string, styles: Style[], options: Options): string {
  if (styles.length === 0) return text;
  const glyphs = decompose(text);
  // In `STYLES` order, with monospace last: `**`code`**` stays code.
  for (const style of STYLES.filter((s) => styles.includes(s))) {
    for (const glyph of candidates(glyphs, text, style, options)) set(glyph, style, true);
  }
  return compose(glyphs);
}
