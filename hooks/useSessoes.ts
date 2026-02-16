'use client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => res.json());
export interface Sessao {
  id: number;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string;
  ativa: boolean;
  criador_id?: number;
  comunidade_id?: number | null | undefined;
  comunidade?: {
    id: number;
    nome: string;
  } | null;
  _count?: {
    projetos: number;
    votos: number;
  };
}
export interface SessoesResponse {
  data: Sessao[];
}
export function useSessoes(ativa?: boolean) {
  const url = ativa !== undefined ? `/api/sessoes?ativa=${ativa}` : '/api/sessoes';
  const { data, error, isLoading, mutate } = useSWR<SessoesResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
  const criar = useSWRMutation(
    '/api/sessoes',
    async (url: string, { arg }: { arg: Omit<Sessao, 'id' | '_count'> }) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(arg),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar sessão');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  const atualizar = useSWRMutation(
    '/api/sessoes',
    async (url: string, { arg }: { arg: { id: number; data: Partial<Sessao> } }) => {
      const res = await fetch(`/api/sessoes/${arg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(arg.data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar sessão');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  const excluir = useSWRMutation(
    '/api/sessoes',
    async (_url: string, { arg }: { arg: number }) => {
      const res = await fetch(`/api/sessoes/${arg}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao excluir sessão');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  return {
    sessoes: data?.data || [],
    isLoading,
    error,
    criar,
    atualizar,
    excluir,
    mutate,
  };
}