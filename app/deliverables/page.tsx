"use client";

import { useState } from "react";
import { Plus, Target, Search, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import AddDeliverableModal from "@/components/AddDeliverableModal";
import DeliverableDetailPanel from "@/components/DeliverableDetailPanel";

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

  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(deliverables[0]?.id || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | Deliverable["status"]>("all");

  const handleAddDeliverable = (newDeliverable: {
    title: string;
    description: string;
    owner: string;
    deadline: string;
  }) => {
    if (editingDeliverable) {
      setDeliverables(deliverables.map(d => 
        d.id === editingDeliverable.id 
          ? { ...d, ...newDeliverable }
          : d
      ));
      setEditingDeliverable(null);
    } else {
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
      setSelectedDeliverableId(deliverable.id);
    }
    setShowAddModal(false);
  };

  const handleEditClick = (deliverable: Deliverable) => {
    setEditingDeliverable(deliverable);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingDeliverable(null);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredDeliverables =
    filterStatus === "all" ? deliverables : deliverables.filter((d) => d.status === filterStatus);

  const selectedDeliverable = deliverables.find((d) => d.id === selectedDeliverableId);

  const getStatusIcon = (status: Deliverable["status"]) => {
    switch (status) {
      case "completed":
        return CheckCircle2;
      case "at-risk":
        return AlertCircle;
      default:
        return Target;
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Deliverable List */}
      <div className="w-80 bg-[#0A0E1A] border-r border-[#242938] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#242938]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#E4E6EB]">Deliverables</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search deliverables..."
              className="w-full pl-9 pr-3 py-2 bg-[#141824] border border-[#242938] rounded-lg text-sm text-[#E4E6EB] placeholder-[#6B7280] focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20"
                  : "text-[#9BA3AF] hover:bg-[#1A1F2E]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("in-progress")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "in-progress"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "text-[#9BA3AF] hover:bg-[#1A1F2E]"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilterStatus("at-risk")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "at-risk"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "text-[#9BA3AF] hover:bg-[#1A1F2E]"
              }`}
            >
              At Risk
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === "completed"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-[#9BA3AF] hover:bg-[#1A1F2E]"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Deliverable List */}
        <div className="flex-1 overflow-auto p-2">
          {filteredDeliverables
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .map((deliverable) => {
              const isSelected = selectedDeliverableId === deliverable.id;
              const StatusIcon = getStatusIcon(deliverable.status);
              const daysUntil = getDaysUntilDeadline(deliverable.deadline);

              return (
                <button
                  key={deliverable.id}
                  onClick={() => setSelectedDeliverableId(deliverable.id)}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                      : "border border-transparent hover:bg-[#1A1F2E] hover:border-cyan-500/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className={`p-1.5 rounded ${
                        deliverable.status === "completed"
                          ? "bg-emerald-500/10"
                          : deliverable.status === "at-risk"
                          ? "bg-red-500/10"
                          : deliverable.status === "in-progress"
                          ? "bg-blue-500/10"
                          : "bg-[#6B7280]/10"
                      }`}
                    >
                      <StatusIcon
                        className={`w-3.5 h-3.5 ${
                          deliverable.status === "completed"
                            ? "text-emerald-400"
                            : deliverable.status === "at-risk"
                            ? "text-red-400"
                            : deliverable.status === "in-progress"
                            ? "text-blue-400"
                            : "text-[#6B7280]"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#E4E6EB] leading-tight truncate">{deliverable.title}</h3>
                      <p className="text-xs text-[#6B7280] mt-0.5">{deliverable.owner}</p>
                    </div>
                  </div>
                  <div className="pl-8">
                    {deliverable.status !== "completed" && (
                      <div className="text-xs text-[#6B7280] mb-1.5">
                        <span
                          className={
                            daysUntil < 0 ? "text-red-400" : daysUntil <= 3 ? "text-amber-400" : "text-[#6B7280]"
                          }
                        >
                          {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d left`}
                        </span>
                      </div>
                    )}
                    <div className="relative h-1 bg-[#1A1F2E] rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full ${
                          deliverable.status === "completed"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                            : deliverable.status === "at-risk"
                            ? "bg-gradient-to-r from-red-500 to-orange-400"
                            : "bg-gradient-to-r from-blue-500 to-cyan-400"
                        }`}
                        style={{ width: `${deliverable.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6B7280]">Progress</span>
                      <span
                        className={`font-medium ${
                          deliverable.status === "completed"
                            ? "text-emerald-400"
                            : deliverable.status === "at-risk"
                            ? "text-red-400"
                            : "text-blue-400"
                        }`}
                      >
                        {deliverable.progress}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Right Panel - Deliverable Detail */}
      <div className="flex-1 overflow-auto bg-[#0A0E1A]">
        {selectedDeliverable ? (
          <DeliverableDetailPanel 
            deliverable={selectedDeliverable} 
            allDeliverables={deliverables} 
            onEdit={handleEditClick}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-[#6B7280]">Select a deliverable to view details</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AddDeliverableModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleAddDeliverable}
        initialData={editingDeliverable}
      />
    </div>
  );
}
