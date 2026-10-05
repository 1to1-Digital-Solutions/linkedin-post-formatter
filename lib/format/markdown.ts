/**
 * From Markdown (an Obsidian draft, say) to the text that gets pasted into LinkedIn.
 *
 * What has an equivalent is converted: bold, italic, strikethrough, code, headings (as bold),
 * bullets (`•`) and links (`text (url)`, because LinkedIn only links the visible address).
 * Everything else — quotes, tables, images, numbered lists — stays as written. Every line break
 * is kept: in a post, each one is intentional.
 */

import { stylize } from "./apply";
import type { Options, Style } from "./glyphs";

type Rule = {
  pattern: RegExp;
  convert: (match: RegExpExecArray, styles: Style[], options: Options) => string;
};

const group = (match: RegExpExecArray, n: number) => match[n] as string;

/** A mark that wraps text (`**like this**`): the inside is parsed again, with one more style. */
function wrapper(pattern: RegExp, style: Style): Rule {
  return { pattern, convert: (m, styles, options) => inline(group(m, 1), [...styles, style], options) };
}

/**
 * At each point of the line the rule that starts first wins and, on a tie, the one listed first
 * here. Delimiters require text right against them on the inside (`2 * 3 * 4` is not italic)
 * and the underscore, besides, must not sit inside a word (`snake_case_name` is not either).
 */
const RULES: Rule[] = [
  // A bare address goes as is: its underscores and asterisks are not formatting.
  { pattern: /https?:\/\/\S+|www\.\S+/g, convert: (m) => m[0] },
  { pattern: /`([^`\n]+)`/g, convert: (m, styles, options) => stylize(group(m, 1), [...styles, "mono"], options) },
  { pattern: /\\([\\`*_~[\]()#>+\-.!|])/g, convert: (m, styles, options) => stylize(group(m, 1), styles, options) },
  {
    // Images (`![alt](url)`) are not a link that can be written out: left alone.
    pattern: /(?<!!)\[([^\]\n]+)\]\(([^)\s]+)\)/g,
    convert: (m, styles, options) => {
      const [text, url] = [group(m, 1), group(m, 2)];
      return text === url ? url : `${inline(text, styles, options)} (${url})`;
    },
  },
  wrapper(/\*\*(?=\S)(.+?)(?<=\S)\*\*(?!\*)/g, "bold"),
  wrapper(/(?<![\p{L}\p{N}_])__(?=\S)(.+?)(?<=\S)__(?![\p{L}\p{N}_])/gu, "bold"),
  wrapper(/(?<!\*)\*(?![*\s])(.+?)(?<![\s*])\*(?!\*)/g, "italic"),
  wrapper(/(?<![\p{L}\p{N}_])_(?![_\s])(.+?)(?<![\s_])_(?![\p{L}\p{N}_])/gu, "italic"),
  wrapper(/~~(?=\S)(.+?)(?<=\S)~~/g, "strike"),
];

type Hit = { rule: Rule; match: RegExpExecArray };

function firstHit(text: string, from: number): Hit | null {
  let first: Hit | null = null;
  for (const rule of RULES) {
    rule.pattern.lastIndex = from;
    const match = rule.pattern.exec(text);
    if (match && (first === null || match.index < first.match.index)) first = { rule, match };
  }
  return first;
}

function inline(text: string, styles: Style[], options: Options): string {
  let output = "";
  let position = 0;
  for (;;) {
    const first = firstHit(text, position);
    if (first === null) return output + stylize(text.slice(position), styles, options);
    const { rule, match } = first;
    output += stylize(text.slice(position, match.index), styles, options);
    output += rule.convert(match, styles, options);
    position = match.index + match[0].length;
  }
}

const HEADING = /^#{1,6}\s+(.*?)(?:\s+#+)?\s*$/;
const BULLET = /^(\s*)[-*+]\s+(.*)$/;
const FENCE = /^\s*(?:```|~~~)/;

function convertLine(line: string, options: Options): string {
  const heading = HEADING.exec(line);
  if (heading) return inline(group(heading, 1), ["bold"], options);
  const bullet = BULLET.exec(line);
  if (bullet) return `${group(bullet, 1)}• ${inline(group(bullet, 2), [], options)}`;
  return inline(line, [], options);
}

export function markdownToUnicode(markdown: string, options: Options): string {
  const lines: string[] = [];
  let inCodeBlock = false;
  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    if (FENCE.test(line)) inCodeBlock = !inCodeBlock;
    // Inside a code block nothing is formatting: it goes literally, without the fences.
    else lines.push(inCodeBlock ? line : convertLine(line, options));
  }
  return lines.join("\n");
}
