"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, PlusCircle, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostDetail } from "@/components/post-detail"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ForumPostsProps {
  defaultCategory?: string
}

export function ForumPosts({ defaultCategory = "all" }: ForumPostsProps) {
  const [selectedPost, setSelectedPost] = useState(null)
  const [activeTab, setActiveTab] = useState(defaultCategory)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setActiveTab(defaultCategory)
    fetchPosts(defaultCategory)
  }, [defaultCategory])

  const fetchPosts = async (category) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from("posts").select(`
          *,
          users:user_id (*),
          boards:board_id (*)
        `)

      // 정렬 적용 전에 쿼리가 유효한지 확인
      if (!query || typeof query.order !== "function") {
        throw new Error("Supabase 클라이언트가 올바르게 초기화되지 않았습니다.")
      }

      query = query.order("created_at", { ascending: false })

      if (category && category !== "all") {
        try {
          // 카테고리에 해당하는 게시판 ID 가져오기
          const { data: boards, error: boardError } = await supabase
            .from("boards")
            .select("id")
            .eq("slug", `${category}-resources`)
            .or(`slug.eq.${category}-technical-updates,slug.eq.${category}-opportunities,slug.eq.${category}-campaigns`)

          if (boardError) {
            console.error("Error fetching boards:", boardError)
            throw boardError
          }

          if (boards && boards.length > 0) {
            const boardIds = boards.map((board) => board.id)
            query = query.in("board_id", boardIds)
          }
        } catch (boardError) {
          console.error("Error in board query:", boardError)
          // 게시판 쿼리 오류 시 모든 게시글 표시
        }
      }

      const { data, error: postsError } = await query

      if (postsError) {
        console.error("Error fetching posts:", postsError)
        throw postsError
      }

      setPosts(data || [])
    } catch (error) {
      console.error("Error:", error)
      setError("게시글을 불러오는 중 오류가 발생했습니다. Supabase 연결을 확인해주세요.")
    } finally {
      setLoading(false)
    }
  }

  const handlePostSelect = (post) => {
    setSelectedPost(post)
    // 모바일에서는 상세 페이지로 이동
    if (window.innerWidth < 768) {
      router.push(`/post/${post.id}`)
    }
  }

  const getCategoryTitle = () => {
    switch (activeTab) {
      case "announcements":
        return "공지사항"
      case "fae":
        return "FAE 포럼"
      case "sales":
        return "Sales 포럼"
      case "marketing":
        return "Marketing 포럼"
      default:
        return "게시판"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{getCategoryTitle()}</h2>
          <Button className="bg-[#0a66c2] hover:bg-[#004182]" onClick={() => router.push("/create-post")}>
            <PlusCircle className="mr-2 h-4 w-4" />새 글 작성
          </Button>
        </div>

        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            fetchPosts(value)
          }}
        >
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="announcements">공지사항</TabsTrigger>
            <TabsTrigger value="fae">FAE</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a66c2]"></div>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isSelected={selectedPost?.id === post.id}
                  onSelect={handlePostSelect}
                />
              ))
            ) : (
              <div className="text-center p-8 text-muted-foreground">게시글이 없습니다.</div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden md:block sticky top-20 h-fit">
        {selectedPost ? (
          <PostDetail post={selectedPost} />
        ) : (
          <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
            <p className="text-muted-foreground">게시글을 선택하면 여기에 내용이 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PostCard({ post, isSelected, onSelect }) {
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <Card
      className={`cursor-pointer transition-all ${isSelected ? "border-[#0a66c2] ring-1 ring-[#0a66c2]" : ""}`}
      onClick={() => onSelect(post)}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
        <Avatar>
          <AvatarFallback>{post.users?.full_name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{post.users?.full_name || "사용자"}</h3>
            <span className="text-xs text-muted-foreground">{post.users?.company || ""}</span>
          </div>
          <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#0a66c2]">{post.boards?.name || "게시판"}</Badge>
            <Link href={`/post/${post.id}`} className="font-medium hover:text-[#0a66c2]">
              {post.title}
            </Link>
          </div>
          <p className="text-sm line-clamp-3">{post.content}</p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-4 pt-0">
        <Button variant="ghost" size="sm" className="text-xs gap-1">
          <ThumbsUp className="h-4 w-4" />
          좋아요
        </Button>
        <Button variant="ghost" size="sm" className="text-xs gap-1">
          <MessageSquare className="h-4 w-4" />
          댓글
        </Button>
      </CardFooter>
    </Card>
  )
}
