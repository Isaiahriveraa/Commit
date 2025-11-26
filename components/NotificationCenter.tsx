"use client";

import { AlertCircle, CheckCircle, Clock, FileText, Target, MessageSquare, X } from "lucide-react";

type Notification = {
  id: string;
  type: "help-request" | "deadline" | "agreement" | "deliverable" | "mention";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
};

type NotificationCenterProps = {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
};

export default function NotificationCenter({ isOpen, onClose, notifications, onMarkAsRead }: NotificationCenterProps) {
  if (!isOpen) return null;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "help-request":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "deadline":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case "agreement":
        return <FileText className="w-5 h-5 text-blue-400" />;
      case "deliverable":
        return <Target className="w-5 h-5 text-green-400" />;
      case "mention":
        return <MessageSquare className="w-5 h-5 text-purple-400" />;
    }
  };

  const getBgColor = (type: Notification["type"]) => {
    switch (type) {
      case "help-request":
        return "bg-red-500/10";
      case "deadline":
        return "bg-yellow-500/10";
      case "agreement":
        return "bg-blue-500/10";
      case "deliverable":
        return "bg-green-500/10";
      case "mention":
        return "bg-purple-500/10";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Notification Panel */}
      <div className="absolute right-0 top-full mt-2 w-96 bg-[#141824] rounded-lg shadow-2xl border border-[#242938] z-50 max-h-[600px] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#242938] bg-[#0A0E1A] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#E4E6EB]">Notifications</h3>
            <p className="text-sm text-[#9BA3AF] mt-1">
              {notifications.filter(n => !n.read).length} unread
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#1A1F2E] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#9BA3AF]" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
              <p className="text-[#9BA3AF]">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-[#242938]">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  className={`w-full text-left p-4 hover:bg-[#1A1F2E] transition-colors ${
                    !notification.read ? "bg-[#1A1F2E]" : "bg-transparent"
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${getBgColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium text-[#E4E6EB] ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-[#9BA3AF] mt-1">{notification.message}</p>
                      <p className="text-xs text-[#6B7280] mt-2">{notification.time}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#242938] bg-[#0A0E1A]">
          <button
            onClick={onClose}
            className="w-full text-sm text-[#9BA3AF] hover:text-[#E4E6EB] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
