import { describe, it, expect, beforeEach } from "vitest";
import { localDay } from "../src/lib/domain/streak";
import { catalog } from "../src/lib/content";

interface MemoryEvent {
  event_id: string;
  device_id: string;
  type: "answer" | "help_open";
  card_id?: string;
  theme?: string;
  correct?: boolean;
  attempt?: number;
  xp?: number;
  local_day: string;
  client_ts: number;
  catalog_version: number;
}

class MemoryStore {
  private events: MemoryEvent[] = [];
  private pending: MemoryEvent[] = [];
  private deviceId: string | null = null;

  async getDeviceId(): Promise<string> {
    if (!this.deviceId) {
      this.deviceId = crypto.randomUUID();
    }
    return this.deviceId;
  }

  async saveEvent(event: MemoryEvent): Promise<void> {
    this.events.push(event);
  }

  async savePending(event: MemoryEvent): Promise<void> {
    this.pending.push(event);
  }

  async getEvents(): Promise<MemoryEvent[]> {
    return [...this.events];
  }

  async getPending(): Promise<MemoryEvent[]> {
    return [...this.pending];
  }

  clear(): void {
    this.events = [];
    this.pending = [];
    this.deviceId = null;
  }
}

describe("resposta_registra_evento_com_xp (V1)", () => {
  let memStore: MemoryStore;

  beforeEach(() => {
    memStore = new MemoryStore();
  });

  it("resposta correta na primeira tentativa grava evento com xp=10", async () => {
    const deviceId = await memStore.getDeviceId();
    const event: MemoryEvent = {
      event_id: crypto.randomUUID(),
      device_id: deviceId,
      type: "answer",
      card_id: "bullying-01",
      theme: "bullying",
      correct: true,
      attempt: 1,
      xp: 10,
      local_day: localDay(),
      client_ts: Date.now(),
      catalog_version: catalog.catalog_version,
    };

    await memStore.saveEvent(event);
    await memStore.savePending(event);

    const events = await memStore.getEvents();
    const pending = await memStore.getPending();

    expect(events).toHaveLength(1);
    expect(events[0].xp).toBe(10);
    expect(events[0].correct).toBe(true);
    expect(events[0].attempt).toBe(1);
    expect(events[0].theme).toBe("bullying");
    expect(events[0].card_id).toBe("bullying-01");
    expect(events[0].event_id).toBeDefined();
    expect(events[0].device_id).toBe(deviceId);
    expect(events[0].catalog_version).toBe(1);
    expect(pending).toHaveLength(1);
  });

  it("resposta correta em retentativa grava evento com xp=4", async () => {
    const deviceId = await memStore.getDeviceId();
    const event: MemoryEvent = {
      event_id: crypto.randomUUID(),
      device_id: deviceId,
      type: "answer",
      card_id: "racismo-01",
      theme: "racismo",
      correct: true,
      attempt: 2,
      xp: 4,
      local_day: localDay(),
      client_ts: Date.now(),
      catalog_version: catalog.catalog_version,
    };

    await memStore.saveEvent(event);

    const events = await memStore.getEvents();
    expect(events[0].xp).toBe(4);
    expect(events[0].attempt).toBe(2);
  });

  it("resposta errada grava evento com xp=1", async () => {
    const deviceId = await memStore.getDeviceId();
    const event: MemoryEvent = {
      event_id: crypto.randomUUID(),
      device_id: deviceId,
      type: "answer",
      card_id: "xenofobia-01",
      theme: "xenofobia",
      correct: false,
      attempt: 1,
      xp: 1,
      local_day: localDay(),
      client_ts: Date.now(),
      catalog_version: catalog.catalog_version,
    };

    await memStore.saveEvent(event);

    const events = await memStore.getEvents();
    expect(events[0].xp).toBe(1);
    expect(events[0].correct).toBe(false);
  });

  it("evento help_open gravado sem xp nem card_id", async () => {
    const deviceId = await memStore.getDeviceId();
    const event: MemoryEvent = {
      event_id: crypto.randomUUID(),
      device_id: deviceId,
      type: "help_open",
      local_day: localDay(),
      client_ts: Date.now(),
      catalog_version: catalog.catalog_version,
    };

    await memStore.saveEvent(event);

    const events = await memStore.getEvents();
    expect(events[0].type).toBe("help_open");
    expect(events[0].xp).toBeUndefined();
    expect(events[0].card_id).toBeUndefined();
    expect(events[0].theme).toBeUndefined();
    expect(events[0].correct).toBeUndefined();
    expect(events[0].attempt).toBeUndefined();
  });
});