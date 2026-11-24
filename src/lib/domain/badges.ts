import type { Event, Theme } from "./types";

export type BadgeId =
  | "primeira-resposta"
  | "dez-acertos"
  | "tres-temas"
  | "tres-dias"
  | "acerto-retentativa"
  | "abriu-ajuda";

export interface Badge {
  id: BadgeId;
  label: string;
  description: string;
}

export type { Event, Theme };

export const BADGES: Badge[] = [
  {
    id: "primeira-resposta",
    label: "Primeiro passo",
    description: "Respondeu a primeira carta.",
  },
  {
    id: "dez-acertos",
    label: "Persistência",
    description: "Acumulou dez respostas corretas.",
  },
  {
    id: "tres-temas",
    label: "Explorador",
    description: "Respondeu cartas de três temas diferentes.",
  },
  {
    id: "tres-dias",
    label: "Constância",
    description: "Respondeu em três dias distintos.",
  },
  {
    id: "acerto-retentativa",
    label: "Não desistiu",
    description: "Acertou uma carta na retentativa.",
  },
  {
    id: "abriu-ajuda",
    label: "Pediu ajuda",
    description: "Abriu a tela de ajuda ao menos uma vez.",
  },
];

export function badgesFor(events: Event[]): BadgeId[] {
  const earned: BadgeId[] = [];

  if (events.length > 0) earned.push("primeira-resposta");

  const correctCount = events.filter((e) => e.type === "answer" && e.correct).length;
  if (correctCount >= 10) earned.push("dez-acertos");

  const themes = new Set(events.filter((e) => e.type === "answer").map((e) => e.theme));
  if (themes.size >= 3) earned.push("tres-temas");

  const days = new Set(events.filter((e) => e.type === "answer").map((e) => e.day));
  if (days.size >= 3) earned.push("tres-dias");

  const hasRetryCorrect = events.some((e) => e.type === "answer" && e.correct && (e.attempt ?? 1) > 1);
  if (hasRetryCorrect) earned.push("acerto-retentativa");

  const openedHelp = events.some((e) => e.type === "help_open");
  if (openedHelp) earned.push("abriu-ajuda");

  return earned;
}