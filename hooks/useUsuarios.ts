'use client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => res.json());
export interface Usuario {
  id: number;
  email: string;
  tipo: 'ADMIN' | 'PARTICIPANTE';
  nome: string | null;
  cpf: string | null;
  data_criacao: string;
}
export interface UsuariosResponse {
  data: Usuario[];
}
export function useUsuarios() {
  const { data, error, isLoading, mutate } = useSWR<UsuariosResponse>(
    '/api/usuarios',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
  const criar = useSWRMutation(
    '/api/usuarios',
    async (url: string, { arg }: { arg: {
      email: string;
      password_hash: string;
      tipo: 'ADMIN' | 'PARTICIPANTE';
      nome?: string;
      cpf?: string;
    } }) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(arg),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar usuário');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  const atualizar = useSWRMutation(
    '/api/usuarios',
    async (_url: string, { arg }: { arg: { id: number; data: Partial<{
      email: string;
      password_hash: string;
      tipo: 'ADMIN' | 'PARTICIPANTE';
      nome: string | null;
      cpf: string | null;
      senha_atual?: string;
    }> } }) => {
      const res = await fetch(`/api/usuarios/${arg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(arg.data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar usuário');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  const excluir = useSWRMutation(
    '/api/usuarios',
    async (_url: string, { arg }: { arg: number }) => {
      const res = await fetch(`/api/usuarios/${arg}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao excluir usuário');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  return {
    usuarios: data?.data || [],
    isLoading,
    error,
    criar,
    atualizar,
    excluir,
    mutate,
  };
}