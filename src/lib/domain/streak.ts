const TZ = "America/Sao_Paulo";

export function localDay(date: Date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: TZ });
}

export function daysInARow(days: string[]): number {
  if (days.length === 0) return 0;
  const sorted = [...new Set(days)].sort();
  const today = localDay();
  const yesterday = localDay(new Date(Date.now() - 86400000));
  let streak = 0;
  let current = sorted.includes(today) ? today : sorted.includes(yesterday) ? yesterday : null;
  if (!current) return 0;
  streak = 1;
  for (let i = sorted.indexOf(current) - 1; i >= 0; i--) {
    const [y, m, d] = current.split("-").map(Number);
    const expected = localDay(new Date(y, m - 1, d - 1));
    if (sorted[i] === expected) {
      streak++;
      current = expected;
    } else {
      break;
    }
  }
  return streak;
}