'use client';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
interface HeaderProps {
  titulo: string;
}
export function Header({ titulo }: HeaderProps) {
  const { usuario, isLoading, isAdmin, isGestor, isParticipante } = useAuth();
  const nomeExibicao = isAdmin && usuario?.nome
    ? usuario.nome.split(' ')[0]
    : isGestor && usuario?.nome
      ? usuario.nome.split(' ')[0]
      : isParticipante && usuario?.nome
        ? usuario.nome.split(' ')[0]
        : 'Usuário';
  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'DELETE',
      credentials: 'include',
    });
    window.location.href = '/';
  };
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-slate-900">{titulo}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {isLoading ? 'Carregando...' : nomeExibicao}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}