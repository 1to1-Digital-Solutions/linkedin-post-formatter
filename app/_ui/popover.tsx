"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";

const CloseContext = createContext<() => void>(() => {});

/** Closes the panel this component is in. The focus stays wherever the pick left it (usually the text). */
export const usePopoverClose = () => useContext(CloseContext);

/**
 * A toolbar button that opens a panel: a popover under the button on large screens and a sheet
 * at the bottom on small ones. Escape and clicking outside close it; Escape also brings the
 * focus back to the button.
 */
export function Popover({
  button,
  buttonClassName,
  pressed,
  role,
  label,
  panelClassName = "",
  children,
}: {
  button: ReactNode;
  buttonClassName: string;
  pressed?: boolean;
  role: "dialog" | "menu";
  /** Accessible name of the panel. */
  label: string;
  panelClassName?: string;
  children: ReactNode;
}) {
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

  const close = () => setOpen(false);

  function dismiss() {
    close();
    trigger.current?.focus();
  }

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        className={buttonClassName}
        aria-pressed={pressed}
        aria-haspopup={role}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {button}
      </button>
      {open && (
        <div
          id={id}
          role={role}
          aria-label={label}
          className={`z-20 rounded-lg border border-border bg-surface shadow-lg max-lg:fixed max-lg:inset-x-4 max-lg:bottom-[max(1rem,env(safe-area-inset-bottom))] lg:absolute lg:top-full lg:left-0 lg:mt-1 ${panelClassName}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") dismiss();
          }}
        >
          <CloseContext value={close}>{children}</CloseContext>
        </div>
      )}
    </div>
  );
}
