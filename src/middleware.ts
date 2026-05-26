import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export const middleware = withAuth(
  (req) => {
    // If user is on auth pages and already authenticated, redirect to dashboard
    if (req.nextUrl.pathname.startsWith('/auth') && req.nextauth.token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow auth pages and home page without token
        if (req.nextUrl.pathname.match(/^\/auth\//)) {
          return true;
        }
        // Allow the email verification page without requiring auth
        if (req.nextUrl.pathname.startsWith('/verify-email')) {
          return true;
        }
        if (req.nextUrl.pathname === '/') {
          return true;
        }
        // Require token for all other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};
