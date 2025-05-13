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
import { ROLE_BOARDS } from "@/lib/constants"
import { useRouter } from "next/navigation"

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

  // 사용자 역할에 따라 접근 가능한 게시판 가져오기
  useEffect(() => {
    const fetchBoards = async () => {
      setLoadingBoards(true)
      try {
        let query = supabase.from("boards").select("*")

        // 역할에 따른 접근 제어
        if (user?.role_id) {
          const accessibleSlugs = [...(ROLE_BOARDS[user.role_id] || []), ...ROLE_BOARDS.ALL]
          query = query.in("slug", accessibleSlugs)
        } else {
          // 역할이 없는 경우 공지사항만 접근 가능
          query = query.in("slug", ROLE_BOARDS.ALL)
        }

        const { data, error } = await query.order("name")

        if (error) {
          console.error("Error fetching boards:", error)
          return
        }

        setBoards(data || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoadingBoards(false)
      }
    }

    fetchBoards()
  }, [user])

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
        router.push("/")
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
