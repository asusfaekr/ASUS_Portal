"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp, MessageSquare, Share2, ArrowLeft, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { CommentSection } from "@/components/comment-section"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likeCount, setLikeCount] = useState(0)
  const [userLiked, setUserLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [shareMessage, setShareMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      try {
        // 게시글 정보 가져오기
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select(`
          *,
          users:user_id (*),
          boards:board_id (*)
        `)
          .eq("id", params.id)
          .single()

        if (postError) {
          console.error("Error fetching post:", postError)
          setError("게시글을 불러오는 중 오류가 발생했습니다.")
          return
        }

        setPost(postData)

        // 댓글 정보 가져오기
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(`
          *,
          users:user_id (*)
        `)
          .eq("post_id", params.id)
          .order("created_at", { ascending: false })

        if (commentsError) {
          console.error("Error fetching comments:", commentsError)
        } else {
          // 각 댓글에 대한 좋아요 수와 사용자 좋아요 여부 추가
          const commentsWithLikes = await Promise.all(
            (commentsData || []).map(async (comment) => {
              // 댓글 좋아요 수 가져오기
              const { count } = await supabase
                .from("comment_likes")
                .select("*", { count: "exact", head: true })
                .eq("comment_id", comment.id)

              // 사용자가 댓글에 좋아요 했는지 확인
              let userLikedComment = false
              if (user) {
                const { data: userLikeData } = await supabase
                  .from("comment_likes")
                  .select("*", { head: true })
                  .eq("comment_id", comment.id)
                  .eq("user_id", user.id)

                userLikedComment = !!userLikeData
              }

              return {
                ...comment,
                likesCount: count || 0,
                userLiked: userLikedComment,
              }
            }),
          )

          setComments(commentsWithLikes)
        }

        // 게시글 좋아요 수 가져오기
        const { count, error: likesError } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", params.id)

        if (!likesError) {
          setLikeCount(count || 0)
        }

        // 사용자가 좋아요 했는지 확인
        if (user) {
          const { data: userLikeData } = await supabase
            .from("likes")
            .select("*", { head: true })
            .eq("post_id", params.id)
            .eq("user_id", user.id)

          setUserLiked(!!userLikeData)
        }
      } catch (error) {
        console.error("Error:", error)
        setError("게시글을 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id, user])

  const formatDate = (dateString: string) => {
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

  const handleLike = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setLikeLoading(true)
    try {
      if (userLiked) {
        // 좋아요 취소
        const { error } = await supabase.from("likes").delete().eq("post_id", params.id).eq("user_id", user.id)

        if (error) {
          console.error("Error removing like:", error)
          toast({
            title: "좋아요 취소 실패",
            description: "좋아요 취소 중 오류가 발생했습니다.",
            variant: "destructive",
          })
          return
        }

        setLikeCount((prev) => prev - 1)
        setUserLiked(false)

        toast({
          title: "좋아요 취소",
          description: "게시글 좋아요가 취소되었습니다.",
        })
      } else {
        // 좋아요 추가
        const { error } = await supabase.from("likes").insert({
          post_id: params.id,
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
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "오류 발생",
        description: "작업 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setLikeLoading(false)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(
      () => {
        setShareMessage("링크가 클립보드에 복사되었습니다.")
        toast({
          title: "링크 복사 완료",
          description: "게시글 링크가 클립보드에 복사되었습니다.",
        })
        setTimeout(() => setShareMessage(null), 3000)
      },
      () => {
        setShareMessage("링크 복사에 실패했습니다.")
        toast({
          title: "링크 복사 실패",
          description: "링크 복사 중 오류가 발생했습니다.",
          variant: "destructive",
        })
        setTimeout(() => setShareMessage(null), 3000)
      },
    )
  }

  if (loading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-500">{error || "게시글을 찾을 수 없습니다."}</p>
            <Button className="mt-4 mx-auto block" onClick={() => router.push("/")}>
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> 돌아가기
      </Button>

      {shareMessage && (
        <Alert className="mb-4">
          <AlertDescription>{shareMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback>{post.users?.full_name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{post.users?.full_name || "사용자"}</h3>
                  <span className="text-xs text-muted-foreground">{post.users?.company || ""}</span>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
              </div>
            </div>
            <Badge className="bg-[#0a66c2]">{post.boards?.name || "게시판"}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <h2 className="text-2xl font-bold">{post.title}</h2>

          <Separator />

          <div className="py-4 whitespace-pre-wrap">
            {post.content.split("\n").map((paragraph: string, index: number) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
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
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
            >
              <MessageSquare className="h-4 w-4" />
              댓글 {comments.length > 0 ? comments.length : ""}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              공유
            </Button>
          </div>
        </CardContent>
      </Card>

      <div id="comments" className="mt-8">
        <Card>
          <CardContent className="p-6">
            <CommentSection postId={Number(params.id)} initialComments={comments} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
