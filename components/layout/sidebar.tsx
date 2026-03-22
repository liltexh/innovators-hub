"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Video,
  GraduationCap,
  User,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authstore";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/courses", icon: BookOpen, label: "Courses" },
  { href: "/workshops", icon: Video, label: "Live Workshops" },
  { href: "/my-courses", icon: GraduationCap, label: "My Courses" },
  { href: "/profile", icon: User, label: "Profile" },
];

const creatorItems = [
  { href: "/create-course", icon: Plus, label: "Create Course" },
  { href: "/my-workshops", icon: Video, label: "My Workshops" },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isCreator = user?.user_metadata?.role === "creator";

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-out flex flex-col shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight">Innovators Hub</h1>
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-secondary transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-border">
            <p className="font-semibold">{user?.user_metadata.full_name}</p>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 text-xs font-mono rounded mt-1",
                isCreator
                  ? "bg-foreground text-primary-foreground"
                  : "bg-secondary"
              )}
            >
              {isCreator ? "Creator" : "Learner"}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onToggle}
              className={cn(
                "sidebar-link",
                pathname === item.href &&
                  "bg-foreground text-primary-foreground"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}

          {isCreator && (
            <>
              <div className="h-px bg-border mx-4 my-3" />
              <p className="px-4 py-2 font-mono text-xs text-muted-foreground">
                Creator
              </p>

              {creatorItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onToggle}
                  className={cn(
                    "sidebar-link",
                    pathname === item.href &&
                      "bg-foreground text-primary-foreground"
                  )}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            onToggle();
          }}
          className="sidebar-link border-t border-border mx-0 rounded-none hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-md border border-border hover:bg-secondary transition-colors"
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
  );
}
