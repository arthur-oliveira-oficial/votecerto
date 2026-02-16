/**
 * Página de perfil do Gestor
 * Permite visualizar e editar informações do usuário logado
 */

'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { useAuth } from '@/hooks/useAuth';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Toaster, toast } from 'sonner';
import { User, Mail, Shield, Pencil, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schemas de validação
const nomeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
});

const cpfSchema = z.object({
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Formato: XXX.XXX.XXX-XX'),
});

const emailSchema = z.object({
  email: z.string().email('Email inválido'),
});

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
  novaSenha: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type NomeFormValues = z.infer<typeof nomeSchema>;
type CpfFormValues = z.infer<typeof cpfSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;
type SenhaFormValues = z.infer<typeof senhaSchema>;

// Máscara de CPF
function mascaraCPF(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export default function PerfilGestorPage() {
  const { usuario, isLoading: isLoadingAuth, mutate: mutateAuth } = useAuth();
  const { atualizar } = useUsuarios();

  // Estados para diálogos
  const [dialogNomeAberto, setDialogNomeAberto] = useState(false);
  const [dialogCpfAberto, setDialogCpfAberto] = useState(false);
  const [dialogEmailAberto, setDialogEmailAberto] = useState(false);
  const [dialogSenhaAberto, setDialogSenhaAberto] = useState(false);

  // Estados para carregamento
  const [salvandoNome, setSalvandoNome] = useState(false);
  const [salvandoCpf, setSalvandoCpf] = useState(false);
  const [salvandoEmail, setSalvandoEmail] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // Estados para mostrar/ocultar senha
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  // Formulário de nome
  const formNome = useForm<NomeFormValues>({
    resolver: zodResolver(nomeSchema),
    defaultValues: { nome: '' },
  });

  // Formulário de CPF
  const formCpf = useForm<CpfFormValues>({
    resolver: zodResolver(cpfSchema),
    defaultValues: { cpf: '' },
  });

  // Formulário de email
  const formEmail = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  // Formulário de senha
  const formSenha = useForm<SenhaFormValues>({
    resolver: zodResolver(senhaSchema),
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    },
  });

  // Atualiza valores iniciais quando o usuário carrega
  useEffect(() => {
    if (usuario) {
      formNome.reset({ nome: usuario.nome || '' });
      formCpf.reset({ cpf: usuario.cpf || '' });
      formEmail.reset({ email: usuario.email });
    }
  }, [usuario, formNome, formCpf, formEmail]);

  // Handlers de salvamento
  const onSalvarNome = async (data: NomeFormValues) => {
    if (!usuario) return;
    setSalvandoNome(true);
    try {
      await atualizar.trigger({ id: usuario.id, data: { nome: data.nome } });
      await mutateAuth();
      toast.success('Nome atualizado com sucesso');
      setDialogNomeAberto(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar nome');
    } finally {
      setSalvandoNome(false);
    }
  };

  const onSalvarCpf = async (data: CpfFormValues) => {
    if (!usuario) return;
    setSalvandoCpf(true);
    try {
      await atualizar.trigger({ id: usuario.id, data: { cpf: data.cpf } });
      await mutateAuth();
      toast.success('CPF atualizado com sucesso');
      setDialogCpfAberto(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar CPF');
    } finally {
      setSalvandoCpf(false);
    }
  };

  const onSalvarEmail = async (data: EmailFormValues) => {
    if (!usuario) return;
    setSalvandoEmail(true);
    try {
      await atualizar.trigger({ id: usuario.id, data: { email: data.email } });
      await mutateAuth();
      toast.success('Email atualizado com sucesso');
      setDialogEmailAberto(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar email');
    } finally {
      setSalvandoEmail(false);
    }
  };

  const onSalvarSenha = async (data: SenhaFormValues) => {
    if (!usuario) return;
    setSalvandoSenha(true);
    try {
      await atualizar.trigger({
        id: usuario.id,
        data: {
          password_hash: data.novaSenha,
          senha_atual: data.senhaAtual,
        },
      });
      await mutateAuth();
      toast.success('Senha atualizada com sucesso');
      setDialogSenhaAberto(false);
      formSenha.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar senha';
      toast.error(errorMessage);
    } finally {
      setSalvandoSenha(false);
    }
  };

  const aoMudarCpf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorMascarado = mascaraCPF(e.target.value);
    formCpf.setValue('cpf', valorMascarado);
  };

  if (isLoadingAuth) {
    return (
      <div className="space-y-6">
        <Header titulo="Meu Perfil" />
        <div className="px-6">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-slate-500">Carregando...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header titulo="Meu Perfil" />
      <Toaster position="top-right" />
      <div className="px-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Gerencie suas informações de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {usuario?.nome || 'Nome não cadastrado'}
                </p>
                <p className="text-sm text-slate-500">{usuario?.email}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Nome */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Nome</p>
                    <p className="text-sm font-medium">{usuario?.nome || 'Não cadastrado'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    formNome.reset({ nome: usuario?.nome || '' });
                    setDialogNomeAberto(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              {/* CPF */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">CPF</p>
                    <p className="text-sm font-medium">{usuario?.cpf || 'Não cadastrado'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    formCpf.reset({ cpf: usuario?.cpf || '' });
                    setDialogCpfAberto(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium">{usuario?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    formEmail.reset({ email: usuario?.email || '' });
                    setDialogEmailAberto(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              {/* Tipo de Usuário */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Tipo de Usuário</p>
                    <p className="text-sm font-medium">Gestor</p>
                  </div>
                </div>
              </div>

              {/* Senha */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg md:col-span-2">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Senha</p>
                    <p className="text-sm font-medium">••••••••</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    formSenha.reset();
                    setDialogSenhaAberto(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Editar Nome */}
      <Dialog open={dialogNomeAberto} onOpenChange={setDialogNomeAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Nome</DialogTitle>
            <DialogDescription>
              Digite seu nome completo.
            </DialogDescription>
          </DialogHeader>
          <Form {...formNome}>
            <form onSubmit={formNome.handleSubmit(onSalvarNome)} className="space-y-4">
              <FormField
                control={formNome.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogNomeAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvandoNome}>
                  {salvandoNome ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar CPF */}
      <Dialog open={dialogCpfAberto} onOpenChange={setDialogCpfAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar CPF</DialogTitle>
            <DialogDescription>
              Digite seu CPF no formato XXX.XXX.XXX-XX.
            </DialogDescription>
          </DialogHeader>
          <Form {...formCpf}>
            <form onSubmit={formCpf.handleSubmit(onSalvarCpf)} className="space-y-4">
              <FormField
                control={formCpf.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={aoMudarCpf}
                        maxLength={14}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogCpfAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvandoCpf}>
                  {salvandoCpf ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Email */}
      <Dialog open={dialogEmailAberto} onOpenChange={setDialogEmailAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Email</DialogTitle>
            <DialogDescription>
              Digite seu novo email.
            </DialogDescription>
          </DialogHeader>
          <Form {...formEmail}>
            <form onSubmit={formEmail.handleSubmit(onSalvarEmail)} className="space-y-4">
              <FormField
                control={formEmail.control}
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogEmailAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvandoEmail}>
                  {salvandoEmail ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Trocar Senha */}
      <Dialog open={dialogSenhaAberto} onOpenChange={setDialogSenhaAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Trocar Senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha.
            </DialogDescription>
          </DialogHeader>
          <Form {...formSenha}>
            <form onSubmit={formSenha.handleSubmit(onSalvarSenha)} className="space-y-4">
              <FormField
                control={formSenha.control}
                name="senhaAtual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={mostrarSenhaAtual ? 'text' : 'password'}
                          placeholder="Digite sua senha atual"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                        >
                          {mostrarSenhaAtual ? (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formSenha.control}
                name="novaSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={mostrarNovaSenha ? 'text' : 'password'}
                          placeholder="Digite a nova senha"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                        >
                          {mostrarNovaSenha ? (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formSenha.control}
                name="confirmarSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={mostrarConfirmarSenha ? 'text' : 'password'}
                          placeholder="Confirme a nova senha"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                        >
                          {mostrarConfirmarSenha ? (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogSenhaAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvandoSenha}>
                  {salvandoSenha ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
