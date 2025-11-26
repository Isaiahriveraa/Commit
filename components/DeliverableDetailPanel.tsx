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
};

export default function DeliverableDetailPanel({ deliverable, allDeliverables }: DeliverableDetailPanelProps) {
  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntil = getDaysUntilDeadline(deliverable.deadline);

  const getStatusInfo = (status: Deliverable["status"]) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle2, color: "emerald", label: "Completed" };
      case "in-progress":
        return { icon: Target, color: "blue", label: "In Progress" };
      case "at-risk":
        return { icon: AlertCircle, color: "red", label: "At Risk" };
      case "upcoming":
        return { icon: Clock, color: "gray", label: "Upcoming" };
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
            <h1 className="text-3xl font-bold text-[#E4E6EB]">{deliverable.title}</h1>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#141824] border border-[#242938] rounded-lg text-sm text-[#9BA3AF] hover:border-blue-500/30 transition-all">
                Edit
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-sm text-white font-medium hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all">
                Update Progress
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-[#9BA3AF]">
              <User className="w-4 h-4" />
              <span>Owner: <span className="text-[#E4E6EB] font-medium">{deliverable.owner}</span></span>
            </div>
            <span className="text-[#6B7280]">•</span>
            <div className="flex items-center gap-1.5 text-[#9BA3AF]">
              <Calendar className="w-4 h-4" />
              <span>{new Date(deliverable.deadline).toLocaleDateString()}</span>
              {deliverable.status !== "completed" && (
                <span
                  className={`ml-1 ${
                    daysUntil < 0
                      ? "text-red-400 font-medium"
                      : daysUntil <= 3
                      ? "text-amber-400 font-medium"
                      : "text-[#9BA3AF]"
                  }`}
                >
                  ({daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`})
                </span>
              )}
            </div>
            <span className="text-[#6B7280]">•</span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1.5 ${
                statusInfo.color === "emerald"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : statusInfo.color === "blue"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : statusInfo.color === "red"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-[#6B7280]/10 text-[#6B7280] border border-[#6B7280]/20"
              }`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 p-6 bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938]">
          <h3 className="text-sm font-semibold text-[#E4E6EB] mb-3">Description</h3>
          <p className="text-[#9BA3AF] leading-relaxed">{deliverable.description}</p>
        </div>

        {/* Progress */}
        <div className="mb-8 p-6 bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#E4E6EB]">Progress</h3>
            <span className="text-lg font-bold text-blue-400">{deliverable.progress}%</span>
          </div>
          <div className="relative h-3 bg-[#1A1F2E] rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full ${
                deliverable.status === "completed"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  : deliverable.status === "at-risk"
                  ? "bg-gradient-to-r from-red-500 to-orange-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  : "bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              }`}
              style={{ width: `${deliverable.progress}%` }}
            />
          </div>
        </div>

        {/* Dependencies */}
        {dependentDeliverables.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938]">
            <h3 className="text-sm font-semibold text-[#E4E6EB] mb-4">Dependencies ({dependentDeliverables.length})</h3>
            <div className="space-y-3">
              {dependentDeliverables.map((dep) => {
                const depStatusInfo = getStatusInfo(dep.status);
                const DepIcon = depStatusInfo.icon;

                return (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between p-3 bg-[#1A1F2E] rounded-lg border border-[#242938]"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          depStatusInfo.color === "emerald"
                            ? "bg-emerald-500/10"
                            : depStatusInfo.color === "blue"
                            ? "bg-blue-500/10"
                            : depStatusInfo.color === "red"
                            ? "bg-red-500/10"
                            : "bg-[#6B7280]/10"
                        }`}
                      >
                        <DepIcon
                          className={`w-4 h-4 ${
                            depStatusInfo.color === "emerald"
                              ? "text-emerald-400"
                              : depStatusInfo.color === "blue"
                              ? "text-blue-400"
                              : depStatusInfo.color === "red"
                              ? "text-red-400"
                              : "text-[#6B7280]"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-[#E4E6EB]">{dep.title}</h4>
                        <p className="text-xs text-[#6B7280] mt-0.5">{dep.owner}</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-[#9BA3AF]">{dep.progress}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="p-6 bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938]">
          <h3 className="text-sm font-semibold text-[#E4E6EB] mb-4">Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
              <div className="flex-1">
                <div className="text-sm text-[#E4E6EB] font-medium">Created</div>
                <div className="text-xs text-[#6B7280] mt-0.5">Nov 20, 2024</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5" />
              <div className="flex-1">
                <div className="text-sm text-[#E4E6EB] font-medium">Last Updated</div>
                <div className="text-xs text-[#6B7280] mt-0.5">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 ${
                  deliverable.status === "completed" ? "bg-emerald-400" : "bg-[#6B7280]"
                }`}
              />
              <div className="flex-1">
                <div className="text-sm text-[#E4E6EB] font-medium">Deadline</div>
                <div className="text-xs text-[#6B7280] mt-0.5">{new Date(deliverable.deadline).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
