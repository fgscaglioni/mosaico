# Specification - prática gamificada

**Referências normativas:** ADR-0003 (log de eventos), ADR-0004 (zero dados pessoais)
**Origem:** pedido do dono em 24/11/2026 ("gamificação forte para engajar"), com o limite de não
premiar quem "sabe mais sobre racismo".
**Medição:** 24/11/2026, commit `e6a2d0c`. Lido: `docs/specs/PROJECT.md` (§3, §5) e `STATE.md`.
Nenhum código de sessão existe ainda.

## Problema

Uma carta isolada não cria hábito. Sem laço de repetição, a criança responde cinco cartas, fecha o
app e não volta — e o conteúdo sobre reconhecer violência exige repetição para virar vocabulário. Ao
mesmo tempo, gamificação de tema sensível erra fácil: placar entre crianças premia esperteza, e
premiar "acerto sobre racismo" transforma dor em ponto.

A numeração de XP, nível, sequência e medalha também é onde o produto mente mais fácil: se cada tela
calcula do seu jeito, o placar do aluno diverge do agregado do servidor e ninguém percebe até o vídeo.

## Decisão

**Um único módulo puro calcula progresso a partir do log de eventos; a tela só desenha o resultado.**

1. **XP premia participação e retorno, não acerto bruto:** 10 na primeira tentativa certa, 4 no acerto
   em retentativa, 1 por errar. Caminho rejeitado: XP só por acerto, que desestimula justamente quem
   precisa repetir.
2. **Sem ranking entre crianças e sem nome.** Comparação é com o próprio progresso; o agregado do
   servidor nunca é por aluno.
3. **Medalha descreve comportamento de aprendizagem** (voltar na carta errada, abrir a ajuda, manter
   constância), não conhecimento sobre o tema.
4. **Cálculo puro e determinístico**, testado com sequência fixa de eventos; a tela não recalcula
   nada por conta própria.

## Alternativas rejeitadas

- **Streak com notificação diária:** Pressão sobre criança e dependência de permissão de push, que
  não funciona offline. Eliminada.
- **Pontuação por tema e comparação com a turma:** expõe desempenho individual sem consentimento e
  contraria o ADR-0004.
- **Medalha por acerto percentual:** premia quem já sabe, não quem está aprendendo.

## Requisitos

- **R1.** Responder uma carta registra um evento com `card_id`, `theme`, `correct`, `attempt` e `xp`
  calculado pela regra de pontuação.
- **R2.** `xpForAnswer(correct, attempt)` devolve 10 na primeira tentativa correta, 4 na correta de
  retentativa e 1 em qualquer erro.
- **R3.** `levelFromXp(xp)` devolve nível, XP dentro do nível e XP até o próximo, com
  `nível = floor(sqrt(xp / 50)) + 1`.
- **R4.** A sequência de dias conta dias consecutivos com pelo menos uma resposta, no fuso
  `America/Sao_Paulo`, e aceita o dia de ontem como sequência viva.
- **R5.** Existem seis medalhas, cada uma com regra declarada sobre o log: primeira resposta, dez
  acertos, três temas diferentes, três dias distintos, acerto em retentativa e abertura da tela de
  ajuda.
- **R6.** Carta respondida errado volta à fila três posições à frente, sem duplicar entrada.
- **R7.** A interface respeita alvo de toque de 44 px, contraste AA, feedback com `aria-live` e mostra
  o percentual em texto, de modo que cor não seja o único canal de informação.
- **R8.** A tela de início mostra nível, XP, sequência e número de medalhas, todos derivados do mesmo
  cálculo do evento registrado.
- **R9.** A cada apresentação de uma carta, as alternativas são exibidas em ordem embaralhada,
  gerada por permutação uniforme dos índices originais; o evento registado usa o índice original da
  alternativa escolhida, nunca a posição exibida.

## Critérios de verificação

- **V1 (R1).** `tests/pratica.test.ts::resposta_registra_evento_com_xp`: responder uma carta grava um
  evento do tipo `answer` com `xp` igual ao da regra.
- **V2 (R2).** `tests/pratica.test.ts::xp_por_tentativa`: três casos — primeira certa 10, retentativa
  certa 4, erro 1.
- **V3 (R3).** `tests/pratica.test.ts::nivel_a_partir_do_xp`: `0 → 1`, `49 → 1`, `50 → 2`.
- **V4 (R4).** `tests/pratica.test.ts::sequencia_de_dias`: quatro casos — vazio, só ontem, três dias
  seguidos, buraco no meio.
- **V5 (R5).** `tests/pratica.test.ts::medalhas_por_comportamento`: sete casos, um por regra e um de
  log vazio.
- **V6 (R6).** `tests/pratica.test.ts::carta_errada_volta_tres_posicoes`: fila de cinco itens devolve a
  carta errada na posição três, sem duplicar quando já presente.
- **V7 (R7).** `npx svelte-check --tsconfig ./tsconfig.json` devolve `0 errors`, e a inspeção da folha
  de estilo confirma `min-height: 44px` em botão e `aria-live` no bloco de feedback.
- **V8 (R8).** `npm run dev`, responder uma carta e verificar que o XP da tela de início sobe para o
  mesmo valor do evento gravado no IndexedDB.
- **V9 (R9).** `tests/shuffle.test.ts::embaralharIndices`: permutação completa sem repetição, ordem
  determinística com aleatório fixo e ordens diferentes em apresentações sucessivas; a resposta certa
  continua identificável pelo texto após o embaralhamento.

## Fora de escopo

- **Ranking, turma e comparação entre alunos.** Contraria o ADR-0004 e o objetivo do produto.
- **Notificação push e lembrete diário.** Não funciona offline e pressiona a criança.
- **Loja de itens e moeda virtual.** Sem valor pedagógico no prazo da entrega.
- **Medalha por tema concluído.** Depende do álbum do ADR-0001, que entra depois da submissão.

## Condições de invalidação

- **Tela e evento discordando do XP.** Prova que o cálculo saiu do módulo puro.
- **Medalha concedida por acerto percentual.** Prova que a regra voltou a premiar conhecimento.

## Perguntas em aberto

- **A criança vê quantas cartas faltam no tema?** Decide o dono. Muda a tela de tema e o `R8`.
- **Sequência zera após um dia sem uso ou mantém o recorde?** Decide o dono; a primeira opção é mais
  simples e a segunda precisa de mais um campo derivado.
