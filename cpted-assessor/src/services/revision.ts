/**
 * Which copy of an assessment is newest — this iPad's, or the server's.
 *
 * The iPads are shared and sync is unconditional last-write-wins in both
 * directions: a push overwrites the server row wholesale, a pull overwrites the
 * local row wholesale. Nothing warned anybody, so a stale device could silently
 * clobber a colleague's afternoon.
 *
 * Timestamps could not answer the question. `updated_at` is bumped by *syncing*
 * (transport, not editing), the server overwrites it with its own clock on every
 * push, and — until the same release as this file — score taps, item notes, and
 * photos did not bump it at all. So an assessor could walk an entire site
 * without the timestamp moving. A counter wired into the edit paths is the
 * honest answer.
 *
 * This module is deliberately import-free — no database, no localStorage, no
 * React — so the comparison can be exercised on its own. The persistence side
 * lives in touch.ts, mirroring how scoring.ts keeps its pure calculators apart
 * from its writers.
 */

export type SyncState =
  /** Both copies describe the same data. */
  | 'in-sync'
  /** This iPad has edits the server has not seen. Safe to push. */
  | 'local-ahead'
  /** Someone else edited; this iPad has nothing unsent. Safe to pull. */
  | 'server-ahead'
  /** Both changed since the common ancestor. Either direction loses work. */
  | 'diverged'
  /** On the server, not on this iPad. */
  | 'server-only'
  /** On this iPad, never reached the server. */
  | 'local-only';

export interface LocalRevision {
  revision?: number | null;
  synced_revision?: number | null;
}

export interface RemoteRevision {
  revision?: number | null;
  last_edited_by?: string | null;
  last_edited_at?: string | null;
}

/**
 * Compare this device's copy against the server's.
 *
 * Presence is the caller's to decide — pass null for a side that does not
 * exist. Callers that simply have not fetched the server list yet must not call
 * this at all: "we haven't asked" is not the same as "it isn't there", and
 * rendering `local-only` on every card the moment an iPad drops off Wi-Fi would
 * be a lie.
 */
export function compareRevisions(
  local: LocalRevision | null | undefined,
  server: RemoteRevision | null | undefined,
): SyncState {
  if (!local && !server) return 'in-sync';
  if (!local) return 'server-only';
  if (!server) return 'local-only';

  // Records written before this feature existed read undefined. Revision 1 is
  // the floor, matching what the client backfill and the server's column
  // default both stamp, so an untouched back catalogue reads as in sync rather
  // than as a fleet-wide conflict.
  const l = local.revision ?? 1;
  const s = server.revision ?? 1;
  const base = local.synced_revision ?? null;

  // No recorded common ancestor: this device has never completed a sync of this
  // assessment, yet the server holds a copy. There is nothing to diff against,
  // so any difference at all is treated as a conflict rather than guessed at in
  // either direction.
  if (base === null) return l === s ? 'in-sync' : 'diverged';

  // !== rather than > on both sides. The local counter is monotonic and under
  // our control, so the two are equivalent there — but the server's is not. A
  // restore from backup can move it backwards, and a server that has gone
  // backwards is still a server that no longer matches the ancestor.
  const localChanged = l !== base;
  const serverChanged = s !== base;

  if (localChanged && serverChanged) return 'diverged';
  if (localChanged) return 'local-ahead';
  if (serverChanged) return 'server-ahead';
  return 'in-sync';
}

// --- Display helpers -------------------------------------------------------
//
// Return Tailwind class strings, following getScoreColor/getScoreBgColor in
// scoring.ts, so the home card and the server card cannot drift apart.

export interface SyncStateBadge {
  label: string;
  /** Pill classes, matching the geometry of statusBadge() in Home.tsx. */
  classes: string;
  /** Short explanation for the card's secondary line. */
  hint: string;
}

export function getSyncStateBadge(state: SyncState): SyncStateBadge | null {
  switch (state) {
    case 'in-sync':
      return {
        label: 'Matches server',
        classes: 'bg-blue-100 text-blue-700',
        hint: 'Both copies are the same.',
      };
    case 'local-ahead':
      return {
        label: 'Newer here',
        classes: 'bg-amber-100 text-amber-700',
        hint: 'This iPad has changes the server has not seen.',
      };
    case 'server-ahead':
      return {
        label: 'Newer on server',
        classes: 'bg-blue-100 text-blue-700',
        hint: 'Someone else edited this after you last synced.',
      };
    case 'diverged':
      return {
        label: 'Conflict',
        classes: 'bg-red-100 text-red-700',
        hint: 'This iPad and the server have both changed.',
      };
    case 'local-only':
      return {
        label: 'Not synced',
        classes: 'bg-ink/5 text-ink/50',
        hint: 'This assessment has never reached the server.',
      };
    case 'server-only':
      return null;
  }
}

/** "v7", or null when the record predates revision tracking. */
export function revisionLabel(r: LocalRevision | RemoteRevision | null | undefined): string | null {
  if (!r || r.revision == null) return null;
  return `v${r.revision}`;
}

/**
 * "iPad 3", "iPad 3 · Aug 19", or null when nothing is known.
 *
 * An unnamed device is reported as such rather than silently omitted — the
 * revision numbers still work, and "unnamed iPad" is a prompt to go and name it.
 */
export function editedByLabel(
  by: string | null | undefined,
  at: string | null | undefined,
  formatDate: (iso: string) => string,
): string | null {
  const who = by && by.trim() ? by.trim() : at ? 'unnamed iPad' : null;
  if (!who) return null;
  return at ? `${who} · ${formatDate(at)}` : who;
}
