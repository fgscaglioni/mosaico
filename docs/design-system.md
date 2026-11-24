# Design System — Mosaico (crianças 8–16 anos)

**Origem:** Conselho de Produto de 2026-11-24 (`docs/board/2026-11-24-design-system-criancas.md`), veredito `faz menor`.
**Regras:** `AGENTS.md`, `docs/specs/PROJECT.md` §8, `docs/specs/IMPLEMENTATION.md` §6, ADR-0002 e ADR-0004.
**Escopo:** camada de apresentação. Conteúdo, schemas Zod, domínio, rotas e testes existentes não são alterados.

---

## 1. Princípios

1. **Alegre, não infantil.** Cores vibrantes e formas arredondadas para prender a atenção de 8–11 anos, sem cair no "bebê" que afasta 12–14 anos.
2. **Cor nunca é o único canal.** Cada tema tem nome por extenso e o feedback usa texto + forma + cor. ÍconesSVG têm `aria-hidden` quando decorativos.
3. **Contraste primeiro.** Todo texto sobre fundo sólido passa AA (≥4,5:1). Verificado em `tests/design-system.test.ts`.
4. **Offline por desenho.** Nenhuma webfont, nenhuma imagem remota, nenhuma dependência de runtime: o precache do Workbox continua com ~216 KB.
5. **Movimento com respeito.** Toda animação tem alternativa `prefers-reduced-motion: reduce`.

---

## 2. Tokens de cor (primitive → semantic)

### Base

| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#FBF7EE` | Fundo quente, nunca branco puro |
| `--ink` | `#1B1815` | Texto principal (16,5:1 sobre paper) |
| `--rule` | `#D9D2C7` | Bordas e divisores |
| `--branco` | `#FFFFFF` | Texto sobre superfícies escuras |

### Ação (CTA e links)

| Token | Valor | Contraste sobre branco | Contraste sobre paper |
|---|---|---|---|
| `--accent` | `#4338CA` (índigo) | 7,90:1 | 7,39:1 |

### Feedback (estado da resposta)

| Token | Valor | Contraste sobre branco | Uso |
|---|---|---|---|
| `--ok` | `#166534` (verde) | 7,13:1 | Acerto |
| `--erro` | `#B91C1C` (vermelho) | 6,47:1 | Erro |

### Temas

| Token | Valor | Contraste sobre branco | Forma associada |
|---|---|---|---|
| `--tema-bullying` | `#C2410C` (laranja) | 5,18:1 | Círculo cheio |
| `--tema-racismo` | `#6D28D9` (violeta) | 7,10:1 | Losango |
| `--tema-xenofobia` | `#0369A1` (azul) | 5,93:1 | Triângulo |
| `--tema-genero` | `#BE185D` (rosa) | 6,04:1 | Quadrado arredondado |

**Regra dura:** nenhum token de tema pode ter o mesmo valor de `--ok`, `--erro` ou `--accent`. As quatro cores de tema são distintas entre si e do feedback. Cada tema também tem uma **forma** própria (`data-forma`), para que a identificação não dependa só da cor.

---

## 3. Tipografia

**Fonte:** pilha nativa progressiva, sem download. Arredondada onde o sistema oferecer.

```
--fonte-corpo:   "Avenir Next", "Segoe UI", Roboto, "Trebuchet MS", system-ui, sans-serif;
--fonte-titulo:  "Avenir Next Rounded", "SF Pro Rounded", "Segoe UI", "Trebuchet MS", system-ui, sans-serif;
```

| Token | rem | px @ 18 | Uso |
|---|---|---|---|
| `--texto-xs` | 0,72rem | ~13 | Rótulos (`label`, `.rotulo`) |
| `--texto-sm` | 0,8rem | ~14 | Metadados, fontes |
| `--texto-base` | 1rem | 18 | Corpo |
| `--texto-md` | 1,1rem | 20 | Enunciado da carta |
| `--texto-lg` | 1,22rem | 22 | `h2` |
| `--texto-xl` | 1,35rem | 24 | Título do modal |
| `--texto-2xl` | 1,67rem | 30 | `h1` |
| `--texto-3xl` | 2,7rem | 48 | Nível no progresso |

**Regra:** nenhum tamanho de fonte literal em `px` nos componentes. Usar apenas os tokens.

---

## 4. Formas e espaço

| Token | Valor | Uso |
|---|---|---|
| `--raio` | 20px | Cards, modais, seções |
| `--raio-botao` | 16px | Botões, inputs, pills |
| `--raio-pill` | 999px | Medalhas, tags de XP |
| `--esp-1` … `--esp-8` | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px | Espaçamento, múltiplos de 4 |

Alvo de toque mínimo: **44 px** (`--alvo-toque`). Aplicado a `button`, `a[role=button]`, `input`, links do topo e botões do modal.

---

## 5. Ícones

Substituir emoji por componente `Icon.svelte`, SVG inline, `stroke="currentColor"`, sem rede:

| Nome | Uso | Forma |
|---|---|---|
| `check` | Acerto | Círculo com ✓ |
| `x` | Erro | Círculo com ✗ |
| `star` | Medalha conquistada | Estrela de 5 pontas |
| `arrow-left` | Voltar | Seta |
| `help` | Ajuda | Círculo com ? |
| `phone` | Canal telefônico | Telefone |
| `coins` | XP | Moedas empilhadas |

Ícones decorativos recebem `aria-hidden="true"`; ícones com sentido recebem `role="img"` e `aria-label`.

---

## 6. Movimento

| Token | Valor | Uso |
|---|---|---|
| `--dur-rapida` | 0,15s | Hover, foco |
| `--dur-normal` | 0,3s | Progresso, transição |
| `--easing-pop` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Acerto (salto elástico) |
| `--easing-suave` | `ease-out` | Erro (tremor amortecido) |

**Regra dura:** toda `@keyframes` e `animation` deve ser envolvida por:

```css
@media (prefers-reduced-motion: no-preference) {
  /* animações aqui */
}
```

Com `reduce`, o feedback aparece imediatamente, sem movimento.

---

## 7. Progresso nos cartões de tema (cliente chato)

Cartões de tema em `Home` e `Theme` não podem ser idênticos. Cada um deve exibir:
- nome do tema por extenso,
- forma associada (SVG),
- contagem de cartas respondidas (derivada de `store.progress.porTema`),
- percentual em **texto** (cor não é canal único).

---

## 8. Verificação

- `npm test` — 51 testes existentes + `tests/design-system.test.ts` (tokens e contraste AA).
- `npx playwright test` — 8 testes E2E (classes e textos preservados).
- `npx svelte-check --tsconfig ./tsconfig.json` — 0 errors.
- `npm run build` — precache sem novos assets de fonte/imagem.
