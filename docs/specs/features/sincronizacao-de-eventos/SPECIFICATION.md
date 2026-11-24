# Specification - sincronização de eventos

**Referências normativas:** ADR-0003 (log append-only), ADR-0004 (zero dados pessoais)
**Origem:** pedido do dono em 24/11/2026 ("sincronia dos dados em servidor") com a restrição de que o
app funciona sem rede.
**Medição:** 24/11/2026, commit `e6a2d0c`. Lido: `PROJECT.md` §9 e §10. Servidor ainda não existe.

## Problema

O progresso nasce no aparelho, sem rede, e precisa chegar ao servidor quando a rede volta. Sincronizar
estado (XP, nível, medalha) cria conflito: dois envios do mesmo aparelho, resposta fora de ordem, ou
retry depois de timeout produzem divergência sem erro visível. E sincronizar identidade de criança é
proibido pelo ADR-0004.

## Decisão

**Sincroniza evento, nunca estado; o servidor deduplica por `event_id` e devolve agregado.**

1. **Evento imutável com UUID gerado no cliente.** Reenvio é sempre seguro, então a política é
   "envie tudo que estiver pendente".
2. **Deduplicação no servidor** por `event_id`, com índice em memória reconstruído no boot a partir do
   próprio arquivo.
3. **Persistência append-only em `events.jsonl`**, sem banco e sem transação: o arquivo é a verdade.
4. **Agregado derivado na leitura**, nunca gravado. Corrigir regra de cálculo recalcula o passado.
5. **Identidade é `device_id` anônimo**; o agregado público não devolve esse campo.

## Alternativas rejeitadas

- **Sincronizar estado com `updated_at` (last-write-wins):** perde evento e não detecta conflito.
- **Postgres/SQLite no servidor:** peso de deploy e migração para um arquivo que só cresce.
- **Fila com confirmação servidor-a-servidor (outbox + ack por evento):** complexidade maior que o
  problema; o `event_id` já dá idempotência de graça.

## Requisitos

- **R1.** O evento contém `event_id`, `device_id`, `type`, `card_id`, `theme`, `correct`, `attempt`,
  `xp`, `local_day`, `client_ts` e `catalog_version`.
- **R2.** `POST /api/sync` aceita lote de eventos, ignora item sem `event_id` válido e devolve
  `accepted`, `duplicates` e o agregado atual.
- **R3.** Enviar o mesmo `event_id` duas vezes grava uma linha só no arquivo e conta a segunda como
  duplicata.
- **R4.** A gravação é append-only em `events.jsonl`, uma linha JSON por evento, sem reescrita.
- **R5.** `GET /api/aggregate` devolve apenas `respostas`, `acertos`, `xp`, `aparelhos` e `por_tema`.
- **R6.** O cliente envia pendentes ao voltar `online` e a cada 30 segundos; falha de rede mantém o
  evento pendente e não altera o estado local.
- **R7.** `GET /api/health` responde `{"status":"ok","version":"0.1.0"}`.

## Critérios de verificação

- **V1 (R1).** `tests/sync.test.ts::evento_tem_campos_obrigatorios`: um evento gravado pelo cliente
  passa no esquema e contém as onze chaves.
- **V2 (R2).** `curl -X POST /api/sync` com um evento novo devolve `accepted: 1`; com lote de dois
  eventos, um repetido, devolve `accepted: 1` e `duplicates: 1`.
- **V3 (R3).** `tests/sync.test.ts::reenvio_nao_duplica`: dois envios do mesmo `event_id` deixam uma
  linha em `events.jsonl`.
- **V4 (R4).** Leitura de `data/events.jsonl` depois de dois envios: o arquivo tem uma linha e nunca é
  truncado.
- **V5 (R5).** `curl /api/aggregate` devolve exatamente as cinco chaves e nenhuma de identidade.
- **V6 (R6).** `e2e/offline.spec.ts::sincroniza_quando_a_rede_volta`: responder offline, voltar
  `online`, e o painel público passa a somar a resposta.
- **V7 (R7).** `curl /api/health` devolve o JSON esperado com status 200.

## Fora de escopo

- **Sincronização entre aparelhos do mesmo aluno.** Sem conta, não há como identificar o mesmo aluno em
  dois aparelhos (ADR-0004).
- **Painel por turma ou por aluno.** Exigiria identidade e consentimento; fica fora.
- **Compactação do log.** O arquivo cresce sem limite; aceitável na escala da entrega.

## Condições de invalidação

- **Duas linhas com o mesmo `event_id`.** Prova que a deduplicação saiu do caminho.
- **Agregado com campo de identidade.** Prova que a política de dados foi violada.

## Perguntas em aberto

- **O painel público é uma tela do app ou só a rota JSON?** Decide o dono; muda o escopo da Fase 3 do
  plano de implementação.
- **Qual o intervalo de retry com rede ruim?** Hoje 30 s fixos. Se o revisor pedir, entra backoff.
