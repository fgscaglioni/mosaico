const DB_NAME = "mosaico";
const DB_VERSION = 1;
const EVENTS_STORE = "events";
const PENDING_STORE = "pending";
const DEVICE_STORE = "device";

export interface StoredEvent {
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

export interface DeviceRecord {
  key: "device_id";
  value: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        const eventsStore = db.createObjectStore(EVENTS_STORE, { keyPath: "event_id" });
        eventsStore.createIndex("by_day", "local_day", { unique: false });
        eventsStore.createIndex("by_theme", "theme", { unique: false });
        eventsStore.createIndex("by_type", "type", { unique: false });
      }
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: "event_id" });
      }
      if (!db.objectStoreNames.contains(DEVICE_STORE)) {
        db.createObjectStore(DEVICE_STORE, { keyPath: "key" });
      }
    };
  });
}

export async function getDeviceId(): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DEVICE_STORE, "readonly");
    const request = tx.objectStore(DEVICE_STORE).get("device_id");
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.value);
      } else {
        const newId = crypto.randomUUID();
        const tx2 = db.transaction(DEVICE_STORE, "readwrite");
        tx2.objectStore(DEVICE_STORE).put({ key: "device_id", value: newId });
        tx2.oncomplete = () => resolve(newId);
        tx2.onerror = () => reject(tx2.error);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveEvent(event: StoredEvent): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EVENTS_STORE, "readwrite");
    tx.objectStore(EVENTS_STORE).put(event);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function savePending(event: StoredEvent): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readwrite");
    tx.objectStore(PENDING_STORE).put(event);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingEvents(): Promise<StoredEvent[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readonly");
    const request = tx.objectStore(PENDING_STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removePending(eventId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readwrite");
    tx.objectStore(PENDING_STORE).delete(eventId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllEvents(): Promise<StoredEvent[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EVENTS_STORE, "readonly");
    const request = tx.objectStore(EVENTS_STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getEventsByDay(day: string): Promise<StoredEvent[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EVENTS_STORE, "readonly");
    const request = tx.objectStore(EVENTS_STORE).index("by_day").getAll(day);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearAll(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([EVENTS_STORE, PENDING_STORE], "readwrite");
    tx.objectStore(EVENTS_STORE).clear();
    tx.objectStore(PENDING_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}