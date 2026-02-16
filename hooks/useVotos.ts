'use client';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => res.json());
export interface Voto {
  id: number;
  comentario: string | null;
  sessao_id: number;
  projeto_id: number;
  usuario_id: number;
  data_voto: string;
  usuario?: {
    id: number;
    nome: string | null;
    cpf: string | null;
    email: string;
  };
  projeto?: {
    id: number;
    titulo: string;
  };
  sessao?: {
    id: number;
    titulo: string;
  };
}
export interface VotosResponse {
  data: Voto[];
}
export function useVotos(filtros?: { sessaoId?: number; projetoId?: number; participanteId?: number }) {
  let url = '/api/votos';
  const params = new URLSearchParams();
  if (filtros?.sessaoId) params.append('sessao_id', String(filtros.sessaoId));
  if (filtros?.projetoId) params.append('projeto_id', String(filtros.projetoId));
  if (filtros?.participanteId) params.append('participante_id', String(filtros.participanteId));
  if (params.toString()) {
    url += '?' + params.toString();
  }
  const { data, error, isLoading, mutate } = useSWR<VotosResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
  const criar = useSWRMutation(
    '/api/votos',
    async (url: string, { arg }: { arg: { comentario?: string | null; sessao_id: number; projeto_id: number } }) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(arg),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao registrar voto');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  const atualizar = useSWRMutation(
    '/api/votos',
    async (_url: string, { arg }: { arg: { id: number; data: Partial<Voto> } }) => {
      const res = await fetch(`/api/votos/${arg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(arg.data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar voto');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  const excluir = useSWRMutation(
    '/api/votos',
    async (_url: string, { arg }: { arg: number }) => {
      const res = await fetch(`/api/votos/${arg}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao excluir voto');
      }
      return res.json();
    },
    { onSuccess: () => mutate() }
  );
  return {
    votos: data?.data || [],
    isLoading,
    error,
    criar,
    atualizar,
    excluir,
    mutate,
  };
}