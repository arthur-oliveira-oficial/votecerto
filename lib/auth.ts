import { SignJWT, jwtVerify } from 'jose';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-for-development-only'
);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export interface TokenPayload {
  usuario_id: number;
  email: string;
  tipo: 'ADMIN' | 'GESTOR' | 'PARTICIPANTE';
}
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  return cookies['auth_token'] || null;
}
export function createAuthCookie(token: string): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  const isSecure = process.env.NODE_ENV === 'production';
  return `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax${
    isSecure ? '; Secure' : ''
  }; Expires=${expires.toUTCString()}`;
}
export function clearAuthCookie(): string {
  return 'auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}