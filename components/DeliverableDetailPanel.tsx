"use client";

import { Calendar, User, Target, AlertCircle, CheckCircle2, Clock } from "lucide-react";

type Deliverable = {
  id: string;
  title: string;
  description: string;
  owner: string;
  deadline: string;
  status: "upcoming" | "in-progress" | "at-risk" | "completed";
  progress: number;
  dependencies?: string[];
};

type DeliverableDetailPanelProps = {
  deliverable: Deliverable;
  allDeliverables: Deliverable[];
  onEdit: (deliverable: Deliverable) => void;
};

export default function DeliverableDetailPanel({ deliverable, allDeliverables, onEdit }: DeliverableDetailPanelProps) {
  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntil = getDaysUntilDeadline(deliverable.deadline);

  const getStatusInfo = (status: Deliverable["status"]) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle2, colorClass: "success", label: "Completed" };
      case "in-progress":
        return { icon: Target, colorClass: "info", label: "In Progress" };
      case "at-risk":
        return { icon: AlertCircle, colorClass: "error", label: "At Risk" };
      case "upcoming":
        return { icon: Clock, colorClass: "muted", label: "Upcoming" };
    }
  };

  const statusInfo = getStatusInfo(deliverable.status);
  const StatusIcon = statusInfo.icon;

  const dependentDeliverables = deliverable.dependencies
    ? allDeliverables.filter((d) => deliverable.dependencies?.includes(d.id))
    : [];

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
              <button className="px-4 py-2 bg-[var(--color-primary)] rounded-lg text-sm text-white font-medium hover:bg-[var(--color-primary-hover)] transition-all shadow-[var(--shadow-sm)]">
                Update Progress
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <User className="w-4 h-4" />
              <span>Owner: <span className="text-[var(--color-text-primary)] font-medium">{deliverable.owner}</span></span>
            </div>
            <span className="text-[var(--color-text-muted)]">•</span>
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <Calendar className="w-4 h-4" />
              <span>{new Date(deliverable.deadline).toLocaleDateString()}</span>
              {deliverable.status !== "completed" && (
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
          <p className="text-[var(--color-text-secondary)] leading-relaxed">{deliverable.description}</p>
        </div>

        {/* Progress */}
        <div className="mb-8 p-6 card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Progress</h3>
            <span className="text-lg font-bold text-[var(--color-primary)]">{deliverable.progress}%</span>
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
              style={{ width: `${deliverable.progress}%` }}
            />
          </div>
        </div>

        {/* Dependencies */}
        {dependentDeliverables.length > 0 && (
          <div className="mb-8 p-6 card">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Dependencies ({dependentDeliverables.length})</h3>
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
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{dep.owner}</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-[var(--color-text-secondary)]">{dep.progress}%</div>
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
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Nov 20, 2024</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-1.5" />
              <div className="flex-1">
                <div className="text-sm text-[var(--color-text-primary)] font-medium">Last Updated</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 ${
                  deliverable.status === "completed" ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"
                }`}
              />
              <div className="flex-1">
                <div className="text-sm text-[var(--color-text-primary)] font-medium">Deadline</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{new Date(deliverable.deadline).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
