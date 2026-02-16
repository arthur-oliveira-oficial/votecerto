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
} from 'lucide-react';

const navegacaoParticipante = [
  { href: '/participante/dashboard', label: 'Dashboard', icone: LayoutDashboard },
  { href: '/participante/comunidades', label: 'Comunidades', icone: UsersRound },
  { href: '/participante/sessoes', label: 'Sessões', icone: Vote },
  { href: '/participante/projetos', label: 'Projetos', icone: FolderKanban },
  { href: '/participante/votos', label: 'Meus Votos', icone: FileText },
  { href: '/participante/perfil', label: 'Meu Perfil', icone: User },
];

export function SidebarParticipante() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Vote className="h-8 w-8 text-emerald-400" />
          VoteCerto
        </h1>
        <p className="text-xs text-slate-400 mt-1">Área do Participante</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navegacaoParticipante.map((item) => {
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
