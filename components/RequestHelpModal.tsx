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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Request Help</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">What do you need help with?</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Database migration errors"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about what you're stuck on and what you've tried..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-gray-900"
              rows={4}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">Urgency Level</label>
            <div className="flex gap-3">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                    urgency === level
                      ? level === "high"
                        ? "border-red-600 bg-red-50 text-red-900"
                        : level === "medium"
                        ? "border-yellow-600 bg-yellow-50 text-yellow-900"
                        : "border-green-600 bg-green-50 text-green-900"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
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
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Send Help Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
