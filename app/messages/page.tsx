"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Send, MoreVertical, Phone, Video, Info, Paperclip } from "lucide-react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// 임시 대화 목록 데이터
const conversations = [
  {
    id: 1,
    user: { name: "김철수", avatar: "/placeholder.svg?height=32&width=32", status: "online" },
    lastMessage: "안녕하세요, 제품 관련 문의가 있습니다.",
    time: "10분 전",
    unread: 2,
  },
  {
    id: 2,
    user: { name: "이영희", avatar: "/placeholder.svg?height=32&width=32", status: "offline" },
    lastMessage: "회의 자료 확인 부탁드립니다.",
    time: "1시간 전",
    unread: 0,
  },
  {
    id: 3,
    user: { name: "박지민", avatar: "/placeholder.svg?height=32&width=32", status: "online" },
    lastMessage: "프로젝트 진행 상황 공유드립니다.",
    time: "3시간 전",
    unread: 0,
  },
  {
    id: 4,
    user: { name: "최동욱", avatar: "/placeholder.svg?height=32&width=32", status: "away" },
    lastMessage: "다음 주 일정 조율 가능하신가요?",
    time: "1일 전",
    unread: 0,
  },
  {
    id: 5,
    user: { name: "정수민", avatar: "/placeholder.svg?height=32&width=32", status: "offline" },
    lastMessage: "문서 검토 완료했습니다.",
    time: "2일 전",
    unread: 0,
  },
]

// 임시 메시지 데이터
const messages = [
  {
    id: 1,
    sender: "김철수",
    content: "안녕하세요, 제품 관련 문의가 있습니다.",
    time: "오전 10:30",
    isMe: false,
  },
  {
    id: 2,
    sender: "나",
    content: "네, 안녕하세요. 어떤 제품에 대해 문의하시나요?",
    time: "오전 10:32",
    isMe: true,
  },
  {
    id: 3,
    sender: "김철수",
    content: "A100 시리즈 제품에 대한 기술 사양을 알고 싶습니다.",
    time: "오전 10:33",
    isMe: false,
  },
  {
    id: 4,
    sender: "나",
    content: "A100 시리즈에 대한 기술 사양서를 공유해 드리겠습니다. 잠시만 기다려주세요.",
    time: "오전 10:35",
    isMe: true,
  },
  {
    id: 5,
    sender: "김철수",
    content: "감사합니다. 특히 성능 부분과 호환성에 대해 자세히 알고 싶습니다.",
    time: "오전 10:36",
    isMe: false,
  },
  {
    id: 6,
    sender: "나",
    content:
      "네, 성능 및 호환성 정보가 포함된 문서를 준비해서 보내드리겠습니다. 추가로 필요한 정보가 있으시면 말씀해주세요.",
    time: "오전 10:38",
    isMe: true,
  },
  {
    id: 7,
    sender: "김철수",
    content: "혹시 A100 시리즈와 B200 시리즈의 성능 비교 자료도 있을까요?",
    time: "오전 10:40",
    isMe: false,
  },
]

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState(conversations[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [chatMessages, setChatMessages] = useState(messages)
  const router = useRouter()

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const newMsg = {
      id: chatMessages.length + 1,
      sender: "나",
      content: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    }

    setChatMessages([...chatMessages, newMsg])
    setNewMessage("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 검색어에 따라 필터링된 대화 목록
  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <RoleGuard>
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
          {/* 대화 목록 */}
          <Card className="md:col-span-1 overflow-hidden">
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="대화 검색..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="w-full mb-4">새 메시지</Button>
            </div>
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent ${
                      activeConversation?.id === conversation.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                          conversation.user.status === "online"
                            ? "bg-green-500"
                            : conversation.user.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-sm truncate">{conversation.user.name}</h3>
                        <span className="text-xs text-muted-foreground">{conversation.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && <Badge className="ml-auto bg-red-500">{conversation.unread}</Badge>}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* 대화 내용 */}
          <Card className="md:col-span-2 lg:col-span-3 flex flex-col overflow-hidden">
            {activeConversation ? (
              <>
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{activeConversation.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{activeConversation.user.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {activeConversation.user.status === "online"
                          ? "온라인"
                          : activeConversation.user.status === "away"
                            ? "자리 비움"
                            : "오프라인"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Info className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>대화 검색</DropdownMenuItem>
                        <DropdownMenuItem>알림 설정</DropdownMenuItem>
                        <DropdownMenuItem>대화 삭제</DropdownMenuItem>
                        <DropdownMenuItem>차단</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] ${
                            message.isMe
                              ? "bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                              : "bg-muted rounded-tl-lg rounded-tr-lg rounded-br-lg"
                          } p-3`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-right mt-1 opacity-70">{message.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex items-end gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                      <Input
                        placeholder="메시지 입력..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[80px] resize-none"
                        multiline
                      />
                    </div>
                    <Button
                      size="icon"
                      className="rounded-full"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="font-medium mb-2">대화를 선택하세요</h3>
                  <p className="text-sm text-muted-foreground">
                    왼쪽 목록에서 대화를 선택하거나 새 메시지를 시작하세요.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
