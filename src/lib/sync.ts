import type { StoredEvent } from "./db";
import { getPendingEvents, removePending } from "./db";
import { getDeviceId } from "./device";

const SYNC_ENDPOINT = "/api/sync";
const AGGREGATE_ENDPOINT = "/api/aggregate";
const HEALTH_ENDPOINT = "/api/health";
const RETRY_INTERVAL_MS = 30000;

let syncInterval: number | null = null;
let isSyncing = false;

export interface SyncResponse {
  accepted: number;
  duplicates: number;
  aggregate: AggregateResponse;
}

export interface AggregateResponse {
  respostas: number;
  acertos: number;
  xp: number;
  aparelhos: number;
  por_tema: Record<string, { respostas: number; acertos: number; xp: number }>;
}

export interface HealthResponse {
  status: string;
  version: string;
}

export async function syncPending(): Promise<SyncResponse | null> {
  if (isSyncing) return null;
  isSyncing = true;

  try {
    const pending = await getPendingEvents();
    if (pending.length === 0) {
      isSyncing = false;
      return null;
    }

    const deviceId = await getDeviceId();
    const payload = { device_id: deviceId, events: pending };

    const response = await fetch(SYNC_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    const result = (await response.json()) as SyncResponse;

    for (const event of pending) {
      await removePending(event.event_id);
    }

    isSyncing = false;
    return result;
  } catch {
    isSyncing = false;
    return null;
  }
}

export async function fetchAggregate(): Promise<AggregateResponse | null> {
  try {
    const response = await fetch(AGGREGATE_ENDPOINT);
    if (!response.ok) return null;
    return (await response.json()) as AggregateResponse;
  } catch {
    return null;
  }
}

export async function checkHealth(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(HEALTH_ENDPOINT);
    if (!response.ok) return null;
    return (await response.json()) as HealthResponse;
  } catch {
    return null;
  }
}

export function startAutoSync(): void {
  if (syncInterval) return;
  syncInterval = window.setInterval(() => {
    if (navigator.onLine) {
      syncPending();
    }
  }, RETRY_INTERVAL_MS);
}

export function stopAutoSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

export function triggerSyncOnOnline(): void {
  window.addEventListener("online", () => {
    syncPending();
  });
}