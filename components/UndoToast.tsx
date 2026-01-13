"use client";

import { Undo2, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface UndoToastProps {
  id: string; // Unique ID for this toast (for multi-toast support)
  message: string;
  duration?: number; // in milliseconds
  index?: number; // Position in stack (0 = top)
  onUndo: (id: string) => void;
  onDismiss: (id: string) => void;
  onTimeout: (id: string) => void;
}

/**
 * UndoToast Component
 *
 * Displays a toast notification with an undo action.
 * Auto-dismisses after duration and triggers onTimeout.
 * Shows a progress bar indicating remaining time.
 */
export default function UndoToast({
  id,
  message,
  duration = 5000,
  index = 0,
  onUndo,
  onDismiss,
  onTimeout,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100);

  // Use refs for callbacks to prevent timer resets on parent re-renders
  // This is the bulletproof pattern for independent timers
  const onTimeoutRef = useRef(onTimeout);
  const idRef = useRef(id);

  // Keep refs updated with latest values (but don't trigger effect re-run)
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Timer effect - only depends on duration, runs once per toast instance
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // Use ref to get latest callback without causing re-runs
        onTimeoutRef.current(idRef.current);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]); // Only duration - timer starts once and never resets

  // Calculate vertical offset for stacking (each toast is ~60px tall + 8px gap)
  const topOffset = 80 + index * 68; // 80px base (top-20) + stacking offset

  return (
    <div
      className="fixed right-6 z-50 animate-slide-down"
      style={{ top: `${topOffset}px` }}
    >
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden min-w-[320px]">
        {/* Content */}
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-sm text-[var(--color-text-primary)] flex-1 truncate max-w-[180px]">
            {message}
          </span>
          <button
            onClick={() => onUndo(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
          <button
            onClick={() => onDismiss(id)}
            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[var(--color-surface-alt)]">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
