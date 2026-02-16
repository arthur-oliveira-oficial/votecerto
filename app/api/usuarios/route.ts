/**
 * API de usuários
 * Gerencia CRUD completo de usuários do sistema
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Schema de validação para criação de usuário
const usuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  password_hash: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  tipo: z.enum(['ADMIN', 'GESTOR', 'PARTICIPANTE']),
  nome: z.string().optional(),
  cpf: z.string().optional(),
});

// GET - Lista todos os usuários do sistema
export async function GET() {
  try {
    const usuarios = await prisma.usuarios.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        email: true,
        tipo: true,
        nome: true,
        data_criacao: true,
        ultimo_acesso: true,
      },
    });
    return NextResponse.json({ data: usuarios });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}

// POST - Cria um novo usuário
// Requer email único e senha hashada
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = usuarioSchema.parse(body);
    const password_hash = await bcrypt.hash(validatedData.password_hash, 10);
    const usuario = await prisma.usuarios.create({
      data: {
        email: validatedData.email,
        password_hash,
        tipo: validatedData.tipo,
        nome: validatedData.nome || null,
        cpf: validatedData.cpf || null,
      },
      select: {
        id: true,
        email: true,
        tipo: true,
        nome: true,
        cpf: true,
        data_criacao: true,
        ultimo_acesso: true,
      },
    });
    return NextResponse.json(
      { data: usuario, message: 'Usuário criado com sucesso' },
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
      const prismaError = error as { meta?: { target?: string[] } };
      const target = prismaError.meta?.target;
      if (target?.includes('cpf')) {
        return NextResponse.json(
          { error: 'Já existe um usuário com este CPF' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Já existe um usuário com este email' },
        { status: 409 }
      );
    }
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}