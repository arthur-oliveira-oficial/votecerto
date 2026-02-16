/**
 * API para regenerar código de convite de comunidade
 * Gera um novo código para uma comunidade existente
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import crypto from 'crypto';

function gerarCodigo(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// POST - Regenera o código de convite de uma comunidade
// Apenas o criador da comunidade ou ADMIN pode regenerar o código
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const comunidadeId = parseInt(id, 10);

    if (isNaN(comunidadeId)) {
      return NextResponse.json(
        { error: 'ID de comunidade inválido' },
        { status: 400 }
      );
    }

    // Busca a comunidade para verificar se o usuário é o criador ou admin
    const comunidade = await prisma.comunidades.findUnique({
      where: { id: comunidadeId },
      select: {
        id: true,
        criador_id: true,
      },
    });

    if (!comunidade) {
      return NextResponse.json(
        { error: 'Comunidade não encontrada' },
        { status: 404 }
      );
    }

    // Verifica se o usuário é o criador ou admin
    if (payload.tipo !== 'ADMIN' && comunidade.criador_id !== payload.usuario_id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para regenerar o código desta comunidade' },
        { status: 403 }
      );
    }

    // Gera um novo código único
    let novoCodigo = gerarCodigo();
    let codigoExistente = await prisma.comunidades.findUnique({
      where: { codigo: novoCodigo },
      select: { id: true },
    });

    while (codigoExistente) {
      novoCodigo = gerarCodigo();
      codigoExistente = await prisma.comunidades.findUnique({
        where: { codigo: novoCodigo },
        select: { id: true },
      });
    }

    // Atualiza o código da comunidade
    const comunidadeAtualizada = await prisma.comunidades.update({
      where: { id: comunidadeId },
      data: { codigo: novoCodigo },
      select: {
        id: true,
        nome: true,
        codigo: true,
      },
    });

    return NextResponse.json({
      data: comunidadeAtualizada,
      message: 'Código de convite regenerado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao regenerar código:', error);
    return NextResponse.json(
      { error: 'Erro ao regenerar código de convite' },
      { status: 500 }
    );
  }
}
