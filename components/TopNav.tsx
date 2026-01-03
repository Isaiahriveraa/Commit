'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, User, ChevronDown } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

type Notification = {
  id: string;
  type: 'help-request' | 'deadline' | 'agreement' | 'deliverable' | 'mention';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
};

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Agreements', href: '/agreements' },
  { name: 'Deliverables', href: '/deliverables' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Updates', href: '/updates' },
];

export default function TopNav() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'help-request',
      title: 'Help Request from Mike Ross',
      message: 'Need assistance with database migration errors',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: '2',
      type: 'deadline',
      title: 'Deadline Approaching',
      message: 'Database Schema Design is due in 2 days',
      time: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      type: 'agreement',
      title: 'New Agreement to Sign',
      message: 'Work Hours & Availability agreement needs your signature',
      time: '3 hours ago',
      read: false,
    },
    {
      id: '4',
      type: 'deliverable',
      title: 'Deliverable Assigned',
      message: "You've been assigned to API Endpoints v1",
      time: 'Yesterday',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] z-[var(--z-fixed)]">
      <div className="flex items-center justify-between h-full px-6 max-w-[1920px] mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xl font-bold text-[var(--color-primary)]">Commit</span>
        </Link>

        {/* Navigation Tabs - Center */}
        <div className="flex items-center gap-1 bg-[var(--color-surface-alt)] rounded-lg p-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-[var(--transition-fast)] ${
                  isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:outline-none transition-colors"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-border-hover)] transition-colors relative"
            >
              <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-primary)] rounded-full text-[10px] font-bold flex items-center justify-center text-white">
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

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-border-hover)] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold">
                SC
              </div>
              <span className="text-sm text-[var(--color-text-primary)] hidden sm:inline">
                Sarah Chen
              </span>
              <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-surface)] rounded-lg shadow-[var(--shadow-lg)] border border-[var(--color-border)] z-50 py-1">
                  <button className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors">
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors">
                    Help & Support
                  </button>
                  <div className="border-t border-[var(--color-border)] my-1" />
                  <button className="w-full px-4 py-2 text-left text-sm text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-colors">
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
