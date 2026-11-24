import { getDeviceId as dbGetDeviceId } from "./db";

let deviceIdPromise: Promise<string> | null = null;

export function getDeviceId(): Promise<string> {
  if (!deviceIdPromise) {
    deviceIdPromise = dbGetDeviceId();
  }
  return deviceIdPromise;
}

export function resetDeviceId(): void {
  deviceIdPromise = null;
}