# ATA — Conselho de Produto: Design System Mosaico (8–16 anos)

**Data:** 2026-11-24 · **Modo:** completo (8 cadeiras) · **Parada:** consenso na Rodada 1

---

## CONSELHO — Design system para crianças 8–16 anos

**VEREDITO** — **faz menor**: redesenhos confinados à camada de apresentação (tokens CSS, escala tipográfica, ícones SVG e movimento), preservando conteúdo, domínio, rotas, schemas, testes e ADRs.

**LOG DAS RODADAS** — R1: 5×`faz menor` (PM, UX/UI, Arquiteto IA, QA, Cliente Chato) · 3×`faz` (DevOps, CS/Marketing, DBA) · 0×`não faz`. Parada por consenso: as 3 cadeiras `faz` impuseram condições idênticas às restrições das 5 `faz menor` — convergência no mérito sem necessidade de réplica. Nenhuma objeção bloqueante aberta.

**POR QUE** — O gargalo de engajamento é visual (`system-ui`, emoji como ícone, temas com a mesma cor do feedback), mas a 5 dias da submissão, com 59 testes verdes, mexer em estrutura é risco puro. O conselho separou "atratividade" de "rearquitetura".

**CONSENSO** — oito cadeiras firmaram:
1. Cores por tema **distintas** de `--ok` (acerto) e `--erro` (erro) — hoje `--tema-genero` = `--ok` e `--tema-bullying` = `--accent` (`app.css:8-11`).
2. Escala tipográfica em `rem`, não ~12 tamanhos fixos em `px` (`app.css`).
3. Ícones SVG vetoriais no lugar de emoji (✓, ✗, ★, ←, 💡), que variam por plataforma e saem da paleta.
4. `prefers-reduced-motion` nas animações do modal (`sucessoPop`, `erroShake`, partículas).
5. Contraste AA medido e alvos de 44 px preservados.
6. Zero dependências de runtime, zero webfont pesada (baseline `dist` = 216 KB; Workbox precacheia tudo).
7. Conteúdo, `CardSchema`/`HelpSchema`, domínio, rotas e testes existentes **intocados**.
8. Link de Ajuda continua a um toque em todas as telas.

**DISSIDÊNCIA** — nenhuma objeção bloqueante. DevOps, CS/Marketing e DBA votaram `faz`, mas com condições que na prática são `faz menor`; registrado como divergência nominal, não de mérito.

**O QUE O CLIENTE CHATO DERRUBOU** — Home e Theme renderizam os **mesmos quatro cartões**, sem "onde eu estou" nem "o que eu já fiz": cada sessão começa do zero. O redesign deve mostrar progresso por tema nos cartões para não virar "corredor sem porta".

**CUSTO** — 1 arquivo de tokens (`src/app.css`), ajustes nos componentes para ícones SVG e escala tipográfica, 1 teste de validação de design system. Sem migration, sem novas dependências, sem ADR novo.

**PRIMEIRA AÇÃO** — escrever `docs/design-system.md` com tokens, escala, ícones e regras de movimento; depois aplicar em `src/app.css`.

**EM ABERTO** — decisões do Fabrício: (a) validação com crianças reais 8–11 e 12–14 antes da submissão; (b) aprovar o tom mais vibrante da nova paleta.

---

## Tarefas

| ID | Arquivo | Teste que prova | Critério de aceite | Dependência | Portão |
|---|---|---|---|---|---|
| T-01 | `docs/design-system.md` | leitura do arquivo | tokens, escala, ícones e movimento documentados | — | **feita** |
| T-02 | `src/app.css` | `tests/design-system.test.ts` | temas != feedback, escala rem, contraste AA, 44 px | T-01 | **feita** — 6 testes verdes |
| T-03 | `src/routes/*.svelte` | E2E ajuda + offline | ícones SVG; classes e textos dos E2E preservados | T-02 | **feita** — 8 E2E verdes |
| T-04 | `src/routes/Card.svelte` | `grep prefers-reduced-motion` | animações respeitam prefers-reduced-motion | T-02 | **feita** |
| T-05 | `tests/design-system.test.ts` | `npm test` | valida tokens e contraste AA automaticamente | T-02 | **feita** — 57 testes verdes |

**Execução (2026-11-24):** 57 unitários verdes · 8 E2E verdes · `svelte-check` 0 errors/0 warnings · `npm run build` OK · precache sem novos assets de fonte/imagem.

**Índice:** `docs/design-system.md` é a fonte canônica de apresentação; `docs/board/2026-11-24-design-system-criancas.md` é a origem da decisão.

## ADRs

**nenhum** — a decisão é de apresentação, não de arquitetura. Fica registrada em `docs/design-system.md` e nos tokens de `src/app.css`; nenhuma invariante de `docs/decisions/` é alterada.

---

## Rodada 1 — placar e argumentos

| Cadeira | Posição | Argumento decisivo (resumo) |
|---|---|---|
| PM | faz menor | Visual institucional é o maior gargalo de engajamento, mas escopo deve ser tokens e microinterações. |
| UX/UI | faz menor | Telas já são lúdicas; o problema é semântica: temas duplicam feedback, emoji fora da paleta, px sem escala, animações sem reduced-motion. |
| Arquiteto IA | faz menor | 6 rotas e rótulos verbais já estão certos; redesign fica na camada de tokens e componentes. |
| QA | faz menor | Suíte prova comportamento, não apresentação; sem asserção de AA/44px, redesign completo pode quebrar sem teste vermelho. |
| DevOps | faz | Neutro em infra só com orçamento de bytes: cada webfont/SVG vira download obrigatório no precache offline. |
| CS/Marketing | faz | Criança decide em segundos se o app é dela; item 5.2 do regulamento pesa. Sem onboarding novo. |
| Cliente Chato | faz menor | Cartões idênticos sem noção de progresso; "corredor sem porta" ensina que navegar não leva a lugar nenhum. |
| DBA | faz | Apresentação pura: cor/raio/ícone/movimento não são persistidos; schemas intactos, sem migration. |
