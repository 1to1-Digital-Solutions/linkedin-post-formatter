"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * A small "?" that explains a control. It shows on hover and on keyboard focus, and a tap
 * toggles it for touch screens, where there is no hover. Escape closes it.
 */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        aria-expanded={open}
        className="peer inline-flex size-11 items-center justify-center rounded-full text-muted hover:text-accent pointer-fine:size-6"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
      >
        <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full border border-current text-xs font-semibold">
          ?
        </span>
      </button>
      <span
        role="tooltip"
        id={id}
        className={`absolute top-full left-1/2 z-20 mt-1 w-64 -translate-x-1/2 rounded-md border border-border bg-surface p-2 text-xs leading-relaxed text-text shadow-md ${open ? "" : "invisible peer-hover:visible peer-focus-visible:visible"}`}
      >
        {children}
      </span>
    </span>
  );
}
