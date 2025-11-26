"use client";

import { Check, Clock, Users, Calendar } from "lucide-react";

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
            <h1 className="text-3xl font-bold text-[#E4E6EB]">{agreement.title}</h1>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#141824] border border-[#242938] rounded-lg text-sm text-[#9BA3AF] hover:border-blue-500/30 transition-all">
                Edit
              </button>
              {!userSigned && (
                <button
                  onClick={onSign}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-sm text-white font-medium hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all"
                >
                  Sign Agreement
                </button>
              )}
              {userSigned && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Signed
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-[#9BA3AF]">
              Created by <span className="text-[#E4E6EB] font-medium">{agreement.createdBy}</span>
            </span>
            <span className="text-[#6B7280]">•</span>
            <div className="flex items-center gap-1.5 text-[#9BA3AF]">
              <Calendar className="w-4 h-4" />
              <span>{new Date(agreement.createdAt).toLocaleDateString()}</span>
            </div>
            <span className="text-[#6B7280]">•</span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                agreement.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : agreement.status === "pending"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-[#6B7280]/10 text-[#6B7280] border border-[#6B7280]/20"
              }`}
            >
              {agreement.status === "active" ? "● Active" : agreement.status === "pending" ? "○ Pending" : "Archived"}
            </span>
            <span className="text-[#6B7280]">•</span>
            <span className="text-blue-400 font-medium">{progress}% signed</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 p-6 bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938]">
          <h3 className="text-sm font-semibold text-[#E4E6EB] mb-3">Description</h3>
          <p className="text-[#9BA3AF] leading-relaxed">{agreement.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 p-6 bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#E4E6EB]">Signature Progress</h3>
            <span className="text-sm font-medium text-blue-400">
              {agreement.signedBy}/{agreement.totalMembers} signed
            </span>
          </div>
          <div className="relative h-3 bg-[#1A1F2E] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Signatures */}
        <div className="p-6 bg-gradient-to-br from-[#141824] to-[#0A0E1A] rounded-xl border border-[#242938]">
          <h3 className="text-sm font-semibold text-[#E4E6EB] mb-4">
            Signatures ({agreement.signedBy}/{agreement.totalMembers})
          </h3>
          <div className="space-y-3">
            {signatures.map((sig, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#242938] last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      sig.signed
                        ? "bg-gradient-to-br from-emerald-500 to-teal-400 text-white"
                        : "bg-[#1A1F2E] text-[#6B7280]"
                    }`}
                  >
                    {sig.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#E4E6EB]">{sig.name}</div>
                    {sig.signed && sig.timestamp && (
                      <div className="text-xs text-[#6B7280]">Signed {sig.timestamp}</div>
                    )}
                  </div>
                </div>
                {sig.signed ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">Signed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-400">
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
