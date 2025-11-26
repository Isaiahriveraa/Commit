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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0A0E1A]/95 backdrop-blur-xl rounded-2xl border border-[#242938] shadow-[0_8px_40px_rgba(0,0,0,0.6)] max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#242938] bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <h2 className="text-2xl font-bold text-[#E4E6EB]">Post Status Update</h2>
          <button onClick={onClose} className="text-[#9BA3AF] hover:text-[#E4E6EB] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#E4E6EB] mb-2">Update Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your progress, blockers, or achievements with the team..."
              className="w-full px-4 py-3 bg-[#141824] border border-[#242938] rounded-lg text-[#E4E6EB] placeholder-[#6B7280] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] outline-none transition-all resize-none"
              rows={4}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#E4E6EB] mb-2">
              Link to Deliverable (optional)
            </label>
            <input
              type="text"
              value={linkedDeliverable}
              onChange={(e) => setLinkedDeliverable(e.target.value)}
              placeholder="e.g., User Authentication System"
              className="w-full px-4 py-3 bg-[#141824] border border-[#242938] rounded-lg text-[#E4E6EB] placeholder-[#6B7280] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#9BA3AF] bg-[#141824] border border-[#242938] rounded-lg hover:bg-[#1A1F2E] hover:text-[#E4E6EB] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all"
            >
              Post Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
