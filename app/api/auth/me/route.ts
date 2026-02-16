/**
 * API de autenticação - Usuário Atual
 * Retorna os dados do usuário autenticado via token JWT
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET - Retorna dados do usuário logado
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
    const usuario = await prisma.usuarios.findUnique({
      where: { id: payload.usuario_id },
      select: {
        id: true,
        email: true,
        tipo: true,
        cpf: true,
        nome: true,
        data_criacao: true,
        ultimo_acesso: true,
      },
    });
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }
    return NextResponse.json({ data: usuario });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}