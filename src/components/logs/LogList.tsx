"use client";

import { useTaskStore } from "@/store/useTaskStore";
import {
  formatTime,
  formatTimeOfDay,
  formatDate,
  getStartOfDay,
} from "@/lib/utils";
import { Clock, Trash2, FileText, Download, Eraser } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function LogList() {
  const history = useTaskStore((state) => state.history);
  const deleteSession = useTaskStore((state) => state.deleteSession);
  const clearHistory = useTaskStore((state) => state.clearHistory);

  // Export data as JSON
  const handleExport = () => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowstate-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (history.length === 0) {
    return (
      <Card className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-1">
          No sessions yet
        </h3>
        <p className="text-sm text-gray-600">
          Start your first focus session to see your log here.
        </p>
      </Card>
    );
  }

  // Group sessions by day
  const grouped: Record<number, typeof history> = {};
  history.forEach((session) => {
    const dayKey = getStartOfDay(session.startTime);
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(session);
  });

  const dayKeys = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Session Log
          </h3>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Clear all session history?")) clearHistory();
            }}
          >
            <Eraser className="w-3.5 h-3.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* Sessions grouped by day */}
      <div className="space-y-6">
        {dayKeys.map((dayKey) => (
          <div key={dayKey}>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 pl-1">
              {formatDate(dayKey)}
            </h4>
            <div className="space-y-2">
              {grouped[dayKey].map((session) => (
                <Card
                  key={session.id}
                  className="!p-4 group hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 mb-1 truncate">
                        {session.notes || "No notes"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          {formatTimeOfDay(session.startTime)}
                          {session.endTime &&
                            ` — ${formatTimeOfDay(session.endTime)}`}
                        </span>
                        <span className="text-indigo-400 font-medium">
                          {formatTime(session.duration)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
