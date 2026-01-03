"use client";

import { useState } from "react";
import { X } from "lucide-react";

type PostUpdateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (update: { content: string; linkedDeliverable?: string }) => void;
};

export default function PostUpdateModal({ isOpen, onClose, onSubmit }: PostUpdateModalProps) {
  const [content, setContent] = useState("");
  const [linkedDeliverable, setLinkedDeliverable] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit({ content, linkedDeliverable: linkedDeliverable || undefined });
      setContent("");
      setLinkedDeliverable("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-xl)] max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Post Status Update</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--color-surface-alt)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Update Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your progress, blockers, or achievements with the team..."
              className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-all resize-none"
              rows={4}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Link to Deliverable (optional)
            </label>
            <input
              type="text"
              value={linkedDeliverable}
              onChange={(e) => setLinkedDeliverable(e.target.value)}
              placeholder="e.g., User Authentication System"
              className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-all"
            />
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
              className="px-4 py-2 bg-[var(--color-primary)] rounded-lg text-white font-medium hover:bg-[var(--color-primary-hover)] transition-all shadow-[var(--shadow-sm)]"
            >
              Post Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
