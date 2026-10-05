import { describe, expect, it } from "vitest";

import { continueList, listKind, toggleList } from "./lists";

const all = (text: string) => ({ start: 0, end: text.length });
const caretAt = (position: number) => ({ start: position, end: position });

describe("toggleList", () => {
  it("turns the selected lines into a bulleted list and selects them", () => {
    const text = "one\ntwo\nthree";
    const change = toggleList(text, all(text), "bullet");
    expect(change).toEqual({ text: "• one\n• two\n• three", selection: { start: 0, end: 19 }, changed: true });
  });

  it("numbers the lines from 1, skipping blank lines", () => {
    const text = "one\n\ntwo\nthree";
    expect(toggleList(text, all(text), "numbered").text).toBe("1. one\n\n2. two\n3. three");
  });

  it("keeps the indentation in front of the marker", () => {
    expect(toggleList("  nested", caretAt(3), "bullet").text).toBe("  • nested");
  });

  it("acts on the whole lines the selection touches, even partially", () => {
    const text = "one\ntwo\nthree";
    expect(toggleList(text, { start: 2, end: 5 }, "bullet").text).toBe("• one\n• two\nthree");
  });

  it("a selection ending right after a line break does not reach the next line", () => {
    const text = "one\ntwo\nthree";
    expect(toggleList(text, { start: 0, end: 4 }, "bullet").text).toBe("• one\ntwo\nthree");
  });

  it("with a bare caret acts on that line and leaves the caret at its end", () => {
    const text = "one\ntwo";
    expect(toggleList(text, caretAt(5), "bullet")).toEqual({ text: "one\n• two", selection: caretAt(9), changed: true });
  });

  it("the second time on the same kind removes the markers", () => {
    const text = "• one\n• two";
    expect(toggleList(text, all(text), "bullet").text).toBe("one\ntwo");
    const numbered = "1. one\n2. two";
    expect(toggleList(numbered, all(numbered), "numbered").text).toBe("one\ntwo");
  });

  it("switches from one kind to the other and renumbers", () => {
    const text = "• one\n7. two\nthree";
    expect(toggleList(text, all(text), "numbered").text).toBe("1. one\n2. two\n3. three");
    expect(toggleList(text, all(text), "bullet").text).toBe("• one\n• two\n• three");
  });

  it("a marker alone counts as a list line", () => {
    expect(toggleList("• ", caretAt(2), "bullet")).toEqual({ text: "", selection: caretAt(0), changed: true });
  });

  it("changes nothing on blank lines", () => {
    expect(toggleList("\n\n", { start: 0, end: 2 }, "bullet")).toEqual({ text: "\n\n", selection: { start: 0, end: 2 }, changed: false });
    expect(toggleList("", caretAt(0), "numbered").changed).toBe(false);
  });
});

describe("listKind", () => {
  it("says which kind of list the selected lines are, if they all are the same", () => {
    expect(listKind("• one\n• two", { start: 0, end: 11 })).toBe("bullet");
    expect(listKind("1. one\n\n2. two", { start: 0, end: 14 })).toBe("numbered");
    expect(listKind("• one\n2. two", { start: 0, end: 12 })).toBeNull();
    expect(listKind("• one\ntwo", { start: 0, end: 9 })).toBeNull();
  });

  it("is none on plain or blank lines", () => {
    expect(listKind("one", caretAt(1))).toBeNull();
    expect(listKind("", caretAt(0))).toBeNull();
  });
});

describe("continueList", () => {
  it("is nothing on a plain line", () => {
    expect(continueList("one\ntwo", 7)).toBeNull();
  });

  it("on a bulleted line adds a new bullet after the caret", () => {
    expect(continueList("• one", 5)).toEqual({ text: "• one\n• ", selection: caretAt(8), changed: true });
  });

  it("on a numbered line adds the next number, keeping the indentation", () => {
    expect(continueList("  3. three", 10)).toEqual({ text: "  3. three\n  4. ", selection: caretAt(16), changed: true });
  });

  it("splits the line if the caret is in the middle, and only looks at the caret's line", () => {
    expect(continueList("• one two", 5)?.text).toBe("• one\n•  two");
    expect(continueList("• one\ntwo", 9)).toBeNull();
    expect(continueList("one\n• two\nthree", 9)?.text).toBe("one\n• two\n• \nthree");
  });

  it("on a marker with nothing after it ends the list", () => {
    expect(continueList("• one\n• ", 8)).toEqual({ text: "• one\n", selection: caretAt(6), changed: true });
    expect(continueList("  1. ", 5)).toEqual({ text: "  ", selection: caretAt(2), changed: true });
  });
});
