/**
 * API de votos de um projeto
 * Retorna todos os votos de um projeto específico
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projetoId = parseInt(id);
    const votos = await prisma.votos.findMany({
      where: { projeto_id: projetoId },
      orderBy: { id: 'asc' },
      include: {
        usuario: true,
        sessao: true,
      },
    });
    return NextResponse.json({ data: votos });
  } catch (error) {
    console.error('Erro ao buscar votos do projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar votos do projeto' },
      { status: 500 }
    );
  }
}