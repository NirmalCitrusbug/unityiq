import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken");
  const {pathname} = request.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");
  const isRootPage = pathname === "/";

  // Handle root path
  if (isRootPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Handle auth page access
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle protected routes
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth"],
};
