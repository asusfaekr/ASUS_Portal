"use client"

import { useEffect, useState } from "react"
import { ProfileCard } from "@/components/profile-card"
import { ForumPosts } from "@/components/forum-posts"
import { RewardSystem } from "@/components/reward-system"
import { ROLES } from "@/lib/constants"
import { Loader2, ShieldAlert } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SalesPortalPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 세션 직접 확인
        const { data: sessionData } = await supabase.auth.getSession()
        const currentSession = sessionData.session

        if (!currentSession) {
          console.log("No session found in SalesPortalPage")
          router.push("/login?redirectedFrom=/sales-portal")
          return
        }

        // 사용자 정보 직접 가져오기
        const { data: userData, error } = await supabase
          .from("users")
          .select("role_id, is_verified")
          .eq("id", currentSession.user.id)
          .single()

        if (error || !userData) {
          console.error("Error fetching user data:", error)
          setAuthorized(false)
          setLoading(false)
          return
        }

        // 이메일 인증 확인
        if (!userData.is_verified) {
          router.push("/login?error=not_verified")
          return
        }

        // 역할 확인
        if (!userData.role_id || userData.role_id !== ROLES.SALES) {
          setAuthorized(false)
          setLoading(false)
          return
        }

        setAuthorized(true)
        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        setAuthorized(false)
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

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

  return (
    <div className="container py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-3 space-y-6">
        <ProfileCard />
        <RewardSystem />
      </div>
      <div className="md:col-span-9">
        <ForumPosts defaultCategory="sales" />
      </div>
    </div>
  )
}
