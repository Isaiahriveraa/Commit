"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, FileText, Search, AlertCircle, Loader2, Trash2 } from "lucide-react";
import CreateAgreementModal from "@/components/CreateAgreementModal";
import AgreementDetailPanel from "@/components/AgreementDetailPanel";
import UndoToast from "@/components/UndoToast";
import {
  useAgreements,
  type AgreementWithSignatures,
  type SignatureDisplay,
} from "@/hooks/useAgreements";

type FilterStatus = "all" | "active" | "pending" | "archived";

export default function Agreements() {
  const {
    agreements,
    isLoading,
    isCreating,
    isSigning,
    error,
    createAgreement,
    signAgreement,
    deleteAgreement,
    permanentlyDeleteAgreement,
    restoreAgreement,
    fetchSignatures,
    hasUserSigned,
  } = useAgreements();

  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(
    null
  );
  const [signatures, setSignatures] = useState<SignatureDisplay[]>([]);
  const [userSigned, setUserSigned] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [signError, setSignError] = useState<string | null>(null);
  const [loadingSignatures, setLoadingSignatures] = useState(false);

  // Pending deletions array for multi-undo functionality
  // Each deletion has a unique ID for independent tracking
  const [pendingDeletions, setPendingDeletions] = useState<Array<{
    id: string; // Unique ID for this deletion event
    agreement: AgreementWithSignatures;
    originalIndex: number;
  }>>([]);

  // Ref to access pendingDeletions in callbacks without causing re-renders
  const pendingDeletionsRef = useRef(pendingDeletions);
  useEffect(() => {
    pendingDeletionsRef.current = pendingDeletions;
  }, [pendingDeletions]);

  // Set initial selected agreement when data loads
  useEffect(() => {
    if (agreements.length > 0 && !selectedAgreementId) {
      setSelectedAgreementId(agreements[0].id);
    }
  }, [agreements, selectedAgreementId]);

  // Load signatures when selected agreement changes
  useEffect(() => {
    if (!selectedAgreementId) {
      setSignatures([]);
      setUserSigned(false);
      return;
    }

    let isMounted = true;

    const loadSignatures = async () => {
      setLoadingSignatures(true);
      try {
        const [sigs, signed] = await Promise.all([
          fetchSignatures(selectedAgreementId),
          hasUserSigned(selectedAgreementId),
        ]);
        if (isMounted) {
          setSignatures(sigs);
          setUserSigned(signed);
        }
      } catch (err) {
        console.error("Failed to load signatures:", err);
      } finally {
        if (isMounted) setLoadingSignatures(false);
      }
    };

    loadSignatures();

    return () => {
      isMounted = false;
    };
  }, [selectedAgreementId, fetchSignatures, hasUserSigned]);

  const handleCreateAgreement = async (data: {
    title: string;
    description: string;
  }) => {
    setCreateError(null);
    const result = await createAgreement(data);

    if (result.success && result.id) {
      setShowCreateModal(false);
      setSelectedAgreementId(result.id);
    } else if (!result.success) {
      setCreateError(result.error || "Failed to create agreement");
    }
  };

  const handleSignAgreement = async () => {
    if (!selectedAgreementId) return;

    setSignError(null);
    const result = await signAgreement(selectedAgreementId);

    if (result.success) {
      setUserSigned(true);
      // Refresh signatures
      const sigs = await fetchSignatures(selectedAgreementId);
      setSignatures(sigs);
    } else {
      setSignError(result.error || "Failed to sign agreement");
    }
  };

  /**
   * Handle delete with undo pattern:
   * 1. Remove from UI immediately (optimistic)
   * 2. Add to pending deletions array for multi-undo support
   * 3. Show stacked undo toasts - permanent deletion happens on each timeout
   */
  const handleDeleteAgreement = async (agreementId: string) => {
    // Find the agreement and its index before deletion
    const index = agreements.findIndex((a) => a.id === agreementId);
    if (index === -1) return;

    const result = await deleteAgreement(agreementId);
    if (result.success && result.deleted) {
      // Generate unique ID for this deletion event
      const deletionId = `del_${Date.now()}_${agreementId}`;

      // Add to pending deletions array (supports multiple)
      setPendingDeletions((prev) => [
        ...prev,
        {
          id: deletionId,
          agreement: result.deleted!,
          originalIndex: index,
        },
      ]);

      // If deleted agreement was selected, select next available
      if (selectedAgreementId === agreementId) {
        const remaining = agreements.filter((a) => a.id !== agreementId);
        setSelectedAgreementId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  /**
   * Restore a specific deleted agreement (undo action)
   * Takes deletion ID to support undoing any item in the stack
   * Wrapped in useCallback for stable reference (prevents timer resets)
   * Uses ref to read pendingDeletions without adding to dependencies
   */
  const handleUndoDelete = useCallback((deletionId: string) => {
    // Find the deletion using ref (stable reference, no re-renders)
    const deletion = pendingDeletionsRef.current.find((d) => d.id === deletionId);

    if (deletion) {
      // Restore agreement first (separate state update)
      restoreAgreement(deletion.agreement, deletion.originalIndex);
    }

    // Then remove from pending array (separate state update)
    setPendingDeletions((prev) => prev.filter((d) => d.id !== deletionId));
  }, [restoreAgreement]);

  /**
   * Permanently delete a specific agreement when its undo timeout expires
   * Wrapped in useCallback for stable reference (prevents timer resets)
   * Uses ref to read pendingDeletions without adding to dependencies
   */
  const handlePermanentDelete = useCallback(async (deletionId: string) => {
    // Find the deletion using ref (stable reference)
    const deletion = pendingDeletionsRef.current.find((d) => d.id === deletionId);
    const agreementId = deletion?.agreement.id;

    // Remove from pending array
    setPendingDeletions((prev) => prev.filter((d) => d.id !== deletionId));

    // Perform the actual database deletion
    if (agreementId) {
      const result = await permanentlyDeleteAgreement(agreementId);
      if (!result.success) {
        console.error("Failed to permanently delete:", result.error);
      }
    }
  }, [permanentlyDeleteAgreement]);

  /**
   * Dismiss a specific toast (same as letting it timeout)
   * Wrapped in useCallback for stable reference
   */
  const handleDismissToast = useCallback((deletionId: string) => {
    handlePermanentDelete(deletionId);
  }, [handlePermanentDelete]);

  // Filter agreements
  const filteredAgreements = agreements.filter((a) => {
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedAgreement = agreements.find(
    (a) => a.id === selectedAgreementId
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full">
        {/* Left Panel Skeleton */}
        <div className="w-80 flex-shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col">
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-24 bg-[var(--color-surface-alt)] rounded animate-pulse" />
              <div className="h-8 w-8 bg-[var(--color-surface-alt)] rounded-lg animate-pulse" />
            </div>
            <div className="h-10 bg-[var(--color-surface-alt)] rounded-lg animate-pulse mb-3" />
            <div className="flex gap-2">
              <div className="flex-1 h-8 bg-[var(--color-surface-alt)] rounded-lg animate-pulse" />
              <div className="flex-1 h-8 bg-[var(--color-surface-alt)] rounded-lg animate-pulse" />
              <div className="flex-1 h-8 bg-[var(--color-surface-alt)] rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="flex-1 p-2 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-transparent">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-7 h-7 bg-[var(--color-surface-alt)] rounded-lg animate-pulse" />
                  <div className="flex-1 h-4 bg-[var(--color-surface-alt)] rounded animate-pulse" />
                </div>
                <div className="pl-8">
                  <div className="h-1.5 bg-[var(--color-surface-alt)] rounded-full animate-pulse mb-1.5" />
                  <div className="h-3 w-20 bg-[var(--color-surface-alt)] rounded animate-pulse" />
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
            Failed to load agreements
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
      {/* Left Panel - Agreement List */}
      <div className="w-80 flex-shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Agreements
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-all shadow-[var(--shadow-sm)]"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <label htmlFor="agreement-search" className="sr-only">
              Search agreements
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              id="agreement-search"
              type="text"
              placeholder="Search agreements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]"
                  : "text-(--color-text-secondary) hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "active"
                  ? "bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              Active ({agreements.filter((a) => a.status === "active").length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "pending"
                  ? "bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              Pending ({agreements.filter((a) => a.status === "pending").length})
            </button>
          </div>
        </div>

        {/* Agreement List */}
        <div className="flex-1 overflow-auto p-2">
          {filteredAgreements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <FileText className="w-8 h-8 text-(--color-text-muted) mb-2" />
              <p className="text-sm text-(--color-text-muted)">
                {searchQuery ? "No agreements found" : "No agreements yet"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-2 text-sm text-(--color-primary) hover:underline"
                >
                  Create your first agreement
                </button>
              )}
            </div>
          ) : (
            filteredAgreements.map((agreement) => (
              <AgreementListItem
                key={agreement.id}
                agreement={agreement}
                isSelected={selectedAgreementId === agreement.id}
                onClick={() => setSelectedAgreementId(agreement.id)}
                onDelete={handleDeleteAgreement}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Agreement Detail */}
      <div className="flex-1 overflow-auto bg-(--color-bg)">
        {selectedAgreement ? (
          <AgreementDetailPanel
            agreement={selectedAgreement}
            signatures={signatures}
            userSigned={userSigned}
            onSign={handleSignAgreement}
            isSigning={isSigning}
            loadingSignatures={loadingSignatures}
            signError={signError}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-(--color-text-muted)">
              Select an agreement to view details
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateAgreementModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateError(null);
        }}
        onSubmit={handleCreateAgreement}
        isSubmitting={isCreating}
        error={createError}
      />

      {/* Stacked Undo Toasts for Multi-Delete */}
      {pendingDeletions.map((deletion, index) => (
        <UndoToast
          key={deletion.id}
          id={deletion.id}
          message={`Deleted "${deletion.agreement.title}"`}
          duration={5000}
          index={index}
          onUndo={handleUndoDelete}
          onDismiss={handleDismissToast}
          onTimeout={handlePermanentDelete}
        />
      ))}
    </div>
  );
}

/**
 * Agreement list item component
 */
function AgreementListItem({
  agreement,
  isSelected,
  onClick,
  onDelete,
}: {
  agreement: AgreementWithSignatures;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (agreementId: string) => void;
}) {
  
  const [isHovered, setIsHovered] = useState(false);
  const progress =
    agreement.totalMembers > 0
      ? Math.round((agreement.signedBy / agreement.totalMembers) * 100)
      : 0;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View agreement: ${agreement.title}, ${progress}% signed, status: ${agreement.status}`}
      className={`w-full text-left p-3 rounded-xl mb-2 transition-all cursor-pointer ${
        isSelected
          ? "bg-(--color-primary-light) border border-(--color-primary) shadow-(--shadow-md)"
          : "border border-transparent hover:bg-(--color-surface-hover) hover:border-(--color-border)"
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <div
          className={`p-1.5 rounded-lg ${
            agreement.status === "active"
              ? "bg-(--color-success-light)"
              : agreement.status === "pending"
              ? "bg-(--color-warning-light)"
              : "bg-(--color-surface-alt)"
          }`}
        >
          <FileText
            className={`w-3.5 h-3.5 ${
              agreement.status === "active"
                ? "text-(--color-success)"
                : agreement.status === "pending"
                ? "text=(--color-warning)]"
                : "text-(--color-text-muted)"
            }`}
          />
        </div>
        <h3 className="text-sm font-semibold text-(--color-text-primary) flex-1 leading-tight">
          {agreement.title}
        </h3>
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(agreement.id);
            }}
            className="p-1.5 rounded-lg text-(--color-text-muted) hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label="Delete agreement"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="pl-8">
        <div className="relative h-1.5 bg-(--color-surface-alt) rounded-full overflow-hidden mb-1.5">
          <div
            className="absolute inset-y-0 left-0 bg-(--color-primary) rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-(--color-text-muted)">
            {agreement.signedBy}/{agreement.totalMembers} signed
          </span>
          <span className="text-(--color-primary) font-medium">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
