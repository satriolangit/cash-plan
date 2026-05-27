"use client";

import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-64">
        <div className="pb-20 md:pb-0">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
