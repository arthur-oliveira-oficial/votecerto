'use client';

import { SidebarParticipante } from '@/components/sidebar-participante';

export default function LayoutParticipante({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarParticipante />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
