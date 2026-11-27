# Conselho — Mosaico: avaliação do projeto e extração de componentes duplicados

- **Data:** 2026-11-27
- **Modo:** completo (8 cadeiras)
- **Rodadas:** 1 de 5 · chamadas: 8
- **Parada:** consenso (8/8 em `faz menor` na R1, nenhuma objeção bloqueante)
- **Escopo pedido pelo dono:** avaliar o projeto e, depois do parecer, fazer a extração dos componentes repetidos.

## Enquadramento

Pedido em uma frase: decidir se o Mosaico extrai agora os padrões visuais repetidos nas rotas para componentes compartilhados, em que ordem e com que escopo, sem quebrar offline, acessibilidade ou o gate.

O que está em jogo: prazo duro de 30/11/2026 23h59 (submissão 29/11), 20 cartas ainda em rascunho, deploy e vídeo pendentes; regressão visual em telas para crianças de 8 a 11 anos e professor sem internet; retrabalho se cada rota guardar a sua cópia de um padrão.

Restrições do repo: `AGENTS.md` (domínio puro em `src/lib/domain/`, conteúdo é curadoria, zero dado pessoal, offline obrigatório, gate `npm run gate` antes de commit); `docs/specs/PROJECT.md` §8 (política de conteúdo) e §9 (política de dados); `docs/design-system.md` (tokens já aprovados pelo conselho de 2026-11-24); specs em `docs/specs/features/`.

Arquivos permitidos às cadeiras (lista fechada): `AGENTS.md`, `docs/specs/PROJECT.md`, `docs/specs/STATE.md`, `docs/design-system.md`, `src/app.css`, `src/routes/Home.svelte`, `src/routes/Theme.svelte`, `src/routes/Progress.svelte`, `src/routes/Panel.svelte`, `src/routes/Help.svelte`, `src/routes/Card.svelte`, `src/App.svelte`.

## Fatos medidos

| # | Fato | Onde |
|---|---|---|
| F1 | `.topo` (cabeçalho da tela) é definido em 6 rotas, com o mesmo nome e papel | `src/routes/Home.svelte:94`, `src/routes/Theme.svelte:51`, `src/routes/Progress.svelte:100`, `src/routes/Panel.svelte:115`, `src/routes/Help.svelte:59`, `src/routes/Card.svelte:197` |
| F2 | `.voltar` (botão voltar ao início) é definido em 5 rotas | `src/routes/Theme.svelte:58`, `src/routes/Progress.svelte:109`, `src/routes/Panel.svelte:124`, `src/routes/Help.svelte:68`, `src/routes/Card.svelte:206` |
| F3 | `tema-card` e seus filhos (`tema-cor`, `tema-nome`, `tema-qtd`, `tema-progresso`) são definidos em 2 rotas com a mesma estrutura, Home e Theme | `src/routes/Home.svelte:176`, `src/routes/Theme.svelte:98` |
| F4 | `metrica` com `rotulo` e `valor` é definido em 3 rotas | `src/routes/Home.svelte:124`, `src/routes/Progress.svelte:181`, `src/routes/Panel.svelte:184` |
| F5 | `tema-progresso-card` com cabeçalho, indicador e barra é definido em 2 rotas | `src/routes/Progress.svelte:212`, `src/routes/Panel.svelte:220` |
| F6 | `src/app.css` tem 202 linhas e guarda só tokens e utilitários globais, nenhuma classe de componente de rota | `src/app.css:1` |
| F7 | O design system existe e já foi aprovado, com tokens de cor, tipografia, raio, sombra e regras de movimento | `docs/design-system.md:1` |
| F8 | Estado: implementação e vídeo concluídos, faltam revisão humana das 20 cartas (todas em rascunho), deploy público e publicação do vídeo | `docs/specs/STATE.md:30` |
| F9 | O padrão visual mora em cópia por rota: cada `*.svelte` de rota tem seu bloco de estilo próprio e nenhum dos padrões acima é importado de outro arquivo | `src/routes/Home.svelte:94`, `src/routes/Theme.svelte:51`, `src/routes/Progress.svelte:100` |
| F10 | O gate é `svelte-check` mais testes unitários (51 verdes) mais E2E (10 verdes); commit exige gate verde | `docs/specs/STATE.md:33`, `AGENTS.md` |
| F11 | Fato novo conferido na mesa: o botão voltar do Painel usa a seta de texto `←`, as demais rotas usam o ícone SVG `arrow-left`; `metrica` usa tokens na Home e valores fixos em px em Progress e Panel; o `tema-card` de Home e Theme é idêntico | `src/routes/Panel.svelte:48`, `src/routes/Card.svelte:80`, `src/routes/Home.svelte:124`, `src/routes/Progress.svelte:181`, `src/routes/Panel.svelte:184` |

