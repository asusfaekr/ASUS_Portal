"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { AuthCheck } from "@/components/auth/auth-check"

function ProfileContent() {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    role: "admin", // Updated default value
    department: "engineering", // Updated default value
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        role: profile.role || "admin", // Updated default value
        department: profile.department || "engineering", // Updated default value
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name || null,
          role: formData.role || "admin", // Updated default value
          department: formData.department || "engineering", // Updated default value
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

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

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">프로필 설정</h1>
          <p className="text-muted-foreground">개인 정보를 관리하고 업데이트하세요.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>프로필 정보를 입력하고 업데이트하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                <AvatarFallback className="text-lg">{getInitials(profile?.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{profile?.full_name || "사용자"}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">이름</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">역할</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="역할을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="manager">매니저</SelectItem>
                    <SelectItem value="developer">개발자</SelectItem>
                    <SelectItem value="designer">디자이너</SelectItem>
                    <SelectItem value="analyst">분석가</SelectItem>
                    <SelectItem value="support">지원팀</SelectItem>
                    <SelectItem value="sales">영업팀</SelectItem>
                    <SelectItem value="marketing">마케팅팀</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">부서</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="부서를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">엔지니어링</SelectItem>
                    <SelectItem value="product">제품팀</SelectItem>
                    <SelectItem value="design">디자인팀</SelectItem>
                    <SelectItem value="marketing">마케팅팀</SelectItem>
                    <SelectItem value="sales">영업팀</SelectItem>
                    <SelectItem value="support">고객지원팀</SelectItem>
                    <SelectItem value="hr">인사팀</SelectItem>
                    <SelectItem value="finance">재무팀</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "저장 중..." : "프로필 저장"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
            <CardDescription>계정 관련 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">이메일 주소</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">계정 생성일</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "정보 없음"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
