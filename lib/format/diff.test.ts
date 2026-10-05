import { describe, expect, it } from "vitest";

import { bold } from "@/test/alphabets";

import { diff } from "./diff";

/** Applies the replacement the way the editor would, by typing it over that piece. */
function apply(before: string, after: string): string {
  const { start, end, text } = diff(before, after);
  return before.slice(0, start) + text + before.slice(end);
}

describe("diff", () => {
  it("gives only the piece that changes", () => {
    expect(diff("hello cruel world", "hello CRUEL world")).toEqual({ start: 6, end: 11, text: "CRUEL" });
  });

  it("if nothing changes, the replacement is empty", () => {
    expect(diff("same", "same")).toEqual({ start: 4, end: 4, text: "" });
  });

  it("works for inserting and for deleting", () => {
    expect(diff("ac", "abc")).toEqual({ start: 1, end: 1, text: "b" });
    expect(diff("abc", "ac")).toEqual({ start: 1, end: 2, text: "" });
    expect(diff("", "abc")).toEqual({ start: 0, end: 0, text: "abc" });
    expect(diff("abc", "")).toEqual({ start: 0, end: 3, text: "" });
  });

  it("with repeated text does not count the same character twice", () => {
    expect(apply("aaa", "aa")).toBe("aa");
    expect(apply("aa", "aaa")).toBe("aaa");
  });

  it("does not cut a styled letter in half at the start of the change", () => {
    // 𝗮 and 𝗯 share the first of their two UTF-16 units.
    const { start, text } = diff(`x${bold("a")}`, `x${bold("b")}`);
    expect(start).toBe(1);
    expect(text).toBe(bold("b"));
  });

  it("does not cut a two-unit character in half at the end of the change", () => {
    // U+1F600 (😀) and U+1FA00 share the second of their two UTF-16 units and not the first.
    const before = "\u{1F600}x";
    const after = "\u{1FA00}x";
    expect(diff(before, after)).toEqual({ start: 0, end: 2, text: "\u{1FA00}" });
  });

  it("single-unit characters above the surrogates do not move the cut", () => {
    // "！" is U+FF01: higher than any half of a pair, but whole.
    expect(diff("！a！", "！b！")).toEqual({ start: 1, end: 2, text: "b" });
  });

  it("applying the replacement always gives the target text", () => {
    const cases: [string, string][] = [
      ["hello world", `hello ${bold("world")}`],
      [`hello ${bold("world")}`, "hello world"],
      [bold("abc"), bold("abd")],
      ["camión", `${bold("cami")}${bold("o")}́${bold("n")}`],
      ["👍 fine", "👎 fine"],
    ];
    for (const [before, after] of cases) expect(apply(before, after)).toBe(after);
  });
});
