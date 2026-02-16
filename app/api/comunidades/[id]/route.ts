/**
 * API de comunidade por ID
 * Gerencia operações em uma comunidade específica (GET, PUT, DELETE)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// Schema de validação para atualização de comunidade
const comunidadeUpdateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100).optional(),
  descricao: z.string().optional().nullable(),
});

// GET - Retorna dados de uma comunidade específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comunidade = await prisma.comunidades.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nome: true,
        descricao: true,
        codigo: true,
        data_criacao: true,
        membros: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!comunidade) {
      return NextResponse.json(
        { error: 'Comunidade não encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: comunidade });
  } catch (error) {
    console.error('Erro ao buscar comunidade:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar comunidade' },
      { status: 500 }
    );
  }
}

// Função auxiliar para obter usuário autenticado
async function getAuthenticatedUser(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return payload;
}

// PUT - Atualiza dados de uma comunidade
// Apenas o criador ou admin pode editar
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getAuthenticatedUser(request);
    if (!payload) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const comunidadeExistente = await prisma.comunidades.findUnique({
      where: { id: parseInt(id) },
      select: { criador_id: true },
    });
    if (!comunidadeExistente) {
      return NextResponse.json({ error: 'Comunidade não encontrada' }, { status: 404 });
    }
    if (payload.tipo !== 'ADMIN' && comunidadeExistente.criador_id !== payload.usuario_id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar esta comunidade' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const validatedData = comunidadeUpdateSchema.parse(body);
    const data: Record<string, unknown> = {};
    if (validatedData.nome) data.nome = validatedData.nome;
    if (validatedData.descricao !== undefined) data.descricao = validatedData.descricao;
    const comunidade = await prisma.comunidades.update({
      where: { id: parseInt(id) },
      data,
      select: {
        id: true,
        nome: true,
        descricao: true,
        codigo: true,
        data_criacao: true,
      },
    });
    return NextResponse.json({
      data: comunidade,
      message: 'Comunidade atualizada com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Comunidade não encontrada' },
        { status: 404 }
      );
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma comunidade com este nome' },
        { status: 409 }
      );
    }
    console.error('Erro ao atualizar comunidade:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar comunidade' },
      { status: 500 }
    );
  }
}

// DELETE - Exclui uma comunidade
// Apenas o criador ou admin pode excluir
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getAuthenticatedUser(request);
    if (!payload) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const comunidadeExistente = await prisma.comunidades.findUnique({
      where: { id: parseInt(id) },
      select: { criador_id: true },
    });
    if (!comunidadeExistente) {
      return NextResponse.json({ error: 'Comunidade não encontrada' }, { status: 404 });
    }
    if (payload.tipo !== 'ADMIN' && comunidadeExistente.criador_id !== payload.usuario_id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir esta comunidade' },
        { status: 403 }
      );
    }
    await prisma.comunidades.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({
      message: 'Comunidade excluída com sucesso',
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Comunidade não encontrada' },
        { status: 404 }
      );
    }
    console.error('Erro ao excluir comunidade:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir comunidade' },
      { status: 500 }
    );
  }
}