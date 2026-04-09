/**
 * useOfflineSync — React hook wrapping the offline action queue.
 *
 * Monitors navigator.onLine status, exposes pending count, and
 * auto-syncs queued actions when the device comes back online.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  queueAction,
  syncAll,
  getPendingCount,
} from "@/lib/offlineQueue";

interface UseOfflineSyncReturn {
  pendingCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<void>;
  queueObservation: (obs: Record<string, unknown>) => Promise<void>;
  queueVisit: (visit: Record<string, unknown>) => Promise<void>;
  queuePhoto: (photo: { uri: string; metadata: Record<string, unknown> }) => Promise<void>;
  isOnline: boolean;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);

  // -----------------------------------------------------------------------
  // Online / offline listeners
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // -----------------------------------------------------------------------
  // Refresh pending count
  // -----------------------------------------------------------------------
  const refreshCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    void refreshCount();
  }, [refreshCount]);

  // -----------------------------------------------------------------------
  // Sync
  // -----------------------------------------------------------------------
  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      await syncAll();
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
      await refreshCount();
    }
  }, [refreshCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      void syncNow();
    }
  }, [isOnline, pendingCount, syncNow]);

  // -----------------------------------------------------------------------
  // Queue helpers
  // -----------------------------------------------------------------------
  const queueObservation = useCallback(
    async (obs: Record<string, unknown>) => {
      await queueAction({
        type: "observation",
        payload: obs,
        createdAt: new Date().toISOString(),
      });
      await refreshCount();
    },
    [refreshCount],
  );

  const queueVisit = useCallback(
    async (visit: Record<string, unknown>) => {
      await queueAction({
        type: "visit",
        payload: visit,
        createdAt: new Date().toISOString(),
      });
      await refreshCount();
    },
    [refreshCount],
  );

  const queuePhoto = useCallback(
    async (photo: { uri: string; metadata: Record<string, unknown> }) => {
      await queueAction({
        type: "photo",
        payload: { uri: photo.uri, ...photo.metadata },
        createdAt: new Date().toISOString(),
      });
      await refreshCount();
    },
    [refreshCount],
  );

  return {
    pendingCount,
    isSyncing,
    syncNow,
    queueObservation,
    queueVisit,
    queuePhoto,
    isOnline,
  };
}
