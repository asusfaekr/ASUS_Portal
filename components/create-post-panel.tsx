"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Loader2, X } from "lucide-react"

export function CreatePostPanel({ onCancel, onPostCreated, boards = [] }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    boardId: boards.length > 0 ? boards[0].id.toString() : "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBoardChange = (value) => {
    setFormData((prev) => ({ ...prev, boardId: value }))
  }

  const handleSubmit = async (e) => {
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
        boardId: boards.length > 0 ? boards[0].id.toString() : "",
      })

      // 부모 컴포넌트에 알림
      if (onPostCreated) {
        onPostCreated()
      }

      // 3초 후 폼 닫기
      setTimeout(() => {
        if (onCancel) {
          onCancel()
        }
      }, 3000)
    } catch (error) {
      console.error("Post creation error:", error)
      setMessage({ type: "error", text: "게시글 작성 중 오류가 발생했습니다." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="sticky top-20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">새 글 작성</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Select value={formData.boardId} onValueChange={handleBoardChange}>
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
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="내용을 입력하세요"
              rows={8}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "게시 중..." : "게시하기"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
