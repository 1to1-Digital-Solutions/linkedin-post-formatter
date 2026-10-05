/**
 * The `localStorage` keys, in one place: the theme one is also read by the inline script in
 * `app/layout.tsx`, which runs before React and cannot import anything that uses it.
 */
export const DRAFT_KEY = "linkedin-formatter:draft";
export const THEME_KEY = "linkedin-formatter:theme";
export const LOCALE_KEY = "linkedin-formatter:locale";
