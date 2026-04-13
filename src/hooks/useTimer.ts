"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";

export function useTimer() {
  const activeSession = useTaskStore((state) => state.activeSession);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeSession) {
      setElapsed(0);
      return;
    }

    if (activeSession.isPaused) {
      setElapsed(activeSession.accumulatedTime);
      return;
    }

    const calcElapsed = () =>
      activeSession.accumulatedTime +
      Math.floor((Date.now() - activeSession.lastResumeTime) / 1000);

    setElapsed(calcElapsed());

    const interval = setInterval(() => {
      setElapsed(calcElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, activeSession?.isPaused, activeSession?.accumulatedTime]);

  return {
    elapsed,
    isRunning: !!activeSession && !activeSession.isPaused,
    isPaused: !!activeSession?.isPaused,
    hasActiveSession: !!activeSession,
    startTime: activeSession?.startTime ?? null,
  };
}
