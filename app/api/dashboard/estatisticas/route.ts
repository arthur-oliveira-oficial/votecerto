/**
 * API de estatísticas do dashboard
 * Retorna todos os dados necessários para o dashboard em uma única requisição
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

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

    // Executar todas as queries em paralelo para melhor performance
    const [usuarios, sessoes, projetos, votos] = await Promise.all([
      prisma.usuarios.findMany({
        select: {
          id: true,
          email: true,
          tipo: true,
          nome: true,
          cpf: true,
          data_criacao: true,
        },
      }),
      prisma.sessoes.findMany({
        orderBy: { id: 'asc' },
        include: {
          comunidade: {
            select: { id: true, nome: true },
          },
          _count: {
            select: { projetos: true, votos: true },
          },
        },
      }),
      prisma.projetos.findMany({
        include: {
          sessao: {
            select: { id: true, titulo: true },
          },
          _count: {
            select: { votos: true },
          },
        },
      }),
      prisma.votos.findMany({
        include: {
          usuario: {
            select: { id: true, nome: true, cpf: true, email: true },
          },
          projeto: {
            select: { id: true, titulo: true },
          },
          sessao: {
            select: { id: true, titulo: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        usuarios,
        sessoes,
        projetos,
        votos,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas do dashboard' },
      { status: 500 }
    );
  }
}
