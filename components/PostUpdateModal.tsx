"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Deliverable = {
  id: string;
  title: string;
};

type PostUpdateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (update: { content: string; deliverableId?: string; deliverableTitle?: string }) => void;
};

export default function PostUpdateModal({ isOpen, onClose, onSubmit }: PostUpdateModalProps) {
  const [content, setContent] = useState("");
  const [selectedDeliverableId, setSelectedDeliverableId] = useState("");
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoadingDeliverables, setIsLoadingDeliverables] = useState(false);

  // Fetch deliverables when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDeliverables();
    }
  }, [isOpen]);

  const fetchDeliverables = async () => {
    setIsLoadingDeliverables(true);
    const { data, error } = await supabase
      .from("deliverables")
      .select("id, title")
      .order("title");

    if (!error && data) {
      setDeliverables(data);
    }
    setIsLoadingDeliverables(false);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      const selectedDeliverable = deliverables.find(d => d.id === selectedDeliverableId);
      onSubmit({
        content,
        deliverableId: selectedDeliverableId || undefined,
        deliverableTitle: selectedDeliverable?.title,
      });
      setContent("");
      setSelectedDeliverableId("");
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
            <div className="relative">
              <select
                value={selectedDeliverableId}
                onChange={(e) => setSelectedDeliverableId(e.target.value)}
                disabled={isLoadingDeliverables}
                className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">Select a deliverable...</option>
                {deliverables.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
            </div>
            {isLoadingDeliverables && (
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Loading deliverables...</p>
            )}
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
