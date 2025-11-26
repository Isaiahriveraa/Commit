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
        <h1 className="text-3xl font-bold text-gray-900">Status Updates</h1>
        <p className="text-gray-600 mt-2">Share progress and stay connected with your team</p>
      </div>

      {/* New Update Button */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
            YOU
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-left px-4 py-3 border border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:bg-blue-50 transition-colors"
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
            className={`bg-white rounded-lg shadow p-6 ${update.isHelpRequest ? "border-l-4 border-red-500" : ""}`}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium flex-shrink-0">
                {update.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{update.author}</h3>
                  {update.isHelpRequest && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Help Requested
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{update.timestamp}</p>
                {update.linkedDeliverable && (
                  <p className="text-sm text-blue-600 mt-1">→ {update.linkedDeliverable}</p>
                )}
              </div>
            </div>

            {/* Content */}
            <p className="text-gray-900 mb-4">{update.content}</p>

            {/* Attachments */}
            {update.attachments && update.attachments.length > 0 && (
              <div className="mb-4">
                {update.attachments.map((attachment, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    {attachment.type === "image" ? <ImageIcon className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                    <span>{attachment.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {update.reactions.find((r) => r.type === "like")?.count || 0}
                </span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {update.reactions.find((r) => r.type === "heart")?.count || 0}
                </span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
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
