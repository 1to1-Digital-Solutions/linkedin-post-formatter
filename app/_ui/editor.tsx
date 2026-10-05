"use client";

import { useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent, type SyntheticEvent } from "react";

import { activeStyles, clearFormat, toggle, type Change } from "@/lib/format/apply";
import type { Style } from "@/lib/format/glyphs";
import { charactersUsed, POST_LIMIT } from "@/lib/format/limit";
import { continueList, listKind, toggleList, type ListKind } from "@/lib/format/lists";
import { markdownToUnicode } from "@/lib/format/markdown";

import { saveDraft, useDraft } from "./draft";
import { EmojiPicker } from "./emoji-picker";
import { Help } from "./help";
import { useMessages } from "./i18n/locale";
import { Preview } from "./preview";
import { button, card, checkboxRow, formatButton, muted, primaryButton } from "./styles";
import { Tooltip } from "./tooltip";
import { typeInto } from "./type-into";

/** Each button shows its style with CSS; the name is what a screen reader reads. */
const STYLE_BUTTONS: { style: Style; className: string; shortcut?: string; keys?: string }[] = [
  { style: "bold", className: "font-bold", shortcut: "Ctrl/⌘ + B", keys: "Control+B Meta+B" },
  { style: "italic", className: "italic", shortcut: "Ctrl/⌘ + I", keys: "Control+I Meta+I" },
  { style: "strike", className: "line-through", shortcut: "Ctrl/⌘ + Shift + X", keys: "Control+Shift+X Meta+Shift+X" },
  { style: "underline", className: "underline", shortcut: "Ctrl/⌘ + U", keys: "Control+U Meta+U" },
  { style: "mono", className: "font-mono" },
];

const LIST_BUTTONS: { kind: ListKind; glyph: string }[] = [
  { kind: "bullet", glyph: "•" },
  { kind: "numbered", glyph: "1." },
];

const SHORTCUTS: Record<string, Style> = { b: "bold", i: "italic", u: "underline" };

/** Keeps the focus (and the visible selection) in the text when a toolbar button is clicked. */
const keepFocus = (event: { preventDefault: () => void }) => event.preventDefault();

