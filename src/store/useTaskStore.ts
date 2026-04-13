import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";

export interface TaskSession {
  id: string;
  startTime: number;
  endTime?: number;
  notes: string;
  duration: number;
  accumulatedTime: number;
  lastResumeTime: number;
  isPaused: boolean;
}

interface TaskState {
  activeSession: TaskSession | null;
  history: TaskSession[];
  autoPaused: boolean;
  idleAdjustedSeconds: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (notes: string) => void;
  deleteSession: (id: string) => void;
  clearHistory: () => void;
  setAutoPaused: (value: boolean) => void;
  adjustForIdle: (hiddenAt: number) => void;
  clearIdleNotification: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      history: [],
      autoPaused: false,
      idleAdjustedSeconds: 0,

      startTimer: () => {
        const now = Date.now();
        set({
          activeSession: {
            id: generateId(),
            startTime: now,
            notes: "",
            duration: 0,
            accumulatedTime: 0,
            lastResumeTime: now,
            isPaused: false,
          },
          autoPaused: false,
        });
      },

      pauseTimer: () => {
        const { activeSession } = get();
        if (!activeSession || activeSession.isPaused) return;

        const now = Date.now();
        const additionalSeconds = Math.floor(
          (now - activeSession.lastResumeTime) / 1000
        );

        set({
          activeSession: {
            ...activeSession,
            accumulatedTime: activeSession.accumulatedTime + additionalSeconds,
            isPaused: true,
          },
        });
      },

      resumeTimer: () => {
        const { activeSession } = get();
        if (!activeSession || !activeSession.isPaused) return;

        const now = Date.now();
        set({
          activeSession: {
            ...activeSession,
            lastResumeTime: now,
            isPaused: false,
          },
          autoPaused: false,
        });
      },

      stopTimer: (notes: string) => {
        const { activeSession } = get();
        if (!activeSession) return;

        const now = Date.now();
        let duration = activeSession.accumulatedTime;
        if (!activeSession.isPaused) {
          duration += Math.floor(
            (now - activeSession.lastResumeTime) / 1000
          );
        }

        const completedSession: TaskSession = {
          ...activeSession,
          endTime: now,
          notes,
          duration,
          isPaused: false,
        };

        set((state) => ({
          activeSession: null,
          autoPaused: false,
          history: [completedSession, ...state.history],
        }));
      },

      deleteSession: (id: string) => {
        set((state) => ({
          history: state.history.filter((s) => s.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      setAutoPaused: (value: boolean) => {
        set({ autoPaused: value });
      },

      adjustForIdle: (hiddenAt: number) => {
        const { activeSession } = get();
        if (!activeSession || activeSession.isPaused) return;

        const now = Date.now();
        const activeBeforeIdle = Math.floor(
          (hiddenAt - activeSession.lastResumeTime) / 1000
        );
        const idleSeconds = Math.floor((now - hiddenAt) / 1000);

        set({
          activeSession: {
            ...activeSession,
            accumulatedTime:
              activeSession.accumulatedTime + Math.max(0, activeBeforeIdle),
            lastResumeTime: now,
          },
          autoPaused: true,
          idleAdjustedSeconds: idleSeconds,
        });
      },

      clearIdleNotification: () => {
        set({ autoPaused: false, idleAdjustedSeconds: 0 });
      },
    }),
    {
      name: "flowstate-tracker-storage",
    }
  )
);
