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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Post Status Update</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">Update Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your progress, blockers, or achievements with the team..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900"
              rows={4}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Link to Deliverable (optional)
            </label>
            <input
              type="text"
              value={linkedDeliverable}
              onChange={(e) => setLinkedDeliverable(e.target.value)}
              placeholder="e.g., User Authentication System"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
