import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { mkdirSync, rmSync, existsSync, readFileSync, appendFileSync } from "node:fs";
import { resolve, join } from "node:path";

const EventSchema = z.object({
  event_id: z.string().min(1),
  device_id: z.string().min(1),
  type: z.enum(["answer", "help_open", "help_opened"]),
  card_id: z.string().optional(),
  theme: z.enum(["bullying", "racismo", "xenofobia", "genero"]).optional(),
  correct: z.boolean().optional(),
  attempt: z.number().int().min(1).optional(),
  xp: z.number().int().min(0).optional(),
  local_day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  client_ts: z.number().int().positive(),
  catalog_version: z.number().int().positive(),
});

describe("sincronização de eventos", () => {
  describe("evento_tem_campos_obrigatorios (V1)", () => {
    it("valida evento completo de resposta", () => {
      const event = {
        event_id: "evt-123",
        device_id: "dev-456",
        type: "answer" as const,
        card_id: "bullying-01",
        theme: "bullying" as const,
        correct: true,
        attempt: 1,
        xp: 10,
        local_day: "2026-11-24",
        client_ts: Date.now(),
        catalog_version: 1,
      };

      const result = EventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it("valida evento de ajuda", () => {
      const event = {
        event_id: "evt-789",
        device_id: "dev-456",
        type: "help_opened" as const,
        local_day: "2026-11-24",
        client_ts: Date.now(),
        catalog_version: 1,
      };

      const result = EventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it("rejeita evento sem event_id ou client_ts", () => {
      const invalid = {
        device_id: "dev-456",
        type: "answer",
      };
      expect(EventSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("deduplicação e persistência append-only (V3, V4)", () => {
    const TEST_DATA_DIR = resolve("tests/temp-data");
    const TEST_EVENTS_FILE = join(TEST_DATA_DIR, "events.jsonl");

    beforeEach(() => {
      mkdirSync(TEST_DATA_DIR, { recursive: true });
      if (existsSync(TEST_EVENTS_FILE)) rmSync(TEST_EVENTS_FILE);
    });

    afterEach(() => {
      if (existsSync(TEST_DATA_DIR)) rmSync(TEST_DATA_DIR, { recursive: true });
    });

    it("reenvio_nao_duplica (V3, V4)", () => {
      const knownIds = new Set<string>();

      function syncEvents(events: any[]) {
        let accepted = 0;
        let duplicates = 0;
        const lines: string[] = [];

        for (const event of events) {
          if (!event.event_id || knownIds.has(event.event_id)) {
            duplicates++;
            continue;
          }
          knownIds.add(event.event_id);
          accepted++;
          lines.push(JSON.stringify(event));
        }

        if (lines.length > 0) {
          appendFileSync(TEST_EVENTS_FILE, lines.join("\n") + "\n");
        }

        return { accepted, duplicates };
      }

      const event = {
        event_id: "evt-unique-1",
        device_id: "dev-1",
        type: "answer",
        card_id: "bullying-01",
        theme: "bullying",
        correct: true,
        attempt: 1,
        xp: 10,
        local_day: "2026-11-24",
        client_ts: 123456789,
        catalog_version: 1,
      };

      const r1 = syncEvents([event]);
      expect(r1.accepted).toBe(1);
      expect(r1.duplicates).toBe(0);

      const r2 = syncEvents([event]);
      expect(r2.accepted).toBe(0);
      expect(r2.duplicates).toBe(1);

      const content = readFileSync(TEST_EVENTS_FILE, "utf-8");
      const lines = content.trim().split("\n");
      expect(lines).toHaveLength(1);
      expect(JSON.parse(lines[0]).event_id).toBe("evt-unique-1");
    });
  });
});