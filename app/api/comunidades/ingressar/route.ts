/**
 * API de ingresso em comunidade
 * Permite que um usuário ingresse em uma comunidade através de código de convite
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
const ingressarSchema = z.object({
  codigo: z.string().min(6, 'Código deve ter no mínimo 6 caracteres'),
});

// POST - Ingressa em uma comunidade usando código de convite
export async function POST(request: Request) {
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
    const body = await request.json();
    const { codigo } = ingressarSchema.parse(body);
    const comunidade = await prisma.comunidades.findUnique({
      where: { codigo },
      include: {
        membros: {
          where: { usuario_id: payload.usuario_id },
        },
      },
    });
    if (!comunidade) {
      return NextResponse.json(
        { error: 'Código de convite inválido' },
        { status: 404 }
      );
    }
    if (comunidade.membros.length > 0) {
      return NextResponse.json(
        { error: 'Você já é membro desta comunidade' },
        { status: 400 }
      );
    }
    const usuarioComunidade = await prisma.participantes.create({
      data: {
        usuario_id: payload.usuario_id,
        comunidade_id: comunidade.id,
      },
      include: {
        comunidade: {
          select: {
            id: true,
            nome: true,
            descricao: true,
          },
        },
      },
    });
    return NextResponse.json(
      {
        data: usuarioComunidade,
        message: `Você ingressou na comunidade "${comunidade.nome}" com sucesso`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Você já é membro desta comunidade' },
        { status: 409 }
      );
    }
    console.error('Erro ao ingressar na comunidade:', error);
    return NextResponse.json(
      { error: 'Erro ao ingressar na comunidade' },
      { status: 500 }
    );
  }
}