# Mosaico

Álbum de cartas educativo para crianças do Ensino Fundamental aprenderem, jogando e sem
internet, a reconhecer e responder a bullying, racismo, xenofobia e violência de gênero.

**Hack Brasil 2026 · Trilha Acesso à educação · Time SIGNAL (1 integrante)**

> **Fase experimental.** O app está em fase de experimentos, amostragem e validação: as cartas
> ainda não foram avaliadas por uma pessoa. A revisão humana é um passo indispensável antes de
> o app ficar público ou entrar em produção. O aviso aparece na tela inicial do app.

## O problema

Crianças do Ensino Fundamental convivem com bullying, racismo, xenofobia e violência de gênero,
mas raramente recebem conteúdo que ensine a reconhecer, nomear e pedir ajuda. A escola tem
obrigação curricular de tratar o tema (Educação em Direitos Humanos é Tema Contemporâneo
Transversal da BNCC; a Lei 14.164/2021 inclui a prevenção da violência contra a mulher nos
currículos), e não tem material curto, offline e verificável para aplicar em dez minutos. O
professor de escola pública, com turma de 35 a 40 alunos e laboratório de informática sem
internet estável, não consegue diagnosticar quem precisa de quê.

## A solução

O Mosaico ensina, em sessões de cinco minutos que funcionam sem internet, a reconhecer e
responder a quatro formas de violência cotidiana:

- **80 cartas curadas** (20 por tema: bullying, racismo, xenofobia, violência de gênero), cada
  uma com fonte declarada (leis, ECA, BNCC), explicação acionável e faixa etária. Nenhuma carta
  é criada em tempo de execução.
- **Prática gamificada:** XP, nível, sequência de dias e 6 medalhas. As alternativas são
  embaralhadas a cada apresentação, para não decorar por posição.
- **Offline de verdade:** PWA instalável que funciona após o primeiro carregamento, com o jogo
  inteiro no aparelho (IndexedDB + service worker).
- **Sincronização por log de eventos:** quando a rede volta, só os eventos sobem, com
  deduplicação; o painel público mostra apenas agregado, sem identidade.
- **Ajuda sempre alcançável:** Disque 100, Ligue 180, CVV 188 e Conselho Tutelar em todas as
  telas. O app não é canal de denúncia e não substitui o acolhimento.
- **Zero dado pessoal:** sem nome, e-mail, foto, texto livre ou conta. O aparelho é identificado
  por um UUID anônimo.

O que o app **não** faz: não recebe relato de violência, não tem interação social, não mede
aprendizagem real e não promete prevenir violência. Ensina reconhecimento e busca de ajuda.

## Como rodar

Pré-requisito: Node 22 e npm.

```bash
npm ci
npm run build && npm run preview   # http://localhost:8787
npm run dev                        # desenvolvimento, http://localhost:5173
npm run test                       # testes unitários (Vitest)
npm run test:e2e                   # E2E offline, ajuda e link direto (Playwright)
npm run gate                       # svelte-check + unitários + E2E (exigido antes de commit)
npm run video                      # gera o vídeo de demo em video/out/mosaico-demo.mp4
docker build -t mosaico . && docker run -p 8787:8787 -v "$PWD/data:/app/data" mosaico
```

O vídeo é gerado pelo código: Playwright dirige as cenas, edge-tts narra em pt-BR e o
HyperFrames compõe, com trilha sonora de fundo sintetizada. Ver [`video/README.md`](video/README.md).

A demo pública é o container da raiz (`Dockerfile`, multi-stage) servindo `dist/` e os
endpoints `GET /api/health`, `GET /api/aggregate` e `POST /api/sync`, com volume em
`/app/data` para o log de eventos.

## Por onde começar

| Quero | Leia |
|---|---|
| O que o produto é e quais requisitos precisa cumprir | [`docs/specs/PROJECT.md`](docs/specs/PROJECT.md) |
| Em que pé está a construção e qual é o próximo passo | [`docs/specs/STATE.md`](docs/specs/STATE.md) |
| Como construir: scaffold, comandos, ordem, tokens | [`docs/specs/IMPLEMENTATION.md`](docs/specs/IMPLEMENTATION.md) |
| Por que as decisões técnicas são essas | [`docs/decisions/`](docs/decisions/README.md) |
| Como são cores, fontes, ícones e movimento | [`docs/design-system.md`](docs/design-system.md) |
| Parecer do conselho sobre o design para crianças | [`docs/board/2026-11-24-design-system-criancas.md`](docs/board/2026-11-24-design-system-criancas.md) |

## Estrutura

```
mosaico/
├── README.md
├── Dockerfile
├── video/                 # pipeline do vídeo de demo (Playwright + edge-tts + HyperFrames)
└── docs/
    ├── specs/
    │   ├── PROJECT.md      # o que é, requisitos, política de conteúdo e de dados
    │   └── STATE.md        # fase atual, ambiente, bloqueios, próximo passo
    │   └── features/       # specs de feature (R#, V#, TASKS.md)
    ├── design-system.md    # cores, tipografia, formas, ícones e movimento
    ├── board/              # atas do conselho de produto
    └── decisions/          # ADRs
```

O código (`src/`, `server.mjs`, `content/`, `tests/`, `e2e/`) nasce na Fase 1 do plano de
implementação, que fica no vault: `01-Projects/hackbr2026/Mosaico - Plano de implementacao`.

## Regras que não se negociam

- **Nenhum dado pessoal.** Sem nome, e-mail, foto, texto livre ou upload. O aparelho é identificado
  por um UUID anônimo gerado no primeiro acesso.
- **Conteúdo é curadoria, não geração.** Nenhuma carta é criada em tempo de execução; toda carta tem
  fonte declarada e passa por revisão humana.
- **Funciona sem rede.** Se um recurso novo não funciona offline, ele não entra.
- **O app ensina a reconhecer e pedir ajuda.** Ele não previne violência e não é canal de denúncia.

## Licença

MIT, sobre código e conteúdo. Ver [`LICENSE`](LICENSE).

O texto das cartas cita leis e documentos públicos (Lei 13.185/2015, Lei 7.716/1989, Lei 10.639/2003,
Lei 14.164/2021, ECA, BNCC), sem reprodução de material protegido. Se um recurso de terceiro entrar no
projeto (fonte tipográfica, ícone), o aviso da licença dele vai junto no repositório.
