import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/setup"]
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (sessionToken && isPublicRoute && request.nextUrl.pathname === "/") {
    // If user has session and trying to access login page, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
