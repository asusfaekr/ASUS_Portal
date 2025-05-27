"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, ThumbsUp, PlusCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { PostDetail } from "@/components/post-detail"
import { CreatePostPanel } from "@/components/create-post-panel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ForumPostsProps {
  defaultCategory?: string
  showFilters?: boolean
  simplifiedCategories?: boolean
  showSortTabs?: boolean
  initialSearchQuery?: string
}

export function ForumPosts({
  defaultCategory = "all",
  showFilters = true,
  simplifiedCategories = true,
  showSortTabs = true,
  initialSearchQuery = "",
}: ForumPostsProps) {
  const [selectedPost, setSelectedPost] = useState(null)
  const [activeTab, setActiveTab] = useState("latest")
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [categoryFilter, setCategoryFilter] = useState(defaultCategory)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [boards, setBoards] = useState([])
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setCategoryFilter(defaultCategory)
    fetchPosts(defaultCategory)
    fetchBoards()
  }, [defaultCategory])

  useEffect(() => {
    fetchPosts(categoryFilter)
  }, [activeTab, categoryFilter])

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery)
      handleSearch(new Event("submit") as any)
    }
  }, [initialSearchQuery])

  const fetchBoards = async () => {
    try {
      const { data, error } = await supabase.from("boards").select("*")
      if (error) {
        console.error("Error fetching boards:", error)
        return
      }
      setBoards(data || [])
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const fetchPosts = async (category) => {
    setLoading(true)
    try {
      // 단일 쿼리로 모든 데이터를 한 번에 가져오기 (최적화)
      let query = supabase.from("posts").select(`
          *,
          users:user_id (id, full_name, company, position),
          boards:board_id (id, name, slug),
          comments!inner(count),
          likes!inner(count)
        `)

      // 카테고리 필터링
      if (category === "announcements") {
        const { data: boards } = await supabase.from("boards").select("id").eq("slug", "announcements")
        if (boards && boards.length > 0) {
          query = query.eq("board_id", boards[0].id)
        }
      } else if (category === "forum") {
        const { data: boards } = await supabase.from("boards").select("id").neq("slug", "announcements")
        if (boards && boards.length > 0) {
          const boardIds = boards.map((board) => board.id)
          query = query.in("board_id", boardIds)
        }
      }

      // 정렬 방식에 따른 쿼리 최적화
      if (activeTab === "latest") {
        query = query.order("created_at", { ascending: false })
      } else if (activeTab === "top") {
        query = query.order("created_at", { ascending: false }) // 일단 시간순으로 가져온 후 클라이언트에서 정렬
      } else if (activeTab === "hot") {
        query = query.order("created_at", { ascending: false }) // 일단 시간순으로 가져온 후 클라이언트에서 정렬
      }

      const { data, error } = await query.limit(20)

      if (error) {
        console.error("Error fetching posts:", error)
        return
      }

      // 집계 함수 결과 처리 및 클라이언트 사이드 정렬
      const postsWithCounts = (data || []).map((post) => ({
        ...post,
        commentsCount: post.comments?.length || 0,
        likesCount: post.likes?.length || 0,
      }))

      // 정렬 방식에 따라 재정렬
      const sortedPosts = [...postsWithCounts]
      if (activeTab === "top") {
        sortedPosts.sort((a, b) => b.likesCount - a.likesCount)
      } else if (activeTab === "hot") {
        sortedPosts.sort((a, b) => b.commentsCount - a.commentsCount)
      }

      setPosts(sortedPosts)

      // 첫 번째 게시글을 자동으로 선택
      if (sortedPosts.length > 0) {
        setSelectedPost(sortedPosts[0])
      } else {
        setSelectedPost(null)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          users:user_id (id, full_name, company, position),
          boards:board_id (id, name, slug),
          comments!inner(count),
          likes!inner(count)
        `)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Search error:", error)
        return
      }

      const postsWithCounts = (data || []).map((post) => ({
        ...post,
        commentsCount: post.comments?.length || 0,
        likesCount: post.likes?.length || 0,
      }))

      setPosts(postsWithCounts)

      if (postsWithCounts.length > 0) {
        setSelectedPost(postsWithCounts[0])
      } else {
        setSelectedPost(null)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostSelect = (post) => {
    setSelectedPost(post)
    setShowCreatePost(false)
    // 모바일에서는 상세 페이지로 이동
    if (window.innerWidth < 768) {
      router.push(`/post/${post.id}`)
    }
  }

  const handleCreatePost = () => {
    setShowCreatePost(true)
    setSelectedPost(null)
  }

  const handlePostCreated = () => {
    fetchPosts(categoryFilter)
    setShowCreatePost(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        return `${diffMinutes}분 전`
      }
      return `${diffHours}시간 전`
    } else if (diffDays < 7) {
      return `${diffDays}일 전`
    } else {
      return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    }
  }

  const getCategoryTitle = () => {
    switch (categoryFilter) {
      case "announcements":
        return "공지사항"
      case "forum":
        return "ASUS Forum"
      default:
        return "전체 게시글"
    }
  }

  const renderCategorySelector = () => {
    if (!simplifiedCategories) return null

    return (
      <div className="mb-4 inline-block">
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="announcements">공지사항</TabsTrigger>
            <TabsTrigger value="forum">Forum</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      {/* 게시글 리스트 - 3/10 비율 */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{getCategoryTitle()}</h2>
            <Button className="bg-[#0a66c2] hover:bg-[#004182]" size="sm" onClick={handleCreatePost}>
              <PlusCircle className="mr-1 h-3 w-3" />새 글
            </Button>
          </div>

          {renderCategorySelector()}

          <div className="space-y-3">
            {showSortTabs && (
              <Tabs defaultValue="latest" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="latest" className="text-xs">
                    최신
                  </TabsTrigger>
                  <TabsTrigger value="top" className="text-xs">
                    인기
                  </TabsTrigger>
                  <TabsTrigger value="hot" className="text-xs">
                    토론
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {showFilters && (
              <div className="space-y-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="announcements">공지사항</SelectItem>
                    <SelectItem value="forum">ASUS Forum</SelectItem>
                  </SelectContent>
                </Select>

                <form onSubmit={handleSearch} className="flex gap-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="검색..."
                      className="pl-7 text-xs h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="outline" size="sm" className="px-2">
                    <Search className="h-3 w-3" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* 게시글 목록 */}
        <Card className="h-[calc(100vh-300px)] overflow-hidden">
          <CardContent className="p-0 h-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : posts.length > 0 ? (
              <div className="divide-y h-full overflow-y-auto">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className={`p-3 hover:bg-accent/50 cursor-pointer transition-colors ${
                      selectedPost?.id === post.id ? "bg-accent border-l-4 border-[#0a66c2]" : ""
                    }`}
                    onClick={() => handlePostSelect(post)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#0a66c2] text-xs">{post.boards?.name || "게시판"}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                      </div>

                      <h3 className="text-sm font-semibold line-clamp-2 hover:text-[#0a66c2]">{post.title}</h3>

                      <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">{post.users?.full_name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium truncate">{post.users?.full_name || "사용자"}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <ThumbsUp className="mr-1 h-3 w-3" />
                            {post.likesCount}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            {post.commentsCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <p className="text-muted-foreground text-sm">게시글이 없습니다.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 게시글 상세 내용 - 7/10 비율 */}
      <div className="lg:col-span-7">
        <div className="sticky top-20">
          {showCreatePost ? (
            <CreatePostPanel
              onCancel={() => setShowCreatePost(false)}
              onPostCreated={handlePostCreated}
              boards={boards}
            />
          ) : selectedPost ? (
            <PostDetail post={selectedPost} refreshPosts={() => fetchPosts(categoryFilter)} />
          ) : (
            <Card className="h-[calc(100vh-200px)]">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">게시글을 선택하면 여기에 내용이 표시됩니다</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
