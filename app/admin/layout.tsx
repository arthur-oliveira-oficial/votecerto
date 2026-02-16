'use client';

import { SidebarAdmin } from '@/components/sidebar-admin';

export default function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarAdmin />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
