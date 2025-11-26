"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Target, BarChart3, MessageSquare, Bell, CheckCircle } from "lucide-react";
import NotificationCenter from "./NotificationCenter";

type Notification = {
  id: string;
  type: "help-request" | "deadline" | "agreement" | "deliverable" | "mention";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "help-request",
      title: "Help Request from Mike Ross",
      message: "Need assistance with database migration errors",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: "2",
      type: "deadline",
      title: "Deadline Approaching",
      message: "Database Schema Design is due in 2 days",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      type: "agreement",
      title: "New Agreement to Sign",
      message: "Work Hours & Availability agreement needs your signature",
      time: "3 hours ago",
      read: false,
    },
    {
      id: "4",
      type: "deliverable",
      title: "Deliverable Assigned",
      message: "You've been assigned to API Endpoints v1",
      time: "Yesterday",
      read: true,
    },
    {
      id: "5",
      type: "mention",
      title: "Mentioned in Status Update",
      message: "Sarah Chen mentioned you in a progress update",
      time: "Yesterday",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const links = [
    { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/agreements", label: "Agreements", Icon: FileText },
    { href: "/deliverables", label: "Deliverables", Icon: Target },
    { href: "/analytics", label: "Workload", Icon: BarChart3 },
    { href: "/updates", label: "Updates", Icon: MessageSquare },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Commit</span>
          </Link>

          <div className="flex gap-1">
            {links.map((link) => {
              const Icon = link.Icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    pathname === link.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-900 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <NotificationCenter
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
