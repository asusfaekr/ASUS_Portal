"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

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
    } catch (error) {
      console.error("Login error:", error)
      setMessage({ type: "error", text: "로그인 중 오류가 발생했습니다." })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: "",
            company: "",
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

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">비밀번호</Label>
            <button type="button" onClick={handleForgotPassword} className="text-xs text-blue-600 hover:underline">
              비밀번호 찾기
            </button>
          </div>
          <Input
            id="password"
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

      <div className="text-center">
        <p className="text-sm text-muted-foreground">계정이 없으신가요?</p>
        <Button variant="outline" className="mt-2 w-full" onClick={handleSignUp} disabled={loading}>
          {loading ? "처리 중..." : "회원가입"}
        </Button>
      </div>
    </div>
  )
}
