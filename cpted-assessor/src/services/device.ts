/**
 * What this iPad calls itself.
 *
 * The iPads are shared, so a revision number on its own answers "is this copy
 * newer" but not "who made it newer". The name travels with every edit.
 *
 * Stored in localStorage, mirroring the phase-filter preference in
 * Assessment.tsx — same try/catch, same window guard, and synchronous, so
 * touchAssessment never has to await it on the tap path.
 *
 * KNOWN LIMIT: the app is served from two origins (http://100.91.180.116 and
 * https://cpted-server.tailb4c659.ts.net) and browser storage is per-origin, so
 * a device named on one URL is unnamed on the other. That is the same
 * constraint that already gives each origin its own IndexedDB, and nothing on
 * the client can fix it. The dialog mitigates it by offering the names already
 * seen on the server, so an assessor picks "iPad 3" off a list instead of
 * typing "ipad3" and inventing a phantom second device.
 */

const DEVICE_KEY = 'cpted-device-name';

/** Trim and collapse internal whitespace. Case is left alone — it is a label. */
export function normalizeDeviceName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

/** This device's name, or null when it has never been set (or was left blank). */
export function getDeviceName(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(DEVICE_KEY);
    if (!stored) return null;
    const name = normalizeDeviceName(stored);
    return name === '' ? null : name;
  } catch {
    return null;
  }
}

/** Set the name, or clear it when given something blank. */
export function setDeviceName(name: string): void {
  if (typeof window === 'undefined') return;
  const normalized = normalizeDeviceName(name);
  try {
    if (normalized === '') {
      window.localStorage.removeItem(DEVICE_KEY);
    } else {
      window.localStorage.setItem(DEVICE_KEY, normalized);
    }
  } catch {
    /* ignore — an unnamed device still records revisions correctly */
  }
}
