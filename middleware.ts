import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
const PUBLIC_ROUTES = ['/', '/auth/login', '/api/auth/login', '/api/auth/logout', '/api/usuarios'];
const ADMIN_ROUTES = ['/admin'];
const GESTOR_ROUTES = ['/gestor'];
const PARTICIPANTE_ROUTES = ['/participante'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }
    if (pathname === '/api/usuarios' && request.method === 'POST') {
      return NextResponse.next();
    }
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
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-usuario-id', String(payload.usuario_id));
    requestHeaders.set('x-usuario-tipo', payload.tipo);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  const token = getTokenFromRequest(request);
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  const payload = await verifyToken(token);
  if (!payload) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirecionar /dashboard para o dashboard correto do tipo de usuário
  if (pathname === '/dashboard') {
    if (payload.tipo === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (payload.tipo === 'GESTOR') {
      return NextResponse.redirect(new URL('/gestor/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/participante/dashboard', request.url));
    }
  }

  // Controle de acesso por tipo de usuário
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (payload.tipo !== 'ADMIN') {
      // Redirecionar para a área correta do usuário
      if (payload.tipo === 'GESTOR') {
        return NextResponse.redirect(new URL('/gestor/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/participante/dashboard', request.url));
    }
  } else if (GESTOR_ROUTES.some((route) => pathname.startsWith(route))) {
    // Gestor pode acessar /gestor/* e /admin/* (ADMIN também)
    if (payload.tipo !== 'GESTOR' && payload.tipo !== 'ADMIN') {
      return NextResponse.redirect(new URL('/participante/dashboard', request.url));
    }
  } else if (PARTICIPANTE_ROUTES.some((route) => pathname.startsWith(route))) {
    // Participante só pode acessar /participante/*
    if (payload.tipo !== 'PARTICIPANTE') {
      if (payload.tipo === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/gestor/dashboard', request.url));
    }
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-usuario-id', String(payload.usuario_id));
  requestHeaders.set('x-usuario-tipo', payload.tipo);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};