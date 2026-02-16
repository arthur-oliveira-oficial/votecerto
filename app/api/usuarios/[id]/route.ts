/**
 * API de usuário por ID
 * Gerencia operações em um usuário específico (PUT, DELETE)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Schema de validação para atualização de usuário
const usuarioUpdateSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password_hash: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  tipo: z.enum(['ADMIN', 'PARTICIPANTE']).optional(),
  nome: z.string().optional(),
  cpf: z.string().optional(),
  senha_atual: z.string().optional(), // Necessário para validar quando mudar senha
});

// PUT - Atualiza dados de um usuário
// Pode atualizar email, senha e tipo
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = usuarioUpdateSchema.parse(body);
    const data: Record<string, unknown> = {};

    // Se estiver tentando mudar a senha, validar a senha atual
    if (validatedData.password_hash) {
      if (!validatedData.senha_atual) {
        return NextResponse.json(
          { error: 'Senha atual é obrigatória para alterar a senha' },
          { status: 400 }
        );
      }
      // Buscar usuário atual para verificar senha
      const usuarioAtual = await prisma.usuarios.findUnique({
        where: { id: parseInt(id) },
        select: { password_hash: true },
      });
      if (!usuarioAtual) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }
      // Verificar senha atual
      const senhaValida = await bcrypt.compare(
        validatedData.senha_atual,
        usuarioAtual.password_hash
      );
      if (!senhaValida) {
        return NextResponse.json(
          { error: 'Senha atual incorreta' },
          { status: 401 }
        );
      }
      // Agora pode alterar a senha
      data.password_hash = await bcrypt.hash(validatedData.password_hash, 10);
    }

    if (validatedData.email) data.email = validatedData.email;
    if (validatedData.tipo) data.tipo = validatedData.tipo;
    if (validatedData.nome !== undefined) data.nome = validatedData.nome || null;
    if (validatedData.cpf !== undefined) data.cpf = validatedData.cpf || null;
    const usuario = await prisma.usuarios.update({
      where: { id: parseInt(id) },
      data,
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
    return NextResponse.json({
      data: usuario,
      message: 'Usuário atualizado com sucesso',
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
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um usuário com este email' },
        { status: 409 }
      );
    }
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

// DELETE - Exclui um usuário do sistema
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.usuarios.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({
      message: 'Usuário excluído com sucesso',
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    );
  }
}