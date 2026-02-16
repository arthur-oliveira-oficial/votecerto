/**
 * API de relatório de votos por sessão e projeto
 * Retorna lista de votos com nome do participante, hora do voto e CPF mascarado
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessaoId = searchParams.get('sessao_id');

    // Buscar sessões ativas ou todas se for admin/gestor
    const whereSessao: Record<string, unknown> = {};

    if (sessaoId) {
      whereSessao.id = parseInt(sessaoId);
    }

    const sessoes = await prisma.sessoes.findMany({
      where: whereSessao,
      include: {
        projetos: {
          include: {
            votos: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    cpf: true,
                  },
                },
              },
              orderBy: {
                data_voto: 'desc',
              },
            },
          },
        },
      },
      orderBy: {
        data_inicio: 'desc',
      },
    });

    // Formatar dados para o relatório
    const relatorio = sessoes.map((sessao) => ({
      id: sessao.id,
      titulo: sessao.titulo,
      data_inicio: sessao.data_inicio,
      data_fim: sessao.data_fim,
      ativa: sessao.ativa,
      projetos: sessao.projetos.map((projeto) => ({
        id: projeto.id,
        titulo: projeto.titulo,
        descricao: projeto.descricao_detalhada || null,
        votos: projeto.votos.map((voto) => ({
          id: voto.id,
          nomeParticipante: voto.usuario?.nome || 'Anônimo',
          cpfMascarado: voto.usuario?.cpf
            ? `${voto.usuario.cpf.substring(0, 3)}.${voto.usuario.cpf.substring(3, 6)}.${voto.usuario.cpf.substring(6, 9)}**`
            : '-',
          dataVoto: voto.data_voto,
          comentario: voto.comentario,
        })),
        totalVotos: projeto.votos.length,
      })),
      totalProjetos: sessao.projetos.length,
      totalVotos: sessao.projetos.reduce((acc, p) => acc + p.votos.length, 0),
    }));

    return NextResponse.json({ data: relatorio });
  } catch (error) {
    console.error('Erro ao buscar relatório de votos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar relatório de votos' },
      { status: 500 }
    );
  }
}
