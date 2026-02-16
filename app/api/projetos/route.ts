/**
 * API de projetos
 * Gerencia CRUD completo de projetos de votação
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

// Schema de validação para criação de projeto
const projetoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao_detalhada: z.string().optional(),
  autor_responsavel: z.string().optional(),
  sessao_id: z.number().int('ID da sessão inválido'),
});

// GET - Lista todos os projetos (com filtro por sessão)
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
    const { searchParams } = new URL(request.url);
    const sessaoId = searchParams.get('sessao_id');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (sessaoId) {
      where.sessao_id = parseInt(sessaoId);
    }
    if (payload.tipo !== 'ADMIN') {
      where.sessao = {
        ...(payload.tipo === 'GESTOR'
          ? {
              OR: [
                { criador_id: payload.usuario_id },
                { comunidade: { criador_id: payload.usuario_id } },
              ],
            }
          : {
              comunidade: {
                membros: {
                  some: { usuario_id: payload.usuario_id },
                },
              },
            }),
      };
    }
    const projetos = await prisma.projetos.findMany({
      where,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        titulo: true,
        descricao_detalhada: true,
        autor_responsavel: true,
        sessao_id: true,
        sessao: {
          select: { titulo: true, comunidade_id: true },
        },
        _count: {
          select: { votos: true },
        },
      },
    });
    return NextResponse.json({ data: projetos });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar projetos' },
      { status: 500 }
    );
  }
}

// POST - Cria um novo projeto
// Apenas admin e gestor podem criar projetos
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = projetoSchema.parse(body);
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
    if (payload.tipo === 'PARTICIPANTE') {
      return NextResponse.json(
        { error: 'Apenas administradores e gestores podem criar projetos' },
        { status: 403 }
      );
    }
    const sessao = await prisma.sessoes.findUnique({
      where: { id: validatedData.sessao_id },
      include: {
        comunidade: {
          include: {
            membros: {
              where: { usuario_id: payload.usuario_id },
            },
          },
        },
      },
    });
    if (!sessao) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }
    if (payload.tipo !== 'ADMIN') {
      const isAuthorized =
        sessao.criador_id === payload.usuario_id ||
        sessao.comunidade?.criador_id === payload.usuario_id ||
        (sessao.comunidade?.membros && sessao.comunidade.membros.length > 0);
      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Você não tem permissão para criar projetos nesta sessão' },
          { status: 403 }
        );
      }
    }
    const projeto = await prisma.projetos.create({
      data: {
        titulo: validatedData.titulo,
        descricao_detalhada: validatedData.descricao_detalhada,
        autor_responsavel: validatedData.autor_responsavel,
        sessao_id: validatedData.sessao_id,
      },
    });
    return NextResponse.json(
      { data: projeto, message: 'Projeto criado com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Já existe um projeto com este título na sessão' },
          { status: 409 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Sessão não encontrada' },
          { status: 404 }
        );
      }
    }
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    );
  }
}