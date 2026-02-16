/**
 * API de projeto por ID
 * Gerencia operações em um projeto específico (PUT, DELETE)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

// Schema de validação para atualização de projeto
const projetoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao_detalhada: z.string().optional(),
  autor_responsavel: z.string().optional(),
  sessao_id: z.number().int('ID da sessão inválido'),
});
async function podeModificarProjeto(request: Request, projetoId: number): Promise<{ pode: boolean; ehAdmin: boolean; erro?: string }> {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { pode: false, ehAdmin: false, erro: 'Não autorizado' };
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return { pode: false, ehAdmin: false, erro: 'Token inválido ou expirado' };
  }
  const usuario = await prisma.usuarios.findUnique({
    where: { id: payload.usuario_id },
    select: { tipo: true, id: true },
  });
  if (!usuario) {
    return { pode: false, ehAdmin: false, erro: 'Usuário não encontrado' };
  }
  const ehAdmin = usuario.tipo === 'ADMIN';
  if (!ehAdmin) {
    return { pode: false, ehAdmin: false, erro: 'Apenas administradores podem gerenciar projetos' };
  }
  const projeto = await prisma.projetos.findUnique({
    where: { id: projetoId },
    select: { id: true },
  });
  if (!projeto) {
    return { pode: false, ehAdmin: false, erro: 'Projeto não encontrado' };
  }
  return { pode: true, ehAdmin: true };
}

// PUT - Atualiza um projeto existente
// Apenas admin pode atualizar projetos
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = projetoSchema.parse(body);
    const permissao = await podeModificarProjeto(request, parseInt(id));
    if (!permissao.pode) {
      return NextResponse.json(
        { error: permissao.erro },
        { status: permissao.erro === 'Projeto não encontrado' ? 404 : 403 }
      );
    }
    const projeto = await prisma.projetos.update({
      where: { id: parseInt(id) },
      data: {
        titulo: validatedData.titulo,
        descricao_detalhada: validatedData.descricao_detalhada,
        autor_responsavel: validatedData.autor_responsavel,
        sessao_id: validatedData.sessao_id,
      },
    });
    return NextResponse.json({
      data: projeto,
      message: 'Projeto atualizado com sucesso',
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
          { error: 'Projeto não encontrado' },
          { status: 404 }
        );
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Já existe um projeto com este título na sessão' },
          { status: 409 }
        );
      }
    }
    console.error('Erro ao atualizar projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar projeto' },
      { status: 500 }
    );
  }
}

// DELETE - Exclui um projeto
// Apenas admin pode excluir projetos
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const permissao = await podeModificarProjeto(request, parseInt(id));
    if (!permissao.pode) {
      return NextResponse.json(
        { error: permissao.erro },
        { status: permissao.erro === 'Projeto não encontrado' ? 404 : 403 }
      );
    }
    await prisma.projetos.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({
      message: 'Projeto excluído com sucesso',
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }
    console.error('Erro ao excluir projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir projeto' },
      { status: 500 }
    );
  }
}