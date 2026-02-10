import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";

export interface TaskSession {
  id: string;
  startTime: number;
  endTime?: number;
  notes: string;
  duration: number; // in seconds
}

interface TaskState {
  activeSession: TaskSession | null;
  history: TaskSession[];
  startTimer: () => void;
  stopTimer: (notes: string) => void;
  deleteSession: (id: string) => void;
  clearHistory: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      history: [],

      startTimer: () => {
        const now = Date.now();
        set({
          activeSession: {
            id: generateId(),
            startTime: now,
            notes: "",
            duration: 0,
          },
        });
      },

      stopTimer: (notes: string) => {
        const { activeSession } = get();
        if (!activeSession) return;

        const now = Date.now();
        const duration = Math.floor((now - activeSession.startTime) / 1000);

        const completedSession: TaskSession = {
          ...activeSession,
          endTime: now,
          notes,
          duration,
        };

        set((state) => ({
          activeSession: null,
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
    }),
    {
      name: "flowstate-tracker-storage",
    }
  )
);
