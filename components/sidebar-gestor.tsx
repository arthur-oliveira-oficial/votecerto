'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Vote,
  FolderKanban,
  FileText,
  UsersRound,
  User,
  BarChart3,
} from 'lucide-react';

const navegacaoGestor = [
  { href: '/gestor/dashboard', label: 'Dashboard', icone: LayoutDashboard },
  { href: '/gestor/comunidades', label: 'Comunidades', icone: UsersRound },
  { href: '/gestor/sessoes', label: 'Sessões', icone: Vote },
  { href: '/gestor/projetos', label: 'Projetos', icone: FolderKanban },
  { href: '/gestor/votos', label: 'Votos', icone: FileText },
  { href: '/gestor/relatorios/votos', label: 'Relatórios', icone: BarChart3 },
  { href: '/gestor/perfil', label: 'Meu Perfil', icone: User },
];

export function SidebarGestor() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Vote className="h-8 w-8 text-emerald-400" />
          VoteCerto
        </h1>
        <p className="text-xs text-slate-400 mt-1">Área do Gestor</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navegacaoGestor.map((item) => {
          const Icone = item.icone;
          const isAtivo = pathname === item.href ||
            pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isAtivo
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icone className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
