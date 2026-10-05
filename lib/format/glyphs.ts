/**
 * "Formatted" LinkedIn text carries no formatting: LinkedIn stores plain text only. What looks
 * bold is a different set of letters, the ones from the Unicode Mathematical Alphanumeric
 * Symbols block (U+1D400–U+1D7FF); strikethrough and underline are a combining mark after each
 * character.
 *
 * This module reads a text as a list of glyphs (the base letter plus the styles it carries) and
 * writes it back. Adding or removing a style is flipping a flag between the two.
 *
 * Accented letters have no twin in that block. They are written as the styled letter followed by
 * the accent's combining mark (`á` → `𝗮` + U+0301), which is what keeps an accented word from
 * ending up half styled.
 */

export type Style = "bold" | "italic" | "mono" | "strike" | "underline";

export type Options = {
  /** Style accented letters too (with the combining mark), instead of leaving them plain. */
  accents: boolean;
};

export type Glyph = {
  /** The character without style: `a` for `𝗮`, and also for `á` (the accent goes in `marks`). */
  base: string;
  /** Combining marks other than strikethrough and underline: accents, emoji selectors. */
  marks: string;
  bold: boolean;
  italic: boolean;
  mono: boolean;
  strike: boolean;
  underline: boolean;
  /** Position in the source text, in UTF-16 code units (the ones `selectionStart` uses). */
  start: number;
  end: number;
};

const STRIKE = "̶";
const UNDERLINE = "̲";

/**
 * The ranges of the mathematical block in use, all sans-serif: they read best in the feed and
 * have no holes (the serif ones are missing letters, such as the italic `h`). There are no italic
 * digits, so digits can only be bold or monospace.
 */
const ALPHABETS = [
  { bold: true, italic: false, mono: false, upper: 0x1d5d4, lower: 0x1d5ee, digits: 0x1d7ec },
  { bold: false, italic: true, mono: false, upper: 0x1d608, lower: 0x1d622, digits: null },
  { bold: true, italic: true, mono: false, upper: 0x1d63c, lower: 0x1d656, digits: null },
  { bold: false, italic: false, mono: true, upper: 0x1d670, lower: 0x1d68a, digits: 0x1d7f6 },
];

type Range = { bold: boolean; italic: boolean; mono: boolean; from: number; length: number; ascii: number };

const RANGES: Range[] = ALPHABETS.flatMap(({ upper, lower, digits, ...flags }) => [
  { ...flags, from: upper, length: 26, ascii: 0x41 },
  { ...flags, from: lower, length: 26, ascii: 0x61 },
  ...(digits === null ? [] : [{ ...flags, from: digits, length: 10, ascii: 0x30 }]),
]);

const MARK = /^\p{M}$/u;
const LETTER = /^[A-Za-z]$/;
const LETTER_OR_DIGIT = /^[A-Za-z0-9]$/;
/** With these marks the glyph is an emoji (`1️⃣`, `❤️`): changing its base would break it. */
const EMOJI_MARK = /[️⃣]/;
/** What a combining stroke breaks: line breaks and the pieces of an emoji. */
const NO_STROKE = /[\n\r‍\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}]/u;

const PLAIN = { bold: false, italic: false, mono: false, strike: false, underline: false };

function newGlyph(character: string, start: number, end: number): Glyph {
  const code = character.codePointAt(0) as number;
  const range = RANGES.find((r) => code >= r.from && code < r.from + r.length);
  if (range) {
    const { bold, italic, mono } = range;
    const base = String.fromCharCode(range.ascii + code - range.from);
    return { ...PLAIN, base, marks: "", bold, italic, mono, start, end };
  }
  // `á` is `a` plus its accent: split so the letter can change alphabet.
  const decomposed = character.normalize("NFD");
  const letter = decomposed.charAt(0);
  if (decomposed.length > 1 && LETTER.test(letter)) {
    return { ...PLAIN, base: letter, marks: decomposed.slice(1), start, end };
  }
  return { ...PLAIN, base: character, marks: "", start, end };
}

function appendMark(glyph: Glyph, mark: string, end: number): void {
  if (mark === STRIKE) glyph.strike = true;
  else if (mark === UNDERLINE) glyph.underline = true;
  else glyph.marks += mark;
  glyph.end = end;
}

export function decompose(text: string): Glyph[] {
  const glyphs: Glyph[] = [];
  let position = 0;
  for (const character of text) {
    const end = position + character.length;
    const previous = glyphs.at(-1);
    if (previous && MARK.test(character)) appendMark(previous, character, end);
    else glyphs.push(newGlyph(character, position, end));
    position = end;
  }
  return glyphs;
}

function styledLetter(glyph: Glyph): string {
  const code = glyph.base.charCodeAt(0);
  const range = RANGES.find(
    (r) =>
      r.bold === glyph.bold &&
      r.italic === glyph.italic &&
      r.mono === glyph.mono &&
      code >= r.ascii &&
      code < r.ascii + r.length,
  );
  return range ? String.fromCodePoint(range.from + code - range.ascii) : glyph.base;
}

function write(glyph: Glyph): string {
  const letter = styledLetter(glyph);
  // Without style, the letter and its accent go back to being one character (`á`), as typed.
  const body = letter === glyph.base && LETTER.test(glyph.base) ? (glyph.base + glyph.marks).normalize("NFC") : letter + glyph.marks;
  return body + (glyph.underline ? UNDERLINE : "") + (glyph.strike ? STRIKE : "");
}

export function compose(glyphs: Glyph[]): string {
  return glyphs.map(write).join("");
}

/** Whether that glyph can take that style without breaking. */
export function accepts(glyph: Glyph, style: Style, options: Options): boolean {
  if (EMOJI_MARK.test(glyph.marks)) return false;
  if (style === "strike" || style === "underline") return !NO_STROKE.test(glyph.base);
  if (glyph.marks !== "" && !options.accents) return false;
  return (style === "italic" ? LETTER : LETTER_OR_DIGIT).test(glyph.base);
}

/** Sets or clears a style. Monospace has no bold or italic: one displaces the others. */
export function set(glyph: Glyph, style: Style, on: boolean): void {
  glyph[style] = on;
  if (!on) return;
  if (style === "mono") {
    glyph.bold = false;
    glyph.italic = false;
  }
  if (style === "bold" || style === "italic") glyph.mono = false;
}
