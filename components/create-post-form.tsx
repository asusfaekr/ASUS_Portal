"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// 관리자 역할 ID (예: 1은 FAE, 2는 Sales, 3은 Marketing)
const ADMIN_ROLE_ID = 999 // 실제 관리자 역할 ID로 변경 필요

export function CreatePostForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    boardId: "",
  })
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingBoards, setLoadingBoards] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const isAdmin = user?.role_id === ADMIN_ROLE_ID // 관리자 여부 확인

  // 사용자 역할에 따라 접근 가능한 게시판 가져오기
  useEffect(() => {
    const fetchBoards = async () => {
      setLoadingBoards(true)
      try {
        // 4가지 주요 게시판 정의
        const mainBoards = [
          { id: 1, name: "공지사항", slug: "announcements" },
          { id: 2, name: "FAE", slug: "fae" },
          { id: 3, name: "Sales", slug: "sales" },
          { id: 4, name: "Marketing", slug: "marketing" },
        ]

        // 관리자가 아닌 경우 공지사항 제외
        const availableBoards = isAdmin ? mainBoards : mainBoards.filter((board) => board.slug !== "announcements")

        setBoards(availableBoards)

        // 기본 게시판 설정 - 관리자가 아닌 경우 FAE 게시판, 관리자인 경우 공지사항
        if (availableBoards.length > 0) {
          const defaultBoard = isAdmin ? availableBoards[0] : availableBoards[0]

          setFormData((prev) => ({
            ...prev,
            boardId: defaultBoard.id.toString(),
          }))
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoadingBoards(false)
      }
    }

    fetchBoards()
  }, [user, isAdmin])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBoardChange = (value: string) => {
    setFormData((prev) => ({ ...prev, boardId: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!user) {
      setMessage({ type: "error", text: "로그인이 필요합니다." })
      setLoading(false)
      return
    }

    if (!formData.title || !formData.content || !formData.boardId) {
      setMessage({ type: "error", text: "모든 필드를 입력해주세요." })
      setLoading(false)
      return
    }

    // 게시판 접근 권한 확인
    const selectedBoard = boards.find((board) => board.id.toString() === formData.boardId)

    // 관리자가 아닌 사용자가 공지사항에 글을 작성하려고 할 때
    if (!isAdmin && selectedBoard?.slug === "announcements") {
      setMessage({ type: "error", text: "공지사항 게시판에 글을 작성할 권한이 없습니다." })
      setLoading(false)
      return
    }

    try {
      // 게시글 추가
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: formData.title,
          content: formData.content,
          board_id: Number.parseInt(formData.boardId),
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        setMessage({ type: "error", text: error.message })
        return
      }

      setMessage({
        type: "success",
        text: "게시글이 성공적으로 작성되었습니다.",
      })

      // 폼 초기화
      setFormData({
        title: "",
        content: "",
        boardId: "",
      })

      // 3초 후 게시판으로 이동
      setTimeout(() => {
        router.push("/board")
        router.refresh()
      }, 3000)
    } catch (error) {
      console.error("Post creation error:", error)
      setMessage({ type: "error", text: "게시글 작성 중 오류가 발생했습니다." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="boardId">게시판</Label>
          <Select value={formData.boardId} onValueChange={handleBoardChange} disabled={loadingBoards}>
            <SelectTrigger>
              <SelectValue placeholder="게시판을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {boards.map((board) => (
                <SelectItem key={board.id} value={board.id.toString()}>
                  {board.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="제목을 입력하세요"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">내용</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="내용을 입력하세요"
            rows={10}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "게시 중..." : "게시하기"}
        </Button>
      </form>
    </div>
  )
}
