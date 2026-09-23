import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function proxy(request: NextRequest) {
  try {
    const session = await auth();
    const pathname = request.nextUrl.pathname;
    const isDashboard = pathname.startsWith('/dashboard');
    const isLoginPage = pathname === '/login';

    const basePath = '/khamar_khata';

    if (isDashboard && !session?.user) {
      const loginUrl = new URL(`${basePath}/login`, request.nextUrl);
      return NextResponse.redirect(loginUrl);
    }

    if (isLoginPage && session?.user) {
      const dashboardUrl = new URL(`${basePath}/dashboard`, request.nextUrl);
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Proxy Error]:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)',
  ],
};
