import type { Card } from "../../lib/content";

export function nextCardId(queue: string[], theme: Card["theme"], allCards: Card[]): string | null {
  const themeCards = allCards.filter((c) => c.theme === theme).map((c) => c.id);
  for (const id of queue) {
    if (themeCards.includes(id)) return id;
  }
  for (const id of themeCards) {
    if (!queue.includes(id)) return id;
  }
  return null;
}

export function afterWrong(queue: string[], wrongId: string): string[] {
  const idx = queue.indexOf(wrongId);
  if (idx === -1) return queue;
  const without = queue.filter((id) => id !== wrongId);
  const insertAt = Math.min(2, without.length);
  return [...without.slice(0, insertAt), wrongId, ...without.slice(insertAt)];
}