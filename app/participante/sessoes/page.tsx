/**
 * Página de gerenciamento de sessões de votação
 * Permite criar, editar e excluir sessões de votação
 * Acesso: Admin e Gestor
 */

'use client';
import { useState, memo, useMemo, useCallback, useEffect } from 'react';
import { Header } from '@/components/header';
import { useSessoes } from '@/hooks/useSessoes';
import { useMinhasComunidades } from '@/hooks/useComunidades';
import { useAuth } from '@/hooks/useAuth';
import { useVotos } from '@/hooks/useVotos';
import { ResultadosParciais } from '@/components/resultados-parciais';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import { Plus, Pencil, Trash2, Calendar, Clock, Users, FolderKanban, CheckCircle, BarChart3 } from 'lucide-react';
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
import { cn } from '@/lib/utils';

const formSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  comunidade_id: z.number().optional(),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_fim: z.string().min(1, 'Data de fim é obrigatória'),
  ativa: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

function SessaoForm({
  aberto,
  aoFechar,
  aoSalvar,
  sessaoInicial,
  comunidades,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (data: FormValues) => Promise<void>;
  sessaoInicial?: {
    id: number;
    titulo: string;
    descricao: string | null;
    comunidade_id?: number | null | undefined;
    data_inicio: string;
    data_fim: string;
    ativa: boolean;
  } | null;
  comunidades: Array<{ id: number; nome: string }>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: sessaoInicial?.titulo || '',
      descricao: sessaoInicial?.descricao || '',
      comunidade_id: sessaoInicial?.comunidade_id || undefined,
      data_inicio: sessaoInicial
        ? new Date(sessaoInicial.data_inicio).toISOString().slice(0, 16)
        : '',
      data_fim: sessaoInicial
        ? new Date(sessaoInicial.data_fim).toISOString().slice(0, 16)
        : '',
      ativa: sessaoInicial?.ativa ?? true,
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
            {sessaoInicial ? 'Editar Sessão' : 'Nova Sessão'}
          </DialogTitle>
          <DialogDescription>
            {sessaoInicial
              ? 'Edite os dados da sessão abaixo.'
              : 'Crie uma nova sessão de votação.'}
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
                    <Input placeholder="Título da sessão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição da sessão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {comunidades.length > 0 && (
              <FormField
                control={form.control}
                name="comunidade_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comunidade</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma comunidade (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {comunidades.map((comunidade) => (
                          <SelectItem key={comunidade.id} value={String(comunidade.id)}>
                            {comunidade.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Fim</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="ativa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Ativa</SelectItem>
                      <SelectItem value="false">Inativa</SelectItem>
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
                {salvando ? 'Salvando...' : sessaoInicial ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const SessaoFormMemo = memo(SessaoForm);

const SessaoStatus = memo(function SessaoStatus({
  data_fim,
  ativa,
}: {
  data_fim: string;
  ativa: boolean;
}) {
  const [encerrada, setEncerrada] = useState(false);

  useEffect(() => {
    const verificarEncerramento = () => {
      const fim = new Date(data_fim).getTime();
      const agora = Date.now();
      setEncerrada(fim < agora);
    };
    verificarEncerramento();
    const intervalo = setInterval(verificarEncerramento, 60000);
    return () => clearInterval(intervalo);
  }, [data_fim]);

  if (encerrada) {
    return <Badge className="bg-amber-500">Encerrada</Badge>;
  }
  if (!ativa) {
    return <Badge className="bg-slate-400">Inativa</Badge>;
  }
  return <Badge className="bg-emerald-500">Ativa</Badge>;
});

function SessaoCard({
  sessao,
  usuarioLogadoId,
  usuarioLogadoTipo,
  onEditar,
  onExcluir,
  isParticipante,
  usuarioJaVotou,
  onVerResultados,
}: {
  sessao: {
    id: number;
    titulo: string;
    descricao: string | null;
    data_inicio: string;
    data_fim: string;
    ativa: boolean;
    criador_id?: number;
    _count?: { projetos: number; votos: number };
  };
  usuarioLogadoId: number | undefined;
  usuarioLogadoTipo?: string;
  onEditar: () => void;
  onExcluir: () => void;
  isParticipante?: boolean;
  usuarioJaVotou?: boolean;
  onVerResultados?: () => void;
}) {
  const dataInicio = useMemo(() => new Date(sessao.data_inicio), [sessao.data_inicio]);

  return (
    <Card className={cn(
      'relative transition-all hover:shadow-md',
      !sessao.ativa && 'opacity-75'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{sessao.titulo}</CardTitle>
            <CardDescription className="line-clamp-2">
              {sessao.descricao || 'Sem descrição'}
            </CardDescription>
          </div>
          <SessaoStatus data_fim={sessao.data_fim} ativa={sessao.ativa} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{dataInicio.toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-slate-600">
            <FolderKanban className="h-4 w-4" />
            <span>{sessao._count?.projetos ?? 0} projetos</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <Users className="h-4 w-4" />
            <span>{sessao._count?.votos ?? 0} votos</span>
          </div>
        </div>
        {(usuarioLogadoTipo === 'ADMIN' || sessao.criador_id === usuarioLogadoId) && (
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={onEditar}>
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExcluir}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
        )}
        {isParticipante && usuarioJaVotou && onVerResultados && (
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={onVerResultados} className="w-full">
              <BarChart3 className="h-4 w-4 mr-1" />
              Ver Resultados
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const SessaoCardMemo = memo(SessaoCard);

export default function SessoesAdminPage() {
  const { sessoes, isLoading, criar, atualizar, excluir } = useSessoes();
  const { comunidades: comunidadesDoUsuario } = useMinhasComunidades();
  const { usuario, isAdmin, isGestor, isParticipante } = useAuth();
  const { votos } = useVotos();

  const usuarioLogadoId = usuario?.id;
  const usuarioLogadoTipo = usuario?.tipo;
  const podeCriar = isAdmin || isGestor;

  const [dialogAberto, setDialogAberto] = useState(false);
  const [sessaoResultadosId, setSessaoResultadosId] = useState<number | null>(null);

  const sessoesComVoto = useMemo(() => {
    if (!usuario || !isParticipante) return new Set<number>();
    return new Set(
      votos
        .filter((v) => v.usuario_id === usuario.id)
        .map((v) => v.sessao_id)
    );
  }, [votos, usuario, isParticipante]);
  const [sessaoEditando, setSessaoEditando] = useState<{
    id: number;
    titulo: string;
    descricao: string | null;
    comunidade_id?: number | null | undefined;
    data_inicio: string;
    data_fim: string;
    ativa: boolean;
  } | null>(null);

  const comunidades = isAdmin
    ? comunidadesDoUsuario.flatMap((c) => [{ id: c.id, nome: c.nome }])
    : comunidadesDoUsuario.map((c) => ({ id: c.id, nome: c.nome }));

  const handleSalvar = async (data: FormValues) => {
    try {
      if (sessaoEditando) {
        await atualizar.trigger({ id: sessaoEditando.id, data: {
          titulo: data.titulo,
          descricao: data.descricao || null,
          comunidade_id: data.comunidade_id,
          data_inicio: data.data_inicio,
          data_fim: data.data_fim,
          ativa: data.ativa,
        } });
        toast.success('Sessão atualizada com sucesso');
      } else {
        await criar.trigger({
          titulo: data.titulo,
          descricao: data.descricao || null,
          comunidade_id: data.comunidade_id,
          data_inicio: data.data_inicio,
          data_fim: data.data_fim,
          ativa: data.ativa,
        });
        toast.success('Sessão criada com sucesso');
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
        toast.success('Sessão excluída com sucesso');
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
  };

  const handleEditar = useCallback((sessao: typeof sessaoEditando) => {
    setSessaoEditando(sessao);
    setDialogAberto(true);
  }, []);

  const handleNovo = useCallback(() => {
    setSessaoEditando(null);
    setDialogAberto(true);
  }, []);

  const handleDialogChange = useCallback((aberto: boolean) => {
    if (!aberto) {
      setSessaoEditando(null);
      setDialogAberto(false);
    }
  }, []);

  const sessoesAtivas = useMemo(() => sessoes.filter((s) => s.ativa).length, [sessoes]);
  const sessoesEncerradas = useMemo(() => sessoes.length - sessoesAtivas, [sessoes, sessoesAtivas]);

  return (
    <div className="space-y-6">
      <Header titulo="Sessões de Votação" />
      <div className="px-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-bold">{sessoes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Ativas</p>
                  <p className="text-2xl font-bold">{sessoesAtivas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Encerradas</p>
                  <p className="text-2xl font-bold">{sessoesEncerradas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Sessões ({sessoes.length})
          </h2>
          {podeCriar && (
            <Button onClick={handleNovo}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sessão
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sessoes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">Nenhuma sessão de votação encontrada</p>
              {podeCriar && (
                <Button onClick={handleNovo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Sessão
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessoes.map((sessao) => (
              <SessaoCardMemo
                key={sessao.id}
                sessao={sessao}
                usuarioLogadoId={usuarioLogadoId}
                usuarioLogadoTipo={usuarioLogadoTipo}
                onEditar={() => handleEditar(sessao)}
                onExcluir={() => handleExcluir(sessao.id, sessao.titulo)}
                isParticipante={isParticipante}
                usuarioJaVotou={sessoesComVoto.has(sessao.id)}
                onVerResultados={() => setSessaoResultadosId(sessao.id)}
              />
            ))}
          </div>
        )}
      </div>

      <SessaoFormMemo
        aberto={dialogAberto}
        aoFechar={() => handleDialogChange(false)}
        aoSalvar={handleSalvar}
        sessaoInicial={sessaoEditando}
        comunidades={comunidades}
      />

      <Dialog open={sessaoResultadosId !== null} onOpenChange={(open) => !open && setSessaoResultadosId(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resultados da Votação</DialogTitle>
            <DialogDescription>
              Veja os resultados parciais desta sessão de votação.
            </DialogDescription>
          </DialogHeader>
          {sessaoResultadosId && (
            <ResultadosParciais sessao_id={sessaoResultadosId} />
          )}
        </DialogContent>
      </Dialog>

      <Toaster position="top-right" />
    </div>
  );
}
