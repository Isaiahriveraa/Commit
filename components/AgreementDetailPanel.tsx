"use client";

import { Check, Clock, Calendar, AlertCircle, Loader2 } from "lucide-react";
import type { AgreementWithSignatures, SignatureDisplay } from "@/hooks/useAgreements";

/**
 * Generate initials from a name with defensive fallback
 */
function getInitials(name: string): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return '?';
  return (
    trimmed
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  );
}

type AgreementDetailPanelProps = {
  agreement: AgreementWithSignatures;
  signatures: SignatureDisplay[];
  userSigned: boolean;
  onSign: () => void | Promise<void>;
  isSigning?: boolean;
  loadingSignatures?: boolean;
  signError?: string | null;
};

export default function AgreementDetailPanel({
  agreement,
  signatures,
  userSigned,
  onSign,
  isSigning = false,
  loadingSignatures = false,
  signError = null,
}: AgreementDetailPanelProps) {
  const progress =
    agreement.totalMembers > 0
      ? Math.round((agreement.signedBy / agreement.totalMembers) * 100)
      : 0;

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {agreement.title}
            </h1>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all">
                Edit
              </button>
              {!userSigned && (
                <button
                  onClick={onSign}
                  disabled={isSigning}
                  className="px-4 py-2 bg-[var(--color-primary)] rounded-lg text-sm text-white font-medium hover:bg-[var(--color-primary-hover)] transition-all shadow-[var(--shadow-sm)] disabled:opacity-50 flex items-center gap-2"
                >
                  {isSigning && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSigning ? "Signing..." : "Sign Agreement"}
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

          {/* Sign Error */}
          {signError && (
            <div className="mb-4 p-3 bg-[var(--color-error-light)] border border-[var(--color-error)] rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--color-error)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-error)]">{signError}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-[var(--color-text-secondary)]">
              Created by{" "}
              <span className="text-[var(--color-text-primary)] font-medium">
                {agreement.creatorName}
              </span>
            </span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <Calendar className="w-4 h-4" />
              <span>{agreement.created_at ? new Date(agreement.created_at).toLocaleDateString() : 'Unknown'}</span>
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
              {agreement.status === "active"
                ? "Active"
                : agreement.status === "pending"
                ? "Pending"
                : "Archived"}
            </span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span className="text-[var(--color-primary)] font-medium">{progress}% signed</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 p-6 card">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            Description
          </h3>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {agreement.description || "No description provided."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 p-6 card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Signature Progress
            </h3>
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

          {loadingSignatures ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin mb-2" />
              <p className="text-sm text-[var(--color-text-muted)]">Loading signatures...</p>
            </div>
          ) : signatures.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--color-text-muted)]">No team members found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {signatures.map((sig) => (
                <div
                  key={sig.id}
                  className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        sig.signed
                          ? "bg-[var(--color-success)] text-white"
                          : "bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      {getInitials(sig.name)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">
                        {sig.name}
                      </div>
                      {sig.signed && sig.timestamp && (
                        <div className="text-xs text-[var(--color-text-muted)]">
                          Signed {sig.timestamp}
                        </div>
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
          )}
        </div>
      </div>
    </div>
  );
}
