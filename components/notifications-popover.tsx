"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

// 임시 알림 데이터
const notifications = [
  {
    id: 1,
    title: "새 공지사항",
    message: "중요 공지사항이 등록되었습니다.",
    time: "10분 전",
    read: false,
    link: "/post/1",
    user: { name: "관리자", avatar: "/placeholder.svg?height=32&width=32" },
  },
  {
    id: 2,
    title: "댓글 알림",
    message: "회원님의 게시글에 새 댓글이 달렸습니다.",
    time: "1시간 전",
    read: false,
    link: "/post/2",
    user: { name: "김철수", avatar: "/placeholder.svg?height=32&width=32" },
  },
  {
    id: 3,
    title: "좋아요 알림",
    message: "회원님의 게시글에 좋아요가 추가되었습니다.",
    time: "3시간 전",
    read: true,
    link: "/post/3",
    user: { name: "이영희", avatar: "/placeholder.svg?height=32&width=32" },
  },
  {
    id: 4,
    title: "시스템 알림",
    message: "시스템 점검 안내: 오늘 밤 12시부터 2시간 동안 서비스가 중단됩니다.",
    time: "1일 전",
    read: true,
    link: "/announcements",
    user: { name: "시스템", avatar: "/placeholder.svg?height=32&width=32" },
  },
]

export function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState(notifications)
  const router = useRouter()

  const unreadCount = notifs.filter((n) => !n.read).length

  const handleNotificationClick = (notification) => {
    // 알림을 읽음 상태로 변경
    setNotifs((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))

    // 해당 링크로 이동
    router.push(notification.link)
    setOpen(false)
  }

  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">알림</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">알림</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              모두 읽음 표시
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifs.length > 0 ? (
            <div className="divide-y">
              {notifs.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-accent cursor-pointer ${notification.read ? "" : "bg-blue-50 dark:bg-blue-900/10"}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{notification.title}</span>
                        {!notification.read && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">알림이 없습니다.</div>
          )}
        </div>
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push("/notifications")}>
            모든 알림 보기
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
