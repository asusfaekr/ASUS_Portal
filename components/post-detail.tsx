"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, Share2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export function PostDetail({ post, refreshPosts }) {
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  if (!post) return null

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`
    navigator.clipboard.writeText(url).then(
      () => {
        setShareMessage("링크가 클립보드에 복사되었습니다.")
        setTimeout(() => setShareMessage(null), 3000)
      },
      () => {
        setShareMessage("링크 복사에 실패했습니다.")
        setTimeout(() => setShareMessage(null), 3000)
      },
    )
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim() || !user) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from("comments").insert({
        content: comment.trim(),
        post_id: post.id,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error submitting comment:", error)
        return
      }

      // 댓글 작성 후 폼 초기화
      setComment("")
      setShowCommentForm(false)

      // 게시글 목록 새로고침 (댓글 수 업데이트를 위해)
      if (refreshPosts) {
        refreshPosts()
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="sticky top-20">
      {shareMessage && (
        <Alert className="mb-0 mt-2 mx-2">
          <AlertDescription>{shareMessage}</AlertDescription>
        </Alert>
      )}

      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
        <Avatar className="w-12 h-12">
          <AvatarFallback>{post.users?.full_name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{post.users?.full_name || "사용자"}</h3>
            <Badge variant="outline" className="text-xs">
              {post.users?.position || ""}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{post.users?.company || ""}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#0a66c2]">{post.boards?.name || "게시판"}</Badge>
            <h2 className="text-xl font-bold">{post.title}</h2>
          </div>

          <div className="pt-2 pb-4">
            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            좋아요 {post.likesCount || 0}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowCommentForm(!showCommentForm)}>
            <MessageSquare className="h-4 w-4" />
            댓글 {post.commentsCount || 0}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            공유
          </Button>
        </div>

        {showCommentForm && (
          <div className="pt-2">
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <Textarea
                placeholder="댓글을 작성하세요..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCommentForm(false)}>
                  취소
                </Button>
                <Button type="submit" size="sm" disabled={!comment.trim() || submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  댓글 작성
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
