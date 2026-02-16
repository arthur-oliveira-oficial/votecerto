'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Users, ArrowLeft, ArrowRight } from 'lucide-react';

// Helper para validar CPF (apenas números, 11 dígitos)
const cpfRegex = /^\d{11}$/;

const gestorSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  tipo: z.literal('GESTOR'),
  cpf: z.string().optional(),
}).refine(
  (data) => !data.cpf || data.cpf.length === 0 || cpfRegex.test(data.cpf.replace(/\D/g, '')),
  { message: 'CPF deve conter 11 dígitos numéricos' }
);

const participanteSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  tipo: z.literal('PARTICIPANTE'),
  codigoComunidade: z.string().min(6, 'Código da comunidade é obrigatório'),
  cpf: z.string().optional(),
}).refine(
  (data) => !data.cpf || data.cpf.length === 0 || cpfRegex.test(data.cpf.replace(/\D/g, '')),
  { message: 'CPF deve conter 11 dígitos numéricos' }
);

// Função para formatar CPF com máscara (XXX.XXX.XXX-XX)
function formatarCpf(valor: string): string {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 3) return numeros;
  if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
}

type GestorValues = z.infer<typeof gestorSchema>;
type ParticipanteValues = z.infer<typeof participanteSchema>;
type FormValues = GestorValues | ParticipanteValues;

export default function CadastroPage() {
  const router = useRouter();
  const [tipoUsuario, setTipoUsuario] = useState<'GESTOR' | 'PARTICIPANTE'>('GESTOR');
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(tipoUsuario === 'GESTOR' ? gestorSchema : participanteSchema),
    defaultValues: {
      email: '',
      password: '',
      nome: '',
      tipo: tipoUsuario,
      codigoComunidade: '',
      cpf: '',
    },
  });

  // Reset form when tipoUsuario changes to update the resolver
  useEffect(() => {
    form.reset({
      email: '',
      password: '',
      nome: '',
      tipo: tipoUsuario,
      codigoComunidade: '',
      cpf: '',
    });
  }, [tipoUsuario, form]);

  async function handleSubmit(data: FormValues) {
    setLoading(true);
    try {
      // Extract CPF if provided (remove mask - keep only numbers)
      const cpf = 'cpf' in data && data.cpf ? data.cpf.replace(/\D/g, '') : undefined;

      // Create user
      const createResponse = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password_hash: data.password,
          nome: data.nome,
          tipo: data.tipo,
          cpf: cpf,
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        toast.error(createData.error || 'Erro ao criar conta');
        return;
      }

      // For PARTICIPANTE, also try to login and join community
      if (data.tipo === 'PARTICIPANTE' && 'codigoComunidade' in data) {
        // Login to get token
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });

        if (loginResponse.ok) {
          // Try to join community
          const ingressarResponse = await fetch('/api/comunidades/ingressar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo: data.codigoComunidade }),
          });

          if (ingressarResponse.ok) {
            const ingressarData = await ingressarResponse.json();
            toast.success(`Conta criada! Você ingressou na comunidade "${ingressarData.data.comunidade.nome}"`);
          } else {
            const ingressarData = await ingressarResponse.json();
            // User created but couldn't join community - still success but with warning
            toast.warning(`Conta criada, mas não foi possível ingressar na comunidade: ${ingressarData.error}`);
          }
        } else {
          toast.success('Conta criada com sucesso! Faça login para continuar.');
        }
      } else {
        toast.success('Conta criada com sucesso!');
      }

      // Redirect based on user type
      const getRedirectUrl = (tipo: string) => {
        switch (tipo) {
          case 'ADMIN':
            return '/admin/dashboard';
          case 'GESTOR':
            return '/gestor/dashboard';
          case 'PARTICIPANTE':
            return '/participante/dashboard';
          default:
            return '/dashboard';
        }
      };

      router.push(getRedirectUrl(data.tipo));
      router.refresh();
    } catch {
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">VoteCerto</CardTitle>
          <CardDescription className="text-center">
            Crie sua conta para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setTipoUsuario('GESTOR')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                tipoUsuario === 'GESTOR'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="font-medium">Gestor</span>
            </button>
            <button
              type="button"
              onClick={() => setTipoUsuario('PARTICIPANTE')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                tipoUsuario === 'PARTICIPANTE'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Participante</span>
            </button>
          </div>

          {tipoUsuario === 'GESTOR' && (
            <p className="text-sm text-slate-500 mb-4 text-center">
              Crie uma conta de gestor para criar comunidades e gerenciar votações
            </p>
          )}

          {tipoUsuario === 'PARTICIPANTE' && (
            <p className="text-sm text-slate-500 mb-4 text-center">
              Crie uma conta de participante e ingresse em uma comunidade com código de convite
            </p>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        maxLength={14}
                        value={field.value || ''}
                        onChange={(e) => {
                          const formatted = formatarCpf(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Sua senha"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {tipoUsuario === 'PARTICIPANTE' && (
                <FormField
                  control={form.control}
                  name="codigoComunidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código da Comunidade</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Código de convite"
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-slate-900 hover:underline font-medium">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
