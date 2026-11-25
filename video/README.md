# Vídeo de demo — pipeline automatizado

`npm run video` gera `video/out/mosaico-demo.mp4` (1920x1080, 30 fps, H.264 + AAC) a partir do
código: o app roda local, o Playwright dirige as cenas, o edge-tts narra em pt-BR e o HyperFrames
compõe e renderiza.

## Etapas

| Etapa | Arquivo | O que faz |
|---|---|---|
| 1. build + servidor | `pipeline.mjs` | `npm run build`, sobe `server.mjs` na porta 8799 com `DATA_DIR=video/out/data` limpo |
| 2. gravação | `record.mjs` | Playwright grava 5 cenas do app, uma por contexto, 406x908 |
| 3. narração | `pipeline.mjs` | `python3 -m edge_tts` gera um MP3 por cena a partir de `narracao.json` |
| 4. composição | `compor.mjs` | mede as durações reais, gera `index.html` + `compositions/cenaN.html`, corta e reescala os clipes |
| 5. portão | `hyperframes check` | lint, runtime, layout, movimento, contraste WCAG |
| 6. render | `hyperframes render` | MP4 final, qualidade `delivery` |

Flags: `--sem-build`, `--sem-gravar` (reusa clipes), `--sem-tts` (reusa áudio), `--so-check`.
A cena é composta pelas durações medidas do áudio: mudar o texto em `narracao.json` reajusta o
vídeo inteiro, sem tocar no HTML.

## Estrutura das cenas

`narracao.json` é a fonte de verdade: `id`, `tipo` (`cartela` | `clip` | `diagrama` | `final`),
texto de tela (`kicker`, `titulo`, `linha`) e `narracao`. Cena do tipo `clip` puxa o arquivo
`video/out/clips/<id>.mp4` gravado pelo Playwright.

Ordem: problema → produto → prova offline → painel → curadoria → arquitetura → ajuda → cartela final.

## Regras de autoria (HyperFrames)

- Uma sub-composição por cena em `compositions/`, montada na raiz com `data-composition-src`.
  Elemento com `data-composition-src` e conteúdo dentro geram erro no lint.
- Raiz de cada composição é `id="root"`; estilo por `#root`, nunca por classe na raiz.
- Timeline GSAP pausada registrada em `window.__timelines[<data-composition-id>]`.
- Áudio e vídeo levam `data-start` e `data-duration`. Só lógica determinística no HTML:
  sem `Date.now()`, sem `Math.random()`, sem rede.
- `gsap.min.js` é local, e `HYPERFRAMES_NO_TELEMETRY=1` desliga telemetria: o render roda sem rede.

## Armadilhas medidas

- **`recordVideo` com `deviceScaleFactor: 2` grava a página em 1x no canto e pinta o resto de cinza**
  (128,128,128). O quadro só preenche quando `size` é igual ao viewport e `deviceScaleFactor: 1`.
  Por isso a gravação é 406x908 e a moldura do celular tem exatamente esse tamanho.
- **SAR não quadrado**: o webm do Playwright sai com `sample_aspect_ratio` estranho e o HyperFrames
  pinta o quadro no tamanho natural, esticado. `compor.mjs` normaliza com `scale=...,setsar=1`.
- **Vídeo dentro de moldura não pode usar a classe `clip`**: o runtime injeta
  `.clip{width:100%;height:100%}` e o clipe passa a ser pintado no tamanho natural. O tamanho vem do
  arquivo (já cortado na duração da cena), não do CSS.
- **Margem do regulamento**: `compor.mjs` falha se o total passar de 180 s e aperta as pausas acima
  de 176 s — o vídeo do Hack Brasil precisa ter até 3 minutos.
- **Texto pequeno reprova o check**: piso de 28 px para texto legível; rótulos decorativos levam
  `data-layout-ignore`.

## Publicação

YouTube não listado (abre sem login, é o que o item 7.2 exige). O MP4 não entra no git.
