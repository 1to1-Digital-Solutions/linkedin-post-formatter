/**
 * Bulleted and numbered lists. LinkedIn has no lists either: a list is a line that starts with
 * `• ` or `1. `, which is also what the Markdown conversion writes.
 */

import type { Change } from "./apply";
import type { Range } from "./protected";

export type ListKind = "bullet" | "numbered";

type Line = { indent: string; kind: ListKind | null; number: number; body: string };

const MARKER = /^(\s*)(?:• |(\d+)\. )?/;

function parse(line: string): Line {
  const match = MARKER.exec(line) as RegExpExecArray;
  const indent = match[1] as string;
  const hasMarker = match[0].length > indent.length;
  const number = match[2] === undefined ? 0 : Number(match[2]);
  const kind = hasMarker ? (match[2] === undefined ? "bullet" : "numbered") : null;
  return { indent, kind, number, body: line.slice(match[0].length) };
}

/** The whole lines the selection touches, as offsets into the text. */
function lineSpan(text: string, selection: Range): Range {
  const start = text.lastIndexOf("\n", selection.start - 1) + 1;
  // A selection that ends right after a line break (triple-click) does not reach the next line.
  const probe = selection.end > selection.start && text[selection.end - 1] === "\n" ? selection.end - 1 : selection.end;
  const newline = text.indexOf("\n", probe);
  return { start, end: newline === -1 ? text.length : newline };
}

const marker = (kind: ListKind, number: number) => (kind === "bullet" ? "• " : `${number}. `);

/**
 * Makes the selected lines a list of that kind or, if they all are one already, plain lines.
 * Blank lines are skipped; numbering restarts at 1 and is renumbered.
 */
export function toggleList(text: string, selection: Range, kind: ListKind): Change {
  const span = lineSpan(text, selection);
  const lines = text.slice(span.start, span.end).split("\n").map(parse);
  const listed = lines.filter((line) => line.kind !== null || line.body.trim() !== "");
  if (listed.length === 0) return { text, selection, changed: false };
  const remove = listed.every((line) => line.kind === kind);
  let number = 0;
  const block = lines
    .map((line) => {
      if (remove || (line.kind === null && line.body.trim() === "")) return line.indent + line.body;
      number++;
      return line.indent + marker(kind, number) + line.body;
    })
    .join("\n");
  const next = text.slice(0, span.start) + block + text.slice(span.end);
  const end = span.start + block.length;
  const collapsed = selection.start === selection.end;
  return { text: next, selection: { start: collapsed ? end : span.start, end }, changed: next !== text };
}

/** The kind of list the selected lines are, if they all are the same one: marks the buttons as pressed. */
export function listKind(text: string, selection: Range): ListKind | null {
  const span = lineSpan(text, selection);
  const lines = text.slice(span.start, span.end).split("\n").map(parse);
  const listed = lines.filter((line) => line.kind !== null || line.body.trim() !== "");
  const first = listed[0];
  if (!first || first.kind === null) return null;
  return listed.every((line) => line.kind === first.kind) ? first.kind : null;
}

/**
 * What Enter does inside a list: the next line gets the next marker, and Enter on a marker with
 * nothing after it ends the list instead. `null` when the caret is not on a list line.
 */
export function continueList(text: string, caret: number): Change | null {
  const start = text.lastIndexOf("\n", caret - 1) + 1;
  const newline = text.indexOf("\n", caret);
  const end = newline === -1 ? text.length : newline;
  const line = parse(text.slice(start, end));
  if (line.kind === null) return null;
  if (line.body.trim() === "") {
    const position = start + line.indent.length;
    return { text: text.slice(0, start) + line.indent + text.slice(end), selection: { start: position, end: position }, changed: true };
  }
  const inserted = `\n${line.indent}${marker(line.kind, line.number + 1)}`;
  const position = caret + inserted.length;
  return { text: text.slice(0, caret) + inserted + text.slice(caret), selection: { start: position, end: position }, changed: true };
}
