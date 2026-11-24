# Tasks - modo offline

Cada tarefa carrega `(R#)` do requisito e `(V#)` do critério da
[SPECIFICATION.md](./SPECIFICATION.md).

Ordem: persistência antes do service worker, porque o E2E cobra as duas coisas juntas.
Sem migration: IndexedDB na versão 1, com índice `synced`.

## Fase 1 - persistência local

- [ ] `src/lib/db.ts` (novo): abertura do IndexedDB `mosaico`, store `events` com `keyPath event_id`,
  índice `synced`, funções `saveEvent`, `allEvents`, `pendingEvents`, `markSynced`. (R2, R3)
- [ ] `src/lib/device.ts` (novo): `deviceId()` com UUID em `localStorage`. (R2)
- [ ] `src/lib/store.svelte.ts`: `load()` que hidrata `state.events` de `allEvents()`. (R3)

## Fase 2 - service worker

- [ ] `vite.config.ts` (novo): `VitePWA` com `registerType: "autoUpdate"`, `globPatterns` de assets,
  `navigateFallback: "index.html"` e `runtimeCaching` `NetworkOnly` para `/api/`. (R1, R5)
- [ ] `src/lib/router.svelte.ts` (novo): leitura de `location.hash` e `navigate()`. (R1)

## Fase 3 - teste

- [ ] `playwright.config.ts` (novo): `webServer` com `npm run build && node server.mjs`, porta 8787,
  `DATA_DIR=data-e2e`. (V1)
- [ ] `e2e/offline.spec.ts` (novo): `abre_sem_rede_depois_do_primeiro_carregamento`,
  `responde_carta_sem_rede`, `recarregar_sem_rede_mantem_progresso` e `nenhuma_requisicao_bloqueante`. (V1–V4)

## Fase 4 - documentação

- [ ] `README.md`: registrar o limite de persistência em iOS. (Fora de escopo)

## Verificação no ambiente real

- [ ] `npm run test:e2e` devolve 4 testes passando. (V1–V4)
- [ ] `grep -n "autoUpdate\|NetworkOnly" vite.config.ts` devolve as duas linhas. (V5)
