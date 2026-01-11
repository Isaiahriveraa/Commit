"use client";

import { useState, useMemo } from "react";
import { Calendar, User, Target, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { DeliverableWithDetails } from "@/hooks/useDeliverables";

/**
 * Format a date into a human-readable "time ago" string
 * E.g., "just now", "5 minutes ago", "2 hours ago", "3 days ago"
 */
function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;

  // Fall back to formatted date for older dates
  return date.toLocaleDateString();
}

type DeliverableDetailPanelProps = {
  deliverable: DeliverableWithDetails;
  allDeliverables: DeliverableWithDetails[];
  onEdit: (deliverable: DeliverableWithDetails) => void;
  onProgressUpdate: (id: string, progress: number) => Promise<void>;
  isUpdating?: boolean;
};

export default function DeliverableDetailPanel({
  deliverable,
  allDeliverables,
  onEdit,
  onProgressUpdate,
  isUpdating = false,
}: DeliverableDetailPanelProps) {
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState(deliverable.progress ?? 0);

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntil = getDaysUntilDeadline(deliverable.deadline);

  const getStatusInfo = (status: string | null) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle2, colorClass: "success", label: "Completed" };
      case "in-progress":
        return { icon: Target, colorClass: "info", label: "In Progress" };
      case "at-risk":
        return { icon: AlertCircle, colorClass: "error", label: "At Risk" };
      case "upcoming":
      default:
        return { icon: Clock, colorClass: "muted", label: "Upcoming" };
    }
  };

  const statusInfo = getStatusInfo(deliverable.status);
  const StatusIcon = statusInfo.icon;

  // Get dependent deliverables from IDs
  const dependentDeliverables = allDeliverables.filter((d) =>
    deliverable.dependencyIds.includes(d.id)
  );

  const handleProgressSubmit = async () => {
    await onProgressUpdate(deliverable.id, newProgress);
    setShowProgressModal(false);
  };

  // Compute "time ago" text from updated_at - useMemo avoids recalculating on every render
  // Note: This won't auto-update the "5 minutes ago" text as time passes (would need interval for that)
  const lastUpdatedText = useMemo(
    () => formatTimeAgo(deliverable.updated_at),
    [deliverable.updated_at]
  );

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{deliverable.title}</h1>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(deliverable)}
                className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setNewProgress(deliverable.progress ?? 0);
                  setShowProgressModal(true);
                }}
                disabled={isUpdating}
                className="px-4 py-2 bg-[var(--color-primary)] rounded-lg text-sm text-white font-medium hover:bg-[var(--color-primary-hover)] transition-all shadow-[var(--shadow-sm)] disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Progress
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <User className="w-4 h-4" />
              <span>
                Owner: <span className="text-[var(--color-text-primary)] font-medium">{deliverable.ownerName}</span>
              </span>
            </div>
            <span className="text-[var(--color-text-muted)]">•</span>
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <Calendar className="w-4 h-4" />
              <span>
                {deliverable.deadline
                  ? new Date(deliverable.deadline).toLocaleDateString()
                  : "No deadline"}
              </span>
              {deliverable.status !== "completed" && daysUntil !== null && (
                <span
                  className={`ml-1 font-medium ${
                    daysUntil < 0
                      ? "text-[var(--color-error)]"
                      : daysUntil <= 3
                      ? "text-[var(--color-warning)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  ({daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`})
                </span>
              )}
            </div>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1.5 ${
                statusInfo.colorClass === "success"
                  ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                  : statusInfo.colorClass === "info"
                  ? "bg-[var(--color-info-light)] text-[var(--color-info)]"
                  : statusInfo.colorClass === "error"
                  ? "bg-[var(--color-error-light)] text-[var(--color-error)]"
                  : "bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]"
              }`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 p-6 card">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Description</h3>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {deliverable.description || "No description provided."}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 p-6 card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Progress</h3>
            <span className="text-lg font-bold text-[var(--color-primary)]">{deliverable.progress ?? 0}%</span>
          </div>
          <div className="relative h-3 bg-[var(--color-surface-alt)] rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                deliverable.status === "completed"
                  ? "bg-[var(--color-success)]"
                  : deliverable.status === "at-risk"
                  ? "bg-[var(--color-error)]"
                  : "bg-[var(--color-primary)]"
              }`}
              style={{ width: `${deliverable.progress ?? 0}%` }}
            />
          </div>
        </div>

        {/* Dependencies */}
        {dependentDeliverables.length > 0 && (
          <div className="mb-8 p-6 card">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
              Dependencies ({dependentDeliverables.length})
            </h3>
            <div className="space-y-3">
              {dependentDeliverables.map((dep) => {
                const depStatusInfo = getStatusInfo(dep.status);
                const DepIcon = depStatusInfo.icon;

                return (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between p-3 bg-[var(--color-surface-alt)] rounded-lg border border-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          depStatusInfo.colorClass === "success"
                            ? "bg-[var(--color-success-light)]"
                            : depStatusInfo.colorClass === "info"
                            ? "bg-[var(--color-info-light)]"
                            : depStatusInfo.colorClass === "error"
                            ? "bg-[var(--color-error-light)]"
                            : "bg-[var(--color-surface-hover)]"
                        }`}
                      >
                        <DepIcon
                          className={`w-4 h-4 ${
                            depStatusInfo.colorClass === "success"
                              ? "text-[var(--color-success)]"
                              : depStatusInfo.colorClass === "info"
                              ? "text-[var(--color-info)]"
                              : depStatusInfo.colorClass === "error"
                              ? "text-[var(--color-error)]"
                              : "text-[var(--color-text-muted)]"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">{dep.title}</h4>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{dep.ownerName}</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-[var(--color-text-secondary)]">{dep.progress ?? 0}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="p-6 card">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--color-info)] mt-1.5" />
              <div className="flex-1">
                <div className="text-sm text-[var(--color-text-primary)] font-medium">Created</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {deliverable.created_at
                    ? new Date(deliverable.created_at).toLocaleDateString()
                    : "Unknown"}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-1.5" />
              <div className="flex-1">
                <div className="text-sm text-[var(--color-text-primary)] font-medium">Last Updated</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {lastUpdatedText}
                </div>
              </div>
            </div>
            {deliverable.deadline && (
              <div className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 ${
                    deliverable.status === "completed" ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm text-[var(--color-text-primary)] font-medium">Deadline</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {new Date(deliverable.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Update Modal */}
      {showProgressModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Only close if clicking backdrop, not modal content
            if (e.target === e.currentTarget) {
              if (newProgress !== deliverable.progress) {
                const confirmClose = window.confirm(
                  "You have unsaved changes to the progress. Do you want to discard them?"
                );
                if (!confirmClose) return;
              }
              setShowProgressModal(false);
            }
          }}
        >
          <div
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-xl)] max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Update Progress</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{deliverable.title}</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Progress
                  </label>
                  <span className="text-lg font-bold text-[var(--color-primary)]">{newProgress}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newProgress}
                  onChange={(e) => setNewProgress(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--color-surface-alt)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                />

                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Quick select buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[0, 25, 50, 75, 100].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNewProgress(value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      newProgress === value
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProgressSubmit}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-[var(--color-primary)] rounded-lg text-white font-medium hover:bg-[var(--color-primary-hover)] transition-all shadow-[var(--shadow-sm)] disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
