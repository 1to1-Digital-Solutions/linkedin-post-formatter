import { describe, expect, it } from "vitest";

import { bold } from "@/test/alphabets";

import { CUTS, hook } from "./hook";

describe("hook", () => {
  it("a short text shows whole and carries no “…more”", () => {
    expect(hook("Hello, LinkedIn.", "desktop")).toEqual({ visible: "Hello, LinkedIn.", truncated: false });
    expect(hook("", "mobile")).toEqual({ visible: "", truncated: false });
  });

  it("cuts at 210 characters on desktop and at 140 on mobile", () => {
    const text = "a".repeat(300);
    expect(hook(text, "desktop")).toEqual({ visible: "a".repeat(210), truncated: true });
    expect(hook(text, "mobile")).toEqual({ visible: "a".repeat(140), truncated: true });
  });

  it("a text right at the limit is not truncated", () => {
    const text = "a".repeat(CUTS.mobile.characters);
    expect(hook(text, "mobile")).toEqual({ visible: text, truncated: false });
  });

  it("styled letters count two, so less text shows", () => {
    const text = bold("a").repeat(150);
    expect(hook(text, "desktop").visible).toBe(bold("a").repeat(105));
    expect(hook(text, "mobile").visible).toBe(bold("a").repeat(70));
  });

  it("does not split a two-unit character or separate a letter from its accent", () => {
    const text = `${"a".repeat(139)}👍x`;
    expect(hook(text, "mobile").visible).toBe("a".repeat(139));
    const accented = `${"a".repeat(139)}${bold("o")}́x`;
    expect(hook(accented, "mobile").visible).toBe("a".repeat(139));
  });

  it("cuts by lines if they come first: 5 on desktop and 3 on mobile", () => {
    const text = "one\ntwo\nthree\nfour\nfive\nsix\nseven";
    expect(hook(text, "desktop")).toEqual({ visible: "one\ntwo\nthree\nfour\nfive", truncated: true });
    expect(hook(text, "mobile")).toEqual({ visible: "one\ntwo\nthree", truncated: true });
  });

  it("blank lines count as lines too", () => {
    expect(hook("one\n\ntwo\n\nthree", "mobile")).toEqual({ visible: "one\n\ntwo", truncated: true });
  });

  it("leaves no spaces or line breaks hanging at the end of the visible part", () => {
    expect(hook("hello   \n\n\n\n\n\nbye", "desktop").visible).toBe("hello");
  });

  it("what is left behind only counts if there is something to read", () => {
    expect(hook("one\ntwo\nthree\n\n   ", "mobile")).toEqual({ visible: "one\ntwo\nthree", truncated: false });
  });
});
