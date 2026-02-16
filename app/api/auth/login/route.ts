/**
 * API de autenticação - Login
 * Realiza login de usuário e retorna token JWT
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, createAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validação dos campos de entrada
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// POST - Realiza autenticação do usuário
// Valida credenciais, verifica senha e cria token JWT
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const usuario = await prisma.usuarios.findUnique({
      where: { email: validatedData.email },
    });
    if (!usuario) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }
    const senhaValida = await bcrypt.compare(
      validatedData.password,
      usuario.password_hash
    );
    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }
    const token = await signToken({
      usuario_id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo as 'ADMIN' | 'PARTICIPANTE',
    });
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: { ultimo_acesso: new Date() },
    });
    const response = NextResponse.json({
      data: {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
      },
      message: 'Login realizado com sucesso',
    });
    response.headers.set('Set-Cookie', createAuthCookie(token));
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro ao realizar login' },
      { status: 500 }
    );
  }
}