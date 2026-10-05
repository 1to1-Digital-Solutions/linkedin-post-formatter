import { useSyncExternalStore } from "react";

import { THEME_KEY } from "./storage-keys";
import { stored } from "./stored";

export type Theme = "light" | "dark";

/**
 * The theme follows the browser until the person picks one; the choice is remembered. The
 * `data-theme` attribute on `<html>` is what the CSS reads (`color-scheme` in `globals.css`),
 * and the inline script in `app/layout.tsx` sets it before the first paint so there is no flash.
 */
const choice = stored<Theme | "system">({
  key: THEME_KEY,
  fallback: "system",
  parse: (raw) => (raw === "light" || raw === "dark" ? raw : null),
});

const query = () => window.matchMedia("(prefers-color-scheme: dark)");

function subscribeToSystem(notify: () => void): () => void {
  const media = query();
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}

function useSystemTheme(): Theme {
  return useSyncExternalStore(subscribeToSystem, () => (query().matches ? "dark" : "light"), () => "light");
}

export function setTheme(theme: Theme): void {
  choice.set(theme);
  document.documentElement.dataset.theme = theme;
}

/** The theme in effect: the chosen one, or the browser's. */
export function useTheme(): Theme {
  const chosen = choice.use();
  const system = useSystemTheme();
  return chosen === "system" ? system : chosen;
}
