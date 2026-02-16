'use client';
import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => res.json());

export interface VotoRelatorio {
  id: number;
  nomeParticipante: string;
  cpfMascarado: string;
  dataVoto: string;
  comentario: string | null;
}

export interface ProjetoRelatorio {
  id: number;
  titulo: string;
  descricao: string | null;
  votos: VotoRelatorio[];
  totalVotos: number;
}

export interface SessaoRelatorio {
  id: number;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  ativa: boolean;
  projetos: ProjetoRelatorio[];
  totalProjetos: number;
  totalVotos: number;
}

export interface RelatorioVotosResponse {
  data: SessaoRelatorio[];
}

export function useRelatorioVotos(sessaoId?: number) {
  let url = '/api/relatorios/votos';
  if (sessaoId) {
    url += `?sessao_id=${sessaoId}`;
  }

  const { data, error, isLoading, mutate } = useSWR<RelatorioVotosResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    relatorio: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}
