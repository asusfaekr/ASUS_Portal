"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Loader2, FileText, MessageSquare, ThumbsUp, Calendar } from "lucide-react"
import Link from "next/link"

export function RewardSystem() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    commentsCount: 0,
    likesCount: 0,
  })
  const [userPosts, setUserPosts] = useState([])
  const [userComments, setUserComments] = useState([])
  const [userLikes, setUserLikes] = useState([])
  const [activeTab, setActiveTab] = useState("stats")

  useEffect(() => {
    if (user) {
      fetchUserActivity()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchUserActivity = async () => {
    setLoading(true)
    try {
      // 사용자 게시글 가져오기
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(`
          id, 
          title, 
          created_at,
          boards:board_id (name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (postsError) {
        console.error("Error fetching posts:", postsError)
      } else {
        setUserPosts(posts || [])
      }

      // 사용자 댓글 가져오기
      const { data: comments, error: commentsError } = await supabase
        .from("comments")
        .select(`
          id, 
          content, 
          created_at,
          posts:post_id (id, title)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (commentsError) {
        console.error("Error fetching comments:", commentsError)
      } else {
        setUserComments(comments || [])
      }

      // 사용자가 좋아요 누른 게시글 가져오기
      const { data: likes, error: likesError } = await supabase
        .from("likes")
        .select(`
          id, 
          created_at,
          posts:post_id (id, title, boards:board_id(name))
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (likesError) {
        console.error("Error fetching likes:", likesError)
      } else {
        setUserLikes(likes || [])
      }

      // 통계 정보 가져오기
      const { count: postsCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      const { count: commentsCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      const { count: likesCount } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      setUserStats({
        postsCount: postsCount || 0,
        commentsCount: commentsCount || 0,
        likesCount: likesCount || 0,
      })
    } catch (error) {
      console.error("Error fetching user activity:", error)
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
    }).format(date)
  }

  if (!user) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">활동 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>로그인하면 활동 정보를 볼 수 있습니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">활동 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">활동 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="stats">통계</TabsTrigger>
            <TabsTrigger value="posts">게시글</TabsTrigger>
            <TabsTrigger value="comments">댓글</TabsTrigger>
            <TabsTrigger value="likes">좋아요</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">가입일:</span>
                <span className="font-medium">{formatDate(user.created_at)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                <FileText className="h-5 w-5 mb-1 text-blue-500" />
                <span className="text-lg font-bold">{userStats.postsCount}</span>
                <span className="text-xs text-muted-foreground">게시글</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                <MessageSquare className="h-5 w-5 mb-1 text-green-500" />
                <span className="text-lg font-bold">{userStats.commentsCount}</span>
                <span className="text-xs text-muted-foreground">댓글</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                <ThumbsUp className="h-5 w-5 mb-1 text-red-500" />
                <span className="text-lg font-bold">{userStats.likesCount}</span>
                <span className="text-xs text-muted-foreground">좋아요</span>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">활동 레벨</h3>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${
                    userStats.postsCount + userStats.commentsCount >= 10
                      ? "bg-[#0a66c2]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Lv.1
                </Badge>
                <span className="text-xs">기본 접근</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={`${
                    userStats.postsCount + userStats.commentsCount >= 20
                      ? "bg-[#0a66c2]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Lv.2
                </Badge>
                <span className="text-xs">활발한 참여자</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={`${
                    userStats.postsCount + userStats.commentsCount >= 30
                      ? "bg-[#0a66c2]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Lv.3
                </Badge>
                <span className="text-xs">핵심 기여자</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="posts">
            {userPosts.length > 0 ? (
              <div className="space-y-3">
                {userPosts.map((post) => (
                  <Link href={`/post/${post.id}`} key={post.id} className="block">
                    <div className="p-3 border rounded-md hover:bg-accent">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm line-clamp-1">{post.title}</h3>
                        <Badge className="ml-2 shrink-0">{post.boards?.name || "게시판"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(post.created_at)}</p>
                    </div>
                  </Link>
                ))}
                {userStats.postsCount > 5 && (
                  <div className="text-center text-xs text-muted-foreground pt-2">
                    외 {userStats.postsCount - 5}개의 게시글이 있습니다.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>작성한 게시글이 없습니다.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments">
            {userComments.length > 0 ? (
              <div className="space-y-3">
                {userComments.map((comment) => (
                  <Link href={`/post/${comment.posts?.id}`} key={comment.id} className="block">
                    <div className="p-3 border rounded-md hover:bg-accent">
                      <h3 className="font-medium text-sm line-clamp-1">{comment.posts?.title || "게시글"}</h3>
                      <p className="text-xs line-clamp-1 mt-1">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(comment.created_at)}</p>
                    </div>
                  </Link>
                ))}
                {userStats.commentsCount > 5 && (
                  <div className="text-center text-xs text-muted-foreground pt-2">
                    외 {userStats.commentsCount - 5}개의 댓글이 있습니다.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>작성한 댓글이 없습니다.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="likes">
            {userLikes.length > 0 ? (
              <div className="space-y-3">
                {userLikes.map((like) => (
                  <Link href={`/post/${like.posts?.id}`} key={like.id} className="block">
                    <div className="p-3 border rounded-md hover:bg-accent">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm line-clamp-1">{like.posts?.title || "게시글"}</h3>
                        <Badge className="ml-2 shrink-0">{like.posts?.boards?.name || "게시판"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(like.created_at)}</p>
                    </div>
                  </Link>
                ))}
                {userStats.likesCount > 5 && (
                  <div className="text-center text-xs text-muted-foreground pt-2">
                    외 {userStats.likesCount - 5}개의 좋아요가 있습니다.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>좋아요한 게시글이 없습니다.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
