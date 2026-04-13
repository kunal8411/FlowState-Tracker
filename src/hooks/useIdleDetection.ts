"use client";

import { useEffect, useRef } from "react";
import { useTaskStore } from "@/store/useTaskStore";

const IDLE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Detects prolonged absence (screen off / system sleep) by measuring how long
 * the page was hidden.  Short tab switches are ignored — the timer keeps running.
 * Only when the page was hidden longer than IDLE_THRESHOLD_MS do we retroactively
 * subtract the idle period so it doesn't count toward the session.
 */
export function useIdleDetection() {
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        return;
      }

      if (!hiddenAtRef.current) return;

      const awayMs = Date.now() - hiddenAtRef.current;
      const store = useTaskStore.getState();

      if (
        store.activeSession &&
        !store.activeSession.isPaused &&
        awayMs >= IDLE_THRESHOLD_MS
      ) {
        store.adjustForIdle(hiddenAtRef.current);
      }

      hiddenAtRef.current = null;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
}
