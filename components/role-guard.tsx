"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function RoleGuard({ children, allowedRoles = [] }: RoleGuardProps) {
  const { user, loading, userRole } = useAuth()
  const [showAuthAlert, setShowAuthAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setAlertMessage("이 페이지에 접근하려면 로그인이 필요합니다.")
        setShowAuthAlert(true)
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(userRole || "")) {
        setAlertMessage("이 페이지에 접근할 권한이 없습니다.")
        setShowAuthAlert(true)
      }
    }
  }, [user, loading, userRole, allowedRoles])

  const handleLogin = () => {
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">권한 확인 중...</p>
      </div>
    )
  }

  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(userRole || ""))) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">접근 권한을 확인하는 중...</p>
        </div>

        <AlertDialog open={showAuthAlert} onOpenChange={setShowAuthAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>접근 제한</AlertDialogTitle>
              <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleLogin}>로그인하기</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return <>{children}</>
}
