"use client";

import { useState } from "react";
import { Plus, Target, Search, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";
import AddDeliverableModal from "@/components/AddDeliverableModal";
import DeliverableDetailPanel from "@/components/DeliverableDetailPanel";
import { useDeliverables, type DeliverableWithDetails, type DeliverableStatus } from "@/hooks/useDeliverables";

type FilterStatus = "all" | DeliverableStatus;

export default function Deliverables() {
  const {
    deliverables,
    teamMembers,
    isLoading,
    isCreating,
    isUpdating,
    error,
    createDeliverable,
    updateDeliverable,
    updateProgress,
    refresh,
  } = useDeliverables();

  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<DeliverableWithDetails | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  // Derive effective selected ID - default to first if none selected
  const effectiveSelectedId = selectedDeliverableId ?? (deliverables.length > 0 ? deliverables[0].id : null);

  const handleAddDeliverable = async (newDeliverable: {
    title: string;
    description: string;
    owner_id: string | null;
    deadline: string;
    dependencyIds?: string[];
  }) => {
    setCreateError(null);

    if (editingDeliverable) {
      // Update existing deliverable
      const result = await updateDeliverable(editingDeliverable.id, {
        title: newDeliverable.title,
        description: newDeliverable.description,
        owner_id: newDeliverable.owner_id,
        deadline: newDeliverable.deadline,
      });

      if (result.success) {
        setShowAddModal(false);
        setEditingDeliverable(null);
      } else {
        setCreateError(result.error || "Failed to update deliverable");
      }
    } else {
      // Create new deliverable
      const result = await createDeliverable({
        title: newDeliverable.title,
        description: newDeliverable.description,
        owner_id: newDeliverable.owner_id,
        deadline: newDeliverable.deadline,
        dependencyIds: newDeliverable.dependencyIds,
      });

      if (result.success && result.id) {
        setShowAddModal(false);
        setSelectedDeliverableId(result.id);
      } else {
        setCreateError(result.error || "Failed to create deliverable");
      }
    }
  };

  const handleEditClick = (deliverable: DeliverableWithDetails) => {
    setEditingDeliverable(deliverable);
    setCreateError(null); // Clear any stale errors from previous operations
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingDeliverable(null);
    setCreateError(null);
  };

  const handleProgressUpdate = async (id: string, progress: number) => {
    await updateProgress(id, progress);
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Filter deliverables by status and search query
  const filteredDeliverables = deliverables.filter((d) => {
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedDeliverable = deliverables.find((d) => d.id === effectiveSelectedId);

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return CheckCircle2;
      case "at-risk":
        return AlertCircle;
      case "in-progress":
        return Target;
      default:
        return Clock;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full">
        {/* Left Panel Skeleton */}
        <div className="w-80 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col">
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-28 bg-[var(--color-surface-alt)] rounded animate-pulse" />
              <div className="h-8 w-8 bg-[var(--color-surface-alt)] rounded-lg animate-pulse" />
            </div>
            <div className="h-10 bg-[var(--color-surface-alt)] rounded-lg animate-pulse mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-[var(--color-surface-alt)] rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-2 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-transparent">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-7 h-7 bg-[var(--color-surface-alt)] rounded-lg animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-[var(--color-surface-alt)] rounded animate-pulse mb-1" />
                    <div className="h-3 w-20 bg-[var(--color-surface-alt)] rounded animate-pulse" />
                  </div>
                </div>
                <div className="pl-8">
                  <div className="h-1.5 bg-[var(--color-surface-alt)] rounded-full animate-pulse mb-1.5" />
                  <div className="h-3 w-16 bg-[var(--color-surface-alt)] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right Panel Skeleton */}
        <div className="flex-1 flex items-center justify-center bg-[var(--color-bg)]">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-[var(--color-error)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Failed to load deliverables
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
          <button
            onClick={() => refresh()}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            <label htmlFor="deliverable-search" className="sr-only">
              Search deliverables
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              id="deliverable-search"
              type="text"
              placeholder="Search deliverables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              All ({deliverables.length})
            </button>
            <button
              onClick={() => setFilterStatus("in-progress")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "in-progress"
                  ? "bg-[var(--color-info-light)] text-[var(--color-info)] border border-[var(--color-info)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              In Progress ({deliverables.filter((d) => d.status === "in-progress").length})
            </button>
            <button
              onClick={() => setFilterStatus("at-risk")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "at-risk"
                  ? "bg-[var(--color-error-light)] text-[var(--color-error)] border border-[var(--color-error)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              At Risk ({deliverables.filter((d) => d.status === "at-risk").length})
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "completed"
                  ? "bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              Completed ({deliverables.filter((d) => d.status === "completed").length})
            </button>
          </div>
        </div>

        {/* Deliverable List */}
        <div className="flex-1 overflow-auto p-2">
          {filteredDeliverables.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Target className="w-8 h-8 text-[var(--color-text-muted)] mb-2" />
              <p className="text-sm text-[var(--color-text-muted)]">
                {searchQuery ? "No deliverables found" : "No deliverables yet"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 text-sm text-[var(--color-primary)] hover:underline"
                >
                  Create your first deliverable
                </button>
              )}
            </div>
          ) : (
            filteredDeliverables
              .sort((a, b) => {
                // Sort by deadline, nulls last
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
              })
              .map((deliverable) => {
                const isSelected = effectiveSelectedId === deliverable.id;
                const StatusIcon = getStatusIcon(deliverable.status);
                const daysUntil = getDaysUntilDeadline(deliverable.deadline);

                return (
                  <button
                    key={deliverable.id}
                    onClick={() => setSelectedDeliverableId(deliverable.id)}
                    aria-label={`View deliverable: ${deliverable.title}, ${deliverable.progress}% complete`}
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
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight truncate">
                          {deliverable.title}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{deliverable.ownerName}</p>
                      </div>
                    </div>
                    <div className="pl-8">
                      {deliverable.status !== "completed" && daysUntil !== null && (
                        <div className="text-xs text-[var(--color-text-muted)] mb-1.5">
                          <span
                            className={
                              daysUntil < 0
                                ? "text-[var(--color-error)]"
                                : daysUntil <= 3
                                ? "text-[var(--color-warning)]"
                                : "text-[var(--color-text-muted)]"
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
                          style={{ width: `${deliverable.progress ?? 0}%` }}
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
                          {deliverable.progress ?? 0}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
          )}
        </div>
      </div>

      {/* Right Panel - Deliverable Detail */}
      <div className="flex-1 overflow-auto bg-[var(--color-bg)]">
        {selectedDeliverable ? (
          <DeliverableDetailPanel
            deliverable={selectedDeliverable}
            allDeliverables={deliverables}
            onEdit={handleEditClick}
            onProgressUpdate={handleProgressUpdate}
            isUpdating={isUpdating}
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
        teamMembers={teamMembers}
        allDeliverables={deliverables}
        isSubmitting={isCreating}
        error={createError}
      />
    </div>
  );
}
