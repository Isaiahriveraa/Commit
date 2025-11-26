"use client";

import { X, Users, Clock, CheckCircle } from "lucide-react";

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

type ViewAgreementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  agreement: Agreement | null;
  userSigned: boolean;
  onSign: () => void;
};

export default function ViewAgreementModal({ isOpen, onClose, agreement, userSigned, onSign }: ViewAgreementModalProps) {
  if (!isOpen || !agreement) return null;

  const mockSignedMembers = [
    { name: "Sarah Chen", signedAt: "2024-11-20 10:30 AM" },
    { name: "Mike Ross", signedAt: "2024-11-20 11:15 AM" },
    { name: "Emma Wilson", signedAt: "2024-11-20 02:45 PM" },
    { name: "Alex Kim", signedAt: "2024-11-20 04:20 PM" },
    { name: "Jordan Lee", signedAt: "2024-11-21 09:00 AM" },
    { name: "Taylor Martinez", signedAt: "2024-11-21 10:30 AM" },
    { name: "Casey Brown", signedAt: "2024-11-21 01:15 PM" },
    { name: "Morgan Davis", signedAt: "2024-11-21 03:45 PM" },
  ].slice(0, agreement.signedBy);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-300 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{agreement.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Created by {agreement.createdBy}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(agreement.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Agreement Terms</h3>
            <p className="text-gray-700 leading-relaxed">{agreement.description}</p>
          </div>

          {/* Progress */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Signature Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {agreement.signedBy} / {agreement.totalMembers} signed
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${(agreement.signedBy / agreement.totalMembers) * 100}%` }}
              />
            </div>
          </div>

          {/* Signed Members List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Signed By</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockSignedMembers.map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-medium">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                  </div>
                  <span className="text-xs text-gray-600">{member.signedAt}</span>
                </div>
              ))}
              {userSigned && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-600">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      YOU
                    </div>
                    <span className="text-sm font-medium text-gray-900">You</span>
                  </div>
                  <span className="text-xs text-gray-600">Just now</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            {!userSigned && agreement.signedBy < agreement.totalMembers && (
              <button
                onClick={onSign}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Sign Agreement
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
