"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, Share2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PostDetail({ post }) {
  const [shareMessage, setShareMessage] = useState<string | null>(null)

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
            <Link href={`/post/${post.id}`} className="font-medium hover:text-[#0a66c2]">
              <h2 className="text-xl font-bold">{post.title}</h2>
            </Link>
          </div>

          <div className="pt-2 pb-4">
            <p className="text-sm line-clamp-6 whitespace-pre-wrap">{post.content}</p>
            <Link href={`/post/${post.id}`} className="text-sm text-blue-600 hover:underline mt-2 inline-block">
              더 보기
            </Link>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            좋아요 {post.likesCount || 0}
          </Button>
          <Link href={`/post/${post.id}#comments`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              댓글 {post.commentsCount || 0}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            공유
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
