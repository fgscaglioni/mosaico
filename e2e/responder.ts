import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Page } from "@playwright/test";

/**
 * Clica na alternativa correta da carta exibida, pelo texto do catálogo.
 * As alternativas são embaralhadas a cada apresentação, então posição
 * fixa (nth(1)) não pode ser usada.
 */
export async function clicarRespostaCorreta(page: Page): Promise<void> {
  const catalogo = JSON.parse(
    readFileSync(resolve(process.cwd(), "content/cards.pt-BR.json"), "utf-8"),
  ) as {
    cards: {
      stem: string;
      options: string[];
      answer_index: number;
    }[];
  };
  const enunciado = (await page.locator(".enunciado").innerText()).trim();
  const carta = catalogo.cards.find((c) => enunciado.includes(c.stem.trim().slice(0, 40)));
  if (!carta) throw new Error("carta exibida não encontrada no catálogo");
  const textoCorreto = carta.options[carta.answer_index];
  await page.locator(".opcao", { hasText: textoCorreto }).click();
}
