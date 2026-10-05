import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "si"],
  defaultLocale: "en",
  localePrefix: "always",
});

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Determine requested locale (default to 'en')
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0] === 'si' ? 'si' : 'en';

  const isProtectedAdminRoute =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/en/admin' ||
    pathname.startsWith('/en/admin/') ||
    pathname === '/si/admin' ||
    pathname.startsWith('/si/admin/');

  if (isProtectedAdminRoute) {
    const adminToken = request.cookies.get('mpcs_admin_token')?.value;
    const isValidAdmin = adminToken && adminToken.startsWith('session_');

    if (!isValidAdmin) {
      // Directly block and redirect to login page
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const redirectRes = NextResponse.redirect(loginUrl);
      redirectRes.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      redirectRes.headers.set('Pragma', 'no-cache');
      redirectRes.headers.set('Expires', '0');
      return redirectRes;
    }
  }

  const response = intlMiddleware(request);

  // Set anti-cache headers on protected & authentication pages
  if (
    pathname.includes('/admin') ||
    pathname.includes('/login') ||
    pathname.includes('/api/auth')
  ) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/(en|si)/:path*",
    "/admin/:path*",
  ],
};
