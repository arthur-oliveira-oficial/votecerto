'use client';

import { SidebarGestor } from '@/components/sidebar-gestor';

export default function LayoutGestor({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarGestor />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
