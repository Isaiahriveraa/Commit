"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Heart, ThumbsUp, AlertCircle, Loader2 } from "lucide-react";
import PostUpdateModal from "@/components/PostUpdateModal";
import { supabase } from "@/lib/supabase";

type UpdateWithDetails = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  linkedDeliverable?: string;
  reactions: { type: "like" | "heart"; count: number }[];
  comments: number;
  isHelpRequest?: boolean;
};

// Helper to get initials from name
function getInitials(name: string): string {
  const names = name.split(" ");
  const first = names[0]?.charAt(0).toUpperCase() || "?";
  const last = names[names.length - 1]?.charAt(0).toUpperCase() || "";
  if (names.length === 1) return first;
  return `${first}${last}`;
}

// Helper to format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default function Updates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updates, setUpdates] = useState<UpdateWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Fetch updates from Supabase on mount
  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    setIsLoading(true);

    // Fetch updates with author and deliverable info
    const { data: updatesData, error: updatesError } = await supabase
      .from("updates")
      .select(`
        id,
        content,
        created_at,
        is_help_request,
        deliverable_id,
        author_id,
        team_members!updates_author_id_fkey(name),
        deliverables!updates_deliverable_id_fkey(title)
      `)
      .order("created_at", { ascending: false });

    if (updatesError) {
      console.error("Error fetching updates:", updatesError);
      setIsLoading(false);
      return;
    }

    // Transform data for display
    const transformedUpdates: UpdateWithDetails[] = (updatesData || []).map((u: any) => ({
      id: u.id,
      author: u.team_members?.name || "Unknown",
      avatar: getInitials(u.team_members?.name || "?"),
      content: u.content,
      timestamp: formatRelativeTime(u.created_at),
      linkedDeliverable: u.deliverables?.title,
      isHelpRequest: u.is_help_request,
      reactions: [
        { type: "like" as const, count: 0 },
        { type: "heart" as const, count: 0 },
      ],
      comments: 0,
    }));

    setUpdates(transformedUpdates);
    setIsLoading(false);
  };

  const handlePostUpdate = async (update: { content: string; deliverableId?: string; deliverableTitle?: string }) => {
    setIsPosting(true);

    // Get the first team member as author (in a real app, this would be the logged-in user)
    const { data: members } = await supabase.from("team_members").select("id").limit(1);
    const authorId = members?.[0]?.id || null;

    // Insert the update into Supabase
    const { error } = await supabase.from("updates").insert({
      content: update.content,
      deliverable_id: update.deliverableId || null,
      author_id: authorId,
      is_help_request: false,
    });

    if (error) {
      console.error("Error posting update:", error);
      setIsPosting(false);
      return;
    }

    // Refresh the updates list
    await fetchUpdates();
    setIsPosting(false);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Status Updates</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Share progress and stay connected with your team</p>
      </div>

      {/* New Update Button */}
      <div className="card p-6 mb-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
            YOU
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-left px-4 py-3 border border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-all"
          >
            Share an update with your team...
          </button>
        </div>
      </div>

      {/* Updates Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : updates.length === 0 ? (
          <div className="card p-12 text-center">
            <MessageSquare className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No updates yet</h3>
            <p className="text-[var(--color-text-muted)]">Be the first to share an update with your team!</p>
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className={`card p-6 ${update.isHelpRequest ? "border-l-4 border-l-[var(--color-error)]" : ""}`}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  {update.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">{update.author}</h3>
                    {update.isHelpRequest && (
                      <span className="px-2 py-0.5 bg-[var(--color-error-light)] text-[var(--color-error)] text-xs font-medium rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Help Requested
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">{update.timestamp}</p>
                  {update.linkedDeliverable && (
                    <p className="text-sm text-[var(--color-primary)] mt-1 font-medium">→ {update.linkedDeliverable}</p>
                  )}
                </div>
              </div>

              {/* Content */}
              <p className="text-[var(--color-text-primary)] mb-4 leading-relaxed">{update.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-[var(--color-border)]">
                <button className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-info)] transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {update.reactions.find((r) => r.type === "like")?.count || 0}
                  </span>
                </button>
                <button className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {update.reactions.find((r) => r.type === "heart")?.count || 0}
                  </span>
                </button>
              <button className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">{update.comments} comments</span>
              </button>
            </div>
          </div>
          ))
        )}
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
