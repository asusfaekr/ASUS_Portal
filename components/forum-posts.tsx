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
  showFilters?: boolean // 필터와 검색 표시 여부
  simplifiedCategories?: boolean // 간소화된 카테고리 메뉴 사용 여부
  showSortTabs?: boolean // 정렬 탭(최신, 인기, 활발한 토론) 표시 여부
  initialSearchQuery?: string // 추가
}

export function ForumPosts({
  defaultCategory = "all",
  showFilters = true,
  simplifiedCategories = true,
  showSortTabs = true,
  initialSearchQuery = "", // 추가
}: ForumPostsProps) {
  const [selectedPost, setSelectedPost] = useState(null)
  const [activeTab, setActiveTab] = useState("all") // 기본값을 "all"로 변경
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [categoryFilter, setCategoryFilter] = useState(defaultCategory)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [boards, setBoards] = useState([])
  const { user } = useAuth()
  const router = useRouter()

  // 역할별 게시판 매핑
  const roleBoardsMapping = {
    all: [], // 모든 게시판
    fae: ["fae-technical-updates", "fae-resources"], // FAE 관련 게시판 슬러그
    sales: ["sales-opportunities", "sales-resources"], // Sales 관련 게시판 슬러그
    marketing: ["marketing-campaigns", "marketing-resources"], // Marketing 관련 게시판 슬러그
    announcements: ["announcements"], // 공지사항 게시판 슬러그
  }

  useEffect(() => {
    setCategoryFilter(defaultCategory)
    fetchPosts(defaultCategory)
    fetchBoards()
  }, [defaultCategory])

  useEffect(() => {
    fetchPosts(categoryFilter, activeTab)
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

  const fetchPosts = async (category, role = "all") => {
    setLoading(true)
    try {
      let query = supabase.from("posts").select(`
          *,
          users:user_id (*),
          boards:board_id (*),
          comments:comments(count),
          likes:likes(count)
        `)

      // 카테고리 필터링
      if (category === "announcements") {
        // 공지사항 게시판만 필터링
        const { data: boards } = await supabase.from("boards").select("id").eq("slug", "announcements")
        if (boards && boards.length > 0) {
          query = query.eq("board_id", boards[0].id)
        }
      } else if (category === "forum") {
        // 공지사항을 제외한 모든 게시판 (FAE, Sales, Marketing)
        const { data: boards } = await supabase.from("boards").select("id").neq("slug", "announcements")

        if (boards && boards.length > 0) {
          const boardIds = boards.map((board) => board.id)
          query = query.in("board_id", boardIds)
        }
      }

      // 역할 기반 필터링 (새로 추가)
      if (role !== "all" && roleBoardsMapping[role]) {
        // 해당 역할에 맞는 게시판 슬러그 목록 가져오기
        const roleBoardSlugs = roleBoardsMapping[role]

        // 게시판 슬러그로 게시판 ID 가져오기
        const { data: roleBoards } = await supabase.from("boards").select("id").in("slug", roleBoardSlugs)

        if (roleBoards && roleBoards.length > 0) {
          const boardIds = roleBoards.map((board) => board.id)
          query = query.in("board_id", boardIds)
        }
      }

      // 정렬 방식 (기존 코드 유지)
      query = query.order("created_at", { ascending: false })

      const { data, error } = await query.limit(20)

      if (error) {
        console.error("Error fetching posts:", error)
        return
      }

      // 댓글 및 좋아요 수 처리
      const postsWithCounts = data.map((post) => ({
        ...post,
        commentsCount: post.comments?.length || 0,
        likesCount: post.likes?.length || 0,
      }))

      setPosts(postsWithCounts)

      // 첫 번째 게시글을 자동으로 선택
      if (postsWithCounts.length > 0 && !selectedPost) {
        setSelectedPost(postsWithCounts[0])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    supabase
      .from("posts")
      .select(`
        *,
        users:user_id (*),
        boards:board_id (*),
        comments:comments(count),
        likes:likes(count)
      `)
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Search error:", error)
          return
        }

        // 댓글 및 좋아요 수 처리
        const postsWithCounts = data.map((post) => ({
          ...post,
          commentsCount: post.comments?.length || 0,
          likesCount: post.likes?.length || 0,
        }))

        setPosts(postsWithCounts)

        // 검색 결과의 첫 번째 게시글을 선택
        if (postsWithCounts.length > 0) {
          setSelectedPost(postsWithCounts[0])
        } else {
          setSelectedPost(null)
        }

        setLoading(false)
      })
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
    fetchPosts(categoryFilter, activeTab)
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

  // 역할 탭 제목 가져오기
  const getRoleTabTitle = () => {
    switch (activeTab) {
      case "fae":
        return "FAE 게시판"
      case "sales":
        return "Sales 게시판"
      case "marketing":
        return "Marketing 게시판"
      case "announcements":
        return "공지사항"
      default:
        return "전체 게시판"
    }
  }

  // 간소화된 카테고리 선택 컴포넌트
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{getRoleTabTitle()}</h2>
          {/* 새 글 작성 버튼 */}
          <Button className="bg-[#0a66c2] hover:bg-[#004182]" onClick={handleCreatePost}>
            <PlusCircle className="mr-2 h-4 w-4" />새 글 작성
          </Button>
        </div>

        {/* 간소화된 카테고리 선택기 */}
        {renderCategorySelector()}

        {/* 역할 기반 탭 (기존 정렬 탭 대체) */}
        {showSortTabs && (
          <div className="inline-block">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="fae">FAE</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
                <TabsTrigger value="announcements">공지사항</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {showFilters && (
          <div className="flex gap-2 w-full">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="announcements">공지사항</SelectItem>
                <SelectItem value="forum">ASUS Forum</SelectItem>
              </SelectContent>
            </Select>

            <form onSubmit={handleSearch} className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="검색..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline">
                검색
              </Button>
            </form>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length > 0 ? (
              <div className="divide-y">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className={`p-4 hover:bg-accent/50 cursor-pointer ${selectedPost?.id === post.id ? "bg-accent" : ""}`}
                    onClick={() => handlePostSelect(post)}
                  >
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{post.users?.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#0a66c2]">{post.boards?.name || "게시판"}</Badge>
                            <span className="text-sm font-medium">{post.users?.full_name || "사용자"}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold hover:text-[#0a66c2]">{post.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <ThumbsUp className="mr-1 h-4 w-4" />
                            {post.likesCount || 0}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MessageSquare className="mr-1 h-4 w-4" />
                            {post.commentsCount || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>게시글이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:block sticky top-20 h-fit">
        {showCreatePost ? (
          <CreatePostPanel
            onCancel={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
            boards={boards}
          />
        ) : selectedPost ? (
          <PostDetail post={selectedPost} refreshPosts={() => fetchPosts(categoryFilter, activeTab)} />
        ) : (
          <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
            <p className="text-muted-foreground">게시글을 선택하면 여기에 내용이 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
