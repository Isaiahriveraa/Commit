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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0A0E1A]/95 backdrop-blur-xl rounded-2xl border border-[#242938] shadow-[0_8px_40px_rgba(0,0,0,0.6)] max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#242938] bg-gradient-to-r from-red-500/10 to-red-500/5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-[#E4E6EB]">Request Help</h2>
          </div>
          <button onClick={onClose} className="text-[#9BA3AF] hover:text-[#E4E6EB] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#E4E6EB] mb-2">What do you need help with?</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Database migration errors"
              className="w-full px-4 py-3 bg-[#141824] border border-[#242938] rounded-lg text-[#E4E6EB] placeholder-[#6B7280] focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)] outline-none transition-all"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#E4E6EB] mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about what you're stuck on and what you've tried..."
              className="w-full px-4 py-3 bg-[#141824] border border-[#242938] rounded-lg text-[#E4E6EB] placeholder-[#6B7280] focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)] outline-none transition-all resize-none"
              rows={4}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#E4E6EB] mb-2">Urgency Level</label>
            <div className="flex gap-3">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    urgency === level
                      ? level === "high"
                        ? "border-red-500 bg-red-500/10 text-red-400"
                        : level === "medium"
                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                        : "border-green-500 bg-green-500/10 text-green-400"
                      : "border-[#242938] bg-[#141824] text-[#9BA3AF] hover:bg-[#1A1F2E]"
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
              className="px-4 py-2 text-[#9BA3AF] bg-[#141824] border border-[#242938] rounded-lg hover:bg-[#1A1F2E] hover:text-[#E4E6EB] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-medium hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all"
            >
              Send Help Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
