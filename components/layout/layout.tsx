"use client";
import { useState, ReactNode } from "react";
import { Sidebar, SidebarTrigger } from "./sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <SidebarTrigger onClick={() => setSidebarOpen(true)} />
          <h2 className="font-semibold text-lg">Innovators Hub</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
