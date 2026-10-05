"use client";

import { useState } from "react";

import { CUTS, hook, type Device } from "@/lib/format/hook";
import { charactersUsed } from "@/lib/format/limit";

import { card, muted } from "./styles";

/** Width of a post's text in the LinkedIn feed and lines it shows before the "…more". */
const DEVICES: Record<Device, { name: string; width: string; lines: string }> = {
  desktop: { name: "Desktop", width: "max-w-[555px]", lines: "line-clamp-5" },
  mobile: { name: "Mobile", width: "max-w-[360px]", lines: "line-clamp-3" },
};

const option =
  "flex min-h-11 cursor-pointer items-center rounded-md border border-field-border px-3 text-sm font-medium has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:shadow-[inset_0_-3px_0_var(--accent)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus pointer-fine:min-h-8";

export function Preview({ text }: { text: string }) {
  const [device, setDevice] = useState<Device>("desktop");
  const { visible, truncated } = hook(text, device);
  const behind = charactersUsed(text.trim()) - charactersUsed(visible);
  const cut = CUTS[device];
  const look = DEVICES[device];
  const empty = text.trim() === "";

  return (
    <section className={`${card} p-3 sm:p-4`} aria-labelledby="preview">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="preview" className="text-sm font-semibold">
          Before the “…more”
        </h2>
        <fieldset className="flex gap-1.5">
          <legend className="sr-only">Preview device</legend>
          {(Object.keys(DEVICES) as Device[]).map((value) => (
            <label key={value} className={option}>
              <input
                type="radio"
                name="device"
                value={value}
                className="sr-only"
                checked={device === value}
                onChange={() => setDevice(value)}
              />
              {DEVICES[value].name}
            </label>
          ))}
        </fieldset>
      </div>

      <div className={`${look.width} rounded-lg border border-border bg-field p-3`}>
        <div className="mb-3 flex items-center gap-2" aria-hidden="true">
          <div className="size-9 rounded-full bg-raised" />
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-28 rounded bg-raised" />
            <div className="h-2 w-16 rounded bg-raised" />
          </div>
        </div>
        {empty ? (
          <p className={`text-sm ${muted}`}>The start of your post, as the feed will show it.</p>
        ) : (
          <p className={`${look.lines} text-sm leading-5 whitespace-pre-wrap`}>
            {visible}
            {truncated && <span className={muted}> …more</span>}
          </p>
        )}
      </div>

      <p className={`mt-2 text-xs ${muted}`}>
        {truncated && `${charactersUsed(visible)} characters show; ${behind} are behind the “…more”. `}
        {!truncated && !empty && "Shows in full, no “…more”. "}
        Approximate: LinkedIn cuts at about {cut.characters} characters or {cut.lines} lines, whichever comes first.
      </p>
    </section>
  );
}
