'use client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => res.json());
export interface Projeto {
  id: number;
  titulo: string;
  descricao_detalhada: string | null;
  autor_responsavel: string | null;
  sessao_id: number;
  sessao?: {
    id: number;
    titulo: string;
  };
  _count: {
    votos: number;
  };
}
export interface ProjetosResponse {
  data: Projeto[];
}
export function useProjetos(sessaoId?: number) {
  const url = sessaoId ? `/api/projetos?sessao_id=${sessaoId}` : '/api/projetos';
  const { data, error, isLoading, mutate } = useSWR<ProjetosResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
  const criar = useSWRMutation(
    '/api/projetos',
    async (url: string, { arg }: { arg: Omit<Projeto, 'id' | '_count'> }) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(arg),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar projeto');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  const atualizar = useSWRMutation<ProjetosResponse, Error, string, { id: number; data: Partial<Projeto> }, unknown>(
    '/api/projetos',
    async (_url: string, { arg }: { arg: { id: number; data: Partial<Projeto> } }) => {
      const res = await fetch(`/api/projetos/${arg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(arg.data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar projeto');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  const excluir = useSWRMutation<ProjetosResponse, Error, string, number, unknown>(
    '/api/projetos',
    async (_url: string, { arg }: { arg: number }) => {
      const res = await fetch(`/api/projetos/${arg}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao excluir projeto');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  return {
    projetos: data?.data || [],
    isLoading,
    error,
    criar,
    atualizar,
    excluir,
    mutate,
  };
}