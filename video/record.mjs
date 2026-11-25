// Grava as cenas do app com Playwright. Cada cena vira um MP4 próprio em video/out/clips/.
// Uso: node video/record.mjs [--base http://localhost:8799] [--so cena2,cena3]
import { chromium } from "playwright";
import { mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SAIDA = resolve(AQUI, "out/clips");
const VIDEOS = resolve(AQUI, "out/videos-tmp");

const argBase = process.argv.indexOf("--base");
const BASE = argBase > -1 ? process.argv[argBase + 1] : "http://localhost:8799";

const argSo = process.argv.indexOf("--so");
const SO = argSo > -1 ? process.argv[argSo + 1].split(",") : null;

// O gravador do Playwright só preenche o quadro quando o tamanho do vídeo é igual ao viewport
// em deviceScaleFactor 1; com dsf 2 a página sai 1x no canto e o resto vira cinza.
const VIEWPORT = { width: 406, height: 908 }; // igual à tela da moldura na composição
const TAMANHO_VIDEO = { ...VIEWPORT };

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function querCena(id) {
  return !SO || SO.includes(id);
}

// Espera o service worker controlar a página: sem isso a cena offline recarrega vazia.
async function aquecerServiceWorker(page) {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
    timeout: 20000,
  });
  await page.reload({ waitUntil: "networkidle" });
  await espera(600);
}

async function responderCarta(page, pausaLeitura = 2200) {
  await page.locator(".enunciado").waitFor({ state: "visible" });
  await espera(pausaLeitura);
  // todas as cartas do catálogo têm answer_index = 1; o teste do catálogo garante isso
  await page.locator(".opcao").nth(1).click();
  await espera(900);
  await page.getByRole("button", { name: /Confirmar resposta/i }).click();
  await page.locator('[aria-live="polite"]').filter({ hasText: /Muito bem|Ainda não/ }).waitFor();
  await espera(2600);
}

const CENAS = {
  // Home com as quatro trilhas, depois a grade de temas.
  cena2: async (page) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await espera(2500);
    await page.mouse.wheel(0, 260);
    await espera(2200);
    await page.mouse.wheel(0, -260);
    await espera(800);
    await page.getByRole("button", { name: /Progresso detalhado/i }).click();
    await page.waitForFunction(() => location.hash.includes("/progresso"));
    await page.locator("h1", { hasText: "Seu Progresso" }).waitFor();
    await espera(2600);
    await page.mouse.wheel(0, 220);
    await espera(2200);
    await page.mouse.wheel(0, -220);
    await espera(1200);
    await page.locator("button.voltar").click();
    await espera(1500);
  },

  // Prova do modo avião: rede desligada no contexto, duas cartas respondidas.
  cena3: async (page, context) => {
    await aquecerServiceWorker(page);
    await context.setOffline(true);
    await page.goto(BASE + "/#/tema", { waitUntil: "domcontentloaded" });
    await espera(1800);
    await page.locator(".tema-card").first().click();
    await page.waitForFunction(() => location.hash.includes("/carta/"));
    await espera(1200);
    await responderCarta(page, 2600);
    await page.getByRole("button", { name: /Próxima carta/i }).click();
    await espera(1400);
    await responderCarta(page, 2400);
    await espera(2400);
    await context.setOffline(false);
  },

  // Painel público somando os eventos que subiram.
  cena4: async (page) => {
    await page.goto(BASE + "/#/painel", { waitUntil: "networkidle" });
    await page.locator(".tela-painel").waitFor();
    await espera(3000);
    await page.mouse.wheel(0, 240);
    await espera(3000);
    await page.mouse.wheel(0, 240);
    await espera(3000);
    await page.mouse.wheel(0, -480);
    await espera(2500);
  },

  // Curadoria: resposta correta e o modal com explicação e fonte.
  cena5: async (page) => {
    await page.goto(BASE + "/#/carta/bullying-02", { waitUntil: "networkidle" });
    await responderCarta(page, 4200);
    await page.mouse.wheel(0, 200);
    await espera(4000);
    await page.mouse.wheel(0, 200);
    await espera(4000);
    await page.mouse.wheel(0, -400);
    await espera(3000);
  },

  // Tela de ajuda: orientação ao adulto e os canais oficiais.
  cena7: async (page) => {
    await page.goto(BASE + "/#/ajuda", { waitUntil: "networkidle" });
    await page.locator(".lista-canais").waitFor();
    await espera(3500);
    await page.mouse.wheel(0, 220);
    await espera(3500);
    await page.mouse.wheel(0, 220);
    await espera(2500);
    await page.mouse.wheel(0, -440);
    await espera(4300); // folga para o corte do começo em branco
  },
};

async function gravar(nome, roteiro) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    locale: "pt-BR",
    recordVideo: { dir: VIDEOS, size: TAMANHO_VIDEO },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => console.error(`[${nome}] erro na página:`, e.message));

  try {
    await roteiro(page, context);
  } finally {
    const video = page.video();
    await context.close();
    if (video) {
      const destino = resolve(SAIDA, `${nome}.mp4`);
      await video.saveAs(destino);
      console.log(`[${nome}] gravado em ${destino}`);
    }
  }
}

if (!SO) rmSync(SAIDA, { recursive: true, force: true }); // --so preserva os clipes das outras cenas
rmSync(VIDEOS, { recursive: true, force: true });
mkdirSync(SAIDA, { recursive: true });
mkdirSync(VIDEOS, { recursive: true });

const browser = await chromium.launch();
try {
  for (const [nome, roteiro] of Object.entries(CENAS)) {
    if (!querCena(nome)) continue;
    console.log(`[${nome}] gravando…`);
    await gravar(nome, roteiro);
  }
} finally {
  await browser.close();
}

console.log("gravação concluída");
