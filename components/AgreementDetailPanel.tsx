"use client";

import { Check, Clock, Calendar } from "lucide-react";

type Signature = {
  name: string;
  signed: boolean;
  timestamp: string | null;
};

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

type AgreementDetailPanelProps = {
  agreement: Agreement;
  signatures: Signature[];
  userSigned: boolean;
  onSign: () => void;
};

export default function AgreementDetailPanel({
  agreement,
  signatures,
  userSigned,
  onSign,
}: AgreementDetailPanelProps) {
  const progress = Math.round((agreement.signedBy / agreement.totalMembers) * 100);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{agreement.title}</h1>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all">
                Edit
              </button>
              {!userSigned && (
                <button
                  onClick={onSign}
                  className="px-4 py-2 bg-[var(--color-primary)] rounded-lg text-sm text-white font-medium hover:bg-[var(--color-primary-hover)] transition-all shadow-[var(--shadow-sm)]"
                >
                  Sign Agreement
                </button>
              )}
              {userSigned && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-success-light)] text-[var(--color-success)] rounded-lg text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Signed
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-[var(--color-text-secondary)]">
              Created by <span className="text-[var(--color-text-primary)] font-medium">{agreement.createdBy}</span>
            </span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <Calendar className="w-4 h-4" />
              <span>{new Date(agreement.createdAt).toLocaleDateString()}</span>
            </div>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                agreement.status === "active"
                  ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                  : agreement.status === "pending"
                  ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                  : "bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]"
              }`}
            >
              {agreement.status === "active" ? "Active" : agreement.status === "pending" ? "Pending" : "Archived"}
            </span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span className="text-[var(--color-primary)] font-medium">{progress}% signed</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 p-6 card">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Description</h3>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">{agreement.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 p-6 card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Signature Progress</h3>
            <span className="text-sm font-medium text-[var(--color-primary)]">
              {agreement.signedBy}/{agreement.totalMembers} signed
            </span>
          </div>
          <div className="relative h-3 bg-[var(--color-surface-alt)] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[var(--color-primary)] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Signatures */}
        <div className="p-6 card">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            Signatures ({agreement.signedBy}/{agreement.totalMembers})
          </h3>
          <div className="space-y-1">
            {signatures.map((sig, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      sig.signed
                        ? "bg-[var(--color-success)] text-white"
                        : "bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {sig.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{sig.name}</div>
                    {sig.signed && sig.timestamp && (
                      <div className="text-xs text-[var(--color-text-muted)]">Signed {sig.timestamp}</div>
                    )}
                  </div>
                </div>
                {sig.signed ? (
                  <div className="flex items-center gap-2 text-[var(--color-success)]">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">Signed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[var(--color-warning)]">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Pending</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
