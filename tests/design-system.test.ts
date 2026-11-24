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

describe("design system indie game UI", () => {
  const css = read("src/app.css");

  it("tokens base light mode são os definidos na spec", () => {
    expect(token(css, "bg-primary")).toBe("#FDFBF7");
    expect(token(css, "bg-secondary")).toBe("#F3EFE6");
    expect(token(css, "text-primary")).toBe("#1E293B");
    expect(token(css, "color-primary")).toBe("#00A8E8");
    expect(token(css, "color-secondary")).toBe("#FF9F1C");
    expect(token(css, "color-success")).toBe("#2EC4B6");
    expect(token(css, "color-error")).toBe("#E76F51");
  });

  it("dark mode cobre todas as superfícies e texto", () => {
    expect(css).toContain('[data-theme="dark"]');
    const dark = css.split('[data-theme="dark"]')[1].split("}")[0];
    for (const t of ["bg-primary", "bg-secondary", "text-primary", "text-secondary"]) {
      expect(dark).toMatch(new RegExp(`--${t}:`));
    }
  });

  it("contraste AA para texto em ambos os temas", () => {
    for (const [bg, fg, fg2] of [
      [token(css, "bg-primary"), token(css, "text-primary"), token(css, "text-secondary")],
      [token(css, "bg-secondary"), token(css, "text-primary"), token(css, "text-secondary")],
    ]) {
      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(fg2, bg)).toBeGreaterThanOrEqual(4.5);
    }
    const darkCss = css.split('[data-theme="dark"]')[1];
    expect(contrast(token(darkCss, "text-primary"), token(darkCss, "bg-primary"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token(darkCss, "text-secondary"), token(darkCss, "bg-secondary"))).toBeGreaterThanOrEqual(4.5);
  });

  it("cores saturadas como fundo usam texto escuro legível", () => {
    const on = token(css, "text-on-color");
    for (const t of ["color-primary", "color-secondary", "color-success", "color-error"]) {
      expect(contrast(on, token(css, t)), t).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("variantes -strong garantem texto AA sobre fundo claro", () => {
    const light = token(css, "bg-primary");
    for (const t of ["color-primary-strong", "color-secondary-strong", "color-success-strong", "color-error-strong"]) {
      expect(contrast(token(css, t), light), t).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("temas são distintos entre si e do feedback", () => {
    const temas = ["tema-bullying", "tema-racismo", "tema-xenofobia", "tema-genero"].map((t) => token(css, t));
    const feedback = [token(css, "color-success"), token(css, "color-error"), token(css, "color-primary")];
    expect(new Set(temas).size).toBe(4);
    for (const tema of temas) expect(feedback).not.toContain(tema);
  });

  it("geometria squircle e profundidade 2.5D presentes", () => {
    expect(css).toContain("--raio-cards: 24px");
    expect(css).toContain("--raio-botao: 14px");
    expect(read("src/App.svelte")).toContain("0 4px 0");
    expect(read("src/routes/Home.svelte")).toContain("translateY(3px)");
    expect(read("src/routes/Card.svelte")).toContain("translateY(2px)");
  });

  it("respeita prefers-reduced-motion", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(read("src/routes/Card.svelte")).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("toggle de tema sem flash e persistido", () => {
    const html = read("index.html");
    expect(html).toContain('data-theme');
    expect(html).toContain('localStorage.getItem("mosaico-theme")');
    const app = read("src/App.svelte");
    expect(app).toContain('toggleTheme');
    expect(app).toContain('localStorage.setItem("mosaico-theme"');
  });

  it("ícones SVG sem emoji nas rotas", () => {
    for (const rota of ["Home", "Theme", "Card", "Progress", "Help"]) {
      expect(read(`src/routes/${rota}.svelte`)).toContain("Icon.svelte");
    }
  });
});
