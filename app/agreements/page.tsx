"use client";

import { useState } from "react";
import { Plus, FileText, CheckCircle, Clock, Users } from "lucide-react";

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

export default function Agreements() {
  const [agreements] = useState<Agreement[]>([
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Agreements</h1>
          <p className="text-gray-600 mt-2">Shared commitments and expectations for the team</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          New Agreement
        </button>
      </div>

      <div className="grid gap-6">
        {agreements.map((agreement) => (
          <div key={agreement.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{agreement.title}</h3>
                  <p className="text-gray-600 mt-1">{agreement.description}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  agreement.status === "active"
                    ? "bg-green-100 text-green-800"
                    : agreement.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Created by {agreement.createdBy}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(agreement.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {agreement.signedBy} / {agreement.totalMembers} signed
                    </span>
                  </div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all"
                      style={{ width: `${(agreement.signedBy / agreement.totalMembers) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  View Details
                </button>
                {agreement.signedBy < agreement.totalMembers && (
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    Sign Agreement
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
