"use client";

import { AlertCircle, CheckCircle, Clock, FileText, Target, MessageSquare } from "lucide-react";

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
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "deadline":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "agreement":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "deliverable":
        return <Target className="w-5 h-5 text-green-600" />;
      case "mention":
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
    }
  };

  const getBgColor = (type: Notification["type"]) => {
    switch (type) {
      case "help-request":
        return "bg-red-50";
      case "deadline":
        return "bg-yellow-50";
      case "agreement":
        return "bg-blue-50";
      case "deliverable":
        return "bg-green-50";
      case "mention":
        return "bg-purple-50";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Notification Panel */}
      <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
          <p className="text-sm text-gray-600 mt-1">
            {notifications.filter(n => !n.read).length} unread
          </p>
        </div>

        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${getBgColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium text-gray-900 ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
