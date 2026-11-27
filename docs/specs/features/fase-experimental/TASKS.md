# Tasks - fase experimental

Cada tarefa carrega `(R#)` do requisito e `(V#)` do critério da
[SPECIFICATION.md](./SPECIFICATION.md).

## Fase 1 - componente e montagem

- [x] `src/lib/components/AvisoExperimental.svelte` (novo): texto completo do aviso, ícone e
  botão de fechar. (R1)
- [x] `src/App.svelte`: monta o aviso em todas as telas, sob a barra global, com estado em
  memória. (R1, R2)

## Fase 2 - testes

- [x] `tests/aviso.test.ts` (novo): presença no `App`, texto das três afirmações e ausência de
  preferência persistente. (V1, V2)

## Verificação no ambiente real

- [x] `npm run dev`, abrir `#/` e confirmar o aviso visível; fechar, recarregar e confirmar que
  o aviso voltou. (V1, V2)
