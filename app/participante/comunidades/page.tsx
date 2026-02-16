/**
 * Página de gerenciamento de comunidades
 * Permite criar, editar, excluir e ingressar em comunidades
 * Acesso: Admin e Gestor
 */

'use client';
import { useState, memo, useEffect } from 'react';
import { Header } from '@/components/header';
import { useComunidades, useMinhasComunidades } from '@/hooks/useComunidades';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import { Plus, Users, CheckCircle, DoorOpen, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
const criarSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  descricao: z.string().optional(),
});
const ingressarSchema = z.object({
  codigo: z.string().min(6, 'Código deve ter no mínimo 6 caracteres'),
});
type CriarValues = z.infer<typeof criarSchema>;
type IngressarValues = z.infer<typeof ingressarSchema>;
function CriarComunidadeForm({
  aberto,
  aoFechar,
  aoSalvar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (data: CriarValues) => Promise<void>;
}) {
  const form = useForm<CriarValues>({
    resolver: zodResolver(criarSchema),
    defaultValues: {
      nome: '',
      descricao: '',
    },
  });
  const [salvando, setSalvando] = useState(false);
  const onSubmit = async (data: CriarValues) => {
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
          <DialogTitle>Nova Comunidade</DialogTitle>
          <DialogDescription>
            Crie uma nova comunidade para gerenciar sessões e participantes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da comunidade" {...field} />
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
                    <Textarea placeholder="Descrição da comunidade (opcional)" {...field} />
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
                {salvando ? 'Criando...' : 'Criar Comunidade'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
const CriarFormMemo = memo(CriarComunidadeForm);
function IngressarComunidadeForm({
  aberto,
  aoFechar,
  aoSalvar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (data: IngressarValues) => Promise<void>;
}) {
  const form = useForm<IngressarValues>({
    resolver: zodResolver(ingressarSchema),
    defaultValues: {
      codigo: '',
    },
  });
  const [salvando, setSalvando] = useState(false);
  const onSubmit = async (data: IngressarValues) => {
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Ingressar em Comunidade</DialogTitle>
          <DialogDescription>
            Digite o código de convite fornecido pelo gestor.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Convite</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="XXXXXX"
                      {...field}
                      className="uppercase tracking-widest text-center text-lg font-bold"
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
                {salvando ? 'Ingressando...' : 'Ingressar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
const IngressarFormMemo = memo(IngressarComunidadeForm);
function EditarComunidadeForm({
  aberto,
  aoFechar,
  comunidade,
  aoSalvar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  comunidade: { id: number; nome: string; descricao: string | null } | null;
  aoSalvar: (id: number, data: CriarValues) => Promise<void>;
}) {
  const form = useForm<CriarValues>({
    resolver: zodResolver(criarSchema),
    defaultValues: {
      nome: '',
      descricao: '',
    },
  });
  const [salvando, setSalvando] = useState(false);
  useEffect(() => {
    if (comunidade) {
      form.reset({
        nome: comunidade.nome,
        descricao: comunidade.descricao || '',
      });
    }
  }, [comunidade, form]);
  const onSubmit = async (data: CriarValues) => {
    if (!comunidade) return;
    setSalvando(true);
    try {
      await aoSalvar(comunidade.id, data);
      aoFechar();
    } finally {
      setSalvando(false);
    }
  };
  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Comunidade</DialogTitle>
          <DialogDescription>
            Altere os dados da comunidade.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da comunidade" {...field} />
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
                    <Textarea placeholder="Descrição da comunidade (opcional)" {...field} />
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
                {salvando ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
const EditarFormMemo = memo(EditarComunidadeForm);
function ComunidadeCard({
  comunidade,
  isAdmin,
  usuarioId,
  onEditar,
  onExcluir,
}: {
  comunidade: {
    id: number;
    nome: string;
    descricao: string | null;
    codigo: string;
    data_criacao: string;
    criador_id?: number | null;
    _count?: { membros: number; sessoes: number };
  };
  isAdmin: boolean;
  usuarioId?: number | null;
  onEditar: (comunidade: { id: number; nome: string; descricao: string | null }) => void;
  onExcluir: (id: number) => void;
}) {
  return (
    <Card className="relative transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{comunidade.nome}</CardTitle>
            <CardDescription className="line-clamp-2">
              {comunidade.descricao || 'Sem descrição'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditar(comunidade)}
                  title="Editar comunidade"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onExcluir(comunidade.id)}
                  title="Excluir comunidade"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
            <Badge variant="outline">Comunidade</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{comunidade._count?.membros ?? 0} membros</span>
          </div>
          <div className="flex items-center gap-1">
            <DoorOpen className="h-4 w-4" />
            <span>{comunidade._count?.sessoes ?? 0} sessões</span>
          </div>
        </div>
        {(isAdmin || comunidade.criador_id === usuarioId) && (
          <p className="text-xs text-slate-400 pt-2 border-t">
            Criado em {new Date(comunidade.data_criacao).toLocaleDateString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
const ComunidadeCardMemo = memo(ComunidadeCard);
export default function ComunidadesPage() {
  const { comunidades: comunidadesDoUsuario, isLoading, ingressar } = useMinhasComunidades();
  const { comunidades: todasComunidades, criar, atualizar, excluir, isLoading: loadingTodas } = useComunidades();
  const { usuario, isAdmin, isGestor } = useAuth();
  const [dialogCriarAberto, setDialogCriarAberto] = useState(false);
  const [dialogIngressarAberto, setDialogIngressarAberto] = useState(false);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [comunidadeSelecionada, setComunidadeSelecionada] = useState<{
    id: number;
    nome: string;
    descricao: string | null;
  } | null>(null);
  const podeCriar = isGestor && !isAdmin;
  const comunidades = isAdmin ? todasComunidades : comunidadesDoUsuario;
  const isLoadingComunidades = isAdmin ? loadingTodas : isLoading;
  const handleCriar = async (data: CriarValues) => {
    try {
      await criar.trigger({
        nome: data.nome,
        descricao: data.descricao || undefined,
      });
      toast.success('Comunidade criada com sucesso');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };
  const handleIngressar = async (data: IngressarValues) => {
    try {
      await ingressar.trigger({ codigo: data.codigo.toUpperCase() });
      toast.success('Você ingressou na comunidade com sucesso!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };
  const handleEditar = (comunidade: { id: number; nome: string; descricao: string | null }) => {
    setComunidadeSelecionada(comunidade);
    setDialogEditarAberto(true);
  };
  const handleSalvarEdicao = async (id: number, data: CriarValues) => {
    try {
      await atualizar.trigger({
        id,
        data: {
          nome: data.nome,
          descricao: data.descricao || null,
        },
      });
      toast.success('Comunidade atualizada com sucesso');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };
  const handleExcluir = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta comunidade?')) return;
    try {
      await excluir.trigger(id);
      toast.success('Comunidade excluída com sucesso');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };
  return (
    <div className="space-y-6">
      <Header titulo="Comunidades" />
      <div className="px-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-bold">{comunidades.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DoorOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Sessões</p>
                  <p className="text-2xl font-bold">
                    {comunidades.reduce((acc, c) => acc + (c._count?.sessoes ?? 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Membros</p>
                  <p className="text-2xl font-bold">
                    {comunidades.reduce((acc, c) => acc + (c._count?.membros ?? 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Minhas Comunidades ({comunidades.length})
          </h2>
          <div className="flex gap-2">
            {!isAdmin && (
              <Button
                variant="outline"
                onClick={() => setDialogIngressarAberto(true)}
              >
                <DoorOpen className="h-4 w-4 mr-2" />
                Ingressar
              </Button>
            )}
            {podeCriar && (
              <Button onClick={() => setDialogCriarAberto(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Comunidade
              </Button>
            )}
          </div>
        </div>
        {isLoadingComunidades ? (
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
        ) : comunidades.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">
                {podeCriar
                  ? 'Você ainda não criou nenhuma comunidade'
                  : 'Você ainda não faz parte de nenhuma comunidade'}
              </p>
              {podeCriar ? (
                <Button onClick={() => setDialogCriarAberto(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Comunidade
                </Button>
              ) : !isAdmin && (
                <Button onClick={() => setDialogIngressarAberto(true)}>
                  <DoorOpen className="h-4 w-4 mr-2" />
                  Ingressar com Código
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {comunidades.map((comunidade) => (
              <ComunidadeCardMemo
                key={comunidade.id}
                comunidade={comunidade}
                isAdmin={isAdmin}
                usuarioId={usuario?.id}
                onEditar={handleEditar}
                onExcluir={handleExcluir}
              />
            ))}
          </div>
        )}
      </div>
      <CriarFormMemo
        aberto={dialogCriarAberto}
        aoFechar={() => setDialogCriarAberto(false)}
        aoSalvar={handleCriar}
      />
      <IngressarFormMemo
        aberto={dialogIngressarAberto}
        aoFechar={() => setDialogIngressarAberto(false)}
        aoSalvar={handleIngressar}
      />
      <EditarFormMemo
        aberto={dialogEditarAberto}
        aoFechar={() => {
          setDialogEditarAberto(false);
          setComunidadeSelecionada(null);
        }}
        comunidade={comunidadeSelecionada}
        aoSalvar={handleSalvarEdicao}
      />
      <Toaster position="top-right" />
    </div>
  );
}