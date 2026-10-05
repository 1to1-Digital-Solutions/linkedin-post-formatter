"use client";

import { useMessages } from "./i18n/locale";
import { card, muted } from "./styles";

/** Usage and caveats, folded away: they matter once, not on every visit. */
export function Help() {
  const t = useMessages();
  return (
    <details className={`${card} px-3 py-2 text-sm`}>
      <summary className="min-h-11 cursor-pointer font-semibold leading-11 pointer-fine:min-h-0 pointer-fine:leading-normal">
        {t.help.summary}
      </summary>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        {t.help.usage.map((item) => (
          <li key={item}>{item}</li>
        ))}
        <li>
          {t.help.shortcuts}{" "}
          {t.help.shortcutList.map(([keys, what], index) => (
            <span key={keys}>
              {index > 0 && ", "}
              <kbd>{keys}</kbd> {what}
            </span>
          ))}
          .
        </li>
      </ul>
      <ul className={`mt-2 list-disc space-y-1.5 pl-5 ${muted}`}>
        {t.help.caveats.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </details>
  );
}
