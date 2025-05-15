"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRoles?: number[]
  redirectTo?: string
}

export function RoleGuard({ children, requiredRoles, redirectTo = "/login" }: RoleGuardProps) {
  const { user, loading, session } = useAuth()
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setCheckingAuth(true)

        // 세션 직접 확인
        const { data: sessionData } = await supabase.auth.getSession()
        const currentSession = sessionData.session

        if (!currentSession) {
          console.log("No session found in RoleGuard")
          // 세션이 없는 경우에만 리다이렉트
          router.push(redirectTo)
          return
        }

        // 사용자 정보 직접 가져오기
        const { data: userData, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", currentSession.user.id)
          .single()

        if (error || !userData) {
          console.error("Error fetching user data:", error)
          setAuthorized(false)
          return
        }

        // 이메일 인증 확인
        if (!userData.is_verified) {
          router.push("/login?error=not_verified")
          return
        }

        // 역할 확인
        if (requiredRoles && requiredRoles.length > 0) {
          if (!userData.role_id || !requiredRoles.includes(userData.role_id)) {
            setAuthorized(false)
            return
          }
        }

        setAuthorized(true)
      } catch (error) {
        console.error("Auth check error:", error)
        setAuthorized(false)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router, redirectTo, requiredRoles])

  // 로딩 중
  if (loading || checkingAuth) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 권한 없음
  if (authorized === false) {
    return (
      <div className="container py-10 max-w-3xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>접근 권한이 없습니다</AlertTitle>
          <AlertDescription>이 페이지에 접근하기 위한 권한이 없습니다. 관리자에게 문의하세요.</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")}>홈으로 돌아가기</Button>
      </div>
    )
  }

  // 권한 있음
  return <>{children}</>
}
