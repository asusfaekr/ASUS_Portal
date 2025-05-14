import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get("token")
  const type = requestUrl.searchParams.get("type")

  // 이메일 인증 토큰이 있는지 확인
  if (!token || type !== "email") {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=invalid_token`)
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Supabase 인증 코드 교환
    const { data, error } = await supabase.auth.exchangeCodeForSession(token)

    if (error) {
      console.error("Verification error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=verification_failed`)
    }

    // 사용자 ID 가져오기
    const userId = data.user?.id

    if (userId) {
      // public.users 테이블에서 is_verified 상태 업데이트
      const { error: updateError } = await supabase
        .from("users")
        .update({ is_verified: true, updated_at: new Date().toISOString() })
        .eq("id", userId)

      if (updateError) {
        console.error("Update verification status error:", updateError)
      }
    }

    // 성공 메시지와 함께 로그인 페이지로 리다이렉트
    return NextResponse.redirect(`${requestUrl.origin}/login?verified=true`)
  } catch (error) {
    console.error("Verification process error:", error)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=verification_failed`)
  }
}
