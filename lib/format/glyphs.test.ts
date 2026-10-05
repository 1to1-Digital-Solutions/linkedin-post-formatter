import { describe, expect, it } from "vitest";

import { bold, boldItalic, italic, mono, STRIKE, UNDERLINE } from "@/test/alphabets";

import { accepts, compose, decompose, set, type Glyph, type Style } from "./glyphs";

const WITH_ACCENTS = { accents: true };
const NO_ACCENTS = { accents: false };

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Gives the styles to everything that accepts them and writes the text back. */
function styled(text: string, styles: Style[], options = WITH_ACCENTS): string {
  const glyphs = decompose(text);
  for (const style of styles) {
    for (const glyph of glyphs) if (accepts(glyph, style, options)) set(glyph, style, true);
  }
  return compose(glyphs);
}

const first = (text: string) => decompose(text)[0] as Glyph;

describe("the alphabets", () => {
  it("bold is the sans-serif one, digits included", () => {
    expect(styled("Hello 2026", ["bold"])).toBe("𝗛𝗲𝗹𝗹𝗼 𝟮𝟬𝟮𝟲");
    expect(styled(ALPHABET + "0123456789", ["bold"])).toBe(bold(ALPHABET + "0123456789"));
  });

  it("italic is the sans-serif one and leaves digits alone, because there are no italic digits", () => {
    expect(styled("Hello 2026", ["italic"])).toBe("𝘏𝘦𝘭𝘭𝘰 2026");
    expect(styled(ALPHABET, ["italic"])).toBe(italic(ALPHABET));
  });

  it("bold and italic together give bold italic, with digits only bold", () => {
    expect(styled("Hello 26", ["bold", "italic"])).toBe("𝙃𝙚𝙡𝙡𝙤 𝟮𝟲");
    expect(styled(ALPHABET, ["italic", "bold"])).toBe(boldItalic(ALPHABET));
  });

  it("monospace has letters and digits", () => {
    expect(styled("/help 42", ["mono"])).toBe("/𝚑𝚎𝚕𝚙 𝟺𝟸");
    expect(styled(ALPHABET + "0123456789", ["mono"])).toBe(mono(ALPHABET + "0123456789"));
  });

  it("every styled letter is, for Unicode, a variant of its plain letter", () => {
    for (const styles of [["bold"], ["italic"], ["bold", "italic"], ["mono"]] as Style[][]) {
      expect(styled(ALPHABET, styles).normalize("NFKC")).toBe(ALPHABET);
    }
  });
});

describe("decompose", () => {
  it("reads a styled letter as its base letter and its flags", () => {
    expect(first(bold("a"))).toMatchObject({ base: "a", bold: true, italic: false, mono: false });
    expect(first(italic("Z"))).toMatchObject({ base: "Z", bold: false, italic: true });
    expect(first(boldItalic("q"))).toMatchObject({ base: "q", bold: true, italic: true });
    expect(first(mono("7"))).toMatchObject({ base: "7", mono: true, bold: false });
  });

  it("keeps each glyph's position in UTF-16 units", () => {
    const glyphs = decompose(`a${bold("b")}c`);
    expect(glyphs.map((g) => [g.start, g.end])).toEqual([
      [0, 1],
      [1, 3],
      [3, 4],
    ]);
  });

  it("splits the accent from its letter, and the ñ from its tilde", () => {
    expect(first("á")).toMatchObject({ base: "a", marks: "́", start: 0, end: 1 });
    expect(first("Ñ")).toMatchObject({ base: "N", marks: "̃" });
    expect(first("ü")).toMatchObject({ base: "u", marks: "̈" });
  });

  it("reads strikethrough and underline as flags of the character they follow", () => {
    const [a, b] = decompose(`a${STRIKE}${UNDERLINE}b`);
    expect(a).toMatchObject({ base: "a", strike: true, underline: true, marks: "", end: 3 });
    expect(b).toMatchObject({ base: "b", strike: false, underline: false, start: 3 });
  });

  it("leaves alone the characters that do not decompose into a Latin letter", () => {
    expect(first("¿")).toMatchObject({ base: "¿", marks: "" });
    expect(first("한")).toMatchObject({ base: "한", marks: "" });
    expect(first("ß")).toMatchObject({ base: "ß", marks: "" });
  });

  it("a stray mark at the start of the text is one more glyph", () => {
    expect(decompose(STRIKE)).toHaveLength(1);
    expect(compose(decompose(STRIKE))).toBe(STRIKE);
  });

  it("an empty text yields nothing", () => {
    expect(decompose("")).toEqual([]);
  });
});

