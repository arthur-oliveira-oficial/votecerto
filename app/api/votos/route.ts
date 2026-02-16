/**
 * API de votos
 * Gerencia CRUD completo de votos em sessões de votação
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

// Schema de validação para criação de voto
const votoSchema = z.object({
  comentario: z.string().optional(),
  sessao_id: z.number().int('ID da sessão inválido'),
  projeto_id: z.number().int('ID do projeto inválido'),
});

// GET - Lista votos com filtros por sessão e projeto
// Participantes veem apenas seus próprios votos
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
    const projetoId = searchParams.get('projeto_id');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (sessaoId) where.sessao_id = parseInt(sessaoId);
    if (projetoId) where.projeto_id = parseInt(projetoId);
    if (payload.tipo === 'PARTICIPANTE') {
      where.usuario_id = payload.usuario_id;
    } else if (payload.tipo === 'GESTOR') {
      where.sessao = {
        OR: [
          { criador_id: payload.usuario_id },
          { comunidade: { criador_id: payload.usuario_id } },
        ],
      };
    }
    const votos = await prisma.votos.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, cpf: true },
        },
        projeto: {
          select: { id: true, titulo: true },
        },
        sessao: {
          select: { id: true, titulo: true },
        },
      },
    });
    return NextResponse.json({ data: votos });
  } catch (error) {
    console.error('Erro ao buscar votos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar votos' },
      { status: 500 }
    );
  }
}

// POST - Registra um novo voto em uma sessão
// Apenas participantes podem votar, apenas um voto por sessão
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
    if (payload.tipo !== 'PARTICIPANTE') {
      return NextResponse.json(
        { error: 'Apenas participantes podem votar' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const validatedData = votoSchema.parse(body);
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
    const agora = new Date();
    if (!sessao.ativa || sessao.data_inicio > agora || sessao.data_fim < agora) {
      return NextResponse.json(
        { error: 'A sessão de votação não está ativa' },
        { status: 400 }
      );
    }
    if (sessao.comunidade_id && (!sessao.comunidade || sessao.comunidade.membros.length === 0)) {
      return NextResponse.json(
        { error: 'Você não é membro desta comunidade' },
        { status: 403 }
      );
    }
    const projeto = await prisma.projetos.findFirst({
      where: {
        id: validatedData.projeto_id,
        sessao_id: validatedData.sessao_id,
      },
    });
    if (!projeto) {
      return NextResponse.json(
        { error: 'Projeto não encontrado nesta sessão' },
        { status: 404 }
      );
    }
    const voto = await prisma.votos.create({
      data: {
        comentario: validatedData.comentario,
        sessao_id: validatedData.sessao_id,
        projeto_id: validatedData.projeto_id,
        usuario_id: payload.usuario_id,
      },
      include: {
        projeto: {
          select: { id: true, titulo: true },
        },
        sessao: {
          select: { id: true, titulo: true },
        },
      },
    });
    return NextResponse.json(
      { data: voto, message: 'Voto registrado com sucesso' },
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
          { error: 'Este participante já votou nesta sessão' },
          { status: 409 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Sessão ou projeto não encontrado' },
          { status: 404 }
        );
      }
    }
    console.error('Erro ao registrar voto:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar voto' },
      { status: 500 }
    );
  }
}