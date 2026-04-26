"use client";

import { useTimer } from "@/hooks/useTimer";
import { useTaskStore } from "@/store/useTaskStore";
import { formatTime, formatTimeOfDay } from "@/lib/utils";
import { Play, Square } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface TimerDisplayProps {
  onStop: () => void;
}

export default function TimerDisplay({ onStop }: TimerDisplayProps) {
  const { elapsed, isRunning, startTime } = useTimer();
  const startTimer = useTaskStore((state) => state.startTimer);

  return (
    <Card glow={isRunning} className="text-center">
      {/* Status indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isRunning
              ? "bg-green-400 animate-pulse shadow-lg shadow-green-400/50"
              : "bg-gray-600"
          }`}
        />
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {isRunning ? "In Flow" : "Ready"}
        </span>
      </div>

      {/* Timer display */}
      <div className="mb-2">
        <span className="text-7xl md:text-8xl font-mono font-bold text-gray-100 tracking-tight tabular-nums">
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Started at time */}
      {isRunning && startTime && (
        <p className="text-sm text-gray-500 mb-8">
          Started at {formatTimeOfDay(startTime)}
        </p>
      )}
      {!isRunning && <div className="mb-8" />}

      {/* Control buttons */}
      <div className="flex justify-center">
        {!isRunning ? (
          <Button size="lg" onClick={startTimer} className="min-w-[180px]">
            <Play className="w-5 h-5" />
            Start Focus
          </Button>
        ) : (
          <Button
            size="lg"
            variant="danger"
            onClick={onStop}
            className="min-w-[180px]"
          >
            <Square className="w-5 h-5" />
            Stop & Log
          </Button>
        )}
      </div>
    </Card>
  );
}
