"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    position: "",
    role: "0", // Updated default value to be a non-empty string
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // 사용자 정보가 로드되면 폼 데이터 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || "",
        company: user.company || "",
        position: user.position || "",
        role: user.role_id ? user.role_id.toString() : "0", // Updated default value to be a non-empty string
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // 사용자 메타데이터 업데이트
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          company: formData.company,
          position: formData.position,
        },
      })

      if (authError) {
        setMessage({ type: "error", text: authError.message })
        setLoading(false)
        return
      }

      // 사용자 프로필 업데이트
      const { error: profileError } = await supabase
        .from("users")
        .update({
          full_name: formData.fullName,
          company: formData.company,
          position: formData.position,
          role_id: formData.role ? Number.parseInt(formData.role) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)

      if (profileError) {
        setMessage({ type: "error", text: profileError.message })
        setLoading(false)
        return
      }

      // 사용자 정보 새로고침
      await refreshUser()

      setMessage({
        type: "success",
        text: "프로필이 성공적으로 업데이트되었습니다.",
      })
    } catch (error) {
      console.error("Profile update error:", error)
      setMessage({ type: "error", text: "프로필 업데이트 중 오류가 발생했습니다." })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">로그인이 필요합니다.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>프로필 설정</CardTitle>
          <CardDescription>개인 정보와 계정 설정을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" value={user.email} disabled />
              <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">닉네임</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">회사</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="회사명을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">직책</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="직책을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">역할</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="역할을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">선택 안함</SelectItem> // Updated value prop to be a non-empty string
                  <SelectItem value="1">FAE</SelectItem>
                  <SelectItem value="2">Sales</SelectItem>
                  <SelectItem value="3">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "저장 중..." : "저장"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
