/**
 * Página de gerenciamento de votos
 * Permite registrar votos e visualizar resultados
 * Acesso: Participantes e Admin
 */

'use client';
import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { mascararCpf } from '@/lib/utils';

import { useVotos } from '@/hooks/useVotos';
import { useSessoes } from '@/hooks/useSessoes';
import { useAuth } from '@/hooks/useAuth';
import { useProjetos } from '@/hooks/useProjetos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import { Vote } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
export default function VotosPage() {
  const { votos, isLoading, criar } = useVotos();
  const { sessoes, isLoading: loadingSessoes } = useSessoes();
  const { projetos, isLoading: loadingProjetos } = useProjetos();
  const { usuarios, isLoading: loadingUsuarios } = useUsuarios();
  const { isParticipante } = useAuth();
  const [filtroSessao, setFiltroSessao] = useState<string>('todas');
  const [filtroProjeto, setFiltroProjeto] = useState<string>('todos');
  const [filtroParticipante, setFiltroParticipante] = useState<string>('todos');
  const loading = isLoading || loadingSessoes || loadingUsuarios || loadingProjetos;
  const votosFiltrados = useMemo(() => votos.filter((v) => {
    const matchSessao =
      filtroSessao === 'todas' || v.sessao_id === parseInt(filtroSessao);
    const matchProjeto =
      filtroProjeto === 'todos' || v.projeto_id === parseInt(filtroProjeto);
    const matchParticipante =
      filtroParticipante === 'todos' ||
      v.usuario_id === parseInt(filtroParticipante);
    return matchSessao && matchProjeto && matchParticipante;
  }), [votos, filtroSessao, filtroProjeto, filtroParticipante]);
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <Header titulo="Votos" />
      <div className="px-6 space-y-6">
        {isParticipante && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Vote className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">
                    Lembre-se: Você pode votar apenas uma vez por sessão!
                  </p>
                  <p className="text-sm text-blue-700">
                    Após votar, você poderá visualizar os resultados parciais desta sessão.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Select value={filtroSessao} onValueChange={setFiltroSessao}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas as sessões" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as sessões</SelectItem>
                {sessoes.map((sessao) => (
                  <SelectItem key={sessao.id} value={String(sessao.id)}>
                    {sessao.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroProjeto} onValueChange={setFiltroProjeto}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os projetos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os projetos</SelectItem>
                {projetos.map((projeto) => (
                  <SelectItem key={projeto.id} value={String(projeto.id)}>
                    {projeto.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroParticipante} onValueChange={setFiltroParticipante}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os usuários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">
                  Todos os usuários
                </SelectItem>
                {usuarios.map((usuario) => (
                  <SelectItem
                    key={usuario.id}
                    value={String(usuario.id)}
                  >
                    {usuario.nome || usuario.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Carregando votos...
              </div>
            ) : votosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {votos.length === 0
                  ? 'Nenhum voto registrado'
                  : 'Nenhum voto encontrado com os filtros aplicados'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Participante</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Sessão</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Comentário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {votosFiltrados.map((voto) => (
                    <TableRow key={voto.id}>
                      <TableCell className="font-medium">{voto.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {voto.usuario?.nome || '-'}
                          </p>
                          <p className="text-sm text-slate-500">
                            CPF: {voto.usuario?.cpf ? mascararCpf(voto.usuario.cpf) : '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {voto.projeto?.titulo || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{voto.sessao?.titulo || '-'}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(voto.data_voto).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {voto.comentario || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster position="top-right" />
    </div>
    </div>
  );
}