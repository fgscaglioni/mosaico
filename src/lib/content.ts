import { z } from "zod";
import cardsJson from "../../content/cards.pt-BR.json";

export const CardSchema = z.object({
  id: z.string().min(1),
  theme: z.enum(["bullying", "racismo", "xenofobia", "genero"]),
  age_band: z.enum(["8-11", "12-14"]),
  objective: z.string().min(1),
  stem: z.string().min(1),
  options: z.array(z.string().min(1)).length(3, "precisa de 3 alternativas").or(z.array(z.string().min(1)).length(4, "precisa de 4 alternativas")),
  answer_index: z.number().int().min(0),
  explanation: z.string().min(60),
  source: z.string().min(1),
  review_status: z.enum(["rascunho", "revisado"]),
});

export const CatalogSchema = z.object({
  catalog_version: z.number().int().positive(),
  cards: z.array(CardSchema).length(20),
});

export type Card = z.infer<typeof CardSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;

const parsed = CatalogSchema.parse(cardsJson);

export const catalog: Catalog = parsed;

export function cardsOf(theme: Card["theme"]): Card[] {
  return catalog.cards.filter((c) => c.theme === theme);
}

export function cardById(id: string): Card | undefined {
  return catalog.cards.find((c) => c.id === id);
}

export function validateAnswerIndex(card: Card): boolean {
  return card.answer_index >= 0 && card.answer_index < card.options.length;
}

export const TERMOS_PROIBIDOS = [
  "sangue",
  "morte",
  "suicídio",
  "estupro",
  "agressão física",
  "arma",
  "tortura",
  "pedofilia",
  "pornografia",
  "nudez",
  "cena gráfica",
  "violência gráfica",
  "discurso de ódio",
  "palavrão",
  "xingamento",
  "puta",
  "merda",
  "caralho",
  "buceta",
  "pinto",
  "cu",
  "arrombado",
  "filho da puta",
  "vai se foder",
  "foda-se",
] as const;

export function contemTermoProibido(texto: string): string | null {
  const lower = texto.toLowerCase();
  for (const termo of TERMOS_PROIBIDOS) {
    const regex = new RegExp(`\\b${termo.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (regex.test(lower)) {
      return termo;
    }
  }
  return null;
}