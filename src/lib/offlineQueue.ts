/**
 * Offline-first data queue using IndexedDB.
 *
 * Queues actions (observations, visits, harvests, photos, etc.) when the
 * device is offline, then syncs them to Supabase when connectivity returns.
 *
 * Database: 'hortus-offline', Object store: 'actions'.
 * Retry logic: max 3 attempts per action.
 */

import { supabase } from "@/integrations/supabase/client";

export interface QueuedAction {
  id: string;
  type: "observation" | "visit" | "harvest" | "compost_entry" | "photo" | "voice_note";
  payload: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
  retryCount: number;
}

const DB_NAME = "hortus-offline";
const STORE_NAME = "actions";
const DB_VERSION = 1;
const MAX_RETRIES = 3;

/** Table mapping for each queued action type */
const TABLE_MAP: Record<QueuedAction["type"], string> = {
  observation: "observations",
  visit: "visit_logs",
  harvest: "harvest_logs",
  compost_entry: "compost_entries",
  photo: "photos",
  voice_note: "voice_notes",
};

// ---------------------------------------------------------------------------
// IndexedDB helpers
// ---------------------------------------------------------------------------

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("synced", "synced", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txStore(
  db: IDBDatabase,
  mode: IDBTransactionMode,
): IDBObjectStore {
  const tx = db.transaction(STORE_NAME, mode);
  return tx.objectStore(STORE_NAME);
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Generate a compact UUID-ish id */
function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${ts}-${rand}`;
}

/**
 * Enqueue an action for later sync.
 * Returns the generated action id.
 */
export async function queueAction(
  action: Omit<QueuedAction, "id" | "synced" | "retryCount">,
): Promise<string> {
  const id = generateId();
  const record: QueuedAction = {
    ...action,
    id,
    synced: false,
    retryCount: 0,
  };

  const db = await openDB();
  const store = txStore(db, "readwrite");
  await requestToPromise(store.put(record));
  db.close();

  return id;
}

/** Retrieve all actions that have not been synced yet. */
export async function getPendingActions(): Promise<QueuedAction[]> {
  const db = await openDB();
  const store = txStore(db, "readonly");
  const index = store.index("synced");
  const results = await requestToPromise(index.getAll(IDBValidRange(false)));
  db.close();
  return results as QueuedAction[];
}

/** Mark a single action as synced. */
export async function markSynced(id: string): Promise<void> {
  const db = await openDB();
  const store = txStore(db, "readwrite");
  const existing = await requestToPromise(store.get(id)) as QueuedAction | undefined;
  if (existing) {
    existing.synced = true;
    await requestToPromise(store.put(existing));
  }
  db.close();
}

/** Return the number of unsynced actions in the queue. */
export async function getPendingCount(): Promise<number> {
  const db = await openDB();
  const store = txStore(db, "readonly");
  const index = store.index("synced");
  const count = await requestToPromise(index.count(IDBValidRange(false)));
  db.close();
  return count;
}

/**
 * Attempt to sync every pending action to Supabase.
 * Returns counts of successfully synced and failed actions.
 */
export async function syncAll(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingActions();
  let synced = 0;
  let failed = 0;

  for (const action of pending) {
    if (action.retryCount >= MAX_RETRIES) {
      failed++;
      continue;
    }

    try {
      const table = TABLE_MAP[action.type];
      const { error } = await supabase.from(table).insert(action.payload);

      if (error) throw error;

      await markSynced(action.id);
      synced++;
    } catch {
      await incrementRetry(action.id);
      failed++;
    }
  }

  return { synced, failed };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Increment the retry count for a failed action. */
async function incrementRetry(id: string): Promise<void> {
  const db = await openDB();
  const store = txStore(db, "readwrite");
  const existing = await requestToPromise(store.get(id)) as QueuedAction | undefined;
  if (existing) {
    existing.retryCount += 1;
    await requestToPromise(store.put(existing));
  }
  db.close();
}

/**
 * Wrapper to create an IDBKeyRange for a boolean index.
 * IndexedDB stores booleans as 0/1 internally; we use IDBKeyRange.only
 * with the raw boolean which most browsers handle correctly.
 */
function IDBValidRange(value: boolean): IDBKeyRange {
  return IDBKeyRange.only(value ? 1 : 0);
}
