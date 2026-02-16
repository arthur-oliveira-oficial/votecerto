/**
 * API de autenticação - Logout
 * Remove o cookie de autenticação do usuário
 */

import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

// DELETE - Realiza logout limpando o cookie de autenticação
export async function DELETE() {
  const response = NextResponse.json({
    message: 'Logout realizado com sucesso',
  });
  response.headers.set('Set-Cookie', clearAuthCookie());
  return response;
}