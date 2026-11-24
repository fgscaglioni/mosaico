# STATE.md — Mosaico

**Fase:** especificação pronta, implementação não iniciada
**Atualizado:** 2026-11-24
**Prazo duro:** 2026-11-30 23h59 (America/Sao_Paulo) · submissão planejada para 29/11

---

## O que existe hoje

| Artefato | Estado |
|---|---|
| Repositório `repos/mosaico` (git, branch `main`) | criado, sem commit de código |
| `README.md` | escrito |
| `LICENSE` (MIT) | criado |
| `docs/specs/PROJECT.md` | especificação aprovada (requisitos R1–R14, verificação V1–V9) |
| `docs/specs/STATE.md` | este arquivo |
| `docs/decisions/` | 4 ADRs + índice |
| Código (`src/`, `server.mjs`, `content/`, `tests/`, `e2e/`) | **não existe** |
| Deploy, vídeo, submissão | **não existem** |

Progresso do plano de implementação: **T0 de T21**.

## Próximo passo

Executar a Fase 0 do plano, na ordem: T1 (repo e estrutura) → T2 (gitignore, licença, AGENTS) →
T3 (`package.json`, `npm install`) → T4 (Vite, TS, Svelte, PWA) → T5 (XP e nível, com teste).

Critério de saída da Fase 0: `npm test` roda e o teste de XP passa (vermelho antes, verde depois).

## Onde está o plano

Nota do vault: `01-Projects/hackbr2026/Mosaico - Plano de implementacao.md`.
As tarefas T1–T21 estão lá, com código, comandos e saída esperada.

## Ambiente

| Item | Valor |
|---|---|
| Node | 22 (container `node:22-bookworm-slim`) |
| Gerenciador | npm |
| Porta local | 8787 (`node server.mjs`), 5173 no `npm run dev` |
| Dados em runtime | `data/events.jsonl` (gitignored), volume `/app/data` no container |
| Testes | Vitest (domínio) e Playwright (offline E2E) |

## Bloqueios

| Bloqueio | Impacta | Precisa de |
|---|---|---|
| Revisão pedagógica das 20 cartas | R5, R6 e a credibilidade do pitch | Pessoa que leia e aprove o texto antes de 28/11 |
| Host de deploy | R11, R13 | Acesso ao Coolify (ou outra máquina) com volume persistente |
| 12 cartas ainda não escritas | R5 | Redação seguindo a rubrica da seção 8 do PROJECT.md |

## Histórico

| Data | Fato |
|---|---|
| 2026-11-24 | Nome decidido (Mosaico), especificação escrita, repositório criado, 4 ADRs registrados |
