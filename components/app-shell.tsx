'use client';

import Sidebar from '@/components/sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-72">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
