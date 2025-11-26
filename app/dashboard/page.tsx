"use client";

import { useState } from "react";
import { BarChart3, Target, Users, Clock } from "lucide-react";
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
    { label: "Active Projects", value: "3", icon: Target, color: "bg-blue-500" },
    { label: "Team Members", value: "12", icon: Users, color: "bg-green-500" },
    { label: "Pending Tasks", value: "24", icon: Clock, color: "bg-yellow-500" },
    { label: "Completion Rate", value: "78%", icon: BarChart3, color: "bg-purple-500" },
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {activity.user.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                    <span className="font-medium">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => setActiveModal("agreement")}
              className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <p className="font-medium text-blue-900">Create New Agreement</p>
              <p className="text-sm text-blue-700 mt-1">Set team expectations and rules</p>
            </button>
            <button
              onClick={() => setActiveModal("deliverable")}
              className="w-full text-left px-4 py-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <p className="font-medium text-green-900">Add Deliverable</p>
              <p className="text-sm text-green-700 mt-1">Track new milestone or deadline</p>
            </button>
            <button
              onClick={() => setActiveModal("update")}
              className="w-full text-left px-4 py-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <p className="font-medium text-purple-900">Post Status Update</p>
              <p className="text-sm text-purple-700 mt-1">Share your progress with the team</p>
            </button>
            <button
              onClick={() => setActiveModal("help")}
              className="w-full text-left px-4 py-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
            >
              <p className="font-medium text-red-900">Request Help</p>
              <p className="text-sm text-red-700 mt-1">Alert team members you need support</p>
            </button>
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
