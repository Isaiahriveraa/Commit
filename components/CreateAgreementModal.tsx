"use client";

import { useState } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";

type CreateAgreementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agreement: { title: string; description: string }) => void | Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
};

export default function CreateAgreementModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error = null,
}: CreateAgreementModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Client-side validation
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setLocalError("Title is required");
      return;
    }

    if (trimmedTitle.length > 200) {
      setLocalError("Title must be 200 characters or less");
      return;
    }

    if (!trimmedDescription) {
      setLocalError("Description is required");
      return;
    }

    if (trimmedDescription.length > 2000) {
      setLocalError("Description must be 2000 characters or less");
      return;
    }

    await onSubmit({ title: trimmedTitle, description: trimmedDescription });
  };

  const handleClose = () => {
    // Reset form state when closing
    setTitle("");
    setDescription("");
    setLocalError(null);
    onClose();
  };

  const displayError = error || localError;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-xl)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Create New Agreement
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--color-surface-alt)] disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {displayError && (
            <div className="mb-4 p-3 bg-[var(--color-error-light)] border border-[var(--color-error)] rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--color-error)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-error)]">{displayError}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Agreement Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Daily Standup Attendance"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-all disabled:opacity-50"
              maxLength={200}
              required
            />
            <div className="mt-1 text-xs text-[var(--color-text-muted)] text-right">
              {title.length}/200
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the expectations and rules for this agreement..."
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-all resize-none disabled:opacity-50"
              rows={4}
              maxLength={2000}
              required
            />
            <div className="mt-1 text-xs text-[var(--color-text-muted)] text-right">
              {description.length}/2000
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[var(--color-primary)] rounded-lg text-white font-medium hover:bg-[var(--color-primary-hover)] transition-all shadow-[var(--shadow-sm)] disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Agreement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
