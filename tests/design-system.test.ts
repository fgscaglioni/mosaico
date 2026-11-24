import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf-8");
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = rgb.map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function token(css: string, name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!match) throw new Error(`Token --${name} ausente`);
  return match[1];
}

describe("design system (T-02, T-04, T-05)", () => {
  const css = read("src/app.css");

  it("temas são distintos entre si e do feedback", () => {
    const temas = ["tema-bullying", "tema-racismo", "tema-xenofobia", "tema-genero"].map((t) => token(css, t));
    const feedback = [token(css, "ok"), token(css, "erro"), token(css, "accent")];

    expect(new Set(temas).size).toBe(4);
    for (const tema of temas) {
      expect(feedback).not.toContain(tema);
    }
  });

  it("contraste AA (>= 4.5:1) para texto sobre branco e paper", () => {
    const branco = "#FFFFFF";
    const paper = token(css, "paper");
    const cores = ["ink", "accent", "ok", "erro", "tema-bullying", "tema-racismo", "tema-xenofobia", "tema-genero"];

    for (const nome of cores) {
      const cor = token(css, nome);
      expect(contrast(cor, branco), `${nome} sobre branco`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(cor, paper), `${nome} sobre paper`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("usa escala rem e tokens de espaço, sem px literais em tipografia", () => {
    expect(css).toContain("--texto-xs: 0.72rem");
    expect(css).toContain("--texto-3xl: 2.7rem");
    expect(css).toContain("--alvo-toque: 44px");
    expect(css).toMatch(/font-size:\s*var\(--texto-/);
  });

  it("modal respeita prefers-reduced-motion", () => {
    const card = read("src/routes/Card.svelte");
    expect(card).toContain("@media (prefers-reduced-motion: reduce)");
    expect(card).toContain("animation: none !important");
  });

  it("componentes usam ícones SVG em vez de emoji", () => {
    const routes = ["Home", "Theme", "Card", "Progress", "Help"];
    for (const rota of routes) {
      const source = read(`src/routes/${rota}.svelte`);
      expect(source).toContain("Icon.svelte");
    }
    const card = read("src/routes/Card.svelte");
    expect(card).not.toContain("✓");
    expect(card).not.toContain("✗");
    const help = read("src/routes/Help.svelte");
    expect(help).not.toContain("💡");
    expect(help).not.toContain("📞");
  });

  it("documentação do design system existe e cobre os 8 princípios", () => {
    const doc = read("docs/design-system.md");
    for (const secao of ["Princípios", "Tokens de cor", "Tipografia", "Formas e espaço", "Ícones", "Movimento", "Progresso nos cartões", "Verificação"]) {
      expect(doc).toContain(secao);
    }
  });
});