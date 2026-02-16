/**
 * API de resultados de votação
 * Retorna os resultados consolidados de uma sessão de votação
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

// GET - Retorna resultados de uma sessão
// Requer que o usuário já tenha votado na sessão
export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const sessaoId = searchParams.get('sessao_id');
    if (!sessaoId) {
      return NextResponse.json(
        { error: 'ID da sessão é obrigatório' },
        { status: 400 }
      );
    }
    const sessao_id = parseInt(sessaoId);
    const votoExistente = await prisma.votos.findFirst({
      where: {
        sessao_id,
        usuario_id: payload.usuario_id,
      },
    });
    if (!votoExistente) {
      return NextResponse.json(
        { error: 'Você ainda não votou nesta sessão' },
        { status: 403 }
      );
    }
    const resultados = await prisma.votos.groupBy({
      by: ['projeto_id'],
      where: {
        sessao_id,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });
    const projetos = await prisma.projetos.findMany({
      where: {
        sessao_id,
      },
      select: {
        id: true,
        titulo: true,
        descricao_detalhada: true,
        autor_responsavel: true,
      },
    });
    const totalVotos = resultados.reduce((acc, r) => acc + r._count.id, 0);
    const dadosFormatados = resultados.map((r) => {
      const projeto = projetos.find((p) => p.id === r.projeto_id);
      const percentual = totalVotos > 0 ? (r._count.id / totalVotos) * 100 : 0;
      return {
        projeto_id: r.projeto_id,
        titulo: projeto?.titulo || 'Projeto não encontrado',
        descricao: projeto?.descricao_detalhada,
        autor: projeto?.autor_responsavel,
        votos: r._count.id,
        percentual: parseFloat(percentual.toFixed(1)),
      };
    });
    return NextResponse.json({
      data: {
        sessao_id,
        total_votos: totalVotos,
        resultados: dadosFormatados,
        usuario_ja_votou: true,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar resultados:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar resultados' },
      { status: 500 }
    );
  }
}