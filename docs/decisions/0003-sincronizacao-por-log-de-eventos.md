# ADR 0003 — Sincronização por log de eventos append-only

**Data:** 2026-11-24 · **Status:** aceita

## Contexto

O aluno joga offline e o progresso precisa chegar ao servidor quando a rede volta. A abordagem
intuitiva — sincronizar estado (XP, nível, medalhas) — cria conflito quando o mesmo aparelho envia duas
vezes, quando dois aparelhos divergem, ou quando a resposta chega fora de ordem.

## Decisão

Sincronizar **evento**, nunca estado. Cada ação gera um evento imutável com `event_id` (UUID),
`device_id` anônimo, tipo, carta, acerto, XP, dia local e versão do catálogo. O cliente guarda o log em
IndexedDB; o servidor grava as linhas em `events.jsonl` e descarta `event_id` já visto. Todo agregado
(XP total, nível, sequência, medalhas, painel público) é **derivado** do log por função pura.

## Consequências

- Não existe resolução de conflito: o pior caso é evento repetido, que a deduplicação resolve.
- Reenviar é seguro, então a política é "envie tudo que estiver pendente, sempre que houver rede".
- Corrigir uma regra de gamificação recalcula o passado; nenhum dado gravado precisa ser reescrito.
- O log cresce sem limite. Para a entrega é irrelevante; no futuro, compactação por dia.
- O servidor precisa de deduplicação em memória no boot (`Set` com todos os `event_id`), o que é
  aceitável em escala de turma e não em escala de rede nacional.
