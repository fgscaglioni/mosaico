import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const SRC = join(ROOT, "src");
const DOMAIN = join(SRC, "lib", "domain");

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|svelte)$/.test(entry.name) ? [full] : [];
  });
}

const rel = (file: string) => file.slice(ROOT.length + 1);

function importStatements(source: string): { specifier: string; typeOnly: boolean }[] {
  const out: { specifier: string; typeOnly: boolean }[] = [];
  const re = /^\s*import\s+(type\s+)?(?:[^;]*?\s+from\s+)?["']([^"']+)["']/gm;
  for (const match of source.matchAll(re)) {
    out.push({ specifier: match[2], typeOnly: Boolean(match[1]) });
  }
  return out;
}

const FORBIDDEN_GLOBALS =
  /\b(document|window|indexedDB|localStorage|sessionStorage|fetch|XMLHttpRequest|navigator|history|location)\b/;

const TYPE_ESCAPES: { pattern: RegExp; label: string }[] = [
  { pattern: /\bas\s+any\b/, label: "as any" },
  { pattern: /\bas\s+unknown\s+as\b/, label: "as unknown as" },
  { pattern: /@ts-ignore\b/, label: "@ts-ignore" },
  { pattern: /@ts-expect-error\b/, label: "@ts-expect-error" },
];

describe("arquitetura: src/lib/domain é puro", () => {
  const files = walk(DOMAIN);

  it("tem arquivos para auditar", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("não toca DOM, storage nem rede", () => {
    const violations = files.flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .map((line, i) => ({ line, number: i + 1 }))
        .filter(({ line }) => FORBIDDEN_GLOBALS.test(line))
        .map(({ line, number }) => `${rel(file)}:${number} usa global de plataforma: ${line.trim()}`),
    );
    expect(violations).toEqual([]);
  });

  it("só importa valor de dentro do próprio domínio", () => {
    const violations = files.flatMap((file) =>
      importStatements(readFileSync(file, "utf8"))
        .filter(({ specifier, typeOnly }) => !typeOnly && !specifier.startsWith("./"))
        .map(({ specifier }) => `${rel(file)} importa valor de "${specifier}"`),
    );
    expect(violations).toEqual([]);
  });
});

describe("arquitetura: sem escape de tipo em código de produção", () => {
  const files = walk(SRC);

  for (const { pattern, label } of TYPE_ESCAPES) {
    it(`nenhum ${label} em src/`, () => {
      const violations = files.flatMap((file) =>
        readFileSync(file, "utf8")
          .split("\n")
          .map((line, i) => ({ line, number: i + 1 }))
          .filter(({ line }) => pattern.test(line))
          .map(({ line, number }) => `${rel(file)}:${number} ${line.trim()}`),
      );
      expect(violations).toEqual([]);
    });
  }
});
