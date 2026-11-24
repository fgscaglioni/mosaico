import { test, expect } from "@playwright/test";

test.describe("Modo offline", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("abre_sem_rede_depois_do_primeiro_carregamento (V1)", async ({ page, context }) => {
    await context.setOffline(true);
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Mosaico");
  });

  test("responde_carta_sem_rede (V2)", async ({ page, context }) => {
    await page.goto("/#/tema");
    await page.waitForLoadState("networkidle");
    await page.locator(".tema-card").first().click();
    await page.waitForFunction(() => location.hash.includes("/carta/"));
    await expect(page.locator(".enunciado")).toBeVisible();

    await context.setOffline(true);

    await page.locator(".opcao").nth(1).click();
    const confirmar = page.getByRole("button", { name: /Confirmar resposta/i });
    await expect(confirmar).toBeEnabled();
    await confirmar.click();

    await expect(page.locator('[aria-live="polite"]')).toContainText("Muito bem");
    await expect(page.locator('[aria-live="polite"]')).toContainText("+10 XP");
  });

  test("recarregar_sem_rede_mantem_progresso (V3)", async ({ page, context }) => {
    await page.goto("/#/tema");
    await page.waitForLoadState("networkidle");
    await page.locator(".tema-card").first().click();
    await page.waitForFunction(() => location.hash.includes("/carta/"));
    await expect(page.locator(".enunciado")).toBeVisible();

    await page.locator(".opcao").nth(1).click();
    const confirmar = page.getByRole("button", { name: /Confirmar resposta/i });
    await expect(confirmar).toBeEnabled();
    await confirmar.click();
    await expect(page.locator('[aria-live="polite"]')).toContainText("Muito bem");

    await context.setOffline(true);
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    await page.goto("/#/progresso");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".metricas-grid .valor").first()).toHaveText("10");
  });

  test("nenhuma_requisicao_bloqueante (V4)", async ({ page, context }) => {
    await context.setOffline(true);

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Mosaico");

    await page.goto("/#/tema");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Temas");

    await page.locator(".tema-card").first().click();
    await page.waitForFunction(() => location.hash.includes("/carta/"));
    await expect(page.locator(".enunciado")).toBeVisible();

    await page.goto("/#/progresso");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Seu Progresso");
  });
});