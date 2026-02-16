/**
 * API de comunidades
 * Gerencia CRUD completo de comunidades
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import crypto from 'crypto';

// Schema de validação para criação de comunidade
const comunidadeSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  descricao: z.string().optional(),
});
function gerarCodigo(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// GET - Lista todas as comunidades
// Admin vê todas as comunidades, outros usuários veem apenas código se não for admin
export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    let isAdmin = false;
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.tipo === 'ADMIN') {
        isAdmin = true;
      }
    }
    const comunidades = await prisma.comunidades.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        nome: true,
        descricao: true,
        codigo: !isAdmin,
        data_criacao: true,
        criador_id: true,
        _count: {
          select: { membros: true, sessoes: true },
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

// POST - Cria uma nova comunidade
// Apenas usuários com tipo GESTOR podem criar comunidades
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
    if (payload.tipo !== 'GESTOR') {
      return NextResponse.json(
        { error: 'Apenas gestores podem criar comunidades' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const validatedData = comunidadeSchema.parse(body);
    let codigo = gerarCodigo();
    let codigoExistente = await prisma.comunidades.findUnique({
      where: { codigo },
      select: { id: true },
    });
    while (codigoExistente) {
      codigo = gerarCodigo();
      codigoExistente = await prisma.comunidades.findUnique({
        where: { codigo },
        select: { id: true },
      });
    }
    const comunidade = await prisma.comunidades.create({
      data: {
        nome: validatedData.nome,
        descricao: validatedData.descricao || null,
        codigo,
        criador_id: payload.usuario_id,
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        codigo: true,
        data_criacao: true,
      },
    });
    await prisma.participantes.create({
      data: {
        usuario_id: payload.usuario_id,
        comunidade_id: comunidade.id,
      },
    });
    return NextResponse.json(
      { data: comunidade, message: 'Comunidade criada com sucesso' },
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
        { error: 'Já existe uma comunidade com este nome' },
        { status: 409 }
      );
    }
    console.error('Erro ao criar comunidade:', error);
    return NextResponse.json(
      { error: 'Erro ao criar comunidade' },
      { status: 500 }
    );
  }
}