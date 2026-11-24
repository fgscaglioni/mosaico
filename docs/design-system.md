# Design System — Mosaico (Modern Indie Game UI)

**Origem:** Conselho de Produto (2026-11-24), veredito `faz menor` para apresentação, e auditoria visual de 2026-11-24 (`docs/board/2026-11-24-indie-game-ui-audit.md`).
**Regras:** `AGENTS.md`, `docs/specs/PROJECT.md` §8, ADR-0002 e ADR-0004.
**Escopo:** camada de apresentação. Lógica, rotas, store, IndexedDB, servidor, schemas e conteúdo preservados.

---

## 1. Princípios

1. **Indie Game UI, não corporativo e não infantil.** Tátil e expressivo na superfície (squircle, sombra 2.5D, micro-interações), limpo e estruturado por baixo (escala rem, um foco por tela, muito espaço em branco).
2. **Cor nunca é o único canal.** Feedback usa ✓/✗ em SVG + texto + cor; temas usam forma + nome + cor.
3. **AA medido, não declarado.** Cores saturadas são superfícies de ação com `--text-on-color: #1E293B` (4,73–7,12:1). Variantes `-strong` são para texto sobre fundo claro. Dark mode medido à parte.
4. **Offline por desenho.** Zero webfont, zero imagem remota, nenhuma dependência nova. SVGs inline.
5. **Movimento com respeito.** Toda animação tem `@media (prefers-reduced-motion: reduce)`.

---

## 2. Tokens de cor

### Light (padrão)

| Token | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#FDFBF7` | Fundo creme quente |
| `--bg-secondary` | `#F3EFE6` | Superfície elevada de cards |
| `--text-primary` | `#1E293B` | Texto (14,15:1) |
| `--text-secondary` | `#475569` | Texto secundário (7,33:1) |
| `--color-primary` | `#00A8E8` | Ação, fundo de botão (texto escuro: 5,41:1) |
| `--color-primary-shadow` | `#007EA7` | Sombra 2.5D do primário |
| `--color-primary-strong` | `#006B8E` | Texto/link sobre claro (4,47:1) |
| `--color-secondary` | `#FF9F1C` | Destaque, XP, medalha (texto escuro: 7,12:1) |
| `--color-secondary-shadow` | `#CC7A00` | Sombra 2.5D do âmbar |
| `--color-success` | `#2EC4B6` | Acerto (texto escuro: 6,75:1) |
| `--color-success-shadow` | `#208B81` | Sombra 2.5D do acerto |
| `--color-error` | `#E76F51` | Erro não punitivo — nunca vermelho puro (texto escuro: 4,73:1) |
| `--color-error-shadow` | `#B54D32` | Sombra 2.5D do erro |
| `--text-on-color` | `#1E293B` | Texto sobre qualquer cor saturada |

### Dark (`[data-theme="dark"]`)

`--bg-primary: #131F24` · `--bg-secondary: #1D2D35` · `--text-primary: #F8FAFC` · `--text-secondary: #94A3B8`. As cores saturadas passam AA direto sobre fundo escuro (turquesa 6,22:1, âmbar 8,19:1, menta 7,76:1, terracota 5,44:1).

**Regra dura:** nenhum tema tem o mesmo valor de feedback. Temas: bullying `#F472B6`, racismo `#7B4DB8`, xenofobia `#4FC3F7`, gênero `#E85D9E`.

---

## 3. Tipografia

Pilha nativa progressiva, sem download: `--fonte-corpo` (Avenir Next → Segoe UI → Roboto → Trebuchet MS → system-ui) e `--fonte-titulo` (Avenir Next Rounded → SF Pro Rounded → Segoe UI → Trebuchet MS → system-ui).

Escala rem: `--texto-xs` 0,72 · `--texto-sm` 0,8 · `--texto-base` 1 · `--texto-md` 1,1 · `--texto-lg` 1,22 · `--texto-xl` 1,35 · `--texto-2xl` 1,67 · `--texto-3xl` 2,7 (base 18 px).

---

## 4. Geometria e profundidade

| Token | Valor | Uso |
|---|---|---|
| `--raio-cards` | 24px | Cards e modais (squircle) |
| `--raio` | 20px | Blocos internos |
| `--raio-botao` | 14px | Botões, inputs, badges |
| `--raio-pill` | 999px | Medalhas e tags de XP |
| `--esp-1` … `--esp-8` | 4/8/12/16/24/32/40/48px | Múltiplos de 4 |
| `--alvo-toque` / `--alvo-acao` | 44px / 52px | Alvos mínimos |

**2.5D tátil:** `box-shadow: 0 4px 0 <shadow>` no repouso, `translateY(2–3px)` + `0 2px 0` no `:active`. Classes utilitárias `.tatil`, `.tatil-sucesso`. Sob `prefers-reduced-motion` o movimento some, a sombra permanece.

---

## 5. Ícones

`src/lib/Icon.svelte`: SVG inline, `stroke="currentColor"`, sem rede. Nomes: `check`, `x`, `star`, `arrow-left`, `help`, `phone`, `coins`, `bullying`, `racismo`, `xenofobia`, `genero`. Decorativos usam `aria-hidden`; informativos usam `role="img"` + `aria-label`.

---

## 6. Tema escuro

Toggle na barra global com `aria-pressed`, ícone ☾/☀ e `localStorage` (`mosaico-theme`). Script inline no `index.html` aplica o tema antes da primeira pintura (sem flash). Respeita `prefers-color-scheme` quando não há escolha salva.

---

## 7. Verificação

- `npm test` — 61 testes (10 de design system com contraste AA e tokens).
- `npx playwright test` — 9 E2E (8 originais + auditoria visual computada light/dark).
- `npx svelte-check --tsconfig ./tsconfig.json` — 0 errors.
- `npm run build` — precache sem novos assets de fonte/imagem.
