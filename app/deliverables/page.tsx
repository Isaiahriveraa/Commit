"use client";

import { useState } from "react";
import { Plus, Target, Calendar, User, AlertCircle, CheckCircle2 } from "lucide-react";
import AddDeliverableModal from "@/components/AddDeliverableModal";

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

  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddDeliverable = (newDeliverable: { title: string; description: string; owner: string; deadline: string }) => {
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
    setShowAddModal(false);
  };

  const getStatusColor = (status: Deliverable["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "at-risk":
        return "bg-red-100 text-red-800";
      case "upcoming":
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deliverables Roadmap</h1>
          <p className="text-gray-600 mt-2">Track milestones and project deadlines</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Deliverable
        </button>
      </div>

      {/* Timeline View */}
      <div className="mb-8">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          <div className="space-y-6">
            {deliverables
              .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              .map((deliverable, idx) => {
                const daysUntil = getDaysUntilDeadline(deliverable.deadline);
                return (
                  <div key={deliverable.id} className="relative flex gap-6">
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          deliverable.status === "completed"
                            ? "bg-green-600"
                            : deliverable.status === "at-risk"
                            ? "bg-red-600"
                            : "bg-blue-600"
                        }`}
                      >
                        {deliverable.status === "completed" ? (
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        ) : deliverable.status === "at-risk" ? (
                          <AlertCircle className="w-8 h-8 text-white" />
                        ) : (
                          <Target className="w-8 h-8 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">{deliverable.title}</h3>
                          <p className="text-gray-600 mt-1">{deliverable.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deliverable.status)}`}>
                          {deliverable.status.replace("-", " ").toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{deliverable.owner}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(deliverable.deadline).toLocaleDateString()}
                            {deliverable.status !== "completed" && (
                              <span
                                className={`ml-2 ${
                                  daysUntil < 0
                                    ? "text-red-600 font-medium"
                                    : daysUntil <= 3
                                    ? "text-yellow-600 font-medium"
                                    : ""
                                }`}
                              >
                                ({daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {deliverable.dependencies && deliverable.dependencies.length > 0 && (
                        <div className="mb-4 text-sm text-gray-600">
                          <span className="font-medium">Depends on:</span> {deliverable.dependencies.length} other deliverable(s)
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{deliverable.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              deliverable.status === "completed"
                                ? "bg-green-600"
                                : deliverable.status === "at-risk"
                                ? "bg-red-600"
                                : "bg-blue-600"
                            }`}
                            style={{ width: `${deliverable.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <AddDeliverableModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDeliverable}
      />
    </div>
  );
}
