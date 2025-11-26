"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Target, BarChart3, MessageSquare, Bell, CheckCircle } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

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

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-900">
            <span className="text-sm font-medium">Help</span>
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
