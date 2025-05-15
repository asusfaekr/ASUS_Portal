import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ROLES } from "./lib/constants"

export async function middleware(req: NextRequest) {
  // 응답 객체 생성
  const res = NextResponse.next()

  try {
    // Supabase 클라이언트 생성
    const supabase = createMiddlewareClient({ req, res })

    // 세션 가져오기
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
    const protectedRoutes = [
      "/fae-portal",
      "/sales-portal",
      "/marketing-portal",
      "/create-post",
      "/profile",
      "/post",
      "/tech-library",
    ]

    // 현재 경로가 보호된 경로인지 확인
    const isProtectedRoute = protectedRoutes.some(
      (route) => req.nextUrl.pathname.startsWith(route) || req.nextUrl.pathname === route,
    )

    // 디버깅을 위한 로그
    console.log(`Path: ${req.nextUrl.pathname}, Protected: ${isProtectedRoute}, Session: ${session ? "Yes" : "No"}`)

    // 로그인이 필요한 페이지에 접근하려는데 로그인이 안 되어 있으면 로그인 페이지로 리다이렉트
    if (isProtectedRoute && !session) {
      console.log("No session found, redirecting to login")
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 역할 기반 접근 제어 및 이메일 인증 확인
    if (session) {
      // 사용자 정보 가져오기 (역할 및 인증 상태)
      const { data: userData, error } = await supabase
        .from("users")
        .select("role_id, is_verified")
        .eq("id", session.user.id)
        .single()

      // 사용자 정보를 가져오는 데 실패한 경우 (예: 데이터베이스 오류)
      if (error) {
        console.error("Error fetching user data:", error)
        // 오류가 발생해도 기본적으로 접근을 허용합니다.
        return res
      }

      // 이메일 인증이 완료되지 않은 경우 로그인 페이지로 리다이렉트
      if (userData && !userData.is_verified && req.nextUrl.pathname !== "/login") {
        await supabase.auth.signOut() // 세션 종료
        return NextResponse.redirect(new URL("/login?error=not_verified", req.url))
      }

      // 역할 기반 접근 제어
      if (userData && isProtectedRoute) {
        const userRoleId = userData.role_id

        // 현재 경로에 대한 역할 제한 확인
        for (const [path, allowedRoles] of Object.entries(roleRestrictedPaths)) {
          if (req.nextUrl.pathname.startsWith(path)) {
            // 사용자에게 필요한 역할이 없으면 접근 거부
            if (!userRoleId || !allowedRoles.includes(userRoleId)) {
              return NextResponse.redirect(new URL("/access-denied", req.url))
            }
          }
        }
      }

      // 세션 정보를 응답 헤더에 추가하여 클라이언트에서 사용할 수 있도록 함
      res.headers.set("x-user-authenticated", "true")
      res.headers.set("x-user-id", session.user.id)
    }

    // 이미 로그인한 사용자가 로그인 페이지에 접근하면 홈으로 리다이렉트
    if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") && session) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // 미들웨어 오류 시 기본 응답 반환
    return res
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
