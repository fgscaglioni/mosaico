# Specification - fase experimental

**Referências normativas:** `docs/specs/PROJECT.md` §8 (revisão humana antes da submissão),
ADR-0004 (zero dados pessoais)
**Origem:** pedido do dono em 27/11/2026. As 80 cartas estão em `rascunho` e nenhuma foi
avaliada por uma pessoa até esta data.

## Problema

O app serve conteúdo que ainda não passou por revisão humana. Quem abre o app não tem como saber
que as questões estão em fase de experimentos, amostragem e validação. Sem o aviso, o usuário pode
tratar o conteúdo como material avaliado e público.

## Decisão

**Aviso global, visível em todas as telas, que pode ser fechado só na sessão.** O aviso diz que o
app está em fase experimental, que as questões não foram avaliadas por humano e que a revisão
humana é indispensável antes de o app ficar público ou entrar em produção. Fechar o aviso não
grava preferência: no próximo carregamento ele volta.

## Requisitos

- **R1.** Todas as telas exibem o aviso de fase experimental com o texto completo: fase de
  experimentos, questões não avaliadas por uma pessoa e revisão humana indispensável antes de
  o app ficar público ou entrar em produção.
- **R2.** O aviso pode ser fechado na sessão, sem gravar preferência em storage; ao recarregar,
  o aviso volta a aparecer.

## Critérios de verificação

- **V1 (R1).** `tests/aviso.test.ts::aviso de fase experimental`: o `App.svelte` monta o aviso e o
  texto contém as três afirmações de R1.
- **V2 (R2).** `tests/aviso.test.ts::aviso de fase experimental`: fechar controla estado em memória
  e nenhum `localStorage` grava a escolha.

## Fora de escopo

- **Marcar cartas como revisadas.** A revisão é humana, por definição (`review_status`).
- **Bloquear o uso até a revisão.** O aviso informa; não trava o app.

## Condições de invalidação

- **Aviso removido ou escondido por preferência persistente.** Prova que a fase experimental
  deixou de ser informada.
