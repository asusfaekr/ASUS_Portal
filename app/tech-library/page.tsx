"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Download, Calendar, User, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

// 임시 문서 데이터
const documents = [
  {
    id: 1,
    title: "제품 사양서 - A100 시리즈",
    description: "A100 시리즈 제품의 상세 사양 및 기술 정보",
    category: "제품 사양",
    tags: ["A100", "사양서", "기술 문서"],
    author: "기술팀",
    date: "2023-05-15",
    downloadUrl: "#",
  },
  {
    id: 2,
    title: "기술 가이드 - 설치 및 구성",
    description: "제품 설치 및 초기 구성을 위한 기술 가이드",
    category: "기술 가이드",
    tags: ["설치", "구성", "가이드"],
    author: "기술지원팀",
    date: "2023-06-20",
    downloadUrl: "#",
  },
  {
    id: 3,
    title: "문제 해결 가이드 - 일반적인 오류",
    description: "자주 발생하는 문제 및 해결 방법에 대한 가이드",
    category: "문제 해결",
    tags: ["문제 해결", "오류", "FAQ"],
    author: "기술지원팀",
    date: "2023-07-10",
    downloadUrl: "#",
  },
  {
    id: 4,
    title: "보안 백서 - 제품 보안 기능",
    description: "제품의 보안 기능 및 구현에 대한 상세 정보",
    category: "보안",
    tags: ["보안", "백서", "기능"],
    author: "보안팀",
    date: "2023-08-05",
    downloadUrl: "#",
  },
  {
    id: 5,
    title: "API 문서 - 개발자 가이드",
    description: "개발자를 위한 API 참조 문서 및 사용 예제",
    category: "개발",
    tags: ["API", "개발", "참조"],
    author: "개발팀",
    date: "2023-09-12",
    downloadUrl: "#",
  },
  {
    id: 6,
    title: "성능 최적화 가이드",
    description: "제품 성능 최적화를 위한 설정 및 권장 사항",
    category: "성능",
    tags: ["성능", "최적화", "설정"],
    author: "기술팀",
    date: "2023-10-18",
    downloadUrl: "#",
  },
]

// 카테고리 목록
const categories = ["전체", "제품 사양", "기술 가이드", "문제 해결", "보안", "개발", "성능"]

export default function TechLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("전체")
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login?redirectedFrom=/tech-library")
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // 검색 및 필터링된 문서 목록
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = activeCategory === "전체" || doc.category === activeCategory

    return matchesSearch && matchesCategory
  })

  const handleDownload = (e, doc) => {
    e.preventDefault()
    // 실제로는 문서 다운로드 로직 구현
    alert(`${doc.title} 다운로드를 시작합니다.`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // 인증되지 않은 경우 미들웨어에서 리다이렉트 처리
  }

  return (
    <div className="container py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">기술 문서 라이브러리</CardTitle>
          <CardDescription>제품 관련 기술 문서, 가이드 및 참조 자료</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="문서 검색..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => router.push("/tech-library/upload")}>문서 업로드</Button>
          </div>

          <Tabs defaultValue="전체" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-6 flex flex-wrap h-auto">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory} className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge>{doc.category}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleDownload(e, doc)}
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">다운로드</span>
                          </Button>
                        </div>
                        <CardTitle className="text-lg mt-2">{doc.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{doc.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {doc.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {doc.date}
                          </div>
                          <div className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {doc.author}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                    <p>검색 결과가 없습니다.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
