"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRoles?: number[]
  redirectTo?: string
}

export function RoleGuard({ children, requiredRoles, redirectTo = "/login" }: RoleGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push(`${redirectTo}?redirectedFrom=${window.location.pathname}`)
      return
    }

    // 특정 역할이 필요한 경우 확인
    if (requiredRoles && requiredRoles.length > 0) {
      if (!user.role_id || !requiredRoles.includes(user.role_id)) {
        setAuthorized(false)
        return
      }
    }

    setAuthorized(true)
  }, [user, loading, requiredRoles, redirectTo, router])

  // 로딩 중
  if (loading || authorized === null) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 권한 없음
  if (!authorized) {
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
