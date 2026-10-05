/**
 * A short, curated set of emojis that actually show up in LinkedIn posts, by group. Names for
 * screen readers live in the messages (`i18n/en.ts`, `i18n/es.ts`), keyed by the emoji itself.
 */
export type EmojiGroup = "popular" | "people" | "symbols" | "work" | "world";

export const EMOJIS: Record<EmojiGroup, string[]> = {
  popular: ["🚀", "✅", "💡", "🔥", "👉", "📌", "⭐", "📈", "🎯", "💪", "🙌", "👇"],
  people: ["👍", "👏", "🤝", "🙏", "👋", "✍️", "🧠", "👀", "😊", "😅", "🤔", "🎉"],
  symbols: ["➡️", "⬇️", "↗️", "❌", "⚠️", "❓", "❗", "✨", "♻️", "⏰", "⏳", "🔁"],
  work: ["💻", "📱", "📊", "📝", "📚", "🔑", "🔒", "🛠️", "⚙️", "🧩", "💰", "🏆"],
  world: ["🌱", "🌍", "☀️", "🌙", "⚡", "💧", "🧭", "🗺️", "🏁", "🎓", "🤖", "📣"],
};
