"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nickname: "", // 닉네임 필드 추가
    position: "", // 직책 필드 추가
    role: "0", // 역할 필드 추가
  })

  // URL 파라미터 확인
  useEffect(() => {
    const verified = searchParams.get("verified")
    const error = searchParams.get("error")
    const redirectedFrom = searchParams.get("redirectedFrom")

    if (verified === "true") {
      setMessage({ type: "success", text: "이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다." })
    } else if (error === "verification_failed") {
      setMessage({ type: "error", text: "이메일 인증에 실패했습니다. 다시 시도해주세요." })
    } else if (error === "invalid_token") {
      setMessage({ type: "error", text: "유효하지 않은 인증 토큰입니다." })
    } else if (error === "verification_update_failed") {
      setMessage({ type: "error", text: "인증 상태 업데이트에 실패했습니다. 관리자에게 문의하세요." })
    } else if (error === "not_verified") {
      setMessage({
        type: "error",
        text: "이메일 인증이 완료되지 않았습니다. 받은 메일함을 확인하고 인증 링크를 클릭해주세요.",
      })
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // 로그인 시도
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        setMessage({ type: "error", text: signInError.message })
        setLoading(false)
        return
      }

      // 사용자 ID로 인증 상태 확인
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("is_verified")
        .eq("id", signInData.user.id)
        .single()

      if (userError) {
        setMessage({ type: "error", text: "사용자 정보를 확인할 수 없습니다." })
        // 로그아웃 처리
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // 이메일 인증이 완료되지 않은 경우
      if (!userData.is_verified) {
        setMessage({
          type: "error",
          text: "이메일 인증이 완료되지 않았습니다. 받은 메일함을 확인하고 인증 링크를 클릭해주세요.",
        })
        // 로그아웃 처리
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // 로그인 성공 시 항상 홈으로 이동
      console.log("Login successful, redirecting to home")

      // 세션 쿠키가 설정될 시간을 주기 위해 짧은 지연 추가
      setTimeout(() => {
        window.location.href = "/" // 항상 홈으로 이동
      }, 500)
    } catch (error) {
      console.error("Login error:", error)
      setMessage({ type: "error", text: "로그인 중 오류가 발생했습니다." })
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // 이메일 도메인 검증 (asus.com 도메인만 허용)
    if (!formData.email.endsWith("@asus.com")) {
      setMessage({ type: "error", text: "ASUS 이메일(@asus.com)만 가입이 가능합니다." })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/verify`,
          data: {
            full_name: formData.nickname,
            company: "ASUS",
            position: formData.position,
            role_id: formData.role ? Number.parseInt(formData.role) : null,
          },
        },
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
        return
      }

      setMessage({
        type: "success",
        text: "가입 확인 이메일이 발송되었습니다. 이메일을 확인하여 계정을 활성화해주세요.",
      })
    } catch (error) {
      console.error("Signup error:", error)
      setMessage({ type: "error", text: "회원가입 중 오류가 발생했습니다." })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setMessage({ type: "error", text: "비밀번호 재설정을 위해 이메일을 입력해주세요." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
        return
      }

      setMessage({
        type: "success",
        text: "비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.",
      })
    } catch (error) {
      console.error("Password reset error:", error)
      setMessage({ type: "error", text: "비밀번호 재설정 이메일 발송 중 오류가 발생했습니다." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : message.type === "success" ? "default" : "default"}>
          {message.type === "success" && <CheckCircle className="h-4 w-4 mr-2" />}
          {message.type === "error" && <AlertCircle className="h-4 w-4 mr-2" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">로그인</TabsTrigger>
          <TabsTrigger value="register">회원가입</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-login">이메일</Label>
              <Input
                id="email-login"
                type="email"
                name="email"
                placeholder="name@asus.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password-login">비밀번호</Label>
                <button type="button" onClick={handleForgotPassword} className="text-xs text-blue-600 hover:underline">
                  비밀번호 찾기
                </button>
              </div>
              <Input
                id="password-login"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "처리 중..." : "로그인"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="register" className="mt-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-register">이메일 (@asus.com)</Label>
              <Input
                id="email-register"
                type="email"
                name="email"
                placeholder="name@asus.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">ASUS 이메일(@asus.com)만 가입이 가능합니다.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname-register">닉네임</Label>
              <Input
                id="nickname-register"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position-register">직책</Label>
              <Input
                id="position-register"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="직책을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-register">역할</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="역할을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">선택 안함</SelectItem>
                  <SelectItem value="1">FAE</SelectItem>
                  <SelectItem value="2">Sales</SelectItem>
                  <SelectItem value="3">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-register">비밀번호</Label>
              <Input
                id="password-register"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">비밀번호는 최소 6자 이상이어야 합니다.</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "처리 중..." : "회원가입"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
