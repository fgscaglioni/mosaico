# IMPLEMENTATION.md — como construir

Este documento carrega o que as specs não carregam: versões, scaffold, comandos, ordem entre features,
tokens de interface e as armadilhas que já custaram tempo. **Requisito é na spec; aqui é o encanamento.**
Em caso de divergência entre este arquivo e uma spec, a spec vence.

## 1. Pré-requisitos

| Item | Versão | Observação |
|---|---|---|
| Node | 22 (`node:22-bookworm-slim` no container) | `crypto.randomUUID` no cliente exige navegador moderno |
| npm | o que vem com o Node 22 | lockfile commitado |
| Docker | qualquer recente | só para o deploy e para provar o build |

Sem banco de dados. Sem backend além de `server.mjs`. Sem CMS.

## 2. Scaffold

`package.json`:

```json
{
  "name": "mosaico",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "node server.mjs",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check": "svelte-check --tsconfig ./tsconfig.json"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@sveltejs/vite-plugin-svelte": "^5.0.0",
    "@tsconfig/svelte": "^5.0.4",
    "svelte": "^5.16.0",
    "svelte-check": "^4.1.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vite-plugin-pwa": "^0.21.1",
    "vitest": "^2.1.0"
  },
  "dependencies": {
    "zod": "^3.24.0"
  }
}
```

`tsconfig.json`:

```json
{
  "extends": "@tsconfig/svelte/tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "resolveJsonModule": true,
    "types": ["vite/client"],
    "verbatimModuleSyntax": true
  },
  "include": ["src/**/*.ts", "src/**/*.svelte", "tests/**/*.ts", "e2e/**/*.ts"]
}
```

`svelte.config.js`:

```js
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default { preprocess: vitePreprocess() };
```

`vite.config.ts` — já inclui o service worker e o proxy de desenvolvimento:

```ts
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-512.png"],
      manifest: {
        name: "Mosaico",
        short_name: "Mosaico",
        description: "Peças que ensinam respeito. Aprender mesmo sem internet.",
        lang: "pt-BR",
        theme_color: "#1B1815",
        background_color: "#FBF7EE",
        display: "standalone",
        start_url: "/",
        icons: [{ src: "icon-512.png", sizes: "512x512", type: "image/png" }],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,json,woff2}"],
        navigateFallback: "index.html",
        runtimeCaching: [{ urlPattern: /\/api\//, handler: "NetworkOnly" }],
      },
    }),
  ],
  server: { proxy: { "/api": "http://localhost:8787" } },
});
```

`index.html`:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#1B1815" />
    <title>Mosaico</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`src/main.ts`:

```ts
import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";

mount(App, { target: document.getElementById("app")! });
```

`src/lib/router.svelte.ts` (roteamento por hash, exigido pela spec de offline):

```ts
export const route = $state({ path: "/" });

const read = (): string => location.hash.slice(1) || "/";

route.path = read();
window.addEventListener("hashchange", () => {
  route.path = read();
});

export function navigate(path: string): void {
  location.hash = path;
}
```

Ícone: gerar um PNG 512×512 simples (quadrado de cor `--accent` com "M" branco) em
`public/icon-512.png`. Sem ele o build passa, mas o manifest acusa ícone ausente.

## 3. Árvore final

