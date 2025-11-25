import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const path = request.nextUrl.pathname
  const isLogin = path.startsWith("/login")
  const isCampus = path.startsWith("/campus")

  if (isLogin && token) {
    return NextResponse.redirect(new URL("/campus", request.url))
  }

  if (isCampus && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/campus/:path*"],
}
