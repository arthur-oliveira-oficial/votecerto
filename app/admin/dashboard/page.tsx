/**
 * Página principal do Dashboard Admin
 * Exibe estatísticas gerais e ações rápidas do sistema
 */

'use client';
import { memo, useMemo, Suspense } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardEstatisticas } from '@/hooks/useDashboardEstatisticas';
import { Users, Vote, FolderKanban, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
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
      {[1, 2, 3, 4].map((i) => (
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

export default function DashboardAdminPage() {
  const { usuarios, sessoes, projetos, votos, isLoading: loading } = useDashboardEstatisticas();

  const sessoesAtivas = useMemo(() => sessoes.filter((s) => s.ativa).length, [sessoes]);
  const totalVotos = useMemo(() => votos.length, [votos]);
  const totalProjetos = useMemo(() => projetos.length, [projetos]);

  return (
    <div className="space-y-6">
      <Header titulo="Dashboard" />
      <Suspense fallback={<LoadingSkeleton />}>
      <div className="px-6 space-y-6">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              titulo="Usuários"
              valor={usuarios.length}
              icone={Users}
              descricao="Total de usuários participantes"
              cor="text-blue-500"
            />
            <StatCard
              titulo="Sessões Ativas"
              valor={sessoesAtivas}
              icone={Vote}
              descricao={`${sessoes.length} sessões no total`}
              cor="text-emerald-500"
            />
            <StatCard
              titulo="Projetos"
              valor={totalProjetos}
              icone={FolderKanban}
              descricao="Projetos cadastrados"
              cor="text-purple-500"
            />
            <StatCard
              titulo="Votos"
              valor={totalVotos}
              icone={FileText}
              descricao="Votos registrados no sistema"
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
                Sessões ativas e recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : sessoes.length === 0 ? (
                <p className="text-slate-500 text-center py-4">
                  Nenhuma sessão encontrada
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
                href="/admin/usuarios"
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Gerenciar Usuários</p>
                  <p className="text-sm text-slate-500">Adicione ou edite usuários</p>
                </div>
              </a>
              <a
                href="/admin/sessoes"
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Vote className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Criar Sessão</p>
                  <p className="text-sm text-slate-500">Inicie uma nova sessão de votação</p>
                </div>
              </a>
              <a
                href="/admin/projetos"
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FolderKanban className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Gerenciar Projetos</p>
                  <p className="text-sm text-slate-500">Cadastre ou edite projetos</p>
                </div>
              </a>
              <a
                href="/admin/votos"
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Ver Votos</p>
                  <p className="text-sm text-slate-500">Consulte os votos registrados</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
      </Suspense>
    </div>
  );
}
