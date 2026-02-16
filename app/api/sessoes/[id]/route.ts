/**
 * API de sessão por ID
 * Gerencia operações em uma sessão específica (PUT, DELETE)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para atualização de sessão
const sessaoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().nullable().optional(),
  data_inicio: z.string({ message: 'Data de início inválida' })
    .min(1, 'Data de início é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Data de início inválida')
    .transform((str) => new Date(str + ':00Z').toISOString()),
  data_fim: z.string({ message: 'Data de fim inválida' })
    .min(1, 'Data de fim é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Data de fim inválida')
    .transform((str) => new Date(str + ':00Z').toISOString()),
  ativa: z.boolean().optional(),
  comunidade_id: z.number().int().positive('Comunidade é obrigatória'),
});
async function verificarAutorizacao(request: Request, sessaoId: number) {
  const usuarioId = request.headers.get('x-usuario-id');
  if (!usuarioId) {
    return { autorizado: false, status: 401, erro: 'ID do usuário não fornecido' };
  }
  const sessao = await prisma.sessoes.findUnique({
    where: { id: sessaoId },
  });
  if (!sessao) {
    return { autorizado: false, status: 404, erro: 'Sessão não encontrada' };
  }
  const usuario = await prisma.usuarios.findUnique({
    where: { id: parseInt(usuarioId) },
    select: { tipo: true },
  });
  if (usuario?.tipo === 'ADMIN') {
    return { autorizado: true, usuarioId: parseInt(usuarioId), ehAdmin: true };
  }
  if (sessao.criador_id !== parseInt(usuarioId)) {
    return { autorizado: false, status: 403, erro: 'Você não tem permissão para editar esta sessão' };
  }
  return { autorizado: true, usuarioId: parseInt(usuarioId), ehAdmin: false };
}

// PUT - Atualiza uma sessão existente
// Apenas o criador ou admin pode editar
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessaoId = parseInt(id);
    const auth = await verificarAutorizacao(request, sessaoId);
    if (!auth.autorizado) {
      return NextResponse.json(
        { error: auth.erro },
        { status: auth.status }
      );
    }
    const body = await request.json();
    const validatedData = sessaoSchema.parse(body);
    const sessao = await prisma.sessoes.update({
      where: { id: sessaoId },
      data: {
        titulo: validatedData.titulo,
        descricao: validatedData.descricao,
        data_inicio: new Date(validatedData.data_inicio),
        data_fim: new Date(validatedData.data_fim),
        ativa: validatedData.ativa,
        comunidade_id: validatedData.comunidade_id,
      },
    });
    return NextResponse.json({
      data: sessao,
      message: 'Sessão atualizada com sucesso',
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
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }
    console.error('Erro ao atualizar sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar sessão' },
      { status: 500 }
    );
  }
}

// DELETE - Exclui uma sessão
// Apenas o criador ou admin pode excluir
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessaoId = parseInt(id);
    const auth = await verificarAutorizacao(request, sessaoId);
    if (!auth.autorizado) {
      return NextResponse.json(
        { error: auth.erro },
        { status: auth.status }
      );
    }
    await prisma.sessoes.delete({
      where: { id: sessaoId },
    });
    return NextResponse.json({
      message: 'Sessão excluída com sucesso',
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }
    console.error('Erro ao excluir sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir sessão' },
      { status: 500 }
    );
  }
}