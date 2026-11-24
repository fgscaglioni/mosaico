# STATE.md — Mosaico

**Fase:** especificação e handoff prontos, implementação não iniciada
**Atualizado:** 2026-11-24
**Prazo duro:** 2026-11-30 23h59 (America/Sao_Paulo) · submissão planejada para 29/11

---

## Por onde um agente começa

1. `AGENTS.md` — regras do repositório e onde cada documento mora.
2. `docs/specs/IMPLEMENTATION.md` §5 — ordem de execução entre as features.
3. A spec da primeira feature da fila (`cartas-curadas`) e o `TASKS.md` dela.

O plano de projeto (cronograma, avaliação da ideia, roteiro do vídeo) fica no vault, em
`01-Projects/hackbr2026/Mosaico - Plano de implementacao.md`. **Não é necessário para codar:** o que é
requisito está nas specs e o que é execução está no `IMPLEMENTATION.md`.

## O que existe hoje

| Artefato | Estado |
|---|---|
| Repositório `repos/mosaico` | público em <https://github.com/fgscaglioni/mosaico> (branch `main`) |
| `README.md` | escrito |
| `LICENSE` (MIT) | criado |
| `AGENTS.md` | árvore de documentos e regras declaradas |
| `docs/specs/PROJECT.md` | visão, política de conteúdo e de dados, condições de entrega (§7) |
| `docs/specs/IMPLEMENTATION.md` | scaffold, comandos, ordem de execução, tokens de interface, armadilhas |
| `docs/specs/features/` | 5 specs de feature, com requisitos `R#`, verificação `V#` e `TASKS.md` |
| `content/cards.pt-BR.json` | 20 cartas, 5 por tema, **todas em `rascunho`** |
| `content/help.json` | 4 canais de ajuda |
| `docs/decisions/` | 4 ADRs + índice |
| Código (`src/`, `server.mjs`, `tests/`, `e2e/`, `package.json`) | **não existe** |
| Deploy, vídeo, submissão | **não existem** |

Progresso do plano de implementação: **T0 de T21**.

## Handoff

| Pergunta | Resposta |
|---|---|
| O que codar primeiro | Fase 1 do `IMPLEMENTATION.md` §5 (scaffold), depois `cartas-curadas` |
| Como provar cada requisito | A coluna `V#` da spec correspondente; cada teste tem nome próprio |
| Como provar offline de verdade | `e2e/offline.spec.ts`, com Playwright derrubando a rede |
| O que o agente **não** decide | Texto de carta, paleta além dos tokens, painel público como tela, revisão pedagógica |
| Quando parar | Suíte verde, `svelte-check` em `0 errors`, `docker build` com health OK |

## Bloqueios

| Bloqueio | Impacta | Precisa de |
|---|---|---|
| Revisão pedagógica das 20 cartas | R2 e R5 de `cartas-curadas`; credibilidade do pitch | Humano lê e troca `review_status` para `revisado` antes de 28/11 |
| Host de deploy | Condições de entrega, linha da demo | Acesso ao Coolify (ou outra máquina) com volume persistente |
| Texto do vídeo e gravação | Item 7.2 do regulamento | Dono do projeto |

## Ambiente

| Item | Valor |
|---|---|
| Node | 22 (container `node:22-bookworm-slim`) |
| Gerenciador | npm |
| Porta local | 8787 (`node server.mjs`), 5173 no `npm run dev` |
| Dados em runtime | `data/events.jsonl` (gitignored), volume `/app/data` no container |
| Testes | Vitest (domínio) e Playwright (offline e ajuda) |
| Validador de spec | `python3 scripts/validate_specs.py docs/specs/features` (script da skill `spec`) |

## Histórico

| Data | Fato |
|---|---|
| 2026-11-24 | Nome decidido (Mosaico), repositório criado e publicado, 4 ADRs, 5 specs de feature, catálogo com 20 cartas em rascunho, documento de implementação |
