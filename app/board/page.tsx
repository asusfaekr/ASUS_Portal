"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ProfileCard } from "@/components/profile-card"
import { ForumPosts } from "@/components/forum-posts"
import { RewardSystem } from "@/components/reward-system"

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
    <div className="container py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-3 space-y-6">
        <ProfileCard />
        <RewardSystem />
      </div>
      <div className="md:col-span-9">
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
