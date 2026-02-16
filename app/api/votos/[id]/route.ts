/**
 * API de voto por ID
 * Gerencia operações em um voto específico (PUT)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

// Schema de validação para atualização de voto
const votoSchema = z.object({
  comentario: z.string().optional(),
  sessao_id: z.number().int('ID da sessão inválido'),
  projeto_id: z.number().int('ID do projeto inválido'),
  usuario_id: z.number().int('ID do usuário inválido'),
});
async function verificarAutorizacaoVoto(request: Request, votoId: number): Promise<{ autorizado: boolean; ehAdmin: boolean; erro?: string; status?: number }> {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { autorizado: false, ehAdmin: false, erro: 'Não autorizado', status: 401 };
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return { autorizado: false, ehAdmin: false, erro: 'Token inválido ou expirado', status: 401 };
  }
  if (payload.tipo !== 'PARTICIPANTE') {
    return { autorizado: false, ehAdmin: false, erro: 'Apenas participantes podem gerenciar votos', status: 403 };
  }
  const voto = await prisma.votos.findUnique({
    where: { id: votoId },
    select: { usuario_id: true },
  });
  if (!voto) {
    return { autorizado: false, ehAdmin: false, erro: 'Voto não encontrado', status: 404 };
  }
  if (voto.usuario_id !== payload.usuario_id) {
    return { autorizado: false, ehAdmin: false, erro: 'Não autorizado a editar este voto', status: 403 };
  }
  return { autorizado: true, ehAdmin: false };
}

// PUT - Atualiza um voto existente
// Apenas o próprio participante pode editar seu voto
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verificarAutorizacaoVoto(request, parseInt(id));
    if (!auth.autorizado) {
      return NextResponse.json(
        { error: auth.erro },
        { status: auth.status }
      );
    }
    const body = await request.json();
    const validatedData = votoSchema.parse(body);
    const voto = await prisma.votos.update({
      where: { id: parseInt(id) },
      data: {
        comentario: validatedData.comentario,
        sessao_id: validatedData.sessao_id,
        projeto_id: validatedData.projeto_id,
        usuario_id: validatedData.usuario_id,
      },
      include: {
        usuario: true,
        projeto: true,
        sessao: true,
      },
    });
    return NextResponse.json({
      data: voto,
      message: 'Voto atualizado com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Voto não encontrado' },
          { status: 404 }
        );
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Este participante já votou nesta sessão' },
          { status: 409 }
        );
      }
    }
    console.error('Erro ao atualizar voto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar voto' },
      { status: 500 }
    );
  }
}