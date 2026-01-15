import { NextRequest, NextResponse } from "next/server";
import { verify } from "hono/jwt";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;
  const isLogin = path.startsWith("/login");
  const isCampus = path.startsWith("/campus");
  const isAdmin = path.startsWith("/admin");

  if (isLogin && token) {
    return NextResponse.redirect(new URL("/campus", request.url));
  }

  if (isCampus && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdmin) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = await verify(token, process.env.JWT_SECRET!, "HS256");
      if (decoded.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/campus/:path*", "/admin/:path*"],
};