describe("compose", () => {
  it("returns the same text when nothing is touched", () => {
    const text = `Camión ${bold("strong")} and ${italic("fine")}, right? 👩‍💻 1️⃣ ❤️ 🇪🇸\nAnother line${STRIKE}`;
    expect(compose(decompose(text))).toBe(text);
  });

  it("writes the accent after the styled letter", () => {
    expect(styled("camión", ["bold"])).toBe(`${bold("cami")}${bold("o")}́${bold("n")}`);
    expect(styled("año", ["italic"])).toBe(`${italic("a")}${italic("n")}̃${italic("o")}`);
  });

  it("when the style goes, the letter and its accent become one character again", () => {
    const glyphs = decompose(styled("camión", ["bold"]));
    for (const glyph of glyphs) set(glyph, "bold", false);
    expect(compose(glyphs)).toBe("camión");
    expect(compose(glyphs)).toHaveLength(6);
  });

  it("puts underline and strikethrough after the accent", () => {
    expect(styled("á", ["bold", "strike", "underline"])).toBe(`${bold("a")}́${UNDERLINE}${STRIKE}`);
  });
});

describe("accepts", () => {
  it("bold and monospace take letters and digits; italic, letters only", () => {
    expect(accepts(first("a"), "bold", WITH_ACCENTS)).toBe(true);
    expect(accepts(first("7"), "bold", WITH_ACCENTS)).toBe(true);
    expect(accepts(first("7"), "mono", WITH_ACCENTS)).toBe(true);
    expect(accepts(first("7"), "italic", WITH_ACCENTS)).toBe(false);
    expect(accepts(first("¿"), "bold", WITH_ACCENTS)).toBe(false);
    expect(accepts(first(" "), "italic", WITH_ACCENTS)).toBe(false);
  });

  it("with accents off, accented letters do not change alphabet", () => {
    expect(accepts(first("ó"), "bold", WITH_ACCENTS)).toBe(true);
    expect(accepts(first("ó"), "bold", NO_ACCENTS)).toBe(false);
    expect(accepts(first("o"), "bold", NO_ACCENTS)).toBe(true);
    expect(styled("camión", ["bold"], NO_ACCENTS)).toBe(`${bold("cami")}ó${bold("n")}`);
  });

  it("strikethrough and underline take almost anything, spaces, punctuation and accents included", () => {
    expect(accepts(first(" "), "strike", NO_ACCENTS)).toBe(true);
    expect(accepts(first("¿"), "underline", NO_ACCENTS)).toBe(true);
    expect(accepts(first("ó"), "strike", NO_ACCENTS)).toBe(true);
  });

  it("does not stroke line breaks or the pieces of an emoji", () => {
    expect(accepts(first("\n"), "strike", WITH_ACCENTS)).toBe(false);
    expect(styled("a\n👩‍💻🇪🇸👍🏽b", ["strike"])).toBe(`a${STRIKE}\n👩‍💻🇪🇸👍🏽b${STRIKE}`);
  });

  it("does not touch an emoji made of a digit or a symbol plus its selectors", () => {
    expect(styled("1️⃣ ❤️", ["bold", "strike"])).toBe(`1️⃣ ${STRIKE}❤️`);
  });
});

describe("set", () => {
  it("monospace removes bold and italic, and the other way round", () => {
    expect(styled(boldItalic("a"), ["mono"])).toBe(mono("a"));
    expect(styled(mono("a"), ["bold"])).toBe(bold("a"));
    expect(styled(mono("a"), ["italic"])).toBe(italic("a"));
  });

  it("clearing one style leaves the others alone", () => {
    const glyph = first(`${boldItalic("a")}${STRIKE}`);
    set(glyph, "italic", false);
    expect(compose([glyph])).toBe(`${bold("a")}${STRIKE}`);
    set(glyph, "strike", false);
    expect(compose([glyph])).toBe(bold("a"));
  });
});
