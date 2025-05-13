"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { XCircle, AlertTriangle, Info } from "lucide-react"

export function SupabaseStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "not_configured">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkSupabaseConfig = () => {
      // 환경 변수 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        setStatus("not_configured")
        setErrorMessage("Supabase 환경 변수가 설정되지 않았습니다.")
        return
      }

      // URL 유효성 검사
      try {
        new URL(supabaseUrl)
        setStatus("success")
      } catch (error) {
        setStatus("error")
        setErrorMessage(`Supabase URL이 유효하지 않습니다: ${supabaseUrl}`)
      }
    }

    checkSupabaseConfig()
  }, [])

  if (status === "loading") {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <span>Supabase 설정 확인 중...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "not_configured") {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Supabase 설정 필요</AlertTitle>
        <AlertDescription>
          <p className="mb-2">{errorMessage}</p>
          <p>Vercel 프로젝트 설정에서 다음 환경 변수를 설정해주세요:</p>
          <ul className="list-disc pl-5 mt-2 mb-2">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>SUPABASE_SERVICE_ROLE_KEY</li>
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className="mb-6">
        <XCircle className="h-5 w-5" />
        <AlertTitle>Supabase 설정 오류</AlertTitle>
        <AlertDescription>
          <p className="mb-2">{errorMessage}</p>
          <p>현재 설정된 값: {process.env.NEXT_PUBLIC_SUPABASE_URL || "설정되지 않음"}</p>
          <p className="mt-2">Supabase URL은 "https://"로 시작하는 유효한 URL이어야 합니다.</p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="mb-6 bg-green-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-700">Supabase가 올바르게 구성되었습니다.</span>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t border-green-200 text-xs text-green-600">
        환경 변수가 설정되었지만 실제 연결은 아직 테스트되지 않았습니다.
      </CardFooter>
    </Card>
  )
}
