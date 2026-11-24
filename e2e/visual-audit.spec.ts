import { test, expect } from "@playwright/test";

test("auditoria visual: estilos computados light e dark", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const light = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    const card = document.querySelector(".tema-card");
    const cs = card ? getComputedStyle(card) : null;
    return {
      theme: document.documentElement.getAttribute("data-theme") || "light",
      bg: b.backgroundColor,
      color: b.color,
      radius: cs?.borderRadius,
      shadow: cs?.boxShadow,
    };
  });
  console.log("LIGHT:", JSON.stringify(light));

  expect(light.bg).toBe("rgb(253, 251, 247)"); // #FDFBF7
  expect(light.color).toBe("rgb(30, 41, 59)"); // #1E293B
  expect(light.radius).toContain("24px"); // squircle
  expect(light.shadow).toMatch(/[45]px/); // 2.5D (4–5px)

  await page.getByRole("button", { name: /tema escuro/i }).click();
  await page.waitForTimeout(600); // aguardar a transição de 0,3s terminar antes de medir

  const dark = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    return {
      theme: document.documentElement.getAttribute("data-theme"),
      bg: b.backgroundColor,
      color: b.color,
      persisted: localStorage.getItem("mosaico-theme"),
    };
  });
  console.log("DARK:", JSON.stringify(dark));

  expect(dark.theme).toBe("dark");
  expect(dark.bg).toBe("rgb(19, 31, 36)"); // #131F24
  expect(dark.color).toBe("rgb(248, 250, 252)"); // #F8FAFC
  expect(dark.persisted).toBe("dark");

  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-theme"))).toBe("dark");
});