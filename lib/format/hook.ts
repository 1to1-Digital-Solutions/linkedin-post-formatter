/**
 * The hook: what the feed shows of a post before the "…more".
 *
 * LinkedIn cuts by characters or by lines, whichever comes first, and the cut changes with the
 * device, the window width and the app version. The values here are the ones guides and other
 * tools' counters agree on; they are an approximation, not a promise.
 */

import { decompose } from "./glyphs";

export type Device = "desktop" | "mobile";

export const CUTS: Record<Device, { characters: number; lines: number }> = {
  desktop: { characters: 210, lines: 5 },
  mobile: { characters: 140, lines: 3 },
};

export type Hook = {
  /** What stays visible, without trailing whitespace. */
  visible: string;
  /** Whether there is text behind the "…more". */
  truncated: boolean;
};

export function hook(text: string, device: Device): Hook {
  const { characters, lines } = CUTS[device];
  // Counted in UTF-16 units, like the post limit, but the cut never splits a letter: neither a
  // two-unit character nor a letter from its accent.
  let cut = 0;
  let breaks = 0;
  for (const glyph of decompose(text)) {
    if (glyph.base === "\n") breaks++;
    if (glyph.end > characters || breaks >= lines) break;
    cut = glyph.end;
  }
  const visible = text.slice(0, cut).trimEnd();
  return { visible, truncated: text.slice(cut).trim() !== "" };
}
