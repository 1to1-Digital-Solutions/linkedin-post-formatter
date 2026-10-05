"use client";

import { useEffect, useId, useRef, useState } from "react";

import { EMOJIS, type EmojiGroup } from "./emojis";
import { useMessages } from "./i18n/locale";
import { button } from "./styles";

/**
 * A button that opens a small grid of emojis. The grid is a dialog: Escape and clicking outside
 * close it, and the focus comes back to the button.
 */
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const t = useMessages();
  const id = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        className={button}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true">🙂</span> {t.emoji.button}
      </button>
      {open && (
        <div
          id={id}
          role="dialog"
          aria-label={t.emoji.dialog}
          // A sheet at the bottom on small screens, a popover under the button on large ones.
          className="z-20 rounded-lg border border-border bg-surface p-2 shadow-lg max-h-[70dvh] overflow-y-auto max-lg:fixed max-lg:inset-x-4 max-lg:bottom-[max(1rem,env(safe-area-inset-bottom))] lg:absolute lg:top-full lg:left-0 lg:mt-1 lg:w-80"
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
        >
          {(Object.keys(EMOJIS) as EmojiGroup[]).map((group) => (
            <section key={group} aria-label={t.emojiGroups[group]} className="mb-1 last:mb-0">
              <h3 className="px-1 text-xs font-semibold text-muted">{t.emojiGroups[group]}</h3>
              <div className="grid grid-cols-6">
                {EMOJIS[group].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={t.emojiNames[emoji] ?? emoji}
                    className="flex min-h-11 items-center justify-center rounded-md text-xl hover:bg-raised pointer-fine:min-h-9"
                    onClick={() => {
                      onPick(emoji);
                      close();
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
