import { diff } from "@/lib/format/diff";

/**
 * Leaves the `<textarea>` with that text by "typing" only the piece that changes.
 *
 * `execCommand("insertText")` is marked obsolete, but it is the only way to edit a field from
 * code without losing the browser's undo: formatting something and regretting it with ⌘Z is
 * part of the tool. If the browser does not support it, the text is written directly and only
 * that is lost, the undo of that one change.
 */
export function typeInto(area: HTMLTextAreaElement, next: string): void {
  const { start, end, text } = diff(area.value, next);
  if (start === end && text === "") return;
  area.focus();
  area.setSelectionRange(start, end);
  const typed = text === "" ? document.execCommand("delete") : document.execCommand("insertText", false, text);
  if (typed) return;
  area.setRangeText(text, start, end, "end");
  area.dispatchEvent(new Event("input", { bubbles: true }));
}
