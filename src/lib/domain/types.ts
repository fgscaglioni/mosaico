export type Theme = "bullying" | "racismo" | "xenofobia" | "genero";

export type BadgeId =
  | "primeira-resposta"
  | "dez-acertos"
  | "tres-temas"
  | "tres-dias"
  | "acerto-retentativa"
  | "abriu-ajuda";

export interface Event {
  id: string;
  type: "answer" | "help_open" | "help_opened";
  timestamp: number;
  day: string;
  card_id?: string;
  theme?: Theme;
  correct?: boolean;
  attempt?: number;
  xp?: number;
}