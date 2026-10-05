import { useSyncExternalStore } from "react";

/**
 * A value kept in this browser's `localStorage`, read through `useSyncExternalStore` so every
 * component sees the same thing. It goes nowhere else: the tool has no server to send it to.
 *
 * With storage blocked (strict private browsing) everything still works, in memory only.
 */
export function stored<T extends string>({ key, fallback, parse }: { key: string; fallback: T; parse: (raw: string) => T | null }) {
  /** `undefined` until storage has been read. */
  let value: T | undefined;
  const listeners = new Set<() => void>();

  function read(): T {
    if (value === undefined) {
      try {
        const raw = window.localStorage.getItem(key);
        value = raw === null ? fallback : (parse(raw) ?? fallback);
      } catch {
        console.warn(`"${key}" cannot be saved in this browser: it will be lost when the tab closes.`);
        value = fallback;
      }
    }
    return value;
  }

  function subscribe(notify: () => void): () => void {
    listeners.add(notify);
    return () => {
      listeners.delete(notify);
    };
  }

  function set(next: T): void {
    value = next;
    try {
      window.localStorage.setItem(key, next);
    } catch {
      // Same case as when reading, already warned about: the value stays in memory.
    }
    for (const notify of listeners) notify();
  }

  /** The current value. On the server and during hydration it is the fallback. */
  const use = () => useSyncExternalStore(subscribe, read, () => fallback);

  return { set, use };
}
