import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ROLES } from "./lib/constants"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // 역할별 접근 제한 경로
    const roleRestrictedPaths = {
      "/fae-portal": [ROLES.FAE],
      "/sales-portal": [ROLES.SALES],
      "/marketing-portal": [ROLES.MARKETING],
    }

    // 로그인이 필요한 페이지 목록
    const protectedRoutes = ["/fae-portal", "/sales-portal", "/marketing-portal", "/create-post", "/profile"]
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    // 로그인이 필요한 페이지에 접근하려는데 로그인이 안 되어 있으면 로그인 페이지로 리다이렉트
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 역할 기반 접근 제어
    if (session) {
      try {
        // 사용자 역할 가져오기
        const { data: userData } = await supabase.from("users").select("role_id").eq("id", session.user.id).single()

        const userRoleId = userData?.role_id

        // 현재 경로에 대한 역할 제한 확인
        for (const [path, allowedRoles] of Object.entries(roleRestrictedPaths)) {
          if (req.nextUrl.pathname.startsWith(path)) {
            // 사용자에게 필요한 역할이 없으면 접근 거부
            if (!userRoleId || !allowedRoles.includes(userRoleId)) {
              return NextResponse.redirect(new URL("/access-denied", req.url))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error)
        // 오류 발생 시 기본적으로 접근 허용 (보안 정책에 따라 변경 가능)
      }
    }

    // 이미 로그인한 사용자가 로그인 페이지에 접근하면 홈으로 리다이렉트
    if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") && session) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  } catch (error) {
    console.error("Middleware error:", error)
    // 미들웨어 오류 시 기본 응답 반환
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
