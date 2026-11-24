import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { xpForAnswer, levelFromXp, XP_FIRST_CORRECT, XP_RETRY_CORRECT, XP_WRONG } from "../src/lib/domain/xp";
import { localDay, daysInARow } from "../src/lib/domain/streak";
import { BADGES, badgesFor, type Event, type BadgeId } from "../src/lib/domain/badges";
import { nextCardId, afterWrong } from "../src/lib/domain/queue";
import { catalog } from "../src/lib/content";

describe("prática gamificada", () => {
  describe("xp_por_tentativa (V2)", () => {
    it("primeira tentativa correta = 10", () => {
      expect(xpForAnswer(true, 1)).toBe(XP_FIRST_CORRECT);
    });
    it("retentativa correta = 4", () => {
      expect(xpForAnswer(true, 2)).toBe(XP_RETRY_CORRECT);
      expect(xpForAnswer(true, 3)).toBe(XP_RETRY_CORRECT);
    });
    it("erro = 1", () => {
      expect(xpForAnswer(false, 1)).toBe(XP_WRONG);
      expect(xpForAnswer(false, 2)).toBe(XP_WRONG);
    });
  });

  describe("nivel_a_partir_do_xp (V3)", () => {
    it("0 XP -> nível 1", () => {
      expect(levelFromXp(0)).toEqual({ level: 1, xpInLevel: 0, xpToNext: 50 });
    });
    it("49 XP -> nível 1", () => {
      expect(levelFromXp(49)).toEqual({ level: 1, xpInLevel: 49, xpToNext: 1 });
    });
    it("50 XP -> nível 2", () => {
      expect(levelFromXp(50)).toEqual({ level: 2, xpInLevel: 0, xpToNext: 150 });
    });
    it("200 XP -> nível 3", () => {
      expect(levelFromXp(200)).toEqual({ level: 3, xpInLevel: 0, xpToNext: 250 });
    });
  });

  describe("sequencia_de_dias (V4)", () => {
    it("vazio -> 0", () => {
      expect(daysInARow([])).toBe(0);
    });
    it("só ontem -> 1 (sequência viva)", () => {
      const yesterday = localDay(new Date(Date.now() - 86400000));
      expect(daysInARow([yesterday])).toBe(1);
    });
    it("três dias seguidos -> 3", () => {
      const today = localDay();
      const yesterday = localDay(new Date(Date.now() - 86400000));
      const dayBefore = localDay(new Date(Date.now() - 172800000));
      expect(daysInARow([dayBefore, yesterday, today])).toBe(3);
    });
    it("buraco no meio -> conta só a sequência final", () => {
      const today = localDay();
      const yesterday = localDay(new Date(Date.now() - 86400000));
      const threeDaysAgo = localDay(new Date(Date.now() - 259200000));
      expect(daysInARow([threeDaysAgo, yesterday, today])).toBe(2);
    });
  });

  describe("medalhas_por_comportamento (V5)", () => {
    const baseEvent = (overrides: Partial<Event> = {}): Event => ({
      id: crypto.randomUUID(),
      type: "answer",
      timestamp: Date.now(),
      day: localDay(),
      ...overrides,
    });

    it("log vazio -> nenhuma medalha", () => {
      expect(badgesFor([])).toEqual([]);
    });
    it("primeira resposta -> primeira-resposta", () => {
      expect(badgesFor([baseEvent()])).toContain("primeira-resposta");
    });
    it("dez acertos -> dez-acertos", () => {
      const events = Array.from({ length: 10 }, () => baseEvent({ correct: true }));
      expect(badgesFor(events)).toContain("dez-acertos");
    });
    it("nove acertos -> não dá dez-acertos", () => {
      const events = Array.from({ length: 9 }, () => baseEvent({ correct: true }));
      expect(badgesFor(events)).not.toContain("dez-acertos");
    });
    it("três temas -> tres-temas", () => {
      const events = [
        baseEvent({ theme: "bullying", correct: true }),
        baseEvent({ theme: "racismo", correct: true }),
        baseEvent({ theme: "xenofobia", correct: true }),
      ];
      expect(badgesFor(events)).toContain("tres-temas");
    });
    it("dois temas -> não dá tres-temas", () => {
      const events = [
        baseEvent({ theme: "bullying", correct: true }),
        baseEvent({ theme: "racismo", correct: true }),
      ];
      expect(badgesFor(events)).not.toContain("tres-temas");
    });
    it("três dias distintos -> tres-dias", () => {
      const today = localDay();
      const yesterday = localDay(new Date(Date.now() - 86400000));
      const dayBefore = localDay(new Date(Date.now() - 172800000));
      const events = [
        baseEvent({ day: today, correct: true }),
        baseEvent({ day: yesterday, correct: true }),
        baseEvent({ day: dayBefore, correct: true }),
      ];
      expect(badgesFor(events)).toContain("tres-dias");
    });
    it("acerto em retentativa -> acerto-retentativa", () => {
      const events = [baseEvent({ correct: true, attempt: 2 })];
      expect(badgesFor(events)).toContain("acerto-retentativa");
    });
    it("acerto na primeira -> não dá acerto-retentativa", () => {
      const events = [baseEvent({ correct: true, attempt: 1 })];
      expect(badgesFor(events)).not.toContain("acerto-retentativa");
    });
    it("abriu ajuda -> abriu-ajuda", () => {
      const events = [{ ...baseEvent(), type: "help_open" as const }];
      expect(badgesFor(events)).toContain("abriu-ajuda");
    });
    it("todas as seis medalhas com log completo", () => {
      const today = localDay();
      const yesterday = localDay(new Date(Date.now() - 86400000));
      const dayBefore = localDay(new Date(Date.now() - 172800000));
      const events: Event[] = [
        baseEvent({ day: today, correct: true, theme: "bullying" }),
        baseEvent({ day: yesterday, correct: true, theme: "racismo" }),
        baseEvent({ day: dayBefore, correct: true, theme: "xenofobia" }),
        ...Array.from({ length: 9 }, (_, i) => baseEvent({ correct: true, theme: "genero" })),
        baseEvent({ correct: true, attempt: 2 }),
        { ...baseEvent(), type: "help_open" },
      ];
      const earned = badgesFor(events);
      for (const badge of BADGES) {
        expect(earned).toContain(badge.id);
      }
    });
  });

  describe("carta_errada_volta_tres_posicoes (V6)", () => {
    it("fila de cinco: carta errada vai para posição 3 (índice 2)", () => {
      const queue = ["a", "b", "c", "d", "e"];
      const result = afterWrong(queue, "c");
      expect(result.indexOf("c")).toBe(2);
    });
    it("carta errada já na posição 3 ou além: vai para posição 3 (índice 2)", () => {
      const queue = ["a", "b", "c", "d", "e"];
      const result = afterWrong(queue, "e");
      expect(result.indexOf("e")).toBe(2);
    });
    it("sem duplicar quando já presente", () => {
      const queue = ["a", "b", "c", "d", "e"];
      const result = afterWrong(queue, "c");
      expect(result.filter((id) => id === "c")).toHaveLength(1);
    });
    it("carta não está na fila -> fila inalterada", () => {
      const queue = ["a", "b", "c"];
      expect(afterWrong(queue, "z")).toEqual(queue);
    });
    it("nextCardId devolve primeira da fila do tema", () => {
      const queue = ["bullying-01", "bullying-02", "racismo-01"];
      expect(nextCardId(queue, "bullying", catalog.cards)).toBe("bullying-01");
    });
    it("nextCardId pula temas errados", () => {
      const queue = ["racismo-01", "bullying-01"];
      expect(nextCardId(queue, "bullying", catalog.cards)).toBe("bullying-01");
    });
    it("nextCardId devolve null se tema não tem cartas", () => {
      expect(nextCardId([], "xenofobia", [])).toBeNull();
    });
  });
});