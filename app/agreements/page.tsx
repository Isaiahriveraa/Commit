"use client";

import { useState } from "react";
import { Plus, FileText, Search } from "lucide-react";
import CreateAgreementModal from "@/components/CreateAgreementModal";
import AgreementDetailPanel from "@/components/AgreementDetailPanel";

type Agreement = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  signedBy: number;
  totalMembers: number;
  status: "active" | "pending" | "archived";
};

type Signature = {
  name: string;
  signed: boolean;
  timestamp: string | null;
};

export default function Agreements() {
  const [agreements, setAgreements] = useState<Agreement[]>([
    {
      id: "1",
      title: "Sprint Communication Protocol",
      description: "Team members must respond to messages within 24 hours and attend all daily standups.",
      createdBy: "Sarah Chen",
      createdAt: "2024-11-20",
      signedBy: 10,
      totalMembers: 12,
      status: "active",
    },
    {
      id: "2",
      title: "Code Review Standards",
      description: "All PRs require 2 approvals. Reviews must be completed within 48 hours of submission.",
      createdBy: "Mike Ross",
      createdAt: "2024-11-18",
      signedBy: 12,
      totalMembers: 12,
      status: "active",
    },
    {
      id: "3",
      title: "Work Hours & Availability",
      description: "Core hours: 10am-3pm EST. Update status if unavailable for >2 hours during core time.",
      createdBy: "Emma Wilson",
      createdAt: "2024-11-15",
      signedBy: 8,
      totalMembers: 12,
      status: "pending",
    },
  ]);

  // Mock signature data
  const getSignatures = (agreementId: string): Signature[] => {
    const baseSignatures = [
      { name: "Sarah Chen", signed: true, timestamp: "2 days ago" },
      { name: "Mike Ross", signed: true, timestamp: "2 days ago" },
      { name: "Jessica Pearson", signed: true, timestamp: "1 day ago" },
      { name: "Harvey Specter", signed: false, timestamp: null },
      { name: "Rachel Zane", signed: true, timestamp: "3 hours ago" },
      { name: "Louis Litt", signed: true, timestamp: "1 day ago" },
      { name: "Emma Wilson", signed: true, timestamp: "5 hours ago" },
      { name: "Alex Kim", signed: true, timestamp: "1 day ago" },
      { name: "Jordan Lee", signed: false, timestamp: null },
      { name: "Taylor Morgan", signed: true, timestamp: "6 hours ago" },
      { name: "Casey Rivers", signed: false, timestamp: null },
      { name: "Morgan Blair", signed: true, timestamp: "2 days ago" },
    ];

    const agreement = agreements.find((a) => a.id === agreementId);
    if (!agreement) return [];

    return baseSignatures.map((sig, idx) => ({
      ...sig,
      signed: idx < agreement.signedBy,
    }));
  };

  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(agreements[0]?.id || null);
  const [signedAgreements, setSignedAgreements] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "pending" | "archived">("all");

  const handleCreateAgreement = (newAgreement: { title: string; description: string }) => {
    const agreement: Agreement = {
      id: String(agreements.length + 1),
      title: newAgreement.title,
      description: newAgreement.description,
      createdBy: "You",
      createdAt: new Date().toISOString().split("T")[0],
      signedBy: 0,
      totalMembers: 12,
      status: "pending",
    };
    setAgreements([agreement, ...agreements]);
    setSelectedAgreementId(agreement.id);
    setShowCreateModal(false);
  };

  const handleSignAgreement = () => {
    if (!selectedAgreementId) return;
    setSignedAgreements(new Set([...signedAgreements, selectedAgreementId]));
    setAgreements(
      agreements.map((a) => (a.id === selectedAgreementId ? { ...a, signedBy: a.signedBy + 1 } : a))
    );
  };

  const filteredAgreements =
    filterStatus === "all" ? agreements : agreements.filter((a) => a.status === filterStatus);

  const selectedAgreement = agreements.find((a) => a.id === selectedAgreementId);

  return (
    <div className="flex h-full">
      {/* Left Panel - Agreement List */}
      <div className="w-80 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Agreements</h2>
            <button
              onClick={() => setShowCreateModal(true)}
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
              placeholder="Search agreements..."
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
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
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
          {filteredAgreements.map((agreement) => {
            const progress = Math.round((agreement.signedBy / agreement.totalMembers) * 100);
            const isSelected = selectedAgreementId === agreement.id;

            return (
              <button
                key={agreement.id}
                onClick={() => setSelectedAgreementId(agreement.id)}
                className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${
                  isSelected
                    ? "bg-[var(--color-primary-light)] border border-[var(--color-primary)] shadow-[var(--shadow-md)]"
                    : "border border-transparent hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border)]"
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      agreement.status === "active"
                        ? "bg-[var(--color-success-light)]"
                        : agreement.status === "pending"
                        ? "bg-[var(--color-warning-light)]"
                        : "bg-[var(--color-surface-alt)]"
                    }`}
                  >
                    <FileText
                      className={`w-3.5 h-3.5 ${
                        agreement.status === "active"
                          ? "text-[var(--color-success)]"
                          : agreement.status === "pending"
                          ? "text-[var(--color-warning)]"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex-1 leading-tight">{agreement.title}</h3>
                </div>
                <div className="pl-8">
                  <div className="relative h-1.5 bg-[var(--color-surface-alt)] rounded-full overflow-hidden mb-1.5">
                    <div
                      className="absolute inset-y-0 left-0 bg-[var(--color-primary)] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-muted)]">
                      {agreement.signedBy}/{agreement.totalMembers} signed
                    </span>
                    <span className="text-[var(--color-primary)] font-medium">{progress}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Agreement Detail */}
      <div className="flex-1 overflow-auto bg-[var(--color-bg)]">
        {selectedAgreement ? (
          <AgreementDetailPanel
            agreement={selectedAgreement}
            signatures={getSignatures(selectedAgreement.id)}
            userSigned={signedAgreements.has(selectedAgreement.id)}
            onSign={handleSignAgreement}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-[var(--color-text-muted)]">Select an agreement to view details</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateAgreementModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAgreement}
      />
    </div>
  );
}
