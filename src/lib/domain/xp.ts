export const XP_FIRST_CORRECT = 10;
export const XP_RETRY_CORRECT = 4;
export const XP_WRONG = 1;

export function xpForAnswer(correct: boolean, attempt: number): number {
  if (correct) {
    return attempt === 1 ? XP_FIRST_CORRECT : XP_RETRY_CORRECT;
  }
  return XP_WRONG;
}

export function levelFromXp(xp: number): { level: number; xpInLevel: number; xpToNext: number } {
  if (xp < 0) xp = 0;
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const xpForCurrentLevel = 50 * (level - 1) ** 2;
  const xpForNextLevel = 50 * level ** 2;
  const xpInLevel = xp - xpForCurrentLevel;
  const xpToNext = xpForNextLevel - xp;
  return { level, xpInLevel, xpToNext };
}