## Placar

| Cadeira | R1 | R2 | R3 | R4 | R5 | Falas |
|---|---|---|---|---|---|---|
| PM | faz menor | — | — | — | — | 1 |
| UX | faz menor | — | — | — | — | 1 |
| IA | faz menor | — | — | — | — | 1 |
| QA | faz menor | — | — | — | — | 1 |
| DevOps | faz menor | — | — | — | — | 1 |
| CS | faz menor | — | — | — | — | 1 |
| Cliente chato | faz menor | — | — | — | — | 1 |
| DBA | faz menor | — | — | — | — | 1 |

R1: 8 faz menor / 0 faz / 0 não faz. Parada por consenso na primeira condição, sem réplica: a divergência restante era só ordem do escopo, não posição.

## Disputas e resultado

- **D1 — TemaCard entra agora ou depois?** PM, UX e CS: entra agora. IA, DevOps e DBA: depois do deploy. Fechada na mesa: entra agora, porque o bloco de Home e Theme é idêntico (F11) e a condição do QA (só se markup e estilo forem idênticos) está satisfeita com fato medido, não com opinião.
- **D2 — TemaProgressoCard entra agora?** CS inclui na sequência; IA, DevOps e DBA excluem. Fechada: fica fora. Progress mostra progresso do aparelho e Panel mostra agregado público; fundir os dois agora acopla fonte local e fonte agregada e ameaça a política de só-agregado (PROJECT.md §9).
- **D3 — Métrica unifica valendo mudança visual?** Home usa tokens, Progress e Panel usam px fixos (F11). Fechada: unifica nos tokens do design system aprovado; a convergência de 24px/28px para a escala de tokens é o ganho da extração, não regressão, e o alvo de 44px e o contraste AA se mantêm.

## Parecer

```
CONSELHO — Mosaico: extração de componentes duplicados

VEREDITO        faz menor — extrai Topo+Voltar, Métrica e TemaCard agora; TemaProgressoCard, medalhas, modal e canais de ajuda ficam para depois da entrega.
LOG DAS RODADAS R1: 8 faz menor / 0 faz / 0 não faz  ·  Parada por consenso em R1, sem réplica.
POR QUE         A duplicação do caminho crítico de navegação (topo em 6 rotas, voltar em 5) quebra a previsibilidade para a criança e para o professor, mas a versão grande disputa horário com revisão das cartas, deploy e vídeo, que são condição de entrega.
CONSENSO        Só apresentação, sem tocar domínio, store, router, IndexedDB, sync ou conteúdo; gate verde antes de cada commit; nenhuma mudança de texto, destino, token ou rótulo.
DISSIDÊNCIA     Nenhuma sobre a posição. Houve divergência de ordem (D1, D2), fechada pela mesa com fato medido.
QUEM MUDOU      Ninguém; todas as cadeiras abriram em faz menor.
O QUE O         1) Abrir Progresso ou Painel e ver XP, barra ou voltar sumido/movido, com 35 a 40 alunos parados e a aula de 5 minutos perdida. 2) Extrair tudo virar retrabalho e adiar cartas, deploy e vídeo, estourando 30/11. 3) Mexer no topo e o caminho para Ajuda sumir ou o voltar cair na tela errada. Preço de ignorar: perda da aula, perda do prazo e criança sem rota de ajuda.
CUSTO           3 componentes novos em src/lib/components/, 6 rotas como consumidoras, 1 ciclo de gate por componente, zero dependência nova, zero migration, rollback por revert. Fora: TemaProgressoCard, medalhas, modal da carta, canais de ajuda.
PRIMEIRA AÇÃO   Extrair Topo+Voltar, com o voltar do Painel unificado no ícone SVG das demais rotas, e rodar npm run gate.
EM ABERTO       Quem roda o gate e confirma deploy/vídeo até 29/11; quem revisa as 20 cartas antes de 28/11. A extração não resolve nenhum dos dois bloqueios.
```

