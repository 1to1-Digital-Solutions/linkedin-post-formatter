/**
 * The classes of the elements that repeat, in one place so they look the same. They only use the
 * colour tokens from `app/globals.css`.
 *
 * Touch targets are 44 px with a finger (phone and tablet) and a bit less with a mouse
 * (`pointer-fine`), whatever the width.
 */

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-1 rounded-md px-3.5 text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 pointer-fine:min-h-9";

export const button = `${buttonBase} border border-field-border bg-surface text-text hover:border-accent hover:bg-raised`;

export const primaryButton = `${buttonBase} bg-primary font-semibold text-on-primary hover:bg-primary-hover`;

/** A format toolbar button. Pressed (`aria-pressed`) it does not just change colour: it also gets a bar underneath. */
export const formatButton = `${button} aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:shadow-[inset_0_-3px_0_var(--accent)]`;

export const card = "rounded-lg border border-border bg-surface";

export const muted = "text-muted";

/** A checkbox with its text: the whole row is the touch target. */
export const checkboxRow = "flex min-h-11 cursor-pointer items-center gap-2 text-sm pointer-fine:min-h-0";
