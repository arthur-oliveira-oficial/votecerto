'use client';
import useSWR from 'swr';
interface UsuarioResponse {
  data: {
    id: number;
    email: string;
    tipo: 'ADMIN' | 'GESTOR' | 'PARTICIPANTE';
    nome: string | null;
    cpf: string | null;
    data_criacao: string;
    ultimo_acesso: string | null;
  };
}
const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => res.json());
export function useAuth() {
  const { data, error, mutate } = useSWR<UsuarioResponse>('/api/auth/me', fetcher);
  const getDashboardUrl = () => {
    if (data?.data?.tipo === 'ADMIN') return '/admin/dashboard';
    if (data?.data?.tipo === 'GESTOR') return '/gestor/dashboard';
    if (data?.data?.tipo === 'PARTICIPANTE') return '/participante/dashboard';
    return '/dashboard';
  };
  return {
    usuario: data?.data,
    isLoading: !error && !data,
    isError: !!error,
    isAdmin: data?.data?.tipo === 'ADMIN',
    isGestor: data?.data?.tipo === 'GESTOR',
    isParticipante: data?.data?.tipo === 'PARTICIPANTE',
    getDashboardUrl,
    mutate,
  };
}