/**
 * Página de gerenciamento de usuários
 * Permite criar, editar e excluir usuários do sistema
 * Acesso: Admin
 */

'use client';
import { useState, memo, useMemo } from 'react';
import { Header } from '@/components/header';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, UserCog, Shield, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password_hash: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  tipo: z.enum(['ADMIN', 'PARTICIPANTE']),
});

type FormValues = z.infer<typeof formSchema>;

const UsuarioForm = memo(function UsuarioForm({
  aberto,
  aoFechar,
  aoSalvar,
  usuarioInicial,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (data: FormValues) => Promise<void>;
  usuarioInicial?: {
    id: number;
    email: string;
    tipo: 'ADMIN' | 'PARTICIPANTE';
  } | null;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: usuarioInicial?.email || '',
      password_hash: '',
      tipo: usuarioInicial?.tipo || 'PARTICIPANTE',
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {usuarioInicial ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
          <DialogDescription>
            {usuarioInicial
              ? 'Edite os dados do usuário abaixo.'
              : 'Adicione um novo usuário ao sistema.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password_hash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {usuarioInicial && (
                    <p className="text-xs text-slate-500">
                      Deixe em branco para manter a senha atual
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="PARTICIPANTE">Participante</SelectItem>
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
                {salvando ? 'Salvando...' : usuarioInicial ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

export default function UsuariosAdminPage() {
  const { usuarios, isLoading, error, criar, atualizar, excluir } = useUsuarios();

  const [busca, setBusca] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<{
    id: number;
    email: string;
    tipo: 'ADMIN' | 'PARTICIPANTE';
  } | null>(null);

  const usuariosFiltrados = useMemo(() => usuarios.filter(
    (u) =>
      u.email.toLowerCase().includes(busca.toLowerCase()) ||
      u.tipo.toLowerCase().includes(busca.toLowerCase())
  ), [usuarios, busca]);

  const totalAdmins = useMemo(() => usuarios.filter((u) => u.tipo === 'ADMIN').length, [usuarios]);
  const totalParticipantes = useMemo(() => usuarios.filter((u) => u.tipo === 'PARTICIPANTE').length, [usuarios]);

  const handleSalvar = async (data: FormValues) => {
    try {
      if (usuarioEditando) {
        const dataUpdate: Partial<FormValues> = {
          email: data.email,
          tipo: data.tipo,
        };
        if (data.password_hash) {
          dataUpdate.password_hash = data.password_hash;
        }
        await atualizar.trigger({ id: usuarioEditando.id, data: dataUpdate });
        toast.success('Usuário atualizado com sucesso');
      } else {
        await criar.trigger(data);
        toast.success('Usuário criado com sucesso');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleExcluir = async (id: number, email: string) => {
    if (confirm(`Tem certeza que deseja excluir "${email}"?`)) {
      try {
        await excluir.trigger(id);
        toast.success('Usuário excluído com sucesso');
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
  };

  const handleEditar = (usuario: typeof usuarioEditando) => {
    setUsuarioEditando(usuario);
    setDialogAberto(true);
  };

  const handleNovo = () => {
    setUsuarioEditando(null);
    setDialogAberto(true);
  };

  const handleDialogChange = (aberto: boolean) => {
    if (!aberto) {
      setUsuarioEditando(null);
      setDialogAberto(false);
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <Header titulo="Usuários" />
      <div className="px-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <UserCog className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-bold">{usuarios.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Administradores</p>
                  <p className="text-2xl font-bold">{totalAdmins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Participantes</p>
                  <p className="text-2xl font-bold">{totalParticipantes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar usuários..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleNovo} className="ml-4">
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">
                Carregando usuários...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                Erro ao carregar usuários. Tente novamente.
                <br />
                <span className="text-sm text-slate-400">{error.message}</span>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {usuarios.length === 0
                  ? 'Nenhum usuário cadastrado'
                  : 'Nenhum usuário encontrado'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>{usuario.id}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            usuario.tipo === 'ADMIN' ? 'default' : 'secondary'
                          }
                        >
                          {usuario.tipo === 'ADMIN' ? 'Admin' : 'Participante'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatarData(usuario.data_criacao)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditar(usuario)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleExcluir(usuario.id, usuario.email)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <UsuarioForm
        aberto={dialogAberto}
        aoFechar={() => handleDialogChange(false)}
        aoSalvar={handleSalvar}
        usuarioInicial={usuarioEditando}
      />
      <Toaster position="top-right" />
    </div>
  );
}
