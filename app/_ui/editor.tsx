"use client";

import { useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent, type SyntheticEvent } from "react";

import { activeStyles, clearFormat, toggle, type Change } from "@/lib/format/apply";
import type { Style } from "@/lib/format/glyphs";
import { charactersUsed, POST_LIMIT } from "@/lib/format/limit";
import { markdownToUnicode } from "@/lib/format/markdown";

import { saveDraft, useDraft } from "./draft";
import { Help } from "./help";
import { Preview } from "./preview";
import { button, card, checkboxRow, formatButton, muted, primaryButton } from "./styles";
import { Tooltip } from "./tooltip";
import { typeInto } from "./type-into";

/** Each button shows its style with CSS; the name is what a screen reader reads. */
const BUTTONS: { style: Style; name: string; className: string; shortcut?: string; keys?: string }[] = [
  { style: "bold", name: "Bold", className: "font-bold", shortcut: "Ctrl/⌘ + B", keys: "Control+B Meta+B" },
  { style: "italic", name: "Italic", className: "italic", shortcut: "Ctrl/⌘ + I", keys: "Control+I Meta+I" },
  { style: "strike", name: "Strike", className: "line-through", shortcut: "Ctrl/⌘ + Shift + X", keys: "Control+Shift+X Meta+Shift+X" },
  { style: "underline", name: "Underline", className: "underline", shortcut: "Ctrl/⌘ + U", keys: "Control+U Meta+U" },
  { style: "mono", name: "Code", className: "font-mono" },
];

const SHORTCUTS: Record<string, Style> = { b: "bold", i: "italic", u: "underline" };

const NOTHING_TO_FORMAT =
  "Nothing to format there. Select a word or put the caret on it. Links, #hashtags and @mentions always stay plain so they keep working.";

