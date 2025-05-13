"use client"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

// 임시 메시지 데이터
const messages = [
  {
    id: 1,
    sender: { name: "김철수", avatar: "/placeholder.svg?height=32&width=32" },
    message: "안녕하세요, 제품 관련 문의가 있습니다.",
    time: "10분 전",
    read: false,
  },
  {
    id: 2,
    sender: { name: "이영희", avatar: "/placeholder.svg?height=32&width=32" },
    message: "회의 자료 확인 부탁드립니다.",
    time: "1시간 전",
    read: false,
  },
  {
    id: 3,
    sender: { name: "박지민", avatar: "/placeholder.svg?height=32&width=32" },
    message: "프로젝트 진행 상황 공유드립니다.",
    time: "3시간 전",
    read: true,
  },
  {
    id: 4,
    sender: { name: "최동욱", avatar: "/placeholder.svg?height=32&width=32" },
    message: "다음 주 일정 조율 가능하신가요?",
    time: "1일 전",
    read: true,
  },
]

export function MessagesPopover() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState(messages)
  const router = useRouter()

  const unreadCount = msgs.filter((m) => !m.read).length

  const handleMessageClick = (message) => {
    // 메시지를 읽음 상태로 변경
    setMsgs((prev) => prev.map((m) => (m.id === message.id ? { ...m, read: true } : m)))

    // 메시지 페이지로 이동 (실제로는 해당 대화방으로 이동)
    router.push(`/messages/${message.id}`)
    setOpen(false)
  }

  const markAllAsRead = () => {
    setMsgs((prev) => prev.map((m) => ({ ...m, read: true })))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">메시지</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">메시지</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              모두 읽음 표시
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {msgs.length > 0 ? (
            <div className="divide-y">
              {msgs.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 hover:bg-accent cursor-pointer ${message.read ? "" : "bg-blue-50 dark:bg-blue-900/10"}`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{message.sender.name}</span>
                        {!message.read && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{message.message}</p>
                      <p className="text-xs text-muted-foreground">{message.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">메시지가 없습니다.</div>
          )}
        </div>
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push("/messages")}>
            모든 메시지 보기
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
