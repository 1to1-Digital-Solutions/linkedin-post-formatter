"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";

import { LIST_KINDS, marker, type ListKind } from "@/lib/format/lists";

import { useMessages } from "./i18n/locale";
import { Popover, usePopoverClose } from "./popover";
import { formatButton } from "./styles";

/** The "List" button: a menu with every kind of marker. The active kind is checked; picking it again removes the list. */
export function ListMenu({ active, onPick }: { active: ListKind | null; onPick: (kind: ListKind) => void }) {
  const t = useMessages();
  return (
    <Popover
      button={
        <span aria-hidden="true">
          <span className="font-semibold">•</span> {t.lists.menu} ▾
        </span>
      }
      buttonClassName={formatButton}
      pressed={active !== null}
      role="menu"
      label={t.lists.menu}
      panelClassName="p-1 lg:w-56"
    >
      <Items active={active} onPick={onPick} />
    </Popover>
  );
}

function Items({ active, onPick }: { active: ListKind | null; onPick: (kind: ListKind) => void }) {
  const t = useMessages();
  const close = usePopoverClose();
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    list.current?.querySelector<HTMLButtonElement>("[role=menuitemradio]")?.focus();
  }, []);

  /** Up and down move between the items, as in any menu. */
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = Array.from(list.current?.querySelectorAll<HTMLButtonElement>("[role=menuitemradio]") ?? []);
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  }

  return (
    <div ref={list} onKeyDown={onKeyDown}>
      {LIST_KINDS.map((kind) => (
        <button
          key={kind}
          type="button"
          role="menuitemradio"
          aria-checked={active === kind}
          className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm hover:bg-raised aria-checked:bg-accent-soft aria-checked:text-accent pointer-fine:min-h-9"
          onClick={() => {
            onPick(kind);
            close();
          }}
        >
          <span aria-hidden="true" className="w-7 text-center">
            {marker(kind, 1).trim()}
          </span>
          {t.lists[kind]}
        </button>
      ))}
    </div>
  );
}
