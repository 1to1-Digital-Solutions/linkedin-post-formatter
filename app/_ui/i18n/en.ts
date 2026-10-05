/**
 * Every text of the interface, in English. `es.ts` must have the same shape: TypeScript checks
 * it against this one.
 */
export const en = {
  title: "LinkedIn Post Formatter",
  tagline: "Paste your post, style what matters and copy it into LinkedIn. Nothing leaves your browser.",
  language: "Language",
  theme: { toLight: "Switch to light theme", toDark: "Switch to dark theme" },

  toolbar: "Text format",
  styles: { bold: "Bold", italic: "Italic", strike: "Strike", underline: "Underline", mono: "Code" },
  lists: {
    menu: "List",
    bullet: "Bullets",
    dash: "Dashes",
    arrow: "Arrows",
    check: "Check marks",
    pointing: "Pointing hands",
    diamond: "Diamonds",
    numbered: "Numbers",
    keycap: "Number emojis",
  },
  emoji: { button: "Emoji", dialog: "Pick an emoji" },
  shortcutHint: (name: string, keys: string) => `${name} (${keys})`,

  post: "Your post",
  placeholder: "Paste your post here, Markdown included. Then double-click a word and press Bold.",
  counter: (used: number, limit: number) => `${used} / ${limit} characters`,
  over: (count: number) => `${count} over: LinkedIn will not publish it`,
  clear: "Clear",
  copy: "Copy for LinkedIn",

  messages: {
    nothingToFormat:
      "Nothing to format there. Select a word or put the caret on it. Links, #hashtags and @mentions always stay plain so they keep working.",
    noList: "Nothing to turn into a list there.",
    copied: "Copied. Paste it into LinkedIn.",
    copyFailed: "Could not copy automatically. The text is selected: copy it with Ctrl/⌘ + C.",
    cleared: "Text cleared. If that was a mistake, undo it with Ctrl/⌘ + Z.",
  },

  preview: {
    heading: "Before the “…more”",
    device: "Preview device",
    desktop: "Desktop",
    mobile: "Mobile",
    empty: "The start of your post, as the feed will show it.",
    more: "…more",
    shows: (visible: number, behind: number) => `${visible} characters show; ${behind} are behind the “…more”.`,
    full: "Shows in full, no “…more”.",
    approximate: (characters: number, lines: number) =>
      `Approximate: LinkedIn cuts at about ${characters} characters or ${lines} lines, whichever comes first.`,
  },

  options: {
    legend: "Options",
    about: (name: string) => `About “${name}”`,
    convertOnPaste: "Convert Markdown on paste",
    convertOnPasteHelp:
      "Whatever you paste with **bold**, *italic*, ~~strike~~, `code`, headings or bullets comes in already converted. Turn it off to paste text as is.",
    accents: "Style accented letters",
    accentsHelp:
      "Letters like á, ñ or ü have no bold twin in Unicode, so they are written as the styled letter plus a combining accent. If a device shows the accent out of place, turn this off and those letters stay plain.",
  },

  help: {
    summary: "How it works & caveats",
    usage: [
      "Double-click a word (or select a piece of text) and press a format button. Pressing it again removes the format.",
      "With the caret on a word and nothing selected, the format applies to that word.",
      "The List menu puts a marker (bullets, arrows, check marks, numbers…) on the selected lines; Enter continues the list and Enter on an empty item ends it. Picking the same marker again removes it.",
      "Links, #hashtags and @mentions always stay plain so LinkedIn keeps recognizing them.",
      "The draft is saved in this browser only. Nothing is sent anywhere.",
    ],
    shortcuts: "Shortcuts:",
    shortcutList: [
      ["Ctrl/⌘ + B", "bold"],
      ["Ctrl/⌘ + I", "italic"],
      ["Ctrl/⌘ + U", "underline"],
      ["Ctrl/⌘ + Shift + X", "strike"],
      ["Ctrl/⌘ + Z", "undo"],
    ],
    caveats: [
      "LinkedIn has no real bold: these are other Unicode characters that look like letters. Screen readers read them badly or skip them, and LinkedIn search does not find those words. Use them on a few key words, never on whole paragraphs.",
      "Every styled letter counts as two characters toward the 3,000 limit.",
    ],
  },

  footer: { madeBy: "Made by César Peón · 1to1 Digital Solutions", links: "Author links", source: "Source" },
};

export type Messages = typeof en;
