'use client';
import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users } from 'lucide-react';

interface ResultadoProjeto {
  projeto_id: number;
  titulo: string;
  descricao?: string | null;
  autor?: string | null;
  votos: number;
  percentual: number;
}
interface ResultadosParciaisProps {
  sessao_id: number;
}
interface ApiResponse {
  data: {
    sessao_id: number;
    total_votos: number;
    resultados: ResultadoProjeto[];
    usuario_ja_votou: boolean;
  };
}

const CORES_BARRA = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

function ResultadosParciaisComponent({ sessao_id }: ResultadosParciaisProps) {
  const [dados, setDados] = useState<ApiResponse['data'] | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function buscarResultados() {
      try {
        setCarregando(true);
        const res = await fetch(`/api/votos/resultados?sessao_id=${sessao_id}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Erro ao buscar resultados');
        }
        const data: ApiResponse = await res.json();
        setDados(data.data);
      } catch (err) {
        if (err instanceof Error) {
          setErro(err.message);
        } else {
          setErro('Erro ao carregar resultados');
        }
      } finally {
        setCarregando(false);
      }
    }
    buscarResultados();
  }, [sessao_id]);

  if (carregando) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-slate-200 rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-100 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (erro) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-8 text-center">
          <p className="text-amber-700">{erro}</p>
        </CardContent>
      </Card>
    );
  }

  if (!dados || dados.total_votos === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-8 text-center">
          <Trophy className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Nenhum voto registrado ainda</p>
        </CardContent>
      </Card>
    );
  }

  // Encontrar o projeto com mais votos para destaque
  const maxVotos = Math.max(...dados.resultados.map(r => r.votos));

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-xl font-semibold text-slate-900">Resultados Parciais</CardTitle>
        </div>
        <CardDescription className="flex items-center gap-2 text-slate-600">
          <Users className="h-4 w-4" />
          <span>{dados.total_votos} voto{dados.total_votos !== 1 ? 's' : ''} registrado{dados.total_votos !== 1 ? 's' : ''}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {dados.resultados.map((projeto, index) => {
          const isLider = projeto.votos === maxVotos && maxVotos > 0;
          const corBarra = CORES_BARRA[index % CORES_BARRA.length];

          return (
            <div
              key={projeto.projeto_id}
              className={`p-4 rounded-lg border ${
                isLider
                  ? 'bg-gradient-to-r from-amber-50 to-white border-amber-200'
                  : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isLider && (
                    <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  )}
                  <h3 className={`font-medium text-slate-900 ${isLider ? 'text-amber-900' : ''}`}>
                    {projeto.titulo}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{projeto.votos} voto{projeto.votos !== 1 ? 's' : ''}</p>
                  <p className="text-sm text-slate-500">{projeto.percentual}%</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${projeto.percentual}%`,
                    backgroundColor: corBarra,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export const ResultadosParciais = memo(ResultadosParciaisComponent);
