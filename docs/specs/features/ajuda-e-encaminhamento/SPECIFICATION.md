# Specification - ajuda e encaminhamento

**Referências normativas:** ADR-0004 (zero dados pessoais), item 6.9 do regulamento (dados reais)
**Origem:** pedido do dono em 24/11/2026 ("violência de gênero, racismo, xenofobia, bullying") somado
à política de conteúdo do `PROJECT.md` §8.
**Medição:** 24/11/2026, commit `e6a2d0c`. Lido: `PROJECT.md` §8 e os canais públicos citados.

## Problema

Um app que ensina uma criança a reconhecer assédio e não diz o que fazer em seguida deixa a criança
sozinha com o reconhecimento. E o caminho errado é fácil: colocar um botão de "denunciar" que ninguém
atende, ou um formulário que coleta relato — o que cria dever legal de guarda, exige moderação e
transforma o app em canal de denúncia que ele não é.

## Decisão

**Uma tela estática de encaminhamento, com canais públicos reais, alcançável de qualquer ponto.**

1. **Canais oficiais e gratuitos**, com número discável: Disque 100 (direitos humanos), Ligue 180
   (atendimento à mulher), CVV 188 (apoio emocional) e Conselho Tutelar da cidade.
2. **O app não recebe relato.** Nenhum campo, nenhum botão de envio. Rejeitado: formulário interno,
   por criar dever de guarda e moderação.
3. **Instrução de adulto de confiança em primeiro lugar**, porque a criança está na escola e é ali que
   ela encontra um adulto.
4. **Um único evento registrado ao abrir a tela**, sem conteúdo: só o fato de que a ajuda foi
   consultada, para a medalha de comportamento.

## Alternativas rejeitadas

- **Chat de apoio:** exige adulto de plantão, escala, supervisão e política de crise. Fora do prazo e
  do escopo de um hackathon.
- **Link para delegacia virtual:** a criança de 8 a 11 anos não tem documento, e o fluxo exige
  responsável. Informação verdadeira, mas não acionável para o público.
- **Números dentro de cada carta:** polui o conteúdo e transforma toda carta em alerta.

## Requisitos

- **R1.** A tela de ajuda é alcançável a partir de qualquer página do app, por link fixo no topo.
- **R2.** A tela lista Disque 100, Ligue 180, CVV 188 e Conselho Tutelar, cada um com o que resolve e
  o número, quando houver.
- **R3.** A abertura da tela registra exatamente um evento do tipo `help_opened`, sem qualquer texto
  digitado.
- **R4.** A tela não contém campo de entrada, botão de envio nem promessa de resposta.
- **R5.** A frase de orientação principal recomenda falar com um adulto de confiança, antes de
  qualquer número.

## Critérios de verificação

- **V1 (R1).** `e2e/ajuda.spec.ts::ajuda_alcancavel_de_qualquer_pagina`: a partir de `#/`, `#/tema/racismo`
  e `#/progresso`, o link de ajuda leva a `#/ajuda`.
- **V2 (R2).** `tests/ajuda.test.ts::canais_obrigatorios`: a leitura de `content/help.json` contém os
  números `100`, `180` e `188` e o item Conselho Tutelar.
- **V3 (R3).** `tests/ajuda.test.ts::abrir_ajuda_registra_um_evento`: abrir a tela grava um evento
  `help_opened` e nenhum outro.
- **V4 (R4).** `tests/ajuda.test.ts::tela_sem_campo_de_entrada`: o HTML renderizado não contém `input`
  do tipo texto, `textarea` nem `form`.
- **V5 (R5).** Leitura de `content/help.json`: `adult_tip` aparece antes da lista de canais na
  renderização.

## Fora de escopo

- **Canal de denúncia, chat ou formulário.** Cria dever de guarda e moderação, contraria o ADR-0004.
- **Geolocalização do Conselho Tutelar.** Exigiria permissão de localização, que é dado pessoal.
- **Conteúdo por estado ou município.** Sem fonte verificável por região no prazo.

## Condições de invalidação

- **Campo de texto na tela de ajuda.** Prova que o app virou canal de relato.
- **Número errado ou descontinuado.** Prova que a curadoria da tela perdeu a verificação.

## Perguntas em aberto

- **A tela de ajuda aparece automaticamente ao fim de algum tema?** Decide o dono. Muda o fluxo e
  pode constranger a criança na frente da turma.
