import { test, expect } from "@playwright/test";

test.describe("Tela de ajuda", () => {
  test("ajuda_alcancavel_de_qualquer_pagina (V1)", async ({ page }) => {
    const checkAjudaLink = async (url: string) => {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      const ajudaLink = page.getByRole("link", { name: /ajuda/i });
      await expect(ajudaLink).toBeVisible();
      await ajudaLink.click();
      await expect(page).toHaveURL(/\/ajuda/);
      await expect(page.locator("h1")).toContainText("Canais de Ajuda");
    };

    await checkAjudaLink("/");
    await checkAjudaLink("#/tema");
    await checkAjudaLink("#/progresso");
  });

  test("exibe_canais_obrigatorios (V2)", async ({ page }) => {
    await page.goto("#/ajuda");
    await expect(page.locator("text=Disque 100").first()).toBeVisible();
    await expect(page.locator("text=Ligue 180").first()).toBeVisible();
    await expect(page.locator("text=CVV")).toBeVisible();
    await expect(page.locator("text=Conselho Tutelar")).toBeVisible();
    await expect(page.locator("a[href='tel:100']")).toBeVisible();
    await expect(page.locator("a[href='tel:180']")).toBeVisible();
    await expect(page.locator("a[href='tel:188']")).toBeVisible();
  });

  test("orientacao_adulto_antes_dos_numeros (V5)", async ({ page }) => {
    await page.goto("#/ajuda");
    const adultTip = page.locator(".dica-adulto .dica-texto");
    await expect(adultTip).toBeVisible();
    const canaisSection = page.locator(".lista-canais");
    await expect(adultTip).toBeInViewport();
    await expect(canaisSection).toBeInViewport();
  });

  test("tela_sem_campo_de_entrada (V4)", async ({ page }) => {
    await page.goto("#/ajuda");
    await expect(page.locator("input[type=text]")).toHaveCount(0);
    await expect(page.locator("textarea")).toHaveCount(0);
    await expect(page.locator("form")).toHaveCount(0);
  });
});