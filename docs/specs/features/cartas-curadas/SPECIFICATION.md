# Specification - catálogo de cartas curadas

**Referências normativas:** ADR-0004 (zero dados pessoais), ADR-0001 (nome e escopo do produto)
**Origem:** pedido do dono em 24/11/2026 ("conteúdo muito bem curado porque são crianças"); requisito
de trilha do Hack Brasil 2026, item 5.2.
**Medição:** 24/11/2026, branch `main`, commit `e6a2d0c`. Lido: `docs/specs/PROJECT.md` (§8) e o
regulamento do evento na fonte. Não há código de catálogo ainda; nada foi executado.

## Problema

O produto precisa ensinar quatro formas de violência cotidiana a crianças de 8 a 11 anos, e o material
é o próprio produto. Sem esquema e sem gate, o catálogo vira texto solto: carta sem fonte, explicação
que não ensina, alternativa absurda que entrega a resposta, ou expressão inadequada para a faixa
etária passa despercebida até alguém ler em voz alta para uma turma.

O custo de um erro aqui não é bug: é o projeto inteiro perdendo credibilidade diante de um júri que
tem pedagogo, e é risco de o app ser enquadrado no item 6.8 do regulamento (violência gráfica, discurso
de ódio), quando o produto é o oposto disso.

## Decisão

**O catálogo é um JSON versionado, validado por teste automatizado, com fonte obrigatória por carta.**

1. **Esquema validado em teste, não em tempo de execução.** O `zod` valida no import, e o teste cobre
   as regras editoriais que o esquema não expressa (fonte, explicação mínima, termos proibidos). Custo
   evitado: runtime quebrado por conteúdo em produção.
2. **Conteúdo no bundle, sem CMS.** O app precisa funcionar offline, e um CMS exigiria rede no
   primeiro uso. Rejeitado: cabeçalho remoto de conteúdo.
3. **Faixa etária declarada por carta.** Permite revisar e filtrar depois sem reescrever o arquivo.
4. **Lista de termos proibidos explícita no teste.** É o que transforma "cuidado com o texto" em
   regra verificável.

## Alternativas rejeitadas

- **Gerar carta com LLM em tempo de execução:** imprevisível, impossível de revisar antes de chegar à
  criança e incompatível com curadoria. Eliminada.
- **Markdown por carta:** exige parser próprio para extrair alternativas e gabarito; JSON já é o
  formato de import do Vite.
- **Curadoria só em revisão humana, sem teste:** não sobrevive à pressa do prazo; a carta nova entra
  sem fonte e ninguém percebe.

## Requisitos

- **R1.** O catálogo contém 20 cartas, 5 por tema, com os temas `bullying`, `racismo`, `xenofobia` e
  `genero`.
- **R2.** Cada carta traz `id` único, `theme`, `age_band` (`8-11` ou `12-14`), `objective`, `stem`,
  `options` com 3 ou 4 alternativas, `answer_index` válido, `explanation` com no mínimo 60 caracteres,
  `source` não vazio e `review_status` (`rascunho` ou `revisado`).
- **R3.** O teste do catálogo falha quando uma carta não tem fonte, tem explicação curta, tem
  `answer_index` fora do intervalo, repete `id` ou contém termo da lista proibida no enunciado ou na
  explicação.
- **R4.** O catálogo carrega `catalog_version` inteiro positivo, e o evento de resposta registra a
  versão vigente no momento da resposta.
- **R5.** Nenhuma carta descreve cena de violência, caso real identificável ou detalhe gráfico; a
  orientação é sempre o que fazer e a quem recorrer.

## Critérios de verificação

- **V1 (R1).** `tests/cartas.test.ts::catalogo_tem_vinte_cartas`: a leitura do catálogo devolve 20
  cartas e 5 por tema.
- **V2 (R2).** `tests/cartas.test.ts::toda_carta_passa_no_esquema`: o parse `zod` do catálogo não
  levanta erro e cada `answer_index` aponta para alternativa existente.
- **V3 (R3).** `tests/cartas.test.ts::carta_sem_fonte_reprova` e
  `tests/cartas.test.ts::carta_com_termo_proibido_reprova`: fixtures inválidas são rejeitadas com a
  mensagem do campo.
- **V4 (R4).** `tests/cartas.test.ts::versao_do_catalogo_e_positiva`: `catalog_version` é inteiro e
  maior que zero.
- **V5 (R5).** Leitura de `content/cards.pt-BR.json`: nenhuma carta contém termo da lista proibida e
  todas têm `explanation` com orientação acionável.

## Fora de escopo

- **Painel de edição de conteúdo.** O prazo é de cinco dias e o arquivo é editável à mão.
- **Tradução para inglês e espanhol.** O evento aceita português (item 9.8) e o público é brasileiro.
- **Áudio narrado por carta.** Depende de locução ou TTS de qualidade; fica para depois da submissão.
- **Revisão pedagógica automatizada.** A revisão é humana, por definição (ver `review_status`).

## Condições de invalidação

- **Carta publicada sem `source`.** Prova que o gate foi contornado ou desligado.
- **`catalog_version` repetida com conteúdo diferente.** Prova que a rastreabilidade do evento
  quebrou e a análise de resposta perde a referência.

## Perguntas em aberto

- **Quem assina a revisão das 20 cartas antes de 28/11?** Decide o dono. Sem revisor nomeado, as
  cartas ficam em `rascunho` e o `STATE.md` registra o bloqueio.
- **Alguma carta precisa de faixa `12-14`?** Depende do revisor: conteúdo sobre violência de gênero
  pode exigir idade maior. Muda o filtro da tela inicial.
