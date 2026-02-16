/**
 * API de votos de uma sessão
 * Retorna todos os votos de uma sessão específica
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
    const votos = await prisma.votos.findMany({
      where: { sessao_id: sessaoId },
      orderBy: { id: 'asc' },
      include: {
        usuario: true,
        projeto: true,
      },
    });
    return NextResponse.json({ data: votos });
  } catch (error) {
    console.error('Erro ao buscar votos da sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar votos da sessão' },
      { status: 500 }
    );
  }
}