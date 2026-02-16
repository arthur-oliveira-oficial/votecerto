/**
 * API de comunidades do usuário
 * Retorna as comunidades que o usuário atual participa
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET - Lista comunidades do usuário autenticado
// Admin vê todas, outros usuários veem apenas suas comunidades
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
    if (payload.tipo === 'ADMIN') {
      const comunidades = await prisma.comunidades.findMany({
        orderBy: { id: 'desc' },
        include: {
          criador: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          _count: {
            select: {
              membros: true,
              sessoes: true,
            },
          },
        },
      });
      return NextResponse.json({ data: comunidades });
    }
    const comunidades = await prisma.comunidades.findMany({
      where: {
        membros: {
          some: {
            usuario_id: payload.usuario_id,
          },
        },
      },
      orderBy: { id: 'desc' },
      include: {
        criador: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        _count: {
          select: {
            membros: true,
            sessoes: true,
          },
        },
      },
    });
    return NextResponse.json({ data: comunidades });
  } catch (error) {
    console.error('Erro ao buscar comunidades:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar comunidades' },
      { status: 500 }
    );
  }
}