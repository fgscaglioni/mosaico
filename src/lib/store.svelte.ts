import { localDay, daysInARow } from "./domain/streak";
import { badgesFor, BADGES, type BadgeId, type Badge } from "./domain/badges";
import { levelFromXp } from "./domain/xp";
import { getAllEvents, getEventsByDay, saveEvent, savePending, getPendingEvents } from "./db";
import { getDeviceId } from "./device";
import { catalog } from "./content";
import type { Card } from "./content";
import type { Event as DomainEvent } from "./domain/types";
import type { StoredEvent } from "./db";

interface ProgressState {
  xp: number;
  level: number;
  xpInLevel: number;
  xpToNext: number;
  streak: number;
  badges: BadgeId[];
  respostas: number;
  acertos: number;
  porTema: Record<string, { respostas: number; acertos: number; xp: number }>;
}

const initialProgress: ProgressState = {
  xp: 0,
  level: 1,
  xpInLevel: 0,
  xpToNext: 50,
  streak: 0,
  badges: [],
  respostas: 0,
  acertos: 0,
  porTema: {},
};

let progress = $state<ProgressState>({ ...initialProgress });
let loading = $state(true);
let currentTheme = $state<Card["theme"] | null>(null);
let currentCard = $state<Card | null>(null);
let attempt = $state(1);
let feedback = $state<{ type: "correct" | "wrong"; message: string; xp: number } | null>(null);
let showRetry = $state(false);
let queue = $state<string[]>([]);

export const store = {
  get progress() {
    return progress;
  },
  get loading() {
    return loading;
  },
  get currentTheme() {
    return currentTheme;
  },
  get currentCard() {
    return currentCard;
  },
  get attempt() {
    return attempt;
  },
  get feedback() {
    return feedback;
  },
  get showRetry() {
    return showRetry;
  },
  get queue() {
    return queue;
  },
  selectTheme,
  loadCard,
  recordAnswer,
  retry,
  recordHelpOpen,
  getBadgeInfo,
  clearFeedback,
  syncNow,
};

function storedToDomain(events: StoredEvent[]): DomainEvent[] {
  return events.map((e) => ({
    id: e.event_id,
    type: e.type,
    timestamp: e.client_ts,
    day: e.local_day,
    card_id: e.card_id,
    theme: e.theme as DomainEvent["theme"],
    correct: e.correct,
    attempt: e.attempt,
    xp: e.xp,
  }));
}

function recalcProgress(events: DomainEvent[]): ProgressState {
  const answerEvents = events.filter((e) => e.type === "answer");
  const xp = answerEvents.reduce((sum, e) => sum + (e.xp ?? 0), 0);
  const acertos = answerEvents.filter((e) => e.correct).length;
  const respostas = answerEvents.length;
  const { level, xpInLevel, xpToNext } = levelFromXp(xp);
  const days = [...new Set(answerEvents.map((e) => e.day))];
  const streak = daysInARow(days);
  const badges = badgesFor(events);

  const porTema: Record<string, { respostas: number; acertos: number; xp: number }> = {};
  for (const e of answerEvents) {
    if (!e.theme) continue;
    if (!porTema[e.theme]) {
      porTema[e.theme] = { respostas: 0, acertos: 0, xp: 0 };
    }
    porTema[e.theme].respostas++;
    if (e.correct) porTema[e.theme].acertos++;
    porTema[e.theme].xp += e.xp ?? 0;
  }

  return { xp, level, xpInLevel, xpToNext, streak, badges, respostas, acertos, porTema };
}

async function loadFromDB() {
  try {
    const events = await getAllEvents();
    progress = recalcProgress(storedToDomain(events));
    queue = events.filter((e) => e.type === "answer" && !e.correct).map((e) => e.card_id ?? "");
  } catch {
    progress = { ...initialProgress };
    queue = [];
  } finally {
    loading = false;
  }
}

export async function initStore(): Promise<void> {
  await loadFromDB();
}

export function selectTheme(theme: Card["theme"]): void {
  currentTheme = theme;
  const themeCards = catalog.cards.filter((c) => c.theme === theme).map((c) => c.id);
  queue = themeCards;
  currentCard = null;
  attempt = 1;
  feedback = null;
  showRetry = false;
}

export function loadCard(cardId: string): void {
  const card = catalog.cards.find((c) => c.id === cardId);
  currentCard = card ?? null;
  attempt = 1;
  feedback = null;
  showRetry = false;
}

export async function recordAnswer(cardId: string, answerIndex: number): Promise<void> {
  if (!currentCard || !currentTheme) return;

  const card = currentCard;
  const correct = answerIndex === card.answer_index;
  const xp = correct ? (attempt === 1 ? 10 : 4) : 1;

  const deviceId = await getDeviceId();
  const event = {
    event_id: crypto.randomUUID(),
    device_id: deviceId,
    type: "answer" as const,
    card_id: cardId,
    theme: currentTheme,
    correct,
    attempt,
    xp,
    local_day: localDay(),
    client_ts: Date.now(),
    catalog_version: catalog.catalog_version,
  };

  await saveEvent(event);
  await savePending(event);

  const events = await getAllEvents();
  progress = recalcProgress(storedToDomain(events));

  if (correct) {
    feedback = { type: "correct", message: card.explanation, xp };
    showRetry = false;
    const nextId = queue.find((id) => catalog.cards.find((c) => c.id === id)?.theme === currentTheme);
    if (nextId && nextId !== cardId) {
      loadCard(nextId);
    } else {
      currentCard = null;
    }
  } else {
    feedback = { type: "wrong", message: card.explanation, xp };
    showRetry = true;
    queue = [...queue.filter((id) => id !== cardId)];
    const insertAt = Math.min(2, queue.length);
    queue.splice(insertAt, 0, cardId);
  }
}

export function retry(): void {
  if (!currentCard) return;
  attempt++;
  feedback = null;
  showRetry = false;
}

export async function recordHelpOpen(): Promise<void> {
  const deviceId = await getDeviceId();
  const event = {
    event_id: crypto.randomUUID(),
    device_id: deviceId,
    type: "help_open" as const,
    local_day: localDay(),
    client_ts: Date.now(),
    catalog_version: catalog.catalog_version,
  };
  await saveEvent(event);
  await savePending(event);
  const events = await getAllEvents();
  progress = recalcProgress(storedToDomain(events));
}

export function getBadgeInfo(id: BadgeId): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

export function clearFeedback(): void {
  feedback = null;
}

export async function syncNow(): Promise<void> {
  const { syncPending } = await import("./sync");
  await syncPending();
  const events = await getAllEvents();
  progress = recalcProgress(storedToDomain(events));
}