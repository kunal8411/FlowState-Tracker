"use client";

import { useTaskStore, TaskSession } from "@/store/useTaskStore";
import { formatDate, formatDuration, getStartOfDay } from "@/lib/utils";
import { Clock, Calendar } from "lucide-react";
import Card from "@/components/ui/Card";

interface DayGroup {
  date: string;
  dateKey: number;
  sessions: TaskSession[];
  totalDuration: number;
}

function groupByDay(sessions: TaskSession[]): DayGroup[] {
  const groups: Record<number, TaskSession[]> = {};

  sessions.forEach((session) => {
    const dayKey = getStartOfDay(session.startTime);
    if (!groups[dayKey]) {
      groups[dayKey] = [];
    }
    groups[dayKey].push(session);
  });

  return Object.entries(groups)
    .map(([key, sessions]) => {
      const dateKey = Number(key);
      return {
        date: formatDate(dateKey),
        dateKey,
        sessions,
        totalDuration: sessions.reduce((sum, s) => sum + s.duration, 0),
      };
    })
    .sort((a, b) => b.dateKey - a.dateKey);
}

export default function DailySummary() {
  const history = useTaskStore((state) => state.history);

  if (history.length === 0) return null;

  const dayGroups = groupByDay(history);

  // Calculate overall stats
  const totalTime = history.reduce((sum, s) => sum + s.duration, 0);
  const totalSessions = history.length;

  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Summary
        </h3>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Total Time
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-100">
            {formatDuration(totalTime)}
          </p>
        </div>
        <div className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Sessions
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-100">{totalSessions}</p>
        </div>
      </div>

      {/* Day-by-day breakdown */}
      <div className="space-y-2">
        {dayGroups.map((group) => (
          <div
            key={group.dateKey}
            className="flex items-center justify-between rounded-lg bg-gray-800/30 px-4 py-3"
          >
            <span className="text-sm text-gray-300">{group.date}</span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">
                {group.sessions.length} session{group.sessions.length !== 1 ? "s" : ""}
              </span>
              <span className="text-sm font-medium text-indigo-400">
                {formatDuration(group.totalDuration)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
