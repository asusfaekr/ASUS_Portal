"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AuthCheckProps {
  children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
  const { user, loading } = useAuth()
  const [showAuthAlert, setShowAuthAlert] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // 로딩이 완료되고 사용자가 없는 경우 알림 표시
    if (!loading && !user) {
      setShowAuthAlert(true)
    }
  }, [user, loading])

  const handleLogin = () => {
    router.push("/login")
  }

  return (
    <>
      {!loading && user ? (
        children
      ) : (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">인증 확인 중...</p>
        </div>
      )}

      <AlertDialog open={showAuthAlert} onOpenChange={setShowAuthAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그인이 필요합니다</AlertDialogTitle>
            <AlertDialogDescription>
              이 페이지에 접근하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLogin}>로그인하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
