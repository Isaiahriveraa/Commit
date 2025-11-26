"use client";

import { useState } from "react";
import { MessageSquare, Heart, ThumbsUp, Send, Paperclip, Image as ImageIcon, AlertCircle } from "lucide-react";
import PostUpdateModal from "@/components/PostUpdateModal";

type Update = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  attachments?: { type: "image" | "file"; name: string }[];
  linkedDeliverable?: string;
  reactions: { type: "like" | "heart"; count: number }[];
  comments: number;
  isHelpRequest?: boolean;
};

export default function Updates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updates, setUpdates] = useState<Update[]>([
    {
      id: "1",
      author: "Sarah Chen",
      avatar: "SC",
      content: "Just completed the OAuth integration! Google and GitHub sign-in are now working. Moving on to user profile management next.",
      timestamp: "2 hours ago",
      linkedDeliverable: "User Authentication System",
      reactions: [
        { type: "like", count: 8 },
        { type: "heart", count: 3 },
      ],
      comments: 4,
    },
    {
      id: "2",
      author: "Mike Ross",
      avatar: "MR",
      content: "Need some help with the database migrations. Getting a foreign key constraint error when trying to link users to projects. Anyone familiar with PostgreSQL constraints?",
      timestamp: "4 hours ago",
      linkedDeliverable: "Database Schema Design",
      isHelpRequest: true,
      reactions: [{ type: "like", count: 2 }],
      comments: 6,
    },
    {
      id: "3",
      author: "Emma Wilson",
      avatar: "EW",
      content: "Team standup notes: API endpoints are 20% complete. Blocked on database schema finalization. Targeting 50% completion by end of week.",
      timestamp: "Yesterday",
      linkedDeliverable: "API Endpoints v1",
      reactions: [{ type: "like", count: 5 }],
      comments: 2,
    },
    {
      id: "4",
      author: "Alex Kim",
      avatar: "AK",
      content: "Dashboard mockups are ready for review! Check out the Figma link. Would love feedback especially on the workload visualization components.",
      timestamp: "Yesterday",
      linkedDeliverable: "Dashboard UI Mockups",
      attachments: [{ type: "image", name: "dashboard-mockup.png" }],
      reactions: [
        { type: "like", count: 12 },
        { type: "heart", count: 7 },
      ],
      comments: 9,
    },
    {
      id: "5",
      author: "Jordan Lee",
      avatar: "JL",
      content: "Started research on WebSocket implementation. Evaluating Socket.io vs native WebSocket API. Will share findings in tomorrow's meeting.",
      timestamp: "2 days ago",
      linkedDeliverable: "Real-time Notifications",
      reactions: [{ type: "like", count: 6 }],
      comments: 3,
    },
  ]);

  const handlePostUpdate = (update: { content: string; linkedDeliverable?: string }) => {
    const newUpdate: Update = {
      id: String(updates.length + 1),
      author: "You",
      avatar: "YOU",
      content: update.content,
      timestamp: "Just now",
      linkedDeliverable: update.linkedDeliverable,
      reactions: [
        { type: "like", count: 0 },
        { type: "heart", count: 0 },
      ],
      comments: 0,
    };
    setUpdates([newUpdate, ...updates]);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#E4E6EB]">Status Updates</h1>
        <p className="text-[#9BA3AF] mt-2">Share progress and stay connected with your team</p>
      </div>

      {/* New Update Button */}
      <div className="bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938] p-6 mb-6 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
            YOU
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-left px-4 py-3 border border-[#242938] rounded-lg text-[#6B7280] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
          >
            Share an update with your team...
          </button>
        </div>
      </div>

      {/* Updates Feed */}
      <div className="space-y-4">
        {updates.map((update) => (
          <div
            key={update.id}
            className={`bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938] p-6 hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all ${update.isHelpRequest ? "border-l-4 border-l-red-500" : ""}`}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                {update.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#E4E6EB]">{update.author}</h3>
                  {update.isHelpRequest && (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-medium rounded-full flex items-center gap-1 border border-red-500/20">
                      <AlertCircle className="w-3 h-3" />
                      Help Requested
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6B7280]">{update.timestamp}</p>
                {update.linkedDeliverable && (
                  <p className="text-sm text-blue-400 mt-1">→ {update.linkedDeliverable}</p>
                )}
              </div>
            </div>

            {/* Content */}
            <p className="text-[#E4E6EB] mb-4">{update.content}</p>

            {/* Attachments */}
            {update.attachments && update.attachments.length > 0 && (
              <div className="mb-4">
                {update.attachments.map((attachment, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-[#9BA3AF] bg-[#1A1F2E] px-3 py-2 rounded-lg border border-[#242938]">
                    {attachment.type === "image" ? <ImageIcon className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                    <span>{attachment.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-[#242938]">
              <button className="flex items-center gap-2 text-[#9BA3AF] hover:text-blue-400 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {update.reactions.find((r) => r.type === "like")?.count || 0}
                </span>
              </button>
              <button className="flex items-center gap-2 text-[#9BA3AF] hover:text-red-400 transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {update.reactions.find((r) => r.type === "heart")?.count || 0}
                </span>
              </button>
              <button className="flex items-center gap-2 text-[#9BA3AF] hover:text-[#E4E6EB] transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">{update.comments} comments</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Post Update Modal */}
      <PostUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePostUpdate}
      />
    </div>
  );
}
