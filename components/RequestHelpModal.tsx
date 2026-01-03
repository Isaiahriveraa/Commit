"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

type RequestHelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: { title: string; description: string; urgency: "low" | "medium" | "high" }) => void;
};

export default function RequestHelpModal({ isOpen, onClose, onSubmit }: RequestHelpModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      onSubmit({ title, description, urgency });
      setTitle("");
      setDescription("");
      setUrgency("medium");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-xl)] max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-[var(--color-error-light)]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-[var(--color-error)]" />
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Request Help</h2>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--color-surface)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">What do you need help with?</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Database migration errors"
              className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error-light)] outline-none transition-all"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about what you're stuck on and what you've tried..."
              className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error-light)] outline-none transition-all resize-none"
              rows={4}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Urgency Level</label>
            <div className="flex gap-3">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    urgency === level
                      ? level === "high"
                        ? "border-[var(--color-error)] bg-[var(--color-error-light)] text-[var(--color-error)]"
                        : level === "medium"
                        ? "border-[var(--color-warning)] bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                        : "border-[var(--color-success)] bg-[var(--color-success-light)] text-[var(--color-success)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <span className="font-medium capitalize">{level}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--color-error)] rounded-lg text-white font-medium hover:opacity-90 transition-all shadow-[var(--shadow-sm)]"
            >
              Send Help Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
