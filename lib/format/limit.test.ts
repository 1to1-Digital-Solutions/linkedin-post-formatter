import { describe, expect, it } from "vitest";

import { bold } from "@/test/alphabets";

import { charactersUsed, POST_LIMIT } from "./limit";

describe("charactersUsed", () => {
  it("counts one per plain character, accents and line breaks included", () => {
    expect(charactersUsed("camión\nñu")).toBe(9);
    expect(charactersUsed("")).toBe(0);
  });

  it("counts two per styled letter and per simple emoji, like LinkedIn", () => {
    expect(charactersUsed(bold("hola"))).toBe(8);
    expect(charactersUsed("👍")).toBe(2);
  });

  it("a post's limit is 3,000", () => {
    expect(POST_LIMIT).toBe(3000);
  });
});
