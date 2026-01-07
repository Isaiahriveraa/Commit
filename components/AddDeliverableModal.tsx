"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle, ChevronDown, Check } from "lucide-react";
import type { TeamMember } from "@/types/database";
import type { DeliverableWithDetails } from "@/hooks/useDeliverables";

type AddDeliverableModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deliverable: {
    title: string;
    description: string;
    owner_id: string | null;
    deadline: string;
    dependencyIds?: string[];
  }) => void;
  initialData?: DeliverableWithDetails | null;
  teamMembers: TeamMember[];
  allDeliverables: DeliverableWithDetails[];
  isSubmitting?: boolean;
  error?: string | null;
};

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/**
 * Inner form component that resets when key changes
 */
function DeliverableForm({
  initialData,
  teamMembers,
  allDeliverables,
  isSubmitting = false,
  error,
  onSubmit,
  onClose,
}: Omit<AddDeliverableModalProps, "isOpen">) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [ownerId, setOwnerId] = useState<string | null>(
    initialData?.owner_id ?? (teamMembers.length > 0 ? teamMembers[0].id : null)
  );
  const [deadline, setDeadline] = useState(initialData?.deadline ?? getTodayDate());
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(
    initialData?.dependencyIds ?? []
  );
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showDependenciesDropdown, setShowDependenciesDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && deadline) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        owner_id: ownerId,
        deadline,
        dependencyIds: selectedDependencies,
      });
    }
  };

  const selectedOwner = teamMembers.find((m) => m.id === ownerId);

  const availableDependencies = allDeliverables.filter(
    (d) => d.id !== initialData?.id
  );

  const toggleDependency = (id: string) => {
    setSelectedDependencies((prev) =>
      prev.includes(id) ? prev.filter((depId) => depId !== id) : [...prev, id]
    );
  };

  return (
    <>
      {error && (
        <div className="mx-6 mt-4 p-3 bg-[var(--color-error-light)] border border-[var(--color-error)] rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[var(--color-error)] flex-shrink-0" />
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <label
            htmlFor="deliverable-title"
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
          >
            Deliverable Title
          </label>
          <input
            id="deliverable-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Payment Gateway Integration"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-all disabled:opacity-50"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="deliverable-description"
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
          >
            Description
          </label>
          <textarea
            id="deliverable-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the deliverable and its requirements..."
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-all resize-none disabled:opacity-50"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Owner
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-left flex items-center justify-between focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-all disabled:opacity-50"
            >
              <span
                className={
                  selectedOwner
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)]"
                }
              >
                {selectedOwner?.name || "Select owner..."}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${
                  showOwnerDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showOwnerDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-[var(--shadow-lg)] z-10 max-h-48 overflow-auto">
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setOwnerId(member.id);
                      setShowOwnerDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-surface-hover)] flex items-center justify-between ${
                      ownerId === member.id
                        ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                        : "text-[var(--color-text-primary)]"
                    }`}
                  >
                    <span>{member.name}</span>
                    {ownerId === member.id && (
                      <Check className="w-4 h-4 text-[var(--color-primary)]" />
                    )}
                  </button>
                ))}
                {teamMembers.length === 0 && (
                  <div className="px-4 py-2 text-sm text-[var(--color-text-muted)]">
                    No team members available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="deliverable-deadline"
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
          >
            Deadline
          </label>
          <input
            id="deliverable-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-all disabled:opacity-50"
            required
          />
        </div>

        {!initialData && availableDependencies.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Dependencies (Optional)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDependenciesDropdown(!showDependenciesDropdown)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-left flex items-center justify-between focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] outline-none transition-all disabled:opacity-50"
              >
                <span
                  className={
                    selectedDependencies.length > 0
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }
                >
                  {selectedDependencies.length > 0
                    ? `${selectedDependencies.length} deliverable${
                        selectedDependencies.length > 1 ? "s" : ""
                      } selected`
                    : "Select dependencies..."}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${
                    showDependenciesDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showDependenciesDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-[var(--shadow-lg)] z-10 max-h-48 overflow-auto">
                  {availableDependencies.map((dep) => (
                    <button
                      key={dep.id}
                      type="button"
                      onClick={() => toggleDependency(dep.id)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-surface-hover)] flex items-center justify-between ${
                        selectedDependencies.includes(dep.id)
                          ? "bg-[var(--color-primary-light)]"
                          : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[var(--color-text-primary)] truncate">
                          {dep.title}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {dep.ownerName} • {dep.progress ?? 0}% complete
                        </div>
                      </div>
                      {selectedDependencies.includes(dep.id) && (
                        <Check className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Select deliverables that must be completed before this one
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-4 py-2 bg-[var(--color-primary)] rounded-lg text-white font-medium hover:bg-[var(--color-primary-hover)] transition-all shadow-[var(--shadow-sm)] disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? "Save Changes" : "Add Deliverable"}
          </button>
        </div>
      </form>
    </>
  );
}

export default function AddDeliverableModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  teamMembers,
  allDeliverables,
  isSubmitting = false,
  error,
}: AddDeliverableModalProps) {
  if (!isOpen) return null;

  // Use key to force form remount when initialData changes
  const formKey = initialData?.id ?? "new";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-xl)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {initialData ? "Edit Deliverable" : "Add New Deliverable"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--color-surface-alt)] disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <DeliverableForm
          key={formKey}
          initialData={initialData}
          teamMembers={teamMembers}
          allDeliverables={allDeliverables}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
