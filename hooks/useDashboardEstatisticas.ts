'use client';
import useSWR from 'swr';
import { Usuario } from './useUsuarios';
import { Sessao } from './useSessoes';
import { Projeto } from './useProjetos';
import { Voto } from './useVotos';

const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => res.json());

export interface DashboardEstatisticas {
  usuarios: Usuario[];
  sessoes: Sessao[];
  projetos: Projeto[];
  votos: Voto[];
}

export interface DashboardEstatisticasResponse {
  data: DashboardEstatisticas;
}

export function useDashboardEstatisticas() {
  const { data, error, isLoading, mutate } = useSWR<DashboardEstatisticasResponse>(
    '/api/dashboard/estatisticas',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    estatisticas: data?.data || null,
    usuarios: data?.data?.usuarios || [],
    sessoes: data?.data?.sessoes || [],
    projetos: data?.data?.projetos || [],
    votos: data?.data?.votos || [],
    isLoading,
    error,
    mutate,
  };
}
