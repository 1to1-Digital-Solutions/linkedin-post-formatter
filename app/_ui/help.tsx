import { card, muted } from "./styles";

/** Usage and caveats, folded away: they matter once, not on every visit. */
export function Help() {
  return (
    <details className={`${card} px-3 py-2 text-sm`}>
      <summary className="min-h-11 cursor-pointer font-semibold leading-11 pointer-fine:min-h-0 pointer-fine:leading-normal">
        How it works & caveats
      </summary>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>Double-click a word (or select a piece of text) and press a format button. Pressing it again removes the format.</li>
        <li>With the caret on a word and nothing selected, the format applies to that word.</li>
        <li>
          Shortcuts: <kbd>Ctrl/⌘ + B</kbd> bold, <kbd>Ctrl/⌘ + I</kbd> italic, <kbd>Ctrl/⌘ + U</kbd> underline,{" "}
          <kbd>Ctrl/⌘ + Shift + X</kbd> strike, <kbd>Ctrl/⌘ + Z</kbd> undo.
        </li>
        <li>Links, #hashtags and @mentions always stay plain so LinkedIn keeps recognizing them.</li>
        <li>The draft is saved in this browser only. Nothing is sent anywhere.</li>
      </ul>
      <ul className={`mt-2 list-disc space-y-1.5 pl-5 ${muted}`}>
        <li>
          LinkedIn has no real bold: these are other Unicode characters that look like letters. Screen readers read them badly
          or skip them, and LinkedIn search does not find those words. Use them on a few key words, never on whole paragraphs.
        </li>
        <li>Every styled letter counts as two characters toward the 3,000 limit.</li>
      </ul>
    </details>
  );
}
