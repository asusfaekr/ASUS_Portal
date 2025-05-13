"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp, MessageSquare, Share2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            users:user_id (*),
            boards:board_id (*)
          `)
          .eq("id", params.id)
          .single()

        if (error) {
          setError("게시글을 불러오는 중 오류가 발생했습니다.")
          return
        }

        setPost(data)
      } catch (error) {
        setError("게시글을 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id])

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

  if (loading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <Button variant="ghost" size="sm" className="gap-2">
              <ThumbsUp className="h-4 w-4" />
              좋아요
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              댓글
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              공유
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
