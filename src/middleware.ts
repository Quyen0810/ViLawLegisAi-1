import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes - không cần auth
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/verify'
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Protected routes - cần auth
  const protectedRoutes = [
    '/chat',
    '/documents',
    '/contract',
    '/legal',
    '/dashboard',
    '/payment'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Nếu là protected route và chưa login, redirect về login
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/auth/login?redirect=${callbackUrl}`, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Áp dụng cho tất cả routes trừ static files và api
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)' 
  ],
}