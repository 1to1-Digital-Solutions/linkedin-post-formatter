"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import type Picker from "emoji-picker-element/picker";

import { useLocale, useMessages, type Locale } from "./i18n/locale";
import { Popover, usePopoverClose } from "./popover";
import { button } from "./styles";
import { useTheme } from "./theme";

/** The "Emoji" button: the full emoji picker, with search and skin tones, in the current language. */
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const t = useMessages();
  return (
    <Popover
      button={
        <>
          <span aria-hidden="true">🙂</span> {t.emoji.button}
        </>
      }
      buttonClassName={button}
      role="dialog"
      label={t.emoji.dialog}
      panelClassName="overflow-hidden lg:w-[22rem]"
    >
      <Panel onPick={onPick} />
    </Popover>
  );
}

const TRANSLATIONS: Record<Locale, () => Promise<{ default: object }>> = {
  en: () => import("emoji-picker-element/i18n/en"),
  es: () => import("emoji-picker-element/i18n/es"),
};

/**
 * `emoji-picker-element` is a web component, so it is created by hand once the panel opens.
 * Its data (one JSON per language) is served by `app/emoji-data/[locale]/route.ts`, from this
 * same origin: the page loads nothing from outside. The component caches it in IndexedDB.
 */
function Panel({ onPick }: { onPick: (emoji: string) => void }) {
  const locale = useLocale();
  const theme = useTheme();
  const close = usePopoverClose();
  const host = useRef<HTMLDivElement>(null);
  const pick = useEffectEvent((emoji: string) => {
    onPick(emoji);
    close();
  });

  useEffect(() => {
    let cancelled = false;
    let picker: Picker | undefined;
    Promise.all([import("emoji-picker-element"), TRANSLATIONS[locale]()]).then(([{ Picker }, i18n]) => {
      if (cancelled || !host.current) return;
      picker = new Picker({ locale, dataSource: `/emoji-data/${locale}`, i18n: i18n.default as never });
      picker.classList.add(theme);
      picker.style.width = "100%";
      picker.style.height = "22rem";
      picker.addEventListener("emoji-click", (event) => {
        if (event.detail.unicode) pick(event.detail.unicode);
      });
      host.current.replaceChildren(picker);
    });
    return () => {
      cancelled = true;
      picker?.remove();
    };
  }, [locale, theme]);

  return (
    <div
      ref={host}
      className="h-[22rem] [--background:var(--surface)] [--border-color:var(--border)] [--button-hover-background:var(--raised)] [--indicator-color:var(--accent)] [--input-border-color:var(--field-border)] [--input-font-color:var(--text)] [--input-placeholder-color:var(--muted)]"
    />
  );
}
