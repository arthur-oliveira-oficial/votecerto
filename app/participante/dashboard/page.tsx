/**
 * Página principal do Dashboard Participante
 * Exibe estatísticas e ações rápidas para participantes
 */

'use client';
import { memo, useMemo } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessoes } from '@/hooks/useSessoes';
import { useVotos } from '@/hooks/useVotos';
import { useAuth } from '@/hooks/useAuth';
import { Vote, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = memo(function StatCard({ titulo, valor, icone: Icone, descricao, cor }: {
  titulo: string;
  valor: number;
  icone: React.ElementType;
  descricao: string;
  cor: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {titulo}
        </CardTitle>
        <Icone className={`h-5 w-5 ${cor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{valor}</div>
        <p className="text-xs text-slate-500 mt-1">{descricao}</p>
      </CardContent>
    </Card>
  );
});

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardParticipantePage() {
  const { sessoes, isLoading: loadingSessoes } = useSessoes();
  const { votos, isLoading: loadingVotos } = useVotos();
  const { usuario } = useAuth();

  const loading = loadingSessoes || loadingVotos;

  const sessoesAtivas = useMemo(() => sessoes.filter((s) => s.ativa).length, [sessoes]);
  const meusVotos = useMemo(() => {
    if (!usuario) return 0;
    return votos.filter((v) => v.usuario_id === usuario.id).length;
  }, [votos, usuario]);

  return (
    <div className="space-y-6">
      <Header titulo="Dashboard" />
      <div className="px-6 space-y-6">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              titulo="Sessões Ativas"
              valor={sessoesAtivas}
              icone={Vote}
              descricao={`${sessoes.length} sessões disponíveis`}
              cor="text-emerald-500"
            />
            <StatCard
              titulo="Meus Votos"
              valor={meusVotos}
              icone={FileText}
              descricao="Votos registrados"
              cor="text-amber-500"
            />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-500" />
                Sessões de Votação
              </CardTitle>
              <CardDescription>
                Participe das sessões ativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSessoes ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : sessoes.length === 0 ? (
                <p className="text-slate-500 text-center py-4">
                  Nenhuma sessão disponível no momento
                </p>
              ) : (
                <div className="space-y-3">
                  {sessoes.slice(0, 5).map((sessao) => (
                    <div
                      key={sessao.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{sessao.titulo}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(sessao.data_inicio).toLocaleDateString('pt-BR')} - {new Date(sessao.data_fim).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sessao.ativa
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sessao.ativa ? 'Ativa' : 'Encerrada'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Acesse rapidamente as principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <a
                href="/participante/sessoes"
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Vote className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Votar</p>
                  <p className="text-sm text-slate-500">Participe das votações</p>
                </div>
              </a>
              <a
                href="/participante/votos"
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Meus Votos</p>
                  <p className="text-sm text-slate-500">Veja seus votos registrados</p>
                </div>
              </a>
              <a
                href="/participante/perfil"
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Meu Perfil</p>
                  <p className="text-sm text-slate-500">Gerencie suas informações</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
