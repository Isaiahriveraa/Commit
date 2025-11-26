"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Home, FileText, Target, BarChart3, MessageSquare, Search, Bell, User, HelpCircle } from "lucide-react";
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

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
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
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", Icon: Home },
    { href: "/agreements", label: "Agreements", Icon: FileText },
    { href: "/deliverables", label: "Deliverables", Icon: Target },
    { href: "/analytics", label: "Analytics", Icon: BarChart3 },
    { href: "/updates", label: "Updates", Icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0A0E1A] border-r border-[#242938] flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <Link href="/dashboard">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Commit
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {navLinks.map((link) => {
            const Icon = link.Icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-[#E4E6EB] border border-blue-500/20"
                    : "text-[#9BA3AF] hover:bg-[#1A1F2E] hover:text-[#E4E6EB]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#242938]">
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9BA3AF] hover:bg-[#1A1F2E] hover:text-[#E4E6EB] transition-all w-full mb-1">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Help</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9BA3AF] hover:bg-[#1A1F2E] hover:text-[#E4E6EB] transition-all w-full">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              SC
            </div>
            <span className="text-sm font-medium">Sarah Chen</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-[#0A0E1A] border-b border-[#242938] px-6 py-4 flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-[#141824] border border-[#242938] rounded-lg text-[#E4E6EB] placeholder-[#6B7280] focus:border-blue-500/50 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-6 px-4 py-2 bg-[#141824] border border-[#242938] rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-[#E4E6EB]">12</div>
                <div className="text-xs text-[#6B7280]">Total</div>
              </div>
              <div className="w-px h-8 bg-[#242938]" />
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-400">9</div>
                <div className="text-xs text-[#6B7280]">Signed</div>
              </div>
              <div className="w-px h-8 bg-[#242938]" />
              <div className="text-center">
                <div className="text-xl font-bold text-amber-400">3</div>
                <div className="text-xs text-[#6B7280]">Pending</div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-[#141824] border border-[#242938] rounded-lg hover:border-blue-500/50 transition-all relative"
              >
                <Bell className="w-5 h-5 text-[#9BA3AF]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full text-[10px] font-bold flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)]">
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

            <button className="p-2 bg-[#141824] border border-[#242938] rounded-lg hover:border-blue-500/50 transition-all">
              <User className="w-5 h-5 text-[#9BA3AF]" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden bg-[#0A0E1A]">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="h-full overflow-y-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
