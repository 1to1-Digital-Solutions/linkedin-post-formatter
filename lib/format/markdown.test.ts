import { describe, expect, it } from "vitest";

import { bold, boldItalic, italic, mono, strike } from "@/test/alphabets";

import { markdownToUnicode } from "./markdown";

const convert = (markdown: string) => markdownToUnicode(markdown, { accents: true });

describe("markdownToUnicode: inline formatting", () => {
  it("converts bold, with asterisks or with underscores", () => {
    expect(convert("this is **very important** today")).toBe(`this is ${bold("very important")} today`);
    expect(convert("this is __important__ today")).toBe(`this is ${bold("important")} today`);
  });

  it("converts italic, with an asterisk or an underscore", () => {
    expect(convert("one *idea* and _another idea_")).toBe(`one ${italic("idea")} and ${italic("another idea")}`);
  });

  it("converts bold italic and nested styles", () => {
    expect(convert("***all***")).toBe(boldItalic("all"));
    expect(convert("**strong *and fine* at once**")).toBe(`${bold("strong")} ${boldItalic("and fine")} ${bold("at once")}`);
    expect(convert("*fine **and strong** at once*")).toBe(`${italic("fine")} ${boldItalic("and strong")} ${italic("at once")}`);
    expect(convert("**strong *and fine***")).toBe(`${bold("strong")} ${boldItalic("and fine")}`);
  });

  it("converts strikethrough, also combined", () => {
    expect(convert("~~before~~ now")).toBe(`${strike("before")} now`);
    expect(convert("~~**no more**~~")).toBe(strike(bold("no more")));
  });

  it("converts code to monospace without reading formatting inside", () => {
    expect(convert("use `/help` and `a*b*c`")).toBe(`use /${mono("help")} and ${mono("a")}*${mono("b")}*${mono("c")}`);
    expect(convert("**the `npm` command**")).toBe(`${bold("the")} ${mono("npm")} ${bold("command")}`);
  });

  it("several marks on the same line, each on its own", () => {
    expect(convert("**a** and **b**, *c* and *d*")).toBe(`${bold("a")} and ${bold("b")}, ${italic("c")} and ${italic("d")}`);
  });

  it("writes accented letters styled", () => {
    expect(convert("**año**")).toBe(`${bold("a")}${bold("n")}̃${bold("o")}`);
    expect(markdownToUnicode("**año**", { accents: false })).toBe(`${bold("a")}ñ${bold("o")}`);
  });

  it("does not mistake stray asterisks and underscores for formatting", () => {
    expect(convert("2 * 3 * 4 = 24")).toBe("2 * 3 * 4 = 24");
    expect(convert("the variable my_long_name and another__with__two")).toBe("the variable my_long_name and another__with__two");
    expect(convert("a * stray and ** another")).toBe("a * stray and ** another");
  });

  it("a backslash leaves the sign literal", () => {
    expect(convert("\\*not italic\\* and \\_neither\\_")).toBe("*not italic* and _neither_");
    expect(convert("**2 \\* 3**")).toBe(`${bold("2")} * ${bold("3")}`);
  });

  it("writes links as text plus address, because LinkedIn only links the address", () => {
    expect(convert("see [my site](https://1to1digital.solutions) today")).toBe("see my site (https://1to1digital.solutions) today");
    expect(convert("[**my site**](https://x.com/a_b_c)")).toBe(`${bold("my site")} (https://x.com/a_b_c)`);
    expect(convert("[https://x.com](https://x.com)")).toBe("https://x.com");
  });

  it("leaves bare addresses, images and hashtags alone, even inside bold", () => {
    expect(convert("see https://x.com/_profile_/*a* and www.x.com/_b_")).toBe("see https://x.com/_profile_/*a* and www.x.com/_b_");
    expect(convert("![screenshot](https://x.com/a.png)")).toBe("![screenshot](https://x.com/a.png)");
    expect(convert("**about #claude and https://x.com**")).toBe(`${bold("about")} #claude ${bold("and")} https://x.com`);
  });
});

describe("markdownToUnicode: lines", () => {
  it("makes headings bold, without the hashes", () => {
    expect(convert("# What I learnt")).toBe(bold("What I learnt"));
    expect(convert("### With *italic* inside ##")).toBe(`${bold("With")} ${boldItalic("italic")} ${bold("inside")}`);
  });

  it("a hashtag at the start of a line is not a heading", () => {
    expect(convert("#claude is a hashtag")).toBe("#claude is a hashtag");
  });

  it("turns bullets into dots, keeping indentation and formatting", () => {
    expect(convert("- one\n* two\n+ **three**\n  - nested")).toBe(`• one\n• two\n• ${bold("three")}\n  • nested`);
  });

  it("leaves numbered lists, quotes and rules as they are", () => {
    expect(convert("1. first\n2. second\n> a quote\n---")).toBe("1. first\n2. second\n> a quote\n---");
  });

  it("keeps every line break and normalizes Windows ones", () => {
    expect(convert("one\n\n\ntwo\r\nthree\rfour")).toBe("one\n\n\ntwo\nthree\nfour");
  });

  it("a code block goes literally and without the fences", () => {
    expect(convert("before\n```ts\nconst a = **b**;\n```\n**after**")).toBe(`before\nconst a = **b**;\n${bold("after")}`);
    expect(convert("~~~\n- not a bullet\n~~~")).toBe("- not a bullet");
  });

  it("formatting does not cross lines", () => {
    expect(convert("**opens\ncloses**")).toBe("**opens\ncloses**");
  });

  it("a text without Markdown comes out the same, and an empty one too", () => {
    expect(convert("Hi, how are you? All good.")).toBe("Hi, how are you? All good.");
    expect(convert("")).toBe("");
  });
});
