import { describe, expect, it } from "vitest";

import { overlap, protectedRanges } from "./protected";

const pieces = (text: string) => protectedRanges(text).map((r) => text.slice(r.start, r.end));

describe("protectedRanges", () => {
  it("finds links, with and without protocol", () => {
    expect(pieces("go to https://x.com/a?b=1 or to http://y.es and www.z.org/path now")).toEqual([
      "https://x.com/a?b=1",
      "http://y.es",
      "www.z.org/path",
    ]);
  });

  it("finds hashtags and mentions, accents and digits included", () => {
    expect(pieces("#automatización with @César_Peón and #ai2026")).toEqual(["#automatización", "@César_Peón", "#ai2026"]);
  });

  it("finds whole emails", () => {
    expect(pieces("write to cesar.pl+post@1to1digital.solutions today")).toEqual(["cesar.pl+post@1to1digital.solutions"]);
  });

  it("does not take a lone hash or one inside a word for a hashtag", () => {
    expect(pieces("the # alone, C#sharp and a@b without domain")).toEqual([]);
  });

  it("a text without any of that yields nothing", () => {
    expect(protectedRanges("plain text")).toEqual([]);
  });
});

describe("overlap", () => {
  it("two ranges overlap if they share a character; touching at the edge does not count", () => {
    expect(overlap({ start: 0, end: 3 }, { start: 2, end: 5 })).toBe(true);
    expect(overlap({ start: 2, end: 5 }, { start: 0, end: 3 })).toBe(true);
    expect(overlap({ start: 0, end: 3 }, { start: 3, end: 5 })).toBe(false);
    expect(overlap({ start: 3, end: 5 }, { start: 0, end: 3 })).toBe(false);
  });
});
