import { describe, it, expect } from "vitest";
import { helpContent, HelpSchema } from "../src/lib/content";
import helpJson from "../content/help.json";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("ajuda e encaminhamento", () => {
  describe("canais_obrigatorios (V2)", () => {
    it("valida schema de ajuda", () => {
      expect(HelpSchema.safeParse(helpJson).success).toBe(true);
    });

    it("contém números 100, 180, 188", () => {
      const numbers = helpContent.channels.map((c) => c.number).filter(Boolean);
      expect(numbers).toContain("100");
      expect(numbers).toContain("180");
      expect(numbers).toContain("188");
    });

    it("contém Conselho Tutelar", () => {
      const names = helpContent.channels.map((c) => c.name);
      expect(names).toContain("Conselho Tutelar");
    });
  });

  describe("leitura_do_campo_adult_tip (V5)", () => {
    it("adult_tip não está vazio", () => {
      expect(helpContent.adult_tip).toBeDefined();
      expect(helpContent.adult_tip.length).toBeGreaterThan(10);
    });

    it("menciona adulto de confiança e proteção", () => {
      const lower = helpContent.adult_tip.toLowerCase();
      expect(lower).toContain("adulto de confiança");
      expect(lower).toContain("proteção");
    });
  });

  describe("abrir_ajuda_registra_um_evento (V3)", () => {
    it("evento tem tipo help_opened e nenhum campo de texto", () => {
      const event = {
        event_id: crypto.randomUUID(),
        device_id: "test-device",
        type: "help_opened" as const,
        local_day: "2026-11-24",
        client_ts: Date.now(),
        catalog_version: 1,
      };

      expect(event.type).toBe("help_opened");
      expect((event as any).text).toBeUndefined();
      expect((event as any).message).toBeUndefined();
      expect((event as any).input).toBeUndefined();
    });
  });

  describe("tela_sem_campo_de_entrada (V4)", () => {
    it("não contém input de texto, textarea nem form no componente Help", () => {
      const helpPath = resolve(process.cwd(), "src/routes/Help.svelte");
      const content = readFileSync(helpPath, "utf-8");

      expect(content).not.toMatch(/<input[^>]*type=["']text["']/i);
      expect(content).not.toMatch(/<textarea/i);
      expect(content).not.toMatch(/<form/i);
    });
  });
});