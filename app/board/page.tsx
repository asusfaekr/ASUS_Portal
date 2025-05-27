"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ForumPosts } from "@/components/forum-posts"

export default function BoardPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // URL에서 검색 쿼리 파라미터 가져오기
    const query = searchParams.get("search")
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  return (
    <div className="container py-6">
      <div className="max-w-6xl mx-auto">
        <ForumPosts
          defaultCategory="all"
          showFilters={true}
          simplifiedCategories={false}
          showSortTabs={true}
          initialSearchQuery={searchQuery}
        />
      </div>
    </div>
  )
}
