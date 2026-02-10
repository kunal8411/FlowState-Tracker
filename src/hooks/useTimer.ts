"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";

/**
 * Custom hook that provides a real-time elapsed seconds counter
 * based on the active session's start time.
 */
export function useTimer() {
  const activeSession = useTaskStore((state) => state.activeSession);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeSession) {
      setElapsed(0);
      return;
    }

    // Calculate immediately on mount (handles tab return)
    const calcElapsed = () =>
      Math.floor((Date.now() - activeSession.startTime) / 1000);

    setElapsed(calcElapsed());

    const interval = setInterval(() => {
      setElapsed(calcElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  return {
    elapsed,
    isRunning: !!activeSession,
    startTime: activeSession?.startTime ?? null,
  };
}
