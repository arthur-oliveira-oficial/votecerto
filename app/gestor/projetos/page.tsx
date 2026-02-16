/**
 * Página de gerenciamento de projetos
 * Permite criar, editar e excluir projetos de votação
 * Acesso: Admin
 */

'use client';
import { useState, memo, useMemo } from 'react';
import { Header } from '@/components/header';

import { useProjetos } from '@/hooks/useProjetos';
import { useSessoes } from '@/hooks/useSessoes';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Toaster, toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, FolderKanban, DollarSign, Eye } from 'lucide-react';
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
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao_detalhada: z.string().optional(),
  autor_responsavel: z.string().optional(),
  sessao_id: z.number().min(1, 'Selecione uma sessão'),
});
type FormValues = z.infer<typeof formSchema>;
const ProjetoForm = memo(function ProjetoForm({
  aberto,
  aoFechar,
  aoSalvar,
  projetoInicial,
  sessoes,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (data: FormValues) => Promise<void>;
  projetoInicial?: {
    id: number;
    titulo: string;
    descricao_detalhada: string | null;
    autor_responsavel: string | null;
    sessao_id: number;
  } | null;
  sessoes: Array<{ id: number; titulo: string }>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: projetoInicial?.titulo || '',
      descricao_detalhada: projetoInicial?.descricao_detalhada || '',
      autor_responsavel: projetoInicial?.autor_responsavel || '',
      sessao_id: projetoInicial?.sessao_id || 0,
    },
  });
  const [salvando, setSalvando] = useState(false);
  const onSubmit = async (data: FormValues) => {
    setSalvando(true);
    try {
      await aoSalvar(data);
      aoFechar();
    } finally {
      setSalvando(false);
    }
  };
  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {projetoInicial ? 'Editar Projeto' : 'Novo Projeto'}
          </DialogTitle>
          <DialogDescription>
            {projetoInicial
              ? 'Edite os dados do projeto abaixo.'
              : 'Adicione um novo projeto à sessão.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título do projeto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao_detalhada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição completa do projeto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="autor_responsavel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sessao_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sessão</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value ? String(field.value) : ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma sessão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sessoes.map((sessao) => (
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={aoFechar}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : projetoInicial ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});
type ProjetoType = {
  id: number;
  titulo: string;
  descricao_detalhada: string | null;
  autor_responsavel: string | null;
  sessao_id: number;
  sessao?: { id: number; titulo: string };
  _count: { votos: number };
};
const ProjetoDetailDialog = memo(function ProjetoDetailDialog({
  projeto,
  aberto,
  aoFechar,
}: {
  projeto: ProjetoType | null;
  aberto: boolean;
  aoFechar: () => void;
}) {
  if (!projeto) return null;
  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{projeto.titulo}</DialogTitle>
          <DialogDescription>Detalhes do projeto</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Descricao</p>
            <p className="mt-1">{projeto.descricao_detalhada || 'Sem descricao'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Autor Responsavel</p>
            <p className="mt-1">{projeto.autor_responsavel || 'Nao informado'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Sessao</p>
            <p className="mt-1">{projeto.sessao?.titulo || 'Nao informada'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Votos</p>
            <p className="mt-1">{projeto._count.votos}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
const ProjetoTable = memo(function ProjetoTable({
  projetos,
  onEditar,
  onExcluir,
  onVisualizar,
  podeEditar,
}: {
  projetos: ProjetoType[];
  onEditar: (projeto: ProjetoType) => void;
  onExcluir: (id: number, titulo: string) => void;
  onVisualizar: (projeto: ProjetoType) => void;
  podeEditar: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Autor</TableHead>
          <TableHead>Sessão</TableHead>
          <TableHead>Votos</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projetos.map((projeto) => {
          return (
            <TableRow key={projeto.id}>
              <TableCell className="font-medium">{projeto.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{projeto.titulo}</p>
                  {projeto.descricao_detalhada && (
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {projeto.descricao_detalhada}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>{projeto.autor_responsavel || '-'}</TableCell>
              <TableCell>
                {projeto.sessao ? (
                  <Badge>{projeto.sessao.titulo}</Badge>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </TableCell>
              <TableCell>{projeto._count.votos}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onVisualizar(projeto)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {podeEditar && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => onEditar(projeto)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onExcluir(projeto.id, projeto.titulo)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
});
export default function ProjetosPage() {
  const { projetos, isLoading, criar, atualizar, excluir } = useProjetos();
  const { sessoes, isLoading: loadingSessoes } = useSessoes();
  const { isGestor } = useAuth();
  const [busca, setBusca] = useState('');
  const [filtroSessao, setFiltroSessao] = useState<string>('todas');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [projetoEditando, setProjetoEditando] = useState<{
    id: number;
    titulo: string;
    descricao_detalhada: string | null;
    autor_responsavel: string | null;
    sessao_id: number;
  } | null>(null);
  const [projetoVisualizando, setProjetoVisualizando] = useState<ProjetoType | null>(null);
  const [dialogVisualizarAberto, setDialogVisualizarAberto] = useState(false);
  const projetosFiltrados = useMemo(() => projetos.filter((p): p is ProjetoType => {
    const matchBusca =
      p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (p.autor_responsavel?.toLowerCase() || '').includes(busca.toLowerCase());
    const matchSessao =
      filtroSessao === 'todas' || p.sessao_id === parseInt(filtroSessao);
    return matchBusca && matchSessao;
  }), [projetos, busca, filtroSessao]);
  const totalVotos = useMemo(() => projetos.reduce((acc, p) => acc + p._count.votos, 0), [projetos]);
  const handleSalvar = async (data: FormValues) => {
    try {
      if (projetoEditando) {
        await atualizar.trigger({ id: projetoEditando.id, data: {
          ...data,
          descricao_detalhada: data.descricao_detalhada || null,
          autor_responsavel: data.autor_responsavel || null,
        } });
        toast.success('Projeto atualizado com sucesso');
      } else {
        await criar.trigger({
          ...data,
          descricao_detalhada: data.descricao_detalhada || null,
          autor_responsavel: data.autor_responsavel || null,
        });
        toast.success('Projeto criado com sucesso');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };
  const handleExcluir = async (id: number, titulo: string) => {
    if (confirm(`Tem certeza que deseja excluir "${titulo}"?`)) {
      try {
        await excluir.trigger(id);
        toast.success('Projeto excluído com sucesso');
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
  };
  const handleEditar = (projeto: typeof projetoEditando) => {
    setProjetoEditando(projeto);
    setDialogAberto(true);
  };
  const handleNovo = () => {
    setProjetoEditando(null);
    setDialogAberto(true);
  };
  const handleVisualizar = (projeto: typeof projetos[0]) => {
    setProjetoVisualizando(projeto);
    setDialogVisualizarAberto(true);
  };
  const handleDialogChange = (aberto: boolean) => {
    if (!aberto) {
      setProjetoEditando(null);
      setDialogAberto(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <Header titulo="Projetos" />
      <div className="px-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FolderKanban className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-bold">{projetos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Votos</p>
                  <p className="text-2xl font-bold">{totalVotos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-1 gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar projetos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filtroSessao} onValueChange={setFiltroSessao}>
              <SelectTrigger className="w-full sm:w-48">
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
          </div>
          {isGestor && (
            <Button onClick={handleNovo}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          )}
        </div>
        <Card>
          <CardContent className="p-0">
            {isLoading || loadingSessoes ? (
              <div className="p-8 text-center text-slate-500">
                Carregando projetos...
              </div>
            ) : projetosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {projetos.length === 0
                  ? 'Nenhum projeto cadastrado'
                  : 'Nenhum projeto encontrado'}
              </div>
            ) : (
              <ProjetoTable
                projetos={projetosFiltrados}
                onEditar={handleEditar}
                onExcluir={handleExcluir}
                onVisualizar={handleVisualizar}
                podeEditar={isGestor}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <ProjetoForm
        aberto={dialogAberto}
        aoFechar={() => handleDialogChange(false)}
        aoSalvar={handleSalvar}
        projetoInicial={projetoEditando}
        sessoes={sessoes}
      />
      <ProjetoDetailDialog
        projeto={projetoVisualizando}
        aberto={dialogVisualizarAberto}
        aoFechar={() => setDialogVisualizarAberto(false)}
      />
      <Toaster position="top-right" />
    </div>
    </div>
  );
}