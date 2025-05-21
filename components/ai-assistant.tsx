"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, X, Minimize2, Maximize2, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Sample predefined responses for the chatbot
const predefinedResponses = {
  greetings: [
    "안녕하세요! ASUS AI 어시스턴트입니다. 어떻게 도와드릴까요?",
    "반갑습니다! ASUS 제품에 대해 궁금한 점이 있으신가요?",
    "ASUS AI 어시스턴트입니다. 무엇을 도와드릴까요?",
  ],
  product: [
    "ASUS 제품에 대한 자세한 정보는 제품 카테고리를 선택하시면 확인하실 수 있습니다.",
    "특정 제품에 대해 알고 싶으시다면 모델명을 알려주세요.",
    "ASUS의 최신 제품들은 홈페이지에서 확인하실 수 있습니다.",
  ],
  support: [
    "기술 지원이 필요하시면 support@asus.com으로 문의해주세요.",
    "제품 관련 문제는 고객센터(1588-1234)로 연락주시면 도움드리겠습니다.",
    "자주 묻는 질문은 FAQ 섹션에서 확인하실 수 있습니다.",
  ],
  default: [
    "죄송합니다. 질문을 이해하지 못했습니다. 다른 방식으로 질문해 주시겠어요?",
    "더 자세한 정보가 필요합니다. 질문을 구체적으로 해주시겠어요?",
    "현재 해당 질문에 대한 답변을 준비 중입니다. 다른 질문이 있으신가요?",
  ],
}

// Message type definition
interface Message {
  id: number
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "안녕하세요! ASUS AI 어시스턴트입니다. 무엇을 도와드릴까요?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Suggested questions
  const suggestedQuestions = [
    "제품 정보가 궁금합니다",
    "기술 지원이 필요합니다",
    "최신 제품은 무엇인가요?",
    "보증 정보를 알고 싶어요",
  ]

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle sending a message
  const handleSendMessage = (content: string = input) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot response after a delay
    setTimeout(
      () => {
        let responseCategory = "default"

        const lowerContent = content.toLowerCase()
        if (lowerContent.includes("안녕") || lowerContent.includes("hello") || lowerContent.includes("hi")) {
          responseCategory = "greetings"
        } else if (
          lowerContent.includes("제품") ||
          lowerContent.includes("product") ||
          lowerContent.includes("laptop")
        ) {
          responseCategory = "product"
        } else if (lowerContent.includes("지원") || lowerContent.includes("support") || lowerContent.includes("help")) {
          responseCategory = "support"
        }

        const responses = predefinedResponses[responseCategory as keyof typeof predefinedResponses]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        const botMessage: Message = {
          id: messages.length + 2,
          content: randomResponse,
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    ) // Random delay between 1-2 seconds
  }

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#0a66c2] hover:bg-[#0a66c2]/90"
            >
              <Bot className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>ASUS AI 어시스턴트와 대화하기</p>
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
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="ASUS AI" />
            <AvatarFallback className="bg-white text-[#0a66c2]">AI</AvatarFallback>
          </Avatar>
          <CardTitle className="text-sm font-medium">ASUS AI 어시스턴트</CardTitle>
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
          <ScrollArea className="flex-1 h-[380px] p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex gap-2 max-w-[80%]">
                    {message.sender === "bot" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-[#0a66c2] text-white">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-[#0a66c2] text-white rounded-br-none"
                            : "bg-gray-100 dark:bg-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">{formatTime(message.timestamp)}</p>
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-[#0a66c2] text-white">AI</AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 rounded-bl-none">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-center text-gray-500">자주 묻는 질문</p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-sm justify-start h-auto py-2 px-3"
                      onClick={() => handleSendMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          <CardFooter className="p-3 border-t">
            <form
              className="flex w-full gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
            >
              <Input
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
