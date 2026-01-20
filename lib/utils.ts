import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts initials from a name (e.g. "John Doe" -> "JD")
 * Handles empty strings and single names safely.
 */
export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "?";
  
  const names = name.trim().split(/\s+/).filter(Boolean);
  if (names.length === 0) return "?";
  
  const first = names[0].charAt(0).toUpperCase();
  const last = names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : "";
  
  return `${first}${last}`;
}

/**
 * Formats a date string to relative time (e.g. "2 hours ago")
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
