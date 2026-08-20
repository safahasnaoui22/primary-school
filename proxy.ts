import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const roleHome: Record<string, string> = {
  SUPER_ADMIN: '/dashboard/super-admin',
  SCHOOL_OWNER: '/dashboard/school-owner',
  TEACHER: '/dashboard/teacher',
  PARENT: '/dashboard/parent',
};

// Routes any authenticated user (regardless of role) is allowed to visit,
// without being forced back to their own dashboard root.
const sharedAuthenticatedRoutes = ['/dashboard/messages'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isProtected = pathname.startsWith('/dashboard');
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isSharedRoute = sharedAuthenticatedRoutes.some((r) => pathname.startsWith(r));

  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL(roleHome[session.user.role] ?? '/dashboard', req.url));
  }

  if (session && isProtected && !isSharedRoute) {
    const allowedBase = roleHome[session.user.role];
    if (allowedBase && !pathname.startsWith(allowedBase)) {
      return NextResponse.redirect(new URL(allowedBase, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};