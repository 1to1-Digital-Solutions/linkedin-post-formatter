/**
 * What never gets styled: links, emails, #hashtags and @mentions. With letters from another
 * alphabet LinkedIn stops recognizing them and they become dead text.
 */

export type Range = { start: number; end: number };

const PROTECTED = /https?:\/\/\S+|www\.\S+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|(?<![\p{L}\p{N}_])[#@][\p{L}\p{N}_]+/gu;

export function protectedRanges(text: string): Range[] {
  return Array.from(text.matchAll(PROTECTED), (match) => ({
    start: match.index,
    end: match.index + match[0].length,
  }));
}

export function overlap(a: Range, b: Range): boolean {
  return a.start < b.end && a.end > b.start;
}
