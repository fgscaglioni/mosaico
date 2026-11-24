# Auditoria Visual e UI — Mosaico → Modern Indie Game UI

**Data:** 2026-11-24 · **Escopo:** camada visual apenas (tokens, geometria, cor, tipografia, tema escuro)
**Preservado integralmente:** lógica de negócio, roteamento hash, store Svelte 5, IndexedDB, `server.mjs`, schemas Zod, conteúdo das cartas.
**Referências:** `visual-design-audit`, `ux-ui-codebase-audit`, `designing-mind-in-mind` (Johnson).

---

## 1. Achado medido que decide a implementação

A paleta proposta usa cores saturadas (75–85%) como tokens semânticos. Medição WCAG das razões de contraste (hex → sRGB linear → luminância):

| Cor | Sobre `#FDFBF7` (light) | Sobre `#131F24` (dark) | Como fundo com `#1E293B` |
|---|---|---|---|
| `#00A8E8` turquesa | 2,62:1 **FAIL** | 6,22:1 OK | 5,41:1 OK |
| `#FF9F1C` âmbar | 1,99:1 **FAIL** | 8,19:1 OK | 7,12:1 OK |
| `#2EC4B6` menta | 2,10:1 **FAIL** | 7,76:1 OK | 6,75:1 OK |
| `#E76F51` terracota | 2,99:1 **FAIL** | 5,44:1 OK | 4,73:1 OK |

**Veredito:** as cores saturadas são corretas como **superfícies de ação e feedback** (botões, badges, fundo de modal), com texto escuro `#1E293B` por cima. Como **cor de texto sobre fundo claro**, reprovam AA. Solução aplicada (doutrina do skill `visual-design-audit`): manter o acento saturado para fundos/ícones e criar variantes `-strong` mais escuras para texto e ícones sobre superfícies claras. No dark mode os valores saturados passam e são usados direto.

## 2. O que muda (mapa)

| Dimensão | Antes | Depois |
|---|---|---|
| Superfície | `#FBF7EE` creme quente | `#FDFBF7` + `#F3EFE6` elevado |
| Texto | `#1B1815` | `#1E293B` / `#475569` |
| Ação | `#4338CA` índigo | `#00A8E8` turquesa + shadow `#007EA7` |
| Feedback | `#166534` / `#B91C1C` | `#2EC4B6` menta / `#E76F51` terracota (não punitivo) |
| Geometria | raio 20/16px, plano | squircle 16–24px + sombra sólida 2.5D |
| Tema | só claro | claro + escuro (`data-theme`, persistido, sem flash) |
| Foco | 1 ponto por tela mantido | reforçado com respiro 1,5–2,5rem |

## 3. Regras de ouro aplicadas

1. **Cor nunca é único canal** — feedback mantém ✓/✗ em SVG + texto + cor. Temas mantêm forma (círculo/losango/triângulo/quadrado) + nome por extenso.
2. **2.5D tactile** — `box-shadow: 0 4px 0 <shadow>` no repouso, `translateY(2px) + 0 2px 0` no `:active`. Respeita `prefers-reduced-motion` (sombra permanece, movimento some).
3. **Alvo de toque** — 44 px mínimo preservado; botões de ação sobem para 48–52 px.
4. **Dark mode para 12–16** — `[data-theme="dark"]` no `<html>`, toggle na barra global, `localStorage`, script inline antes da pintura (sem flash).
5. **Ação primária junto do dado** — "Confirmar resposta" fica na mesma área das alternativas.
6. **Sem novos assets** — zero webfont, zero imagem remota, SVGs inline. Precache do Workbox intacto.

## 4. Teste que prova

`tests/design-system.test.ts` passa a validar: temas distintos do feedback, contraste AA nos pares **usados pela tela** (texto sobre superfície; texto sobre cor de ação), presença de `data-theme="dark"`, sombra 2.5D e `prefers-reduced-motion`.

## 5. Fora de escopo

SEO/marketing, analytics, imagens, fontes remotas, mudança de conteúdo ou lógica. Nenhum ADR novo: decisão é de apresentação e está registrada aqui + `docs/design-system.md`.
