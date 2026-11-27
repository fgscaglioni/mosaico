import { test, expect } from "@playwright/test";
import { clicarRespostaCorreta } from "./responder";

// Regressão: abrir uma carta por link direto precisa definir o tema e gravar a resposta.
// Sem isso, recordAnswer saía cedo, nada era salvo e a tela não dava feedback.
test.describe("Link direto para uma carta", () => {
  test("registra_resposta_em_link_direto (V2)", async ({ page }) => {
    await page.goto("/#/carta/bullying-01");
    await expect(page.locator(".enunciado")).toBeVisible();

    await clicarRespostaCorreta(page);
    await expect(page.getByRole("button", { name: /Confirmar resposta/i })).toBeEnabled();
    await page.getByRole("button", { name: /Confirmar resposta/i }).click();

    const feedback = page.locator('[aria-live="polite"]');
    await expect(feedback).toContainText("Muito bem");
    await expect(feedback).toContainText("+10 XP");

    await page.getByRole("button", { name: /Próxima carta/i }).click();
    await expect(page.locator(".enunciado")).toBeVisible();

    await page.goto("/#/progresso");
    await expect(page.locator(".metricas-grid .valor").first()).toHaveText("10");
  });
});
