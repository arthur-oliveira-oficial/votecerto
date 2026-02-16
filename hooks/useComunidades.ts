'use client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => res.json());
export interface ParticipanteComunidade {
  id: number;
  usuario: {
    id: number;
    nome: string | null;
    email: string;
  };
  data_entrada: string;
}
export interface Comunidade {
  id: number;
  nome: string;
  descricao: string | null;
  codigo: string;
  data_criacao: string;
  criador_id?: number | null;
  criador?: {
    id: number;
    nome: string | null;
    email: string;
  } | null;
  _count?: {
    membros: number;
    sessoes: number;
  };
  membros?: ParticipanteComunidade[];
}
export interface MinhasComunidadesResponse {
  data: Comunidade[];
}
export interface IngressarResponse {
  data: {
    id: number;
    comunidade: Pick<Comunidade, 'id' | 'nome' | 'descricao'>;
    data_entrada: string;
  };
  message: string;
}
export interface ComunidadesResponse {
  data: Comunidade[];
}
export interface ComunidadeResponse {
  data: Comunidade;
}
export function useComunidades() {
  const { data, error, isLoading, mutate } = useSWR<ComunidadesResponse>(
    '/api/comunidades',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
  const criar = useSWRMutation(
    '/api/comunidades',
    async (url: string, { arg }: { arg: {
      nome: string;
      descricao?: string;
    } }) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(arg),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar comunidade');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  const atualizar = useSWRMutation(
    '/api/comunidades',
    async (_url: string, { arg }: { arg: { id: number; data: Partial<{
      nome: string;
      descricao: string | null;
    }> } }) => {
      const res = await fetch(`/api/comunidades/${arg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(arg.data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar comunidade');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  const excluir = useSWRMutation(
    '/api/comunidades',
    async (_url: string, { arg }: { arg: number }) => {
      const res = await fetch(`/api/comunidades/${arg}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao excluir comunidade');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  const regenerarCodigo = useSWRMutation(
    '/api/comunidades',
    async (_url: string, { arg }: { arg: number }) => {
      const res = await fetch(`/api/comunidades/${arg}/regenerar-codigo`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao regenerar código');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  return {
    comunidades: data?.data || [],
    isLoading,
    error,
    criar,
    atualizar,
    excluir,
    regenerarCodigo,
    mutate,
  };
}
export function useMinhasComunidades() {
  const { data, error, isLoading, mutate } = useSWR<MinhasComunidadesResponse>(
    '/api/comunidades/minhas',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
  const ingressar = useSWRMutation(
    '/api/comunidades/ingressar',
    async (url: string, { arg }: { arg: { codigo: string } }) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(arg),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao ingressar na comunidade');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  return {
    comunidades: data?.data || [],
    isLoading,
    error,
    ingressar,
    mutate,
    revalidate: mutate,
  };
}
export function useComunidade(id: number) {
  const { data, error, isLoading, mutate } = useSWR<ComunidadeResponse>(
    id ? `/api/comunidades/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
  return {
    comunidade: data?.data,
    isLoading,
    error,
    mutate,
  };
}