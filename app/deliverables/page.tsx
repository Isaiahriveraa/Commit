"use client";

import { useState } from "react";
import { Plus, Target, Search, CheckCircle2, AlertCircle } from "lucide-react";
import AddDeliverableModal from "@/components/AddDeliverableModal";
import DeliverableDetailPanel from "@/components/DeliverableDetailPanel";

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

export default function Deliverables() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    {
      id: "1",
      title: "User Authentication System",
      description: "Implement OAuth2.0 with Google and GitHub providers",
      owner: "Sarah Chen",
      deadline: "2024-11-28",
      status: "in-progress",
      progress: 75,
    },
    {
      id: "2",
      title: "Database Schema Design",
      description: "Finalize PostgreSQL schema for all core features",
      owner: "Mike Ross",
      deadline: "2024-11-26",
      status: "at-risk",
      progress: 60,
    },
    {
      id: "3",
      title: "API Endpoints v1",
      description: "RESTful API for user management and projects",
      owner: "Emma Wilson",
      deadline: "2024-11-30",
      status: "upcoming",
      progress: 20,
      dependencies: ["1", "2"],
    },
    {
      id: "4",
      title: "Dashboard UI Mockups",
      description: "Figma designs for all main dashboard views",
      owner: "Alex Kim",
      deadline: "2024-11-24",
      status: "completed",
      progress: 100,
    },
    {
      id: "5",
      title: "Real-time Notifications",
      description: "WebSocket implementation for live updates",
      owner: "Jordan Lee",
      deadline: "2024-12-02",
      status: "upcoming",
      progress: 10,
    },
  ]);

  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(deliverables[0]?.id || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | Deliverable["status"]>("all");

  const handleAddDeliverable = (newDeliverable: {
    title: string;
    description: string;
    owner: string;
    deadline: string;
  }) => {
    if (editingDeliverable) {
      setDeliverables(deliverables.map(d =>
        d.id === editingDeliverable.id
          ? { ...d, ...newDeliverable }
          : d
      ));
      setEditingDeliverable(null);
    } else {
      const deliverable: Deliverable = {
        id: String(deliverables.length + 1),
        title: newDeliverable.title,
        description: newDeliverable.description,
        owner: newDeliverable.owner,
        deadline: newDeliverable.deadline,
        status: "upcoming",
        progress: 0,
      };
      setDeliverables([deliverable, ...deliverables]);
      setSelectedDeliverableId(deliverable.id);
    }
    setShowAddModal(false);
  };

  const handleEditClick = (deliverable: Deliverable) => {
    setEditingDeliverable(deliverable);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingDeliverable(null);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredDeliverables =
    filterStatus === "all" ? deliverables : deliverables.filter((d) => d.status === filterStatus);

  const selectedDeliverable = deliverables.find((d) => d.id === selectedDeliverableId);

  const getStatusIcon = (status: Deliverable["status"]) => {
    switch (status) {
      case "completed":
        return CheckCircle2;
      case "at-risk":
        return AlertCircle;
      default:
        return Target;
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Deliverable List */}
      <div className="w-80 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Deliverables</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all shadow-[var(--shadow-sm)]"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search deliverables..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("in-progress")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "in-progress"
                  ? "bg-[var(--color-info-light)] text-[var(--color-info)] border border-[var(--color-info)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilterStatus("at-risk")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "at-risk"
                  ? "bg-[var(--color-error-light)] text-[var(--color-error)] border border-[var(--color-error)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              At Risk
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "completed"
                  ? "bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Deliverable List */}
        <div className="flex-1 overflow-auto p-2">
          {filteredDeliverables
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .map((deliverable) => {
              const isSelected = selectedDeliverableId === deliverable.id;
              const StatusIcon = getStatusIcon(deliverable.status);
              const daysUntil = getDaysUntilDeadline(deliverable.deadline);

              return (
                <button
                  key={deliverable.id}
                  onClick={() => setSelectedDeliverableId(deliverable.id)}
                  className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${
                    isSelected
                      ? "bg-[var(--color-primary-light)] border border-[var(--color-primary)] shadow-[var(--shadow-md)]"
                      : "border border-transparent hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border)]"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        deliverable.status === "completed"
                          ? "bg-[var(--color-success-light)]"
                          : deliverable.status === "at-risk"
                          ? "bg-[var(--color-error-light)]"
                          : deliverable.status === "in-progress"
                          ? "bg-[var(--color-info-light)]"
                          : "bg-[var(--color-surface-alt)]"
                      }`}
                    >
                      <StatusIcon
                        className={`w-3.5 h-3.5 ${
                          deliverable.status === "completed"
                            ? "text-[var(--color-success)]"
                            : deliverable.status === "at-risk"
                            ? "text-[var(--color-error)]"
                            : deliverable.status === "in-progress"
                            ? "text-[var(--color-info)]"
                            : "text-[var(--color-text-muted)]"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight truncate">{deliverable.title}</h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{deliverable.owner}</p>
                    </div>
                  </div>
                  <div className="pl-8">
                    {deliverable.status !== "completed" && (
                      <div className="text-xs text-[var(--color-text-muted)] mb-1.5">
                        <span
                          className={
                            daysUntil < 0 ? "text-[var(--color-error)]" : daysUntil <= 3 ? "text-[var(--color-warning)]" : "text-[var(--color-text-muted)]"
                          }
                        >
                          {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d left`}
                        </span>
                      </div>
                    )}
                    <div className="relative h-1.5 bg-[var(--color-surface-alt)] rounded-full overflow-hidden mb-1.5">
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
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-text-muted)]">Progress</span>
                      <span
                        className={`font-medium ${
                          deliverable.status === "completed"
                            ? "text-[var(--color-success)]"
                            : deliverable.status === "at-risk"
                            ? "text-[var(--color-error)]"
                            : "text-[var(--color-primary)]"
                        }`}
                      >
                        {deliverable.progress}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Right Panel - Deliverable Detail */}
      <div className="flex-1 overflow-auto bg-[var(--color-bg)]">
        {selectedDeliverable ? (
          <DeliverableDetailPanel
            deliverable={selectedDeliverable}
            allDeliverables={deliverables}
            onEdit={handleEditClick}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-[var(--color-text-muted)]">Select a deliverable to view details</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AddDeliverableModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleAddDeliverable}
        initialData={editingDeliverable}
      />
    </div>
  );
}
