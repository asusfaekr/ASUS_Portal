"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
        return
      }

      // 로그인 성공 시 홈으로 이동
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Login error:", error)
      setMessage({ type: "error", text: "로그인 중 오류가 발생했습니다." })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // 이메일 도메인 검증 (asus.com 도메인만 허용)
    if (!email.endsWith("@asus.com")) {
      setMessage({ type: "error", text: "ASUS 이메일(@asus.com)만 가입이 가능합니다." })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: "",
            company: "ASUS",
            position: "",
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
    if (!email) {
      setMessage({ type: "error", text: "비밀번호 재설정을 위해 이메일을 입력해주세요." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
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
                placeholder="name@asus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
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
                placeholder="name@asus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">ASUS 이메일(@asus.com)만 가입이 가능합니다.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-register">비밀번호</Label>
              <Input
                id="password-register"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">비밀번호는 최소 6자 이상이어야 합니다.</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "처리 중..." : "회원가입"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
