/**
 * Lists. LinkedIn has no lists either: a list is a line that starts with a marker — a bullet,
 * an arrow, a check mark, a number… — which is also what the Markdown conversion writes.
 */

import type { Change } from "./apply";
import type { Range } from "./protected";

/** The markers that are a symbol plus a space. The numbered kinds count instead. */
export const LIST_MARKERS = { bullet: "•", dash: "–", arrow: "→", check: "✅", pointing: "👉", diamond: "🔹" } as const;

export type ListKind = keyof typeof LIST_MARKERS | "numbered" | "keycap";

export const LIST_KINDS: ListKind[] = [...(Object.keys(LIST_MARKERS) as (keyof typeof LIST_MARKERS)[]), "numbered", "keycap"];

/** `1️⃣` to `🔟`; beyond ten there are no keycaps, so the plain number takes over. */
const KEYCAPS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

type Line = { indent: string; kind: ListKind | null; number: number; body: string };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MARKER = new RegExp(
  `^(\\s*)(?:(${Object.values(LIST_MARKERS).map(escape).join("|")}) |(\\d+)\\. |(${KEYCAPS.map(escape).join("|")}) )?`,
  "u",
);

function parse(line: string): Line {
  const [whole, indent, symbol, digits, keycap] = MARKER.exec(line) as RegExpExecArray;
  const body = line.slice(whole.length);
  if (symbol !== undefined) {
    const kind = LIST_KINDS.find((k) => k in LIST_MARKERS && LIST_MARKERS[k as keyof typeof LIST_MARKERS] === symbol) as ListKind;
    return { indent: indent as string, kind, number: 0, body };
  }
  if (digits !== undefined) return { indent: indent as string, kind: "numbered", number: Number(digits), body };
  if (keycap !== undefined) return { indent: indent as string, kind: "keycap", number: KEYCAPS.indexOf(keycap) + 1, body };
  return { indent: indent as string, kind: null, number: 0, body };
}

/** The marker of a kind, with its trailing space. */
export function marker(kind: ListKind, number: number): string {
  if (kind === "numbered") return `${number}. `;
  if (kind === "keycap") return `${KEYCAPS[number - 1] ?? `${number}.`} `;
  return `${LIST_MARKERS[kind]} `;
}

/** The whole lines the selection touches, as offsets into the text. */
function lineSpan(text: string, selection: Range): Range {
  const start = text.lastIndexOf("\n", selection.start - 1) + 1;
  // A selection that ends right after a line break (triple-click) does not reach the next line.
  const probe = selection.end > selection.start && text[selection.end - 1] === "\n" ? selection.end - 1 : selection.end;
  const newline = text.indexOf("\n", probe);
  return { start, end: newline === -1 ? text.length : newline };
}

function listedLines(text: string, span: Range): Line[] {
  return text
    .slice(span.start, span.end)
    .split("\n")
    .map(parse)
    .filter((line) => line.kind !== null || line.body.trim() !== "");
}

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

/** The kind of list the selected lines are, if they all are the same one: marks the menu as pressed. */
export function listKind(text: string, selection: Range): ListKind | null {
  const listed = listedLines(text, lineSpan(text, selection));
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