```
mosaico/
├── AGENTS.md
├── README.md
├── LICENSE
├── package.json
├── package-lock.json        # gerado pelo npm, commitado
├── tsconfig.json
├── vite.config.ts
├── svelte.config.js
├── playwright.config.ts
├── index.html
├── server.mjs
├── Dockerfile
├── content/
│   ├── cards.pt-BR.json     # 80 cartas, já no repositório
│   └── help.json            # canais de ajuda, já no repositório
├── public/
│   ├── favicon.svg
│   └── icon-512.png
├── src/
│   ├── main.ts
│   ├── app.css
│   ├── App.svelte
│   ├── lib/
│   │   ├── router.svelte.ts
│   │   ├── content.ts
│   │   ├── db.ts
│   │   ├── device.ts
│   │   ├── sync.ts
│   │   ├── store.svelte.ts
│   │   └── domain/
│   │       ├── types.ts
│   │       ├── xp.ts
│   │       ├── streak.ts
│   │       ├── badges.ts
│   │       └── queue.ts
│   └── routes/
│       ├── Home.svelte
│       ├── Theme.svelte
│       ├── Card.svelte
│       ├── Progress.svelte
│       ├── Help.svelte
│       └── Panel.svelte
├── tests/
│   ├── cartas.test.ts
│   ├── pratica.test.ts
│   ├── ajuda.test.ts
│   └── sync.test.ts
└── e2e/
    ├── offline.spec.ts
    └── ajuda.spec.ts
```

## 4. Comandos

| Objetivo | Comando | Saída esperada |
|---|---|---|
| Instalar | `npm install` | `node_modules` criado, `package-lock.json` gerado |
| Desenvolver | `npm run dev` | servidor em `http://localhost:5173`, `/api` proxiado para 8787 |
| Servir build | `npm run build && node server.mjs` | `http://localhost:8787`, `GET /api/health` responde `ok` |
| Testes de unidade | `npm test` | todos verdes |
| Tipos | `npx svelte-check --tsconfig ./tsconfig.json` | `0 errors` |
| E2E | `npx playwright install chromium && npm run test:e2e` | testes do `e2e/` verdes |
| Validação das specs | `python3 scripts/validate_specs.py docs/specs/features` | `5 spec pairs checked, 0 problems` |

`npm run test:e2e` sobe o servidor sozinho via `webServer` do Playwright, com `npm run build` antes.

## 5. Ordem de execução

As specs são por feature; esta é a ordem que evita retrabalho. Cada linha referencia o `TASKS.md`.

| # | Passo | Spec |
|---|---|---|
| 1 | Scaffold desta seção (package.json, tsconfig, vite.config, index.html, main.ts, App mínimo) e `npm run dev` abrindo | — |
| 2 | `content.ts` + testes do catálogo (o JSON já existe com 80 cartas) | cartas-curadas, fases 1 e 3 |
| 3 | Domínio puro: `xp`, `streak`, `badges`, `queue` + testes | pratica-gamificada, fase 1 |
| 4 | `types.ts`, `db.ts`, `device.ts`, `store.svelte.ts` | pratica-gamificada fase 2 + modo-offline fase 1 |
| 5 | Telas `Home`, `Theme`, `Card` + `app.css` | pratica-gamificada, fase 3 |
| 6 | `Help.svelte` + link global no `App.svelte` | ajuda-e-encaminhamento, fases 2 e 3 |
| 7 | `server.mjs` + `sync.ts` + `Panel.svelte` | sincronizacao-de-eventos |
| 8 | Playwright: `playwright.config.ts`, `offline.spec.ts`, `ajuda.spec.ts` | modo-offline fase 3 + ajuda |
| 9 | `Dockerfile`, build, deploy | PROJECT.md §7 |

O `vite.config.ts` do passo 1 já entrega o service worker; a tarefa de modo-offline que o cita é de
verificação (`V5`), não de escrita.

## 6. Interface: tokens e regras

```css
:root {
  --paper: #FBF7EE;  --ink: #1B1815;  --rule: #D9D2C7;
  --accent: #A63D00; --ok: #2F6B4F;   --erro: #B5342B;
  --tema-bullying: #A63D00; --tema-racismo: #6B3FA0;
  --tema-xenofobia: #1F6F8B; --tema-genero: #2F6B4F;
  --raio: 16px; --raio-botao: 14px;
}
```

