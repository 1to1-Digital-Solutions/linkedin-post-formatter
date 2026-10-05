# How it works, and why it is built this way

## "Formatting" on LinkedIn

**LinkedIn has no formatting.** The post editor stores plain text: it drops HTML and does not
parse Markdown. That is why the bold from a Markdown editor disappears on paste.

**Every "LinkedIn text formatter" does the same thing**, and it is simple: it swaps each letter for
another one that looks like it.

- **Bold, italic, monospace**: letters from the Unicode *Mathematical Alphanumeric Symbols*
  block (U+1D400–U+1D7FF), meant for formulas. There are serif, sans-serif, script, fraktur…
  alphabets. The ones that read as "normal text in bold" in the feed are the sans-serif ones:
  bold from U+1D5D4, italic from U+1D608, bold italic from U+1D63C, monospace from U+1D670;
  bold digits from U+1D7EC and monospace digits from U+1D7F6. There are no italic digits.
- **Strikethrough and underline**: a combining mark after each character (U+0336 and U+0332).
- **Accented letters**: they have no twin in that block. Naive tools leave them plain and the word
  ends up half styled (`𝗰𝗮𝗺𝗶ó𝗻`); careful ones decompose the letter (NFD) and write the styled
  letter followed by the combining accent (`𝗼` + U+0301).
- **Hashtags, mentions and links**: with letters from another alphabet they stop working, so
  careful tools leave them alone.

**The caveats belong to the technique, not to the tool:**

- **Accessibility**: a screen reader reads "mathematical sans-serif bold small a" letter by
  letter, or skips the text altogether.
- **Search**: for LinkedIn's search those words are not words.
- **Counting**: LinkedIn counts the 3,000 limit in UTF-16 code units, and each styled letter
  takes two (per Buffer's developer documentation).
- **Rendering**: devices without a font for that block show boxes. Rare today; what does vary is
  where the combining accent lands.
- Hence the usual advice: style a few anchor words and the hook, never whole paragraphs.

**The "…more" cut** is not one fixed number. Guides and other tools' counters agree on roughly
210 characters or 5 lines on desktop and 140 characters or 3 lines on mobile, whichever comes
first, and LinkedIn changes it with the app version and the window width. The preview says
"approximate" for that reason.

Sources: the Unicode formatting guide at linkedinpreview.com, the formatter at
jasperbernaers.com (the most complete one: converts Markdown, protects hashtags and links, styles
accents), the ones at tryordinal.com, socialrails.com, spurnow.com and supergrow.ai, the character
limits guide at developers.buffer.com, and the "see more" articles at authoredup.com and
linkedgrow.ai.

## Decisions

- **The editor is a `<textarea>` whose content already is the final text.** What you see is what
  you copy; there is no separate document model and no "export" step. Formatting is rewriting the
  selected characters. The alternative (a `contentEditable` editor with real bold that converts
  on copy) is far more code and worse accessibility for the same result.
- **Styles are read from the text itself** (`decompose` in `lib/format/glyphs.ts`): that is how a
  button knows the selection is already bold and removes it, and how text pasted from another
  tool can keep being edited.
- **Sans-serif alphabets only.** They have no holes (in the serif ones the italic `h` lives in
  another block) and they read as ordinary bold and italic. The others (serif, script…) are only
  recognized so that "Clear format" can remove them (NFKC).
- **Accented letters are styled by default**, with an option to leave them plain in case a device
  places the combining mark badly. Verified in desktop browsers; worth checking in the LinkedIn
  apps on Android and iOS.
- **Links, emails, #hashtags and @mentions are never styled**, neither when converting Markdown
  nor by hand. "Clear format" does act on them, to repair ones that arrived broken.
- **Markdown: what has an equivalent is converted**, the rest stays as written (quotes, numbered
  lists, images, tables). Every line break is kept. Links become `text (url)` because LinkedIn
  only links visible addresses.
- **Changes are "typed" with `execCommand("insertText")`** over the smallest piece that changes
  (`lib/format/diff.ts`). It is obsolete, but it is the only thing that keeps the browser's undo
  in a `<textarea>`; there is a fallback if it fails.
- **The "…more" preview is declared approximate.** The cut by characters and line breaks is
  computed in `lib/format/hook.ts`; lines that wrap because of the width (555 px on desktop,
  360 px on mobile) are clamped by CSS.
- **No server.** Nothing to store or protect: a static page, the draft in `localStorage`, and a
  Content Security Policy that forbids loading anything from outside.
