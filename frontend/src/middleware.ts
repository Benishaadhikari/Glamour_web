import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname === '/profile' ||
    pathname === '/change-password' ||
    pathname.startsWith('/admin');
  const isAdminPath = pathname.startsWith('/admin');
  const isPublicAuthPath = pathname === '/login' || pathname === '/register';

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    const payload = decodeJwt(token);
    const role = payload?.role;

    if (isAdminPath && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isPublicAuthPath) {
      const target = role === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  if (pathname === '/' && token) {
    const payload = decodeJwt(token);
    const role = payload?.role;
    const target = role === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/dashboard/:path*', '/profile', '/change-password', '/admin/:path*'],
};
