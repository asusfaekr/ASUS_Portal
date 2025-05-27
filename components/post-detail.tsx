"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, ThumbsUp, Share2, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function PostDetail({ post, refreshPosts }) {
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [comments, setComments] = useState([])
  const [showAllComments, setShowAllComments] = useState(false)
  const [loadingComments, setLoadingComments] = useState(true)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [userLiked, setUserLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (post) {
      fetchComments()
      fetchLikeInfo()
    }
  }, [post, user])

  const fetchComments = async () => {
    if (!post) return

    setLoadingComments(true)
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          users:user_id (id, full_name, company, position)
        `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching comments:", error)
        return
      }

      setComments(data || [])
      setCommentCount(data?.length || 0)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const fetchLikeInfo = async () => {
    if (!post) return

    try {
      // 좋아요 수 가져오기
      const { count, error: countError } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id)

      if (!countError) {
        setLikeCount(count || 0)
      }

      // 사용자가 좋아요 했는지 확인
      if (user) {
        const { data: userLikeData, error: userLikeError } = await supabase
          .from("likes")
          .select("*", { head: true })
          .eq("post_id", post.id)
          .eq("user_id", user.id)

        if (!userLikeError) {
          setUserLiked(!!userLikeData)
        }
      }
    } catch (error) {
      console.error("Error fetching like info:", error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setLikeLoading(true)
    try {
      if (userLiked) {
        // 좋아요 취소
        const { error } = await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id)

        if (error) {
          console.error("Error removing like:", error)
          toast({
            title: "좋아요 취소 실패",
            description: "좋아요 취소 중 오류가 발생했습니다.",
            variant: "destructive",
          })
          return
        }

        setLikeCount((prev) => Math.max(0, prev - 1))
        setUserLiked(false)
        toast({
          title: "좋아요 취소",
          description: "게시글 좋아요가 취소되었습니다.",
        })
      } else {
        // 좋아요 추가
        const { error } = await supabase.from("likes").insert({
          post_id: post.id,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error adding like:", error)
          toast({
            title: "좋아요 실패",
            description: "좋아요 추가 중 오류가 발생했습니다.",
            variant: "destructive",
          })
          return
        }

        setLikeCount((prev) => prev + 1)
        setUserLiked(true)
        toast({
          title: "좋아요 추가",
          description: "게시글에 좋아요를 추가했습니다.",
        })
      }

      // 게시글 목록 새로고침
      if (refreshPosts) {
        refreshPosts()
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLikeLoading(false)
    }
  }

  if (!post) return null

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
        toast({
          title: "댓글 작성 실패",
          description: "댓글 작성 중 오류가 발생했습니다.",
          variant: "destructive",
        })
        return
      }

      setComment("")
      setShowCommentForm(false)
      await fetchComments()

      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다.",
      })

      if (refreshPosts) {
        refreshPosts()
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const displayedComments = showAllComments ? comments : comments.slice(0, 5)
  const hasMoreComments = comments.length > 5

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
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${userLiked ? "text-blue-600" : ""}`}
            onClick={handleLike}
            disabled={likeLoading}
          >
            {likeLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className={`h-4 w-4 ${userLiked ? "fill-current" : ""}`} />
            )}
            좋아요 {likeCount > 0 ? likeCount : ""}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowCommentForm(!showCommentForm)}>
            <MessageSquare className="h-4 w-4" />
            댓글 {commentCount > 0 ? commentCount : ""}
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

        {/* 댓글 섹션 - 동적 크기 조정 */}
        {comments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">최근 댓글</h3>
                {hasMoreComments && !showAllComments && (
                  <Button variant="outline" size="sm" onClick={() => setShowAllComments(true)}>
                    더 보기 ({comments.length - 5}개 더)
                  </Button>
                )}
                {showAllComments && hasMoreComments && (
                  <Button variant="outline" size="sm" onClick={() => setShowAllComments(false)}>
                    접기
                  </Button>
                )}
              </div>

              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {displayedComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-2 bg-muted/30 rounded-lg">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{comment.users?.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{comment.users?.full_name || "사용자"}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="text-xs">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
