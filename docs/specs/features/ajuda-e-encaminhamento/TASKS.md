# Tasks - ajuda e encaminhamento

Cada tarefa carrega `(R#)` do requisito e `(V#)` do critério da
[SPECIFICATION.md](./SPECIFICATION.md).

Ordem: conteúdo antes da tela, tela antes do link global.
Sem migration: o evento é gravado no log do cliente.

## Fase 1 - conteúdo

- [ ] `content/help.json` (novo): `adult_tip` e os quatro canais com `name`, `what` e `number`. (R2, R5)
- [ ] `tests/ajuda.test.ts` (novo): `canais_obrigatorios` e leitura do campo `adult_tip`. (V2, V5)

## Fase 2 - tela

- [ ] `src/routes/Help.svelte` (novo): frase de adulto de confiança primeiro, canais depois, botão de
  voltar. Depende de `src/lib/content.ts`. (R2, R4, R5)
- [ ] `src/routes/Help.svelte`: `$effect` que chama `record({ type: "help_opened" })` uma vez por
  montagem. Depende de `src/lib/store.svelte.ts`. (R3)
- [ ] `src/App.svelte`: link de ajuda no topo, visível em todas as rotas. (R1)

## Fase 3 - testes

- [ ] `tests/ajuda.test.ts`: `abrir_ajuda_registra_um_evento` e `tela_sem_campo_de_entrada`. (V3, V4)
- [ ] `e2e/ajuda.spec.ts` (novo): `ajuda_alcancavel_de_qualquer_pagina`. (V1)

## Fase 4 - documentação

- [ ] `docs/specs/STATE.md`: registrar a tela como concluída.

## Verificação no ambiente real

- [ ] `npm run dev`, abrir `#/ajuda` em celular simulado e conferir que os três números aparecem sem
  rolagem horizontal. (R2)
