/**
 * API de projetos de uma sessão
 * Retorna todos os projetos de uma sessão específica
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessaoId = parseInt(id);
    const projetos = await prisma.projetos.findMany({
      where: { sessao_id: sessaoId },
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { votos: true },
        },
      },
    });
    return NextResponse.json({ data: projetos });
  } catch (error) {
    console.error('Erro ao buscar projetos da sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar projetos da sessão' },
      { status: 500 }
    );
  }
}