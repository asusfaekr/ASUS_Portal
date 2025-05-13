"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CommentSectionProps {
  postId: number
  initialComments?: any[]
}

export function CommentSection({ postId, initialComments = [] }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          content: newComment.trim(),
          post_id: postId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
        .select(`
          *,
          users:user_id (*)
        `)
        .single()

      if (error) {
        console.error("Error submitting comment:", error)
        return
      }

      setComments([data, ...comments])
      setNewComment("")
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">댓글 {comments.length}개</h3>

      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{user.full_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="댓글을 작성하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!newComment.trim() || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              댓글 작성
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-muted p-4 rounded-md text-center">
          <p className="text-muted-foreground">댓글을 작성하려면 로그인이 필요합니다.</p>
          <Button variant="link" onClick={() => router.push("/login")}>
            로그인하기
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border-b pb-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{comment.users?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{comment.users?.full_name || "사용자"}</span>
                      <span className="text-xs text-muted-foreground ml-2">{comment.users?.company || ""}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  <div className="flex gap-4 pt-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      좋아요
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      답글
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </div>
        )}
      </div>
    </div>
  )
}
