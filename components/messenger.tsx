"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, X, Minimize2, Maximize2, User, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

// 메시지 타입 정의
interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: {
    full_name: string
    company: string
    position: string
  }
  receiver?: {
    full_name: string
    company: string
    position: string
  }
}

// 대화 상대 타입 정의
interface Contact {
  id: string
  full_name: string
  company: string
  position: string
  avatar?: string
  last_message?: string
  last_message_time?: string
  unread_count: number
  online?: boolean
}

export function Messenger() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<"chats" | "contacts">("chats")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeContact, setActiveContact] = useState<Contact | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  // 연락처 목록 가져오기
  useEffect(() => {
    if (!user) return

    const fetchContacts = async () => {
      setLoadingContacts(true)
      try {
        // 모든 사용자 가져오기 (자신 제외)
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, full_name, company, position")
          .neq("id", user.id)
          .order("full_name")

        if (usersError) {
          console.error("Error fetching users:", usersError)
          return
        }

        // 각 사용자에 대한 읽지 않은 메시지 수 가져오기
        const contactsWithUnreadCount = await Promise.all(
          (usersData || []).map(async (contact) => {
            const { count, error } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("sender_id", contact.id)
              .eq("receiver_id", user.id)
              .eq("is_read", false)

            // 마지막 메시지 가져오기
            const { data: lastMessageData, error: lastMessageError } = await supabase
              .from("messages")
              .select("content, created_at")
              .or(`sender_id.eq.${contact.id},receiver_id.eq.${contact.id}`)
              .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
              .order("created_at", { ascending: false })
              .limit(1)

            const lastMessage = lastMessageData && lastMessageData.length > 0 ? lastMessageData[0] : null

            return {
              id: contact.id,
              full_name: contact.full_name || "사용자",
              company: contact.company || "",
              position: contact.position || "",
              unread_count: count || 0,
              online: Math.random() > 0.7, // 임시로 온라인 상태 랜덤 설정
              last_message: lastMessage?.content,
              last_message_time: lastMessage?.created_at,
            }
          }),
        )

        // 마지막 메시지 시간 기준으로 정렬
        contactsWithUnreadCount.sort((a, b) => {
          if (!a.last_message_time) return 1
          if (!b.last_message_time) return -1
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
        })

        setContacts(contactsWithUnreadCount)
        setFilteredContacts(contactsWithUnreadCount)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoadingContacts(false)
      }
    }

    fetchContacts()

    // 실시간 메시지 구독
    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          // 새 메시지가 현재 대화 상대로부터 온 경우
          if (activeContact && payload.new.sender_id === activeContact.id) {
            fetchMessages(activeContact.id)
            // 메시지를 읽음으로 표시
            markMessagesAsRead(activeContact.id)
          }

          // 연락처 목록 업데이트
          fetchContacts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, activeContact])

  // 검색어에 따라 연락처 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts)
      return
    }

    const filtered = contacts.filter(
      (contact) =>
        contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.position.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    setFilteredContacts(filtered)
  }, [searchQuery, contacts])

  // 메시지 목록 가져오기
  const fetchMessages = async (contactId: string) => {
    if (!user) return

    setLoadingMessages(true)
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:sender_id(full_name, company, position),
          receiver:receiver_id(full_name, company, position)
        `,
        )
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`,
        )
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoadingMessages(false)
    }
  }

  // 메시지를 읽음으로 표시
  const markMessagesAsRead = async (contactId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("sender_id", contactId)
        .eq("receiver_id", user.id)
        .eq("is_read", false)

      if (error) {
        console.error("Error marking messages as read:", error)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  // 대화 상대 선택
  const handleSelectContact = async (contact: Contact) => {
    setActiveContact(contact)
    setActiveTab("chats")
    await fetchMessages(contact.id)
    await markMessagesAsRead(contact.id)
  }

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!input.trim() || !user || !activeContact) return

    setInput("")
    try {
      const newMessage = {
        sender_id: user.id,
        receiver_id: activeContact.id,
        content: input.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("messages").insert(newMessage).select()

      if (error) {
        console.error("Error sending message:", error)
        return
      }

      // 메시지 목록 업데이트
      await fetchMessages(activeContact.id)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 메시지가 변경될 때 스크롤을 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "오늘"
    } else if (diffDays === 1) {
      return "어제"
    } else if (diffDays < 7) {
      return `${diffDays}일 전`
    } else {
      return date.toLocaleDateString()
    }
  }

  // 메신저가 닫혀있을 때 표시할 버튼
  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#0a66c2] hover:bg-[#0a66c2]/90"
            >
              <MessageSquare className="h-6 w-6" />
              {contacts.reduce((total, contact) => total + contact.unread_count, 0) > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500">
                  {contacts.reduce((total, contact) => total + contact.unread_count, 0)}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>메시지</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-80 md:w-96 shadow-lg border-[#0a66c2]/20 overflow-hidden transition-all duration-200 ${
        isMinimized ? "h-14" : "h-[500px] max-h-[80vh]"
      }`}
    >
      <CardHeader className="p-3 border-b flex flex-row items-center justify-between bg-[#0a66c2] text-white">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 bg-white">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="메시지" />
            <AvatarFallback className="bg-white text-[#0a66c2]">
              <MessageSquare className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-sm font-medium">{activeContact ? activeContact.full_name : "메시지"}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-[#0a66c2]/80"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-[#0a66c2]/80"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <Tabs defaultValue="chats" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            {!activeContact && (
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="chats">채팅</TabsTrigger>
                <TabsTrigger value="contacts">연락처</TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="chats" className="m-0">
              {activeContact ? (
                <>
                  <ScrollArea className="flex-1 h-[380px] p-4">
                    <div className="space-y-4">
                      {loadingMessages ? (
                        <div className="flex justify-center items-center h-[300px]">
                          <Loader2 className="h-8 w-8 animate-spin text-[#0a66c2]" />
                        </div>
                      ) : messages.length > 0 ? (
                        messages.map((message, index) => {
                          const isFirstMessageOfDay =
                            index === 0 ||
                            new Date(message.created_at).toDateString() !==
                              new Date(messages[index - 1].created_at).toDateString()

                          return (
                            <React.Fragment key={message.id}>
                              {isFirstMessageOfDay && (
                                <div className="flex justify-center my-4">
                                  <Badge variant="outline" className="bg-background">
                                    {formatDate(message.created_at)}
                                  </Badge>
                                </div>
                              )}
                              <div
                                className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                              >
                                <div className="flex gap-2 max-w-[80%]">
                                  {message.sender_id !== user?.id && (
                                    <Avatar className="h-8 w-8 mt-1">
                                      <AvatarFallback>{message.sender?.full_name?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                  )}
                                  <div>
                                    <div
                                      className={`p-3 rounded-lg ${
                                        message.sender_id === user?.id
                                          ? "bg-[#0a66c2] text-white rounded-br-none"
                                          : "bg-gray-100 dark:bg-gray-800 rounded-bl-none"
                                      }`}
                                    >
                                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 text-right">
                                      {formatTime(message.created_at)}
                                    </p>
                                  </div>
                                  {message.sender_id === user?.id && (
                                    <Avatar className="h-8 w-8 mt-1">
                                      <AvatarFallback>
                                        <User className="h-4 w-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              </div>
                            </React.Fragment>
                          )
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center">
                          <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500">메시지가 없습니다</p>
                          <p className="text-sm text-gray-400">첫 메시지를 보내보세요!</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <CardFooter className="p-3 border-t">
                    <form
                      className="flex w-full gap-2"
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSendMessage()
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="h-10 w-10"
                        onClick={() => setActiveContact(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="메시지를 입력하세요..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={!input.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardFooter>
                </>
              ) : (
                <>
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="검색..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <ScrollArea className="h-[380px]">
                    {loadingContacts ? (
                      <div className="flex justify-center items-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-[#0a66c2]" />
                      </div>
                    ) : filteredContacts.length > 0 ? (
                      <div className="divide-y">
                        {filteredContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => handleSelectContact(contact)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>{contact.full_name[0]}</AvatarFallback>
                                </Avatar>
                                {contact.online && (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background"></span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-medium text-sm truncate">{contact.full_name}</h3>
                                  {contact.last_message_time && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(contact.last_message_time)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center">
                                  <p className="text-xs text-muted-foreground truncate">
                                    {contact.last_message || contact.company || contact.position || "새 대화 시작하기"}
                                  </p>
                                  {contact.unread_count > 0 && (
                                    <Badge className="ml-2 bg-red-500">{contact.unread_count}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                        <Search className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">검색 결과가 없습니다</p>
                        <p className="text-sm text-gray-400">다른 검색어를 입력해보세요</p>
                      </div>
                    )}
                  </ScrollArea>
                </>
              )}
            </TabsContent>

            <TabsContent value="contacts" className="m-0">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="연락처 검색..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="h-[380px]">
                {loadingContacts ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0a66c2]" />
                  </div>
                ) : filteredContacts.length > 0 ? (
                  <div className="divide-y">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => handleSelectContact(contact)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{contact.full_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium">{contact.full_name}</h3>
                            <div className="flex items-center text-xs text-muted-foreground">
                              {contact.company && <span className="mr-2">{contact.company}</span>}
                              {contact.position && <span>{contact.position}</span>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectContact(contact)
                            }}
                          >
                            메시지
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                    <Search className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">검색 결과가 없습니다</p>
                    <p className="text-sm text-gray-400">다른 검색어를 입력해보세요</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </>
      )}
    </Card>
  )
}
