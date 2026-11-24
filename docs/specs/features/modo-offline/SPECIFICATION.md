# Specification - modo offline

**Referências normativas:** ADR-0002 (SPA sem SvelteKit), ADR-0003 (log de eventos)
**Origem:** pedido do dono em 24/11/2026 ("precisa trabalhar offline first"); público declarado:
laboratório de escola pública com internet instável.
**Medição:** 24/11/2026, commit `e6a2d0c`. Lido: `PROJECT.md` §10. Nada executado: não há build.

## Problema

O uso acontece em sala de aula, com rede que cai no meio da atividade. Se o app depende de rede para
abrir, a aula termina na primeira queda. Se depende de rede para registrar a resposta, a criança perde
o progresso e a gamificação deixa de fazer sentido — o pior caso é a criança fechar o app com o
progresso só na memória.

## Decisão

**Precache da aplicação inteira no primeiro acesso, e o jogo nunca espera rede.**

1. **Service worker com `generateSW` do Workbox**, precache de `js`, `css`, `html`, `json`, `svg` e
   fonte; `navigateFallback` para `index.html`. Caminho rejeitado: `NetworkFirst`, que entrega página
   em branco quando a rede cai.
2. **Roteamento por hash**, para que a navegação não dependa do servidor responder a rota.
3. **Chamada de API com `NetworkOnly`**, explícita: o service worker nunca serve resposta velha de
   `/api/`, porque agregado falso é pior que agregado ausente.
4. **A resposta é gravada primeiro no IndexedDB**, e a sincronização acontece depois, quando houver
   rede. Nunca o contrário.

## Alternativas rejeitadas

- **SSR com cache de página (SvelteKit):** mais superfície, e o servidor não tem nada a renderizar que
  o cliente já não tenha.
- **App nativo:** exigiria Android e iOS, e a demo passaria por loja — fora do prazo e do item 7.4.
- **`localStorage` para o progresso:** limite de tamanho e sem consulta por índice; IndexedDB é o
  correto para log append-only.

## Requisitos

- **R1.** Depois do primeiro carregamento com rede, o app abre e funciona com a rede desligada.
- **R2.** Responder uma carta sem rede grava o evento no IndexedDB e atualiza XP na tela.
- **R3.** Recarregar a página sem rede mantém XP, nível, sequência e medalhas já conquistadas.
- **R4.** Nenhuma tela do fluxo de jogo (início, tema, carta, ajuda, progresso) faz chamada de rede
  obrigatória.
- **R5.** O service worker usa `registerType: "autoUpdate"`, de modo que versão nova não exige
  reinstalação manual.

## Critérios de verificação

- **V1 (R1).** `e2e/offline.spec.ts::abre_sem_rede_depois_do_primeiro_carregamento`: após carregar com
  rede e esperar `navigator.serviceWorker.controller`, `context.setOffline(true)` e `reload()` mostram
  o título "Mosaico".
- **V2 (R2).** `e2e/offline.spec.ts::responde_carta_sem_rede`: com rede desligada, responder uma carta
  mostra feedback e incrementa o XP exibido.
- **V3 (R3).** `e2e/offline.spec.ts::recarregar_sem_rede_mantem_progresso`: dois `reload()` offline
  seguidos mantêm o mesmo XP.
- **V4 (R4).** `e2e/offline.spec.ts::nenhuma_requisicao_bloqueante`: com rede desligada, navegar por
  início, tema, carta e progresso não mostra erro de carregamento.
- **V5 (R5).** Leitura de `vite.config.ts`: `VitePWA` declara `registerType: "autoUpdate"` e
  `runtimeCaching` com `NetworkOnly` para `/api/`.

## Fora de escopo

- **Instalação em iOS com garantia de persistência.** Safari pode despejar IndexedDB sob pressão de
  disco; a demo é em navegador de desktop e o limite fica registrado no `README`.
- **Background sync (`SyncManager`).** Sem suporte no Firefox; o envio por evento `online` cobre o
  caso de uso.
- **Cache de imagem de carta.** As cartas são texto e SVG; não há imagem remota.

## Condições de invalidação

- **Página em branco com rede desligada.** Prova que o precache parou de incluir a navegação.
- **Resposta perdida ao fechar o app offline.** Prova que a gravação saiu do caminho crítico.

## Perguntas em aberto

- **Qual o limite de cache aceitável em aparelho escolar antigo?** Decide o dono com um teste em
  aparelho real. Hoje o bundle estimado é pequeno, mas fonte e ícone somam.
