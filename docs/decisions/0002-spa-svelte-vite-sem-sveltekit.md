# ADR 0002 — SPA em Svelte 5 + Vite, sem SvelteKit

**Data:** 2026-11-24 · **Status:** aceita

## Contexto

O requisito central é offline-first: o app precisa abrir e funcionar sem rede depois do primeiro
carregamento, em laboratório de escola pública. O servidor só existe para receber eventos e mostrar
agregado.

## Decisão

SPA em Svelte 5 + TypeScript, construída por Vite, com `vite-plugin-pwa` (Workbox) e roteamento por
hash. Um único `server.mjs` (Node, sem framework) serve `dist/` e as rotas `/api/sync` e
`/api/aggregate`. Um container, um deploy.

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| SvelteKit com adapter-node | Renderização no servidor não serve para offline-first; adiciona superfície de cache e de fallback sem ganho |
| Backend FastAPI separado | Dois artefatos e duas linguagens para 120 linhas de servidor |
| Banco de dados no servidor | O servidor não precisa de estado derivado; JSONL append-only resolve (ver ADR 0003) |
| Roteamento por History API | Exige fallback no servidor e configuração de service worker; hash funciona offline sem nada disso |

## Consequências

- A URL tem `#` no caminho. Aceitável para a entrega e invisível para a criança.
- O servidor não tem ORM nem migração, o que reduz o risco de deploy e o tempo de construção.
- Se o projeto crescer para múltiplas escolas com consulta complexa, o JSONL deixa de bastar e entra
  banco — a troca fica isolada em `server.mjs`.
