"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"

export function ProfileCard() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground">로그인이 필요합니다</p>
          </div>
        </CardHeader>
      </Card>
    )
  }

  // 역할 이름 가져오기
  const getRoleName = () => {
    switch (user.role_id) {
      case 1:
        return "FAE"
      case 2:
        return "Sales"
      case 3:
        return "Marketing"
      default:
        return "일반 사용자"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 mb-2">
            <div className="w-20 h-20 bg-[#0a66c2] text-white flex items-center justify-center rounded-full text-3xl font-bold">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
          <h2 className="text-xl font-bold">{user.full_name || "사용자"}</h2>
          <p className="text-sm text-muted-foreground">{user.company || "회사 정보 없음"}</p>
          <div className="mt-2">
            <Badge className="bg-[#0a66c2]">{getRoleName()}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>이메일</span>
              <span className="font-medium">{user.email}</span>
            </div>
            {user.position && (
              <div className="flex justify-between text-sm">
                <span>직급</span>
                <span className="font-medium">{user.position}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
