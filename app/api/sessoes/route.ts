/**
 * API de sessões de votação
 * Gerencia CRUD completo de sessões de votação
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// Schema de validação para criação de sessão
const sessaoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().nullable().optional(),
  comunidade_id: z.number().int().positive('Comunidade é obrigatória'),
  data_inicio: z.string({ message: 'Data de início inválida' })
    .min(1, 'Data de início é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Data de início inválida')
    .transform((str) => new Date(str + ':00Z').toISOString()),
  data_fim: z.string({ message: 'Data de fim inválida' })
    .min(1, 'Data de fim é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Data de fim inválida')
    .transform((str) => new Date(str + ':00Z').toISOString()),
  ativa: z.boolean().optional().default(true),
});

// GET - Lista todas as sessões de votação
// Retorna sessões conforme tipo de usuário (admin, gestor ou participante)
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
    const ativa = searchParams.get('ativa');
    const comunidade_id = searchParams.get('comunidade_id');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (ativa !== null) {
      where.ativa = ativa === 'true';
    }
    if (payload.tipo === 'ADMIN') {
    } else if (payload.tipo === 'GESTOR') {
      where.OR = [
        { criador_id: payload.usuario_id },
        { comunidade: { criador_id: payload.usuario_id } },
      ];
    } else {
      where.comunidade = {
        membros: {
          some: { usuario_id: payload.usuario_id },
        },
      };
    }
    if (comunidade_id) {
      where.comunidade_id = parseInt(comunidade_id);
    }
    const sessoes = await prisma.sessoes.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        comunidade: {
          select: { id: true, nome: true },
        },
        _count: {
          select: { projetos: true, votos: true },
        },
      },
    });
    return NextResponse.json({ data: sessoes });
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar sessões' },
      { status: 500 }
    );
  }
}

// POST - Cria uma nova sessão de votação
// Apenas admin e gestor podem criar sessões
export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Executar validação de token e parsing do body em paralelo
    const [payload, body] = await Promise.all([
      verifyToken(token),
      request.json()
    ]);

    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const validatedData = sessaoSchema.parse(body);

    if (payload.tipo === 'PARTICIPANTE') {
      return NextResponse.json(
        { error: 'Apenas administradores e gestores podem criar sessões' },
        { status: 403 }
      );
    }
    const comunidade = await prisma.comunidades.findUnique({
      where: { id: validatedData.comunidade_id },
      include: {
        membros: {
          where: { usuario_id: payload.usuario_id },
        },
      },
    });
    if (!comunidade) {
      return NextResponse.json(
        { error: 'Comunidade não encontrada' },
        { status: 404 }
      );
    }
    if (payload.tipo !== 'ADMIN') {
      const isCriadorOuMembro =
        comunidade.criador_id === payload.usuario_id ||
        comunidade.membros.length > 0;
      if (!isCriadorOuMembro) {
        return NextResponse.json(
          { error: 'Você não tem permissão para criar sessões nesta comunidade' },
          { status: 403 }
        );
      }
    }
    const sessao = await prisma.sessoes.create({
      data: {
        titulo: validatedData.titulo,
        descricao: validatedData.descricao,
        data_inicio: new Date(validatedData.data_inicio),
        data_fim: new Date(validatedData.data_fim),
        ativa: validatedData.ativa,
        criador_id: payload.usuario_id,
        comunidade_id: validatedData.comunidade_id,
      },
    });
    return NextResponse.json(
      { data: sessao, message: 'Sessão criada com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }
    console.error('Erro ao criar sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão' },
      { status: 500 }
    );
  }
}