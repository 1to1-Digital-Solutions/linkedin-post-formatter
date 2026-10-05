import { useSyncExternalStore } from "react";

/**
 * The draft, kept in this browser's `localStorage` so it survives a reload. It goes nowhere
 * else: the tool has no server to send it to.
 */

const KEY = "linkedin-formatter:draft";

/** `null` until storage has been read. */
let draft: string | null = null;
const listeners = new Set<() => void>();

function read(): string {
  if (draft === null) {
    try {
      draft = window.localStorage.getItem(KEY) ?? "";
    } catch {
      // With storage blocked (strict private browsing) the tool still works, in memory only.
      console.warn("The draft cannot be saved in this browser: it will be lost when the tab closes.");
      draft = "";
    }
  }
  return draft;
}

function subscribe(notify: () => void): () => void {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

export function saveDraft(text: string): void {
  draft = text;
  try {
    window.localStorage.setItem(KEY, text);
  } catch {
    // Same case as when reading, already warned about: the draft stays in memory.
  }
  for (const notify of listeners) notify();
}

/** The current draft. On the server and during hydration it is empty. */
export function useDraft(): string {
  return useSyncExternalStore(subscribe, read, () => "");
}
