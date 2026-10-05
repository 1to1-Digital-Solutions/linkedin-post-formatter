/**
 * Styled letters, written here from the Unicode chart and not from `lib/`: if the code picks the
 * wrong alphabet, these tests do not follow it.
 */

type Alphabet = { upper: number; lower: number; digits?: number };

const ALPHABETS = {
  bold: { upper: 0x1d5d4, lower: 0x1d5ee, digits: 0x1d7ec }, // SANS-SERIF BOLD
  italic: { upper: 0x1d608, lower: 0x1d622 }, // SANS-SERIF ITALIC
  boldItalic: { upper: 0x1d63c, lower: 0x1d656 }, // SANS-SERIF BOLD ITALIC
  mono: { upper: 0x1d670, lower: 0x1d68a, digits: 0x1d7f6 }, // MONOSPACE
} satisfies Record<string, Alphabet>;

function using(alphabet: Alphabet, text: string): string {
  return text
    .replace(/[A-Z]/g, (l) => String.fromCodePoint(alphabet.upper + l.charCodeAt(0) - 65))
    .replace(/[a-z]/g, (l) => String.fromCodePoint(alphabet.lower + l.charCodeAt(0) - 97))
    .replace(/[0-9]/g, (d) => (alphabet.digits ? String.fromCodePoint(alphabet.digits + Number(d)) : d));
}

export const bold = (text: string) => using(ALPHABETS.bold, text);
export const italic = (text: string) => using(ALPHABETS.italic, text);
export const boldItalic = (text: string) => using(ALPHABETS.boldItalic, text);
export const mono = (text: string) => using(ALPHABETS.mono, text);

export const STRIKE = "̶";
export const UNDERLINE = "̲";
export const strike = (text: string) => Array.from(text, (c) => c + STRIKE).join("");
export const underline = (text: string) => Array.from(text, (c) => c + UNDERLINE).join("");
