"use client";

import { useState } from "react";
import { useHydration } from "@/hooks/useHydration";
import { useIdleDetection } from "@/hooks/useIdleDetection";
import TimerDisplay from "@/components/timer/TimerDisplay";
import StopModal from "@/components/timer/StopModal";
import DailySummary from "@/components/logs/DailySummary";
import LogList from "@/components/logs/LogList";
import { Timer, Zap } from "lucide-react";

export default function Home() {
  const hydrated = useHydration();
  const [showStopModal, setShowStopModal] = useState(false);

  useIdleDetection();

  // Avoid hydration mismatch — show a loading skeleton until client hydrates
  if (!hydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading FlowState...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10">
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <h1 className="text-lg font-bold text-gray-100 tracking-tight">
              FlowState
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Timer className="w-3.5 h-3.5" />
            <span>Focus Tracker</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Timer section */}
        <section>
          <TimerDisplay onStop={() => setShowStopModal(true)} />
        </section>

        {/* Daily summary */}
        <section>
          <DailySummary />
        </section>

        {/* Session log */}
        <section>
          <LogList />
        </section>
      </div>

      {/* Stop modal */}
      <StopModal
        isOpen={showStopModal}
        onClose={() => setShowStopModal(false)}
      />
    </main>
  );
}
