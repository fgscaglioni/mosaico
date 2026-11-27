/**
 * Embaralha os índices das alternativas de uma carta (Fisher-Yates).
 * Devolve uma permutação de [0..n), sem mutar o array de entrada.
 * O parâmetro `aleatorio` existe para testes determinísticos; em produção
 * o padrão é Math.random. Domínio puro: sem DOM, sem storage, sem rede.
 */
export function embaralharIndices(
  n: number,
  aleatorio: () => number = Math.random,
): number[] {
  const indices = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}
