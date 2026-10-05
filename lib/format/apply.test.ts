import { describe, expect, it } from "vitest";

import { bold, boldItalic, italic, mono, strike, underline } from "@/test/alphabets";

import { activeStyles, clearFormat, stylize, toggle } from "./apply";

const OPTIONS = { accents: true };

/** The selection of a piece of the text, as the `<textarea>` would give it. */
function selectionOf(text: string, piece: string) {
  const start = text.indexOf(piece);
  return { start, end: start + piece.length };
}

const caretAt = (position: number) => ({ start: position, end: position });

describe("toggle", () => {
  it("makes the selected word bold and keeps it selected", () => {
    const text = "hello cruel world";
    const change = toggle(text, selectionOf(text, "cruel"), "bold", OPTIONS);
    expect(change.text).toBe(`hello ${bold("cruel")} world`);
    expect(change.text.slice(change.selection.start, change.selection.end)).toBe(bold("cruel"));
    expect(change.changed).toBe(true);
  });

  it("the second time on the same thing, removes it", () => {
    const text = "hello world";
    const there = toggle(text, selectionOf(text, "world"), "bold", OPTIONS);
    const back = toggle(there.text, there.selection, "bold", OPTIONS);
    expect(back.text).toBe(text);
    expect(back.selection).toEqual(selectionOf(text, "world"));
  });

  it("if only part of the selection carries the style, gives it to all of it", () => {
    const text = `${bold("hello")} world`;
    const change = toggle(text, { start: 0, end: text.length }, "bold", OPTIONS);
    expect(change.text).toBe(`${bold("hello")} ${bold("world")}`);
  });

  it("stacks styles: italic over bold is bold italic, and removing one leaves the other", () => {
    const text = bold("hello");
    const all = { start: 0, end: text.length };
    const stacked = toggle(text, all, "italic", OPTIONS);
    expect(stacked.text).toBe(boldItalic("hello"));
    expect(toggle(stacked.text, stacked.selection, "bold", OPTIONS).text).toBe(italic("hello"));
  });

  it("when deciding whether to remove italic, digits do not count, since they cannot carry it", () => {
    const text = `${italic("post")} 2026`;
    const change = toggle(text, { start: 0, end: text.length }, "italic", OPTIONS);
    expect(change.text).toBe("post 2026");
  });

  it("strikes and underlines character by character, spaces included, and undoes it", () => {
    const text = "no longer true";
    const all = { start: 0, end: text.length };
    const struck = toggle(text, all, "strike", OPTIONS);
    expect(struck.text).toBe(strike("no longer true"));
    expect(toggle(struck.text, struck.selection, "strike", OPTIONS).text).toBe(text);
    expect(toggle(text, all, "underline", OPTIONS).text).toBe(underline("no longer true"));
  });

  it("does not strike the whitespace at the edges of the selection", () => {
    const text = "hello cruel world";
    const change = toggle(text, selectionOf(text, " cruel "), "strike", OPTIONS);
    expect(change.text).toBe(`hello ${strike("cruel")} world`);
    expect(change.text.slice(change.selection.start, change.selection.end)).toBe(strike("cruel"));
  });

  it("with a bare caret acts on the word it touches and leaves the caret after it", () => {
    const text = "hello cruel world";
    for (const position of [6, 8, 11]) {
      const change = toggle(text, caretAt(position), "bold", OPTIONS);
      expect(change.text).toBe(`hello ${bold("cruel")} world`);
      expect(change.selection).toEqual(caretAt(6 + bold("cruel").length));
    }
  });

  it("with a bare caret at the end of the text takes the last word", () => {
    expect(toggle("hello", caretAt(5), "bold", OPTIONS).text).toBe(bold("hello"));
  });

  it("with a bare caret in a styled accented word, recognizes the whole word", () => {
    const text = toggle("a camión", selectionOf("a camión", "camión"), "bold", OPTIONS).text;
    const change = toggle(text, caretAt(text.length - 1), "bold", OPTIONS);
    expect(change.text).toBe("a camión");
  });

  it("changes nothing if the caret touches no word", () => {
    const text = "hello ,  world";
    const change = toggle(text, caretAt(8), "bold", OPTIONS);
    expect(change).toEqual({ text, selection: caretAt(8), changed: false });
  });

  it("changes nothing if there is nothing in the selection to give that style to", () => {
    const text = "¿¡ 2026 !?";
    const all = { start: 0, end: text.length };
    expect(toggle(text, all, "italic", OPTIONS)).toEqual({ text, selection: all, changed: false });
    expect(toggle("", caretAt(0), "bold", OPTIONS).changed).toBe(false);
  });

  it("changes nothing with a selection that falls outside the text", () => {
    expect(toggle("ab", { start: 5, end: 9 }, "bold", OPTIONS).changed).toBe(false);
  });

  it("leaves links, emails, hashtags and mentions unstyled", () => {
    const text = "see https://1to1digital.solutions/a_b and www.x.com #claude @Cesar or cesar@x.com now";
    const change = toggle(text, { start: 0, end: text.length }, "bold", OPTIONS);
    expect(change.text).toBe(
      `${bold("see")} https://1to1digital.solutions/a_b ${bold("and")} www.x.com #claude @Cesar ${bold("or")} cesar@x.com ${bold("now")}`,
    );
  });

  it("does not strike them either, and reports no change if that was all there was", () => {
    const text = "#claude";
    const all = { start: 0, end: text.length };
    expect(toggle(text, all, "strike", OPTIONS)).toEqual({ text, selection: all, changed: false });
  });

  it("a hash in the middle of a word is not a hashtag", () => {
    expect(toggle("C#sharp", { start: 0, end: 7 }, "bold", OPTIONS).text).toBe(`${bold("C")}#${bold("sharp")}`);
  });

  it("honors the option to leave accented letters unstyled", () => {
    const change = toggle("camión", { start: 0, end: 6 }, "bold", { accents: false });
    expect(change.text).toBe(`${bold("cami")}ó${bold("n")}`);
    // And still understands the word is already bold: the second time removes it.
    expect(toggle(change.text, change.selection, "bold", { accents: false }).text).toBe("camión");
  });

  it("a selection that splits a styled character takes it whole", () => {
    const text = bold("ab");
    // Each letter takes two units: 1 to 3 cuts both in half.
    expect(toggle(text, { start: 1, end: 3 }, "bold", OPTIONS).text).toBe("ab");
  });
});

