# Tasks - prática gamificada

Cada tarefa carrega `(R#)` do requisito e `(V#)` do critério da
[SPECIFICATION.md](./SPECIFICATION.md).

Ordem: funções puras antes da tela, porque a tela só desenha o que o módulo calcula.
Sem migration: os eventos são gravados em IndexedDB e serializados no cliente.

## Fase 1 - funções puras

- [ ] `src/lib/domain/xp.ts` (novo): `xpForAnswer`, `levelFromXp`, constantes de XP. Depende de
  nenhum arquivo. (R2, R3)
- [ ] `tests/pratica.test.ts` (novo): `xp_por_tentativa` e `nivel_a_partir_do_xp`. (V2, V3)
- [ ] `src/lib/domain/streak.ts` (novo): `daysInARow` e `localDay` no fuso de Brasília. (R4)
- [ ] `tests/pratica.test.ts`: `sequencia_de_dias` com quatro casos. (V4)
- [ ] `src/lib/domain/badges.ts` (novo): `BADGES` e `badgesFor(events)`. (R5)
- [ ] `tests/pratica.test.ts`: `medalhas_por_comportamento`, sete casos. (V5)
- [ ] `src/lib/domain/queue.ts` (novo): `nextCardId` e `afterWrong`. (R6)
- [ ] `tests/pratica.test.ts`: `carta_errada_volta_tres_posicoes`. (V6)

## Fase 2 - registro do evento

- [ ] `src/lib/domain/types.ts` (novo): `Event`, `Theme`, `Badge`, `BadgeId`. (R1)
- [ ] `src/lib/store.svelte.ts` (novo): `record()`, `recordAnswer()`, `progress()`, `streak()`,
  `earnedBadges()`. Depende de `src/lib/db.ts`. (R1, R8)
- [ ] `tests/pratica.test.ts`: `resposta_registra_evento_com_xp`, com IndexedDB falso em memória. (V1)

## Fase 3 - tela

- [ ] `src/routes/Home.svelte` (novo): nível, XP, sequência, medalhas e os quatro temas. (R8)
- [ ] `src/routes/Card.svelte` (novo): enunciado, alternativas, feedback e retentativa. (R1, R7)
- [ ] `src/app.css` (novo): alvo de 44 px, contraste AA, `aria-live` no feedback, percentual em texto. (R7)

## Fase 4 - testes e documentação

- [ ] `npx svelte-check --tsconfig ./tsconfig.json` devolve `0 errors`. (V7)
- [ ] Suíte verde: `npm test` com os oito identificadores desta spec passando. (V1–V6)
- [ ] `docs/specs/STATE.md`: registrar a fase concluída.

## Verificação no ambiente real

- [ ] `npm run dev`, responder uma carta e conferir que o XP da tela de início bate com o evento no
  IndexedDB. (V8)
- [ ] Inspeção da folha de estilo: `grep -n "min-height: 44px" src/app.css` devolve linha. (V7)
