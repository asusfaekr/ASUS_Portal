import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span> {activity.action}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const activities = [
  {
    user: { name: "김철수", avatar: "/placeholder.svg?height=32&width=32" },
    action: "님이 새 게시글을 작성했습니다.",
    time: "10분 전",
  },
  {
    user: { name: "이영희", avatar: "/placeholder.svg?height=32&width=32" },
    action: "님이 회원님의 게시글에 댓글을 남겼습니다.",
    time: "30분 전",
  },
  {
    user: { name: "박지민", avatar: "/placeholder.svg?height=32&width=32" },
    action: "님이 레벨 4로 승급했습니다.",
    time: "1시간 전",
  },
  {
    user: { name: "최동욱", avatar: "/placeholder.svg?height=32&width=32" },
    action: "님이 회원님의 댓글을 좋아합니다.",
    time: "2시간 전",
  },
  {
    user: { name: "정수민", avatar: "/placeholder.svg?height=32&width=32" },
    action: "님이 새 게시글을 작성했습니다.",
    time: "3시간 전",
  },
]
