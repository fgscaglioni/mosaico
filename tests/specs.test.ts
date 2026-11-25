import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const SPECS = join(ROOT, "docs", "specs", "features");

interface Feature {
  name: string;
  spec: string;
  tasks: string;
}

function features(): Feature[] {
  return readdirSync(SPECS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      spec: join(SPECS, entry.name, "SPECIFICATION.md"),
      tasks: join(SPECS, entry.name, "TASKS.md"),
    }));
}

/** "V1–V4", "V1-V4" e "V2, V3" viram os ids que representam. */
function ids(text: string, letter: string): Set<number> {
  const found = new Set<number>();
  for (const match of text.matchAll(new RegExp(`${letter}(\\d+)\\s*[–-]\\s*${letter}(\\d+)`, "g"))) {
    for (let n = Number(match[1]); n <= Number(match[2]); n++) found.add(n);
  }
  for (const match of text.matchAll(new RegExp(`\\b${letter}(\\d+)`, "g"))) found.add(Number(match[1]));
  return found;
}

/** Itens de lista com as linhas de continuação juntas. */
function items(markdown: string): string[] {
  const out: string[] = [];
  let current: string | null = null;
  for (const line of markdown.split("\n")) {
    if (/^\s*-\s*\[/.test(line)) {
      if (current) out.push(current);
      current = line;
    } else if (current && line.trim() && !/^(#|\*\*)/.test(line.trim())) {
      current += ` ${line.trim()}`;
    } else if (current) {
      out.push(current);
      current = null;
    }
  }
  if (current) out.push(current);
  return out;
}

function requirementOwners(spec: string): Map<number, number[]> {
  const owners = new Map<number, number[]>();
  for (const match of spec.matchAll(/\*\*R(\d+)\./g)) owners.set(Number(match[1]), []);
  for (const match of spec.matchAll(/\*\*V(\d+)\s*\(R([\d,\s]+)\)/g)) {
    for (const req of match[2].matchAll(/\d+/g)) {
      owners.get(Number(req[0]))?.push(Number(match[1]));
    }
  }
  return owners;
}

describe("specs: o documento de tarefas cobre o documento de requisitos", () => {
  for (const feature of features()) {
    describe(feature.name, () => {
      it("tem SPECIFICATION.md e TASKS.md", () => {
        expect(existsSync(feature.spec), `falta ${feature.spec}`).toBe(true);
        expect(existsSync(feature.tasks), `falta ${feature.tasks}`).toBe(true);
      });

      it("todo R# tem ao menos uma tarefa que o cumpre", () => {
        const spec = readFileSync(feature.spec, "utf8");
        const tasks = readFileSync(feature.tasks, "utf8");
        const cited = ids(tasks, "R");
        const citedCriteria = ids(tasks, "V");

        const missing: string[] = [];
        for (const [requirement, owners] of requirementOwners(spec)) {
          const byCriteria = owners.some((criterion) => citedCriteria.has(criterion));
          if (!cited.has(requirement) && !byCriteria) missing.push(`R${requirement}`);
        }
        expect(missing, `sem tarefa em ${feature.name}`).toEqual([]);
      });

      it("toda tarefa que toca código cita R# ou V#", () => {
        const tasks = readFileSync(feature.tasks, "utf8");
        const offenders = items(tasks)
          .filter((item) => /\b(src|tests|e2e)\//.test(item))
          .filter((item) => !/[RV]\d+/.test(item))
          .map((item) => item.replace(/\s+/g, " ").slice(0, 100));
        expect(offenders).toEqual([]);
      });

      it("não cita V# que a spec não define", () => {
        const spec = readFileSync(feature.spec, "utf8");
        const tasks = readFileSync(feature.tasks, "utf8");
        const defined = ids(spec, "V");
        const ghosts = [...ids(tasks, "V")].filter((v) => !defined.has(v)).map((v) => `V${v}`);
        expect(ghosts, `critério inexistente em ${feature.name}`).toEqual([]);
      });
    });
  }
});
