"use client";

import { useState } from "react";
import { BarChart3, Target, Users, Clock, Plus, MessageSquare, HelpCircle, FileText } from "lucide-react";
import CreateAgreementModal from "@/components/CreateAgreementModal";
import AddDeliverableModal from "@/components/AddDeliverableModal";
import PostUpdateModal from "@/components/PostUpdateModal";
import RequestHelpModal from "@/components/RequestHelpModal";

type Activity = {
  user: string;
  action: string;
  item: string;
  time: string;
};

export default function Dashboard() {
  const [activeModal, setActiveModal] = useState<"agreement" | "deliverable" | "update" | "help" | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([
    { user: "Sarah Chen", action: "completed", item: "User Auth Module", time: "2 hours ago" },
    { user: "Mike Ross", action: "requested help on", item: "API Integration", time: "4 hours ago" },
    { user: "Emma Wilson", action: "signed", item: "Team Agreement v2", time: "Yesterday" },
    { user: "Alex Kim", action: "created", item: "Sprint Planning Deliverable", time: "Yesterday" },
  ]);

  const stats = [
    { label: "Active Projects", value: "3", icon: Target, bgColor: "bg-[var(--color-primary-light)]", iconColor: "text-[var(--color-primary)]" },
    { label: "Team Members", value: "12", icon: Users, bgColor: "bg-[var(--color-success-light)]", iconColor: "text-[var(--color-success)]" },
    { label: "Pending Tasks", value: "24", icon: Clock, bgColor: "bg-[var(--color-warning-light)]", iconColor: "text-[var(--color-warning)]" },
    { label: "Completion Rate", value: "78%", icon: BarChart3, bgColor: "bg-[var(--color-info-light)]", iconColor: "text-[var(--color-info)]" },
  ];

  const quickActions = [
    { 
      label: "New Agreement", 
      description: "Set team expectations and rules",
      icon: FileText, 
      modal: "agreement" as const,
      color: "text-[var(--color-primary)]",
      bgColor: "bg-[var(--color-primary-light)]",
      hoverBg: "hover:bg-[var(--color-primary)]",
    },
    { 
      label: "Add Deliverable", 
      description: "Track new milestone or deadline",
      icon: Plus, 
      modal: "deliverable" as const,
      color: "text-[var(--color-success)]",
      bgColor: "bg-[var(--color-success-light)]",
      hoverBg: "hover:bg-[var(--color-success)]",
    },
    { 
      label: "Post Update", 
      description: "Share your progress",
      icon: MessageSquare, 
      modal: "update" as const,
      color: "text-[var(--color-info)]",
      bgColor: "bg-[var(--color-info-light)]",
      hoverBg: "hover:bg-[var(--color-info)]",
    },
    { 
      label: "Request Help", 
      description: "Alert team members",
      icon: HelpCircle, 
      modal: "help" as const,
      color: "text-[var(--color-error)]",
      bgColor: "bg-[var(--color-error-light)]",
      hoverBg: "hover:bg-[var(--color-error)]",
    },
  ];

  const handleCreateAgreement = (agreement: { title: string; description: string }) => {
    const newActivity: Activity = {
      user: "You",
      action: "created agreement",
      item: agreement.title,
      time: "Just now",
    };
    setRecentActivity([newActivity, ...recentActivity]);
  };

  const handleAddDeliverable = (deliverable: { title: string; description: string; owner: string; deadline: string }) => {
    const newActivity: Activity = {
      user: "You",
      action: "created deliverable",
      item: deliverable.title,
      time: "Just now",
    };
    setRecentActivity([newActivity, ...recentActivity]);
  };

  const handlePostUpdate = (update: { content: string; linkedDeliverable?: string }) => {
    const newActivity: Activity = {
      user: "You",
      action: "posted update",
      item: update.linkedDeliverable || "general update",
      time: "Just now",
    };
    setRecentActivity([newActivity, ...recentActivity]);
  };

  const handleRequestHelp = (request: { title: string; description: string; urgency: string }) => {
    const newActivity: Activity = {
      user: "You",
      action: "requested help on",
      item: request.title,
      time: "Just now",
    };
    setRecentActivity([newActivity, ...recentActivity]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Welcome back! Here's what's happening with your projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="card p-6 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">{stat.label}</p>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-5">Recent Activity</h2>
          <div className="space-y-1">
            {recentActivity.map((activity, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4 p-3 -mx-3 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {activity.user.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-text-primary)]">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-[var(--color-text-secondary)]">{activity.action}</span>{" "}
                    <span className="font-medium text-[var(--color-primary)]">{activity.item}</span>
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.modal}
                  onClick={() => setActiveModal(action.modal)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl ${action.bgColor} border border-transparent hover:border-current ${action.hoverBg} hover:text-white group transition-all duration-[var(--transition-base)]`}
                >
                  <div className={`p-2 rounded-lg bg-white/80 group-hover:bg-white/20 transition-colors`}>
                    <Icon className={`w-5 h-5 ${action.color} group-hover:text-white transition-colors`} />
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${action.color} group-hover:text-white transition-colors`}>{action.label}</p>
                    <p className="text-xs text-[var(--color-text-muted)] group-hover:text-white/70 transition-colors">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateAgreementModal
        isOpen={activeModal === "agreement"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleCreateAgreement}
      />
      <AddDeliverableModal
        isOpen={activeModal === "deliverable"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleAddDeliverable}
      />
      <PostUpdateModal
        isOpen={activeModal === "update"}
        onClose={() => setActiveModal(null)}
        onSubmit={handlePostUpdate}
      />
      <RequestHelpModal
        isOpen={activeModal === "help"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleRequestHelp}
      />
    </div>
  );
}
