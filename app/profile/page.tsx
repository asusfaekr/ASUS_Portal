"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { AuthCheck } from "@/components/auth/auth-check"

function ProfileContent() {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    role: "Other", // Updated default value to be a non-empty string
    department: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        role: profile.role || "Other", // Updated default value to be a non-empty string
        department: profile.department || "",
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email || "",
        full_name: formData.full_name || null,
        role: formData.role || null,
        department: formData.department || null,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      await refreshProfile()
      alert("프로필이 성공적으로 업데이트되었습니다!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("프로필 업데이트 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>프로필 설정</CardTitle>
          <CardDescription>개인 정보를 업데이트하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" value={user?.email || ""} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">이름</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">역할</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="역할을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Other">선택 안함</SelectItem>
                  <SelectItem value="FAE">FAE</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Technical Support">Technical Support</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Engineer">Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">부서</Label>
              <Input
                id="department"
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="부서를 입력하세요"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "저장 중..." : "프로필 저장"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthCheck>
      <ProfileContent />
    </AuthCheck>
  )
}
