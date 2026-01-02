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
        return <AlertCircle className="w-5 h-5 text-[var(--color-error)]" />;
      case "deadline":
        return <Clock className="w-5 h-5 text-[var(--color-warning)]" />;
      case "agreement":
        return <FileText className="w-5 h-5 text-[var(--color-info)]" />;
      case "deliverable":
        return <Target className="w-5 h-5 text-[var(--color-success)]" />;
      case "mention":
        return <MessageSquare className="w-5 h-5 text-[var(--color-secondary)]" />;
    }
  };

  const getBgColor = (type: Notification["type"]) => {
    switch (type) {
      case "help-request":
        return "bg-[var(--color-error-light)]";
      case "deadline":
        return "bg-[var(--color-warning-light)]";
      case "agreement":
        return "bg-[var(--color-info-light)]";
      case "deliverable":
        return "bg-[var(--color-success-light)]";
      case "mention":
        return "bg-[var(--color-secondary-light)]";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Notification Panel */}
      <div className="absolute right-0 top-full mt-2 w-96 bg-[var(--color-surface)] rounded-lg shadow-[var(--shadow-lg)] border border-[var(--color-border)] z-50 max-h-[600px] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-light)] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Notifications</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {notifications.filter(n => !n.read).length} unread
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
              <p className="text-[var(--color-text-secondary)]">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  className={`w-full text-left p-4 hover:bg-[var(--color-surface-hover)] transition-colors ${
                    !notification.read ? "bg-[var(--color-surface-light)]" : "bg-transparent"
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${getBgColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium text-[var(--color-text-primary)] ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">{notification.message}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">{notification.time}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface-light)]">
          <button
            onClick={onClose}
            className="w-full text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