describe("clearFormat", () => {
  it("leaves the selection as plain text, whatever mix of styles", () => {
    const text = `${boldItalic("one")} ${strike(mono("two"))} ${underline("three")} four`;
    const change = clearFormat(text, { start: 0, end: text.length });
    expect(change.text).toBe("one two three four");
    expect(change.selection).toEqual({ start: 0, end: "one two three four".length });
    expect(change.changed).toBe(true);
  });

  it("only touches the selection", () => {
    const text = `${bold("one")} ${bold("two")}`;
    const change = clearFormat(text, selectionOf(text, bold("two")));
    expect(change.text).toBe(`${bold("one")} two`);
  });

  it("also cleans hashtags and links that arrived styled", () => {
    const text = `#${bold("claude")}`;
    expect(clearFormat(text, { start: 0, end: text.length }).text).toBe("#claude");
  });

  it("with a bare caret cleans the word it touches", () => {
    const text = `${bold("one")} ${bold("two")}`;
    expect(clearFormat(text, caretAt(2)).text).toBe(`one ${bold("two")}`);
  });

  it("reports no change if it was plain text already", () => {
    const all = { start: 0, end: 11 };
    expect(clearFormat("hello world", all)).toEqual({ text: "hello world", selection: all, changed: false });
  });
});

describe("activeStyles", () => {
  const NONE = { bold: false, italic: false, mono: false, strike: false, underline: false };

  it("says which styles the whole selection carries", () => {
    const text = `${strike(boldItalic("hello"))} world`;
    expect(activeStyles(text, selectionOf(text, strike(boldItalic("hello"))), OPTIONS)).toEqual({
      ...NONE,
      bold: true,
      italic: true,
      strike: true,
    });
    expect(activeStyles(mono("hello"), { start: 0, end: 10 }, OPTIONS)).toEqual({ ...NONE, mono: true });
    expect(activeStyles(underline("hello"), { start: 0, end: 10 }, OPTIONS)).toEqual({ ...NONE, underline: true });
  });

  it("a partial style does not count as active", () => {
    const text = `${bold("hello")} world`;
    expect(activeStyles(text, { start: 0, end: text.length }, OPTIONS)).toEqual(NONE);
  });

  it("with a bare caret looks at the word it touches", () => {
    const text = `hello ${bold("world")}`;
    expect(activeStyles(text, caretAt(text.length), OPTIONS).bold).toBe(true);
    expect(activeStyles(text, caretAt(2), OPTIONS).bold).toBe(false);
  });

  it("with nothing to style, none is active", () => {
    expect(activeStyles("", caretAt(0), OPTIONS)).toEqual(NONE);
    expect(activeStyles("#claude", { start: 0, end: 7 }, OPTIONS)).toEqual(NONE);
  });
});

describe("stylize", () => {
  it("gives the styles to the whole text, without toggling", () => {
    expect(stylize(`${bold("is")} aquí`, ["bold"], OPTIONS)).toBe(`${bold("is")} ${bold("aqu")}${bold("i")}́`);
    expect(stylize("hello", ["italic", "bold", "strike"], OPTIONS)).toBe(strike(boldItalic("hello")));
  });

  it("if monospace is among the styles, it wins over bold and italic", () => {
    expect(stylize("npm", ["mono", "bold", "italic"], OPTIONS)).toBe(mono("npm"));
  });

  it("with no styles returns the text as is", () => {
    expect(stylize("hello", [], OPTIONS)).toBe("hello");
  });

  it("does not style links or hashtags either", () => {
    expect(stylize("see #claude", ["bold"], OPTIONS)).toBe(`${bold("see")} #claude`);
  });
});
