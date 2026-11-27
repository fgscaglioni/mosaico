import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf-8");
}

describe("aviso de fase experimental", () => {
  it("o aviso aparece em todas as telas pelo App (V1)", () => {
    expect(read("src/App.svelte")).toContain("AvisoExperimental");
  });

  it("o texto diz que as questões não foram avaliadas por humano (V1)", () => {
    const aviso = read("src/lib/components/AvisoExperimental.svelte");
    expect(aviso).toContain("não foram avaliadas por uma pessoa");
    expect(aviso).toContain("fase de experimentos");
  });

  it("o texto diz que revisão humana é indispensável antes de produção (V1)", () => {
    const aviso = read("src/lib/components/AvisoExperimental.svelte");
    expect(aviso).toContain("revisão humana");
    expect(aviso).toContain("indispensável");
    expect(aviso).toContain("produção");
  });

  it("o aviso pode ser fechado na sessão e volta no próximo carregamento (V2)", () => {
    const app = read("src/App.svelte");
    expect(app).toContain("avisoVisivel");
    expect(app).not.toContain("localStorage.setItem(\"mosaico-aviso\"");
  });
});
