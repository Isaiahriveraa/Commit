"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

type AddDeliverableModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deliverable: { title: string; description: string; owner: string; deadline: string }) => void;
  initialData?: { title: string; description: string; owner: string; deadline: string } | null;
};

export default function AddDeliverableModal({ isOpen, onClose, onSubmit, initialData }: AddDeliverableModalProps) {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [deadline, setDeadline] = useState(getTodayDate());

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setOwner(initialData.owner);
      setDeadline(initialData.deadline);
    } else if (isOpen && !initialData) {
      setTitle("");
      setDescription("");
      setOwner("");
      setDeadline(getTodayDate());
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim() && owner.trim() && deadline) {
      onSubmit({ title, description, owner, deadline });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0A0E1A]/95 backdrop-blur-xl rounded-2xl border border-[#242938] shadow-[0_8px_40px_rgba(0,0,0,0.6)] max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#242938] bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <h2 className="text-2xl font-bold text-[#E4E6EB]">{initialData ? "Edit Deliverable" : "Add New Deliverable"}</h2>
          <button onClick={onClose} className="text-[#9BA3AF] hover:text-[#E4E6EB] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#E4E6EB] mb-2">Deliverable Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Payment Gateway Integration"
              className="w-full px-4 py-3 bg-[#141824] border border-[#242938] rounded-lg text-[#E4E6EB] placeholder-[#6B7280] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] outline-none transition-all"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#E4E6EB] mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the deliverable and its requirements..."
              className="w-full px-4 py-3 bg-[#141824] border border-[#242938] rounded-lg text-[#E4E6EB] placeholder-[#6B7280] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] outline-none transition-all resize-none"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#E4E6EB] mb-2">Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-3 bg-[#141824] border border-[#242938] rounded-lg text-[#E4E6EB] placeholder-[#6B7280] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] outline-none transition-all"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#E4E6EB] mb-2">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-[#141824] border border-[#242938] rounded-lg text-[#E4E6EB] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] outline-none transition-all"
              required
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
              Add Deliverable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
