import en from "emoji-picker-element-data/en/emojibase/data.json";
import es from "emoji-picker-element-data/es/cldr/data.json";

/**
 * The emoji picker's data, served from this origin so the page keeps loading nothing from
 * outside. Prerendered at build time: these are plain files once deployed.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return Response.json(locale === "es" ? es : en, { headers: { "Cache-Control": "public, max-age=86400" } });
}
