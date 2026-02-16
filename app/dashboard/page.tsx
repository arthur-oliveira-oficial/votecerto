'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { usuario, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && usuario) {
      switch (usuario.tipo) {
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'GESTOR':
          router.push('/gestor/dashboard');
          break;
        case 'PARTICIPANTE':
          router.push('/participante/dashboard');
          break;
        default:
          router.push('/');
      }
    }
  }, [usuario, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600">Carregando...</div>
    </div>
  );
}
