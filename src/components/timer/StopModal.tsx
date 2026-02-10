"use client";

import { useState, useEffect, useRef } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { useTimer } from "@/hooks/useTimer";
import { formatTime } from "@/lib/utils";
import { MessageSquare, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface StopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StopModal({ isOpen, onClose }: StopModalProps) {
  const [notes, setNotes] = useState("");
  const stopTimer = useTaskStore((state) => state.stopTimer);
  const { elapsed } = useTimer();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNotes("");
      // Auto-focus the input after a brief delay
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopTimer(notes.trim() || "No notes added");
    setNotes("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl animate-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-100">Log Session</h2>
            <p className="text-sm text-gray-500">
              Session duration: {formatTime(elapsed)}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            What did you accomplish?
          </label>
          <Input
            ref={inputRef}
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Finished the header component..."
            autoComplete="off"
          />

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save & Stop
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
