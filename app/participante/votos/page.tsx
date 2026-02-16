/**
 * Página de gerenciamento de votos
 * Permite registrar votos e visualizar resultados
 * Acesso: Participantes e Admin
 */

'use client';
import { useState, useMemo } from 'react';
import { Header } from '@/components/header';

import { useVotos } from '@/hooks/useVotos';
import { useSessoes } from '@/hooks/useSessoes';
import { useAuth } from '@/hooks/useAuth';
import { useProjetos } from '@/hooks/useProjetos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { Textarea } from '@/components/ui/textarea';
import { mascararCpf } from '@/lib/utils';
import { Toaster, toast } from 'sonner';
import { Plus, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const formSchema = z.object({
  comentario: z.string().optional(),
  sessao_id: z.number().min(1, 'Selecione uma sessão'),
  projeto_id: z.number().min(1, 'Selecione um projeto'),
});
type FormValues = z.infer<typeof formSchema>;
function VotoForm({
  aberto,
  aoFechar,
  aoSalvar,
  sessoesComVoto,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (data: FormValues, usuarioId: number) => Promise<void>;
  sessoesComVoto: Set<number>;
}) {
  const [sessaoId, setSessaoId] = useState<number | null>(null);
  const { projetos } = useProjetos(sessaoId || undefined);
  const { sessoes } = useSessoes();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comentario: '',
      sessao_id: 0,
      projeto_id: 0,
    },
  });
  const [salvando, setSalvando] = useState(false);
  const onSubmit = async (data: FormValues) => {
    setSalvando(true);
    try {
      await aoSalvar(data, 0);
      aoFechar();
    } finally {
      setSalvando(false);
    }
  };
  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Voto</DialogTitle>
          <DialogDescription>
            Registre um novo voto para a sessão de votação.
          </DialogDescription>
        </DialogHeader>
        {sessaoId && sessoesComVoto.has(sessaoId) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700">
              <Lock className="h-4 w-4" />
              <p className="text-sm font-medium">
                Você já votou nesta sessão. Apenas um voto é permitido.
              </p>
            </div>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sessao_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sessão</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      setSessaoId(Number(value));
                      form.setValue('projeto_id', 0);
                    }}
                    defaultValue={field.value ? String(field.value) : ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma sessão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sessoes
                        .filter((s) => s.ativa)
                        .map((sessao) => (
                          <SelectItem key={sessao.id} value={String(sessao.id)}>
                            {sessao.titulo}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projeto_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projeto</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value ? String(field.value) : ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um projeto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projetos.map((projeto) => (
                        <SelectItem key={projeto.id} value={String(projeto.id)}>
                          {projeto.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comentario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione um comentário ao seu voto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={aoFechar}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Registrando…' : 'Registrar Voto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
export default function VotosPage() {
  const { votos, isLoading, criar } = useVotos();
  const { sessoes, isLoading: loadingSessoes } = useSessoes();
  const { projetos, isLoading: loadingProjetos } = useProjetos();
  const { usuarios, isLoading: loadingUsuarios } = useUsuarios();
  const { usuario, isParticipante } = useAuth();
  const [filtroSessao, setFiltroSessao] = useState<string>('todas');
  const [filtroProjeto, setFiltroProjeto] = useState<string>('todos');
  const [filtroParticipante, setFiltroParticipante] = useState<string>('todos');
  const [dialogAberto, setDialogAberto] = useState(false);
  const loading = isLoading || loadingSessoes || loadingUsuarios || loadingProjetos;
  const sessoesComVoto = useMemo(() => {
    if (!usuario || !isParticipante) return new Set<number>();
    return new Set(
      votos
        .filter((v) => v.usuario_id === usuario.id)
        .map((v) => v.sessao_id)
    );
  }, [votos, usuario, isParticipante]);
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
  const handleSalvar = async (data: FormValues) => {
    if (!usuario?.id) {
      toast.error('Usuário não autenticado');
      return;
    }
    try {
      await criar.trigger({
        ...data,
        comentario: data.comentario || '',
      });
      toast.success('Voto registrado com sucesso!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };
  const handleNovo = () => {
    setDialogAberto(true);
  };
  const handleDialogChange = (aberto: boolean) => {
    if (!aberto) {
      setDialogAberto(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <Header titulo="Votos" />
      <div className="px-6 space-y-6">
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
          <Button onClick={handleNovo}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Voto
          </Button>
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
                            CPF: {mascararCpf(voto.usuario?.cpf)}
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
      <VotoForm
        aberto={dialogAberto}
        aoFechar={() => handleDialogChange(false)}
        aoSalvar={handleSalvar}
        sessoesComVoto={sessoesComVoto}
      />
      <Toaster position="top-right" />
    </div>
    </div>
  );
}