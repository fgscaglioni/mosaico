import { describe, it, expect } from "vitest";
import { embaralharIndices } from "../src/lib/domain/shuffle";

describe("embaralharIndices", () => {
  it("mantem todos os índices exatamente uma vez (V9)", () => {
    for (const n of [1, 2, 3, 4]) {
      const ordem = embaralharIndices(n);
      expect([...ordem].sort((a, b) => a - b)).toEqual(
        Array.from({ length: n }, (_, i) => i),
      );
    }
  });

  it("com aleatório fixo devolve a permutação esperada (V9)", () => {
    // Fisher-Yates com aleatorio sempre 0: cada passo troca com o índice 0.
    expect(embaralharIndices(4, () => 0)).toEqual([1, 2, 3, 0]);
    // Aleatório sempre próximo de 1: nenhuma troca efetiva.
    expect(embaralharIndices(4, () => 0.9999)).toEqual([0, 1, 2, 3]);
  });

  it("ordens diferentes em apresentações sucessivas (V9)", () => {
    const ordens = new Set<string>();
    for (let i = 0; i < 40; i++) ordens.add(embaralharIndices(4).join(","));
    expect(ordens.size).toBeGreaterThan(1);
  });

  it("a alternativa correta continua identificável após embaralhar (V9)", () => {
    const opcoes = ["A", "B", "C", "D"];
    const corretaOriginal = 2;
    for (let i = 0; i < 20; i++) {
      const ordem = embaralharIndices(opcoes.length);
      const exibidas = ordem.map((orig) => opcoes[orig]);
      expect(exibidas).toContain(opcoes[corretaOriginal]);
      expect(exibidas.indexOf(opcoes[corretaOriginal])).toBe(
        ordem.indexOf(corretaOriginal),
      );
    }
  });
});