export function Editor() {
  const text = useDraft();
  const area = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [accents, setAccents] = useState(true);
  const [convertOnPaste, setConvertOnPaste] = useState(true);
  const [message, setMessage] = useState("");

  const active = useMemo(() => activeStyles(text, selection, { accents }), [text, selection, accents]);
  const used = charactersUsed(text);
  const over = used - POST_LIMIT;

  function currentSelection(field: HTMLTextAreaElement) {
    return { start: field.selectionStart, end: field.selectionEnd };
  }

  /** Takes a change to the field and leaves the selection where it belongs; if nothing changed, says so. */
  function apply(change: Change, noEffect: string) {
    const field = area.current;
    if (!field) return;
    field.focus();
    if (!change.changed) {
      setMessage(noEffect);
      return;
    }
    typeInto(field, change.text);
    field.setSelectionRange(change.selection.start, change.selection.end);
    setSelection(change.selection);
    setMessage("");
  }

  function style(which: Style) {
    const field = area.current;
    if (!field) return;
    apply(toggle(field.value, currentSelection(field), which, { accents }), NOTHING_TO_FORMAT);
  }

  function clear() {
    const field = area.current;
    if (!field) return;
    apply(clearFormat(field.value, currentSelection(field)), "No formatting to remove there.");
  }

  /** Replaces the whole text and leaves the caret at the end. */
  function replaceAll(next: string, noEffect: string) {
    const field = area.current;
    if (!field) return;
    const atEnd = { start: next.length, end: next.length };
    apply({ text: next, selection: atEnd, changed: next !== field.value }, noEffect);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    const which = event.shiftKey ? (key === "x" ? "strike" : undefined) : SHORTCUTS[key];
    if (!which) return;
    event.preventDefault();
    style(which);
  }

  function onPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = event.clipboardData.getData("text/plain");
    if (!convertOnPaste || pasted === "") return;
    event.preventDefault();
    const field = event.currentTarget;
    const converted = markdownToUnicode(pasted, { accents });
    const caret = field.selectionStart + converted.length;
    const next = field.value.slice(0, field.selectionStart) + converted + field.value.slice(field.selectionEnd);
    apply({ text: next, selection: { start: caret, end: caret }, changed: true }, "");
  }

  function onSelect(event: SyntheticEvent<HTMLTextAreaElement>) {
    setSelection(currentSelection(event.currentTarget));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied. Paste it into LinkedIn.");
    } catch {
      // Without clipboard permission the manual path remains: everything selected and one shortcut away.
      area.current?.focus();
      area.current?.select();
      setMessage("Could not copy automatically. The text is selected: copy it with Ctrl/⌘ + C.");
    }
  }

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
      <section
        aria-label="Editor"
        className={`${card} flex min-h-0 flex-col shadow-sm focus-within:ring-2 focus-within:ring-focus`}
      >
        <div
          role="toolbar"
          aria-label="Text format"
          aria-controls="post"
          className="sticky top-0 z-10 flex flex-wrap gap-2 rounded-t-lg border-b border-border bg-surface p-2 pt-[max(0.5rem,env(safe-area-inset-top))] lg:static"
        >
          {BUTTONS.map(({ style: which, name, className, shortcut, keys }) => (
            <button
              key={which}
              type="button"
              className={formatButton}
              aria-pressed={active[which]}
              aria-keyshortcuts={keys}
              title={shortcut ? `${name} (${shortcut})` : name}
              // Keep the focus in the text so the selection stays visible.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => style(which)}
            >
              <span className={className}>{name}</span>
            </button>
          ))}
          <button type="button" className={button} onMouseDown={(event) => event.preventDefault()} onClick={clear}>
            Clear format
          </button>
          <button
            type="button"
            className={`${button} sm:ml-auto`}
            title="Convert the Markdown in the whole text: **bold**, *italic*, ~~strike~~, `code`, headings and bullets"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => replaceAll(markdownToUnicode(text, { accents }), "No Markdown to convert in the text.")}
          >
            Convert Markdown
          </button>
        </div>

        <label htmlFor="post" className="sr-only">
          Your post
        </label>
        <textarea
          id="post"
          ref={area}
          value={text}
          onChange={(event) => {
            saveDraft(event.target.value);
            setMessage("");
          }}
          onSelect={onSelect}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder="Paste your post here, Markdown included. Then double-click a word and press Bold."
          spellCheck
          rows={12}
          aria-describedby="counter"
          className="block min-h-[40dvh] w-full flex-1 resize-none bg-field px-4 py-3 text-base leading-relaxed text-text outline-none placeholder:text-muted lg:min-h-0"
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-b-lg border-t border-border p-2 pl-4">
          <p id="counter" className={`text-sm ${over > 0 ? "font-semibold text-danger" : muted}`}>
            {used} / {POST_LIMIT} characters
            {over > 0 && ` · ${over} over: LinkedIn will not publish it`}
          </p>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              className={button}
              disabled={text === ""}
              onClick={() => {
                replaceAll("", "");
                setMessage("Text cleared. If that was a mistake, undo it with Ctrl/⌘ + Z.");
              }}
            >
              Clear
            </button>
            <button type="button" className={primaryButton} disabled={text === ""} onClick={copy}>
              Copy for LinkedIn
            </button>
          </div>
          <p role="status" className={`w-full text-sm ${message === "" ? "hidden" : ""}`}>
            {message}
          </p>
        </div>
      </section>

      <aside className="flex min-h-0 flex-col gap-4 lg:overflow-y-auto">
        <Preview text={text} />

        <fieldset className={`${card} flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2`}>
          <legend className="sr-only">Options</legend>
          <label className={checkboxRow}>
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-primary"
              checked={convertOnPaste}
              onChange={(event) => setConvertOnPaste(event.target.checked)}
            />
            Convert Markdown on paste
          </label>
          <Tooltip about="Convert Markdown on paste">
            Whatever you paste with <code>**bold**</code>, <code>*italic*</code>, <code>~~strike~~</code>, <code>`code`</code>,
            headings or bullets comes in already converted. Turn it off to paste text as is.
          </Tooltip>
          <label className={checkboxRow}>
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-primary"
              checked={accents}
              onChange={(event) => setAccents(event.target.checked)}
            />
            Style accented letters
          </label>
          <Tooltip about="Style accented letters">
            Letters like á, ñ or ü have no bold twin in Unicode, so they are written as the styled letter plus a combining
            accent. If a device shows the accent out of place, turn this off and those letters stay plain.
          </Tooltip>
        </fieldset>

        <Help />
      </aside>
    </div>
  );
}