## Decisões do dono

| Pergunta | Resposta | Data |
|---|---|---|
| — | — | — |

## Tarefas

| ID | Tarefa | Arquivo | Teste que prova | Aceite | Dep. | Estado |
|---|---|---|---|---|---|---|
| T-01 | Criar `Topo` (cabeçalho com voltar opcional, título opcional, conteúdo à direita via children, variante centrada para a Home) e migrar as 6 rotas; unificar o voltar do Painel no ícone SVG | `src/lib/components/Topo.svelte`, `src/routes/*.svelte` | `npm run gate` — svelte-check 0 erros, 88 unitários, 10 E2E; E2E cobre `topo-6-rotas-consistente` e `voltar-5-rotas-destino-correto` por navegação nas 6 rotas | Mesmos títulos, destinos de voltar e rótulos `aria-label`; Ajuda segue a um toque na barra global; nenhuma rota vazia offline | — | feita |
| T-02 | Criar `Metrica` (rótulo + valor) e migrar Home, Progress e Panel, com os tokens do design system como valor canônico | `src/lib/components/Metrica.svelte`, `src/routes/Home.svelte`, `src/routes/Progress.svelte`, `src/routes/Panel.svelte` | `npm run gate`; caso `metrica-rotulo-valor-3-rotas` | Rótulos e valores exibidos idênticos aos atuais; Progress e Panel convergem para tokens; sem leitura de store dentro do componente | T-01 | feita |
| T-03 | Criar `TemaCard` e migrar Home e Theme | `src/lib/components/TemaCard.svelte`, `src/routes/Home.svelte`, `src/routes/Theme.svelte` | `npm run gate`; caso `tema-card-home-theme-contraste-AA` | Mesmo ícone por tema, nome, `5 cartas` e linha de progresso; contraste AA e alvo de toque preservados | T-01 | feita |
| T-04 | Pós-entrega: reavaliar `TemaProgressoCard` (Progress e Panel) como componente compartilhado, separando fonte local de fonte agregada | `src/routes/Progress.svelte`, `src/routes/Panel.svelte` | A definir na reabertura | Não executar antes de 29/11 | Deploy e vídeo publicados | bloqueada |

## ADRs

- **Nenhum.** Razão: a decisão é de apresentação e de organização de código dentro do design system já aprovado em `docs/design-system.md`; arquitetura (SPA Svelte, sincronização por log de eventos, zero dados pessoais) não muda. A decisão fica registrada nesta ata e no design system.

## Em aberto

- Quem revisa as 20 cartas antes de 28/11 e quem publica demo e vídeo até 29/11 (bloqueios de `docs/specs/STATE.md`, fora do escopo desta extração).
- Se o rótulo visível do topo precisa mudar em alguma tela: o conselho recomenda manter os rótulos atuais.

## Execução

- 2026-11-27: parecer fechado por consenso em R1. Execução das tarefas T-01 a T-03 iniciada na mesma sessão, por ordem do dono.
- 2026-11-27: T-01 a T-03 feitas. Criados `src/lib/components/Topo.svelte`, `Metrica.svelte` e `TemaCard.svelte`; migradas as 6 rotas; voltar do Painel unificado no ícone SVG `arrow-left`; `metrica` de Progress e Panel convergida para os tokens (valor canônico da Home). Rotas perderam 378 linhas líquidas de estilo duplicado. `tests/design-system.test.ts` atualizado para os novos lugares de `translateY(3px)` e dos ícones. Portão medido: `svelte-check` 0 erros, 88 testes unitários verdes, 10 E2E verdes (`npm run gate`). Sem commit, por aguardar decisão do dono.