export function Editor() {
  const t = useMessages();
  const text = useDraft();
  const area = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [accents, setAccents] = useState(true);
  const [convertOnPaste, setConvertOnPaste] = useState(true);
  const [message, setMessage] = useState("");

  const active = useMemo(() => activeStyles(text, selection, { accents }), [text, selection, accents]);
  const activeList = useMemo(() => listKind(text, selection), [text, selection]);
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

  /** Runs a pure change on the field's current text and selection. */
  function edit(change: (text: string, selection: { start: number; end: number }) => Change, noEffect: string) {
    const field = area.current;
    if (!field) return;
    apply(change(field.value, currentSelection(field)), noEffect);
  }

  /** Puts text where the caret is, replacing whatever is selected, and leaves the caret after it. */
  function insert(inserted: string) {
    edit((value, { start, end }) => {
      const caret = start + inserted.length;
      return { text: value.slice(0, start) + inserted + value.slice(end), selection: { start: caret, end: caret }, changed: true };
    }, "");
  }

  /** Replaces the whole text and leaves the caret at the end. */
  function replaceAll(next: string, noEffect: string) {
    edit((value) => ({ text: next, selection: { start: next.length, end: next.length }, changed: next !== value }), noEffect);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
      const field = event.currentTarget;
      if (field.selectionStart !== field.selectionEnd) return;
      const change = continueList(field.value, field.selectionStart);
      if (!change) return;
      event.preventDefault();
      apply(change, "");
      return;
    }
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    const which = event.shiftKey ? (key === "x" ? "strike" : undefined) : SHORTCUTS[key];
    if (!which) return;
    event.preventDefault();
    edit((value, selected) => toggle(value, selected, which, { accents }), t.messages.nothingToFormat);
  }

  function onPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = event.clipboardData.getData("text/plain");
    if (!convertOnPaste || pasted === "") return;
    event.preventDefault();
    insert(markdownToUnicode(pasted, { accents }));
  }

  function onSelect(event: SyntheticEvent<HTMLTextAreaElement>) {
    setSelection(currentSelection(event.currentTarget));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(t.messages.copied);
    } catch {
      // Without clipboard permission the manual path remains: everything selected and one shortcut away.
      area.current?.focus();
      area.current?.select();
      setMessage(t.messages.copyFailed);
    }
  }

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
      <section aria-label={t.post} className={`${card} flex min-h-0 flex-col shadow-sm focus-within:ring-2 focus-within:ring-focus`}>
        <div
          role="toolbar"
          aria-label={t.toolbar}
          aria-controls="post"
          className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-t-lg border-b border-border bg-surface p-2 pt-[max(0.5rem,env(safe-area-inset-top))] lg:static"
        >
          {STYLE_BUTTONS.map(({ style, className, shortcut, keys }) => (
            <button
              key={style}
              type="button"
              className={formatButton}
              aria-pressed={active[style]}
              aria-keyshortcuts={keys}
              title={shortcut ? t.shortcutHint(t.styles[style], shortcut) : t.styles[style]}
              onMouseDown={keepFocus}
              onClick={() => edit((value, selected) => toggle(value, selected, style, { accents }), t.messages.nothingToFormat)}
            >
              <span className={className}>{t.styles[style]}</span>
            </button>
          ))}
          <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
          {LIST_BUTTONS.map(({ kind, glyph }) => (
            <button
              key={kind}
              type="button"
              className={formatButton}
              aria-pressed={activeList === kind}
              aria-label={t.lists[kind]}
              title={t.lists[kind]}
              onMouseDown={keepFocus}
              onClick={() => edit((value, selected) => toggleList(value, selected, kind), t.messages.noList)}
            >
              <span aria-hidden="true">
                <span className="font-semibold">{glyph}</span> {t.listShort}
              </span>
            </button>
          ))}
          <EmojiPicker onPick={insert} />
          <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
          <button type="button" className={button} onMouseDown={keepFocus} onClick={() => edit(clearFormat, t.messages.nothingToClear)}>
            {t.clearFormat}
          </button>
          <button
            type="button"
            className={`${button} sm:ml-auto`}
            title={t.convertMarkdownHint}
            onMouseDown={keepFocus}
            onClick={() => replaceAll(markdownToUnicode(text, { accents }), t.messages.noMarkdown)}
          >
            {t.convertMarkdown}
          </button>
        </div>

        <label htmlFor="post" className="sr-only">
          {t.post}
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
          placeholder={t.placeholder}
          spellCheck
          rows={10}
          aria-describedby="counter"
          className="block min-h-[40dvh] w-full flex-1 resize-none bg-field px-4 py-3 text-base leading-relaxed text-text outline-none placeholder:text-muted lg:min-h-0"
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-b-lg border-t border-border p-2 pl-4">
          <p id="counter" className={`text-sm ${over > 0 ? "font-semibold text-danger" : muted}`}>
            {t.counter(used, POST_LIMIT)}
            {over > 0 && ` · ${t.over(over)}`}
          </p>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              className={button}
              disabled={text === ""}
              onClick={() => {
                replaceAll("", "");
                setMessage(t.messages.cleared);
              }}
            >
              {t.clear}
            </button>
            <button type="button" className={primaryButton} disabled={text === ""} onClick={copy}>
              {t.copy}
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
          <legend className="sr-only">{t.options.legend}</legend>
          <label className={checkboxRow}>
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-primary"
              checked={convertOnPaste}
              onChange={(event) => setConvertOnPaste(event.target.checked)}
            />
            {t.options.convertOnPaste}
          </label>
          <Tooltip label={t.options.about(t.options.convertOnPaste)}>{t.options.convertOnPasteHelp}</Tooltip>
          <label className={checkboxRow}>
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-primary"
              checked={accents}
              onChange={(event) => setAccents(event.target.checked)}
            />
            {t.options.accents}
          </label>
          <Tooltip label={t.options.about(t.options.accents)}>{t.options.accentsHelp}</Tooltip>
        </fieldset>

        <Help />
      </aside>
    </div>
  );
}
