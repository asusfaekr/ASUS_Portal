"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageSquare, ThumbsUp, FileText, User, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"

// 임시 알림 데이터
const notifications = [
  {
    id: 1,
    type: "announcement",
    title: "새 공지사항",
    message: "중요 공지사항이 등록되었습니다.",
    time: "10분 전",
    read: false,
    link: "/post/1",
    user: { name: "관리자", avatar: "/placeholder.svg?height=32&width=32" },
  },
  {
    id: 2,
    type: "comment",
    title: "댓글 알림",
    message: "회원님의 게시글에 새 댓글이 달렸습니다.",
    time: "1시간 전",
    read: false,
    link: "/post/2",
    user: { name: "김철수", avatar: "/placeholder.svg?height=32&width=32" },
  },
  {
    id: 3,
    type: "like",
    title: "좋아요 알림",
    message: "회원님의 게시글에 좋아요가 추가되었습니다.",
    time: "3시간 전",
    read: true,
    link: "/post/3",
    user: { name: "이영희", avatar: "/placeholder.svg?height=32&width=32" },
  },
  {
    id: 4,
    type: "system",
    title: "시스템 알림",
    message: "시스템 점검 안내: 오늘 밤 12시부터 2시간 동안 서비스가 중단됩니다.",
    time: "1일 전",
    read: true,
    link: "/announcements",
    user: { name: "시스템", avatar: "/placeholder.svg?height=32&width=32" },
  },
  {
    id: 5,
    type: "document",
    title: "문서 알림",
    message: "새로운 기술 문서가 업로드되었습니다: A100 시리즈 사용자 매뉴얼",
    time: "2일 전",
    read: true,
    link: "/tech-library",
    user: { name: "박지민", avatar: "/placeholder.svg?height=32&width=32" },
  },
  {
    id: 6,
    type: "mention",
    title: "멘션 알림",
    message: "회원님이 댓글에서 언급되었습니다.",
    time: "3일 전",
    read: true,
    link: "/post/4",
    user: { name: "최동욱", avatar: "/placeholder.svg?height=32&width=32" },
  },
]

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(notifications)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  const handleNotificationClick = (notification) => {
    // 알림을 읽음 상태로 변경
    setNotifs((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))

    // 해당 링크로 이동
    router.push(notification.link)
  }

  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // 탭에 따라 필터링된 알림 목록
  const filteredNotifications = notifs.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return notification.type === activeTab
  })

  // 읽지 않은 알림 수
  const unreadCount = notifs.filter((n) => !n.read).length

  return (
    <RoleGuard>
      <div className="container py-10 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">알림</CardTitle>
                <CardDescription>모든 알림을 확인하고 관리하세요</CardDescription>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  <Check className="mr-2 h-4 w-4" />
                  모두 읽음 표시
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  전체
                  {unreadCount > 0 && <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="unread">읽지 않음</TabsTrigger>
                <TabsTrigger value="announcement">공지사항</TabsTrigger>
                <TabsTrigger value="comment">댓글</TabsTrigger>
                <TabsTrigger value="like">좋아요</TabsTrigger>
                <TabsTrigger value="document">문서</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg hover:bg-accent cursor-pointer ${notification.read ? "" : "bg-blue-50 dark:bg-blue-900/10"}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{notification.title}</span>
                                {!notification.read && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                              </div>
                              <span className="text-xs text-muted-foreground">{notification.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <div className="flex items-center gap-2 pt-1">
                              <NotificationTypeIcon type={notification.type} />
                              <span className="text-xs text-muted-foreground">{notification.user.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                    <p>알림이 없습니다.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}

function NotificationTypeIcon({ type }) {
  switch (type) {
    case "announcement":
      return <Bell className="h-4 w-4 text-blue-500" />
    case "comment":
      return <MessageSquare className="h-4 w-4 text-green-500" />
    case "like":
      return <ThumbsUp className="h-4 w-4 text-red-500" />
    case "document":
      return <FileText className="h-4 w-4 text-purple-500" />
    case "mention":
      return <User className="h-4 w-4 text-orange-500" />
    case "system":
      return <Bell className="h-4 w-4 text-gray-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}
