"use client";

import { useEffect } from "react";
import { useTimer } from "@/hooks/useTimer";
import { useTaskStore } from "@/store/useTaskStore";
import { usePictureInPicture } from "@/hooks/usePictureInPicture";
import { formatTime, formatTimeOfDay, formatDuration } from "@/lib/utils";
import { Play, Square, Pause, RotateCcw, PictureInPicture2, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface TimerDisplayProps {
  onStop: () => void;
}

export default function TimerDisplay({ onStop }: TimerDisplayProps) {
  const { elapsed, isRunning, isPaused, hasActiveSession, startTime } = useTimer();
  const startTimer = useTaskStore((state) => state.startTimer);
  const pauseTimer = useTaskStore((state) => state.pauseTimer);
  const resumeTimer = useTaskStore((state) => state.resumeTimer);
  const autoPaused = useTaskStore((state) => state.autoPaused);
  const idleAdjustedSeconds = useTaskStore((state) => state.idleAdjustedSeconds);
  const clearIdleNotification = useTaskStore((state) => state.clearIdleNotification);
  const { pipActive, togglePip, isSupported: pipSupported } = usePictureInPicture();

  useEffect(() => {
    if (!autoPaused) return;
    const timeout = setTimeout(() => clearIdleNotification(), 8000);
    return () => clearTimeout(timeout);
  }, [autoPaused, clearIdleNotification]);

  return (
    <Card glow={isRunning} className="text-center">
      {/* Status indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isRunning
              ? "bg-green-400 animate-pulse shadow-lg shadow-green-400/50"
              : isPaused
              ? "bg-amber-400 animate-pulse shadow-lg shadow-amber-400/50"
              : "bg-gray-600"
          }`}
        />
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {isRunning ? "In Flow" : isPaused ? "Paused" : "Ready"}
        </span>
      </div>

      {/* Idle adjustment banner */}
      {autoPaused && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center justify-center gap-2 animate-in">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            You were away — removed {formatDuration(idleAdjustedSeconds)} of
            idle time
          </span>
          <button
            onClick={clearIdleNotification}
            className="ml-2 text-amber-500/60 hover:text-amber-400 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Timer display */}
      <div className="mb-2">
        <span className="text-7xl md:text-8xl font-mono font-bold text-gray-100 tracking-tight tabular-nums">
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Started at time */}
      {hasActiveSession && startTime && (
        <p className="text-sm text-gray-500 mb-8">
          Started at {formatTimeOfDay(startTime)}
        </p>
      )}
      {!hasActiveSession && <div className="mb-8" />}

      {/* Control buttons */}
      <div className="flex justify-center gap-3">
        {!hasActiveSession ? (
          <Button size="lg" onClick={startTimer} className="min-w-[180px]">
            <Play className="w-5 h-5" />
            Start Focus
          </Button>
        ) : (
          <>
            {isRunning ? (
              <Button
                size="lg"
                variant="secondary"
                onClick={pauseTimer}
                className="min-w-[140px]"
              >
                <Pause className="w-5 h-5" />
                Pause
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={resumeTimer}
                className="min-w-[140px]"
              >
                <RotateCcw className="w-5 h-5" />
                Resume
              </Button>
            )}
            <Button
              size="lg"
              variant="danger"
              onClick={onStop}
              className="min-w-[140px]"
            >
              <Square className="w-5 h-5" />
              Stop & Log
            </Button>
          </>
        )}
      </div>

      {/* PiP toggle */}
      {pipSupported && hasActiveSession && (
        <div className="mt-4">
          <button
            onClick={togglePip}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
              pipActive
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
            }`}
          >
            <PictureInPicture2 className="w-3.5 h-3.5" />
            {pipActive ? "Close Mini Timer" : "Pop Out Mini Timer"}
          </button>
        </div>
      )}
    </Card>
  );
}
