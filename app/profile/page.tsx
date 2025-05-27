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
import { useToast } from "@/components/ui/use-toast"
import { ProfileCard } from "@/components/profile-card"
import { RewardSystem } from "@/components/reward-system"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    position: "",
    role: "0",
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
        role: user.role_id ? user.role_id.toString() : "0",
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
        console.error("Profile update error:", profileError)
        setMessage({ type: "error", text: profileError.message })
        setLoading(false)
        return
      }

      // 사용자 정보 새로고침
      await refreshUser()

      // 성공 메시지 표시
      setMessage({
        type: "success",
        text: "프로필이 성공적으로 업데이트되었습니다.",
      })

      toast({
        title: "프로필 업데이트 완료",
        description: "프로필 정보가 성공적으로 저장되었습니다.",
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
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 프로필 정보 및 활동 정보 */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileCard />
          <RewardSystem />
        </div>

        {/* 프로필 설정 폼 */}
        <div className="lg:col-span-8">
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

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">기본 정보</TabsTrigger>
                  <TabsTrigger value="settings">계정 설정</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
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
                          <SelectItem value="0">선택 안함</SelectItem>
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
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">계정 설정</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">이메일 알림</h4>
                            <p className="text-sm text-muted-foreground">
                              새 댓글과 좋아요에 대한 이메일 알림을 받습니다.
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            설정
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">비밀번호 변경</h4>
                            <p className="text-sm text-muted-foreground">
                              계정 보안을 위해 정기적으로 비밀번호를 변경하세요.
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            변경
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">계정 삭제</h4>
                            <p className="text-sm text-muted-foreground">
                              계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                            </p>
                          </div>
                          <Button variant="destructive" size="sm">
                            삭제
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">개인정보 처리방침</h3>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          ASUS는 사용자의 개인정보를 보호하며, 관련 법령에 따라 안전하게 처리합니다. 자세한 내용은
                          개인정보 처리방침을 확인하세요.
                        </p>
                        <Button variant="link" className="p-0 h-auto mt-2">
                          개인정보 처리방침 보기
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