- Base 18 px, entrelinha 1.55; `h1` 30 px; `h2` 22 px; rótulo 13 px em maiúsculas com `letter-spacing`.
- Espaçamento só em múltiplos de 4 (4, 8, 12, 16, 24, 32).
- Alvo de toque mínimo 44 px de altura, incluindo os links do topo.
- Contraste mínimo AA (4.5:1) para texto; `--ink` sobre `--paper` passa.
- **Cor nunca é o único canal.** A grade de domínio mostra o percentual em texto, e cada célula tem
  também o valor lido por leitor de tela.
- Feedback de resposta em bloco com `aria-live="polite"`.
- Tipografia: `system-ui`, sem fonte remota (oficina sem rede não baixa webfont). Se usar Nunito, ela
  entra empacotada e o aviso OFL vai junto, conforme o `README`.
- Ícone e marca: "M" sobre quadrado `--accent`, sem ilustração de personagem.

## 7. Armadilhas conhecidas

1. **Service worker no Playwright:** a primeira carga nunca é controlada. O teste precisa de
   `await page.waitForFunction(() => navigator.serviceWorker?.controller !== null)` e, se necessário,
   um `reload()` antes de simular offline.
2. **SW só existe no build.** `npm run dev` não registra service worker; todo teste de offline roda
   contra `npm run build && node server.mjs`.
3. **`navigateFallback: "index.html"`** é o que faz navegação offline funcionar. Sem ele, rota nova
   offline dá tela branca.
4. **IndexedDB não é `localStorage`:** não há API síncrona. Cada operação é `Promise`; nunca ler dentro
   de template sem estado carregado.
5. **`import` de JSON** exige `resolveJsonModule: true` no `tsconfig` e caminho relativo
   (`../../content/cards.pt-BR.json`).
6. **`crypto.randomUUID()`** exige contexto seguro (`https` ou `localhost`); no container servido por
   IP puro, usar fallback.
7. **`npm ci`** no Docker exige `package-lock.json` commitado. Rodar `npm install` uma vez e commitar o
   lockfile antes de construir a imagem.
8. **Path traversal** no servidor estático: normalizar o caminho e recusar o que não começa com o
   diretório de build.
9. **`DATA_DIR`** precisa ser ignorado pelo git (`data/`, `data-e2e/`) e nunca ir para a imagem.
10. **Playwright baixa o Chromium:** `npx playwright install chromium` antes do primeiro `test:e2e`;
    no CI, usar `--with-deps`.

## 8. Definição de pronto

- [ ] `npm test` verde, com os identificadores nomeados nas specs.
- [ ] `npm run test:e2e` verde (offline e ajuda).
- [ ] `npx svelte-check --tsconfig ./tsconfig.json` devolve `0 errors`.
- [ ] `docker build` e `docker run` com `GET /api/health` respondendo.
- [ ] Demo pública abre em janela anônima e responde sem rede depois do primeiro acesso.
- [ ] Nenhum campo de texto livre no produto.
- [ ] `content/cards.pt-BR.json` com 80 cartas e `catalog_version` coerente.
- [ ] `docs/specs/STATE.md` atualizado com a fase concluída.

## 9. O que não fazer

- **Não escrever carta nova sem ordem explícita do dono.** O catálogo é curadoria do dono; as 80
  cartas foram redigidas por ordem em 27/11/2026 e **todas** esperam revisão humana. Alterar texto de carta exige ordem explícita.
- **Não trocar Svelte por SvelteKit, nem Vite por outro bundler.** Decisão registrada no ADR-0002.
- **Não colocar banco de dados.** O servidor é append-only em arquivo (ADR-0003).
- **Não adicionar login, nome, foto, upload, chat ou ranking.** Contraria o ADR-0004 e o item 6.9 do
  regulamento.
- **Não chamar LLM em tempo de execução.** O conteúdo é estático e revisado.
- **Não commitar no período congelado** (de 2026-11-30 23h59 até a final, em 12/12): commit nesse intervalo pode desclassificar (item 8.4 do regulamento).
- **Não tornar o repositório privado antes de 2026-12-15** (item 6.7).
