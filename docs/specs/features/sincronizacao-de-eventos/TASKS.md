# Tasks - sincronização de eventos

Cada tarefa carrega `(R#)` do requisito e `(V#)` do critério da
[SPECIFICATION.md](./SPECIFICATION.md).

Ordem: servidor antes do cliente, porque o cliente precisa de contrato estável para enviar.
Sem migration: persistência em `events.jsonl`.

## Fase 1 - servidor

- [ ] `server.mjs` (novo): leitura do log no boot, `Set` de `event_id`, `aggregate()`, `readBody()`. (R1, R4)
- [ ] `server.mjs`: `POST /api/sync` com validação de `event_id`, `appendFileSync` e contagem de
  aceitos e duplicatas. (R2, R3)
- [ ] `server.mjs`: `GET /api/aggregate` com as cinco chaves e `GET /api/health`. (R5, R7)
- [ ] `server.mjs`: servir `dist/` com fallback para `index.html` e guarda de path traversal. (R2)

## Fase 2 - cliente

- [ ] `src/lib/sync.ts` (novo): `pushPending()` com envio de pendentes e `markSynced`, e
  `startAutoSync()` com evento `online` e intervalo de 30 s. Depende de `src/lib/db.ts`. (R6)
- [ ] `src/App.svelte`: chamar `pushPending()` no `onMount` e registrar o cleanup do `startAutoSync()`. (R6)
- [ ] `src/routes/Panel.svelte` (novo): leitura de `/api/aggregate` com estado vazio quando não há
  rede. (R5)

## Fase 3 - testes

- [ ] `tests/sync.test.ts` (novo): `evento_tem_campos_obrigatorios` e `reenvio_nao_duplica`, com
  servidor em processo e `DATA_DIR` temporário. (V1, V3)
- [ ] `e2e/offline.spec.ts`: `sincroniza_quando_a_rede_volta`. (V6)

## Fase 4 - documentação

- [ ] `docs/specs/STATE.md`: registrar servidor e sincronização concluídos.

## Verificação no ambiente real

- [ ] `node server.mjs` e dois `curl` com o mesmo `event_id`: primeiro `accepted: 1`, segundo
  `duplicates: 1`. (V2)
- [ ] `wc -l data/events.jsonl` depois dos dois envios devolve `1`. (V4)
- [ ] `curl /api/aggregate` mostra as cinco chaves e nada além. (V5)
- [ ] `curl /api/health` devolve `{"status":"ok","version":"0.1.0"}`. (V7)
